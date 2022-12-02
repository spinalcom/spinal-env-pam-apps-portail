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
import Vue from "vue";
import Vuex from "vuex";

import {
  getWorkflowTreeAsync,
  getTicketDetailsAsync,
  getTicketWorkflowAsync,
  getWorkflowListAsync,
} from "../api-requests";
import {
  runningTickets,
  splitByDeclarants,
  splitByDomains,
} from "../data-management";

Vue.use(Vuex);

export default new Vuex.Store({
  state: () => ({ workflows: [] }),

  mutations: {
    SET_WORKFLOWS(state: any, paylode: any) {
      state.workflows = paylode;
    },
    SET_WORKFLOW(state: any, payload: any) {
      const found = state.workflows.find(
        (w: any) => w.dynamicId === payload.dynamicId
      );
      if (found) {
        found.tickets = payload.tickets;
        found.domains = payload.domains;
        found.steps = payload.steps;
        found.declarants = payload.declarants;
        found.loaded = true;
      }
    },
  },

  actions: {
    async initWorkflows({ commit }: any) {
      const workflows = await getWorkflowListAsync();
      for (const workflow of workflows) workflow.loaded = false;
      commit("SET_WORKFLOWS", workflows);
      if (workflows.length > 0)
        this.dispatch("loadWorkflow", workflows[0].dynamicId);
    },
    async loadWorkflow({ state, commit }: any, workflowId) {
      const found = state.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) return;
      const tickets = <any[]>[];
      const steps = <any[]>[];
      const domains = [{ name: "Tous les domaines" }];
      const declarants = <any[]>[];
      const promises = <any[]>[];
      try {
        const domain = await getWorkflowTreeAsync(workflowId);
        for (let d of domain.children) {
          if (!domains.includes(d.name)) domains.push({ name: d.name }); // noms des domaines
          for (let s of d.children) {
            // on ne traite que les tickets en cours
            if (
              [
                "Archived",
                "Clôturée",
                "Refusée",
                "Archivé",
                "Réalisé",
                "Terminé",
              ].includes(s.name)
            )
              continue;
            if (!steps.includes(s.name)) steps.push(s.name); // noms des étapes
            for (let t of s.children) {
              promises.push(
                getTicketDetailsAsync(t.dynamicId).catch((error: any) => {})
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
              if (!declarants.includes(user)) declarants.push(user); // noms desdéclarants
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
            const payload = {
              dynamicId: workflowId,
              tickets: runningTickets(tickets),
              domains: splitByDomains(domains, steps, tickets),
              declarants: splitByDeclarants(declarants, tickets),
              steps: steps,
            };
            commit("SET_WORKFLOW", payload);
          });
      } catch {}
    },
  },

  getters: {
    getDomains: (state) => (workflowId: number) => {
      const found = state.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) {
        return found.domains;
      }
    },
    getTickets: (state) => (workflowId: number) => {
      const found = state.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) {
        return found.tickets;
      }
    },
    getSteps: (state) => (workflowId: number) => {
      const found = state.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) {
        return found.steps;
      }
    },
    getDeclarants: (state) => (workflowId: number) => {
      const found = state.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) {
        return found.declarants;
      }
    },
    isLoaded: (state) => (workflowId: number) => {
      const found = state.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found) return found.loaded;
      return false;
    },
  },
});
