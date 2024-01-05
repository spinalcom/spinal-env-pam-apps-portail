/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import { TicketMutationTypes } from "./mutations";
import {
  getBuilding,
  getEquipments,
  getFloors,
  getRooms,
} from "../../spinalAPI/GeographicContext/geographicContext";
import { ActionTypes } from "../../../interfaces/vuexStoreTypes";
import {
  getProcessList,
  getStepList,
  getTicketDetails,
  getTicketDetailsMultiple,
  getTicketList,
  getTicketListMultiple,
  getWorkflowList,
} from "../../spinalAPI/TicketContext";
import { ticketConfig } from "../../../config";

const closedSteps = ticketConfig.steps.closed;
const workflow_list = ticketConfig.workflowList;

async function setNodeTickets(
  currentNode: any,
  tickets: any[],
  parentId?: string
) {
  const toPush = tickets
    .filter((t) => t.elementSelected?.dynamicId === currentNode.dynamicId)
    .map((t) =>
      t.elementSelected.type === "geographicRoom"
        ? { ...t, elementSelected: { ...t.elementSelected, floorId: parentId } }
        : t.elementSelected.type === "BIMObject"
        ? { ...t, elementSelected: { ...t.elementSelected, roomId: parentId } }
        : t
    );
  currentNode.tickets.push(...toPush);
  tickets = tickets.filter(
    (t) => t.elementSelected.dynamicId !== currentNode.dynamicId
  );
  if (currentNode.children)
    await Promise.all(
      currentNode.children.map(async (child) => {
        setNodeTickets(child, tickets, currentNode.staticId);
      })
    );
}

export const ticketActions = {
  async [ActionTypes.LOAD_TICKETS]({ commit, state }): Promise<void> {
    const stepList = <any[]>[];
    try {
      const workflows = await getWorkflowList();
      for (const workflow of workflows.filter((w) =>
        workflow_list.includes(w.name)
      )) {
        const domains = await getProcessList(workflow.dynamicId);
        for (const domain of domains) {
          const steps = await getStepList(workflow.dynamicId, domain.dynamicId);
          stepList.push(
            ...steps.filter((s: any) => !closedSteps.includes(s.name))
          );
        }
      }
      const ticketList = (
        await getTicketListMultiple(stepList.map((s) => s.dynamicId))
      ).flatMap((result) => result.tickets);

      const detailedTickets = await getTicketDetailsMultiple(
        ticketList.map((t) => t.dynamicId)
      );
      commit(
        TicketMutationTypes.SET_TICKETS,
        detailedTickets.filter((t) => !t.error)
      );
    } catch (error) {
      console.log(error);
    }
  },
  async [ActionTypes.SET_BUILDING_TICKETS]({ commit, state }): Promise<void> {
    const patrimoine = JSON.parse(localStorage.getItem("patrimoine") || "");
    const platformId = localStorage.getItem("idBuilding") || "";
    const building = await getBuilding(platformId);
    building.children = [
      ...(await getFloors(patrimoine.id, platformId)).map((f) => ({
        ...f,
        tickets: <any[]>[],
      })),
    ];
    for (const child of building.children) {
      child.children = [
        ...(
          await getRooms(
            patrimoine.id,
            platformId,
            child.staticId,
            child.dynamicId
          )
        ).map((r) => ({
          ...r,
          tickets: <any[]>[],
        })),
      ];
      await Promise.all(
        child.children.map(async (room) => {
          room.children = [
            ...(
              await getEquipments(
                patrimoine.id,
                platformId,
                child.staticId,
                room.staticId,
                room.dynamicId
              )
            ).map((e) => ({
              ...e,
              tickets: <any[]>[],
            })),
          ];
        })
      );
    }
    commit(TicketMutationTypes.SET_BUILDING, building);
    await setNodeTickets(state.building, state.building.tickets);
  },
};
