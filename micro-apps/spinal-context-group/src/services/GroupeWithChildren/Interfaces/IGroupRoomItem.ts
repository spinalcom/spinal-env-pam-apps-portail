// * Enums
type GroupRoomFocus = "GrpRoom" | "GrpRoomList";

// * Factory
import { iKpiBaseFactory } from "./IKpiBase";

// * Interfaces
import { type IItemV1 } from "@/interfaces";
import { type IPregnant } from "./IPregant";
import { type IStatable } from "./IStatable";
import { type IIndexableFromRoot } from "./IIndexableFroomRoot";
import { type IDisplayable } from "./IDisplayable";
import { type IIdentifiable } from "./IIdentifiable";
import { type ITmp } from "./ITmp";
import { type OperationMapWithId } from "./IOperations";
import { type OperationState } from "./IOperations";
import { type KpiBase } from "./IKpiBase";
import { type TypeLegend } from "./ILegend";

// * Modules
import * as Factory from "factory.ts";

// TODO Change to tree and branch terminology because it's weird
interface IGroupRoomItem
  extends IItemV1,
    IIdentifiable,
    IPregnant<IGroupRoomItem>,
    IStatable,
    IDisplayable,
    ITmp,
    IIndexableFromRoot {
  area: number;
  newArea: number;
  gainKpi: KpiBase;
  type: number;
  operations: TypeLegend;
  previousOperations: TypeLegend;
  previousOpsItems: IGroupRoomItem[];
  floorName: string;
  floorId: number;
  color: string;
  colorOperationBefore: string;
  colorOperationAfter: string;
  parentId: number;
  parentTitle: string;
  grandParentId: number;
  grandParentTitle: string;
}

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

export { type GroupRoomFocus, type IGroupRoomItem, iGroupRoomItemFactory };