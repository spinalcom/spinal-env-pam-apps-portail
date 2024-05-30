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

const today = new Date();

const calendar_dates = {
  decade: <number[]>[],
  year: <number[]>[],
  month: <number[]>[],
  week: <number[]>[],
  day: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ],
};
const calendar_labels = {
  decade: <number[]>[],
  year: <string[]>[],
  month: <number[]>[],
  week: <string[]>[],
  day: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ],
};

const labels = {
  year: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  week: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
};

const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const lastDayOfMonth = {
  lastMonth: new Date(currentYear, currentMonth, 0).getDate(),
  currentMonth: new Date(currentYear, currentMonth + 1, 0).getDate(),
};
const currentDay = today.getDate() - 1;
const currentDayOfWeek = today.getDay();

function getModuledDay(i: number) {
  if (currentDay < lastDayOfMonth.lastMonth)
    return (currentDay + i) % lastDayOfMonth.lastMonth;
  return i - 1;
}

for (let i = 9; i >= 0; i--) {
  calendar_dates.decade.push(currentYear - i);
  calendar_labels.decade.push(currentYear - i);
}

for (let i = 1; i <= 12; i++) {
  calendar_dates.year.push((currentMonth + i) % 12);
  calendar_labels.year.push(labels.year[(currentMonth + i) % 12]);
}

const month_size =
  currentDay > lastDayOfMonth.lastMonth
    ? currentDay + 1
    : lastDayOfMonth.lastMonth;
for (let i = 1; i <= month_size; i++) {
  calendar_dates.month.push(getModuledDay(i) + 1);
  calendar_labels.month.push(getModuledDay(i) + 1);
}

for (let i = 1; i <= 7; i++) {
  calendar_dates.week.push((currentDayOfWeek + i) % 7);
  calendar_labels.week.push(labels.week[(currentDayOfWeek + i) % 7]);
}

export const calendar = calendar_dates;
export const label = calendar_labels;

function compareDates(date1: Date, date2: Date) {
  return date1 > date2
    ? { sup: date1, inf: date2 }
    : { sup: date2, inf: date1 };
}

export function sameDecade(date1: Date, date2: Date) {
  const { inf, sup } = compareDates(date1, date2);
  return moment(inf).isBetween(moment(sup).subtract(10, "year"), sup);
}

export function sameYear(date1: Date, date2: Date) {
  const { inf, sup } = compareDates(date1, date2);
  return moment(inf).isBetween(moment(sup).subtract(1, "year"), sup);
}

export function sameMonth(date1: Date, date2: Date) {
  const { inf, sup } = compareDates(date1, date2);
  return moment(inf).isBetween(moment(sup).subtract(1, "month"), sup);
}

export function sameWeek(date1: Date, date2: Date) {
  const { inf, sup } = compareDates(date1, date2);
  return moment(inf).isBetween(moment(sup).subtract(6, "days"), sup);
}

export function lastWeek(date: Date) {
  return moment(date).isBetween(
    moment(today).subtract(1, "week"),
    moment(today).subtract(2, "week")
  );
}

export function sameDay(date1: Date, date2: Date) {
  return moment(date1).isSame(date2, "day");
}
