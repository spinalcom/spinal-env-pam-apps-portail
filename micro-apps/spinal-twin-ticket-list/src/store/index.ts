import Vue from "vue";
import Vuex from "vuex";
import {
  getBuildingAsync,
  getFloorListAsync,
  getPositionAsync,
  getRoomListAsync,
  getTicketDetailsAsync,
  getTicketWorkflowAsync,
  getWorkflowListAsync,
  getWorkflowTreeAsync,
} from "../api-requests";

import config from "../../../../config.json";
const closedSteps = config.steps.closed;

Vue.use(Vuex);

function toManageableTicket(ticket: any) {
  return {
    Nom: ticket.name,
    Étape: ticket.step.name,
    Domaine: ticket.process.name,
    "Date de création": new Date(
      ticket.creationDate || ticket.log_list[0]?.date || 0
    ).toLocaleDateString(),
    "Dernière modification": new Date(
      ticket.directModificationDate ||
        ticket.log_list[ticket.log_list?.length - 1]?.date ||
        0
    ).toLocaleDateString(),
    Déclarant: ticket.userName || "ADMIN",
  };
}

export default new Vuex.Store({
  state: {
    building: {},
    tickets: [],
  },
  getters: {
    getTickets: (state) => (dynamicId: number) => {
      if (!dynamicId || dynamicId === state.building.dynamicId)
        return state.building.tickets;
      const found = state.building.children.find(
        (f: any) => f.dynamicId === dynamicId
      );
      if (found && found.loaded) return found.tickets;
      return [];
    },
  },
  mutations: {
    SET_BUILDING(state, payload) {
      payload.tickets = [];
      state.building = payload;
    },
    SET_FLOORS(state, payload) {
      state.building.children = payload;
    },
    SET_TICKETS(state, payload) {
      state.tickets = payload;
      state.building.tickets = payload.map((t: any) => toManageableTicket(t));
    },
    SET_FLOOR_TICKETS(state, payload) {
      const found = state.building.children.find(
        (f: any) => f.dynamicId === payload.floorId
      );
      if (found) {
        found.tickets = payload.tickets.map((t: any) => toManageableTicket(t));
        found.loaded = true;
      }
    },
  },
  actions: {
    async loadTickets({ commit }) {
      commit("SET_BUILDING", await getBuildingAsync());
      const promises = [];
      try {
        const workflows = await getWorkflowListAsync();
        for (const workflow of workflows) {
          const domain = await getWorkflowTreeAsync(workflow.dynamicId);
          for (const d of domain.children) {
            for (const s of d.children) {
              // on ne traite que les tickets en cours
              if (closedSteps.includes(s.name)) continue;

              for (const t of s.children) {
                promises.push(
                  getTicketDetailsAsync(t.dynamicId).catch((error) =>
                    console.log(error)
                  )
                );
              }
            }
          }
        }
        Promise.all(promises)
          .then((ret) => {
            commit(
              "SET_TICKETS",
              ret.filter((t) => !closedSteps.includes(t.step.name))
            );
          })
          .then();
      } catch (error) {
        console.log(error);
      }
    },
    async getFloorList({ state, commit }) {
      if (!state.building.children) {
        const floors = await getFloorListAsync();
        floors.forEach((f: any) => (f.loaded = false));
        commit("SET_FLOORS", floors);
      }
      return this.state.building.children;
    },
    async setFloorTickets({ state, commit }, floorId) {
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
      }
      state.tickets.filter((t: any) => {});
      commit("SET_FLOOR_TICKETS", { floorId, tickets });
    },
  },
  modules: {},
});
