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

import axios from "axios";
import { HTTP, BOS_HTTP_REQUEST } from "./http-constants";
import { IBuilding } from "../interfaces/IBuilding";

export function addDigitalTwinRequest(digitalTwinInfo: IBuilding): Promise<IBuilding> {
  return HTTP.post("/add_building", digitalTwinInfo).then((response) => {
    return response.data;
  })
}

export function getAllDigitalTwinRequest(): Promise<IBuilding[]> {
  return HTTP.get(`/get_all_buildings/`).then((response) => {
    return response.data;
    // const promises = response.data

    // .map(async (building: any) => {
    // building.details = await getBuildingDetail(building.id);
    // return building;
    // });

    // return Promise.all(promises);
  })
}

export function getDigitalTwinRequest(digitalTwinId: string): Promise<IBuilding> {
  return HTTP.get(`/get_building/${digitalTwinId}`).then((response) => {
    return response.data;
  })
}

export function editDigitaltwinRequest(digitalTwinId: string, digitalTwinInfo: IBuilding): Promise<IBuilding> {
  return HTTP.put(`/edit_building/${digitalTwinId}`, digitalTwinInfo).then((response) => {
    return response.data;
  })
}

export function deleteDigitalTwinRequest(digitalTwinId: string): Promise<string> {
  return HTTP.delete(`/delete_building/${digitalTwinId}`).then((response) => {
    return response.data;
  })
}

export function getDigitalTwinContextsRequest(buildingId: string) {
  return BOS_HTTP_REQUEST
    .get(`${buildingId}/api/v1/geographicContext/tree`)
    .then((response) => {
      const contextGeo = response.data;
      return countTypeHelper(contextGeo);
    })
    .catch((err) => {
      console.error(err);
    });
}

export function getBuildingArea(buildingId: string) {
  return BOS_HTTP_REQUEST
    .get(`${buildingId}/api/v1/building/read`)
    .then((response) => {
      return response.data.area;
    })
    .catch((err) => {
      console.error(err);
    });
}

function countTypeHelper(building: any) {
  const obj: { [key: string]: number } = {};

  const countType = (item: any) => {
    if (!item) return;
    if (!obj[item.type]) obj[item.type] = 1;
    else obj[item.type] = obj[item.type] + 1;
    (item.children || []).forEach((element: any) => {
      countType(element);
    });
  }

  countType(building);
  return obj;
}


async function getBuildingDetail(buildingId: string) {
  const detail: any = await getDigitalTwinContextsRequest(buildingId);
  detail.area = await getBuildingArea(buildingId)

  return detail;
}

