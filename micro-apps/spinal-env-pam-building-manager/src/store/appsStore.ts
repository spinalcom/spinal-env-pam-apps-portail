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

import { IPortofolio } from '../interfaces/IBuilding'
import { IApiRoute } from '../interfaces/IApiRoute'
import { IApp } from '../interfaces/IApp'
import {
    getPortofolioAppsRequest,
    getBuildingAppsRequest,
    getPortofolioApisRequest,
    getBuildingApisRequest
} from "../requests/portofolioRequest";


function getRandomColor(): string {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}


interface IState {
    buildingsApps?: IApp[];
    portofolioApps?: IApp[];
    portofolios: IPortofolio[];
    buildingsApis?: IApiRoute[];
    portofolioApis?: IApiRoute[];
}


const SET_PORTOFOLIO_APPS = "SET_PORTOFOLIO_APPS";
const SET_PORTOFOLIO_APIS = "SET_PORTOFOLIO_APIS";
const SET_BUILDING_APPS = "SET_BUILDING_APPS";
const SET_BUILDING_APIS = "SET_BUILDING_APIS";

export const appsStore = {
    namespaced: true,

    state: (): IState => ({
        portofolios: [],
        buildingsApps: undefined,
        portofolioApps: undefined,
        buildingsApis: undefined,
        portofolioApis: undefined
    }),
    mutations: {
        [SET_PORTOFOLIO_APPS](state: IState, playload: IApp[]) {
            state.portofolioApps = playload;
        },

        [SET_PORTOFOLIO_APIS](state: IState, playload: IApiRoute[]) {
            state.portofolioApis = playload;
        },

        [SET_BUILDING_APPS](state: IState, playload: IApp[]) {
            state.buildingsApps = playload;
        },

        [SET_BUILDING_APIS](state: IState, playload: IApiRoute[]) {
            state.buildingsApis = playload;
        }
    },
    actions: {

        async getPortofolioApps({ state, commit }) {
            if (state.buildingsApps) return state.buildingsApps;

            const response = await getPortofolioAppsRequest();
            if (response.data) {
                commit(SET_PORTOFOLIO_APPS, response.data)
                return response.data;
            }
        },

        async getBuildingApps({ state, commit }) {
            if (state.portofolioApps) return state.portofolioApps;

            const response = await getBuildingAppsRequest();
            if (response.data) {
                commit(SET_BUILDING_APPS, response.data)
                return response.data;
            }
        },

        async getPortofolioApis({ commit, state }) {
            if (state.portofolioApis) return state.portofolioApis;

            const response = await getPortofolioApisRequest();
            if (response.data) {
                commit(SET_PORTOFOLIO_APIS, response.data)
                return response.data;
            }
        },

        async getBuildingApis({ commit, state }) {
            if (state.buildingsApis) return state.buildingsApis;

            const response = await getBuildingApisRequest();
            if (response.data) {
                commit(SET_BUILDING_APIS, response.data)
                return response.data;
            }
        },

    },

    getters: {},
};
