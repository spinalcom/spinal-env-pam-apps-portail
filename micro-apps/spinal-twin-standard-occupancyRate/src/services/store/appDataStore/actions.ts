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


import { ActionTypes, MutationTypes } from "./mutations";
/* import { ApiIteratorStoreType, ApiIteratorStoreRecordStringType, ApiIteratorStoreRecordNumberType } from "micro-apps/spinal-app-viewer-description/src/interfaces/vuexStoreTypes";
 */import { getBuilding, getFloors, getRoomIds, getThirdChartIds } from "../..";
import { defaultTemporalitySelected } from './defaultZoneSelected';

/* const ApiIteratorStore: ApiIteratorStoreType &
  ApiIteratorStoreRecordStringType &
  ApiIteratorStoreRecordNumberType = {};
 */
export const actions = {
  // Récupère la liste des bâtiments
  async [ActionTypes.GET_BUILDINGS]({ commit }) {
    try {
      const building = await getBuilding(); // Appel à la fonction API
      if (building) {
        commit(MutationTypes.SET_BUILDINGS, [building]); // Stocke le bâtiment dans le store
        commit(MutationTypes.SET_SELECTED_BUILDING, building); // Définit le bâtiment sélectionné
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des bâtiments:', error);
    }
  },

  // Récupère les étages d'un bâtiment
  async [ActionTypes.GET_FLOORS]({ commit }, buildingId: string) {
    try {
      const floors = await getFloors(); // Appel à la fonction API
      commit(MutationTypes.SET_FLOORS, { buildingId, floors }); // Stocke les étages dans le store
    } catch (error) {
      console.error('Erreur lors de la récupération des étages :', error);
    }
  },

  // Récupère les salles d'un étage
  async [ActionTypes.GET_ROOMS]({ commit }, floorId: string) {
    try {
      const contextId = "yourContextId"; // Replace with the actual context ID
      const categoryId = "yourCategoryId"; // Replace with the actual category ID
      const groupId = "yourGroupId"; // Replace with the actual group ID
      const rooms = await getRoomIds(contextId, categoryId, groupId);
      commit(MutationTypes.SET_ROOMS, { floorId, rooms });
    } catch (error) {
      console.error('Erreur lors de la récupération des salles:', error);
    }
  },

  // Récupère les équipements d'un étage
  async [ActionTypes.GET_EQUIPMENTS]({ commit }, floorId: string) {
    try {
      const contextId = "yourContextId"; // Replace with the actual context ID
      const categoryId = "yourCategoryId"; // Replace with the actual category ID
      const groupId = "yourGroupId"; // Replace with the actual group ID
      const equipments = await getThirdChartIds(contextId, categoryId, groupId);
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