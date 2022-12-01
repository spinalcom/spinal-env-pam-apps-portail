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
// var tk = require('timekeeper');
// var time = new Date(1656107319743);

// tk.freeze(time);
import { HTTP } from "./http-constant";
import dateFormat from "dateformat";

// durée de relevé des time séries : 10 ans
const today = new Date();
const end = dateFormat(today, "dd-mm-yyyy hh:MM:ss");
const begin = dateFormat(
  new Date(today.getFullYear() - 10, today.getMonth()),
  "dd-mm-yyyy hh:MM:ss"
);

// Contexte spatial du bâtiment(bâtiment, étages et pièces)
export async function getBuildingAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/geographicContext/space`
  );
  const body = result.data.body ? result.data.body : result.data;
  return body.children.find((b) => b.type == "geographicBuilding");
}

// Points de contrôle
export async function getNodeControlEndpointsListAsync(nodeId) {
  const buildingId = localStorage.getItem("idBuilding");
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
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/endpoint/${endpointId}/timeSeries/read/${begin}/${end}`
  );
  return result.data;
}

// Tickets de maintenances
export async function getTicketWorkflowAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`/building/${buildingId}/workflow/list`);
  return result.data[0];
}

export async function getWorkflowTreeAsync(workflowId) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/workflow/${workflowId}/tree`
  );
  return result.data;
}

export async function getTicketDetailsAsync(ticketId) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/ticket/${ticketId}/read_details`
  );
  return result.data;
}

/**
 * Get Building's general information
 *
 * @return {Building.<{id: Number, name: String, cp: [], children: Array.<{id: Number, name: String, cp: [], children: Array.<{id: Number, name: String, cp: [],}>}>}>} building
 */
export async function getBuildingAsyncV2() {
  const buildingId = localStorage.getItem("idBuilding");
  let building = {};
  let body = await getBuildingAsync();
  building.name = body.name;
  building.dynamicId = body.dynamicId;
  building.area = body.area;
  building.cp = [];
  // requestUrl = `${path}floor/list`;
  // result = await HTTP.get(`/building/${buildingId}/floor_list`);//  await axios.get(requestUrl);
  body = body.children;
  building.children = [];
  body.map((currentFloor) => {
    building.children.push({
      name: currentFloor.name,
      dynamicId: currentFloor.dynamicId,
      children: [],
      cp: [],
    });
  });

  let promise = building.children.map(async (currentFloor) => {
    // requestUrl = `${path}floor/${currentFloor.id}/room_list`;
    const result = await HTTP.get(
      `/building/${buildingId}/floor/${currentFloor.dynamicId}/room_list`
    );
    body = result.data;
    body.map((currentRoom) => {
      var foundIndex = building.children.findIndex(
        (x) => x.dynamicId == currentFloor.dynamicId
      );
      building.children[foundIndex].children.push({
        name: currentRoom.name,
        dynamicId: currentRoom.dynamicId,
        cp: [],
      });
    });
  });

  return Promise.all(promise).then(() => {
    return building;
  });
}

export async function getSoloCpAsync(id, cp) {
  const buildingId = localStorage.getItem("idBuilding");
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
    await getSoloCpAsync(building.dynamicId, cp).then((v) => {
      if (v) {
        cpTable.data.push({
          name: building.name,
          dynamicId: building.dynamicId,
          currentValue: v.currentValue,
          floor: "-",
        });
      }
    });

    for (let i = 0; i < building.children.length; i++) {
      await getSoloCpAsync(building.children[i].dynamicId, cp).then(
        async (v) => {
          if (v) {
            cpTable.data.push({
              name: "-",
              dynamicId: building.children[i].dynamicId,
              currentValue: v.currentValue,
              floor: building.children[i].name,
            });
          }
            for (let j = 0; j < building.children[i].children.length; j++) {
              await getSoloCpAsync(
                building.children[i].children[j].dynamicId,
                cp
              ).then((v1) => {
                if (v1 && v1.currentValue == 0) cpTable.maintainance += 1;
                else if (v1) {
                  cpTable.equiped += 1;
                  cpTable.data.push({
                    name: building.children[i].children[j].name,
                    dynamicId: building.children[i].children[j].dynamicId,
                    currentValue: v1.currentValue,
                    floor: building.children[i].name,
                  });
                } else cpTable.noSensor += 1;
              });
            }
          
        }
      );
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
  const buildingId = localStorage.getItem("idBuilding");
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
      return t.name == "Analyse";
    })
    .children.find((t) => {
      return t.name == "Multicapteurs";
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
  // a.find(((element, i) => {
  //   if(element.name=='Convention de nommage'){
  //     // console.log(a[i].currentValue, 'VS', element.currentValue);
  //     result[index]['naming'] = element.currentValue;
  //   }
  // }
  // ));
  //   a.find((element => {if(element.name=='Taux de données en défaut reçues'){result[index]['default'] =  element.currentValue}}));
  //   a.find((element => {if(element.name=='Taux de disponibilité'){result[index]['availability'] =  element.currentValue}}));
  //   a.find((element => {if(element.name=='Monitorability'){
  //     // OK NOK CONVENTION DE NOMMAGE INCORRECTE DONNÉES NON REMONTÉES
  //     if(element.currentValue<25){
  //       result[index]['monitorability'] =  'DONNÉES NON REMONTÉES';
  //       availabilityArray[0]++;
  //     }
  //       else if(element.currentValue<50){
  //         result[index]['monitorability'] =  'CONVENTION DE NOMMAGE INCORRECTE';
  //         availabilityArray[1]++;
  //       }
  //         else if(element.currentValue<75){
  //           result[index]['monitorability'] =  'NOK';
  //           availabilityArray[2]++;
  //         }
  //           else{
  //             result[index]['monitorability'] =  'OK';
  //             availabilityArray[3]++;
  //           }
  //   }}));

  // }
  // result['availabilityArray'] = availabilityArray;
  // const results = await allProgress(Promise.all(promises),
  //       (progress) => {
  //           console.log(`% Done = ${progress.toFixed(2)}`);
  //       });
  // console.log(results);

  return { availabilityArray: [10, 10, 10, 10] };
}

// function allProgress(proms, progress_cb) {
//   let d = 0;
//   progress_cb(0);
//   for (const p of proms) {
//     p.then(()=> {
//       d ++;
//       progress_cb( (d * 100) / proms.length );
//     });
//   }
//   return Promise.all(proms);
// }

export async function getContextTree(context, path) {
  let availabilityArray = [0, 0, 0];
  let namingConventionArray = [0, 0, 0, 0];
  const buildingId = localStorage.getItem("idBuilding");
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
      return t.name == "Analyse";
    })
    .children.find((t) => {
      return t.name == "Multicapteurs";
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
      if (element.name == "Convention de nommage") {
        // console.log(a[i].currentValue, 'VS', element.currentValue);
        result[index]["naming"] = element.currentValue;
      }
    });
    a.find((element) => {
      if (element.name == "Taux de données en défaut reçues") {
        result[index]["default"] = element.currentValue;
      }
    });
    a.find((element) => {
      if (element.name == "Taux de disponibilité") {
        result[index]["availability"] = element.currentValue;
        if (typeof element.currentValue == "undefined") availabilityArray[1]++;
        else if (element.currentValue < 70) {
          availabilityArray[0]++;
        } else {
          availabilityArray[2]++;
        }
      }
    });
    a.find((element) => {
      if (element.name == "Monitorability") {
        // OK NOK CONVENTION DE NOMMAGE INCORRECTE DONNÉES NON REMONTÉES
        result[index]["monitorabilityValue"] = element.currentValue;
        if (element.currentValue < 5) {
          result[index]["monitorability"] = "DONNÉES NON REMONTÉES";
          namingConventionArray[3]++;
        } else if (element.currentValue < 10) {
          result[index]["monitorability"] = "CONVENTION DE NOMMAGE INCORRECTE";
          namingConventionArray[2]++;
        } else if (element.currentValue < 20) {
          result[index]["monitorability"] = "NOK";
          namingConventionArray[1]++;
        } else {
          result[index]["monitorability"] = "OK";
          namingConventionArray[0]++;
        }
      }
    });
  }
  result["availabilityArray"] = availabilityArray;
  result["namingConventionArray"] = namingConventionArray;
  return result;
}
