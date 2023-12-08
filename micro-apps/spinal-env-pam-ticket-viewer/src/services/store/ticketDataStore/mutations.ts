import type { MutationTree } from "vuex";
import type { StateAppData } from "./state";
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

export enum MutationTypes {
  SET_BUILDING = "SET_BUILDING",
  SET_TICKET_FLOORS = "SET_TICKET_FLOORS",
  SET_TICKETS = "SET_TICKETS",
  SET_FLOOR_TICKET = "SET_FLOOR_TICKET",
}

export type MutationsAppData<S = StateAppData> = {
  [MutationTypes.SET_BUILDING](state: S, payload: any[]): void;
  [MutationTypes.SET_TICKET_FLOORS](state: S, payload: any[]): void;
  [MutationTypes.SET_TICKETS](state: S, payload: any[]): void;
  [MutationTypes.SET_FLOOR_TICKET](state: S, payload: any): void;
};

export const mutations: MutationTree<StateAppData> & MutationsAppData = {
  [MutationTypes.SET_BUILDING](state: StateAppData, payload: any): void {
    state.building = payload;
    state.building.tickets = state.tickets; //.map((t: any) => toManageableTicket(t));
  },
  [MutationTypes.SET_TICKET_FLOORS](state: StateAppData, payload: any[]): void {
    state.building.children = payload;
  },
  [MutationTypes.SET_TICKETS](state: StateAppData, payload: any[]): void {
    state.tickets = payload;
  },
  [MutationTypes.SET_FLOOR_TICKET](state: StateAppData, payload: any): void {
    const found = state.building.children.find(
      (f: any) => f.dynamicId === payload.floorId
    );
    if (found) {
      found.tickets = payload.tickets.map((t: any) => toManageableTicket(t));
      found.loaded = true;
    }
  },
};
