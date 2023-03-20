import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr';

export async function getBuilding() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`building/${buildingId}/building/read`);
  return result.data;
}

export async function getFloors() {
  const buildingId = localStorage.getItem('idBuilding');
  const result = await HTTP.get(`building/${buildingId}/floor/list`);
  return result.data;
}

export async function getData(space, tempo, currentTimestamp, controlEndpoints) {
  const buildingId = localStorage.getItem("idBuilding");
  // console.log('space:', space.dynamicId);
  // console.log('tempo:', tempo);
  // console.log('date:', moment(currentTimestamp).format('DD/MM/YYYY'), currentTimestamp);
  // console.log('space:', controlEndpoints[0]);
  let avg = [], total = [];
  let periodArray = getPeriodArray(currentTimestamp, tempo);
  let label = periodArray[0];
  let data = [];
  let cpList, cpID, timeSeries, prevTimeSeries, prevSumSeries, sumSeries;
  try {
  for (const controlEndpoint of controlEndpoints) {
    cpList = await HTTP.get(`building/${buildingId}/node/${space.dynamicId}/control_endpoint_list`);

    cpList = cpList.data[0].endpoints;
    for (let i = 0; i < cpList.length; i++) {
      if (cpList[i].name === controlEndpoint.name) {
        cpID = cpList[i].dynamicId;
      }
    }
    if (cpID) {
    timeSeries = await HTTP.get(`/building/${buildingId}/endpoint/${cpID}/timeSeries/read/${periodArray[1]}/${periodArray[2]}`);
    timeSeries = timeSeries.data;

    prevTimeSeries = await HTTP.get(`/building/${buildingId}/endpoint/${cpID}/timeSeries/read/${periodArray[3]}/${periodArray[4]}`);
    prevTimeSeries = prevTimeSeries.data;


    let processedTimeSeries = [];
    if (tempo === 'Semaine') {
      label.forEach(day => {
        processedTimeSeries.push(
          timeSeries.filter(elem => moment(elem.date).format('DD MMM') === day)
            .reduce((sum, elem) => sum + elem.value, 0)
        );
      });

    } else if (tempo === 'Mois') {
      label.forEach(day => {
        processedTimeSeries.push(
          timeSeries.filter(elem => moment(elem.date).format('DD MMM') === day)
            .reduce((sum, elem) => sum + elem.value, 0)
        );
      });
    } else if (tempo === 'Année') {
      label.forEach(month => {
        processedTimeSeries.push(
          timeSeries.filter(elem => moment(elem.date).format('MMM') === month)
            .reduce((sum, elem) => sum + elem.value, 0)
        );
      });
    } else if (tempo === 'Décennie') {
      label.forEach(year => {
        processedTimeSeries.push(
          timeSeries.filter(elem => moment(elem.date).format('YYYY') === year)
            .reduce((sum, elem) => sum + elem.value, 0)
        );
      });
    } else if (tempo === '3 mois') {
      label.forEach(day => {
        processedTimeSeries.push(
          timeSeries.filter(elem => moment(elem.date).format('DD MMM') === day)
            .reduce((sum, elem) => sum + elem.value, 0)
        );
      });
    } else {
      processedTimeSeries = timeSeries;
    }

    sumSeries = timeSeries.reduce((accumulator, current) => accumulator + current.value, 0);



    prevSumSeries = prevTimeSeries.reduce((accumulator, current) => accumulator + current.value, 0);
    let a = (prevSumSeries * 100 / sumSeries).toFixed(0);

      total.push({
        color: controlEndpoint.color,
        value: sumSeries,
        unit: controlEndpoint.unit,
        title: controlEndpoint.totalTitle,
        subValue: a + '%',
        subtitle: controlEndpoint.totalSubtitle,
        root: controlEndpoint.root,
        cpID: cpID,
        startDate: periodArray[3],
        endDate: periodArray[4],
        label: label.length,
      })

      sumSeries = sumSeries / label.length;

      let b = prevSumSeries / label.length;
      b = (b * 100 / sumSeries).toFixed(0);
      avg.push({
        color: controlEndpoint.color,
        value: sumSeries,
        unit: controlEndpoint.unit,
        title: controlEndpoint.averageTitle,
        subValue: b + '%',
        subtitle: controlEndpoint.averageSubtitle,
        root: controlEndpoint.root,
        cpID: cpID,
        startDate: periodArray[3],
        endDate: periodArray[4],
        label: label.length,
      })

    data.push({
      label: controlEndpoint.label,
      backgroundColor: controlEndpoint.color,
      data: processedTimeSeries,
      stack: controlEndpoint.stackGroup
    })
      
  }
    
  }
}
catch {
  return [null, null, null, null]
}
  
  return [label, data, avg, total];
}

function getPeriodArray(timestamp, period) {
  if (period === 'Semaine') {
    var startOfWeek = moment(timestamp).startOf('week');
    var endOfWeek = moment(timestamp).endOf('week');
    var daysInMonth = [];
    var currentDay = moment(startOfWeek);
    while (currentDay.isSameOrBefore(endOfWeek)) {
      daysInMonth.push(currentDay.format('DD MMM'));
      currentDay.add(1, 'day');
    }
    return [daysInMonth,
      moment(timestamp).startOf('week').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('week').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'weeks').startOf('week').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'weeks').endOf('week').format('DD-MM-yyyy HH:mm:ss')
    ];
  } else if (period === 'Mois') {
    var startOfMonth = moment(timestamp).startOf('month');
    var endOfMonth = moment(timestamp).endOf('month');
    var daysInMonth = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      daysInMonth.push(currentDay.format('DD MMM'));
      currentDay.add(1, 'day');
    }
    return [daysInMonth,
      moment(timestamp).startOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'months').startOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'months').endOf('month').format('DD-MM-yyyy HH:mm:ss')];
  } else if (period === 'Année') {
    var monthsInYear = [];
    for (var i = 0; i < 12; i++) {
      var currentMonth = moment(timestamp).month(i);
      monthsInYear.push(currentMonth.format('MMM'));
    }
    return [monthsInYear,
      moment(timestamp).startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'years').startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'years').endOf('year').format('DD-MM-yyyy HH:mm:ss'),];
  } else if (period === 'Décennie') {
    var yearsInDecade = [];
    for (var i = -9; i <= 0; i++) {
      var currentYear = moment(timestamp).add(i, 'years');
      yearsInDecade.push(currentYear.format('YYYY'));
    }
    return [yearsInDecade, moment(timestamp).add(-10, 'years').startOf('year').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss')];
  } else if (period === '3 mois') {
    var startOfMonth = moment(timestamp).add(-2, 'months').startOf('month');
    var endOfMonth = moment(timestamp).endOf('month');
    var daysIn3Months = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      daysIn3Months.push(currentDay.format('DD MMM'));
      currentDay.add(1, 'day');
    }
    return [daysIn3Months, moment(timestamp).add(-2, 'months').startOf('month').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('month').format('DD-MM-yyyy HH:mm:ss')];
  } else {
    return [];
  }
}

export async function getTodaysData(space, controlEndpoints) {
  // var data = [
  //   {
  //     label: 'Energie globale',
  //     name: 'Energie globale',
  //     color: '#14202c',
  //     unit: 'Kw',
  //     title: 'title',
  //     subtitle: 'sub',
  //     root: true,
  //   }
  // ]
  const data = [];
  const buildingId = localStorage.getItem("idBuilding");
  var startOfDay = moment().startOf('day').format('DD-MM-yyyy HH:mm:ss');
  var endOfDay = moment().endOf('day').format('DD-MM-yyyy HH:mm:ss');
  let cpList, cpID, timeSeries, sumSeries, sub;
  for (const controlEndpoint of controlEndpoints) {
    cpList = await HTTP.get(`building/${buildingId}/node/${space.dynamicId}/control_endpoint_list`);
    cpList = cpList.data[0].endpoints;
    for (let i = 0; i < cpList.length; i++) {
      if (cpList[i].name === controlEndpoint.name) {
        cpID = cpList[i].dynamicId;
      }
    }
    if (cpID) {
    timeSeries = await HTTP.get(`/building/${buildingId}/endpoint/${cpID}/timeSeries/read/${startOfDay}/${endOfDay}`);
    // timeSeries = await HTTP.get(`/building/${buildingId}/endpoint/${cpID}/timeSeries/read/07-02-2023 00:00:00/07-02-2023 23:59:59`);
    timeSeries = timeSeries.data;
    sumSeries = timeSeries.reduce((accumulator, current) => accumulator + current.value, 0);
    data.push({
      color: controlEndpoint.color,
      value: sumSeries,
      unit: controlEndpoint.unit,
      title: controlEndpoint.title,
      subValue: '+0%',
      subtitle: controlEndpoint.subtitle,
      root: controlEndpoint.root
    })
  }
  }
  let sum = data[0].value;
  for (let i = 1; i < data.length; i++) {
    if (data[i].unit !== data[i-1].unit) {
      sum = data[i].value;
      data[i].subtitle = null;
      data[i].subValue = null

    }
    else {
      data[i].subValue = (data[i].value * 100 / sum).toFixed(1) + '%';
    }
  }
  return data;
}

// export async function getAverageAndTotalData(avg, total) {
//   const buildingId = localStorage.getItem("idBuilding");
//   let timeSeries, sumSeries;
//   console.log(avg);
//   for (let i = 0; i < total.lenght; i++) {
//     timeSeries = await HTTP.get(`/building/${buildingId}/endpoint/${total[i].cpID}/timeSeries/read/${total[i].startDate}/${total[i].endDate}`);
//     timeSeries = timeSeries.data;
//     sumSeries = timeSeries.reduce((accumulator, current) => accumulator + current.value, 0);
//     total[i].subValue = sumSeries;
//     total[i].subtitle = 'sumSeries';
//     sumSeries = sumSeries / total[i].label;
//     avg[i].subValue = sumSeries;
//     avg[i].subtitle = 'sumSeries';
//     console.log(avg[i])
//   }
//   return [avg, total];
// }

