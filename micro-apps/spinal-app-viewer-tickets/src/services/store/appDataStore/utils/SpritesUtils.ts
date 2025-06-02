// SpriteUtils.ts
import {
  regroupTicketByRoom,
  regroupTicketsByFloor,
  regroupFullTicketsByFloor,
  regroupFullTicketsByRoom,
} from "./ticketUtils";
import SpriteComponent from "../../../../components/data-side/SpriteComponent.vue";
import FullFloorSpriteComponent from "../../../../components/data-side/FullFloorSpriteComponent.vue";

const updateSprites = async ({
  store,
  buildingId,
  config,
  selectedZone,
  data,
  legend = false,
  setContext,
  setTicketsWithPositions,
  setFullFloorTicketsWithPositions,
  setFullRoomTicketsWithPositions,
}: {
  store: any;
  buildingId: string;
  config: any;
  selectedZone: any;
  data: any[];
  legend?: boolean;
  setContext: () => Promise<void>;
  setTicketsWithPositions: (items: any[]) => void;
  setFullFloorTicketsWithPositions: (items: any[]) => void;
  setFullRoomTicketsWithPositions: (items: any[]) => void;
}): Promise<void> => {
  await store.dispatch("REMOVE_ALL_SPRITES");

  if (!config.sprites) return;

  const regrouped_tickets = regroupTicketByRoom(data);
  const floor_tickets = regroupTicketsByFloor(data);

  const floor_full_tickets =
    selectedZone.type !== "geographicFloor"
      ? regroupFullTicketsByFloor(data)
      : {};

  const room_full_tickets =
    selectedZone.type === "geographicFloor"
      ? regroupFullTicketsByRoom(data)
      : {};

  const items: any[] = [];
  const step = 15;
  let zPosition = 0;
  // let legend: boolean = true;

  if (selectedZone.type !== "geographicFloor") {
    if (Object.keys(floor_full_tickets).length > 1) {
      for (const key of Object.keys(floor_full_tickets)) {
        items.push({
          buildingId,
          dynamicId: key,
          legend: legend,
          data: floor_full_tickets[key].ticketList,
          position: new THREE.Vector3(0, 0, zPosition),
          type: "floor",
        });
        zPosition += step;
      }
    } else {
      for (const key of Object.keys(regrouped_tickets)) {
        const pos = regrouped_tickets[key]["XYZ center"];
        const position = pos ? pos.split(";").map(Number) : [0, 0, 0];
        items.push({
          buildingId,
          dynamicId: key,
          legend: legend,
          data: regrouped_tickets[key].ticketList,
          position: new THREE.Vector3(...position),
        });
      }
    }
  } else {
    if (Object.keys(room_full_tickets).length > 1) {
      for (const key of Object.keys(room_full_tickets)) {
        const ticketList = room_full_tickets[key].ticketList;
        let position: [number, number, number];

        if (ticketList.length === 1) {
          const raw = ticketList[0].elementSelected?.["XYZ center"];
          position = raw ? raw.split(";").map(Number) : [0, 0, 0];
        } else {
          position = computeAverageCenterFromTickets(ticketList);
        }
        items.push({
          buildingId,
          dynamicId: key,
          legend: legend,
          data: room_full_tickets[key].ticketList,
          position: new THREE.Vector3(...position),
          type: "room",
        });
        zPosition += step;
      }
    } else {
      for (const key of Object.keys(regrouped_tickets)) {
        const pos = regrouped_tickets[key]["XYZ center"];
        const position = pos ? pos.split(";").map(Number) : [0, 0, 0];
        items.push({
          buildingId,
          dynamicId: key,
          legend: legend,
          data: regrouped_tickets[key].ticketList,
          position: new THREE.Vector3(...position),
        });
      }
    }
  }

  await setContext();

  setTicketsWithPositions(items);

  if (selectedZone.type === "geographicFloor") {
    const fullRoomItems = Object.keys(room_full_tickets).map((key, index) => ({
      ...room_full_tickets[key],
      position: new THREE.Vector3(0, 0, index * step),
    }));
    setFullRoomTicketsWithPositions(fullRoomItems);
  } else {
    const fullFloorItems = Object.keys(floor_full_tickets).map(
      (key, index) => ({
        ...floor_full_tickets[key],
        position: new THREE.Vector3(0, 0, index * step),
      })
    );
    setFullFloorTicketsWithPositions(fullFloorItems);
  }

  const component =
    Object.keys(
      selectedZone.type === "geographicFloor"
        ? room_full_tickets
        : floor_full_tickets
    ).length > 1
      ? FullFloorSpriteComponent
      : SpriteComponent;

  setTimeout(() => {
    store.dispatch("ADD_COMPONENT_AS_SPRITES", {
      items,
      buildingId,
      component,
    });
  }, 1000);
};

export default updateSprites;

export const showAllSprites = async ({
  store,
  buildingId,
  config,
  selectedZone,
  data,
  legend = false,
  setContext,
  setTicketsWithPositions,
}: {
  store: any;
  buildingId: string;
  config: any;
  selectedZone: any;
  data: any[];
  legend?: boolean;
  setContext: () => void;
  setTicketsWithPositions: (items: any[]) => void;
}): Promise<void> => {
  await store.dispatch("REMOVE_ALL_SPRITES");

  if (!config.sprites) return;
  const regrouped_tickets = regroupTicketByRoom(data);
  const floor_tickets = regroupTicketsByFloor(data);

  const items: {
    buildingId: string;
    dynamicId: string;
    data: any;
    legend: boolean;
    position: THREE.Vector3;
  }[] = [];
  const floorItems: {
    buildingId: string;
    dynamicId: string;
    data: any;
    legend: boolean;
    position: THREE.Vector3;
  }[] = [];
  // let legend: boolean = true;

  for (const key of Object.keys(regrouped_tickets)) {
    const pos = regrouped_tickets[key]["XYZ center"];
    const position = pos ? pos.split(";").map(Number) : [0, 0, 0];
    items.push({
      buildingId,
      dynamicId: key,
      legend: legend,
      data: regrouped_tickets[key].ticketList,
      position: new THREE.Vector3(...position),
    });
  }

  for (const key of Object.keys(floor_tickets)) {
    floorItems.push({
      buildingId,
      dynamicId: key,
      legend: legend,
      data: floor_tickets[key].ticketList,
      position: new THREE.Vector3(0, 0, 0),
    });
  }

  await setContext();
  setTicketsWithPositions(items);

  setTimeout(() => {
    store.dispatch("ADD_COMPONENT_AS_SPRITES", {
      items,
      buildingId,
      component: SpriteComponent,
    });
  }, 1000);
};

function computeAverageCenterFromTickets(
  ticketList: any[]
): [number, number, number] {
  const coords = ticketList
    .map((t) => {
      const xyz = t.elementSelected?.["XYZ center"];
      if (!xyz) return null;
      const [x, y, z] = xyz.split(";").map(Number);
      return { x, y, z };
    })
    .filter(Boolean);

  if (coords.length === 0) return [0, 0, 0];

  const xs = coords.map((c) => c?.x ?? 0);
  const ys = coords.map((c) => c?.y ?? 0);
  const zs = coords.map((c) => c?.z ?? 0);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const minZ = Math.min(...zs);

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  return [midX, midY, minZ];
}
