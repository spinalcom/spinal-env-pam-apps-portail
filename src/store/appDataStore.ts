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
  getPortofolios,
  addAppToFavorite,
  removeAppFromFavorite,
  getFavoriteApps,
} from "../requests/userData";

export const SET_USER_APPS = "SET_USER_APPS";
export const SET_USER_BOS = "SET_USER_BOS";
export const SET_USER_INFO = "SET_USER_INFO";
export const SET_AND_FORMAT_APPS = "SET_AND_FORMAT_APPS";
export const SET_SELECTED_APP = "SET_SELECTED_APP";
export const SET_PORTOFOLIOS = "SET_PORTOFOLIOS";
export const SELECT_PORTOFOLIO = "SELECT_PORTOFOLIO";
export const ADD_FAVORITE_APP = "ADD_FAVORITE_APP";
export const SET_FAVORITE_APP = "SET_FAVORITE_APP";
export const DELETE_FAVORITE_APP = "DELETE_FAVORITE_APP";

const names = {
  apps: "Applications",
  // "adminApps": "Administration"
};

function classifyByCategory(
  apps: any[]
): { name: string; id: string; apps: any[] }[] {
  const obj: { [key: string]: any } = {};
  apps.forEach((data) => {
    const categoryId = data.categoryName.toLowerCase();
    if (!obj[categoryId])
      obj[categoryId] = { id: categoryId, name: data.categoryName, apps: [] };

    obj[categoryId].apps.push(data);
  });

  return Array.from(Object.values(obj));
}

function classifyByCategoryAndGroup(apps: any[], favoriteApps: any[] = []) {
  let categories = classifyByCategory(apps);

  categories.unshift({ name: "Favoris", id: "favoris", apps: favoriteApps }); // Ajouter la categorie favorites

  const groups: { [key: string]: { name: string; id: string } } = {};

  const data = categories.map(({ name, id, apps }) => {
    let t: { [key: string]: any } = { name, id };

    apps.forEach((el) => {
      // const groupId = el.groupName.toLowerCase();
      const groupId = "Applications";
      if (!t[groupId]) {
        t[groupId] = [];
        // groups[groupId] = { name: el.groupName, id: groupId }
        groups[groupId] = { name: "Applications", id: groupId };
      }

      t[groupId].push(el);
    });

    return t;
  });

  return { groups: Array.from(Object.values(groups)), data };
}

function reinitFavoris(old_list: any[], newList: any[]) {
  if (!newList || !old_list) return [];
  // re-init favorites
  return old_list.map((el) => {
    if (el.value === "favoris") {
      el.Applications = newList;
    }
    return el;
  });
}

const appsFormattedMap = new Map();
let inProcess = false;

export const appDataStore = {
  namespaced: true,
  state: {
    selectedPortofolio: undefined,
    portofolios: undefined,
    spaceSelected: "",
    appSelected: undefined,
    appsDisplayed: [],
    pamApps: [],
    bos: [],
    appsFormatted: undefined,
    userInfo: {},
    _privateData: { userInfoIsSet: false, appsIsSet: false },
    favoriteApps: [],
  },
  mutations: {
    [SELECT_PORTOFOLIO](state: any, playload) {
      state.selectedPortofolio = playload;
    },
    [SET_PORTOFOLIOS](state: any, playload) {
      state.portofolios = playload;
    },

    [SET_USER_INFO](state: any, playload: any) {
      state.userInfo = playload;
      state._privateData.userInfoIsSet = true;
    },

    [SET_AND_FORMAT_APPS](state: any, { apps, appsFormatted }: any) {
      state.appsDisplayed = apps;
      state.appsFormatted = appsFormatted;
    },

    [SET_SELECTED_APP](state: any, playload: any) {
      state.appSelected = playload;
    },

    [ADD_FAVORITE_APP](state: any, playload: any) {
      state.favoriteApps = [...state.favoriteApps, ...playload];
      // re-init favorites
      if (state.appsFormatted?.data)
        state.appsFormatted.data = reinitFavoris(
          state.appsFormatted.data,
          state.favoriteApps
        );
    },

    [SET_FAVORITE_APP](state: any, playload: any) {
      state.favoriteApps = playload;
      // re-init favorites
      if (state.appsFormatted?.data)
        state.appsFormatted.data = reinitFavoris(
          state.appsFormatted.data,
          state.favoriteApps
        );
    },

    [DELETE_FAVORITE_APP](state: any, playload: any) {
      const obj = {};
      playload.forEach((el) => (obj[el.id] = el));

      state.favoriteApps = state.favoriteApps.filter((el) => !obj[el.id]);
      if (state.appsFormatted?.data)
        state.appsFormatted.data = reinitFavoris(
          state.appsFormatted.data,
          state.favoriteApps
        );
    },
  },
  actions: {
    async getPortofolios({ commit, dispatch, state }: any) {
      try {
        const profileId = await dispatch("getProfileId");
        const portofolios = await getPortofolios(profileId);
        commit(SET_PORTOFOLIOS, portofolios);
      } catch (error) {}
    },

    getProfileId() {
      if (localStorage.getItem("profileId"))
        return Promise.resolve(localStorage.getItem("profileId"));
      // send request
    },

    getUserInfo({ commit, state }: any) {
      if (state._privateData.userInfoIsSet) return state.userInfo;

      let userInfo = {};
      const storage = localStorage.getItem("user");
      if (storage) userInfo = JSON.parse(atob(storage));
      //send request;

      commit(SET_USER_INFO, userInfo);
      return userInfo;
    },

    async selectSpace(
      { commit, dispatch, state }: any,
      data: { portofolioId: string; buildingId: string }
    ) {
      if (!state.portofolios) {
        await dispatch("getPortofolios");
      }

      let apps = [];
      const portofolio = state.portofolios.find(
        (el) => el.id === data.portofolioId
      );
      if (portofolio && !data.buildingId) {
        apps = portofolio.apps.map((el) => {
          el.parent = {
            portofolioId: data.portofolioId,
            buildingId: data.buildingId,
          };
          return el;
        });
        state.spaceSelected = data.portofolioId;
      } else if (portofolio && data.buildingId) {
        const building = portofolio.buildings.find(
          (el) => el.id === data.buildingId
        );
        if (building) {
          state.spaceSelected = data.buildingId;
          apps = building.apps.map((el) => {
            el.parent = {
              portofolioId: data.portofolioId,
              buildingId: data.buildingId,
            };
            return el;
          });
        }
      }

      const favoris = await dispatch("getFavoriteApps");
      let appsFormatted = classifyByCategoryAndGroup(apps, favoris);

      commit(SET_AND_FORMAT_APPS, { apps, appsFormatted });
    },

    async addToFavoriteApps({ commit, state, getters }: any, appIds: string[]) {
      const data = {
        portofolioId: getters.getPortofolioId,
        buildingId: getters.getBuildingId,
      };

      const apps = await addAppToFavorite(appIds, data);
      commit(ADD_FAVORITE_APP, apps);
    },

    async getFavoriteApps({ commit, getters }) {
      const data = {
        portofolioId: getters.getPortofolioId,
        buildingId: getters.getBuildingId,
      };
      const apps = await getFavoriteApps(data);
      commit(SET_FAVORITE_APP, apps);
      return apps;
    },

    async deleteFavoriteApps({ commit, getters }, appIds) {
      const data = {
        portofolioId: getters.getPortofolioId,
        buildingId: getters.getBuildingId,
      };
      const apps = await removeAppFromFavorite(appIds, data);
      commit(DELETE_FAVORITE_APP, apps);
    },
  },
  getters: {
    getPortofolioId(state) {
      if (!state.selectedPortofolio) return;
      if (
        state.selectedPortofolio.type === "building" &&
        state.selectedPortofolio.parents
      )
        return state.selectedPortofolio.parents[0];
      if (state.selectedPortofolio.type === "portofolio")
        return state.selectedPortofolio.staticId;
    },
    getBuildingId(state) {
      if (!state.selectedPortofolio) return;
      if (state.selectedPortofolio.type === "building")
        return state.selectedPortofolio.staticId;
    },
  },
};
