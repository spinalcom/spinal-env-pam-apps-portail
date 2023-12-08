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
import Vuex, { Store as VuexStore, CommitOptions, DispatchOptions } from "vuex";
import { StateAppData, state } from "./appDataStore/state";
import { MutationsAppData, mutations } from "./appDataStore/mutations";
import { Actions, actions } from "./appDataStore/actions";
import {
  StateAppData as StateTicketData,
  state as ticketState,
} from "./ticketDataStore/state";
import {
  MutationsAppData as MutationsTicketData,
  mutations as ticketMutations,
  toManageableTicket,
} from "./ticketDataStore/mutations";
import {
  Actions as TicketActions,
  actions as ticketActions,
} from "./ticketDataStore/actions";
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
        /*getTickets: (state) => (dynamicId: number) => {
          if (!dynamicId || dynamicId === state.building.dynamicId)
            return state.building.tickets;
          const found = state.building.children.find(
            (f: any) => f.dynamicId === dynamicId
          );
          if (found && found.loaded) return found.tickets;
          return [];
        },*/
        newGetTickets: (state: typeof ticketState) => (dynamicId?: number) => {
          if (!dynamicId) return state.tickets;
          const found = findNode(state.building, dynamicId);
          if (found) return getRecursiveTicket(found);
          return [];
        },
        /*newGetTicketsMulti:
          (state: typeof ticketState, getters) => (dynamicIds: number[]) => {
            return dynamicIds.reduce(
              (tickets: any[], dynamicId: number) => [
                ...tickets,
                ...getters.newGetTickets(dynamicId),
              ],
              []
            );
          },*/
      },
    },
  },
});

export interface IStoreModules {
  appDataStore: StateAppData;
  ticketDataStore: StateTicketData;
}

export interface IStoreTicketModules {}

// export type Store =
export type Store = Omit<VuexStore<IStoreModules>, "commit" | "dispatch"> & {
  commit<
    K extends keyof (MutationsAppData | MutationsTicketData),
    P extends Parameters<(MutationsAppData | MutationsTicketData)[K]>[1]
  >(
    key: K,
    payload: P,
    options?: CommitOptions
  ): ReturnType<(MutationsAppData | MutationsTicketData)[K]>;
} & {
  dispatch<K extends keyof (Actions | TicketActions)>(
    key: K,
    payload?: Parameters<(Actions | TicketActions)[K]>[1],
    options?: DispatchOptions
  ): ReturnType<(Actions | TicketActions)[K]>;
};
