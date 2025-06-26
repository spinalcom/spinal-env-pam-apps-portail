import * as ticketAPI from "../../../spinalAPI/Workflow & ticket/ticketContext";
import * as nodeAPI from "../../../spinalAPI/Attributes/nodeAttributes";
import * as geoAPI from "../../../spinalAPI/GeographicContext/geographicContext";
import { config } from "../../../../config";

const closedSteps = config.ticketConfig.steps.closed;
const workflow_list = config.ticketConfig.workflowList;

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
export let fullstepList: any[] = [];
export async function loadTickets(): Promise<Array<any>> {
  const stepList = <any[]>[];
  const workflows = await ticketAPI.getWorkflowList();
  const workflowList = workflows.filter((w) => workflow_list.includes(w.name));
  for (const workflow of workflowList) {
    const processList = await ticketAPI.getProcessList(workflow.dynamicId);
    fullstepList = await ticketAPI.getStepList(
      workflow.dynamicId,
      processList[0].dynamicId
    );

    for (const process of processList) {
      const steps = (
        await ticketAPI.getStepList(workflow.dynamicId, process.dynamicId)
      ).filter((s) => !closedSteps.includes(s.name));
      stepList.push(...steps);
    }
  }

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
  console.log("result", result);
  return result;
}

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

  if (config.ticketConfig.targetAttributes) {
    const positionsXYZ = await nodeAPI.Attribute_list_multiple(
      ticketsFiltered.map((t) => t.elementSelected?.dynamicId).filter(Boolean)
    );
    console.log("positionsXYZ", positionsXYZ);
    return mapTicketAndXYZPosition(ticketsFiltered, positionsXYZ);
  } else {
    const positionsXYZ = await nodeAPI.Attribute_list_multiple(
      ticketsFiltered.map((t) => t.dynamicId).filter(Boolean)
    );
    return mapTicketAndAtt(ticketsFiltered, positionsXYZ);
  }
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

function mapTicketAndAtt(ticketTab, XYZTab) {
  // Get attribute config for generic "ticket" elements
  let attributesToGet: string[] = [];

  try {
    const ticketAttrConfig = config?.ticketConfig?.attributesByType?.ticket;
    if (ticketAttrConfig && typeof ticketAttrConfig === "object") {
      for (const category in ticketAttrConfig) {
        if (
          Array.isArray(ticketAttrConfig[category]) &&
          ticketAttrConfig[category].length > 0
        ) {
          for (const attrName of ticketAttrConfig[category]) {
            if (attrName) attributesToGet.push(attrName);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Error parsing ticket attribute config:", err);
  }
  const attributesTab = XYZTab.find((a) => a.dynamicId == t.dynamicId);
  console.log("attributesTab", attributesTab);
  return ticketTab.map((t) => {
    const attributesTab = XYZTab.find((a) => a.dynamicId == t.dynamicId);
    if (attributesTab) {
      for (const cat of attributesTab.categoryAttributes || []) {
        if (cat.name === "default" && Array.isArray(cat.attributs)) {
          // Map XYZ center
          const xyzAttr = cat.attributs.find(
            (attr) => attr.label === "XYZ center"
          );
          if (xyzAttr && xyzAttr.value) {
            t.elementSelected["XYZ center"] = xyzAttr.value;
          }
          // Extract attributes using config OR fallback to first
          let selectedAttributes;

          if (attributesToGet.length > 0) {
            selectedAttributes = cat.attributs
              .filter(
                (attr) =>
                  attr?.label &&
                  attr?.value != null &&
                  attributesToGet.includes(attr.label)
              )
              .map((attr) => ({
                label: attr.label,
                value: attr.value,
              }));
          }

          // Fallback if no configured attributes were found or selectedAttributes is empty
          if (!selectedAttributes || selectedAttributes.length === 0) {
            selectedAttributes = cat.attributs
              .filter(
                (attr) =>
                  attr?.label &&
                  attr?.value != null &&
                  attr.label !== "" &&
                  attr.value !== ""
              )
              .slice(0, 4)
              .map((attr) => ({
                label: attr.label,
                value: attr.value,
              }));
          }

          t.elementSelected["attributes"] = selectedAttributes;
          return t;
        }
      }
    }

    // If no Spatial or attribute category found
    t.elementSelected["attributes"] = [];
    return t;
  });
}

function mapTicketAndXYZPosition(ticketTab, XYZTab) {
  return ticketTab.map((t) => {
    const typeMap = {
      geographicRoom: "room",
      geographicBuilding: "building",
      geographicFloor: "floor",
      BIMObject: "equipment",
    };

    const elementType = t.elementSelected?.type;
    const mappedType = typeMap[elementType];

    const attributesTab = XYZTab.find(
      (a) => a.dynamicId == t.elementSelected.dynamicId
    );

    let attributesToGet = [];
    try {
      if (
        mappedType &&
        config?.ticketConfig?.attributesByType?.[mappedType] &&
        typeof config.ticketConfig.attributesByType[mappedType] === "object"
      ) {
        // Get all category names under this type
        const categoryObject = config.ticketConfig.attributesByType[mappedType];
        for (const category in categoryObject) {
          if (
            Array.isArray(categoryObject[category]) &&
            categoryObject[category].length > 0
          ) {
            for (const attrName of categoryObject[category]) {
              if (attrName) attributesToGet.push(attrName);
            }
          }
        }
      }
    } catch (e) {
      console.warn(
        `Error accessing attribute config for type ${mappedType}`,
        e
      );
    }

    if (attributesTab) {
      for (const cat of attributesTab.categoryAttributes || []) {
        if (cat.name === "Spatial" && Array.isArray(cat.attributs)) {
          // Map XYZ center
          const xyzAttr = cat.attributs.find(
            (attr) => attr.label === "XYZ center"
          );
          if (xyzAttr && xyzAttr.value) {
            t.elementSelected["XYZ center"] = xyzAttr.value;
          }

          // Extract attributes using config OR fallback to first 4
          let selectedAttributes;

          if (attributesToGet.length > 0) {
            selectedAttributes = cat.attributs
              .filter(
                (attr) =>
                  attr?.label &&
                  attr?.value != null &&
                  attributesToGet.includes(attr.label)
              )
              .map((attr) => ({
                label: attr.label,
                value: attr.value,
              }));
          } else {
            selectedAttributes = cat.attributs
              .filter(
                (attr) =>
                  attr?.label &&
                  attr?.value != null &&
                  attr.label !== "" &&
                  attr.value !== ""
              )
              .slice(0, 4)
              .map((attr) => ({
                label: attr.label,
                value: attr.value,
              }));
          }

          t.elementSelected["attributes"] = selectedAttributes;
          return t;
        }
      }
    }

    // Fallback if no Spatial or valid attributes
    t.elementSelected["attributes"] = [];
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
          stepCountFloorList: [],
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
      if (ticket.step && typeof ticket.step.name === "string") {
        const stepList = returnTab[floorDynamicId].stepCountFloorList;

        const existingStep = stepList.find(
          (s: any) => s.name === ticket.step.name
        );

        if (existingStep) {
          existingStep.count++;
        } else {
          stepList.push({
            name: ticket.step.name,
            count: 1,
            order: ticket.step.order ?? 0,
            color: ticket.step.color ?? "#000000",
          });
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
export function regroupFullTicketsByRoom(to_update: any[]) {
  const returnTab: Record<string, any> = {};

  for (const ticket of to_update) {
    let roomDynamicId: string | null = null;
    let XYZCenter: any = null;
    let roomName: string | null = null;
    let ticketType: "room" | "object" | null = null;

    if (ticket.elementSelected.type === "geographicRoom") {
      roomDynamicId = ticket.elementSelected.dynamicId;
      XYZCenter = ticket.elementSelected["XYZ center"];
      roomName = ticket.elementSelected.name || "Unknown Room";
      ticketType = "room";
    } else if (ticket.elementSelected.type === "BIMObject") {
      if (
        ticket.elementSelected.position &&
        ticket.elementSelected.position.room
      ) {
        roomDynamicId = ticket.elementSelected.position.room.dynamicId;
        XYZCenter = ticket.elementSelected.position.room["XYZ center"];
        roomName = ticket.elementSelected.position.room.name || "Unknown Room";
        ticketType = "object";
      }
    }

    if (roomDynamicId) {
      if (!returnTab[roomDynamicId]) {
        returnTab[roomDynamicId] = {
          dynamicId: roomDynamicId,
          roomName: roomName,
          "XYZ center": XYZCenter,
          ticketList: [],
          countRoomTickets: 0,
          countObjectTickets: 0,
          countRoomList: [0, 0, 0],
        };
      }

      returnTab[roomDynamicId].ticketList.push(ticket);

      if (ticketType === "room") {
        returnTab[roomDynamicId].countRoomTickets++;
        if (ticket.priority === 0) {
          returnTab[roomDynamicId].countRoomList[0]++;
        } else if (ticket.priority === 1) {
          returnTab[roomDynamicId].countRoomList[1]++;
        } else if (ticket.priority === 2) {
          returnTab[roomDynamicId].countRoomList[2]++;
        }
      } else if (ticketType === "object") {
        returnTab[roomDynamicId].countObjectTickets++;
      }
    }
  }

  for (const roomId in returnTab) {
    let zValue = 0;
    const ticketList = returnTab[roomId].ticketList;

    const firstRoomTicket = ticketList.find(
      (ticket: any) => ticket.elementSelected.type === "geographicRoom"
    );

    if (firstRoomTicket) {
      const xyz = firstRoomTicket.elementSelected["XYZ center"];
      if (xyz) {
        zValue = parseFloat(xyz.split(";")[2]) || 0;
      }
    } else if (ticketList.length > 0) {
      const firstTicket = ticketList[0];
      const xyz = firstTicket.elementSelected["XYZ center"];
      if (xyz) {
        zValue = parseFloat(xyz.split(";")[2]) || 0;
      }
    }

    returnTab[roomId]["XYZ center"] = { X: 0, Y: 0, Z: zValue };
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
