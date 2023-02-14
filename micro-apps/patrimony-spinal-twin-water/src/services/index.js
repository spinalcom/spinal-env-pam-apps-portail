import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr'



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
    var daysInMonth = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      daysInMonth.push(currentDay.format('DD MMM'));
      currentDay.add(1, 'day');
    }
    return [daysInMonth, moment(timestamp).startOf('month').format('DD-MM-yyyy HH:mm:ss'), moment(timestamp).endOf('month').format('DD-MM-yyyy HH:mm:ss')];
  } else {
    return [];
  }
}


export async function getData(timestamp, period, buildings, cp) {
  const colors = ['#ff6384', '#36a2eb', '#4bc0c0', '#ff7b00', '#97BCC7', '#006884'];
  let colorIndex = 0;
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
    } else if (period === 'Décennie') {
      label.forEach(year => {
        processedTimeSeries.push(
          row['timeSeries'].filter(elem => moment(elem.date).format('YYYY') === year)
            .reduce((sum, elem) => sum + elem.value, 0)
        );
      });
    } else if (period === '3 mois') {
      label.forEach(day => {
        processedTimeSeries.push(
          row['timeSeries'].filter(elem => moment(elem.date).format('DD MMM') === day)
            .reduce((sum, elem) => sum + elem.value, 0)
        );
      });
    } else {
      processedTimeSeries = row['timeSeries'];
    }
    row['timeSeries'] = processedTimeSeries;
    row['sum'] = processedTimeSeries.reduce((a,b) => a+b,0);
    row['squareMeter'] = (row['sum']/row['area']);
    row['color'] = colors[colorIndex++];
    stats.totalArea += row['area'];
    stats.buildings++;
    stats.totalConsumption += row['sum'];
    stats.totalConsumptionSquareMeter += row['squareMeter'];
    data.push(row);
  }

  return [label, data, stats];
}

