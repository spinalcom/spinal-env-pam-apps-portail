import { HTTP } from "./http-constants";
import * as config from "../../../config";

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
  building.children = [
    ...(await getFloorListAsync()).map((f) => ({ ...f, tickets: <any[]>[] })),
  ];

  /*await Promise.all(
    building.children.map(
      async (floor) =>
        (floor.children = [
          ...(
            await getRoomListAsync(floor.dynamicId)
          ).map((r) => ({
            ...r,
            tickets: <any[]>[],
          })),
        ])
    )
  );*/
  for (const child of building.children) {
    child.children = [
      ...(await getRoomListAsync(child.dynamicId)).map((r) => ({
        ...r,
        tickets: <any[]>[],
      })),
    ];
    await Promise.all(
      child.children.map(async (room) => {
        room.children = [
          ...(await getEquipementListAsync(room.dynamicId)).map((e) => ({
            ...e,
            tickets: <any[]>[],
          })),
        ];
      })
    );
  }
  return building;
}

export async function getPositionAsync(dynamicId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `building/${buildingId}/equipement/${dynamicId}/get_position`
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
export async function getEquipementListAsync(floorId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `building/${buildingId}/room/${floorId}/equipement_list`
  );
  return result.data;
}

// Tickets de maintenances
export async function getWorkflowListAsync() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`building/${buildingId}/workflow/list`);
  return result.data;
}

export async function getProcessListAsync(workflowId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `building/${buildingId}/workflow/${workflowId}/processList`
  );
  return result.data;
}

export async function getStepListAsync(workflowId: number, processId: number) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(
    `building/${buildingId}/workflow/${workflowId}/process/${processId}/stepList`
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
  return { ...result.data, buildingName: config.ticketConfig.buildingName };
}

export async function getTicketDetailsMultipleAsync(ticketIds: number[]) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.post(
    `building/${buildingId}/ticket/read_details_multiple`,
    ticketIds
  );
  return result.data;
}
