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

import type { MutationTree } from "vuex";
import type { TicketStateAppData } from "./state";
import moment from "moment";

export const displayDate = (dateTime: number) =>
  moment(dateTime).format("DD[/]MM[/]YYYY");

export function toManageableTicket(ticket: any) {
  return {
    id: ticket.dynamicId,
    Nom: ticket.name,
    Étape: ticket.step.name,
    Domaine: ticket.process.name,
    "Date de création": displayDate(
      ticket.creationDate || ticket.log_list[0]?.date || 0
    ),
    "Dernière modification": displayDate(
      ticket.directModificationDate ||
        ticket.log_list[ticket.log_list?.length - 1]?.date ||
        0
    ),
    Déclarant: ticket.userName || "ADMIN",
    color: ticket.step.color,
    attachement: ticket.file_list.length > 0,
  };
}

export enum TicketMutationTypes {
  SET_BUILDING = "SET_BUILDING",
  SET_TICKET_FLOORS = "SET_TICKET_FLOORS",
  SET_TICKETS = "SET_TICKETS",
  SET_FLOOR_TICKET = "SET_FLOOR_TICKET",
}

export type TicketMutationsAppData<S = TicketStateAppData> = {
  [TicketMutationTypes.SET_BUILDING](state: S, payload: any[]): void;
  [TicketMutationTypes.SET_TICKET_FLOORS](state: S, payload: any[]): void;
  [TicketMutationTypes.SET_TICKETS](state: S, payload: any[]): void;
  [TicketMutationTypes.SET_FLOOR_TICKET](state: S, payload: any): void;
};

export const ticketMutations: MutationTree<TicketStateAppData> &
  TicketMutationsAppData = {
  [TicketMutationTypes.SET_BUILDING](
    state: TicketStateAppData,
    payload: any
  ): void {
    state.building = payload;
    state.building.tickets = state.tickets;
  },
  [TicketMutationTypes.SET_TICKET_FLOORS](
    state: TicketStateAppData,
    payload: any[]
  ): void {
    state.building.children = payload;
  },
  [TicketMutationTypes.SET_TICKETS](
    state: TicketStateAppData,
    payload: any[]
  ): void {
    state.tickets = payload;
  },
  [TicketMutationTypes.SET_FLOOR_TICKET](
    state: TicketStateAppData,
    payload: any
  ): void {
    const found = state.building.children.find(
      (f: any) => f.dynamicId === payload.floorId
    );
    if (found) {
      found.tickets = payload.tickets.map((t: any) => toManageableTicket(t));
      found.loaded = true;
    }
  },
};
