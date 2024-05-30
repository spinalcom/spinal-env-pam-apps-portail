import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr'
import config from '../config.js'
import { floor } from "lodash";

//fonction pour les taux
function processTimeSeriesTaux(timeSeriesbat, label1, period) {
  let timeSeriesbat1 = timeSeriesbat.data;
  let processedTimeSeries1 = [];

  function calculateWeightedAverage(dataArray, times) {
    if (dataArray.length != 0) {
      let totalWeight = 0;
      let weightedSum = 0;

      for (let i = 0; i < dataArray.length - 1; i++) {
        let weight = 0
        if (times == 'day')
          weight = (dataArray[i + 1].date - dataArray[i].date) / 86400000;
        else if (times == 'month')
          weight = (dataArray[i + 1].date - dataArray[i].date) / 2629800000;
        else
          weight = (dataArray[i + 1].date - dataArray[i].date) / 31536000000;
        totalWeight += weight;
        weightedSum += weight * dataArray[i].value;
      }
      // Poids pour le dernier élément
      if (times == 'day') {
        totalWeight += 1 / 24;
        weightedSum += (1 / 24) * dataArray[dataArray.length - 1].value;
      }
      else if (times == 'month') {
        totalWeight += 1 / 730.5;
        weightedSum += (1 / 730.5) * dataArray[dataArray.length - 1].value;
      } else {
        totalWeight += 1 / 8766;
        weightedSum += (1 / 8766) * dataArray[dataArray.length - 1].value;
      }
      return weightedSum / totalWeight;
    } else {
      return null
    }
  }

  if (period === 'Mois') {
    label1.forEach(day => {
      processedTimeSeries1.push(
        calculateWeightedAverage(timeSeriesbat1.filter(elem => moment(elem.date).format('DD MMM') === day), 'day')
      );
    });
  } else if (period === 'Année') {
    // console.log('le label 1ressemble a ceci ', timeSeriesbat1);
    label1.forEach(month => {
      processedTimeSeries1.push(
        calculateWeightedAverage(timeSeriesbat1.filter(elem => moment(elem.date).format('MMM') === month), 'month')
      );
    });
  } else if (period === 'Décennie') {
    label1.forEach(year => {
      processedTimeSeries1.push(
        calculateWeightedAverage(timeSeriesbat1.filter(elem => moment(elem.date).format('YYYY') === year), 'year')
      );
    });
  } else if (period === '3 mois') {
    label1.forEach(day => {
      processedTimeSeries1.push(
        calculateWeightedAverage(timeSeriesbat1.filter(elem => moment(elem.date).format('DD MMM') === day), 'day')
      );
    });
  }
  else if (period === 'Semaine') {
    label1.forEach(day => {
      processedTimeSeries1.push(
        calculateWeightedAverage(timeSeriesbat1.filter(elem => moment(elem.date).format('DD MMM') === day), 'day')
      );
    });
  }
  else if (period === 'Jour') {
    label1.forEach(hour => {
      const targetHour = parseInt(hour.split(':')[0], 10);
      processedTimeSeries1.push(
        calculateWeightedAverage(timeSeriesbat1.filter(elem =>
          parseInt(moment(elem.date).format('HH'), 10) === targetHour), 'day')
      );
    });
  }
  else {
    processedTimeSeries1 = timeSeriesbat1;
  }
  return processedTimeSeries1;
}

//fonction pour les sommes
function processTimeSeries(timeSeriesbat, label1, period) {

  let timeSeriesbat1 = timeSeriesbat.data
  let processedTimeSeries1 = [];
  if (period === 'Mois') {
    label1.forEach(day => {
      processedTimeSeries1.push(
        timeSeriesbat1.filter(elem => moment(elem.date).format('DD MMM') === day)
          .reduce((sum, elem) => sum + elem.value, 0)
      );
    });
  } else if (period === 'Année') {
    label1.forEach(month => {
      processedTimeSeries1.push(
        timeSeriesbat1.filter(elem => moment(elem.date).format('MMM') === month)
          .reduce((sum, elem) => sum + elem.value, 0)
      );
    });
  } else if (period === 'Décennie') {
    label1.forEach(year => {
      processedTimeSeries1.push(
        timeSeriesbat1.filter(elem => moment(elem.date).format('YYYY') === year)
          .reduce((sum, elem) => sum + elem.value, 0)
      );
    });
  }
  else if (period === 'Jour') {
    label1.forEach(hour => {
      processedTimeSeries1.push(
        timeSeriesbat1.filter(elem => moment(elem.date).format('HH:mm') === hour)
          .reduce((sum, elem) => sum + elem.value, 0)
      );
    });
  }
  else if (period === 'Semaine') {
    label1.forEach(week => {
      processedTimeSeries1.push(
        timeSeriesbat1.filter(elem => moment(elem.date).format('DD MMM') === week)
          .reduce((sum, elem) => sum + elem.value, 0)
      );
    });
  }
  else if (period === '3 mois') {
    label1.forEach(day => {
      processedTimeSeries1.push(
        timeSeriesbat1.filter(elem => moment(elem.date).format('DD MMM') === day)
          .reduce((sum, elem) => sum + elem.value, 0)
      );
    });
  } else {
    processedTimeSeries1 = timeSeriesbat1;
  }

  return processedTimeSeries1
}

function getPeriodArray(timestamp, period) {
  if (period === 'Mois') {
    var startOfMonth = moment(timestamp).startOf('month');
    var endOfMonth = moment(timestamp).endOf('month');
    var daysInMonth = [];
    var tooltipDate = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      daysInMonth.push(currentDay.format('DD MMM'));
      tooltipDate.push(moment(currentDay).format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() + moment(currentDay).format('ddd DD/MM/YYYY').slice(1));
      currentDay.add(1, 'day');
    }
    return [daysInMonth, moment(timestamp).startOf('month').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('month').format('DD-MM-yyyy HH:mm:ss'), tooltipDate];
  } else if (period === 'Année') {
    var monthsInYear = [];
    var tooltipDate = [];
    for (var i = 0; i < 12; i++) {
      var currentMonth = moment(timestamp).month(i);
      monthsInYear.push(currentMonth.format('MMM'));
      tooltipDate.push(moment(currentMonth).format('MMMM/YYYY').slice(0, 1).toUpperCase() + moment(currentMonth).format('MMMM/YYYY').slice(1));
    }
    return [monthsInYear, moment(timestamp).startOf('year').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss'), tooltipDate];
  } else if (period === 'Décennie') {
    var yearsInDecade = [];
    var tooltipDate = [];
    for (var i = -9; i <= 0; i++) {
      var currentYear = moment(timestamp).add(i, 'years');
      tooltipDate.push(moment(currentYear).format('YYYY').slice(0, 1).toUpperCase() + moment(currentYear).format('YYYY').slice(1));
      yearsInDecade.push(currentYear.format('YYYY'));
    }
    return [yearsInDecade, moment(timestamp).add(-10, 'years').startOf('year').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss'), tooltipDate];
  } else if (period === '3 mois') {
    var startOfMonth = moment(timestamp).add(-2, 'months').startOf('month');
    var endOfMonth = moment(timestamp).endOf('month');
    var daysIn3Months = [];
    var tooltipDate = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      tooltipDate.push(moment(currentDay).format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() + moment(currentDay).format('ddd DD/MM/YYYY').slice(1));
      daysIn3Months.push(currentDay.format('DD MMM'));
      currentDay.add(1, 'day');
    }
    return [daysIn3Months, moment(timestamp).add(-2, 'months').startOf('month').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('month').format('DD-MM-yyyy HH:mm:ss'), tooltipDate];
  } else if (period === 'Semaine') {
    var startOfWeek = moment(timestamp).startOf('week');
    var endOfWeek = moment(timestamp).endOf('week');
    var daysInWeek = [];
    var tooltipDate = [];
    var currentDay = moment(startOfWeek);
    while (currentDay.isSameOrBefore(endOfWeek)) {
      daysInWeek.push(currentDay.format('DD MMM'));
      tooltipDate.push(moment(currentDay).format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() + moment(currentDay).format('ddd DD/MM/YYYY').slice(1));
      currentDay.add(1, 'day');
    }
    return [daysInWeek, moment(timestamp).startOf('week').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('week').format('DD-MM-yyyy HH:mm:ss'), tooltipDate];
  }
  else if (period === 'Jour') {
    var hoursInDay = [];
    var tooltipDate = [];

    for (var i = 0; i < 24; i++) {
      var currentHour = moment().startOf('day').hour(i);
      hoursInDay.push(currentHour.format('HH:mm'));
      tooltipDate.push(currentHour.format('HH:mm'));
    }

    return [
      hoursInDay,
      moment(timestamp).startOf('day').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('day').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate
    ];
  }

  else {
    return [];
  }
}

export async function getBuildingName(id_batiment) {
  let building = await HTTP.get(`/building/${id_batiment}/building/read`);
  return building.data.name
}


function mergeData(data1,data2)  {

  const merged = [...data1, ...data2].sort((a, b) => a.date - b.date);

  const result = [];
  const data1Values = new Map(data1.map(d => [d.date, d.value]));
  const data2Values = new Map(data2.map(d => [d.date, d.value]));

  let lastData1Value = null;
  let lastData2Value = null;

  // Nouveau: Ensemble pour garder une trace des dates traitées
  const processedDates = new Set();

  for (const item of merged) {
    const date = item.date;

    // Si nous avons déjà traité cette date, nous la sautons
    if (processedDates.has(date)) continue;

    const valueData1 = data1Values.get(date) !== undefined ? data1Values.get(date) : lastData1Value;
    const valueData2 = data2Values.get(date) !== undefined ? data2Values.get(date) : lastData2Value;

    if (valueData1 !== null && valueData2 !== null) {
      result.push({
        date: date,
        value: valueData1,
        value2: valueData2
      });
    }

    if (data1Values.has(date)) {
      lastData1Value = data1Values.get(date);
    }

    if (data2Values.has(date)) {
      lastData2Value = data2Values.get(date);
    }

    // Ajouter la date à notre ensemble
    processedDates.add(date);
  }

  // console.log('data3 insp', result);
  return result;
}


// Exemple d'utilisation


function findClosestPreviousData(data, targetDate) {
  let closest = null;

  for (let item of data) {
    if (item.date <= targetDate) {
      closest = item;
    } else {
      break;
    }
  }

  return closest;
}


// function getScatterData(data1, data2) {

//   console.log('aa',data1);
//   console.log('aa',data2);
//   // if (data1.length ==  undefined || data2.length === undefined) {
//   //   return [];
//   // }

//   // const data1 = [
//   //   { date: 1690840800000, value: 50 },
//   //   { date: 1690844400000, value: 55 },
//   //   { date: 1690848000000, value: 60 },
//   //   { date: 1690851600000, value: 65 },
//   //   { date: 1690855200000, value: 70 }
//   // ];

//   // const data2 = [
//   //   { date: 1690840800000, value: 52 },
//   //   { date: 1690844250000, value: 54 },
//   //   { date: 1690847700000, value: 58 },
//   //   { date: 1690848000000, value: 61 },
//   //   { date: 1690851450000, value: 64 },
//   //   { date: 1690851600000, value: 67 },
//   //   { date: 1690855050000, value: 69 },
//   //   { date: 1690858500000, value: 72 }
//   // ];


//   // Tri des données
//   data1.sort((a, b) => a.date - b.date);
//   data2.sort((a, b) => a.date - b.date);

//   let primaryData, secondaryData;
//   primaryData = data1;
//   secondaryData = data2;

//   let data3 = [];

//   for (let item of primaryData) {
//     const closestItem = findClosestPreviousData(secondaryData, item.date);

//     data3.push({
//       date: item.date,
//       valuePrimary: item.value,
//       valueSecondary: closestItem ? closestItem.value : null
//     });
//   }

//   // Si data2 a plus d'entrées que data1, ajoutez les entrées restantes
//   for (let i = primaryData.length; i < secondaryData.length; i++) {
//     data3.push({
//       date: secondaryData[i].date,
//       valuePrimary: null,
//       valueSecondary: secondaryData[i].value
//     });
//   }

//   return data3;
// }

// Exemple de données
// const data1 = [
//   { date: 1690840800000, value: 62.125 },
//   { date: 1690844400000, value: 65.875 },
//   // ... (d'autres éléments)
// ];

// const data2 = [
//   // Insérez ici vos données pour data2
// ];

// const data3 = mergeData(data1, data2);
// console.log(data3);

// export async function getDataBuilding(timestamp, period, buildings, cp, cp_batiment, id_batiment, color) {
//   const colors1 = ['#ff6384', '#36a2eb', '#4bc0c0', '#ff7b00', '#97BCC7', '#006884'];
//   let row1 = {};
//   let data1 = [];
//   let periodArray1 = getPeriodArray(timestamp, period);
//   let colorIndex1 = 0;
//   let stats1 = { totalArea: 0, buildings: 0, totalConsumption: 0, totalConsumptionSquareMeter: 0 };
//   let surface = await HTTP.get(`/building/${id_batiment}/building/read`);

//   let dynamicId = surface.data.dynamicId;
//   lacpList = await HTTP.get(`/building/${id_batiment}/node/${dynamicId}/control_endpoint_list`);

//   const floors = await HTTP.get(`/building/${id_batiment}/floor/list`);
//   // const floorsInfo = [];
//   let label1 = periodArray1[0];
//   cpDynamicId_bat = lacpList.data[0].endpoints.find(e => e.name == cp_batiment).dynamicId;
//   timeSeriesbat = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_bat}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);


//   let processedTimeSeries1 = processTimeSeries(timeSeriesbat, label1, period);

//   const rowBat = {
//     name: surface.data.name,
//     area: parseInt(surface.data.area),
//     timeSeries: processedTimeSeries1.slice(),
//     sum: processedTimeSeries1.reduce((a, b) => a + b, 0),
//     squareMeter: processedTimeSeries1.reduce((a, b) => a + b, 0) / surface.data.area,
//     color: color,
//     dynamicId: dynamicId,
//     staticId: id_batiment,
//   };
//   stats1.totalArea += parseInt(rowBat['area']);
//   stats1.buildings++;
//   stats1.totalConsumption += rowBat['sum'];
//   stats1.totalConsumptionSquareMeter += rowBat['squareMeter'];

//   data1.push(rowBat);

//   return [label1, data1, stats1, periodArray1[3]];
// }

export async function getData(timestamp, period, space) {

  const id_batiment = localStorage.getItem('idBuilding');
  const cp_batiment1 = config.config.cp1_batiment.name;
  const cp_batiment2 = config.config.cp2_batiment.name;

  // let row1 = {};
  let data1 = [];
  let data2 = [];
  // const floorsInfo = [];
  let periodArray1 = getPeriodArray(timestamp, period);

  // let colorIndex1 = 0;
  let stats1 = { totalArea: 0, buildings: 0, totalConsumption: 0, totalConsumptionSquareMeter: 0 };
  let surface = await HTTP.get(`/building/${id_batiment}/building/read`);
  // console.log(surface, 'la surface');
  let dynamicId = surface.data.dynamicId;
  lacpList = await HTTP.get(`/building/${id_batiment}/node/${dynamicId}/control_endpoint_list`);
  let label1 = periodArray1[0];

  if (space.dynamicId != 0)
    cpListfloor = await HTTP.get(`building/${id_batiment}/node/${space.dynamicId}/control_endpoint_list`);
  else
    cpListfloor = await HTTP.get(`building/${id_batiment}/node/${dynamicId}/control_endpoint_list`);

  cpDynamicId_floor = cpListfloor.data[0].endpoints.find(e => e.name == cp_batiment1).dynamicId;
  cpDynamicId_floor2 = cpListfloor.data[0].endpoints.find(e => e.name == cp_batiment2).dynamicId;

  timeSeriesbatfloor = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_floor}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);
  timeSeriesbatfloor2 = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_floor2}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);

  let processedTimeSeriesfloor1 = null
  let processedTimeSeriesfloor2 = null
  if (config.config.cp1_batiment.type == "taux") {
    processedTimeSeriesfloor1 = processTimeSeriesTaux(timeSeriesbatfloor, label1, period);
  } else {
    processedTimeSeriesfloor1 = processTimeSeries(timeSeriesbatfloor, label1, period);
  }

  if (config.config.cp2_batiment.type == "taux") {
    processedTimeSeriesfloor2 = processTimeSeriesTaux(timeSeriesbatfloor2, label1, period);
  } else {
    processedTimeSeriesfloor2 = processTimeSeries(timeSeriesbatfloor2, label1, period);
  }
  // let scatterData = getScatterData(timeSeriesbatfloor.data, timeSeriesbatfloor2.data);
  let scatterData = mergeData(timeSeriesbatfloor.data, timeSeriesbatfloor2.data)

  // console.log('les scatter data :', try2);
  // cpDynamicId_bat = lacpList.data[0].endpoints.find(e => e.name == cp_batiment1).dynamicId;
  // cpDynamicId_bat2 = lacpList.data[0].endpoints.find(e => e.name == cp_batiment2).dynamicId;
  // timeSeriesbat = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_bat}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);
  // timeSeriesbat2 = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_bat2}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);

  // let processedTimeSeries1 = processTimeSeries(timeSeriesbat, label1, period);
  // let processedTimeSeries2 = processTimeSeries(timeSeriesbat2, label1, period);

  const rowBat = {
    name: cp_batiment1,
    area: parseInt(surface.data.area),
    timeSeries: processedTimeSeriesfloor1.slice(),
    sum: processedTimeSeriesfloor1.reduce((a, b) => a + b, 0),
    squareMeter: processedTimeSeriesfloor1.reduce((a, b) => a + b, 0) / surface.data.area,
    color: config.config.cp1_batiment.color,
    dynamicId: dynamicId,
    staticId: id_batiment,
  };

  const rowBat2 = {
    name: cp_batiment2,
    area: parseInt(surface.data.area),
    timeSeries: processedTimeSeriesfloor2.slice(),
    sum: processedTimeSeriesfloor2.reduce((a, b) => a + b, 0),
    squareMeter: processedTimeSeriesfloor2.reduce((a, b) => a + b, 0) / surface.data.area,
    color: config.config.cp2_batiment.color,
    dynamicId: dynamicId,
    staticId: id_batiment,
  };

  data1.push(rowBat);
  data2.push(rowBat2);

  let i = 0;
  let degree = 0;
  let lightness = 50;


  stats1.totalArea += parseInt(rowBat['area']);
  stats1.totalConsumption += rowBat['sum'];
  stats1.totalConsumptionSquareMeter += rowBat['squareMeter'];


  return [label1, data1, stats1, periodArray1[3], data2, scatterData];
}
