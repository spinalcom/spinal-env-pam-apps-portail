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
import { StateAppData, state } from "./appDataStore/state";
import { mutations } from "./appDataStore/mutations";
import { actions } from "./appDataStore/actions";
import { TicketStateAppData, ticketState } from "./ticketDataStore/state";
import { ticketMutations } from "./ticketDataStore/mutations";
import { ticketActions } from "./ticketDataStore/actions";
Vue.use(Vuex);

function findNode(currentNode: any, searchId: number) {
  if (currentNode.dynamicId === searchId) return currentNode;
  if (!currentNode.children) return undefined;
  return currentNode.children.reduce(
    (e1: any, child: any) => e1 ?? findNode(child, searchId),
    undefined
  );
}

function getRecursiveTicket(currentNode: any): any[] {
  if (!currentNode.children) return currentNode.tickets;
  return currentNode.children.reduce(
    (e1: any[], child: any) => [...e1, ...getRecursiveTicket(child)],
    currentNode.tickets
  );
}

export const store = new Vuex.Store({
  modules: {
    appDataStore: {
      state,
      mutations,
      actions,
      getters: {},
    },
    ticketDataStore: {
      state: ticketState,
      mutations: ticketMutations,
      actions: ticketActions,
      getters: {
        getTickets: (state: typeof ticketState) => (dynamicId?: number) => {
          if (!dynamicId) return state.tickets;
          const found = findNode(state.building, dynamicId);
          if (found) return getRecursiveTicket(found);
          return [];
        },
      },
    },
  },
});

export interface IStoreModules {
  appDataStore: StateAppData;
  ticketDataStore: TicketStateAppData;
}
