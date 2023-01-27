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
  sameDay,
  sameWeek,
  sameMonth,
  sameYear,
  calendar,
} from "../date-comparison";

/**
 *
 *
 * @export
 * @param {*} to_split
 * @return {*} tickets splitten by day, week, month, year, decade
 */
export function splitByPeriode(to_split: any[]) {
  const today = new Date();
  const series = {
    decade: <any[]>[],
    year: <any[]>[],
    month: <any[]>[],
    week: <any[]>[],
    day: <any[]>[],
  };

  for (const values of to_split) {
    const val = values.find((v: any) => v.step);
    const step = val ? val.step : "";
    let inter = [...values];
    let serie = [];
    for (let c of calendar.decade) {
      serie.push(
        inter.filter((e: any) => new Date(e.creation_date).getFullYear() === c)
          .length
      );
    }
    series.decade.push({ label: step, data: serie });

    serie = [];
    inter = inter.filter((tickets: any) =>
      sameYear(new Date(tickets.creation_date), today)
    );
    for (let c of calendar.year) {
      serie.push(
        inter.filter((e: any) => new Date(e.creation_date).getMonth() === c)
          .length
      );
    }
    series.year.push({ label: step, data: serie });

    serie = [];
    inter = inter.filter((tickets: any) =>
      sameMonth(new Date(tickets.creation_date), today)
    );
    for (let c of calendar.month) {
      serie.push(
        inter.filter((e: any) => new Date(e.creation_date).getDate() === c)
          .length
      );
    }
    series.month.push({ label: step, data: serie });

    serie = [];
    inter = inter.filter((tickets: any) =>
      sameWeek(new Date(tickets.creation_date), today)
    );
    for (let c of calendar.week) {
      serie.push(
        inter.filter((e: any) => new Date(e.creation_date).getDay() === c)
          .length
      );
    }
    series.week.push({ label: step, data: serie });

    serie = [];
    inter = inter.filter((tickets: any) =>
      sameDay(new Date(tickets.creation_date), today)
    );
    for (let c of calendar.day) {
      serie.push(
        inter.filter((e: any) => new Date(e.creation_date).getHours() === c)
          .length
      );
    }
    series.day.push({ label: step, data: serie });
  }

  return series;
}

/**
 *
 *
 * @export
 * @param {*} domains
 * @param {*} steps
 * @param {*} tickets
 * @return {*} tickets splitten by domain
 */
export function splitByDomains(domains: any[], steps: any[], tickets: any[]) {
  const domains_inter = [];
  for (let domain of domains) {
    const step_inter = [];
    const domain_tickets =
      domain.name === "Tous les domaines"
        ? tickets
        : tickets.filter((t) => t.domain === domain.name);
    for (let step of steps) {
      const intermediaire = domain_tickets.filter((t) => t.step === step);
      if (intermediaire.length > 0) step_inter.push(intermediaire);
    }
    domains_inter.push({
      name: domain.name,
      number: domain_tickets.length,
      tickets: splitByPeriode(step_inter),
    });
  }
  return domains_inter;
}

/**
 *
 *
 * @export
 * @param {*} declarants
 * @param {*} tickets
 * @return {*} tickets splitten by declarant
 */
export function splitByDeclarants(declarants: any[], tickets: any[]) {
  const declarants_inter = [];
  for (let declarant of declarants) {
    declarants_inter.push({
      label: declarant,
      value: tickets.filter((t) => t.declarant === declarant).length,
    });
  }

  return declarants_inter;
}

/**
 *
 *
 * @export
 * @param {*} tickets
 * @return {number} number of running tickets on a given period
 */
export function runningTickets(tickets: any[]) {
  const rangedTickets = {
    decade: <any[]>[],
    year: <any[]>[],
    month: <any[]>[],
    week: <any[]>[],
    day: <any[]>[],
  };
  const today = new Date();
  rangedTickets.day = tickets.filter((t) =>
    sameDay(new Date(t.creation_date), today)
  );
  rangedTickets.week = tickets.filter((t) =>
    sameWeek(new Date(t.creation_date), today)
  );
  rangedTickets.month = tickets.filter((t) =>
    sameMonth(new Date(t.creation_date), today)
  );
  rangedTickets.year = tickets.filter((t) =>
    sameYear(new Date(t.creation_date), today)
  );
  rangedTickets.decade = tickets;

  return rangedTickets;
}
