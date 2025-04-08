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
/* 
import type {
  IEquipmentItem,
  IZoneItem,
  ISpaceSelectorItem,
} from "../../../../../../global-components/SpaceSelector"; */
import type { MutationTree } from "vuex";
import type { StateAppData } from "./state";
import { Building, Floor, Room, Equipment, ChartData } from '../../../components/interfaces/types'; // Types des données
/* import { defaultTemporalitySelected } from './defaultZoneSelected';
 */

export enum ActionTypes {
  GET_BUILDINGS = 'GET_BUILDINGS',
  GET_FLOORS = 'GET_FLOORS',
  GET_ROOMS = 'GET_ROOMS',
  GET_EQUIPMENTS = 'GET_EQUIPMENTS',
  UPDATE_TIME_RANGE = 'UPDATE_TIME_RANGE',
}

export enum MutationTypes {
  SET_BUILDINGS = 'SET_BUILDINGS',
  SET_SELECTED_BUILDING = 'SET_SELECTED_BUILDING',
  SET_FLOORS = 'SET_FLOORS',
  SET_ROOMS = 'SET_ROOMS',
  SET_EQUIPMENTS = 'SET_EQUIPMENTS',
  SET_CHART_DATA = 'SET_CHART_DATA',
  SET_TIME_RANGE = 'SET_TIME_RANGE',
}
export type MutationsAppData<S = StateAppData> = {
  [MutationTypes.SET_BUILDINGS](state: S, payload: Building[]): void;
  [MutationTypes.SET_SELECTED_BUILDING](state: S, payload: Building): void;
  [MutationTypes.SET_FLOORS](
    state: S,
    payload: { buildingId: string; floors: Floor[] }
  ): void;
  [MutationTypes.SET_ROOMS](
    state: S,
    payload: { floorId: string; rooms: Room[] }
  ): void;
  [MutationTypes.SET_EQUIPMENTS](
    state: S,
    payload: { floorId: string; equipments: Equipment[] }
  ): void;
  [MutationTypes.SET_CHART_DATA](
    state: S,
    payload: { labels: string[]; datasets: ChartData[] }
  ): void;
  [MutationTypes.SET_TIME_RANGE](
    state: S,
    payload: { startTime: string; endTime: string }
  ): void;
};

export const mutations = {
  // Met à jour la liste des bâtiments
  [MutationTypes.SET_BUILDINGS](state, buildings: Building[]) {
    state.buildings = buildings;
  },

  // Met à jour le bâtiment sélectionné
  [MutationTypes.SET_SELECTED_BUILDING](state, building: Building) {
    state.selectedBuilding = building;
  },

  // Met à jour les étages d'un bâtiment
  [MutationTypes.SET_FLOORS](state, { buildingId, floors }: { buildingId: string; floors: Floor[] }) {
    state.floors[buildingId] = floors;
  },

  // Met à jour les salles d'un étage
  [MutationTypes.SET_ROOMS](state, { floorId, rooms }: { floorId: string; rooms: Room[] }) {
    state.rooms[floorId] = rooms;
  },

  // Met à jour les équipements d'un étage
  [MutationTypes.SET_EQUIPMENTS](state, { floorId, equipments }: { floorId: string; equipments: Equipment[] }) {
    state.equipments[floorId] = equipments;
  },

  // Met à jour les données des graphiques
  [MutationTypes.SET_CHART_DATA](state, chartData: { labels: string[]; datasets: ChartData[] }) {
    state.chartData = chartData;
  },

  // Met à jour la plage horaire sélectionnée
  [MutationTypes.SET_TIME_RANGE](state, { startTime, endTime }: { startTime: string; endTime: string }) {
    state.startTime = startTime;
    state.endTime = endTime;
  },
};
