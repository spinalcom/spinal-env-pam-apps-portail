// * Interfaces
import { type INodeItem } from "../../../../../INodeItem";
import { type NodeAttributs } from "@/services/spinalAPI/Node Attributs";

type Floor = INodeItem & NodeAttributs;

type BimObject = {
  version: number;
  externalId: string;
  dbid: number;
} & INodeItem;

type FloorDetail = {
  area: number;
  bimFileId: string;
  _bimObjects: BimObject[];
};

export { type BimObject, type FloorDetail, type Floor };
