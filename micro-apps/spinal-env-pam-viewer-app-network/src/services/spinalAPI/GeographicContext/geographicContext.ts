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
import type {
  IBuildingItem,
  IZoneItem,
  IEquipmentItem,
  IRefItem,
} from '../../../components/SpaceSelector/interfaces/IBuildingItem';

export async function getBuilding(platformId: string) {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    'api/v1/building/read'
  );
  let result = await spinalAPI.get<IBuildingItem>(url);
  Object.assign(result.data, { color: '#2693ff' });
  return result.data;
}

export async function getFloors(
  patrimoineId: string,
  buildingId: string
): Promise<IZoneItem[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    'api/v1/floor/list'
  );
  let result = await spinalAPI.get<IZoneItem[]>(url);
  const res = result.data.map((obj) => {
    Object.assign(obj, { buildingId, patrimoineId, color: '#D138DE' });
    return obj;
  });
  return res;
}

export async function getRooms(
  patrimoineId: string,
  buildingId: string,
  floorId: string,
  floorDynId: number
): Promise<IZoneItem[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    `api/v1/floor/${floorDynId}/room_list`
  );
  let result = await spinalAPI.get<IZoneItem[]>(url);
  const res = result.data.map((obj) => {
    Object.assign(obj, { patrimoineId, buildingId, floorId, color: '#ded638' });
    return obj;
  });
  return res;
}

export async function getContext(
  patrimoineId: string,
  buildingId: string,
): Promise<any> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    `api/v1/context/list`
  );
  let result = await spinalAPI.get<any>(url);
  // const res = result.data.map((obj) => {
  //   Object.assign(obj, { patrimoineId, buildingId, floorId, color: '#ded638' });
  //   return obj;
  // });
  return result.data;
}
export async function getchildren(
  patrimoineId: string,
  buildingId: string,
  nodeId: number,
): Promise<any> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    `api/v1/node/${nodeId}/children`
  );
  let result = await spinalAPI.get<any>(url);
  // const res = result.data.map((obj) => {
  //   Object.assign(obj, { patrimoineId, buildingId, floorId, color: '#ded638' });
  //   return obj;
  // });
  return result.data;
}

export async function getEquipments(
  patrimoineId: string,
  buildingId: string,
  floorId: string,
  roomId: string,
  roomDynId: number
): Promise<IEquipmentItem[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    `api/v1/room/${roomDynId}/equipement_list`
  );
  let result = await spinalAPI.get<IEquipmentItem[]>(url);
  const res = result.data.map((obj) => {
    Object.assign(obj, {
      patrimoineId,
      buildingId,
      floorId,
      roomId,
      color: '#2693ff',
    });
    return obj;
  });
  return res;
}

export async function getEquipmentListMultiple(
  patrimoineId: string,
  buildingId: string,
  roomIds: number[]
): Promise<IEquipmentItem[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    `/api/v1/room/equipment_list_multiple`
  );
  const body = roomIds;
  // console.log('body', body);
  let result = await spinalAPI.post(url, body);
  // console.log('result', result.data);
  return result.data;
}
export async function gethildrenRelationNode(
  patrimoineId: string,
  buildingId: string,
  nodeId: number,
  relation: any,
): Promise<IEquipmentItem[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    `/api/v1/node/${nodeId}/children`
  );
  
  const body = [relation];
  // console.log('body', body);
  let result = await spinalAPI.post(url, body);
  // console.log('result', result.data);
  return result.data;
}


export async function getMultipleChildrenRelationNode(
  patrimoineId: string,
  buildingId: string,
  // nodeId: number,
  // relation: any,
  relations: { dynamicId: number, relation: any }[]
): Promise<IEquipmentItem[]> {
  let realresult;
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    `/api/v1/node/children_multiple `
  );
  
  let body = relations.map(({ dynamicId, relation }) => ({ dynamicId, relation }));
  // console.log('body', body);
  let result = await spinalAPI.post(url, body);
  // console.log('result from function', result.data);
  let luminairechildrenbyrelation = result.data;
  let nextIds = luminairechildrenbyrelation.map((r) =>
    r.nodes.map((e) => e.dynamicId)
  );
  nextIds = nextIds.flat();
  // console.log('nextIds', nextIds);
  relations = [];
  relations = nextIds.map((r) => {
    return { dynamicId: r, relation: ["hasNetworkTreeBimObject"] };
  });
  // console.log('relations', relations);
  realresult = result.data;
  realresult = realresult.flat();
  realresult.forEach((item) => {
    item.nodes = item.nodes.filter((node) => node.type === "BIMObject");
  });

  //Recursive function to get all the children of the children
  while (relations.length > 0) {
    body = relations.map(({ dynamicId, relation }) => ({ dynamicId, relation }));
    result = await spinalAPI.post(url, body);
    // console.log('result from function', result.data);
    let newNodes: any[] = [];
      result.data.forEach((e: any) => {
      // console.log('e', e);
      if (e.nodes.some((node: any) => node.type === "BIMObject")) {
         newNodes.push(e);
      }
    });
    // console.log('newnodesindxes', newNodes);

    //Removing nodes that are not BIMObject
    let listOfObjects: any[] = []; 
    let newnodesFiltered: { dynamicId: number, nodes: any[] }; 

    newNodes.forEach((e: any) => {
      newnodesFiltered = {
        dynamicId: e.dynamicId,
        nodes: [],
      };
      e.nodes.forEach((node: any) => {
        if (node.type === "BIMObject") {
          newnodesFiltered.nodes.push(node);
        }
      });
      listOfObjects.push(newnodesFiltered);
    });
    // console.log('listOfObjects ', listOfObjects);

    //getting new relations for the next iteration
      nextIds = listOfObjects.map((r) =>
        r.nodes.map((e) => e.dynamicId)
      );
      nextIds = nextIds.flat();
      // console.log('nextIds', nextIds);
      relations = [];
      relations = nextIds.map((r) => {
        return { dynamicId: r, relation: ["hasNetworkTreeBimObject"] };
      });
    // console.log('relations', relations);
    
    //concatenating the new nodes to the real result ones
    listOfObjects.forEach((obj: any) => {
      findAndAppendNodes(obj.dynamicId, realresult, obj.nodes);
    });
    // console.log(realresult);
  }
  

  return realresult;
}

function findAndAppendNodes(dynamicId: number, nodes: any[], nodesToAdd: any[]) {
    for (let node of nodes) {
        if (node.dynamicId === dynamicId) {
            // If the dynamicId matches, append nodesToAdd to the nodes array of this object
            if (!node.nodes) {
                node.nodes = [];
            }
            node.nodes = node.nodes.concat(nodesToAdd);
            return true;
        }
        // If the current node has children (nodes), recursively search within them
        if (node.nodes && node.nodes.length > 0) {
            if (findAndAppendNodes(dynamicId, node.nodes, nodesToAdd)) {
                return true;
            }
        }
    }
    return false;
}


// export async function getMultipleChildrenRelationNode(
//   patrimoineId: string,
//   buildingId: string,
//   relations: { dynamicId: number, relation: any }[]
// ): Promise<IEquipmentItem[]> {
//   const spinalAPI = SpinalAPI.getInstance();
//   const url = spinalAPI.createUrlWithPlatformId(
//     buildingId,
//     `/api/v1/node/children_multiple`
//   );

//   const getChildrenRecursive = async (dynamicId: number): Promise<any> => {
//     const body = [{ dynamicId }];
//     const result = await spinalAPI.post(url, body);
//     const children = result.data[0].nodes;
//     const childrenPromises = children.map(async (child: any) => {
//       if (child.nodes && child.nodes.length > 0) {
//         // Recursively get children if the node has children
//         return getChildrenRecursive(child.dynamicId);
//       }
//       return child;
//     });
//     return Promise.all(childrenPromises);
//   };

//   const relationsPromises = relations.map(async ({ dynamicId, relation }) => {
//     const children = await getChildrenRecursive(dynamicId);
//     return { dynamicId, nodes: children };
//   });

//   const result = await Promise.all(relationsPromises);
//   return result.data;
// }


export async function getAttributsMultiple(
  buildingId: string,
  dynamicIds: number[]
): Promise<IEquipmentItem[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    `/api/v1/node/attribute_list_multiple`
  );
  const body = dynamicIds;
  // console.log('body', body);
  let result = await spinalAPI.post(url, body);
  // console.log('result', result.data);
  return result.data;
}

export async function updateMultipleAttributes(
  buildingId: string,
  formattedData: any[]
): Promise<any> {
  console.log('arrivé dans node attribut');

  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    buildingId,
    '/api/v1/node/attribute/update_multiple'
  );

  try {
    const response = await spinalAPI.post<any>(url, formattedData);
    console.log('fin de node attribut');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des attributs:', error);
    throw error;
  }
}

// export async function getEquipmentListMultiple(
//   roomIds: number[]
// ): Promise<IEquipmentItem[]> {
//   const spinalAPI = SpinalAPI.getInstance();
//   console.log('roomIds', roomIds);
//   const url = spinalAPI.createUrl('api/v1/room/equipment_list_multiple');
//   let result = await spinalAPI.post<IEquipmentItem[]>(url, { roomIds });
//   return result.data;
// }

export async function getFloorRef(
  platformId: string,
  floorDynId: number
): Promise<IEquipmentItem[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    `api/v1/floor/${floorDynId}/reference_Objects_list`
  );
  let result = await spinalAPI.get<IRefItem>(url);
  return result.data.infoReferencesObjects;
}

export async function getRoomsRef(
  platformId: string,
  roomDynId: number
): Promise<IEquipmentItem[]> {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    `api/v1/room/${roomDynId}/reference_Objects_list`
  );
  let result = await spinalAPI.get<IRefItem>(url);
  return result.data.infoReferencesObjects;
}
