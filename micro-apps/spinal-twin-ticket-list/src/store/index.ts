import Vue from "vue";
import Vuex from "vuex";
import {
  getTicketDetailsAsync,
  getTicketListAsync,
  getTicketWorkflowAsync,
  getWorkflowTreeAsync,
} from "../api-requests";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    tickets: <any[]>[],
  },
  getters: {},
  mutations: {
    SET_TICKET(state, payload) {
      state.tickets = payload;
    },
  },
  actions: {
    async getTickets({ commit }) {
      const tickets = <any>[];
      const promises = [];
      try {
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
              const ticket = t;
              const user = ticket.userName ? ticket.userName : "admin"; // certains ont un declarant vide
              tickets.push({
                name: ticket.name,
                step: ticket.step.name,
                domain: ticket.process.name,
                creation_date: new Date(ticket.log_list[0].date).toDateString(),
                last_step_date: new Date(
                  ticket.log_list[ticket.log_list.length - 1].date
                ).toDateString(),
                declarant: user,
              });
            })
          )
          .then(() => {
            commit("SET_TICKET", tickets);
          });
      } catch (error) {
        console.log(error);
      }
    },

    async updateTickets({ commit }, nodeId: number) {
      const tickets = <any[]>[];
      let tickets_tmp = await getTicketListAsync(nodeId);
      tickets_tmp = tickets_tmp.filter(
        (t: any) =>
          ![
            "Archived",
            "Clôturée",
            "Refusée",
            "Archivé",
            "Réalisé",
            "Terminé",
          ].includes(t.step.name)
      );
      const promises = <any[]>[];
      tickets_tmp.forEach((t: any) =>
        promises.push(
          getTicketDetailsAsync(t.dynamicId).catch((error) =>
            console.log(error)
          )
        )
      );
      Promise.all(promises)
        .then((ret) =>
          ret.forEach((t) => {
            if (!t) return;
            const ticket = t;
            const user = ticket.userName ? ticket.userName : "admin"; // certains ont un declarant vide
            tickets.push({
              name: ticket.name,
              step: ticket.step.name,
              domain: ticket.process.name,
              creation_date: new Date(ticket.log_list[0].date).toDateString(),
              last_step_date: new Date(
                ticket.log_list[ticket.log_list.length - 1].date
              ).toDateString(),
              declarant: user,
            });
          })
        )
        .then(() => {
          commit("SET_TICKET", tickets);
        });
    },
  },
  modules: {},
});
