import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr';

export async function getBuilding(cp) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`building/${buildingId}/building/read`);
  let cpList = await HTTP.get(`building/${buildingId}/node/${result.data.dynamicId}/control_endpoint_list`);
  for (let j = 0; j < cpList.data.length; j++) {
    for (let i = 0; i < cpList.data[j].endpoints.length; i++) {
      if (cpList.data[j].endpoints[i].name === cp[0].name) {
        result.data.cp = cpList.data[j].endpoints[i].dynamicId;
      }
    }
  }
  return result.data;
}

export async function getFloors(cp) {
  let floorList = [];
  let roomList = [];
  const buildingId = localStorage.getItem('idBuilding');
  // get all floors
  const result = await HTTP.get(`building/${buildingId}/floor/list`);
  // for each floor get its cp names
  let promises = result.data.map(async (floor) => {
    floorList.push({name: floor.name, staticId: floor.staticId, dynamicId: floor.dynamicId});
    let currentFloorRoomList = await HTTP.get(`building/${buildingId}/floor/${floor.dynamicId}/room_list`);
    let cpList = await HTTP.get(`building/${buildingId}/node/${floor.dynamicId}/control_endpoint_list`);
    for (let j = 0; j < cpList.data.length; j++) {
      for (let i = 0; i < cpList.data[j].endpoints.length; i++) {
        // if there is a match add floor to array + area + cp id
        if (cpList.data[j].endpoints[i].name === cp[0].name) {
          let area = await HTTP.get(`building/${buildingId}/node/${floor.dynamicId}/attributsList`);
          area = area.data[0].attributs[area.data[0].attributs.findIndex(e => e.label === 'area')].value;
          floor.area = area;
          floor.cp = cpList.data[j].endpoints[i].dynamicId;
          return floor
        }
      }
    }
    return null;
  });
  let values = await Promise.all(promises);
  let filteredValues = values.filter((value) => value !== null);
  return floorList;
}


export async function getBuildingEndpoints() {
  const cpName = "Dioxyde de carbone";
  try {
    let selectorFloorList = [];
    const buildingId = localStorage.getItem('idBuilding');
    const floorListResponse = HTTP.get(`building/${buildingId}/floor/list`);
    const floorList = await floorListResponse;
    const roomListPromises = floorList.data.map(async floor => {
      selectorFloorList.push({name: floor.name, staticId: floor.staticId, dynamicId: floor.dynamicId});
      const roomListResponse = await HTTP.get(`building/${buildingId}/floor/${floor.dynamicId}/room_list`);
      const roomList = roomListResponse.data;
      const roomPromises = roomList.map(async room => {
        const endpointResponse = await HTTP.get(`building/${buildingId}/node/${room.dynamicId}/control_endpoint_list`);
        const endpoints = endpointResponse.data;
        return {
          floorName: floor.name,
          floorDynamicId: floor.dynamicId,
          roomName: room.name,
          roomDynamicId: room.dynamicId,
          endpoints: endpoints.find(obj => obj.endpoints.some(endpoint => endpoint.name === cpName))?.endpoints.find(obj => obj.name === cpName)
        };
      });
      return Promise.all(roomPromises);
    });
    const roomLists = await Promise.all(roomListPromises);
    const flattenedRooms = roomLists.flat().filter(item => item.hasOwnProperty('endpoints') && item.endpoints !== undefined);;
    return [selectorFloorList, flattenedRooms]
  } catch (error) {
    console.error('An error occurred during API calls:', error);
    throw error;
  }
}
