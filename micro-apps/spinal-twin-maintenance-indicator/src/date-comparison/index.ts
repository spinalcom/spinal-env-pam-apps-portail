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

import moment from "moment";
import "moment/locale/fr";

moment.locale("fr", {
  months: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  weekdays: [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ],
});

const calendar_dates = {
  decade: <number[]>[],
  year: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  month: Array(31)
    .fill(0)
    .map((e, i) => i + 1),
  week: [1, 2, 3, 4, 5, 6, 0],
  day: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ],
};

const currentYear = moment().year();

for (let i = 9; i >= 0; i--) calendar_dates.decade.push(currentYear - i);

export const calendar = calendar_dates;

function compareDates(date1: Date, date2: Date) {
  return date1 > date2
    ? { sup: date1, inf: date2 }
    : { sup: date2, inf: date1 };
}

export function sameDecade(date1: Date, date2: Date) {
  const { inf, sup } = compareDates(date1, date2);
  return moment(inf).isBetween(moment(sup).subtract(9, "year"), sup);
}

export function sameYear(date1: Date, date2: Date) {
  return moment(date1).isSame(date2, "year");
}

export function sameMonth(date1: Date, date2: Date) {
  return moment(date1).isSame(date2, "month");
}

export function sameWeek(date1: Date, date2: Date) {
  return moment(date1).isSame(date2, "week");
}

export function sameDay(date1: Date, date2: Date) {
  return moment(date1).isSame(date2, "day");
}
