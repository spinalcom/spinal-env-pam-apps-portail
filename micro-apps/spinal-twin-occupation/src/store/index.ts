import Vue from "vue";
import Vuex from "vuex";
import { setAverageTimeSeries } from "../data-management/average-type-time-series";
import { getBuildingAsync } from "../api-requests";
import config from "../../../../config.json";
const endpoints = config.enpoints;
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    building: { name: "", dynamicId: 0 },
    floors: [],
    building_time_series: {},
    floors_time_series: [],
    horaires: ["9h - 19h", "19h - 9h"],
    endpoints: [endpoints.people_number],
  },
  getters: {
    building: (state) => {
      return state.building;
    },
    floors: (state) => {
      return state.floors;
    },
    peopleNumber: (state: any) => (payload: any) =>
      state.building_time_series[String(payload)][0].reduce(
        (e1: number, e2: number) => Math.floor(e1 + e2),
        0
      ),
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
    },
  },
  actions: {
    async initializeBuilding({ commit }) {
      try {
        const building = await getBuildingAsync();
        commit("SET_BUILDING_NAME", building.name);
        commit("SET_BUILDING", building.dynamicId);
        commit("SET_FLOORS", building.children);
      } catch (error) {
        console.log(error);
        return;
      }
    },

    async getPeopleNumber({ commit, state, rootState }) {
      setAverageTimeSeries({ commit, state, rootState });
    },
  },
  modules: {},
});
