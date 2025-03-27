
// * Factory
import { iKpiBaseFactory } from "..";

// * Modules
import * as Factory from "factory.ts";

// * IGroupRoomItem
import { IGroupRoomItem } from "../IGroupRoomItem";

const iGroupRoomItemFactory: Factory.Sync.Factory<
  any,
  string | number | symbol
> = Factory.Sync.makeFactory<IGroupRoomItem>({
  id: Factory.each(() => Date.now()),
  title: "",
  children: [],
  display: true,
  tmp: false,
  state: ["AddedFromClient"],
  gainKpi: iKpiBaseFactory.build({}),
  area: 0,
  newArea: 0,
  type: 0,
  idIndexesFromRoot: [],
  operations: "Not-assigned",
  previousOperations: "Not-assigned",
  previousOpsItems: [],
  floorId: -1,
  floorName: "Undefined",
  color: "#f8f8f8",
  parentId: -1,
  parentTitle: "",
  grandParentId: -1,
  grandParentTitle: "",
  colorOperationBefore: "",
  colorOperationAfter: "",
});

export {iGroupRoomItemFactory}