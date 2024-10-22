// * Interfaces

import { type INodeItem } from "@/interfaces/INodeItem";
import { type NodeAttributs } from "@/services/spinalAPI/Node Attributs/DTO";

type Room = {
  floorId: number;
  buildingId: string;
  staticId: string;
  infoReferencesObjects: RoomInfoReferencesObject[];
  bimFileId: string;
  color: string;
  id: string;
  dynamicId?: string;
} & INodeItem &
  NodeAttributs;

type RoomBimObject = {
  version: number;
  externalId: string;
  dbid: number;
} & INodeItem;

type RoomDetail = {
  area: number;
  bimFileId: string;
  _bimObjects: RoomBimObject[];
};

type RoomEndpoint = {
  currentValue: number;
} & INodeItem;

type RoomControlEndpoint = RoomEndpoint;

type RoomEquipement = {
  bimFileId: string;
  version: 0;
  externalId: string;
  dbid: string;
} & INodeItem;

type RoomInfoReferencesObject = {
  bimFileId: string;
  version: number;
  externalId: string;
  dbid: string;
} & INodeItem;

type RoomReferenceObjectList = {
  bimFileId: string;
  infoReferencesObjects: RoomInfoReferencesObject[];
} & INodeItem;

type RoomNotes = {
  userName: string;
  date: number;
  type: string;
  message: string;
};

type RoomEventList = {
  startDate: string;
  endDate: string;
  period: string;
};

type RoomFileList = {
  name: string;
  fileId: string;
};

type RoomTicket = INodeItem;

export {
  type RoomBimObject,
  type RoomControlEndpoint,
  type RoomDetail,
  type RoomEndpoint,
  type RoomEventList,
  type RoomFileList,
  type RoomEquipement,
  type RoomInfoReferencesObject,
  type RoomNotes,
  type RoomReferenceObjectList,
  type Room,
  type RoomTicket,
};
