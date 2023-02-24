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
import { findNode, setWorkflow, setWorkflows } from "../ticket-management";
import Vue from "vue";
import Vuex from "vuex";

import {
  getWorkflowTreeAsync,
  getTicketDetailsAsync,
  getWorkflowListAsync,
  getBuildingSpaceTreeAsync,
} from "../api-requests";
import config from "../../../../config.json";
const closedSteps = config.steps.closed;

Vue.use(Vuex);

export default new Vuex.Store({
  state: () => ({
    building: {},
  }),

  mutations: {
    SET_BUILDING(state: any, payload: any) {
      state.building = payload;
    },
    SET_WORKFLOWS(state: any, payload: any) {
      setWorkflows(state.building, payload);
    },
    SET_WORKFLOW(state: any, payload: any) {
      setWorkflow(state.building, payload.workflowId, payload.tickets);
    },
  },

  actions: {
    async initWorkflows({ commit }: any) {
      const building = await getBuildingSpaceTreeAsync();
      commit("SET_BUILDING", building);
      const workflows = await getWorkflowListAsync();
      for (const workflow of workflows) workflow.loaded = false;
      commit("SET_WORKFLOWS", workflows);
      if (workflows.length > 0)
        this.dispatch("loadWorkflow", workflows[0].dynamicId);
    },
    async loadWorkflow({ state, commit }: any, workflowId) {
      const found = state.building.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) return;
      const promises = <any[]>[];
      try {
        const domain = await getWorkflowTreeAsync(workflowId);
        for (let d of domain.children) {
          for (let s of d.children) {
            // on ne traite que les tickets en cours
            if (closedSteps.includes(s.name)) continue;
            for (let t of s.children) {
              promises.push(
                getTicketDetailsAsync(t.dynamicId).catch((error: any) => {})
              );
            }
          }
        }
        Promise.all(promises).then((ret) => {
          commit("SET_WORKFLOW", { workflowId, tickets: ret });
        });
      } catch {}
    },
  },

  getters: {
    getDomains: (state) => (spaceId: number, workflowId: number) => {
      const space = findNode(state.building, spaceId);
      const found = space.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) {
        return found.domains;
      }
    },
    getDomain:
      (state, getters) =>
      (spaceId: number, workflowId: number, domain: string) => {
        const domains = getters.getDomains(spaceId, workflowId);
        if (domains)
          return domains.find((d: any) => d.name && d.name === domain);
      },
    getTickets: (state) => (spaceId: number, workflowId: number) => {
      const space = findNode(state.building, spaceId);
      const found = space.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) {
        return found.tickets;
      }
    },
    getSteps: (state) => (spaceId: number, workflowId: number) => {
      const space = findNode(state.building, spaceId);
      const found = space.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) {
        return found.steps;
      }
    },
    getDeclarants: (state) => (spaceId: number, workflowId: number) => {
      const space = findNode(state.building, spaceId);
      const found = space.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found && found.loaded) {
        return found.declarants;
      }
    },
    isLoaded: (state) => (spaceId: number, workflowId: number) => {
      if (Object.keys(state.building).length === 0 || !spaceId) return false;
      const space = findNode(state.building, spaceId);

      if (!space || !space.workflows) return false;
      const found = space.workflows.find(
        (w: any) => w.dynamicId === workflowId
      );
      if (found) return found.loaded;
      return false;
    },
  },
});
