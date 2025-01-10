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

export function splitByPeriode(to_split) {
  const today = new Date();
  const series = { decade: [], year: [], month: [], week: [], day: [] };

  for (const values of to_split) {
    let inter = values;
    let serie = [];
    for (const c of calendar.decade) {
      serie.push(
        inter
          .filter((e) => new Date(e.date).getFullYear() === c)
          .map((e) => e.value)
          .reduce((e1, e2) => Math.floor(e1 + e2), 0)
      );
    }
    series.decade.push(serie);

    serie = [];
    inter = inter.filter((bts) => sameYear(new Date(bts.date), today));
    for (let c of calendar.year) {
      serie.push(
        inter
          .filter((e) => new Date(e.date).getMonth() === c)
          .map((e) => e.value)
          .reduce((e1, e2) => Math.floor(e1 + e2), 0)
      );
    }
    series.year.push(serie);

    serie = [];
    inter = inter.filter(
      (bts) =>
        sameMonth(new Date(bts.date), today)
    );
    for (let c of calendar.month) {
      serie.push(
        inter
          .filter(
            (e) =>
              sameMonth(new Date(e.date), today) &&
              new Date(e.date).getDate() === c
          )
          .map((e) => e.value)
          .reduce((e1, e2) => Math.floor(e1 + e2), 0)
      );
    }
    series.month.push(serie);

    serie = [];
    inter = inter.filter((bts) => sameWeek(new Date(bts.date), today));
    for (let c of calendar.week) {
      serie.push(
        inter
          .filter((e) => new Date(e.date).getDay() === c)
          .map((e) => e.value)
          .reduce((e1, e2) => Math.floor(e1 + e2), 0)
      );
    }
    series.week.push(serie);

    serie = [];
    inter = inter.filter((bts) => sameDay(new Date(bts.date), today));
    for (let c of calendar.day) {
      serie.push(
        inter
          .filter((e) => new Date(e.date).getHours() === c)
          .map((e) => e.value)
          .reduce((e1, e2) => Math.floor(e1 + e2), 0)
      );
    }
    series.day.push(serie);
  }

  return series;
}

export async function setTotalTimeSeries({ commit, state }) {
  try {
    const building_time_series = [];
    const floors_time_series = [];
    for (let endpoint of state.endpoints) {
      const building_endpoint = await getControlEndpointstAsync(
        state.building.dynamicId,
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
    for (const floor of state.floors) {
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
