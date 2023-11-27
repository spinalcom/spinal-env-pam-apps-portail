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

import Vue from 'vue';
import Vuex from 'vuex';
import {
  getWebsocketStateRequest,
  readWebsocketLogsRequest,
  readCurrentWeekLogsRequest,
  readCurrentYearLogsRequest,
  readLast24hLogsRequest,
  getPortofoliosRequest,
  getWebsocketClientCountRequest,
} from '../requests';

import {
  // SET_LOGS,
  SET_PORTOFOLIOS,
  SELECT_BUILDING,
  SET_YEAR_LOGS,
  SET_WEEK_LOGS,
  SET_YESTERDAY_LOGS,
  SET_TODAY_LOGS,
  SET_WEBSOCKET_STATE,
  SET_CLIENT_CONNECTED_COUNT,
} from './constants';

Vue.use(Vuex);

function classifyDataByDate(logs): {
  year: any[];
  week: any[];
  toDay: any[];
  yesterday: any[];
} {
  const now = Date.now();

  const toDayBegin = new Date().setHours(0, 0, 0, 0);
  const yesterdayBegin = toDayBegin - 86400000;
  const weekBegin = toDayBegin - 86400000 * 7;
  const yearBegin = toDayBegin - 86400000 * 365;

  const data = {year: [], week: [], toDay: [], yesterday: []};

  for (const log of logs) {
    const date = log.date;
    //@ts-ignore
    if (date >= toDayBegin && date <= now) data.toDay.push(log);
    //@ts-ignore
    if (date >= yesterdayBegin && date < toDayBegin) data.yesterday.push(log);
    //@ts-ignore
    if (date >= weekBegin && date <= now) data.week.push(log);
    //@ts-ignore
    if (date >= yearBegin && date <= now) data.year.push(log);
  }

  return data;
}

export default new Vuex.Store({
  state: {
    webSocketLogs: {
      toDay: [],
      yesterday: [],
      week: [],
      year: [],
    },
    portofolios: undefined,
    selectedBuilding: undefined,
    websocketState: {state: 'unknow', since: 0},
    clients: {numberOfClientConnected: 0},
  },
  mutations: {
    [SET_WEBSOCKET_STATE](state: any, playload) {
      state.websocketState = playload;
    },

    [SELECT_BUILDING](state: any, playload) {
      console.log(playload);
      state.selectedBuilding = playload;
    },

    [SET_YEAR_LOGS](state: any, playload) {
      const {year, week, toDay, yesterday} = classifyDataByDate(playload);
      state.webSocketLogs.toDay = toDay;
      state.webSocketLogs.yesterday = yesterday;
      state.webSocketLogs.week = week;
      state.webSocketLogs.year = year;
    },

    [SET_WEEK_LOGS](state: any, playload) {
      const {week, toDay, yesterday} = classifyDataByDate(playload);
      state.webSocketLogs.toDay = toDay;
      state.webSocketLogs.yesterday = yesterday;
      state.webSocketLogs.week = week;
    },

    [SET_YESTERDAY_LOGS](state: any, playload) {
      state.webSocketLogs.yesterday = playload;
    },

    [SET_TODAY_LOGS](state: any, playload) {
      state.webSocketLogs.toDay = playload;
    },

    [SET_PORTOFOLIOS](state: any, playload) {
      const filtered = playload.reduce((list, el) => {
        if (el.name.toLowerCase() !== 'administration') {
          el.disabled = true;
          list.push(el);
        }
        return list;
      }, []);
      state.portofolios = filtered;

      if (state.selectedBuilding) return;

      for (const portofolio of filtered) {
        if (portofolio.buildings.length > 0) {
          state.selectedBuilding = portofolio.buildings[0];
          return;
        }
      }
    },

    [SET_CLIENT_CONNECTED_COUNT](state: any, playload) {
      state.clients = playload;
    },
  },
  actions: {
    async getWebsocketState({commit}, buildingId: string) {
      const response = await getWebsocketStateRequest(buildingId);
      commit(SET_WEBSOCKET_STATE, response.data);
    },

    async readWebsocketLogs(
      {commit},
      data: {buildingId: string; begin?: number; end: number}
    ) {
      const response = await readWebsocketLogsRequest(
        data.buildingId,
        data.begin,
        data.end
      );
    },

    async readToDayWebsocketLogs({commit}, buildingId) {
      const response = await readWebsocketLogsRequest(buildingId);
      commit(SET_TODAY_LOGS, response.data);
    },

    async readCurrentWeekLogs({commit}, buildingId: string) {
      const response = await readCurrentWeekLogsRequest(buildingId);
      commit(SET_WEEK_LOGS, response.data);
    },

    async readCurrentYearLogs({commit}, buildingId: string) {
      const response = await readCurrentYearLogsRequest(buildingId);
      commit(SET_YEAR_LOGS, response.data);
    },

    async readLast24hLogs({commit}, buildingId: string) {
      const response = await readLast24hLogsRequest(buildingId);
      commit(SET_YESTERDAY_LOGS, response.data);
    },
    /////////////////////////////////////
    async getPortofolios({commit, dispatch, state}: any) {
      try {
        const profileId = await dispatch('getProfileId');
        const portofolios = await getPortofoliosRequest(profileId);
        commit(SET_PORTOFOLIOS, portofolios);
      } catch (error) {}
    },

    getProfileId() {
      if (localStorage.getItem('profileId'))
        return Promise.resolve(localStorage.getItem('profileId'));
      // send request
    },

    async getWebsocketClientCount({commit}, buildingId) {
      const response = await getWebsocketClientCountRequest(buildingId);
      commit(SET_CLIENT_CONNECTED_COUNT, response.data);
    },
  },
  getters: {
    // logs(state) {
    //   return state.webSocketLogs.logs.sort((a, b) => b.date - a.date);
    // },
    // state(state) {
    //   return state.webSocketLogs.state;
    // }
  },
});
