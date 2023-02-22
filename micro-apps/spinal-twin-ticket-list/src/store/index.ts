import Vue from "vue";
import Vuex from "vuex";
import {
  getBuildingSpaceTreeAsync,
  getTicketDetailsAsync,
  getTicketWorkflowAsync,
  getWorkflowTreeAsync,
} from "../api-requests";

Vue.use(Vuex);

function addTicket(node: any, ticket: any) {
  if (!node.tickets) node.tickets = [];

  if (!ticket.elementSelected)
    node.tickets.push({
      Nom: ticket.name,
      Étape: ticket.step.name,
      Domaine: ticket.process.name,
      "Date de création": new Date(
        ticket.log_list[0].date
      ).toLocaleDateString(),
      "Dernière modification": new Date(
        ticket.log_list[ticket.log_list.length - 1].date
      ).toLocaleDateString(),
      Déclarant: ticket.userName || "ADMIN",
    });
  else if (node.dynamicId === ticket.elementSelected.dynamicId)
    node.tickets.push({
      Nom: ticket.name,
      Étape: ticket.step.name,
      Domaine: ticket.process.name,
      "Date de création": new Date(
        ticket.log_list[0].date
      ).toLocaleDateString(),
      "Dernière modification": new Date(
        ticket.log_list[ticket.log_list.length - 1].date
      ).toLocaleDateString(),
      Déclarant: ticket.userName || "ADMIN",
    });
  else if (node.children)
    for (const child of node.children) addTicket(child, ticket);
}

function getTickets(node: any): any[] {
  if (!node.children || node.children.length === 0) return node.tickets;
  let tickets = <any[]>[];
  for (const child of node.children)
    tickets = tickets.concat(getTickets(child));
  return tickets.concat(node.tickets);
}

function findNode(tree: any, nodeId: number): any {
  if (tree.dynamicId === nodeId) return tree;
  let element: any = undefined;
  if (tree.children)
    tree.children.forEach(
      (child: any) => (element = element || findNode(child, nodeId))
    );
  return element;
}

export default new Vuex.Store({
  state: {
    building: {},
  },
  getters: {
    getTickets: (state) => (dynamicId: number) => {
      dynamicId ??= state.building.dynamicId;
      return getTickets(findNode(state.building, dynamicId));
    },
  },
  mutations: {
    SET_BUILDING(state, payload) {
      payload.tickets = [];
      state.building = payload;
    },
  },
  actions: {
    async loadTickets({ commit }) {
      commit("SET_BUILDING", await getBuildingSpaceTreeAsync());
      const tickets = <any>[];
      const promises = [];
      try {
        const space = await getBuildingSpaceTreeAsync();
        const workflow = await getTicketWorkflowAsync();
        const domain = await getWorkflowTreeAsync(workflow.dynamicId);
        for (const d of domain.children) {
          for (const s of d.children) {
            // on ne traite que les tickets en cours
            if (
              [
                "Archived",
                "Clôturée",
                "Refusée",
                "Refusé",
                "Archivé",
                "Réalisé",
                "Terminé",
              ].includes(s.name)
            )
              continue;
            for (const t of s.children) {
              promises.push(
                getTicketDetailsAsync(t.dynamicId).catch((error) =>
                  console.log(error)
                )
              );
            }
          }
        }
        Promise.all(promises)
          .then((ret) =>
            ret.forEach((t) => {
              if (!t) return;
              addTicket(this.state.building, t);
            })
          )
          .then();
      } catch (error) {
        console.log(error);
      }
    },
  },
  modules: {},
});
