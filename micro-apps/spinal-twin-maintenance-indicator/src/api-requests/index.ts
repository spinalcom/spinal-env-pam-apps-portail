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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import moment from "moment";
import * as config from "../../config.js";

// durée de relevé des time séries : 10 ans
const today = moment();
today.hours(0);
today.minutes(0);

// Contexte spatial du bâtiment(bâtiment, étages et pièces)
export async function getBuildingAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`/building/${buildingId}/building/read`);
  return result.data;
}

// Liste des salles d'un étage
export async function getRoomList(floorId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/floor/${floorId}/room_list`
  );
  return result.data;
}

// Points de contrôle
export async function getNodeControlEndpointsListAsync(nodeId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/node/${nodeId}/control_endpoint_list`
  );
  return result.data.find(
    (d: any) => d.profileName === config.controlPointProfil.name
  );
}

export async function getControlEndPointByNameAsync(
  nodeId: number,
  endpoint: string
) {
  const controlEndPointList = await getNodeControlEndpointsListAsync(nodeId);
  return controlEndPointList.endpoints.find(
    (scp: any) => scp.name === endpoint
  );
}

// Time series
export async function getTimeSeriesAsync(
  endpointId: number,
  index: number = 0
) {
  const end = moment(today).add(index * 10, "year");
  end.month(12);
  end.date(0);
  const begin = moment(end).add(-9, "year");
  begin.month(0);
  begin.date(1);
  begin.hour(0);

  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/endpoint/${endpointId}/timeSeries/read/${begin.format(
      "DD-MM-YYYY HH:mm:ss"
    )}/${end.format("DD-MM-YYYY HH:mm:ss")}`
  );
  return result.data;
}

export async function getYearTimeSeriesAsync(
  endpointId: number,
  index: number = 0
) {
  const end = moment(today).add(index, "year");
  end.month(12);
  end.date(31);
  const begin = moment(end).subtract(12, "months");
  begin.date(1);

  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/endpoint/${endpointId}/timeSeries/read/${begin.format(
      "DD-MM-YYYY HH:mm:ss"
    )}/${end.format("DD-MM-YYYY HH:mm:ss")}`
  );
  return result.data;
}

export async function getMonthTimeSeriesAsync(
  endpointId: number,
  index: number = 0
) {
  const end = moment(today).add(index, "month");
  end.date(end.daysInMonth());
  const begin = moment(end).subtract(end.daysInMonth(), "days");

  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/endpoint/${endpointId}/timeSeries/read/${begin.format(
      "DD-MM-YYYY HH:mm:ss"
    )}/${end.format("DD-MM-YYYY HH:mm:ss")}`
  );
  return result.data;
}

export async function getWeekTimeSeriesAsync(
  endpointId: number,
  index: number = 0
) {
  const end = moment(today).add(index, "week");
  end.day(7);
  end.hour(0);
  const begin = moment(end).add(-7, "days");

  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/endpoint/${endpointId}/timeSeries/read/${begin.format(
      "DD-MM-YYYY HH:mm:ss"
    )}/${end.format("DD-MM-YYYY HH:mm:ss")}`
  );
  return result.data;
}

// Attributs
export async function getAttributsList(nodeId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/node/${nodeId}/attributsList`
  );
  return result.data;
}

// Tickets de maintenances
export async function getWorkflowListAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`/building/${buildingId}/workflow_list`);
  return result.data.filter((t: any) => config.workflowList.includes(t.name));
}

export async function getProcessListAsync(workflowId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `/building/${buildingId}/workflow/${workflowId}/process_list`
  );
  return result.data;
}
