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

import { it } from "node:test";
import { calculTypes } from "../../interfaces/IConfig";
import { INodeItemTree } from "../../interfaces/INodeItem";
import { getTimeSeriesAsync } from "../spinalAPI/endpoints/getEndpoints";

export async function calculItemsValue(
  data: INodeItemTree[],
  calculMode: calculTypes,
  time?: any
): Promise<INodeItemTree[]> {
  return await Promise.all(
    data.flatMap(async (item) => {
      const values = await Promise.all(
        item.children.map(async (el) => await getValue(el, calculMode, time))
      );
      const value = calculateValue(values, calculMode);

      item.displayValue = isFinite(value) ? value : "-";
      return item;
    })
  );
}

export function getColor(item, legend) {
  const value = item.displayValue;

  if (isNaN(value)) return legend.min.color;

  if (!isFinite(value)) return value < 0 ? legend.min.color : legend.max.color;

  if (legend.median) {
    const third = legend.min.value + (legend.max.value - legend.min.value) / 3;
    const two_third =
      legend.min.value + ((legend.max.value - legend.min.value) * 2) / 3;

    if (value <= third) return legend.min.color;
    if (value <= two_third) return legend.median.color;
    return legend.max.color;
  }

  return value <= legend.max.value / 2 ? legend.min.color : legend.max.color;
}

async function getValue(
  item: INodeItemTree,
  calculMode: calculTypes,
  time?: any
) {
  if (!time) {
    item.displayValue =
      item.endpoint?.value?.toString() ||
      item.endpoint?.currentValue?.toString() ||
      "-";
    return item.displayValue;
  }
  const buildingId = localStorage.getItem("idBuilding") || "";
  const values = (
    await getTimeSeriesAsync(
      buildingId,
      item.endpoint.dynamicId,
      time.begin,
      time.end
    )
  ).map((el) => el.value);
  item.displayValue = calculateValue(values, calculMode);
  return item.displayValue;
}

export function calculateValue(
  arr: (string | number)[],
  calculMode: calculTypes
): number {
  const nums = _filterAndconvertDataToNumber(arr);

  switch (calculMode) {
    case calculTypes.Maximum:
      return getMax(nums);
    case calculTypes.Minimum:
      return getMin(nums);
    case calculTypes.Somme:
      return getSum(nums);
    case calculTypes.Moyenne:
      return getMoyenne(nums);
    case calculTypes.MoyennePercent:
      return getMoyenne(nums) * 100;
  }
}

function getMax(arr: number[]) {
  return Math.max(...arr);
}

function getMin(arr: number[]) {
  return Math.min(...arr);
}

function getSum(arr: number[]) {
  return arr.reduce((sum, i) => {
    sum += i;
    return sum;
  }, 0);
}

function getMoyenne(arr: number[]) {
  const sum = getSum(arr);
  return sum / arr.length;
}

function _filterAndconvertDataToNumber(arr: (string | number)[]): number[] {
  return arr.reduce((list, i) => {
    //@ts-ignore
    if (!isNaN(i as any)) list.push(Number(i as any));
    return list;
  }, []);
}
