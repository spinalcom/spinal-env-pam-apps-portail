// * Classes
import { SpinalAPI } from "../SpinalAPI";

// * DTO
import { Floor } from "../../../interfaces/API/Geographic Context/DTO/Request/floor";
import { Room } from "../../../interfaces/API/Geographic Context/DTO/Request/Room";

// * Factory
import { GeographicContextFactory } from "../../../interfaces/API";

// * Type
import { AAPI } from "../AAPI";

/**
 * **API Classes**
 * @description This class is responsible for making API calls to the GeographicContext part.
 * @class
 */
class GeographicContextApi extends AAPI {
  private readonly _apiInstance: SpinalAPI | undefined = undefined;
  private readonly _genericError: string;
  private readonly _idBuilding: string;

  constructor() {
    super();
    try {
      this._apiInstance = SpinalAPI.getInstance(process.env.SPINAL_API_URL);
      this._genericError = "Une erreur est survenue !";
      this._idBuilding = this.getIdCurrentBuilding();
    } catch (err: any) {
      throw new Error(this._genericError);
    }
  }

  public async getFloorList(): Promise<Floor[]> {
    const endpoint = "/api/v1/floor/list";
    let pm: Promise<any>;
    let url = "";

    return new Promise<Floor[]>((resolve, reject) => {
      if (!this._apiInstance) {
        reject(new Error(this._genericError));
      }

      url = this._apiInstance.createUrlWithPlatformId(
        this._idBuilding,
        endpoint
      );
      pm = this._apiInstance.get(url);
      pm.then((response) => this.checkErrorResponse(response))
        .then((response) => this.buildFloorList(response.data))
        .then((floors) => resolve(floors))
        .catch((e: any) => {
          reject(new Error(this._genericError));
        });
    });
  }

  public async getRoomList(floorId: number): Promise<Room[]> {
    const endpoint = "/api/v1/floor/[floorId]/room_list";
    let pm: Promise<any>;
    let url = "";

    url = this._apiInstance.createUrlWithPlatformId(
      this._idBuilding,
      endpoint.replace("[floorId]", floorId.toString())
    );
    return new Promise<Room[]>((resolve, reject) => {
      if (!this._apiInstance) {
        reject(new Error(this._genericError));
      }

      pm = this._apiInstance.get(url);
      pm.then((response) => this.checkErrorResponse(response))
        .then((response) => this.buildRoomList(response.data, floorId))
        .then((rooms) => resolve(rooms))
        .catch((e: any) => {
          reject(new Error(this._genericError));
        });
    });
  }

  public async getAllRooms(): Promise<[Room[], Floor[]]> {
    let floors: Floor[] = [];

    return new Promise<[Room[], Floor[]]>((resolve, reject) => {
      this.getFloorList()
        .then((floorLst) => {
          floors = floorLst;
          return floorLst;
        })
        .then((floors) => floors.map((floor) => floor.dynamicId))
        .then((floorIds) => floorIds.map((id) => this.getRoomList(id)))
        .then((pms) => Promise.all(pms))
        .then((rooms) => resolve([rooms.flat(), floors]))
        .catch((err: any) => {
          reject(new Error(err));
        });
    });
  }

  private async checkErrorResponse(response: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!response) {
        reject(new Error(this._genericError));
      } else if (response?.status !== 200) {
        reject(new Error(this._genericError));
      }
      resolve(response);
    });
  }

  private async buildFloorList(datas: any): Promise<Floor[]> {
    const floors: Floor[] = [];
    let floorTmp: Floor;

    return new Promise((resolve, reject) => {
      for (const data of datas) {
        floorTmp = GeographicContextFactory.iFloorFactory.build({
          ...data,
        });
        floorTmp.categoryAttributes = data.categories ?? [];
        floors.push(floorTmp);
      }
      resolve(floors);
    });
  }

  private async buildRoomList(datas: any, floorId): Promise<Room[]> {
    const rooms: Room[] = [];
    let roomTmp: Room;

    return new Promise((resolve, reject) => {
      for (const data of datas) {
        roomTmp = GeographicContextFactory.iRoomFactory.build({
          ...data,
          categoryAttributes: data.categories ?? [],
          floorId: floorId,
          buildingId: this._idBuilding,
          staticId: (data.staticId as string) ?? "-1",
        });
        rooms.push(roomTmp);
      }
      resolve(rooms);
    });
  }
}

export { GeographicContextApi };
