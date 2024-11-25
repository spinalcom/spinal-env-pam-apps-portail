import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr'
import config from '../config.js'
import { floor } from "lodash";

var globalTimeSeriesbatfloor = null
var globalTimeSeriesbatfloor2 = null
var globalSurface = null

function processTimeSeriesTaux(timeSeriesbat, label1, period) {


  let timeSeriesbat1 = timeSeriesbat.data;
  let processedTimeSeries1 = [];

  function calculateWeightedAverage(dataArray, times) {
    if (dataArray.length != 0) {

      // console.log('il calcule', dataArray); 
      let totalWeight = 0;
      let weightedSum = 0;

      for (let i = 0; i < dataArray.length - 1; i++) {
        let weight = 0
        // if (times == 'hour')
        //   weight = (dataArray[i + 1].date - dataArray[i].date) / 3600000;
        if (times == 'day')
          weight = (dataArray[i + 1].date - dataArray[i].date) / 86400000;
        else if (times == 'month')
          weight = (dataArray[i + 1].date - dataArray[i].date) / 2629800000;
        else
          weight = (dataArray[i + 1].date - dataArray[i].date) / 31536000000;
        // console.log(weight , 'le weighttt est :');
        totalWeight += weight;
        weightedSum += weight * dataArray[i].value;
      }
      // Poids pour le dernier élément
      if (times == 'day') {
        totalWeight += 1 / 24;
        weightedSum += (1 / 24) * dataArray[dataArray.length - 1].value;
      }
      else if (times == 'month') {
        // console.log('le dernieer est dinisé par 730');
        totalWeight += 1 / 730.5;
        weightedSum += (1 / 730.5) * dataArray[dataArray.length - 1].value;
      } else {
        // console.log('le dernieer est dinisé par 8766');
        totalWeight += 1 / 8766;
        weightedSum += (1 / 8766) * dataArray[dataArray.length - 1].value;
      }

      // console.log(weightedSum , totalWeight , "test");
      return weightedSum / totalWeight;
    } else {
      return null
    }
  }

  // console.log(label1);

  if (period === 'Mois') {
    label1.forEach(day => {
      processedTimeSeries1.push(
        calculateWeightedAverage(timeSeriesbat1.filter(elem => moment(elem.date).format('DD MMM') === day), 'day')
      );
    });
  } else if (period === 'Année') {
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
      processedTimeSeries1.push(
        calculateWeightedAverage(timeSeriesbat1.filter(elem => moment(elem.date).format('HH:mm') === hour), 'day')
      );
    });
  }
  else {
    processedTimeSeries1 = timeSeriesbat1;
  }

  return processedTimeSeries1;
}


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
      var currentHour = moment().startOf('day').hour(i); // Utilisation de startOf('day') pour avoir le début de la journée actuelle
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


export async function getData(timestamp,period,space) {

  console.log('first');
  const id_batiment = localStorage.getItem('idBuilding');
  const cp_batiment1 = config.config.cp1_batiment.name;
  const cp_batiment2 = config.config.cp2_batiment.name;

  let periodArray1 = getPeriodArray(timestamp, "Année");

  let surface = await HTTP.get(`/building/${id_batiment}/building/read`);
  let dynamicId = surface.data.dynamicId;
  lacpList = await HTTP.get(`/building/${id_batiment}/node/${dynamicId}/control_endpoint_list`);

  if (space.dynamicId != 0)
    cpListfloor = await HTTP.get(`building/${id_batiment}/node/${space.dynamicId}/control_endpoint_list`);
  else
    cpListfloor = await HTTP.get(`building/${id_batiment}/node/${dynamicId}/control_endpoint_list`);
  cpDynamicId_floor = cpListfloor.data[0].endpoints.find(e => e.name == cp_batiment1).dynamicId;
  cpDynamicId_floor2 = cpListfloor.data[0].endpoints.find(e => e.name == cp_batiment2).dynamicId;


  timeSeriesbatfloor = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_floor}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);
  timeSeriesbatfloor2 = await HTTP.get(`/building/${id_batiment}/endpoint/${cpDynamicId_floor2}/timeSeries/read/${periodArray1[1]}/${periodArray1[2]}`);

  console.log(`la periode est la suivante : ${periodArray1[1]}/${periodArray1[2]}`);
console.log('je met dans le global1',);

  globalTimeSeriesbatfloor = timeSeriesbatfloor
  globalTimeSeriesbatfloor2 = timeSeriesbatfloor2
  globalSurface = surface;
  console.log(globalSurface);

  // getDataByTime(timestamp, period);

}

export async function getDataByTime(timestamp, period) {
  let data1 = [];
  let data2 = []; 
  const id_batiment = localStorage.getItem('idBuilding');
  const cp_batiment1 = config.config.cp1_batiment.name;
  const cp_batiment2 = config.config.cp2_batiment.name;
  console.log(globalSurface);
  let dynamicId = globalSurface.data.dynamicId;

  let periodArray1 = getPeriodArray(timestamp, period);
  let label1 = periodArray1[0];
  let stats1 = { totalArea: 0, buildings: 0, totalConsumption: 0, totalConsumptionSquareMeter: 0 };
  let processedTimeSeriesfloor1 = null
  let processedTimeSeriesfloor2 = null

    console.log(globalTimeSeriesbatfloor ,'le global');
  if (config.config.cp1_batiment.type == "taux") {
    processedTimeSeriesfloor1 = processTimeSeriesTaux(globalTimeSeriesbatfloor, label1, period);
  } else {
    processedTimeSeriesfloor1 = processTimeSeries(globalTimeSeriesbatfloor, label1, period);
  }

  if (config.config.cp2_batiment.type == "taux") {
    processedTimeSeriesfloor2 = processTimeSeriesTaux(globalTimeSeriesbatfloor2, label1, period);
  } else {
    processedTimeSeriesfloor2 = processTimeSeries(globalTimeSeriesbatfloor2, label1, period);
  }

  const rowBat = {
    name: cp_batiment1,
    area: parseInt(globalSurface.data.area),
    timeSeries: processedTimeSeriesfloor1.slice(),
    sum: processedTimeSeriesfloor1.reduce((a, b) => a + b, 0),
    squareMeter: processedTimeSeriesfloor1.reduce((a, b) => a + b, 0) / globalSurface.data.area,
    color: config.config.cp1_batiment.color,
    dynamicId: dynamicId,
    staticId: id_batiment,
  };

  const rowBat2 = {
    name: cp_batiment2,
    area: parseInt(globalSurface.data.area),
    timeSeries: processedTimeSeriesfloor2.slice(),
    sum: processedTimeSeriesfloor2.reduce((a, b) => a + b, 0),
    squareMeter: processedTimeSeriesfloor2.reduce((a, b) => a + b, 0) / globalSurface.data.area,
    color: config.config.cp2_batiment.color,
    dynamicId: dynamicId,
    staticId: id_batiment,
  };

  data1.push(rowBat);
  data2.push(rowBat2);

  // let i = 0;
  // let degree = 0;
  // let lightness = 50;

  stats1.totalArea += parseInt(rowBat['area']);
  stats1.totalConsumption += rowBat['sum'];
  stats1.totalConsumptionSquareMeter += rowBat['squareMeter'];

  console.log('les info final',[label1, data1, stats1, periodArray1[3], data2]);
  return [label1, data1, stats1, periodArray1[3], data2];
}
