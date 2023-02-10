import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr'
import { Console } from "console";

// export function prepareTree(tree, equipementName) {
//   results = {};
//   var floorTree = tree.children[0].children;
//   floorTree.forEach(f => {
//     results[f.name] = [];
//     f.children.forEach(r => {
//       r.children.forEach(e => {
//         if (e.name.includes(equipementName)) {
//           results[f.name].push(e.dynamicId);
//         }
//       })
//     })
//   })
//   return results;
// }

// export async function getContextTree() {
//     let availabilityArray = [0, 0, 0];
//     let namingConventionArray = [0, 0, 0, 0];
//     const buildingId = localStorage.getItem("idBuilding");
//     let geographicContextTree = await HTTP.get(`/building/${buildingId}/geographicContext/tree`);
//     let floorEquipements = prepareTree(geographicContextTree.data, 'VE_GTIE_GTB_GTB_MULTICAPTEUR');

//     let result = await HTTP.get(`/building/${buildingId}/groupContext/list`);
//     const commissioningDynamicId = result.data.find((t) => {
//       return t.name == 'Analyse commissioning GTB';
//     }).dynamicId;
//     result = await HTTP.get(
//       `/building/${buildingId}/groupContext/${commissioningDynamicId}/tree`
//     );
//     // TODO
//     // Make it recursive
//     result = result.data.children
//       .find((t) => {
//         return t.name == "Analyse";
//       })
//       .children.find((t) => {
//         return t.name == "Multicapteurs";
//       }).children;
//       console.l
//     result = result.map((element) => {
//       for (const key in floorEquipements) {
//         if (floorEquipements[key].includes(element.dynamicId)) {
//           return {dynamicId: element.dynamicId, name: element.name, floor: key};
//         }
//       }
//       return { dynamicId: element.dynamicId, name: element.name };
//     });
//     let a;
//     let floor;
//     for (let index = 0; index < result.length; index++) {
//       a = await (
//         await HTTP.get(
//           `/building/${buildingId}/node/${result[index].dynamicId}/control_endpoint_list`
//         )
//       ).data[0].endpoints;
//       a.find((element) => {
//         if (element.name == "Convention de nommage") {
//           // console.log(a[i].currentValue, 'VS', element.currentValue);
//           result[index]["naming"] = element.currentValue;
//         }
//       });
//       a.find((element) => {
//         if (element.name == "Taux de données en défaut reçues") {
//           result[index]["default"] = element.currentValue;
//         }
//       });
//       a.find((element) => {
//         if (element.name == "Taux de disponibilité") {
//           result[index]["availability"] = element.currentValue;
//           if (typeof element.currentValue == "undefined") availabilityArray[1]++;
//           else if (element.currentValue < 70) {
//             availabilityArray[0]++;
//           } else {
//             availabilityArray[2]++;
//           }
//         }
//       });
//       a.find((element) => {
//         if (element.name == "Monitorability") {
//           // OK NOK CONVENTION DE NOMMAGE INCORRECTE DONNÉES NON REMONTÉES
//           result[index]["monitorabilityValue"] = element.currentValue;
//           if (element.currentValue < 5) {
//             result[index]["monitorability"] = "DONNÉES NON REMONTÉES";
//             namingConventionArray[3]++;
//           } else if (element.currentValue < 10) {
//             result[index]["monitorability"] = "CONVENTION DE NOMMAGE INCORRECTE";
//             namingConventionArray[2]++;
//           } else if (element.currentValue < 20) {
//             result[index]["monitorability"] = "NOK";
//             namingConventionArray[1]++;
//           } else {
//             result[index]["monitorability"] = "OK";
//             namingConventionArray[0]++;
//           }
//         }
//       });
//     }
//     result["availabilityArray"] = availabilityArray;
//     result["namingConventionArray"] = namingConventionArray;
//     return result;
// }

// export async function getAllBuildings() {
//   let buildingList = [];
//   const patrimoine = localStorage.getItem("patrimoine");
//   let patrimoineObject = JSON.parse(patrimoine);
//   for (let i = 0; i < patrimoineObject.buildings.length; i++) {
//     buildingList.push(patrimoineObject.buildings[i].id)
//   }
//   return buildingList;
// }

// export async function getConsumption(period, controlEndpoint, buildingList) {
//   var tableRows = [];
//   var start, qstart, end, qend;
//   var dataLegend = [];
//   var dataTimestamps = [];
//   var dataArray;
//   moment.locale("fr");
//   end = moment().valueOf();
//   qend = moment().format('DD-MM-yyyy hh:MM:ss');
//   if (period == 'Semaine') {
//     start = moment().startOf('day').subtract(6, 'days').valueOf();
//     qstart = moment().startOf('day').subtract(6, 'days').format('DD-MM-yyyy hh:MM:ss');
//     dataArray = new Array(7).fill(0);
//     for (let i = 0; i < 7; i++) {
//       dataTimestamps.push(moment(start).add(i+1, 'days').valueOf());
//       dataLegend.push(moment(start).add(i, 'days').format('dddd'));
//     }
//   }
//   else if (period == 'Mois') {
//     start = moment().startOf('day').subtract(29, 'days').valueOf();
//     qstart = moment().startOf('day').subtract(29, 'days').format('DD-MM-yyyy hh:MM:ss');
//     dataArray = new Array(30).fill(0);
//     for (let i = 0; i < 30; i++) {
//       dataTimestamps.push(moment(start).add(i+1, 'days').valueOf());
//       dataLegend.push(moment(start).add(i, 'days').format('DD MMM'));
//     }
//   }
//   else if (period == 'Annee') {
//     start = moment().startOf('month').subtract(11, 'months').valueOf();
//     qstart = moment().startOf('month').subtract(11, 'months').format('DD-MM-yyyy hh:MM:ss');
//     dataArray = new Array(12).fill(0);
//     for (let i = 0; i < 12; i++) {
//       dataTimestamps.push(moment(start).add(i+1, 'months').valueOf());
//       dataLegend.push(moment(start).add(i, 'months').format('MMMM'));
//     }
//   }
//   else if (period == 'Decennie') {
//     start = moment().startOf('year').subtract(9, 'years').valueOf();
//     qstart = moment().startOf('year').subtract(9, 'years').format('DD-MM-yyyy hh:MM:ss');
//     dataArray = new Array(10).fill(0);
//     for (let i = 0; i < 10; i++) {
//       dataTimestamps.push(moment(start).add(i+1, 'years').valueOf());
//       dataLegend.push(moment(start).add(i, 'years').format('YYYY'));
//     }
//   }

//   // Then get for each building the consumption during that period
//   let building, cpList, id, timeSeries;
//   for (let i = 0; i < buildingList.length; i++) {
//     building = await HTTP.get(`/building/${buildingList[i]}/building/read`);
//     cpList = await HTTP.get(`/building/${buildingList[i]}/node/${building.data.dynamicId}/control_endpoint_list`);
//     id = cpList.data[0].endpoints.find(e => e.name == controlEndpoint).dynamicId;
//     timeSeries = await HTTP.get(`/building/${buildingList[i]}/endpoint/${id}/timeSeries/read/${qstart}/${qend}`);
//     let samples = timeSeries.data.length;
//     for (let i = 0; i < samples; i++) {
//       for (let j = 0; j < dataTimestamps.length; j++) {
//         if (timeSeries.data[i].date < dataTimestamps[j]) {
//           dataArray[j] += timeSeries.data[i].value;
//           break;
//         }
//       }
//     }
//     tableRows[i] = {'name': building.data.name, 'surface': building.data.area, 'day': 0, 'week': 0, 'lastWeek': 0, 'month': 0, 'lastMonth': 0, 'year': 0, 'lastYear': 0};
//   }
//   return [dataLegend, dataArray, tableRows];
// }

// export async function getPayload(start, end, buildingStaticId, cpDynamicId, tf, period) {
//   moment.locale("fr");
//   var dataLegend = [];
//   var dataTimestamps = [];
//   var dataArray;
//   let qstart = moment().startOf(start.unit).add(start.steps, start.unit).format('DD-MM-yyyy HH:mm:ss');
//   let qend = moment().endOf(end.unit).add(end.steps, end.unit).format('DD-MM-yyyy HH:mm:ss');
//   let timeSeries = await HTTP.get(`/building/${buildingStaticId}/endpoint/${cpDynamicId}/timeSeries/read/${qstart}/${qend}`);
//   if (!tf) {
//     return timeSeries.data.reduce((total, val) => total + val.value, 0);
//   }
//   else {
//     if (period == 'Semaine') {
//       start = moment().startOf('day').subtract(6, 'days').valueOf();
//       dataArray = new Array(7).fill(0);
//       for (let i = 0; i < 7; i++) {
//         dataTimestamps.push(moment(start).add(i+1, 'days').valueOf());
//         dataLegend.push(moment(start).add(i, 'days').format('dddd'));
//       }
//     }
//     else if (period == 'Mois') {
//       start = moment().startOf('day').subtract(29, 'days').valueOf();
//       dataArray = new Array(30).fill(0);
//       for (let i = 0; i < 30; i++) {
//         dataTimestamps.push(moment(start).add(i+1, 'days').valueOf());
//         dataLegend.push(moment(start).add(i, 'days').format('DD MMM'));
//       }
//     }
//     else if (period == 'Annee') {
//       start = moment().startOf('month').subtract(11, 'months').valueOf();
//       dataArray = new Array(12).fill(0);
//       for (let i = 0; i < 12; i++) {
//         dataTimestamps.push(moment(start).add(i+1, 'months').valueOf());
//         dataLegend.push(moment(start).add(i, 'months').format('MMMM'));
//       }
//     }
//     else if (period == 'Decennie') {
//       start = moment().startOf('year').subtract(9, 'years').valueOf();
//       dataArray = new Array(10).fill(0);
//       for (let i = 0; i < 10; i++) {
//         dataTimestamps.push(moment(start).add(i+1, 'years').valueOf());
//         dataLegend.push(moment(start).add(i, 'years').format('YYYY'));
//       }
//     }
//     let samples = timeSeries.data.length;
//     for (let i = 0; i < samples; i++) {
//       for (let j = 0; j < dataTimestamps.length; j++) {
//         if (timeSeries.data[i].date < dataTimestamps[j]) {
//           dataArray[j] += timeSeries.data[i].value;
//           break;
//         }
//       }
//     }
//     return [timeSeries.data.reduce((total, val) => total + val.value, 0), [dataLegend, dataArray]]
//   }
// }

// // export async function getData(data, period, buildingList, controlEndpoint) {
// //   moment.locale("fr");
// //   let payload;
// //   let row;
// //   let buildingStaticId;
// //   let cpList;
// //   let cpDynamicId;
// //   let start, end = {}
// //   for (let i = 0; i < buildingList.length; i++) {
// //     buildingStaticId = buildingList[i];
// //     row = data[i];
// //     if (!row || !row['name'] || !row['area'] || !row['dynamicId'] || !row['week'] || !row['lastWeek']) {
// //       row = {};
// //       let building = await HTTP.get(`/building/${buildingStaticId}/building/read`);
// //       row['name'] = building.data.name;
// //       row['area'] = building.data.area;
// //       row['dynamicId'] = building.data.dynamicId;
// //       cpList = await HTTP.get(`/building/${buildingStaticId}/node/${building.data.dynamicId}/control_endpoint_list`);
// //       cpDynamicId = cpList.data[0].endpoints.find(e => e.name == controlEndpoint).dynamicId;

// //       start = {steps: '-13', unit: 'day'};
// //       end = {steps: '-7', unit: 'day'};
// //       row['lastWeek'] = getPayload(start, end, buildingStaticId, cpDynamicId, false, 'Semaine');

// //       start = {steps: '-6', unit: 'day'};
// //       end = {steps: '0', unit: 'day'};
// //       payload = await getPayload(start, end, buildingStaticId, cpDynamicId, true, 'Semaine');
// //       row['week'] = payload[0];
// //       row['weekArray'] = payload[1];
// //       console.log(row)
// //       data[i] = row;
// //     }
// //   }
// //   console.log(data);
// //   return data;
// // }


function getPeriodArray(timestamp, period) {
  if (period === 'Mois') {
    var startOfMonth = moment(timestamp).startOf('month');
    var endOfMonth = moment(timestamp).endOf('month');
    var daysInMonth = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      daysInMonth.push(currentDay.format('DD MMM'));
      currentDay.add(1, 'day');
    }
    return [daysInMonth, moment(timestamp).startOf('month').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('month').format('DD-MM-yyyy HH:mm:ss')];
  } else if (period === 'Année') {
    var monthsInYear = [];
    for (var i = 0; i < 12; i++) {
      var currentMonth = moment(timestamp).month(i);
      monthsInYear.push(currentMonth.format('MMM'));
    }
    return [monthsInYear, moment(timestamp).startOf('year').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss')];
  } else {
    return [];
  }
}


export async function getData(timestamp, period, buildings, cp) {
  let periodArray = getPeriodArray(timestamp, period);
  let label = periodArray[0];
  let data = [];
  let stats = {totalArea: 0, buildings: 0, totalConsumption: 0, totalConsumptionSquareMeter: 0};
  let row = {};
  let cpList, cpDynamicId, timeSeries;
  for (let i = 0; i < buildings.length; i++) {
    row = {};
    let building = await HTTP.get(`/building/${buildings[i].id}/building/read`);
    row['name'] = building.data.name;
    row['area'] = building.data.area;
    row['dynamicId'] = building.data.dynamicId;
    row['staticId'] = buildings[i].id;
    cpList = await HTTP.get(`/building/${row['staticId']}/node/${row['dynamicId']}/control_endpoint_list`);
    cpDynamicId = cpList.data[0].endpoints.find(e => e.name == cp).dynamicId;
    timeSeries = await HTTP.get(`/building/${row['staticId']}/endpoint/${cpDynamicId}/timeSeries/read/${periodArray[1]}/${periodArray[2]}`);
    row['timeSeries'] = timeSeries.data;

    let processedTimeSeries = [];
    if (period === 'Mois') {
      label.forEach(day => {
        processedTimeSeries.push(
          row['timeSeries'].filter(elem => moment(elem.date).format('DD MMM') === day)
            .reduce((sum, elem) => sum + elem.value, 0)
        );
      });
    } else if (period === 'Année') {
      label.forEach(month => {
        processedTimeSeries.push(
          row['timeSeries'].filter(elem => moment(elem.date).format('MMM') === month)
            .reduce((sum, elem) => sum + elem.value, 0)
        );
      });
    } else {
      processedTimeSeries = row['timeSeries'];
    }
    row['timeSeries'] = processedTimeSeries;
    row['sum'] = processedTimeSeries.reduce((a,b) => a+b,0);
    row['squareMeter'] = (row['sum']/row['area']);
    stats.totalArea += row['area'];
    stats.buildings++;
    stats.totalConsumption += row['sum'];
    stats.totalConsumptionSquareMeter += row['squareMeter'];
    data.push(row);
  }

  return [label, data, stats];
}



/*

export async function getData(timestamp, period, buildings, cp) {
  let periodArray = getPeriodArray(timestamp, period);
  let label = periodArray[0]
  let data = [];
  let row = {};
  let cpList, cpDynamicId, timeSeries;
  for (let i = 0; i < buildings.length; i++) {
    row = {};
    let building = await HTTP.get(`/building/${buildings[i].id}/building/read`);
    row['name'] = building.data.name;
    row['area'] = building.data.area;
    row['dynamicId'] = building.data.dynamicId;
    row['staticId'] = buildings[i].id;
    cpList = await HTTP.get(`/building/${row['staticId']}/node/${row['dynamicId']}/control_endpoint_list`);
    cpDynamicId = cpList.data[0].endpoints.find(e => e.name == cp).dynamicId;
    console.log(`Getting from ${periodArray[1]} to ${periodArray[2]}`);
    timeSeries = await HTTP.get(`/building/${row['staticId']}/endpoint/${cpDynamicId}/timeSeries/read/${periodArray[1]}/${periodArray[2]}`);
    for (let i = 0; i< timeSeries.data.length; i++) {
      console.log(moment(timeSeries.data[i].date).format('DD MMM'))
    }
    // if (period === 'Mois') {
    //   let dailyData = {};
    //   for (let i = 0; i < timeSeries.data.length; i++) {
    //     let date = moment(timeSeries.data[i].timestamp).format('DD MMM');
    //     console.log(date);
    //     if (!dailyData[date]) {
    //       dailyData[date] = timeSeries.data[i].value;
    //     } else {
    //       dailyData[date] += timeSeries.data[i].value;
    //     }
    //   }
    
    //   let processedData = [];
    //   for (let i = 0; i < label.length; i++) {
    //     let date = label[i].date;
    //     processedData.push({
    //       date: date,
    //       value: dailyData[date] ? dailyData[date] : 0
    //     });
    //   }
    //   row['data'] = processedData;
    // }
    // console.log(row);
    data.push(row);
  }
}

*/