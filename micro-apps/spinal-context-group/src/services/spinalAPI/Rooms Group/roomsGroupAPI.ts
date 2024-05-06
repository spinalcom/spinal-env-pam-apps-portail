// * Interfaces
import { AAPI } from "../AAPI";
import { type RoomGroup } from "./DTO";

// * Classes
import { SpinalAPI } from "../SpinalAPI";

// ! Refacto variable name url ===> should be templateEndpoint
// TODO Faire la gestion d'erreur
class RoomsGroupAPI extends AAPI {
  private readonly _spinalApi: SpinalAPI | undefined;
  private readonly _genericErrMsg: string = "";
  private _roomGroupTree: any[] = [];

  public constructor() {
    super();
    try {
      this._genericErrMsg = "[Erreur] Une erreur est survenue !";
      this._spinalApi = SpinalAPI.getInstance(process.env.SPINAL_API_URL);
    } catch (e: any) {
      console.error(e);
    }
  }

  public async getRoomsGroupTree(): Promise<any> {
    const pms: Array<Promise<any>> = [];
    let grpContext: any;

    this._roomGroupTree = [];
    return new Promise((resolve, reject) => {
      this.getRoomsGroupList()
        .then((rooms: any) => {
          for (const room of rooms) {
            pms.push(this.getRoomsGroupIdTree(room.dynamicId as number));
          }

          Promise.all(pms)
            .then((vals: any) => {
              for (const val of vals) {
                grpContext = val;
                this._roomGroupTree.push(val);
              }

              resolve(this._roomGroupTree);
            })
            .catch((err) => {
              console.error(err);
            });
        })
        .catch((e: any) => {
          console.error(e);
        });
    });
  }

  public async getRoomsGroupList(): Promise<RoomGroup[]> {
    let requestPromise: Promise<any> | undefined;
    let response: RoomGroup[];
    let url: string | undefined;

    url = this._spinalApi?.createUrlWithPlatformId(
      super.getIdCurrentBuilding(),
      "/api/v1/roomsGroup/list"
    );
    requestPromise = this._spinalApi?.get(url) as Promise<any>;

    return new Promise<RoomGroup[]>((resolve, reject) => {
      try {
        if (requestPromise === undefined) {
          reject(new Error(this._genericErrMsg));
        }

        requestPromise
          .then((res: any) => {
            response = res?.data as RoomGroup[];
            if (!Array.isArray(response) || res.status !== 200) {
              reject(new Error(this._genericErrMsg));
            }

            console.log("Response = ", response);
            resolve(response);
          })
          .catch((e: any) => {
            console.error(e);
            reject(new Error(this._genericErrMsg));
          });
      } catch (e: any) {
        console.error(e);
        reject(new Error(this._genericErrMsg));
      }
    });
  }

  // Works
  public async getRoomsGroupIdTree(dynamicId: number) {
    let requestPromise: Promise<any> | undefined;
    let response: RoomGroup[];
    let url: string | undefined;
    const templateEndpoint = "api/v1/roomsGroup/{id-0}/tree".replace(
      /{id-0}/,
      dynamicId.toString()
    );

    url = this._spinalApi?.createUrlWithPlatformId(
      super.getIdCurrentBuilding(),
      templateEndpoint
    );
    requestPromise = this._spinalApi?.get(url) as Promise<any>;
    return new Promise<RoomGroup[]>((resolve, reject) => {
      try {
        if (requestPromise === undefined) {
          reject(new Error(this._genericErrMsg));
        }

        requestPromise
          .then((res: any) => {
            response = res.data as RoomGroup[];
            if (res.status !== 200) {
              console.error("Response = ", response);
              reject(new Error(this._genericErrMsg));
            }

            resolve(response);
          })
          .catch((e: any) => {
            console.error(e);
            reject(new Error(this._genericErrMsg));
          });
      } catch (e: any) {
        console.error(e);
        reject(new Error(this._genericErrMsg));
      }
    });
  }

  public async addRoomToRoomGroup(
    contextId: number,
    categoryId: number,
    groupId: number,
    roomsDynamicId: number[]
  ): Promise<RoomGroup[]> {
    let requestPromise: Promise<any> | undefined;
    let response: RoomGroup[];
    let url: string | undefined;
    const templateEndpoint =
      "api/v1/roomsGroup/{contextId}/category/{categoryId}/group/{groupId}/addRooms"
        .replace(/{contextId}/, contextId.toString())
        .replace(/{categoryId}/, categoryId.toString())
        .replace(/{groupId}/, groupId.toString());

    url = this._spinalApi?.createUrlWithPlatformId(
      super.getIdCurrentBuilding(),
      templateEndpoint
    );
    requestPromise = this._spinalApi?.post(url, roomsDynamicId) as Promise<any>;
    return new Promise<RoomGroup[]>((resolve, reject) => {
      try {
        if (requestPromise === undefined) {
          reject(new Error(this._genericErrMsg));
        }

        requestPromise
          .then((res: any) => {
            response = res.data as RoomGroup[];
            if (res.status !== 200) {
              reject(new Error(this._genericErrMsg));
            }

            resolve(response);
          })
          .catch((e: any) => {
            console.error(e);
            reject(new Error(this._genericErrMsg));
          });
      } catch (e: any) {
        console.error(e);
        reject(new Error(this._genericErrMsg));
      }
    });
  }

  public async deleteRoomToRoomGroup(
    contextId: number,
    categoryId: number,
    groupId: number,
    roomsDynamicId: number[]
  ) {
    let requestPromise: Promise<any> | undefined;
    let response: RoomGroup[];
    let url: string | undefined;
    const templateEndpoint =
      "api/v1/roomsGroup/{contextId}/category/{categoryId}/group/{groupId}/deleteRooms"
        .replace(/{contextId}/, contextId.toString())
        .replace(/{categoryId}/, categoryId.toString())
        .replace(/{groupId}/, groupId.toString());

    url = this._spinalApi?.createUrlWithPlatformId(
      super.getIdCurrentBuilding(),
      templateEndpoint
    );
    requestPromise = this._spinalApi?.delete(url, {
      data: roomsDynamicId,
    }) as Promise<any>;
    return new Promise<RoomGroup[]>((resolve, reject) => {
      try {
        if (requestPromise === undefined) {
          reject(new Error(this._genericErrMsg));
        }

        requestPromise
          .then((res: any) => {
            response = res.data as RoomGroup[];
            if (res.status !== 200) {
              reject(new Error(this._genericErrMsg));
            }

            resolve(response);
          })
          .catch((e: any) => {
            console.error(e);
            reject(new Error(this._genericErrMsg));
          });
      } catch (e: any) {
        console.error(e);
        reject(new Error(this._genericErrMsg));
      }
    });
  }

  private async fillGrpContextWithRoomAttributes(grpContext: any) {
    let grpCategory: any;
    let grpGroup: any;

    return new Promise((resolve, reject) => {
      if (!Array.isArray(grpContext.children)) {
        reject(new Error(this._genericErrMsg));
      }

      for (const context of grpContext.children) {
        grpCategory = context.children;
        if (!Array.isArray(grpContext.children)) {
          continue;
        }

        for (const group of grpCategory.children) {
          if (!Array.isArray(grpContext.children)) {
            continue;
          }

          grpGroup = group.children;
        }
      }
    });
  }
}

export { RoomsGroupAPI };
