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
  getBuildings,
  getBuildingById,
} from '../../spinalAPI/GeographicContext/getBuildings';
import { IGetAllBuildingsRes } from '../../../interfaces/IGetAllBuildingsRes';
import { SpinalAPI } from '../../spinalAPI/SpinalAPI';
import { MutationTypes } from './mutations';
import {
  getEquipments,
  getFloors,
  getRooms,
  getEquipmentListMultiple,
  updateMultipleAttributes,
  getAttributsMultiple,
  getContext,
  getchildren,
  getMultipleChildrenRelationNode,
  gethildrenRelationNode,
  readStaticDetailsMultiple,
  getMultipleParentRelationNode,
} from '../../spinalAPI/GeographicContext/geographicContext';
import type {
  IEquipmentItem,
  ISpaceSelectorItem,
  IZoneItem,
} from '../../../components/SpaceSelector';
import { INodeItem } from '../../../interfaces/INodeItem';
import {
  IViewInfoBody,
  IViewInfoItemRes,
} from '../../spinalAPI/GeographicContext/getViewInfo';
import {
  ActionTypes,
  ApiIteratorStoreRecordNumberType,
  ApiIteratorStoreRecordStringType,
  ApiIteratorStoreType,
  AugmentedActionContextAppData,
} from '../../../interfaces/vuexStoreTypes';
import {
  getGroupsItems,
  getAllCategoriesTree,
} from '../../spinalAPI/GeographicContext/groupsItems';
import SpriteManager from '../../../components/viewer/manager/spriteManager';
import ViewerManager from '../../../components/viewer/manager/viewerManager';
import { IConfig } from '../../../interfaces/IConfig';
import { classifyItemByBimFileId } from './utils/openViewer';

const ApiIteratorStore: ApiIteratorStoreType &
  ApiIteratorStoreRecordStringType &
  ApiIteratorStoreRecordNumberType = {};

export const actions = {
  async [ActionTypes.GET_BUILDINGS](
    { commit, state }: AugmentedActionContextAppData,
    { patrimoineId, forceUpdate }
  ): Promise<IGetAllBuildingsRes[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (typeof ApiIteratorStore[ActionTypes.GET_BUILDINGS] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_BUILDINGS] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.GET_BUILDINGS][patrimoineId] ===
        'undefined' ||
      forceUpdate === true
    ) {
      ApiIteratorStore[ActionTypes.GET_BUILDINGS][patrimoineId] =
        spinalAPI.createIteratorCall(getBuildings, patrimoineId);
    }

    const buildings = await ApiIteratorStore[ActionTypes.GET_BUILDINGS][
      patrimoineId
    ]!.next();
    commit(MutationTypes.SET_BUILDINGS, buildings.value);
    return buildings.value;
  },

  async [ActionTypes.GET_BUILDING_BY_ID](
    { commit, state }: AugmentedActionContextAppData,
    { buildingId, forceUpdate }
  ): Promise<IGetAllBuildingsRes> {
    const spinalAPI = SpinalAPI.getInstance();
    if (
      typeof ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID] === 'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID][buildingId] ===
        'undefined' ||
      forceUpdate === true
    ) {
      ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID][buildingId] =
        spinalAPI.createIteratorCall(getBuildingById, buildingId);
    }

    const building = await ApiIteratorStore[ActionTypes.GET_BUILDING_BY_ID][
      buildingId
    ]!.next();
    return building.value;
  },

  async [ActionTypes.GET_FLOORS](
    { commit }: AugmentedActionContextAppData,
    { buildingId, patrimoineId, forceUpdate }
  ): Promise<IZoneItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (typeof ApiIteratorStore[ActionTypes.GET_FLOORS] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_FLOORS] = {};
    }

    const floorObjStore = ApiIteratorStore[ActionTypes.GET_FLOORS]!;
    if (
      typeof floorObjStore[buildingId] === 'undefined' ||
      forceUpdate === true
    ) {
      floorObjStore[buildingId] = spinalAPI.createIteratorCall(
        getFloors,
        patrimoineId,
        buildingId
      );
    }

    const floors = await floorObjStore[buildingId].next();
    commit(MutationTypes.SET_FLOORS, { id: buildingId, items: floors.value });
    return floors.value;
  },



  async [ActionTypes.GET_CONTEXT](
    { commit }: AugmentedActionContextAppData,
    { buildingId, patrimoineId, forceUpdate }
  ): Promise<any> {
    const spinalAPI = SpinalAPI.getInstance();
    if (typeof ApiIteratorStore[ActionTypes.GET_CONTEXT] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_CONTEXT] = {};
    }

    const contextObjStore = ApiIteratorStore[ActionTypes.GET_CONTEXT]!;
    if (
      typeof contextObjStore[buildingId] === 'undefined' ||
      forceUpdate === true
    ) {
      contextObjStore[buildingId] = spinalAPI.createIteratorCall(
        getContext,
        patrimoineId,
        buildingId
      );
    }
    const contexts = await contextObjStore[buildingId].next();
    //commit(MutationTypes.SET_FLOORS, { id: buildingId, items: floors.value });
    return contexts.value;
  },
    
    async [ActionTypes.GET_CHILDREN](
    { commit }: AugmentedActionContextAppData,
    { buildingId, patrimoineId, nodeId, forceUpdate }
  ): Promise<any> {
    const spinalAPI = SpinalAPI.getInstance();
    if (typeof ApiIteratorStore[ActionTypes.GET_CHILDREN] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_CHILDREN] = {};
    }

    const contextObjStore = ApiIteratorStore[ActionTypes.GET_CHILDREN]!;
    if (
      typeof contextObjStore[buildingId] === 'undefined' ||
      forceUpdate === true
    ) {
      contextObjStore[buildingId] = spinalAPI.createIteratorCall(
        getchildren,
        patrimoineId,
        buildingId,
        nodeId,
      );
    }
    const contexts = await contextObjStore[buildingId].next();
    //commit(MutationTypes.SET_FLOORS, { id: buildingId, items: floors.value });
    return contexts.value;
  },


  async [ActionTypes.GET_ROOMS](
    { commit }: AugmentedActionContextAppData,
    { buildingId, patrimoineId, floorId, id, forceUpdate }: any
  ): Promise<IZoneItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (typeof ApiIteratorStore[ActionTypes.GET_ROOMS] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_ROOMS] = {};
    }
    const floorObjStore = ApiIteratorStore[ActionTypes.GET_ROOMS]!;

    if (typeof floorObjStore[id] === 'undefined' || forceUpdate === true) {
      floorObjStore[id] = spinalAPI.createIteratorCall(
        getRooms,
        patrimoineId,
        buildingId,
        floorId,
        id
      );
    }
    const floors = await floorObjStore[id].next();
    commit(MutationTypes.SET_ROOMS, { id: id, items: floors.value });
    return floors.value;
  },

  async [ActionTypes.GET_EQUIPMENTS](
    { commit }: AugmentedActionContextAppData,
    { floorId, roomId, patrimoineId, buildingId, id, forceUpdate }: any
  ): Promise<IEquipmentItem[]> {
    const spinalAPI = SpinalAPI.getInstance();

    if (typeof ApiIteratorStore[ActionTypes.GET_EQUIPMENTS] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_EQUIPMENTS] = {};
    }

    const roomObjStore = ApiIteratorStore[ActionTypes.GET_EQUIPMENTS]!;

    if (typeof roomObjStore[id] === 'undefined' || forceUpdate === true) {
      roomObjStore[id] = spinalAPI.createIteratorCall(
        getEquipments,
        patrimoineId,
        buildingId,
        floorId,
        roomId,
        id
      );
    }

    const equipments = await roomObjStore[id].next();
    commit(MutationTypes.SET_EQUIPMENTS, { id: id, items: equipments.value });
    return equipments.value;
  },

  async [ActionTypes.UPDATE_MULTIPLE_ATTRIBUTES](
    { commit }: AugmentedActionContextAppData,
    { buildingId, formattedData }: { buildingId: string; formattedData: any[] }
  ): Promise<any> {
    console.log('arrivé dans l actio');
    const spinalAPI = SpinalAPI.getInstance();
    try {
      const result = await updateMultipleAttributes(buildingId, formattedData);
      console.log('Mise à jour des attributs réussie:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des attributs:', error);
      throw error;
    }
  },

  async [ActionTypes.GET_EQUIPMENT_LIST_MULTIPLE](
    { commit }: AugmentedActionContextAppData,
    { patrimoineId, buildingId, roomIds, forceUpdate }: any
  ): Promise<IEquipmentItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (
      typeof ApiIteratorStore[ActionTypes.GET_EQUIPMENT_LIST_MULTIPLE] ===
      'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_EQUIPMENT_LIST_MULTIPLE] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.GET_EQUIPMENT_LIST_MULTIPLE][
        buildingId
      ] === 'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_EQUIPMENT_LIST_MULTIPLE][buildingId] =
        spinalAPI.createIteratorCall(
          getEquipmentListMultiple,
          patrimoineId,
          buildingId,
          roomIds
        );
    }
    const items = await ApiIteratorStore[
      ActionTypes.GET_EQUIPMENT_LIST_MULTIPLE
    ][buildingId].next();
    // console.log('equipmentscall', items);
    return items?.value;
  },
    async [ActionTypes.GET_CHILDREN_BY_RELATION](
    { commit }: AugmentedActionContextAppData,
    { patrimoineId, buildingId, nodeId, relation, forceUpdate }: any
  ): Promise<IEquipmentItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (
      typeof ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION] ===
      'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION][
        buildingId
      ] === 'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION][buildingId] =
        spinalAPI.createIteratorCall(
          gethildrenRelationNode,
          patrimoineId,
          buildingId,
          nodeId,
          relation,
        );
    }
    const items = await ApiIteratorStore[
      ActionTypes.GET_CHILDREN_BY_RELATION
    ][buildingId].next();
    // console.log('equipmentscall', items);
    return items?.value;
  },
       async [ActionTypes.RESET_API_ITERATOR_STORE](
  { commit }: AugmentedActionContextAppData,
  { buildingId }: any
): Promise<void> {
  if (
    typeof ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION] !== 'undefined' &&
    typeof ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION][buildingId] !== 'undefined'
  ) {
    delete ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION][buildingId];
  }
         if (
    typeof ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE] !== 'undefined' &&
    typeof ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE][buildingId] !== 'undefined'
  ) {
    delete ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE][buildingId];
         }
          if (
    typeof ApiIteratorStore[ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE] !== 'undefined' &&
    typeof ApiIteratorStore[ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE][buildingId] !== 'undefined'
  ) {
    delete ApiIteratorStore[ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE][buildingId];
          }
          if (
    typeof ApiIteratorStore[ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE] !== 'undefined' &&
    typeof ApiIteratorStore[ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE][buildingId] !== 'undefined'
  ) {
    delete ApiIteratorStore[ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE][buildingId];
  }
        // console.log(`ApiIteratorStore getchldren has been reset.`);
  },
       
       async [ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE](
    { commit }: AugmentedActionContextAppData,
    { patrimoineId, buildingId, relations, forceUpdate }: any
  ): Promise<IEquipmentItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (
      typeof ApiIteratorStore[ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE] ===
      'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE][
        buildingId
      ] === 'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE][buildingId] =
        spinalAPI.createIteratorCall(
          getMultipleParentRelationNode,
          patrimoineId,
          buildingId,
          relations,
        );
    }
    const items = await ApiIteratorStore[
      ActionTypes.GET_PARENT_BY_RELATION_MULTIPLE
    ][buildingId].next();
    // console.log('equipmentscall', items);
    return items?.value;
  },
 
    
    async [ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE](
    { commit }: AugmentedActionContextAppData,
    { patrimoineId, buildingId, relations, forceUpdate }: any
  ): Promise<IEquipmentItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (
      typeof ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE] ===
      'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE][
        buildingId
      ] === 'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE][buildingId] =
        spinalAPI.createIteratorCall(
          getMultipleChildrenRelationNode,
          patrimoineId,
          buildingId,
          relations,
        );
    }
    const items = await ApiIteratorStore[
      ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE
    ][buildingId].next();
    // console.log('equipmentscall', items);
    return items?.value;
  },
    
      async [ActionTypes.READ_STATIC_DETAILS_MULTIPLE](
    { commit }: AugmentedActionContextAppData,
    { buildingId, dynamicIds, forceUpdate }: any
  ): Promise<IEquipmentItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (
      typeof ApiIteratorStore[ActionTypes.READ_STATIC_DETAILS_MULTIPLE] ===
      'undefined'
    ) {
      ApiIteratorStore[ActionTypes.READ_STATIC_DETAILS_MULTIPLE] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.READ_STATIC_DETAILS_MULTIPLE][
        buildingId
      ] === 'undefined'
    ) {
      ApiIteratorStore[ActionTypes.READ_STATIC_DETAILS_MULTIPLE][buildingId] =
        spinalAPI.createIteratorCall(
          readStaticDetailsMultiple,
          buildingId,
          dynamicIds
        );
    }
    const items = await ApiIteratorStore[
      ActionTypes.READ_STATIC_DETAILS_MULTIPLE
    ][buildingId].next();
        // console.log('equipmentscall', items);
        
//         const processEquipments = (items) => {
//   return items.map(item => {
//     const group = item.groupParents.find(parent => parent.type === item.type + "Group");
//     return {
//       dynamicId: item.dynamicId,
//       group: group ? group.name : null
//     };
//   });
        // };
        const processEquipments = (items) => {
  return items.map(item => {
    const group = item.groupParents.find(parent => parent.type === item.type + "Group");
    const endpoints = item.controlEndpoint.map(ce => ce.endpoints.map(endpoint => ({
      name: endpoint.name,
      value: endpoint.value
    }))).flat(); // Flatten if there are multiple controlEndpoints
    const controlEndpoints = item.endpoint;

    return {
      dynamicId: item.dynamicId,
      group: group ? group.name : null,
      endpoints,
      controlEndpoints
    };
  });
};

// Assuming 'items' is the array you provided in the example
const result = processEquipments(items.value);

console.log("Call for statique deails",result);
        // return items?.value;
        return result;
  },

  async [ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE](
    { commit }: AugmentedActionContextAppData,
    { buildingId, dynamicIds, forceUpdate }: any
  ): Promise<IEquipmentItem[]> {
    const spinalAPI = SpinalAPI.getInstance();
    if (
      typeof ApiIteratorStore[ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE] ===
      'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE][
        buildingId
      ] === 'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE][buildingId] =
        spinalAPI.createIteratorCall(
          getAttributsMultiple,
          buildingId,
          dynamicIds
        );
    }
    const items = await ApiIteratorStore[
      ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE
    ][buildingId].next();
    // console.log('equipmentscall', items);
    return items?.value;
  },

  async [ActionTypes.GET_GROUPS_ITEMS](
    { commit, state }: AugmentedActionContextAppData,
    { forceUpdate, config, buildingId }
  ): Promise<{ [key: string]: INodeItem }> {
    const spinalAPI = SpinalAPI.getInstance();

    if (typeof ApiIteratorStore[ActionTypes.GET_GROUPS_ITEMS] === 'undefined') {
      ApiIteratorStore[ActionTypes.GET_GROUPS_ITEMS] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.GET_GROUPS_ITEMS][buildingId] ===
        'undefined' ||
      forceUpdate
    ) {
      ApiIteratorStore[ActionTypes.GET_GROUPS_ITEMS][buildingId] =
        spinalAPI.createIteratorCall(getGroupsItems, config, buildingId);
    }

    const items = await ApiIteratorStore[ActionTypes.GET_GROUPS_ITEMS][
      buildingId
    ].next();
    return items?.value;
  },

  async [ActionTypes.GET_CATEGORIES_TREE](
    { commit, state }: AugmentedActionContextAppData,
    { forceUpdate, buildingId, context }
  ): Promise<{ [key: string]: INodeItem }> {
    const spinalAPI = SpinalAPI.getInstance();

    if (
      typeof ApiIteratorStore[ActionTypes.GET_CATEGORIES_TREE] === 'undefined'
    ) {
      ApiIteratorStore[ActionTypes.GET_CATEGORIES_TREE] = {};
    }

    if (
      typeof ApiIteratorStore[ActionTypes.GET_CATEGORIES_TREE][buildingId] ===
        'undefined' ||
      forceUpdate
    ) {
      ApiIteratorStore[ActionTypes.GET_CATEGORIES_TREE][buildingId] =
        spinalAPI.createIteratorCall(getAllCategoriesTree, buildingId, context);
    }

    const items = await ApiIteratorStore[ActionTypes.GET_CATEGORIES_TREE][
      buildingId
    ].next();
    return items?.value;
  },


  ////////////////////////////////////////////////////////
  //                VIEWER
  ////////////////////////////////////////////////////////

  async [ActionTypes.OPEN_VIEWER](
    { commit, dispatch, state }: AugmentedActionContextAppData,
    playload: { onlyThisModel: boolean; config: IConfig; item: any }
  ): Promise<void> {
    try {
      const viewerInfo = playload.config.viewerInfo;
      const body = {
        dynamicId: [playload.item.dynamicId],
        roomRef: viewerInfo.roomRef,
        floorRef: viewerInfo.floorRef,
        equipements: false,
        dbIdsToAdd: [],
      };

      if (viewerInfo.equipments === 'all') {
        body.equipements = true;
        body.dbIdsToAdd = [];
      } else if (viewerInfo.equipments === 'groupItem') {
        body.equipements = false;
        const map = await dispatch(ActionTypes.GET_GROUPS_ITEMS, {
          config: playload.config,
          buildingId: playload.item.buildingId,
        });
        body.dbIdsToAdd = classifyItemByBimFileId(
          map,
          playload.item.dynamicId,
          playload.item.type
        );
      }

      await ViewerManager.getInstance().loadInViewer(
        playload.item,
        playload.onlyThisModel,
        body
      );

      if (playload.onlyThisModel) state.viewerStartedList = {};

      commit(MutationTypes.ADD_VIEWER_LOADED, { id: playload.item.dynamicId });
    } catch (error) {
      console.log('errror', error);
    }
  },

  async [ActionTypes.GET_VIEWER_INFO](
    { commit, state }: AugmentedActionContextAppData,
    playload
  ): Promise<IViewInfoItemRes[]> {
    return ViewerManager.getInstance().getViewerInfoMerged(playload);
  },
  [ActionTypes.SELECT_ITEMS]({ commit, dispatch, state }, playload: any) {
    ViewerManager.getInstance().select(playload);
  },

  [ActionTypes.ISOLATE_ITEMS]({ commit, dispatch, state }, playload: any) {
    ViewerManager.getInstance().isolate(playload);
  },


  [ActionTypes.FIT_TO_VIEW_ITEMS]({ commit, dispatch, state }, playload: any) {
    ViewerManager.getInstance().fitToView(playload);
  },

  async [ActionTypes.UNLOAD_MODEL]({ commit, dispatch, state }, playload: any) {
    await ViewerManager.getInstance().unload(playload);

    if (!Array.isArray(playload)) playload = [playload];

    for (const item of playload) {
      commit(MutationTypes.REMOVE_VIEWER_LOADED, { id: item.dynamicId });
    }
  },

  [ActionTypes.COLOR_ITEMS](
    { commit, dispatch, state },
    { items, buildingId }: any
  ) {
    return ViewerManager.getInstance().colorItems(items, buildingId);
  },

  [ActionTypes.ADD_SPRITES](
    { commit, dispatch, state },
    { items, buildingId }: any
  ) {
    return ViewerManager.getInstance().addSprites(items, buildingId);
  },

    [ActionTypes.ADD_CARD_COMPONENT](
    { commit, dispatch, state },
    { items, buildingId, component }: any
  ) {
    return ViewerManager.getInstance().addCardomponent(
      items,
      buildingId,
      component
    );
  },

  [ActionTypes.ADD_COMPONENT_AS_SPRITES](
    { commit, dispatch, state },
    { items, buildingId, component }: any
  ) {
    return ViewerManager.getInstance().addComponentAsSprites(
      items,
      buildingId,
      component
    );
  },

[ActionTypes.REMOVE_CARDS]({ commit, dispatch, state }) {
    return SpriteManager.getInstance().removeCards();
  },

  [ActionTypes.REMOVE_ALL_SPRITES]({ commit, dispatch, state }) {
    return SpriteManager.getInstance().removeSprites();
  },
  [ActionTypes.SELECT_SPRITES](
    { commit, dispatch, state },
    dynamicIds: Array<number>
  ) {
    return SpriteManager.getInstance().selectSprites(dynamicIds);
  },
  [ActionTypes.DESELECT_SPRITE](
    { commit, dispatch, state },
    dynamicIds: Array<number>
  ) {
    return SpriteManager.getInstance().deselectSprites(dynamicIds);
  },
  [ActionTypes.DESELECT_LINE](
    { commit, dispatch, state },
    dynamicIds: Array<number>
  ) {
    return SpriteManager.getInstance().removeStyleLine(dynamicIds);
  },
  [ActionTypes.REMOVE_ALL_LINES]({ commit, dispatch, state }) {
    return ViewerManager.getInstance().removeAllLines();
  },
  // [ActionTypes.ADD_LINES](
  //   { commit, dispatch, state },
  //   { source,destinations, buildingId }: any
  // ) {
  //   return ViewerManager.getInstance().addLines(source,destinations, buildingId);
  // },
};
