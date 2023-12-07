/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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

import { HTTP } from "./http-constants";
import moment from 'moment';
import 'moment/locale/fr';
import {ISource} from './interfaces'
import { ISpaceSelectorItem } from '../components/SpaceSelector';
import { TemporalityModel } from '../models/Temporality.model';

const ENDPOINT_TYPE = 'endpoint';
const CONTROLPOINT_TYPE = 'controlEndpoint';

export async function getBuilding(source: ISource[], buildingId?: string) {
  try {
    buildingId = buildingId || localStorage.getItem("idBuilding") as any;
    // const result = await HTTP.get(`/building/read`);    
    const result = await HTTP.get(`building/${buildingId}/building/read`);
    
    const {controlEndpoints, endpoints} = _classifyByType(source)    
    const promises = [_findControlPoints(result.data.dynamicId, controlEndpoints, buildingId),_findEndpoints(result.data.dynamicId,endpoints, buildingId)]

    result.data.source = await Promise.all(promises).then((result) => {
      return result.flat()
    })

    return result.data;    
  } catch (error) {
    console.error("failed to load building");
    throw error;
  }

 
}

export async function getFloors(cp : ISource[], buildingId?: number | string) {
  if (!Array.isArray(cp)) cp = [cp];
  const cpNames = cp.map(el => el.name);
  buildingId = buildingId || localStorage.getItem('idBuilding') as any;

  // get all floors
  // const result = await HTTP.get(`/floor/list`);
  const result = await HTTP.get(`building/${buildingId}/floor/list`);
  // for each floor get its cp names
  return result.data.reduce(async (prom, floor) => {
    // let cpList = await HTTP.get(`building/${buildingId}/node/${floor.dynamicId}/control_endpoint_list`);
    const liste = await prom;

    let cpList = await _findControlPoints(floor.dynamicId, cp, buildingId);

    if (cpList.length > 0) {
      let area = await _getFloorArea(floor.dynamicId, buildingId);
      floor.source = cpList;
      floor.area = area;
      liste.push(floor);
    }


    // for (let j = 0; j < cpList.length; j++) {
    //   for (let i = 0; i < cpList[j].endpoints.length; i++) {
    //     // if there is a match add floor to array + area + cp id
    //     if (cpNames.indexOf(cpList[j].endpoints[i].name) !== -1) {
    //       // let area = await HTTP.get(`building/${buildingId}/node/${floor.dynamicId}/attributsList`);
    //       let area = await HTTP.get(`/node/${floor.dynamicId}/attributsList`);
    //       area = area.data[0].attributs[area.data[0].attributs.findIndex(e => e.label === 'area')].value;
    //       floor.area = area;
    //       floor.cp = cpList[j].endpoints[i].dynamicId;
    //       liste.push(floor);
    //     }
    //   }
    // }
    return liste;
  }, Promise.resolve([]));


  // let values = await Promise.all(promises);
  // let filteredValues = values.filter((value) => value !== null);
  // return filteredValues;
}

export async function getHeatCal(space: ISpaceSelectorItem, temporalityName: string, currentTimestamp: number, source, raw = {start: null, end: null, data: []}, buildingId?: string) {
 
  buildingId = buildingId || localStorage.getItem("idBuilding");

  var calendar: any[] = [];
  var calendarObject: any = { rawData : raw.data };
  let periodArray = getPeriodArray(currentTimestamp, temporalityName);
  let label = periodArray[0];
  let tooltipDate = periodArray[5];
  let data = [];
  let timeSeries, prevTimeSeries, prevSumSeries, sumSeries, prevTotRoot, prevAvgRoot;

  try {
    if (raw.data.length === 0) {
      // timeSeries = await HTTP.get(`/building/${buildingId}/endpoint/${source.dynamicId}/timeSeries/read/${periodArray[1]}/${periodArray[2]}`);
      // const result = await HTTP.get(`/endpoint/${source.dynamicId}/timeSeries/read/${periodArray[1]}/${periodArray[2]}`);
      // timeSeries = result.data;
      timeSeries = await _getTimeSeries(source.dynamicId, periodArray[1], periodArray[2],buildingId);
      calendarObject.rawData = timeSeries;
    }
    else {
      timeSeries = raw.data;
    }

    timeSeries = timeSeries.filter(({ date }) => {
      const formattedTime: any = moment(date).format('HH:mm');
      return (!raw.start || formattedTime >= raw.start) && (!raw.end || formattedTime <= raw.end);
    });
    
    let processedTimeSeries = [];
    if (temporalityName === 'Année') {
      calendarObject.labelLegend = moment(currentTimestamp).format('YYYY');
      calendarObject.y = moment(currentTimestamp).format('YYYY');
      calendarObject.n = source.title;
      calendarObject.d = prepareCalendar(calendarObject.y, timeSeries);
      calendarObject.max = source.max;
      calendarObject.min = source.min;
      
      calendar.push(calendarObject);


      // label.forEach(month: string => {
      //   processedTimeSeries.push(
      //     timeSeries.filter(elem => moment(elem.date).format('MMM') === month)
      //       .reduce((sum, elem) => sum + elem.value, 0)
      //   );
      // });
    } else {
      processedTimeSeries = timeSeries;
    }


    return calendarObject;

  }
  catch (e) {
    console.error(e);
    return null
  }

}

export function getTempoSuggestion(tempo, currentTimestamp) {
  if (tempo === 'Mois') {
    return [
      'Mois choisi (' + moment(currentTimestamp).format('MMMM YYYY') + ')',
      'Mois précédent (' + moment(currentTimestamp).add(-1,'months').format('MMMM YYYY') + ')',
      'Même mois que l\'année dernière (' + moment(currentTimestamp).add(-12, 'months').format('MMMM YYYY') + ')']
  }
}

// export async function getSolo(space, tempo, currentTimestamp, format, controlEndpoints, color, totalCard) {
//   let ts = moment(currentTimestamp, format).valueOf();
//   if (tempo === 'Trimestre') {
//     let t = currentTimestamp.split('/');
//     switch(t[0]) {
//       case 'T1': ts = moment(`01/01/${t[1]}`, 'DD/MM/YYYY'); break;
//       case 'T2': ts = moment(`01/04/${t[1]}`, 'DD/MM/YYYY'); break;
//       case 'T3': ts = moment(`01/07/${t[1]}`, 'DD/MM/YYYY'); break;
//       case 'T4': ts = moment(`01/10/${t[1]}`, 'DD/MM/YYYY'); break;
//     }
//   }
//   let res = await getData(space, tempo, ts, controlEndpoints);
//   res[1][0].stack = currentTimestamp;
//   res[1][0].backgroundColor = color;
//   res[2][0].root = false;
//   res[2][0].color = color;
//   res[3][0].root = false;
//   res[3][0].color = color;
//   let comparison = '∞';
//   if (totalCard[0].value !== 0 && res[3][0].value > 0) {
//     comparison = (((res[3][0].value - totalCard[0].value) / totalCard[0].value) * 100).toFixed(1) + '%';
//     // comparison = (res[3][0].value * 100 / totalCard[0].value).toFixed(1) + '%'
//   }
//   res[3][0].subValue = comparison;
//   res[3][0].subtitle = 'de la consommation de référence';

//   res[5][0].root = false;
//   res[5][0].color = color;
//   res[5][0].title = 'Consommation au m²';
//   res[5][0].title = 'Consommation au m²';
//   // res[5][0].subValue = comparison;
//   // res[5][0].subtitle = 'de la consommation de référence';

//   return [res[1][0], res[2][0], res[3][0], res[5][0], res[4][0], res[0]];
// }



function getPeriodArray(timestamp: number, period: string) {
  if (period === 'Journée') {
    let startOfDay = moment(timestamp).startOf('day');
    let endOfDay = moment(timestamp).endOf('day');
    let hoursInDay: string[] = [];
    let tooltipDate: string[] = [];

    let currentHour = moment(startOfDay);
    while (currentHour.isSameOrBefore(endOfDay)) {
      hoursInDay.push(currentHour.format('HH'));
      tooltipDate.push(moment(currentHour).format('ddd DD/MM/YYYY HH:mm').slice(0, 1).toUpperCase() + moment(currentHour).format('ddd DD/MM/YYYY HH:mm').slice(1));
      currentHour.add(1, 'hour');
    }
    
    return [hoursInDay,
      moment(timestamp).startOf('day').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('day').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'day').startOf('day').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'day').endOf('day').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate
    ];

  } else if (period === 'Semaine') {
    let startOfWeek = moment(timestamp).startOf('week');
    let endOfWeek = moment(timestamp).endOf('week');
    let daysInMonth : string[] = [];
    let abstractDaysInMonth : string[] = [];
    let tooltipDate : string[] = [];
    let currentDay = moment(startOfWeek);

    while (currentDay.isSameOrBefore(endOfWeek)) {
      daysInMonth.push(currentDay.format('DD MMM'));
      abstractDaysInMonth.push(currentDay.format('dddd').slice(0, 1).toUpperCase() + currentDay.format('dddd').slice(1));
      tooltipDate.push(moment(currentDay).format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() + moment(currentDay).format('ddd DD/MM/YYYY').slice(1));
      currentDay.add(1, 'day');
    }
    return [daysInMonth,
      moment(timestamp).startOf('week').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('week').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'weeks').startOf('week').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'weeks').endOf('week').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate,
      abstractDaysInMonth
    ];
  } else if (period === 'Mois') {
    let startOfMonth = moment(timestamp).startOf('month');
    let endOfMonth = moment(timestamp).endOf('month');
    let daysInMonth : string[] = [];
    let abstractDaysInMonth : string[] = [];
    let tooltipDate : string[] = [];
    let currentDay = moment(startOfMonth);

    while (currentDay.isSameOrBefore(endOfMonth)) {
      abstractDaysInMonth.push(currentDay.format('DD'));
      daysInMonth.push(currentDay.format('DD MMM'));
      tooltipDate.push(moment(currentDay).format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() + moment(currentDay).format('ddd DD/MM/YYYY').slice(1));
      currentDay.add(1, 'day');
    }
    return [daysInMonth,
      moment(timestamp).startOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'months').startOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'months').endOf('month').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate,
      abstractDaysInMonth
    ];
  } else if (period === 'Année') {
    var monthsInYear : string[] = [];
    var tooltipDate : string[] = [];
    for (var i = 0; i < 12; i++) {
      var currentMonth = moment(timestamp).month(i);
      monthsInYear.push(currentMonth.format('MMM'));
      tooltipDate.push(moment(currentMonth).format('MMMM/YYYY').slice(0, 1).toUpperCase() + moment(currentMonth).format('MMMM/YYYY').slice(1));
    }
    return [monthsInYear,
      moment(timestamp).startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'years').startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'years').endOf('year').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate
    ];
  } else if (period === 'Décennie') {
    let yearsInDecade : string[] = [];
    let tooltipDate : string[] = [];
    for (var i = -9; i <= 0; i++) {
      var currentYear = moment(timestamp).add(i, 'years');
      yearsInDecade.push(currentYear.format('YYYY'));
      tooltipDate.push(moment(currentYear).format('YYYY').slice(0, 1).toUpperCase() + moment(currentYear).format('YYYY').slice(1));
    }
    return [yearsInDecade,
      moment(timestamp).add(-10, 'years').startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss'), '', '', tooltipDate];
  } else if (period === 'Trimestre') {
    let currentMM : string = moment(timestamp).format('MM');
    let T = 'T'+ Math.ceil(Number(currentMM) / 3);
    let startOfTrimester;
    let endOfTrimester;
    let currentDay;
    let endDay;
    switch (T) {
        case 'T1':
            startOfTrimester = moment(`01/01/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
            endOfTrimester = moment(`31/03/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
            currentDay = moment(`01/01/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            endDay = moment(`31/03/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            break;

        case 'T2':
            startOfTrimester = moment(`01/04/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
            endOfTrimester = moment(`30/06/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
            currentDay = moment(`01/04/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            endDay = moment(`30/06/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            break;
    
        case 'T3':
            startOfTrimester = moment(`01/07/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
            endOfTrimester = moment(`30/09/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
            currentDay = moment(`01/07/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            endDay = moment(`30/09/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            break;
    
        case 'T4':
            startOfTrimester = moment(`01/10/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
            endOfTrimester = moment(`31/12/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
            currentDay = moment(`01/10/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            endDay = moment(`31/12/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            break;
    }

    let daysIn3Months : string[] = [];
    let abstractDaysIn3Months: string[] = [];
    let tooltipDate: string[] = [];
    while (currentDay.isSameOrBefore(endDay)) {
      daysIn3Months.push(currentDay.format('DD MMM'));
      abstractDaysIn3Months.push(currentDay.format('DD'));
      tooltipDate.push(moment(currentDay).format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() + moment(currentDay).format('ddd DD/MM/YYYY').slice(1));
      currentDay.add(1, 'day');
    }

    
    return [daysIn3Months,
      startOfTrimester,
      endOfTrimester,
      moment(timestamp).add(-5, 'months').startOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-3, 'months').endOf('month').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate,
      T,
      abstractDaysIn3Months
    ];
  } else {
    return [];
  }
}


function generateMonthlyData(y) {
  const monthlyData: number[][] = [];
  const date = moment(y, 'YYYY');
  // loop through 12 months
  for (let i = 0; i < 12; i++) {
    let daysInMonth = date.month(i).daysInMonth();
    if (i === 1) { // February
      if (moment([y]).isLeapYear()) {
        daysInMonth = 29;
      }
    }
    const monthArray : number[] = Array(daysInMonth).fill(-1);
    monthlyData.push(monthArray);
  }
  // console.log({
  //   y: year,
  //   d: monthlyData
  // })
  return {
    n: '',
    y: y,
    d: monthlyData
  };
}

function prepareCalendar(year, timeSeries) {
  
  var sumData = generateMonthlyData(year).d;
  var maxData = generateMonthlyData(year).d;
  var minData = generateMonthlyData(year).d;
  var meanData = generateMonthlyData(year).d;
  var month, day;
  const occurrenceCounts = {};
  for (const timeSerie of timeSeries) {
    month = +moment(timeSerie.date).format('MM') - 1;
    day = +moment(timeSerie.date).format('DD') - 1;
    sumData[month][day] = (sumData[month][day] === -1) ? timeSerie.value : sumData[month][day] + timeSerie.value;
    maxData[month][day] = (maxData[month][day] < timeSerie.value) ? timeSerie.value : maxData[month][day];
    minData[month][day] = (minData[month][day] > timeSerie.value || minData[month][day] === -1) ? timeSerie.value : minData[month][day];
    const key = `${month}-${day}`;
    occurrenceCounts[key] = (occurrenceCounts[key] || 0) + 1;

    meanData[month][day] = (meanData[month][day] == -1) ? timeSerie.value : meanData[month][day] + timeSerie.value;
  }
  for (let i = 0; i < meanData.length; i++) {
    for (let j = 0; j < meanData[i].length; j++) {
      const month = i;
      const day = j;
      const key = `${month}-${day}`;
      const count = occurrenceCounts[key] || 1;
      meanData[i][j] = meanData[i][j] / count;
    }
  }
  return {sum: sumData, max: maxData, min: minData, mean: meanData};
}

// async function getArea(space) {
//   const buildingId = localStorage.getItem("idBuilding");

//   if (space.type === 'building') {
//     // const result = await HTTP.get(`building/${buildingId}/building/read`);
//     const result = await HTTP.get(`/building/read`);
//     return +result.data.area;
//   }
//   else if (space.type === 'floor') {
//     // let area = await HTTP.get(`building/${buildingId}/node/${space.dynamicId}/attributsList`);
//     let area = await HTTP.get(`/node/${space.dynamicId}/attributsList`);
//     area = area.data[0].attributs[area.data[0].attributs.findIndex(e => e.label === 'area')].value;
//     return +area;
//   }
// }


function _getTimeSeries(endpointId: number, start : string, end : string, buildingId: string) {
  // return HTTP.get(`/endpoint/${endpointId}/timeSeries/read/${start}/${end}`).then((result) => {
  return HTTP.get(`building/${buildingId}/endpoint/${endpointId}/timeSeries/read/${start}/${end}`).then((result) => {
    return result.data;
  }).catch((err) => {
    return []
  });
}

function _getFloorArea(nodeDynamicId : number, buildingId: string): Promise<number> {
  // return HTTP.get(`/node/${nodeDynamicId}/attributsList`).then((result) => {
  return HTTP.get(`building/${buildingId}/node/${nodeDynamicId}/attributsList`).then((result) => {
    
    for (const iterator of result.data) {
      for (const attribut of iterator.attributs) {
        if (attribut.label === 'area') return attribut.value;
      }
    }
    
  }).catch((err) => {
    return 0;
  });
}


function _classifyByType(sources: ISource[]) {
  return sources.reduce((obj: {endpoints: ISource[], controlEndpoints: ISource[]}, item) => {
    if (item.type === ENDPOINT_TYPE) obj.endpoints.push(item);
    else if (item.type === CONTROLPOINT_TYPE) obj.controlEndpoints.push(item);
    return obj;
  }, { endpoints: [], controlEndpoints: [] })
}

function _findControlPoints(nodeDynamicId: number, controlPoints: ISource[], buildingId: string) {
  const obj : any = {};  
  controlPoints.forEach(el => {
    if (obj[el.profile]) obj[el.profile][el.name] = el.name
    else obj[el.profile] = {[el.name] : el};
  })
  
  // return HTTP.get(`/node/${nodeDynamicId}/control_endpoint_list`).then((result) => {
  return HTTP.get(`building/${buildingId}/node/${nodeDynamicId}/control_endpoint_list`).then((result) => {
    return result.data.reduce((liste, item) => {
      const profile = obj[item.profileName];
      if (profile) {
        for (const endpoint of item.endpoints) {
          const data = profile[endpoint.name];
          if (data) liste.push({ ...data, dynamicId : endpoint.dynamicId });
        }
      }

      return liste;
    }, [])
  }).catch((err) => {
    return [];
  });
}

function _findEndpoints(nodeDynamicId: number, endpoints: ISource[], buildingId: string) {
  const obj = {};  
  endpoints.forEach(el => {
    if (obj[el.name]) el;
  })
  
  // return HTTP.get(`/node/${nodeDynamicId}/endpoint_list`).then((result) => {
  return HTTP.get(`building/${buildingId}/node/${nodeDynamicId}/endpoint_list`).then((result) => {
    return result.data.filter(endpoint => {
      if (obj[endpoint.name]) return true;
      return false;
    })
  }).catch((err) => {
    return [];
  });
}