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

import Vue from 'vue'
import Vuex from 'vuex'
import { setTotalTimeSeries } from "../data-management/numeric-time-series/index.js"
import { getBuildingAsync } from "../api-requests"
import endpoints from "../../../../endpoints.json"
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    building: { name: '', dynamicId: 0 },
    floors: [],
    building_time_series: {},
    floors_time_series: [],
    //endpoints: [endpoints.energy, endpoints.lighting, endpoints.heating]
    endpoints: endpoints.autoconsommation
  },
  getters: {
    building: state => {
      return state.building;
    },
    floors: state => {
      return state.floors;
    },

    energyConsumption: (state: any) => (payload: any) => {
      let buildingData = state.building_time_series[String(payload)][0];
      let sum = buildingData.reduce((e1: number, e2: number) => Math.floor(e1 + e2), 0);
      let mean = buildingData.length ? sum / buildingData.length : 0;
      return Number(mean).toFixed(2);
    }
    /* energyConsumption: (state: any) => (payload: any) =>
      state.building_time_series[String(payload)][0].reduce(
        (e1: number, e2: number) => Math.floor(e1 + e2),
        0
      ), */
    /* lightingConsumption: (state: any) => (payload: any) =>
      state.building_time_series[String(payload)][1].reduce(
        (e1: number, e2: number) => Math.floor(e1 + e2),
        0
      ),
    heatingConsumption: (state: any) => (payload: any) =>
      state.building_time_series[String(payload)][2].reduce(
        (e1: number, e2: number) => Math.floor(e1 + e2),
        0
      ) */
  },
  mutations: {
    SET_BUILDING(state, payload) {
      state.building.dynamicId = payload;
    },
    SET_BUILDING_NAME(state, payload) {
      state.building.name = String(payload);
    },
    SET_FLOORS(state, payload) {
      state.floors = payload;
    },
    SET_TIME_SERIES(state: any, payload: any) {
      state.building_time_series = payload.building_time_series;
      state.floors_time_series = payload.floors_time_series;
    }
  },
  actions: {
    async initializeBuilding({ commit }) {
      try {

        const building = await getBuildingAsync();
        commit('SET_BUILDING_NAME', building.name);
        commit('SET_BUILDING', building.dynamicId);
        commit('SET_FLOORS', building.children);
      } catch (error) {
        console.log(error);
        return;
      }
    },

    async getEnergyConsumption({ commit, state }) {
      await setTotalTimeSeries({ commit, state });
    }
  },
  modules: {
  }
})
