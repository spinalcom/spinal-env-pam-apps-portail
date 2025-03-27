import * as Factory from "factory.ts";
import { type Floor } from "../../DTO/Request/floor";

const iFloorFactory = Factory.Sync.makeFactory<Floor>({
  dynamicId: -1,
  staticId: "",
  name: "",
  type: "",
  categoryAttributes: [],
});

export { iFloorFactory };
