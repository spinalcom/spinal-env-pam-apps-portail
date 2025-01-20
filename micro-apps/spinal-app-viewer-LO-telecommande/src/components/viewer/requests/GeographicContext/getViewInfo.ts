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
// import { MutationTypes } from "../../../../services/store/appDataStore/mutations";
// import { store } from "../../../../services/store";

// const store = Store;

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

  // console.log('LES POSITION ,,,,,,,,,,');

  let tabletteId = window.parent.router.query.spaceSelectedId

  if (tabletteId == undefined)
    tabletteId = config.tabletteId

  const spinalAPI = SpinalAPI.getInstance();
  console.log('la tablette ??', tabletteId);
  
  const url = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/equipment/${tabletteId}/get_position`);
  let result = await spinalAPI.get<{ [key: string]: any[] }>(url);

  localStorage.setItem('room_tablette', result.data.info.room.dynamicId);
  localStorage.setItem('room_tablette_dbid', result.data.info.room.dbId);
 
  localStorage.setItem('floor_tablette_id', result.data.info.floor.dynamicId);
  localStorage.setItem('floor_tablette_name', result.data.info.floor.name);





  //debut
  //result.data.info.room.dynamicId = le groupe de la tablette

  const listEquipmentgroup = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/equipementsGroup/list`);
  let resultlistEquipmentgroup = await spinalAPI.get<{ [key: string]: any[] }>(listEquipmentgroup);

  const DynamicIdContext = resultlistEquipmentgroup.data.find(group => group.name === config.equipementContext)?.dynamicId;
  // console.log(DynamicIdContext, 'lost'); // dynamicId de 'Synchronisation équipements GMAO'



  const categoryEquipementGroup = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/equipementsGroup/${DynamicIdContext}/category_list`);
  let resultcategoryEquipementGroup = await spinalAPI.get<{ [key: string]: any[] }>(categoryEquipementGroup);

  const DynamicIdCategory = resultcategoryEquipementGroup.data.find(group => group.name === config.equipementCat)?.dynamicId;
  // console.log(DynamicIdCategory, 'toto'); // dynamicId de 'Mobilier '


  const GroupList = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/equipementsGroup/${DynamicIdContext}/category/${DynamicIdCategory}/group_list`);
  let resultcGroupList = await spinalAPI.get<{ [key: string]: any[] }>(GroupList);


  const IdgrpList = resultcGroupList.data.find(group => group.name === config.equipementsGroup)?.dynamicId;
  // console.log(IdgrpList, 'id de position de travail'); // dynamicId de 'Mobilier '

  const Equipement = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/equipementsGroup/${DynamicIdContext}/category/${DynamicIdCategory}/group/${IdgrpList}/equipementList`);
  let resultEquipement = await spinalAPI.get<{ [key: string]: any[] }>(Equipement);


  // console.log(resultEquipement, 'les position de travail');

  //liste des equipements position de travail :resultEquipement 


  //partie group context , recuperation des groupes pui comparer 

  const GroupContextList = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/groupContext/list`);
  let resultGroupContextList = await spinalAPI.get<{ [key: string]: any[] }>(GroupContextList);

  const Idcommand = resultGroupContextList.data.find(group => group.name === config.groupContext)?.dynamicId;
  // console.log(Idcommand, 'list des espace'); // dynamicId de 'Mobilier '


  const groupcontext = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/groupeContext/${Idcommand}/category_list`);
  let resultgroupcontext = await spinalAPI.get<{ [key: string]: any[] }>(groupcontext);

  const contextGroup = resultgroupcontext.data.find(group => group.name === config.groupContextCat)?.dynamicId;
  // console.log(contextGroup, 'la category de telecommande de confort'); // dynamicId de 'Mobilier '


  const grpList = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/groupeContext/${Idcommand}/category/${contextGroup}/group_list`);
  let resultgrpList = await spinalAPI.get<{ [key: string]: any[] }>(grpList);

  // console.log(resultgrpList.data, 'resultgrpList'); // dynamicId de 'Mobilier '

  console.log(resultgrpList, '8888');



  const roomListPromises = resultgrpList.data.map(async (group) => {
    const roomListUrl = spinalAPI.createUrlWithPlatformId(
      buildingId,
      `/api/v1/roomsGroup/${Idcommand}/category/${contextGroup}/group/${group.dynamicId}/roomList`
    );
    return spinalAPI.get<{ [key: string]: any[] }>(roomListUrl);
  });

  let allRoomLists = await Promise.all(roomListPromises);

  console.log(allRoomLists, 'les roomes list');

  const parentDynamicId = result.data.info.room.dynamicId; // Dynamic ID de l'open space

  // Trouver l'index du matchingGroup
  let matchingGroupIndex = -1; // Initialisation de l'index
  const matchingGroup = allRoomLists.find((group, index) => {
    const found = group.data.some((room: any) => room.dynamicId === parentDynamicId);
    if (found) matchingGroupIndex = index; // Met à jour l'index si trouvé
    return found;
  });

  // console.log(matchingGroup, '///////////////////////////');
  // console.log(matchingGroupIndex, 'Index du matching group');

  // console.log(resultgrpList.data[matchingGroupIndex].name , ' LE NOM DU GROUPE PARENT');
  
  localStorage.setItem('room_tablette_name', resultgrpList.data[matchingGroupIndex].name );

  let filteredOpenSpaces;
  if (matchingGroup) {
    filteredOpenSpaces = {
      parentDynamicId,
      rooms: matchingGroup.data,
    };
  } else {
    filteredOpenSpaces = {
      parentDynamicId,
      rooms: [],
    };
  }

  // console.log(filteredOpenSpaces, 'filtred openspace');

  const roomDetailsPromises = filteredOpenSpaces.rooms.map(async (room: any) => {
    const roomDetailsUrl = spinalAPI.createUrlWithPlatformId(
      buildingId,
      `/api/v1/node/${room.dynamicId}/children`
    );
    return spinalAPI.get<{ [key: string]: any[] }>(roomDetailsUrl);
  });

  let allRoomDetails = await Promise.all(roomDetailsPromises);

  // console.log(allRoomDetails, 'les objets des rooms');
  // console.log(resultEquipement.data, 'les position de travail');


  let allWorkPositions = allRoomDetails.flatMap((roomDetail: any) =>
    roomDetail.data.filter((equipment: any) =>
      resultEquipement.data.some(
        (workPosition: any) => workPosition.dynamicId === equipment.dynamicId
      )
    )
  );

  // console.log(allWorkPositions, 'les equipement ');



  const equipementDynamicIds = allWorkPositions.map(equipement => equipement.dynamicId);

  // console.log(equipementDynamicIds, 'le tableau');


  const static_details_multiple = spinalAPI.createUrlWithPlatformId(buildingId, '/api/v1/equipment/read_static_details_multiple');
  let result_static_details = await spinalAPI.post(static_details_multiple, equipementDynamicIds);


  //fin






  // const equipement_romm = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/room/${result.data.info.room.dynamicId}/equipment_list`);
  // let result_equipement_room = await spinalAPI.get<{ [key: string]: any[] }>(equipement_romm);


  // const equipementDynamicIds = result_equipement_room.data.map(equipement => equipement.dynamicId);

  // const static_details_multiple = spinalAPI.createUrlWithPlatformId(buildingId, '/api/v1/equipment/read_static_details_multiple');
  // let result_static_details = await spinalAPI.post(static_details_multiple, equipementDynamicIds);

  // const equipement_list = spinalAPI.createUrlWithPlatformId(buildingId, 'api/v1/equipementsGroup/list');
  // let result_equipement_list = await spinalAPI.get<{ [key: string]: any[] }>(equipement_list);

  // const equipement = result_equipement_list.data.find(item => item.name === "Gestion des équipements");
  // const dynamicId = equipement ? equipement.dynamicId : null;

  // //cat:
  // const cat_room = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/equipementsGroup/${dynamicId}/category_list`);
  // let result_cat_room = await spinalAPI.get<{ [key: string]: any[] }>(cat_room);

  // const typologie = result_cat_room.data.find(item => item.name === "Typologie");
  // const dynamicIdTypologie = typologie ? typologie.dynamicId : null;


  // const grp_room = spinalAPI.createUrlWithPlatformId(buildingId, `/api/v1/equipementsGroup/${dynamicId}/category/${dynamicIdTypologie}/group_list`);
  // let result_grp_room = await spinalAPI.get<{ [key: string]: any[] }>(grp_room);

  // const positionsDeTravail = result_grp_room.data.find(item => item.name === "Positions de travail");
  // const dynamicIdPositions = positionsDeTravail ? positionsDeTravail.dynamicId : null;

  // const room_reference_multiple = spinalAPI.createUrlWithPlatformId(buildingId, '/api/v1/room/reference_object_list_multiple');
  // let result_room_reference_multiple = await spinalAPI.post(room_reference_multiple, dynamicIdsRooms);


  //nouvelle methode de recherche
  const groupedByBimFileIds: { bimFileId: string, dbIds: number[] }[] = [];
  result_static_details.data.forEach(item => {
    // const hasMatchingParent = item.groupParents.some(parent => parent.dynamicId === dynamicIdPositions);
    // if (hasMatchingParent) {
    let group = groupedByBimFileIds.find(group => group.bimFileId === item.bimFileId);
    if (!group) {
      group = { bimFileId: item.bimFileId, dbIds: [] };
      groupedByBimFileIds.push(group);
    }
    group.dbIds.push(item.dbid);
    // }
  });

  // console.log(groupedByBimFileIds, 'le groupedByBimFileIds');


  return groupedByBimFileIds

}

const buildingDefaultScenes = {};
let Add_value = null

export async function getViewInfo(buildingId: string, options: IViewInfoBody): Promise<IViewInfoRes[]> {
  console.log('aaa');

  if (Add_value == null)
    Add_value = await fetchAdditionalData(config, buildingId);

  const modifiedOptions = {
    ...options, // Conserve les autres propriétés
    roomRef: true,
    floorRef: true,
    equipements: false,
  };

  if (modifiedOptions.dynamicId[0] == null)
    return []

  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(buildingId, 'api/v1/geographicContext/viewInfo');

  let result = await spinalAPI.post<IViewInfoRes[]>(url, modifiedOptions);

  console.warn(result);

  if (Array.isArray(result.data[0].data)) {
    // Ajoute les objets de Add_value dans result.data[0].data
    Add_value.forEach(item => {
      result.data[0].data.push(item);
    });
  }


  return result.data;
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