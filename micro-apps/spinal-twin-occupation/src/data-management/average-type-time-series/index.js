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

import {
  getControlEndpointstAsync,
  getTimeSeriesAsync,
} from '../../api-requests';
import {
  sameDay,
  sameWeek,
  sameMonth,
  sameYear,
  calendar,
} from '../../date-comparison';

/**
 *
 *
 * @param {any[]} data
 * @return {number} average value of the day between 8h and 20h
 */
function averageOnDayFull(data) {
  const to_read = data.filter(
    (d) => new Date(d.date).getHours() > 8 && new Date(d.date).getHours() < 20
  );
  const qot = to_read.length > 0 ? to_read.length : 1;
  return parseInt(to_read.reduce((acc, cur) => acc + cur.value, 0) / qot, 10);
}

/**
 *
 *
 * @param {any[]} data
 * @return {number} average value of the week between 8h and 20h
 */
function averageOnWeekFull(data) {
  const avg = [];
  for (let c of calendar.week) {
    const to_read = data.filter((d) => new Date(d.date).getDay() === c);
    avg.push(averageOnDayFull(to_read));
  }
  return parseInt(avg.reduce((acc, cur) => acc + cur, 0) / avg.length, 10);
}

/**
 *
 *
 * @param {any[]} data
 * @return {number} average value of the month between 8h and 20h
 */
function averageOnMonthFull(data) {
  const avg = [];
  for (let c of calendar.month) {
    const to_read = data.filter((d) => new Date(d.date).getDate() === c);
    avg.push(averageOnDayFull(to_read));
  }
  return parseInt(avg.reduce((acc, cur) => acc + cur, 0) / avg.length, 10);
}

/**
 *
 *
 * @param {any[]} data
 * @return {number} average value of the year between 8h and 20h
 */
function averageOnYearFull(data) {
  const avg = [];
  for (let c of calendar.year) {
    const to_read = data.filter((d) => new Date(d.date).getMonth() === c);
    avg.push(averageOnDayFull(to_read));
  }
  return parseInt(avg.reduce((acc, cur) => acc + cur, 0) / avg.length, 10);
}

/**
 *
 *
 * @param {any[]} data
 * @return {number} total average value between 8h and 20h
 */
function averageOnDecenyFull(data) {
  const today = new Date();
  const avg = [];
  for (let c of calendar.decade) {
    const to_read = data.filter((d) => new Date(d.date).getFullYear() === c);
    avg.push(averageOnDayFull(to_read));
  }
  return parseInt(avg.reduce((acc, cur) => acc + cur, 0) / avg.length, 10);
}

/**
 *
 *
 * @param {any[]} data
 * @return {number} average value of the day between 20h and 8h
 */
function averageOnDayHollow(data) {
  const to_read = data.filter(
    (d) => new Date(d.date).getHours() <= 8 || new Date(d.date).getHours() >= 20
  );
  const qot = to_read.length > 0 ? to_read.length : 1;
  return parseInt(to_read.reduce((acc, cur) => acc + cur.value, 0) / qot, 10);
}

/**
 *
 *
 * @param {any[]} data
 * @return {number} average value of the week between 20h and 8h
 */
function averageOnWeekHollow(data) {
  const avg = [];
  for (let c of calendar.week) {
    const to_read = data.filter((d) => new Date(d.date).getDay() === c);
    avg.push(averageOnDayHollow(to_read));
  }
  return parseInt(avg.reduce((acc, cur) => acc + cur, 0) / avg.length, 10);
}

/**
 *
 *
 * @param {any[]} data
 * @return {number} average value of the month between 20h and 8h
 */
function averageOnMonthHollow(data) {
  const avg = [];
  for (let c of calendar.month) {
    const to_read = data.filter((d) => new Date(d.date).getDate() === c);
    avg.push(averageOnDayHollow(to_read));
  }
  return parseInt(avg.reduce((acc, cur) => acc + cur, 0) / avg.length, 10);
}

/**
 *
 *
 * @param {any[]} data
 * @return {number} average value of the year between 20h and 8h
 */
function averageOnYearHollow(data) {
  const avg = [];
  for (let c of calendar.year) {
    const to_read = data.filter((d) => new Date(d.date).getMonth() === c);
    avg.push(averageOnDayHollow(to_read));
  }
  return parseInt(avg.reduce((acc, cur) => acc + cur, 0) / avg.length, 10);
}

/**
 *
 *
 * @param {any[]} data
 * @return {number} total average value between 20h and 8h
 */
function averageOnDecenyHollow(data) {
  const today = new Date();
  const avg = [];
  for (let c of calendar.decade) {
    const to_read = data.filter((d) => new Date(d.date).getFullYear() === c);
    avg.push(averageOnDayHollow(to_read));
  }
  return parseInt(avg.reduce((acc, cur) => acc + cur, 0) / avg.length, 10);
}

/**
 *
 *
 * @export
 * @param {*} to_split
 * @return {*} time series data splitten by day, week, month, year, decade
 */
export function splitByPeriode(to_split) {
  const today = new Date();

  const series = {
    decade: [[], []],
    year: [[], []],
    month: [[], []],
    week: [[], []],
    day: [[], []],
  };

  for (let values of to_split) {
    let inter = values.filter((v) => v.value !== null);
    for (let c of calendar.decade) {
      const to_read = inter.filter((v) => new Date(v.date).getFullYear() === c);
      series.decade[0].push(averageOnDecenyFull(to_read));
      series.decade[1].push(averageOnDecenyHollow(to_read));
    }

    const inYear = inter.filter((v) => sameYear(new Date(v.date), today));
    for (let c of calendar.year) {
      const to_read = inYear.filter((v) => new Date(v.date).getMonth() === c);
      series.year[0].push(averageOnYearFull(to_read));
      series.year[1].push(averageOnYearHollow(to_read));
    }

    const inMonth = inYear.filter((v) => sameMonth(new Date(v.date), today));
    for (let c of calendar.month) {
      const to_read = inMonth.filter((v) => new Date(v.date).getDate() === c);
      series.month[0].push(averageOnMonthFull(to_read));
      series.month[1].push(averageOnMonthHollow(to_read));
    }

    const inWeek = inMonth.filter((v) => sameWeek(new Date(v.date), today));
    for (let c of calendar.week) {
      const to_read = inWeek.filter((v) => new Date(v.date).getDay() === c);
      series.week[0].push(averageOnWeekFull(to_read));
      series.week[1].push(averageOnWeekHollow(to_read));
    }

    const inDay = inWeek.filter((v) => sameDay(new Date(v.date), today));
    for (let c of calendar.day) {
      const to_read = inDay.filter((v) => new Date(v.date).getHours() === c);
      series.day[0].push(averageOnDayFull(to_read));
      series.day[1].push(averageOnDayHollow(to_read));
    }
  }

  return series;
}

/**
 * set the time series data in the state
 * @param {*} param0
 */
export async function setAverageTimeSeries({ commit, state, rootState }) {
  try {
    const building_time_series = [];
    const floors_time_series = [];
    for (let endpoint of state.endpoints) {
      const building_endpoint = await getControlEndpointstAsync(
        rootState.building.dynamicId,
        endpoint
      );
      if (building_endpoint) {
        building_time_series.push(
          await getTimeSeriesAsync(building_endpoint.dynamicId)
        );
      } else {
        building_time_series.push([]);
      }
    }
    for (let floor of rootState.floors) {
      const floor_series = [];
      for (let endpoint of state.endpoints) {
        let floor_endpoint = await getControlEndpointstAsync(
          floor.dynamicId,
          endpoint
        );
        if (floor_endpoint) {
          floor_series.push(await getTimeSeriesAsync(floor_endpoint.dynamicId));
        } else {
          floor_series.push([]);
        }
      }
      floors_time_series.push({
        floor: floor.name,
        series: splitByPeriode(floor_series),
      });
    }
    commit('SET_TIME_SERIES', {
      building_time_series: splitByPeriode(building_time_series),
      floors_time_series,
    });
  } catch (error) {
    console.log(error);
  }
}
