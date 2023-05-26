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

export async function getFileAsync(buildingId: number, nodeId: number) {
  const result = await HTTP.post(
    `/building/${buildingId}/node/${nodeId}/download_file`,
    null,
    { responseType: "blob" }
  );
  return window.URL.createObjectURL(result.data);
}

// Tickets de maintenances
export async function getWorkflowListAsync(buildingId: number) {
  const result = await HTTP.get(`building/${buildingId}/workflow/list`);
  return result.data;
}

export async function getWorkflowTreeAsync(
  buildingId: number,
  workflowId: number
) {
  const result = await HTTP.get(
    `building/${buildingId}/workflow/${workflowId}/tree`
  );
  return result.data;
}

export async function getTicketDetailsAsync(
  buildingId: number,
  ticketId: number
) {
  const result = await HTTP.get(
    `building/${buildingId}/ticket/${ticketId}/read_details`
  );
  return result.data;
}
