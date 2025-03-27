import { SpinalAPI } from "../SpinalAPI";

export async function getWorkflowList() {
  const platformId = localStorage.getItem("idBuilding") || "";
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    "api/v1/workflow/list"
  );
  let result = await spinalAPI.get(url);
  return result.data;
}

export async function getProcessList(workflowId: number) {
  const platformId = localStorage.getItem("idBuilding") || "";
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    `api/v1/workflow/${workflowId}/processList`
  );
  let result = await spinalAPI.get(url);
  return result.data;
}

export async function getStepList(workflowId: number, processId: number) {
  const platformId = localStorage.getItem("idBuilding") || "";
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    `api/v1/workflow/${workflowId}/process/${processId}/stepList`
  );
  let result = await spinalAPI.get(url);
  return result.data;
}

export async function getTicketListMultiple(stepIds: number[]) {
  const platformId = localStorage.getItem("idBuilding") || "";
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    `api/v1/node/ticket_list_multiple`
  );
  let result = await spinalAPI.post(url, stepIds);
  return result.data;
}

export async function getTicketList(nodeId: number) {
  const platformId = localStorage.getItem("idBuilding") || "";
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    `api/v1/node/${nodeId}/ticket_list`
  );
  let result = await spinalAPI.get(url);
  return result.data;
}

export async function getTicketDetailsMultiple(ticketIds: number[]) {
  const platformId = localStorage.getItem("idBuilding") || "";
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    `api/v1/ticket/read_details_multiple`
  );
  const result = await spinalAPI.post(url, ticketIds);
  return result.data.map((d) => ({ ...d, buildingName: "Bâtiment" }));
}

export async function getTicketDetails(ticketId: number) {
  const platformId = localStorage.getItem("idBuilding") || "";
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    platformId,
    `api/v1/ticket/${ticketId}/read_details`
  );
  const result = await spinalAPI.get(url);
  return { ...result.data, buildingName: "Bâtiment" };
}

// export async function addTicket(ticketId: any) {
//   const platformId = localStorage.getItem("idBuilding") || "";
//   const spinalAPI = SpinalAPI.getInstance();
//   const url = spinalAPI.createUrlWithPlatformId(
//     platformId,
//     `api/v1/ticket/${ticketId}/read_details`
//   );
//   const result = await spinalAPI.get(url);
//   return { ...result.data, buildingName: "Bâtiment" };
// }

export interface Ticket {
  workflow: String;
  process: String;
  nodeDynamicId: number;
  name: String;
  priority: number;
  description: String;
}

export async function createTicket(building: string, data: Ticket) {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    building,
    "api/v1/ticket/create_ticket"
  );
  const res = await spinalAPI.post(url, data);
  return res.data;
}

export async function addTicketDoc(
  building: string,
  ticketId: number,
  file: FormData
) {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    building,
    `api/v1/ticket/${ticketId}/add_doc`
  );
  const res = await spinalAPI.post(url, file);
  return res.data;
}

export async function archiveTicket(
  building: string,
  ticketId: string,
  data: { workflowDynamicId: number; processDynamicId: number }
) {
  const spinalAPI = SpinalAPI.getInstance();
  const url = spinalAPI.createUrlWithPlatformId(
    building,
    `api/v1/ticket/${ticketId}/archive`
  );
  const res = await spinalAPI.post(url, data);
  return res.data;
}
