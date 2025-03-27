import * as ticketAPI from "../../../spinalAPI/Workflow & ticket/ticketContext";
import * as nodeAPI from "../../../spinalAPI/Attributes/nodeAttributes";
import * as geoAPI from "../../../spinalAPI/GeographicContext/geographicContext";
import { ticketConfig } from "../../../../config";

const closedSteps = ticketConfig.steps.closed;
const workflow_list = ticketConfig.workflowList;

export async function getWorkflowList(): Promise<any[]> {
  try {
    const workflows = await ticketAPI.getWorkflowList();
    return workflows;
  } catch (error) {
    console.error("Error fetching workflow list:", error);
    return [];
  }
}
export async function getProcessList(workflows: any[]): Promise<any[]> {
  const processList: any[] = [];
  for (const workflow of workflows) {
    try {
      const processes = await ticketAPI.getProcessList(workflow.dynamicId);
      processList.push(...processes);
    } catch (error) {
      console.error(
        `Error fetching processes for workflow ${workflow.name}:`,
        error
      );
    }
  }
  return processList;
}

export async function loadTickets(): Promise<Array<any>> {
  const stepList = <any[]>[];
  const workflows = await ticketAPI.getWorkflowList();
  // console.log("workflows", workflows);
  const workflowList = workflows.filter((w) => workflow_list.includes(w.name));
  for (const workflow of workflowList) {
    const processList = await ticketAPI.getProcessList(workflow.dynamicId);
    for (const process of processList) {
      const steps = (
        await ticketAPI.getStepList(workflow.dynamicId, process.dynamicId)
      ).filter((s) => !closedSteps.includes(s.name));
      stepList.push(...steps);
    }
  }
  // console.log("stepList", stepList);
  const ticketList = (
    await ticketAPI.getTicketListMultiple(stepList.map((s) => s.dynamicId))
  ).flatMap((result) => result.tickets);
  const detailedTickets = await ticketAPI.getTicketDetailsMultiple(
    ticketList.map((t) => t?.dynamicId)
  );
  // const detailedTickets_withoutError_only_BIMOBJ = detailedTickets.filter((t) => (!t.error && t.elementSelected.type == "BIMObject"));
  const detailedTickets_reduced = detailedTickets.reduce(
    (acc, t) => {
      if (!t.error && t.elementSelected.type == "geographicRoom")
        acc.rooms.push(t);
      else if (!t.error && t.elementSelected.type == "BIMObject")
        acc.BIMObjects.push(t);
      else if (!t.error && t.elementSelected.type == "geographicFloor")
        acc.floors.push(t);
      else if (!t.error && t.elementSelected.type == "geographicBuilding")
        acc.buildings.push(t);
      return acc;
    },
    { rooms: [], BIMObjects: [], floors: [], buildings: [] }
  );
  const BIMObjects_positions = await geoAPI.equipment_get_position_multiple(
    detailedTickets_reduced.BIMObjects.map((e) => e.elementSelected.dynamicId)
  );
  const rooms_positions = await geoAPI.room_get_position_multiple(
    detailedTickets_reduced.rooms.map((e) => e.elementSelected.dynamicId)
  );
  const floors_positions = detailedTickets_reduced.floors.map((e) => ({
    ...e,
    elementSelected: {
      ...e.elementSelected,
      position: { floor: { ...e.elementSelected } },
    },
  }));
  const buildings_positions = detailedTickets_reduced.buildings.map((e) => ({
    ...e,
    elementSelected: {
      ...e.elementSelected,
      position: { building: { ...e.elementSelected } },
    },
  }));

  const result = [
    ...mapTicketAndPosition(detailedTickets_reduced.rooms, rooms_positions),
    ...mapTicketAndPosition(
      detailedTickets_reduced.BIMObjects,
      BIMObjects_positions
    ),
    ...floors_positions,
    ...buildings_positions,
  ];
  return result;
}

// export async function filterTicketsOnPosition(
//   tickets: Array<any>,
//   buildingId: string,
//   dynamicId: number
// ): Promise<Array<any>> {
//   const ticketsFiltered = tickets.filter((t) => {
//     const keys = Object.keys(t.elementSelected?.position);
//     for (const key of keys) {
//       if (t.elementSelected?.position[key]?.dynamicId == dynamicId) return true;
//     }
//   });
//   const positionsXYZ = await nodeAPI.Attribute_list_multiple(
//     ticketsFiltered.map((t) => t.elementSelected.dynamicId)
//   );
//   return mapTicketAndXYZPosition(ticketsFiltered, positionsXYZ);
// }

export async function filterTicketsOnPosition(
  tickets: Array<any>,
  buildingId: string,
  dynamicId: number
): Promise<Array<any>> {
  // If dynamicId is 0, skip filtering and proceed with all tickets
  const ticketsFiltered =
    dynamicId === 0
      ? tickets
      : tickets.filter((t) => {
          if (!t.elementSelected?.position) return false;
          const keys = Object.keys(t.elementSelected.position);
          return keys.some(
            (key) => t.elementSelected.position[key]?.dynamicId === dynamicId
          );
        });

  if (ticketsFiltered.length === 0) return []; // Avoid unnecessary API calls

  const positionsXYZ = await nodeAPI.Attribute_list_multiple(
    ticketsFiltered.map((t) => t.elementSelected?.dynamicId).filter(Boolean)
  );

  return mapTicketAndXYZPosition(ticketsFiltered, positionsXYZ);
}

function mapTicketAndPosition(ticketTab, positionTab) {
  return ticketTab.map((t) => {
    const pos = positionTab.find(
      (p) => p.dynamicId == t.elementSelected.dynamicId
    );
    if (pos) {
      t.elementSelected.position = pos.info;
    }
    return t;
  });
}

function mapTicketAndXYZPosition(ticketTab, XYZTab) {
  return ticketTab.map((t) => {
    const attributesTab = XYZTab.find(
      (a) => a.dynamicId == t.elementSelected.dynamicId
    );
    if (attributesTab) {
      for (const cat of attributesTab.categoryAttributes) {
        if (cat.name == "Spatial") {
          const attribute = cat.attributs.find(
            (attr) => attr.label == "XYZ center"
          );
          if (attribute) t.elementSelected["XYZ center"] = attribute.value;
          return t;
        }
      }
    }
    return t;
  });
}

export function regroupTicketByRoom(ticketTab) {
  const returnTab = new Object();
  let i = 0;
  for (const ticket of ticketTab) {
    i++;
    if (
      ticket.elementSelected.type == "geographicRoom" ||
      ticket.elementSelected.type == "BIMObject"
    ) {
      const dynamicId = ticket.elementSelected.dynamicId;
      if (returnTab[dynamicId]) returnTab[dynamicId].ticketList.push(ticket);
      else {
        returnTab[dynamicId] = {
          "XYZ center": ticket.elementSelected["XYZ center"],
          ticketList: [ticket],
        };
      }
    }
  }
  return returnTab;
}

export function regroupTicketsByFloor(to_update) {
  // const grouped = {};
  const returnTab = new Object();
  let i = 0;

  for (const ticket of to_update) {
    i++;
    if (ticket.elementSelected.type == "geographicFloor") {
      const dynamicId = ticket.elementSelected.dynamicId;
      if (returnTab[dynamicId]) returnTab[dynamicId].ticketList.push(ticket);
      else {
        returnTab[dynamicId] = {
          "XYZ center": ticket.elementSelected["XYZ center"],
          ticketList: [ticket],
        };
      }
    }
  }
  return returnTab;
}
export function regroupFullTicketsByFloor(to_update: any[]) {
  const returnTab: Record<string, any> = {};

  for (const ticket of to_update) {
    let floorDynamicId: string | null = null;
    let XYZCenter: any = null;
    let floorName: string | null = null;
    let ticketType: "floor" | "room" | "object" | null = null;

    if (ticket.elementSelected.type === "geographicFloor") {
      floorDynamicId = ticket.elementSelected.dynamicId;
      XYZCenter = ticket.elementSelected["XYZ center"];
      floorName = ticket.elementSelected.name || "Unknown Floor";
      ticketType = "floor";
    } else if (
      ticket.elementSelected.type === "geographicRoom" ||
      ticket.elementSelected.type === "BIMObject"
    ) {
      if (
        ticket.elementSelected.position &&
        ticket.elementSelected.position.floor
      ) {
        floorDynamicId = ticket.elementSelected.position.floor.dynamicId;
        XYZCenter = ticket.elementSelected.position.floor["XYZ center"];
        floorName =
          ticket.elementSelected.position.floor.name || "Unknown Floor";
      }

      ticketType =
        ticket.elementSelected.type === "geographicRoom" ? "room" : "object";
    }

    if (floorDynamicId) {
      if (!returnTab[floorDynamicId]) {
        returnTab[floorDynamicId] = {
          dynamicId: floorDynamicId,
          floorName: floorName,
          "XYZ center": XYZCenter,
          ticketList: [],
          countFloorTickets: 0,
          countRoomTickets: 0,
          countObjectTickets: 0,
          countFloorList: [0, 0, 0],
        };
      }

      returnTab[floorDynamicId].ticketList.push(ticket);

      if (ticketType === "floor") {
        returnTab[floorDynamicId].countFloorTickets++;
      } else if (ticketType === "room") {
        returnTab[floorDynamicId].countRoomTickets++;
      } else if (ticketType === "object") {
        returnTab[floorDynamicId].countObjectTickets++;
      }

      if (ticketType === "floor") {
        if (ticket.priority === 0) {
          returnTab[floorDynamicId].countFloorList[0]++;
        } else if (ticket.priority === 1) {
          returnTab[floorDynamicId].countFloorList[1]++;
        } else if (ticket.priority === 2) {
          returnTab[floorDynamicId].countFloorList[2]++;
        }
      }
    }
  }
  for (const floorId in returnTab) {
    let zValue = 0;
    const ticketList = returnTab[floorId].ticketList;

    // Find first geographicRoom in ticketList
    const firstRoomTicket = ticketList.find(
      (ticket: any) => ticket.elementSelected.type === "geographicRoom"
    );

    if (firstRoomTicket) {
      const xyz = firstRoomTicket.elementSelected["XYZ center"];
      if (xyz) {
        zValue = parseFloat(xyz.split(";")[2]) || 0;
      }
    } else if (ticketList.length > 0) {
      // Take Z from the first item in ticketList if no room is found
      const firstTicket = ticketList[0];
      const xyz = firstTicket.elementSelected["XYZ center"];
      if (xyz) {
        zValue = parseFloat(xyz.split(";")[2]) || 0;
      }
    }

    returnTab[floorId]["XYZ center"] = { X: 0, Y: 0, Z: zValue };
  }
  return returnTab;
}
export function updateItemCounts(data: any[]) {
  let buildingitemsnumber = 0;
  let flooritemsnumber = 0;
  let roomitemsnumber = 0;
  let equipementitemsnumber = 0;

  data.forEach((item) => {
    switch (item.elementSelected.type) {
      case "geographicFloor":
        flooritemsnumber++;
        break;
      case "geographicRoom":
        roomitemsnumber++;
        break;
      case "geographicBuilding":
        buildingitemsnumber++;
        break;
      default:
        equipementitemsnumber++;
    }
  });

  return {
    flooritemsnumber,
    roomitemsnumber,
    equipementitemsnumber,
    buildingitemsnumber,
  };
}

// Enlever les doublons des etapes de tickets
export function extractUniqueSteps(tickets: any[]): any[] {
  const uniqueSteps = new Map();
  tickets.forEach((t) => {
    if (!uniqueSteps.has(t.step.name)) {
      uniqueSteps.set(t.step.name, t.step);
    }
  });

  return [...uniqueSteps.values()].sort((a, b) => a.order - b.order);
}
