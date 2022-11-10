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

import {
  addDigitalTwinRequest,
  deleteDigitalTwinRequest,
  editDigitaltwinRequest,
  getDigitalTwinRequest,
  getAllDigitalTwinRequest,
  getDigitalTwinContextsRequest,
} from "../requests/digitalTwinRequest";

import { IBuilding } from '../interfaces/IBuilding'


function getRandomColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}


export const ADD_DIGITAL_TWIN = "ADD_DIGITAL_TWIN";
export const GET_DIGITAL_TWIN = "GET_DIGITAL_TWIN";
export const GET_ALL_DIGITAL_TWIN = "GET_ALL_DIGITAL_TWIN";
export const DELETE_DIGITAL_TWIN = "DELETE_DIGITAL_TWIN";
export const EDIT_DIGITAL_TWIN = "EDIT_DIGITAL_TWIN";

interface IState {
  buildings: IBuilding[];
}

export const digitalTwinStore = {
  namespaced: true,

  state: (): IState => ({ buildings: [] }),

  mutations: {
    [ADD_DIGITAL_TWIN](state: IState, playload: IBuilding) {
      playload.color = getRandomColor();
      state.buildings = [playload, ...state.buildings];
    },

    [GET_DIGITAL_TWIN](state: IState, playload: IBuilding) {
      const found = state.buildings.find((el) => el.id !== playload.id);
      if (!found) {
        playload.color = getRandomColor();
        state.buildings = [playload, ...state.buildings];
      }
    },

    [EDIT_DIGITAL_TWIN](state: IState, playload: IBuilding) {
      playload.color = getRandomColor();
      const data = playload;
      const copy: IBuilding[] = Object.assign([], state.buildings);
      const index = copy.findIndex((el: IBuilding) => el.id === data.id);
      if (index !== -1) {
        copy[index] = data;
        state.buildings = copy;
      }
    },

    [DELETE_DIGITAL_TWIN](state: IState, id: string) {
      state.buildings = state.buildings.filter((el) => el.id !== id);
    },

    [GET_ALL_DIGITAL_TWIN](state: IState, playload: IBuilding[]) {
      state.buildings = playload.map(el => {
        el.color = getRandomColor();
        return el;
      });
    },
  },
  actions: {
    async addDigitalTwin({ commit }: any, digitalTwinInfo: IBuilding) {
      commit(ADD_DIGITAL_TWIN, await addDigitalTwinRequest(digitalTwinInfo));
    },

    async getDigitalTwin({ commit, state }: any, id: string) {
      const playload = await getDigitalTwinRequest(id);
      commit(GET_DIGITAL_TWIN, playload);
      return playload;
    },

    async editDigitaltwin({ commit }: any, { id, data }: { id: string, data: IBuilding }) {
      delete data.id;
      delete data.type;

      commit(EDIT_DIGITAL_TWIN, await editDigitaltwinRequest(id, data));
    },

    async deleteDigitalTwin({ commit }: any, id: string) {
      await deleteDigitalTwinRequest(id);
      commit(DELETE_DIGITAL_TWIN, id);
    },

    async getAllDigitalTwin({ commit }: any) {
      const response = await getAllDigitalTwinRequest();
      commit(GET_ALL_DIGITAL_TWIN, response);
      return response;
    },

    // async getDigitalTwinContexts({ dispatch, state }: any) {
    //   const digitalTwins =
    //     state.buildings.length > 0
    //       ? state.buildings
    //       : await dispatch("getAllDigitalTwin");

    //   const promises = digitalTwins.map(async (el: IBuilding) => {
    //     const contexts = await getDigitalTwinContextsRequest(el);
    //     el.contexts = contexts.map((el2: IBuilding) => {
    //       el2.digitaltwinId = el.id;
    //       return el2;
    //     });
    //     return el;
    //   });

    //   return Promise.all(promises);
    // },
  },

  getters: {
    getDigitalTwinInfo: (state: IState) => (id: string) => {
      return state.buildings.find((el) => el.id === id);
    },
  },
};
