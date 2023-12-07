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

import { IBuilding, IPortofolio } from '../interfaces/IBuilding'
import { ActionContext } from 'vuex';
import { IPortofolioCreation } from '../interfaces/IPortofolioCreation';
import {
    createPortofolioRequest, getAllportofolioRequest,
    removePortofolioRequest, editPortofolioRequest,
    addBuildingToPortofolioRequest,
    editBuildingRequest, deleteBuildingRequest
} from "../requests/portofolioRequest";


function getRandomColor(): string {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

const SET_PORTOFOLIO = "SET_PORTOFOLIO";
const ADD_PORTOFOLIO = "ADD_PORTOFOLIO";
const DELETE_PORTOFOLIO = "DELETE_PORTOFOLIO";
const UPDATE_PORTOFOLIO = "UPDATE_PORTOFOLIO";

const ADD_BUILDING = "ADD_BUILDING";
const UPDATE_BUILDING = "UPDATE_BUILDING";
const DELETE_BUILDING = "DELETE_BUILDING";

interface IState {
    portofolios?: IPortofolio[];
}

export const portofolioStore = {
    namespaced: true,

    state: (): IState => ({
        portofolios: undefined
    }),
    mutations: {
        [ADD_PORTOFOLIO](state: IState, data: IPortofolio) {
            if (!state.portofolios) state.portofolios = [];

            state.portofolios = [...state.portofolios, data];
        },

        [SET_PORTOFOLIO](state: IState, data: IPortofolio[]) {
            state.portofolios = data;
        },

        [DELETE_PORTOFOLIO](state: IState, id: string) {
            state.portofolios = state.portofolios?.filter(el => el.id != id);
        },

        [UPDATE_PORTOFOLIO](state: IState, newData: IPortofolio) {
            const copy: IPortofolio[] = Object.assign([], state.portofolios);
            const index = copy.findIndex(el => el.id === newData.id);
            if (index !== -1) {
                copy[index] = newData;
                state.portofolios = copy;
            }
        },

        [ADD_BUILDING](state: IState, { portofolioId, data }: any) {
            const copy: IPortofolio[] = Object.assign([], state.portofolios);
            const portofolio = copy.find(el => el.id === portofolioId);
            portofolio?.buildings.push(data);

            state.portofolios = copy;
        },

        [UPDATE_BUILDING](state: IState, { portofolioId, buildingId, data }: any) {
            const copy: IPortofolio[] = Object.assign([], state.portofolios);
            const portofolio = copy.find(el => el.id === portofolioId);
            if (!portofolio) return;
            const index = portofolio.buildings.findIndex(el => (<any>el).id === buildingId);
            if (index != -1) {
                portofolio.buildings[index] = data;
            }

            state.portofolios = copy;
        },

        [DELETE_BUILDING](state: IState, { portofolioId, buildingId }: any) {
            const copy: IPortofolio[] = Object.assign([], state.portofolios);
            const portofolio = copy.find(el => el.id === portofolioId);
            if (!portofolio) return;
            portofolio.buildings = portofolio.buildings.filter(el => (<any>el).id !== buildingId);

            state.portofolios = copy;
        },
    },
    actions: {
        async createPortofolio({ commit }: ActionContext<IState, IState>, data: IPortofolioCreation) {
            const response = await createPortofolioRequest(data)
            if (response.data) commit(ADD_PORTOFOLIO, response.data);
        },

        async getAllportofolio({ commit, state }: ActionContext<IState, IState>) {
            if (state.portofolios) return state.portofolios;
            const response = await getAllportofolioRequest();
            if (response.data) {
                commit(SET_PORTOFOLIO, response.data);
                return response.data;
            }
        },

        async removePortofolio({ commit }: ActionContext<IState, IState>, portofolioId: string) {
            const response = await removePortofolioRequest(portofolioId);
            if (response.data) commit(DELETE_PORTOFOLIO, portofolioId);
        },

        async editPortofolio({ commit }: ActionContext<IState, IState>, { id, data }: any) {
            const response = await editPortofolioRequest(id, data);
            if (response.data) commit(UPDATE_PORTOFOLIO, response.data);

        },


        async addBuildingToPortofolio({ commit }: ActionContext<IState, IState>, data: { portofolioId: string; data: IBuilding }) {
            const response = await addBuildingToPortofolioRequest(data.portofolioId, data.data);
            if (response.data) {
                commit(ADD_BUILDING, { portofolioId: data.portofolioId, data: response.data })
            }
        },

        async editBuilding({ commit }: ActionContext<IState, IState>, data: { portofolioId: string; buildingId: string; data: any }) {
            const response = await editBuildingRequest(data.buildingId, data.data);
            if (response.data) {
                console.log(response.data);
                commit(UPDATE_BUILDING, { portofolioId: data.portofolioId, buildingId: data.buildingId, data: response.data })
            }
        },

        async deleteBuilding({ commit }: ActionContext<IState, IState>, data: { portofolioId: string; buildingId: string }) {
            const response = await deleteBuildingRequest(data.buildingId)
            if (response.data) {
                console.log(response.data);
                commit(DELETE_BUILDING, data)
            }
        },
    },

    getters: {},
};
