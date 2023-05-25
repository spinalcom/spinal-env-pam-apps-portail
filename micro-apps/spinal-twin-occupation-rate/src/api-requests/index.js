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

import { State } from 'vuex-class';
import { HTTP } from './http-constant';
import dateFormat from 'dateformat';

// durée de relevé des time séries : 10 ans
const today = new Date();
const end = dateFormat(today, 'dd-mm-yyyy hh:MM:ss');
const begin = dateFormat(
  new Date(today.getFullYear() - 10, today.getMonth()),
  'dd-mm-yyyy hh:MM:ss'
);
// Contexte spatial du bâtiment(bâtiment, étages et pièces)
export async function getBuildingAsync() {
  const buildingId = localStorage.getItem('idBuilding');
  const result = await HTTP.get(
    `/building/${buildingId}/geographicContext/space`
  );
  const body = result.data.body ? result.data.body : result.data;
  return body.children.find((b) => b.type == 'geographicBuilding');
}

export async function getBuildingAsyncV3() {
  const buildingId = localStorage.getItem('idBuilding');
  const result = await HTTP.get(
    `/building/${buildingId}/building/read`
  );
  const body = result.data.body ? result.data.body : result.data;
  console.log("body", body);
  return body;
}

// Points de contrôle
export async function getNodeControlEndpointsListAsync(nodeId) {
  const buildingId = localStorage.getItem('idBuilding');
  const result = await HTTP.get(
    `/building/${buildingId}/node/${nodeId}/control_endpoint_list`
  );
  return result.data[0];
}

export async function getControlEndpointstAsync(nodeId, endpoint) {
  const controlEndPointList = await getNodeControlEndpointsListAsync(nodeId);
  if (controlEndPointList && controlEndPointList.endpoints)
    return controlEndPointList.endpoints.find((scp) => scp.name === endpoint);
}

// Time series
export async function getTimeSeriesAsync(endpointId) {
  const buildingId = localStorage.getItem('idBuilding');
  const result = await HTTP.get(
    `/building/${buildingId}/endpoint/${endpointId}/timeSeries/read/${begin}/${end}`
  );
  return result.data;
}

// Tickets de maintenances
export async function getTicketWorkflowAsync() {
  const buildingId = localStorage.getItem('idBuilding');
  const result = await HTTP.get(`/building/${buildingId}/workflow/list`);
  return result.data[0];
}

export async function getWorkflowTreeAsync(workflowId) {
  const buildingId = localStorage.getItem('idBuilding');
  const result = await HTTP.get(
    `/building/${buildingId}/workflow/${workflowId}/tree`
  );
  return result.data;
}

export async function getTicketDetailsAsync(ticketId) {
  const buildingId = localStorage.getItem('idBuilding');
  const result = await HTTP.get(
    `/building/${buildingId}/ticket/${ticketId}/read_details`
  );
  return result.data;
}

/* floors occupancy */

export async function getBuildingFloorsOccupancyAsync(){
  const buildingId = localStorage.getItem('idBuilding');
  let body = await getBuildingAsyncV3();
  let buildingDynamicId = body.dynamicId;
  let buildingArea = body.area.toFixed(2);
  let buildingEndpoint = await getControlEndpointstAsync(buildingDynamicId, "Taux d'occupation");
  let buildingEndpointValue = buildingEndpoint.currentValue.toFixed(2); 
  let floorsEndpoint = {};
  let floorsEndpointValues = [];
  const floorsList = 
    await HTTP.get(`/building/${buildingId}/floor/list`)
    .then(async resp => {
      if (resp.status === 200) {
        for (let element of resp.data) {
          floorsEndpoint = await getControlEndpointstAsync(element.dynamicId, "Taux d'occupation")
          floorsEndpoint.currentValue = floorsEndpoint.currentValue == null ? 
            floorsEndpoint.currentValue = 0 : 
            floorsEndpoint.currentValue = floorsEndpoint.currentValue
          floorsEndpointValues.push({name:element.name, value:floorsEndpoint.currentValue.toFixed(2)})
          }
        }
    })
  return {floorsEndpointValues:floorsEndpointValues, buildingEndpointValue:buildingEndpointValue, area:buildingArea};
}

export async function getAreaAndOccupancyByGroup(groupName) {
  const buildingId = localStorage.getItem('idBuilding');
  let areaResult = 0;
  let occupancyResult = 0;
  let floorOccupancyResult = [];
  let roomGroupId = undefined;
  let roomGroupCategoryId = undefined;
let roomGroupGroupId = undefined;
  let roomGroupList = await HTTP.get(`/building/${buildingId}/roomsGroup/list`)
    .then(async resp => {
      if (resp.status === 200){
        
        if (resp.data[0].name === "Contexte de Salles standardisé") {
          roomGroupId = resp.data[0].dynamicId;
          //console.log("roomGroupId: ", roomGroupId);
        }
      let roomGroupCategories = await HTTP.get(`/building/${buildingId}/roomsGroup/${roomGroupId}/category_list`)
        .then(async resp => {
          if (resp.status === 200){
            
            let category = resp.data.filter(function getFonction(el) {
              return el.name === "Fonction";
            })[0];
          roomGroupCategoryId = category.dynamicId;
          //console.log("roomGroupCategoryId: ", roomGroupCategoryId);
          let groupList = await HTTP.get(`/building/${buildingId}/roomsGroup/${roomGroupId}/category/${roomGroupCategoryId}/group_list`)
          
            .then(async resp => {
              if (resp.status === 200){
                //console.log(resp);
                let groupData = resp.data.filter(function getFonction(el) {
                  return el.name === groupName;
                })[0];
                //console.log("groupData : ", groupData);
              roomGroupGroupId = groupData.dynamicId;
              //console.log("roomGroupGroupId: ", roomGroupGroupId);
              let roomsList = await getRoomsGroupListById(
                roomGroupId,
                roomGroupCategoryId,
                roomGroupGroupId
              );
              console.log("roomsList: ", roomsList);
              let dataResult = await getRoomsAreaAndOccupancy(
                roomsList
              );

              areaResult = dataResult.roomArea;
              occupancyResult = dataResult.groupOccupancy;
              floorOccupancyResult = dataResult.floorOccupancy;
            }});
        }});
    }});
  return { areaResult, occupancyResult, floorOccupancyResult };
}

export async function getRoomsAreaAndOccupancy(roomsList) {
  //console.log("roomsList: ", roomsList);
  const buildingId = localStorage.getItem('idBuilding');
  //let arrayTest = initializeFloorArray(this.floorList);
  let arrayTest = new Array(11).fill(0);
  let area = 0;
  let roomGroupOccupancyAverage = 0;
  let spatialData = undefined;
  let areaData = undefined;
  let floorLocation = undefined;
  let idWithName = [];
  let floorOccupancyByGroup = [];
  for (let el of roomsList) {
    let roomListEl = await HTTP.get(`/building/${buildingId}/room/${el.dynamicId}/read_static_details`)
    .then(async resp => {
      if (resp.status === 200){
        // get spatial data
        spatialData = resp.data.attributsList.filter(function getFonction(el) {
          return el.name === "Spatial";
        })[0];
        //console.log("spatialData", spatialData);
        // get floor location in group parents
        floorLocation = resp.data.groupParents.filter(function getFonction(el) {
          return el.type === "geographicFloor";
        })[0];

        // test if an element exists in an array of objects
        let isFound = idWithName.some(element => {
          if (element.name === parseInt(floorLocation.name)) {
            return true;
          }
          return false;
        });
        if (!isFound) {
          // if the element not found, the floor value with the room details are pushed
          idWithName.push({
            name: parseInt(floorLocation.name),
            rooms: [{ id: resp.data.dynamicId, occupancyRate: 0 }],
            floorOccupancy: 0
          });
        } else {
          // if not, the room details are pushed in the right floor
          for (let elm of idWithName) {
            if (elm.name == parseInt(floorLocation.name)) {
              elm.rooms.push({ id: resp.data.dynamicId, occupancyRate: 0 });
            }
          }
        }

      }})

    // get area value from attributes
    areaData = spatialData.attributs.filter(function getFonction(el) {
      return el.label === "area";
    })[0];
    area += areaData.value;
  }
  console.log("areaData", areaData);
  for (let element of idWithName) {
    let roomsOccArr = [];
    for (let room of element.rooms) {
      let roomOccupancyObj = await getSoloCpAsync(
        room.id,
        "Taux d'occupation"
      );
      roomGroupOccupancyAverage += roomOccupancyObj.currentValue;
      room.occupancyRate = roomOccupancyObj.currentValue;
      roomsOccArr.push(room.occupancyRate);
    }

    element.floorOccupancy = roomsOccArr.reduce((a, b) => a + b, 0) / roomsOccArr.length;
    // name : floor, value :  floor occupancy
    floorOccupancyByGroup.push({
      name: element.name,
      value: element.floorOccupancy.toFixed(0)
    });
  }
  // update an array with an other one
  arrayTest = arrayTest.map(item => {
    const item2 = floorOccupancyByGroup.find(i2 => i2.name === item.name);
    return item2 ? { ...item, ...item2 } : item;
  });
  roomGroupOccupancyAverage = (roomGroupOccupancyAverage / roomsList.length).toFixed(2);

  return {
    roomArea: area,
    groupOccupancy: roomGroupOccupancyAverage,
    floorOccupancy: arrayTest
  };
}

export async function getRoomsGroupListById(contextId, categoryId, groupId) {
  const buildingId = localStorage.getItem('idBuilding');
  let dataResult = undefined;
  let result = await HTTP.get(`/building/${buildingId}/roomsGroup/${contextId}/category/${categoryId}/group/${groupId}/roomList`
  )
    .then(resp => {
      console.log("resp roomList : ", resp);
      if(resp.status === 200){
        console.log("resp.data: ", resp.data.datas);
        dataResult = resp.data;
    }});
  return dataResult;
}

/**
 * Get Building's general information
 *
 * @return {Building.<{id: Number, name: String, cp: [], children: Array.<{id: Number, name: String, cp: [], children: Array.<{id: Number, name: String, cp: [],}>}>}>} building
 */
export async function getBuildingAsyncV2() {
  const buildingId = localStorage.getItem('idBuilding');
  let building = {};
  let body = await getBuildingAsync();
  building.name = body.name;
  building.id = body.dynamicId;

  building.area = body.area;
  building.cp = [];
  // requestUrl = `${path}floor/list`;
  // result = await HTTP.get(`/building/${buildingId}/floor_list`);//  await axios.get(requestUrl);
  body = body.children;
  building.children = [];
  body.map((currentFloor) => {
    building.children.push({
      name: currentFloor.name,
      id: currentFloor.dynamicId,
      children: [],
      cp: [],
    });
  });

  let promise = building.children.map(async (currentFloor) => {
    // requestUrl = `${path}floor/${currentFloor.id}/room_list`;
    const result = await HTTP.get(
      `/building/${buildingId}/floor/${currentFloor.id}/room_list`
    );
    body = result.data;
    body.map((currentRoom) => {
      var foundIndex = building.children.findIndex(
        (x) => x.id == currentFloor.id
      );
      building.children[foundIndex].children.push({
        name: currentRoom.name,
        id: currentRoom.dynamicId,
        cp: [],
      });
    });
  });

  return Promise.all(promise).then(() => {
    return building;
  });
}

export async function getSoloCpAsync(id, cp) {
  const buildingId = localStorage.getItem('idBuilding');
  // const requestUrl = `${path}node/${id}/control_endpoint_list`;
  const result = await HTTP.get(
    `/building/${buildingId}/node/${id}/control_endpoint_list`
  );
  const body = result.data;
  var res;
  if (body.length > 0)
    res = body[0].endpoints.find((t) => {
      return t.name == cp;
    });
  return res;
}

export async function getControlEndpointsByNameAsync(cp, building) {
  let cpTable = {
    name: cp,
    data: [],
    equiped: 0,
    maintainance: 0,
    noSensor: 0,
  };
  if (cp && building) {
    await getSoloCpAsync(building.id, cp).then((v) => {
      if (v) {
        cpTable.data.push({
          name: building.name,
          id: building.id,
          currentValue: v.currentValue,
          floor: '-',
        });
      }
    });

    for (let i = 0; i < building.children.length; i++) {
      await getSoloCpAsync(building.children[i].id, cp).then(async (v) => {
        if (v) {
          cpTable.data.push({
            name: '-',
            id: building.children[i].id,
            currentValue: v.currentValue,
            floor: building.children[i].name,
          });
          for (let j = 0; j < building.children[i].children.length; j++) {
            await getSoloCpAsync(building.children[i].children[j].id, cp).then(
              (v1) => {
                if (v1 && v1.currentValue == 0) cpTable.maintainance += 1;
                else if (v1) {
                  cpTable.equiped += 1;
                  cpTable.data.push({
                    name: building.children[i].children[j].name,
                    id: building.children[i].children[j].id,
                    currentValue: v1.currentValue,
                    floor: building.children[i].name,
                  });
                } else cpTable.noSensor += 1;
              }
            );
          }
        }
      });
    }
  }
  return cpTable;
}

/**
 * Get groupContext
 * @param path as array
 * @returns list of the specified tree
 */
export async function getContextTreeSpeed(context, path) {
  const buildingId = localStorage.getItem('idBuilding');
  let result = await HTTP.get(`/building/${buildingId}/groupContext/list`);
  const commissioningDynamicId = result.data.find((t) => {
    return t.name == context;
  }).dynamicId;
  result = await HTTP.get(
    `/building/${buildingId}/groupContext/${commissioningDynamicId}/tree`
  );
  // TODO
  // Make it recursive
  result = result.data.children
    .find((t) => {
      return t.name == 'Analyse';
    })
    .children.find((t) => {
      return t.name == 'Multicapteurs';
    }).children;
  result = result.map((element) => {
    return { dynamicId: element.dynamicId, name: element.name };
  });
  let promises = [];

  for (let index = 0; index < result.length; index++) {
    // a = await (await HTTP.get(`/building/${buildingId}/node/${result[index].dynamicId}/control_endpoint_list`)).data.datas[0].endpoints;
    promises.push(
      HTTP.get(
        `/building/${buildingId}/node/${result[index].dynamicId}/control_endpoint_list`
      )
    );
  }

  return { availabilityArray: [10, 10, 10, 10] };
}


export async function getContextTree(context, path) {
  let availabilityArray = [0, 0, 0];
  let namingConventionArray = [0, 0, 0, 0];
  const buildingId = localStorage.getItem('idBuilding');
  let result = await HTTP.get(`/building/${buildingId}/groupContext/list`);
  const commissioningDynamicId = result.data.find((t) => {
    return t.name == context;
  }).dynamicId;
  result = await HTTP.get(
    `/building/${buildingId}/groupContext/${commissioningDynamicId}/tree`
  );
  // TODO
  // Make it recursive
  result = result.data.children
    .find((t) => {
      return t.name == 'Analyse';
    })
    .children.find((t) => {
      return t.name == 'Multicapteurs';
    }).children;
  result = result.map((element) => {
    return { dynamicId: element.dynamicId, name: element.name };
  });
  let a;

  for (let index = 0; index < result.length; index++) {
    a = await (
      await HTTP.get(
        `/building/${buildingId}/node/${result[index].dynamicId}/control_endpoint_list`
      )
    ).data[0].endpoints;
    a.find((element) => {
      if (element.name == 'Convention de nommage') {
        result[index]['naming'] = element.currentValue;
      }
    });
    a.find((element) => {
      if (element.name == 'Taux de données en défaut reçues') {
        result[index]['default'] = element.currentValue;
      }
    });
    a.find((element) => {
      if (element.name == 'Taux de disponibilité') {
        result[index]['availability'] = element.currentValue;
        if (typeof element.currentValue == 'undefined') availabilityArray[1]++;
        else if (element.currentValue < 70) {
          availabilityArray[0]++;
        } else {
          availabilityArray[2]++;
        }
      }
    });
    a.find((element) => {
      if (element.name == 'Monitorability') {
        // OK NOK CONVENTION DE NOMMAGE INCORRECTE DONNÉES NON REMONTÉES
        result[index]['monitorabilityValue'] = element.currentValue;
        if (element.currentValue < 5) {
          result[index]['monitorability'] = 'DONNÉES NON REMONTÉES';
          namingConventionArray[3]++;
        } else if (element.currentValue < 10) {
          result[index]['monitorability'] = 'CONVENTION DE NOMMAGE INCORRECTE';
          namingConventionArray[2]++;
        } else if (element.currentValue < 20) {
          result[index]['monitorability'] = 'NOK';
          namingConventionArray[1]++;
        } else {
          result[index]['monitorability'] = 'OK';
          namingConventionArray[0]++;
        }
      }
    });
  }
  result['availabilityArray'] = availabilityArray;
  result['namingConventionArray'] = namingConventionArray;
  return result;
}
