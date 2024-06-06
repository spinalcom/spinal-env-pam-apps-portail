// * API
import { getRoomsRefRaw } from "../spinalAPI/GeographicContext/geographicContext";
import { NodeAttributsAPI } from "../spinalAPI/Node Attributs";
import { RoomsGroupAPI } from "../spinalAPI";
import { GeographicContextApi } from "../spinalAPI/GeographicContext";

// * DTO
import { type AttributeCategory } from "../spinalAPI/Node Attributs/DTO";
import { Floor } from "@/interfaces/API/Geographic Context/DTO/Request/floor";
import { type GeographicContextRequest } from "../../interfaces/API/Geographic Context";
import {
  type RoomReferenceObjectList,
  type Room,
} from "@/interfaces/API/Geographic Context/DTO/Request/Room";

// * Factory
import { iRoomFactory } from "../../interfaces/API/Geographic Context";
import { iListObjFactory } from "../../interfaces";

// * Function
import {
  createListAndObjById,
  createListAndObjByDynamicId,
  createListAndObjByTag,
} from "../../interfaces";

// * Interfaces
import { type IObj, type INodeItem, type IRoom } from "../../interfaces";

// * Types
import { type ListAndObj } from "../../interfaces";

// TODO This is a test class
// TODO Need to be refactored
// TODO ADD error Management in case the rooms already exist
class RoomManager {
  private readonly _genericErrMsg: string;
  private readonly _geographicContextApi: GeographicContextApi;
  private _floors: ListAndObj<Floor>;
  private _rooms: ListAndObj<Room>;
  private readonly _referenceObjectList: any;

  public constructor() {
    this._rooms = iListObjFactory.build();
    this._floors = iListObjFactory.build();
    this._referenceObjectList = {};
    this._geographicContextApi = new GeographicContextApi();
    this._genericErrMsg = "Une erreur est survenue !";
  }

  public get rooms(): ListAndObj<Room> {
    return this._rooms;
  }

  public get floors(): ListAndObj<Floor> {
    return this._floors;
  }

  public async loadData() {
    return this.loadRooms();
  }

  public getRoomByDbId(dbIdObject: string): IRoom | undefined {
    const refObj: IObj = this._referenceObjectList[dbIdObject] as IObj;

    if (!refObj) {
      return undefined;
    }

    return this._rooms.list.at(refObj.roomIndex);
  }

  public getRoomByDynamicId(dynamicId: number): IRoom | undefined {
    const room: IRoom | undefined = this._rooms.list.find(
      (el: IRoom) => el.dynamicId === dynamicId
    );
    return room;
  }

  public getIdCurrentBuilding(): string {
    const idCurrentBuilding: string | undefined =
      window.localStorage.getItem("idBuilding");

    return idCurrentBuilding ? idCurrentBuilding : "";
  }

  private async loadRooms(): Promise<IRoom[]> {
    const buildingId: string = this.getIdCurrentBuilding();
    let rooms: Room[] = [];

    return new Promise<IRoom[]>((resolve, reject) => {
      if (!buildingId) {
        reject(new Error(this._genericErrMsg));
      }

      this._geographicContextApi
        .getAllRooms()
        .then(([roomLst, floors]) => {
          this._floors.list = this._floors.list.concat(floors);
          rooms = roomLst;
          return rooms.map((x) => x.dynamicId);
        })
        .then((ids) => ids.map((id) => getRoomsRefRaw(buildingId, id)))
        .then((pms) => Promise.all(pms))
        .then((roomsRefs) => this.buildRoomAndFloorList(rooms, roomsRefs))
        .then(() => resolve(this._rooms.list))
        .catch((err) => {
          reject(new Error(err));
        });
    });
  }

  private async buildRoomAndFloorList(
    rooms: Room[],
    roomsRefs: any[]
  ): Promise<void> {
    let roomTmp: Room;
    return new Promise((resolve, reject) => {
      for (const [i, room] of rooms.entries()) {
        roomTmp = this._rooms.list.find(
          (el: IRoom) => el.dynamicId === room.dynamicId
        );
        if (!roomTmp) {
          this.addRoom(room, roomsRefs, i);
        }
      }

      this._rooms = createListAndObjByTag<Room>(this._rooms.list, "dynamicId");
      this._floors = createListAndObjByTag<Floor>(
        this._floors.list,
        "dynamicId"
      );
      resolve();
    });
  }

  // TODO Add the color
  private addRoom(
    room: Room,
    roomRefObjs: RoomReferenceObjectList[],
    index: number
  ) {
    let refObjectExist: IObj | undefined;
    const roomTmp: Room = iRoomFactory.build({
      ...(room as Partial<Room>),
      infoReferencesObjects:
        roomRefObjs.find((refObj) => room.dynamicId === refObj.dynamicId)
          ?.infoReferencesObjects ?? [],
      color: "#010101",
    });

    this._rooms.list.push(roomTmp);
    for (const infoRefObject of roomTmp.infoReferencesObjects) {
      refObjectExist = this._referenceObjectList[infoRefObject.dbid];
      if (!refObjectExist) {
        this.addRefObj(infoRefObject, index);
      }
    }
  }

  private addRefObj(infoRefObject: any, index: number) {
    this._referenceObjectList[infoRefObject.dbid] = {
      dynamicId: (infoRefObject.dynamicId as number) ?? -1,
      staticId: infoRefObject.staticId as string,
      name: infoRefObject.name as string,
      type: infoRefObject.type as string,
      version: (infoRefObject.version as number) ?? -1,
      externalId: infoRefObject.externalId as string,
      roomIndex: index ?? -1,
      dbId: (infoRefObject.dbid as number) ?? -1,
      modelId: (infoRefObject.modelId as number) ?? -1,
    };
  }
}

export { RoomManager };
