// * Factory
import * as Factory from "factory.ts";

// * Schema
import { type Room } from "../../DTO/Request/Room";

const iRoomFactory = Factory.Sync.makeFactory<Room>({
  dynamicId: -1,
  name: "None",
  type: "None",
  categoryAttributes: [],
  floorId: -1,
  buildingId: "None",
  staticId: "None",
  infoReferencesObjects: [],
  bimFileId: "None",
  color: "#000000",
});

export { iRoomFactory };
