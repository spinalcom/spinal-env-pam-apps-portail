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

import { SpinalAPI } from '../SpinalAPI';
import { getSceneList, sceneDefaut } from '../BIM/sceneDefault';
import { getBIMFileContext } from '../BIM/BIMFileContext';
import { IPlayload } from '../../interfaces/IPlayload';
import { IConfig } from "../../../../interfaces/IConfig";
import { config } from "../../../../config";
// import { ActionTypes } from "../../../../interfaces/vuexStoreTypes";
import { MutationTypes } from "../../../../services/store/appDataStore/mutations";
import { store } from "../../../../services/store";
import { error } from 'console';

const Store = store;

export interface IViewInfoBody {
  dynamicId: number | number[];
  floorRef?: boolean;
  roomRef?: boolean;
  equipements?: boolean;
}

export interface IViewInfoRes {
  dynamicId: number;
  data: IViewInfoItemRes[];
}

export interface IViewInfoItemRes {
  bimFileId: string;
  dbIds: number[];
}
export interface IViewInfoTmpRes {
  bimFileId: string;
  dbIds: Set<number>;
}




export async function fetchAdditionalData(config: IConfig, buildingId: string): Promise<Map<string, any>> {

  let tabletteId = window.parent.router.query.spaceSelectedId

  if (tabletteId == undefined)
    tabletteId = config.tabletteId

  const spinalAPI = SpinalAPI.getInstance();
  //recuperation de la room de la tablette

  const url = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/equipment/${tabletteId}/get_position`);
  let result = await spinalAPI.get<{ [key: string]: any[] }>(url);

  localStorage.setItem('room_tablette', result.data.info.room.dynamicId);
  localStorage.setItem('room_tablette_name', result.data.info.room.name);
  localStorage.setItem('floor_tablette_id', result.data.info.floor.dynamicId);
  localStorage.setItem('floor_tablette_name', result.data.info.floor.name);


  const roomStaticdetails = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/room/${result.data.info.room.dynamicId}/read_static_details`);
  let resultRoomStatic = await spinalAPI.get<{ [key: string]: any[] }>(roomStaticdetails);

  const dynamicIdSalon = resultRoomStatic.data.groupParents.find(group => group.name === "Salon 3éme")?.dynamicId;

  const nodeIdChildren = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/node/${dynamicIdSalon}/children`);
  let allRooms = await spinalAPI.get<{ [key: string]: any[] }>(nodeIdChildren);

  const geographicRooms = allRooms.data.filter(room => room.type === "geographicRoom");
  const dynamicIdsRooms = geographicRooms.map(room => room.dynamicId);



  const static_details_multiple = spinalAPI.createUrlWithPlatformId(buildingId, '/api/v1/room/read_static_details_multiple');
  let result_static_details_rooms = await spinalAPI.post(static_details_multiple, dynamicIdsRooms);


  const room_reference_multiple = spinalAPI.createUrlWithPlatformId(buildingId, '/api/v1/room/reference_object_list_multiple');
  let result_room_reference_multiple = await spinalAPI.post(room_reference_multiple, dynamicIdsRooms);

  const roomInfos = result_static_details_rooms.data.map(room => {
    // Trouver le type dans groupParents
    const groupParent = room.groupParents.find(group => group.name.includes('Type'));


    // Récupérer les objets de référence de la pièce actuelle
    const roomReference = result_room_reference_multiple.data.find(ref => ref.dynamicId === room.dynamicId);
    const sols = roomReference
      ? roomReference.infoReferencesObjects
        .filter(refObj => refObj.name.startsWith("Sol")) // Filtrer les objets "Sol"
        .map(sol => ({
          bimFileId: sol.bimFileId,
          dbid: sol.dbid
        }))
      : [];

    return {
      name: room.name,
      dynamicId: room.dynamicId,
      groupParentType: groupParent ? groupParent.name : "Non spécifié",
      sols: sols
    };
  });

  store.commit(MutationTypes.SET_ROOM_REF, roomInfos);

  return roomInfos
}

const buildingDefaultScenes = {};



export async function getViewInfo(buildingId: string, options: IViewInfoBody): Promise<IViewInfoRes[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const Add_value = await fetchAdditionalData(config, buildingId);

  const solsByBimFileId = {};

  Add_value.forEach(room => {
    room.sols.forEach(sol => {
      const { bimFileId, dbid } = sol;

      if (!solsByBimFileId[bimFileId]) {
        solsByBimFileId[bimFileId] = {
          bimFileId: bimFileId,
          dbIds: []
        };
      }

      solsByBimFileId[bimFileId].dbIds.push(dbid);
    });
  });


  type IViewInfoItemRes = {
    bimFileId: string;
    dbIds: number[];
  };


  const tabletteId2 = config.tabletteId2
  const equipStaticdetails = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/equipment/${tabletteId2}/read_static_details`);
  let resultEquipStatic = await spinalAPI.get<{ [key: string]: any[] }>(equipStaticdetails);

  const bimFileId = resultEquipStatic.data.bimFileId;
  const dbid = resultEquipStatic.data.dbid;

  const res1: IViewInfoItemRes[] = Object.values(solsByBimFileId);

  const modifiedOptions = {
    ...options, // Conserve les autres propriétés
    roomRef: true,
    floorRef: false,
    equipements: false,
  };

  if (modifiedOptions.dynamicId[0] == null)
    return []


  // const url = spinalAPI.createUrlWithPlatformId(buildingId, 'api/v1/geographicContext/viewInfo');

  // let result = await spinalAPI.post<IViewInfoRes[]>(url, modifiedOptions);

  type IViewInfoRes = {
    dynamicId: number;
    data: IViewInfoItemRes[];
  };

  const b: IViewInfoRes[] = [
    {
      dynamicId: 139875273892784, //id tablette
      data: res1
    },
    {
      "dynamicId": tabletteId2,
      "data": [
        {
          "bimFileId": bimFileId,
          "dbIds": [
            dbid
          ]
        }
      ]
    }
  ];

  console.error('return b');

  return b;
}

export function mergeIViewInfoTmpRes(resBody: IViewInfoTmpRes[], bimFileId: string, dbId: number): void {
  let found = false;
  for (const item of resBody) {
    if (item.bimFileId === bimFileId) {
      found = true;
      item.dbIds.add(dbId);
      break;
    }
  }

  if (found === false) {
    resBody.push({
      bimFileId,
      dbIds: new Set([dbId]),
    });
  }
}

export function mergeIViewInfo(resBody: IViewInfoTmpRes[], sources: IViewInfoItemRes[]): void {
  for (const source of sources) {
    for (const dbIds of source.dbIds) {
      mergeIViewInfoTmpRes(resBody, source.bimFileId, dbIds);
    }
  }
}


export async function getViewInfoFormatted(buildingId: string, res: IViewInfoTmpRes[], floor: IPlayload) {
  const defaultScene = await getDefaultOrFirstScene(buildingId);

  const models = await getAndFormatModels(buildingId, res, floor.dynamicId as any);
  const data = {
    item: floor,
    buildingId: buildingId,
    loadingType: defaultScene.sceneAlignMethod,
    models
  }

  return data;
}


export async function getAndFormatModels(buildingId: string, res: IViewInfoTmpRes[], floorId: string) {
  const obj = convertViewerInfoToObj(res);
  const bimFiles = await getBIMFileContext(buildingId);

  return bimFiles.reduce((list, itm) => {
    const dbids = obj[itm.staticId];
    if (dbids) {
      list.push({
        bimFileId: itm.staticId,
        id: floorId,
        name: itm.name,
        path: getPath(itm),
        aecPath: getAecPath(itm),
        dbids
      })
    }

    return list;

  }, [])
}

export async function getDefaultOrFirstScene(buildingId: string) {

  if (!buildingDefaultScenes[buildingId]) {
    const spinalAPi = SpinalAPI.getInstance();
    let def = await sceneDefaut(spinalAPi, buildingId);
    if (!def || Object.keys(def || {}).length === 0) def = await getFirstScene(spinalAPi, buildingId);

    buildingDefaultScenes[buildingId] = def;
  }

  return buildingDefaultScenes[buildingId];
}


async function getFirstScene(spinalAPi: SpinalAPI, buildingId: string) {
  const sceneList = await getSceneList(spinalAPi, buildingId);
  return sceneList?.scenes[0];
}

// export async function getAndFormatModels(res: IViewInfoTmpRes[]) {
//   return res.map((it: IViewInfoTmpRes) => {
//     console.log(it);
//     return {
//       id: it.bimFileId,
//       dbIds: Array.from(it.dbIds),
//     };
//   });
// }

export function convertViewerInfoToObj(res: IViewInfoTmpRes[]) {
  return res.reduce((obj, item) => {
    obj[item.bimFileId] = item.dbIds;
    return obj;
  }, {})
}

function getPath(itm: any) {
  const path: string = itm.items[0]?.path || "";

  return path.replace("/html/viewerForgeFiles", "");
}

function getAecPath(itm: any) {
  const path: string = itm.items[0]?.aecPath || "";

  return path.replace("/html/viewerForgeFiles", "");
}