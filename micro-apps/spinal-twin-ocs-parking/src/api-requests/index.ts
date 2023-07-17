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

import { HTTP } from "./http-constants";
import moment from "moment";

const today = moment();
today.hours(0);
today.minutes(0);

//group api
export async function getRoomGroupContextsAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`/building/${buildingId}/roomsGroup/list`);
  return result.data;
}

export async function getRoomGroupCategoriesAsync(contextId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/roomsGroup/${contextId}/category_list`
  );
  return result.data;
}

export async function getRoomGroupGroupsAsync(
  contextId: number,
  categoryId: number
) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/roomsGroup/${contextId}/category/${categoryId}/group_list`
  );
  return result.data;
}

// endpoints & time series
export async function getEndpointListAsync(nodeId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/node/${nodeId}/endpoint_list`
  );
  return result.data;
}

export async function getControlEndpointListAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/node/control_endpoint_list`
  );
  return result.data;
}

export async function getDayTimeSeries(endpointId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/endpoint/${endpointId}/timeSeries/readCurrentDay`
  );
  return result.data;
}

export async function getTimeSeriesAsync(endpointId: number, index: number) {
  const begin = moment(today).add(index, "days");
  const end = moment(begin).add(1, "days");

  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/endpoint/${endpointId}/timeSeries/read/${begin.format(
      "DD-MM-YYYY HH:mm:ss"
    )}/${end.format("DD-MM-YYYY HH:mm:ss")}`
  );
  return result.data;
}

// building
export async function getBuildingAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`/building/${buildingId}/building/read`);
  return result.data;
}

export async function getFileAsync(nodeId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.post(
    `/building/${buildingId}/node/${nodeId}/download_file`,
    null,
    { responseType: "blob" }
  );
  return window.URL.createObjectURL(result.data);
}

export async function getBuildingSpaceTreeAsync() {
  const building = await getBuildingAsync();
  building.children = [...(await getFloorListAsync())];

  for (const child of building.children)
    child.children = [...(await getRoomListAsync(child.dynamicId))];
  return building;
}

export async function getPositionAsync(dynamicId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `building/${buildingId}/equipement/${dynamicId}/get_postion`
  );
  return result.data;
}

export async function getFloorListAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`building/${buildingId}/floor/list`);
  return result.data;
}
export async function getRoomListAsync(floorId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `building/${buildingId}/floor/${floorId}/room_list`
  );
  return result.data;
}

export async function getTicketListAsync(nodeId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `building/${buildingId}/node/${nodeId}/ticket_list`
  );
  return result.data;
}

// Tickets de maintenances
export async function getWorkflowListAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`building/${buildingId}/workflow/list`);
  return result.data;
}
export async function getTicketWorkflowAsync() {
  const result = await getWorkflowListAsync();
  return result[0];
}

export async function getWorkflowTreeAsync(workflowId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `building/${buildingId}/workflow/${workflowId}/tree`
  );
  return result.data;
}

export async function getTicketDetailsAsync(ticketId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `building/${buildingId}/ticket/${ticketId}/read_details`
  );
  return result.data;
}
