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

import { ActionTree } from 'vuex';
import { getBuildings, getBuildingById } from '../../spinalAPI/GeographicContext/getBuildings';
import { IGetAllBuildingsRes } from '../../../interfaces/IGetAllBuildingsRes';
import { SpinalAPI } from '../../spinalAPI/SpinalAPI';
import { MutationTypes } from './mutations';
import type { StateAppData } from './state';
import { getEquipments, getFloors, getRooms } from '../../spinalAPI/GeographicContext/geographicContext';
import type { IEquipmentItem, INodeItem, ISpaceSelectorItem, IZoneItem, } from '../../../components/SpaceSelector';
import { startViewer } from '../../../components/viewer/eventManager';
import { getViewInfo, IViewInfoItemRes, IViewInfoTmpRes, mergeIViewInfo } from '../../spinalAPI/GeographicContext/getViewInfo';
import { EmitterViewerHandler, ViewerEventWithData, VIEWER_OBJ_FIT_TO_VIEW, VIEWER_OBJ_ISOLATE, VIEWER_OBJ_SELECT } from 'spinal-viewer-event-manager';
import { ActionTypes, Actions, ApiIteratorStoreRecordNumberType, ApiIteratorStoreRecordStringType, ApiIteratorStoreType, AugmentedActionContextAppData } from '../../../interfaces/vuexStoreTypes';
import { getGeographicItemsGroups } from '../../spinalAPI/GeographicContext/geographicItemsGroups';



const ApiIteratorStore: ApiIteratorStoreType &
  ApiIteratorStoreRecordStringType &
  ApiIteratorStoreRecordNumberType = {};

const viewerStartedList = new Set<string>();

async function FctViewerIteract(eventName: keyof ViewerEventWithData, { dispatch }: AugmentedActionContextAppData, payload: { buildingId: string; id: number | number[]; }): Promise<void> {
  const emitter = EmitterViewerHandler.getInstance();
  if (eventName === ("unload" as any)) return emitter.emit(eventName, []);

  const data: IViewInfoItemRes[] = await dispatch(ActionTypes.GET_VIEWER_INFO, payload);
  const res = data.map((it) => {
    return {
      dbIds: it.dbIds,
      modelId: it.bimFileId,
    };
  });
  emitter.emit(eventName, res);
}

export const actions: ActionTree<StateAppData, StateAppData> & Actions = {
  async [ActionTypes.GET_BUILDINGS]({ commit, state }: AugmentedActionContextAppData, { patrimoineId, forceUpdate}  ): Promise<IGetAllBuildingsRes[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (typeof ApiIteratorStore[ActionTypes.GET_BUILDINGS] === "undefined") {
      ApiIteratorStore[ActionTypes.GET_BUILDINGS] = {};
    }

    if (typeof ApiIteratorStore[ActionTypes.GET_BUILDINGS][patrimoineId] === 'undefined' || forceUpdate === true) {
      ApiIteratorStore[ActionTypes.GET_BUILDINGS][patrimoineId] = spinalAPI.createIteratorCall(getBuildings, patrimoineId);
    }

    const buildings = await ApiIteratorStore[ActionTypes.GET_BUILDINGS][patrimoineId]!.next();
    commit(MutationTypes.SET_BUILDINGS, buildings.value);
    return buildings.value;
  },

  async [ActionTypes.GET_BUILDING_BY_ID]({ commit, state }: AugmentedActionContextAppData, { buildingId, forceUpdate}  ): Promise<IGetAllBuildingsRes> {
    const spinalAPI = SpinalAPI.getInstance();
    if (typeof ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID] === "undefined") {
      ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID] = {};
    }
    
    if (typeof ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID][buildingId] === 'undefined' || forceUpdate === true) {
      ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID][buildingId] = spinalAPI.createIteratorCall(getBuildingById, buildingId);
    }
    
    const building = await ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID][buildingId]!.next();
    return building.value;
  },

  async [ActionTypes.GET_FLOORS]({ commit }: AugmentedActionContextAppData, { buildingId, patrimoineId, forceUpdate }): Promise<IZoneItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (typeof ApiIteratorStore[ActionTypes.GET_FLOORS] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_FLOORS] = {};
    }

    const floorObjStore = ApiIteratorStore[ActionTypes.GET_FLOORS]!;
    if ( typeof floorObjStore[buildingId] === 'undefined' || forceUpdate === true ) {
      floorObjStore[buildingId] = spinalAPI.createIteratorCall(getFloors, patrimoineId, buildingId);
    }

    const floors = await floorObjStore[buildingId].next();
    commit(MutationTypes.SET_FLOORS, { id: buildingId, items: floors.value });
    return floors.value;
  },

  async [ActionTypes.GET_ROOMS]({ commit }: AugmentedActionContextAppData, { buildingId, patrimoineId, floorId, id, forceUpdate }: any ): Promise<IZoneItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (typeof ApiIteratorStore[ActionTypes.GET_ROOMS] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_ROOMS] = {};
    }
    const floorObjStore = ApiIteratorStore[ActionTypes.GET_ROOMS]!;

    if (typeof floorObjStore[id] === 'undefined' || forceUpdate === true) {
      floorObjStore[id] = spinalAPI.createIteratorCall(getRooms, patrimoineId, buildingId, floorId, id);
    }
    const floors = await floorObjStore[id].next();
    commit(MutationTypes.SET_ROOMS, { id: id, items: floors.value, });
    return floors.value;
  },

  async [ActionTypes.GET_EQUIPMENTS]({ commit }: AugmentedActionContextAppData, {floorId, roomId, patrimoineId, buildingId, id, forceUpdate }: any ): Promise<IEquipmentItem[]> {
    const spinalAPI = SpinalAPI.getInstance();

    if ( typeof ApiIteratorStore[ActionTypes.GET_EQUIPMENTS] === 'undefined' ) {
      ApiIteratorStore[ActionTypes.GET_EQUIPMENTS] = {};
    }

    const roomObjStore = ApiIteratorStore[ActionTypes.GET_EQUIPMENTS]!;
    
    if (typeof roomObjStore[id] === 'undefined' || forceUpdate === true) {
      roomObjStore[id] = spinalAPI.createIteratorCall(getEquipments, patrimoineId, buildingId, floorId, roomId, id);
    }

    const equipments = await roomObjStore[id].next();
    commit(MutationTypes.SET_EQUIPMENTS, { id: id, items: equipments.value });
    return equipments.value;
  },



  async [ActionTypes.GET_GEOGRAPHIC_ITEMS_GROUPS]({ commit, state }: AugmentedActionContextAppData, {forceUpdate, buildingId}): Promise<{ [key: string]: INodeItem }> {
    const spinalAPI = SpinalAPI.getInstance();
    
    if (typeof ApiIteratorStore[ActionTypes.GET_GEOGRAPHIC_ITEMS_GROUPS] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_GEOGRAPHIC_ITEMS_GROUPS] = {};
    }
    if (typeof ApiIteratorStore[ActionTypes.GET_GEOGRAPHIC_ITEMS_GROUPS][buildingId] === "undefined" || forceUpdate) {
      ApiIteratorStore[ActionTypes.GET_GEOGRAPHIC_ITEMS_GROUPS][buildingId] = spinalAPI.createIteratorCall(getGeographicItemsGroups, buildingId);
    }

    const items = await ApiIteratorStore[ActionTypes.GET_GEOGRAPHIC_ITEMS_GROUPS][buildingId].next()
    return items?.value;
  },


  ////////////////////////////////////////////////////////
  //                VIEWER
  ////////////////////////////////////////////////////////


    async [ActionTypes.OPEN_VIEWER]({ commit,dispatch, state }: AugmentedActionContextAppData, item: ISpaceSelectorItem ): Promise<void> {
    // TODO redo this func to use the state
    
    const buildingId = item.buildingId;
    const floorId = item.type === "geographicFloor" ? item.staticId : (item as any).floorId;
    const id = `${buildingId}_${floorId}`;

    if (!viewerStartedList.has(id)) {
      viewerStartedList.add(id);
      await startViewer(item);
    }

    if (item.type !== "geographicFloor") {
      dispatch(ActionTypes.SELECT_ITEMS, { buildingId, id: item.dynamicId });
      dispatch(ActionTypes.FIT_TO_VIEW_ITEMS, { buildingId, id: item.dynamicId });
    }

    
  },

  async [ActionTypes.GET_VIEWER_INFO]({ commit, state }: AugmentedActionContextAppData, { buildingId,  id }): Promise<IViewInfoItemRes[]> {
    const ids = Array.isArray(id) ? id : [id];
    const res: IViewInfoTmpRes[] = [];
    const nodeTofetech: number[] = [];

    for (const dynId of ids) {
      if (state.buildingInfo[dynId]) {
        mergeIViewInfo(res, state.buildingInfo[dynId]);
      } else {
        nodeTofetech.push(dynId);
      }
    }

    if (nodeTofetech.length > 0) {
      const datas = await getViewInfo(buildingId, { dynamicId: nodeTofetech, floorRef: false, roomRef: true, equipements: true });
      for (const item of datas) {
        commit(MutationTypes.SET_VIEWINFO, {
          id: item.dynamicId,
          items: item.data,
        });
        mergeIViewInfo(res, item.data);
      }
    }
    return res.map((it: IViewInfoTmpRes): IViewInfoItemRes => {
      return { bimFileId: it.bimFileId, dbIds: Array.from(it.dbIds) };
    });
  },

  [ActionTypes.SELECT_ITEMS]: FctViewerIteract.bind(null, VIEWER_OBJ_SELECT),
  [ActionTypes.ISOLATE_ITEMS]: FctViewerIteract.bind(null, VIEWER_OBJ_ISOLATE),
  [ActionTypes.FIT_TO_VIEW_ITEMS]: FctViewerIteract.bind(null, VIEWER_OBJ_FIT_TO_VIEW),
  [ActionTypes.UNLOAD_MODEL]: FctViewerIteract.bind(null, <any>"unload"),
};
