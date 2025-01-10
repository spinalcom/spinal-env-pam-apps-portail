import Vue from "vue";
import Vuex from "vuex";
import {
  getProcessListAsync,
  getStepListAsync,
  getTicketDetailsAsync,
  getTicketListAsync,
  getWorkflowListAsync,
} from "../api-requests";

import { gradiant, HSVtoRGB, RGBtoHexa } from "spinal-components/src/colors";

import config from "../../config.js";
const closedSteps = config.steps.closed;
const workflow_list = config.workflowList;

Vue.use(Vuex);

export function displayDate(dateTime: number) {
  const date = new Date(dateTime);

  let day = "" + date.getDate(),
    month = "" + (date.getMonth() + 1),
    year = "" + date.getFullYear();

  if (day.length == 1) day = "0" + day;
  if (month.length == 1) month = "0" + month;

  return `${day}/${month}/${year}`;
}

function toManageableTicket(building: any, ticket: any) {
  return {
    id: ticket.dynamicId,
    Nom: ticket.name,
    Bâtiment: building.name,
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
    buildingColor: building.color,
    stepColor: ticket.step.color,
    attachement: ticket.file_list.length > 0,
  };
}

export default new Vuex.Store({
  state: {
    patrimoine: {
      name: "",
      id: "",
      loaded: <number[]>[],
      buildings: <
        {
          name: string;
          id: string;
          tickets: [];
          loaded: boolean;
          color: string;
        }[]
      >[],
    },
  },
  getters: {
    selector: (state) => {
      return {
        name: state.patrimoine.name,
        dynamicId: state.patrimoine.id,
        buildings: state.patrimoine.buildings.map((b) => ({
          name: b.name,
          dynamicId: b.id,
          color: b.color,
        })),
      };
    },
    getTickets: (state) => (id: string) => {
      if (!id || id === state.patrimoine.id) {
        const tickets = <any[]>[];
        const buildings = state.patrimoine.buildings;
        const indexes = state.patrimoine.loaded;

        for (const i of indexes)
          for (const t of buildings[i].tickets) tickets.push(t);

        return tickets;
      }
      const found = state.patrimoine.buildings.find((f: any) => f.id === id);
      if (found) return found.tickets;
      return [];
    },
    ticketList: (state) => {
      const ret = <any[]>[];
      const tickets = state.patrimoine.buildings
        .map((b) => b.tickets)
        .filter((t) => t);
      for (const ticket of tickets) ret.push(...ticket);
      return ret;
    },
    tableTickets: (state) => (id: string) => {
      if (!id || id === state.patrimoine.id) {
        const tickets = [];
        const buildings = state.patrimoine.buildings;
        const indexes = state.patrimoine.loaded;

        for (const i of indexes)
          for (const t of buildings[i].tickets)
            tickets.push(toManageableTicket(buildings[i], t));

        return tickets;
      }
      const found = state.patrimoine.buildings.find((f: any) => f.id === id);
      if (found)
        return found.tickets.map((t: any) => toManageableTicket(found, t));
      return [];
    },
    isLoaded: (state) => {
      return (
        state.patrimoine.buildings.length &&
        state.patrimoine.buildings.length === state.patrimoine.loaded.length
      );
    },
  },
  mutations: {
    SET_PATRIMOINE(state, payload) {
      state.patrimoine = payload;
    },
    SET_BUILDING_TICKETS(state, payload) {
      const buildings = state.patrimoine.buildings;
      const i = buildings.findIndex((b) => b.id === payload.building.id);
      if (i >= 0) {
        payload.tickets.forEach((t: any) => {
          t["buildingId"] = buildings[i].id;
          t["buildingName"] = buildings[i].name;
        });
        buildings[i].tickets = payload.tickets;
        buildings[i].loaded = true;
        state.patrimoine.loaded.push(i);
      }
    },
  },
  actions: {
    async loadTickets({ state, commit }) {
      const pat = JSON.parse(localStorage.getItem("patrimoine") || "");
      pat.loaded = [];
      const colors = gradiant(pat.buildings.length);

      pat.buildings = pat.buildings.map((building: any, i: number) => {
        const { r, g, b } = HSVtoRGB(colors[i] / 100, 1, 1);
        return {
          name: building.name,
          id: building.id,
          tickets: [],
          loaded: false,
          color: RGBtoHexa(r, g, b),
        };
      });
      commit("SET_PATRIMOINE", pat);
      for (const building of state.patrimoine.buildings) {
        const promises = [];
        try {
          const workflows = await getWorkflowListAsync(building.id);
          for (const workflow of workflows.filter((w: any) =>
            workflow_list.includes(w.name)
          )) {
            const domains = await getProcessListAsync(
              building.id,
              workflow.dynamicId
            );
            for (const domain of domains) {
              const steps = await getStepListAsync(
                building.id,
                workflow.dynamicId,
                domain.dynamicId
              );
              for (const step of steps.filter(
                (s: any) => !closedSteps.includes(s.name)
              )) {
                const tickets = await getTicketListAsync(
                  building.id,
                  step.dynamicId
                );
                for (const t of tickets) {
                  promises.push(
                    getTicketDetailsAsync(building.id, t.dynamicId).catch(
                      (error) => console.log(error)
                    )
                  );
                }
              }
            }
          }
          Promise.all(promises)
            .then((ret) => {
              commit("SET_BUILDING_TICKETS", {
                building,
                tickets: ret.filter(
                  (t) => t && !closedSteps.includes(t.step.name)
                ),
              });
            })
            .then()
            .catch(() => {
              commit("SET_BUILDING_TICKETS", {
                building,
                tickets: [],
              });
            });
        } catch (error) {
          console.log(error);
          commit("SET_BUILDING_TICKETS", { building, tickets: [] });
        }
      }
    },
  },
  modules: {},
});
