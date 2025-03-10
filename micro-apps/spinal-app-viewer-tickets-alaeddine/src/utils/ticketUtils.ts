// src/utils/ticketUtils.ts

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

export function extractUniqueSteps(tickets: any[]): any[] {
  const uniqueSteps = new Map();
  tickets.forEach((t) => {
    if (!uniqueSteps.has(t.step.name)) {
      uniqueSteps.set(t.step.name, t.step);
    }
  });

  return [...uniqueSteps.values()].sort((a, b) => a.order - b.order);
}
