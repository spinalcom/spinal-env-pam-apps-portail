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

import { ActionTree } from "vuex";
import {
  getBuildingSpaceTreeAsync,
  getFloorListAsync,
  getPositionAsync,
  getProcessListAsync,
  getRoomListAsync,
  getStepListAsync,
  getTicketDetailsAsync,
  getTicketDetailsMultipleAsync,
  getTicketListAsync,
  getWorkflowListAsync,
} from "../../spinalAPI/ticket";
import { MutationTypes } from "./mutations";
import type { StateAppData } from "./state";
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

export enum ActionTypes {
  LOAD_TICKETS = "LOAD_TICKETS",
  SET_BUILDING_TICKETS = "SET_BUILDING_TICKETS",
  GET_FLOOR_LIST = "GET_FLOOR_LIST",
  SET_FLOOR_TICKET = "SET_FLOOR_TICKET",
}

export interface Actions {
  [ActionTypes.LOAD_TICKETS]({ commit, state }): Promise<void>;
  [ActionTypes.SET_BUILDING_TICKETS]({ commit, state }): Promise<void>;
  [ActionTypes.GET_FLOOR_LIST]({ commit, state }): Promise<any[]>;
  [ActionTypes.SET_FLOOR_TICKET](
    { commit, state },
    floorId: number
  ): Promise<void>;
}

export const actions: ActionTree<StateAppData, StateAppData> & Actions = {
  async [ActionTypes.LOAD_TICKETS]({ commit, state }): Promise<void> {
    //commit(MutationTypes.SET_BUILDING, await getBuildingSpaceTreeAsync());
    const promises = <Promise<void>[]>[];
    const loadedTickets = <number[]>[];
    try {
      const workflows = await getWorkflowListAsync();
      for (const workflow of workflows.filter((w: any) =>
        workflow_list.includes(w.name)
      )) {
        const domains = await getProcessListAsync(workflow.dynamicId);
        for (const domain of domains) {
          const steps = await getStepListAsync(
            workflow.dynamicId,
            domain.dynamicId
          );
          for (const step of steps.filter(
            (s: any) => !closedSteps.includes(s.name)
          )) {
            // on ne traite que les tickets en cours
            loadedTickets.push(
              ...(await getTicketListAsync(step.dynamicId)).map(
                (t) => t.dynamicId
              )
            );
            const tickets = await getTicketListAsync(step.dynamicId);
            /*tickets.map(async t => {
              const await getTicketDetailsAsync(t.dynamicId)
            })*/
            for (const t of tickets) {
              promises.push(
                getTicketDetailsAsync(t.dynamicId).catch((error) =>
                  console.log(error)
                )
              );
            }
          }
        }
      }
      /*Promise.all(
        (await getTicketDetailsMultipleAsync(loadedTickets)).map(async (t) => {
          if (t.elementSelected.type === "BIMObject")
            t.elementSelected = await getPositionAsync(
              t.elementSelected.dynamicId
            );
        })
      ).then((tickets) =>
        commit(
          MutationTypes.SET_TICKETS,
          tickets.filter((t) => t)
        )
      );*/
      Promise.all(promises).then((ret) => {
        commit(
          MutationTypes.SET_TICKETS,
          ret.filter((t) => t)
        );
      });
    } catch (error) {
      console.log(error);
    }
  },
  async [ActionTypes.SET_BUILDING_TICKETS]({ commit, state }): Promise<void> {
    commit(MutationTypes.SET_BUILDING, await getBuildingSpaceTreeAsync());
    await setNodeTickets(state.building, state.building.tickets);
  },

  async [ActionTypes.GET_FLOOR_LIST]({ commit, state }): Promise<any[]> {
    if (!state.building.children) {
      const floors = await getFloorListAsync();
      floors.forEach((f: any) => {
        f.loaded = false;
        f.tickets = <any[]>[];
      });
      commit(MutationTypes.SET_TICKET_FLOORS, floors);
    }
    return state.building.children;
  },

  async [ActionTypes.SET_FLOOR_TICKET](
    { commit, state },
    floorId
  ): Promise<void> {
    if (!floorId || floorId === state.building.dynamicId) return;
    const found = state.building.children.find(
      (f: any) => f.dynamicId === floorId
    );

    if (!found || found.loaded) return;
    const rooms = (await getRoomListAsync(floorId)).map(
      (r: any) => r.dynamicId
    );
    const tickets = <any[]>[];
    for (const t of state.tickets) {
      if (!t.elementSelected) continue;
      if (t.elementSelected.type === "BIMObject") {
        const p = await getPositionAsync(t.elementSelected.dynamicId);
        if (p.info.floor.dynamicId === floorId) tickets.push(t);
      } else if (
        t.elementSelected.dynamicId &&
        (t.elementSelected.dynamicId === floorId ||
          rooms.includes(t.elementSelected.dynamicId))
      )
        tickets.push(t);
      state.tickets.splice(state.tickets.indexOf(t), 1);
    }
    //commit(MutationTypes.SET_FLOOR_TICKET, { floorId, tickets });
  },
};
