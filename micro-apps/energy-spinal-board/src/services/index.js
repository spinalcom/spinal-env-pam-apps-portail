import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr'
import config from '../config.js'


// console.log(config.config.cp1_batiment);

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
  } else if (period === '3 mois') {
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
  } else {
    return [];
  }
}

export async function getBuildingName(id_batiment) {
  let building = await HTTP.get(`/building/${id_batiment}/building/read`);
  return building.data.name
}

export async function getDataBuilding(timestamp, period, buildings, cp, cp_batiment, id_batiment, color) {
  const colors1 = ['#ff6384', '#36a2eb', '#4bc0c0', '#ff7b00', '#97BCC7', '#006884'];
  let row1 = {};
  let data1 = [];
  let periodArray1 = getPeriodArray(timestamp, period);
  let colorIndex1 = 0;
  let stats1 = { totalArea: 0, buildings: 0, totalConsumption: 0, totalConsumptionSquareMeter: 0 };
  let surface = await HTTP.get(`/building/${id_batiment}/building/read`);
  let dynamicId = surface.data.dynamicId;
  lacpList = await HTTP.get(`/building/${id_batiment}/node/${dynamicId}/control_endpoint_list`);

  const floors = await HTTP.get(`/building/${id_batiment}/floor/list`);
  // const floorsInfo = [];
  let label1 = periodArray1[0];
  cpDynamicId_bat = lacpList.data[0].endpoints.find(e => e.name == cp_batiment).dynamicId;
  timeSeriesbat = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_bat}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);


  let processedTimeSeries1 = processTimeSeries(timeSeriesbat, label1, period);

  const rowBat = {
    name: surface.data.name,
    area: parseInt(surface.data.area),
    timeSeries: processedTimeSeries1.slice(),
    sum: processedTimeSeries1.reduce((a, b) => a + b, 0),
    squareMeter: processedTimeSeries1.reduce((a, b) => a + b, 0) / surface.data.area,
    color: color,
    dynamicId: dynamicId,
    staticId: id_batiment,
  };
  stats1.totalArea += parseInt(rowBat['area']);
  stats1.buildings++;
  stats1.totalConsumption += rowBat['sum'];
  stats1.totalConsumptionSquareMeter += rowBat['squareMeter'];

  data1.push(rowBat);

  return [label1, data1, stats1, periodArray1[3]];
}


export async function getData(timestamp, period ) {

// console.log(buildings, '/////////////////////////////////////////////////////////////////');

  const id_batiment = localStorage.getItem('idBuilding');
  const cp_batiment1 = config.config.cp1_batiment.name;
  const cp_batiment2 = config.config.cp2_batiment.name;

  // const colors1 = ['#ff6384', '#36a2eb', '#4bc0c0', '#ff7b00', '#97BCC7', '#006884'];
  let row1 = {};
  let data1 = [];
  let data2 = [];
  // const floorsInfo = [];
  let periodArray1 = getPeriodArray(timestamp, period);
  // console.log('periodArray1 ::', periodArray1);

  // let colorIndex1 = 0;
  let stats1 = { totalArea: 0, buildings: 0, totalConsumption: 0, totalConsumptionSquareMeter: 0 };
  let surface = await HTTP.get(`/building/${id_batiment}/building/read`);
  let dynamicId = surface.data.dynamicId;
  lacpList = await HTTP.get(`/building/${id_batiment}/node/${dynamicId}/control_endpoint_list`);
  // console.log('aa',lacpList);
  const floors = await HTTP.get(`/building/${id_batiment}/floor/list`);
  let label1 = periodArray1[0];
  cpDynamicId_bat = lacpList.data[0].endpoints.find(e => e.name == cp_batiment1).dynamicId;
  cpDynamicId_bat2 = lacpList.data[0].endpoints.find(e => e.name == cp_batiment2).dynamicId;
  timeSeriesbat = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_bat}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);
  timeSeriesbat2 = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_bat2}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);
  
  let processedTimeSeries1 = processTimeSeries(timeSeriesbat, label1, period);
  let processedTimeSeries2 = processTimeSeries(timeSeriesbat2, label1, period);
  // console.log('timeseriesbat',processedTimeSeries1);
  const rowBat = {
    name: cp_batiment1,
    area: parseInt(surface.data.area),
    timeSeries: processedTimeSeries1.slice(),
    sum: processedTimeSeries1.reduce((a, b) => a + b, 0),
    squareMeter: processedTimeSeries1.reduce((a, b) => a + b, 0) / surface.data.area,
    color: config.config.cp1_batiment.color,
    dynamicId: dynamicId,
    staticId: id_batiment,
  };

  const rowBat2 = {
    name: cp_batiment2,
    area: parseInt(surface.data.area),
    timeSeries: processedTimeSeries2.slice(),
    sum: processedTimeSeries2.reduce((a, b) => a + b, 0),
    squareMeter: processedTimeSeries2.reduce((a, b) => a + b, 0) / surface.data.area,
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


  return [label1, data1, stats1, periodArray1[3], data2];
}
