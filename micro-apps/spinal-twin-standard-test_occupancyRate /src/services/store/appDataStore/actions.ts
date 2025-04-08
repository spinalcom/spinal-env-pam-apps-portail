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


import { MutationTypes } from "./mutations";
import {
  getFloors,
  getBuilding,
} from "../../spinalAPI/GeographicContext/geographicContext";
import {
  ActionTypes,
} from "../../../interfaces/vuexStoreTypes";

const ApiIteratorStore: ApiIteratorStoreType &
  ApiIteratorStoreRecordStringType &
  ApiIteratorStoreRecordNumberType = {};

export const actions = {
  // Récupère la liste des bâtiments
  async [ActionTypes.GET_BUILDINGS]({ commit }) {
    try {
      const buildings = await getBuilding();
      if (buildings) {
        commit(MutationTypes.SET_BUILDINGS, buildings);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des bâtiments:', error);
    }
  },

  // Récupère les étages d'un bâtiment
  async [ActionTypes.GET_FLOORS]({ commit }, buildingId: string) {
    try {
      const floors = await getFloors();
      commit(MutationTypes.SET_FLOORS, { buildingId, floors });
    } catch (error) {
      console.error('Erreur lors de la récupération des étages:', error);
    }
  },

  // Récupère les salles d'un étage
  async [ActionTypes.GET_ROOMS]({ commit }, floorId: string) {
    try {
      const rooms = await getRoomIds(floorId);
      commit(MutationTypes.SET_ROOMS, { floorId, rooms });
    } catch (error) {
      console.error('Erreur lors de la récupération des salles:', error);
    }
  },

  // Récupère les équipements d'un étage
  async [ActionTypes.GET_EQUIPMENTS]({ commit }, floorId: string) {
    try {
      const equipments = await getThirdChartIds(floorId);
      commit(MutationTypes.SET_EQUIPMENTS, { floorId, equipments });
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements:', error);
    }
  },

  // Met à jour la plage horaire
  async [ActionTypes.UPDATE_TIME_RANGE]({ commit }, { startTime, endTime }) {
    commit(MutationTypes.SET_TIME_RANGE, { startTime, endTime });
  },
};