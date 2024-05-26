// * DTO
import { Room } from "@/interfaces/API/Geographic Context/DTO/Request/Room";
import { Floor } from "@/interfaces/API/Geographic Context/DTO/Request/floor/floor";

// * Enums
import {
  VIEWER_AGGREGATE_SELECTION_CHANGED,
  VIEWER_START_LOAD_MODEL,
} from "spinal-viewer-event-manager";
import { EGroupType } from "../../../interfaces/GroupWithChildren";

// * Event
import { EmitterViewerHandler } from "spinal-viewer-event-manager";

// * Factory
import { iGroupRoomItemFactory } from "../../../interfaces/GroupWithChildren/Factory";
import { EAPIVerb, OperationState, iKpiBaseFactory } from "../../../interfaces/GroupWithChildren";
import { iListObjFactory } from "../../../interfaces";
import { iLegendFactory } from "../../../interfaces/GroupWithChildren";

// * Generic
import { GroupWithChildren } from "./Generic/GroupWithChildren";

// * Interfaces
import { type IPlayload } from "../interfaces/IPlayload";
import { IGroupRoomItem } from "../../../interfaces/GroupWithChildren/IGroupRoomItem";

// * Services
import { NodeAttributsAPI } from "../../../services";
import { RoomManager } from "../../../services/";
import { RoomsGroupAPI } from "../../../services";
import { GroupContextApi } from "../../../services";

// * Singleton
import { ViewerManager } from "../../../components/viewer/manager/viewerManager";

// * Type
import { type IGroupDisplayable, type IIndexableFromRoot } from "../../../interfaces/GroupWithChildren";
import { type Legend } from "../../../interfaces/GroupWithChildren";
import { type TypeLegend } from "../../../interfaces/GroupWithChildren";
import { type TGroupOperation } from "../../../interfaces/GroupWithChildren";
import { type GroupRoomFocus } from "../../../interfaces/GroupWithChildren/IGroupRoomItem";
import { type KpiBase } from "../../../interfaces/GroupWithChildren";
import {
  type AttributeCategory,
  type Attribute,
  type NodeAttributs,
} from "../../../services/spinalAPI/Node Attributs";
import { type ListAndObj } from "../../../interfaces";

// TODO Fait du trie dans tes imports
class GroupRoomWithChildrenController
  extends GroupWithChildren<IGroupRoomItem>
  implements IGroupDisplayable<IGroupRoomItem, TGroupOperation, Error>
{
  public static readonly legendSpaceAssignation: Legend[] = [
    iLegendFactory.build({
      title: "Piè̤ce non affectées",
      color: "#808080",
      type: "Not-assigned",
    }),
    iLegendFactory.build({
      title: "Piè̤ce affectées au groupe",
      color: "#13a9e0",
      type: "Assigned",
    }),
    iLegendFactory.build({
      title: "Piè̤ce affectées à un autre groupe",
      color: "#ffa400",
      type: "AssignedToAnother",
    }),
    iLegendFactory.build({
      title: "Piè̤ce à affecter au groupe",
      color: "#11eda9",
      type: "ToAssign",
    }),
    iLegendFactory.build({
      title: "Piè̤ce à ré-affecter au groupe",
      color: "#af97d6",
      type: "ToReAssign",
    }),
    iLegendFactory.build({
      title: "Piè̤ce à désaffecter du groupe",
      color: "#ff000b",
      type: "ToDeAssign",
    }),
  ];

  private readonly _genericErrMsg: string;
  private _groupToDisplay: IGroupRoomItem[];
  private _allRooms: ListAndObj<Room>;
  private _selectedGrpRooms: IGroupRoomItem | undefined = undefined;
  private _groupRoomTree: IGroupRoomItem[] = [];
  private _grpFocus: GroupRoomFocus = "GrpRoomList";
  private _lexiconGrpRoomTree: { [key: string]: IGroupRoomItem };
  private _lexiconAttributes: { [key: string]: AttributeCategory };
  private _currentCategorie: IGroupRoomItem;
  private _categories: IGroupRoomItem[];

  private readonly _roomManager: RoomManager;
  private _viewerManager: ViewerManager;
  private readonly _emitterHandler: EmitterViewerHandler;

  private _globalArea = 0;

  private _totalGainGrpRoom: KpiBase | undefined;
  private _totalGainListGrpRoom: KpiBase | undefined;
  private _totalAreaGrpRoom: KpiBase | undefined;
  private readonly _totalAreaListGrpRoom: KpiBase | undefined;

  private readonly grpCtxApiInstance: GroupContextApi;
  private readonly nodeAttrApiInstance: NodeAttributsAPI;
  private readonly roomGroupApiInstance: RoomsGroupAPI;

  // TODO Replace call of colorizeViewver by something more accurate
  constructor(
    grpContextAPIInstance: GroupContextApi,
    nodeAttributsAPIInstance: NodeAttributsAPI,
    roomGroupAPiInstance: RoomsGroupAPI
  ) {
    super();
    this.grpCtxApiInstance = grpContextAPIInstance; // I Will mock this later through
    this.nodeAttrApiInstance = nodeAttributsAPIInstance;
    this.roomGroupApiInstance = roomGroupAPiInstance;
    this._totalGainGrpRoom = iKpiBaseFactory.build({}) ?? undefined;
    this._totalGainListGrpRoom = iKpiBaseFactory.build({}) ?? undefined;
    this._totalAreaGrpRoom = iKpiBaseFactory.build({}) ?? undefined;
    this._totalAreaListGrpRoom = iKpiBaseFactory.build({}) ?? undefined;
    this._currentCategorie = undefined;
    this._groupToDisplay = [];
    this._globalArea = 0;
    this._genericErrMsg = "Une erreur est survenue";
    this._grpFocus = "GrpRoomList";
    this._roomManager = new RoomManager();
    this._allRooms = iListObjFactory.build();
    this._emitterHandler = EmitterViewerHandler.getInstance();
    this._viewerManager = ViewerManager.getInstance();
    this._categories = [];
    this.listenSelectionEventViewer();
  }

  public async loadData(): Promise<TGroupOperation> {
    return new Promise((resolve, reject) => {
      this._roomManager
        .loadData()
        .then(() => (this._allRooms = this._roomManager.rooms))
        .then(() => this.grpCtxApiInstance.getGroupContextTree())
        .then((response) => super.loadData(response))
        .then(() => this.transformTree())
        .then((trsfGrpRoom) => (this._groupRoomTree = trsfGrpRoom))
        .then(() => this.getCategoryList())
        .then((cats) => (this._categories = cats))
        .then(() => this.recomputeKpi())
        .then(() => resolve("Success"))
        .catch((err: any) => {
          reject(new Error(err));
        });
    });
  }

  public async addNewItem(
    item: IGroupRoomItem,
    parent?: IGroupRoomItem
  ): Promise<IGroupRoomItem> {
    const newItem: IGroupRoomItem = iGroupRoomItemFactory.build({
      ...item,
      display: true,
      idIndexesFromRoot: [
        ...this._selectedGrpRooms.idIndexesFromRoot,
        this._selectedGrpRooms.children.length,
      ],
    });

    return new Promise<IGroupRoomItem>((resolve, reject) => {
      newItem.tmp = true;

      this.addNewItemErrorManagement(item)
        .then(() => this.assignRoomArea(newItem))
        .then(() => this.deleteRoomAssignedToOtherGrp(newItem))
        .then(() => this.addNewItemUpdateOperation(newItem))
        .then(() => this.colorizeViewer())
        .then(() => this.sortAllGrpRoomDefault())
        .then(() => resolve(newItem))
        .catch((err) => {
          reject(new Error(err));
        });
    });
  }

  public async deleteItem(
    item: IGroupRoomItem & IIndexableFromRoot,
    grpGroup?: IGroupRoomItem
  ): Promise<IGroupRoomItem> {
    return new Promise((resolve, reject) => {
      if (item.operations === "ToReAssign") {
        this.restoreStateAffectedItem(item.previousOpsItems);
      }
      this.updateOperationsState(item, "ToDeAssign");
      this.checkHardDelete(item);
      this.colorizeViewer();
      this.recomputeKpi();
      this.sortAllGrpRoomDefault()
        .then(() => resolve(item))
        .catch((err) => {
          reject(err);
        });
    });
  }

  public static guessItemColor(ops: TypeLegend) {
    const legendTmp: Legend =
      GroupRoomWithChildrenController.legendSpaceAssignation.find(
        (leg: Legend) => leg.type === ops
      );
    const defaultColor =
      GroupRoomWithChildrenController.legendSpaceAssignation.find(
        (leg: Legend) => leg.type === "Not-assigned"
      );

    return legendTmp?.color ?? defaultColor.color;
  }
  itemColorBefore;

  private async buildViewerFirstPass(
    lexiconRoom: Object,
    defaultColor
  ): Promise<IPlayload[]> {
    let firstPass = [];
    let itemTmp: IGroupRoomItem;
    let color = "";

    return new Promise((resolve, reject) => {
      firstPass = this._allRooms.list
        .map((room: Room) => {
          itemTmp = lexiconRoom[room.dynamicId];
          itemTmp = iGroupRoomItemFactory.build({ ...itemTmp });
          itemTmp.operations =
            itemTmp.operations === "Assigned"
              ? "AssignedToAnother"
              : itemTmp.operations;
          color = GroupRoomWithChildrenController.guessItemColor(
            itemTmp.operations
          );
          return {
            ...room,
            color: lexiconRoom[room.dynamicId] ? color : defaultColor.color,
            id: room.dynamicId,
          };
        })
        .filter((x) => x);
      resolve(firstPass);
    });
  }

  private async buildViewerSecondPass(
    lexiconRoom: Object,
    defaultColor
  ): Promise<IPlayload[]> {
    let secondPass = [];
    let color = "";

    return new Promise((resolve, reject) => {
      secondPass = this._selectedGrpRooms.children
        .filter((x) => lexiconRoom[x.id])
        .map((room) => {
          color = GroupRoomWithChildrenController.guessItemColor(
            room.operations
          );
          return {
            ...this._allRooms.obj[room.id],
            color,
            id: room.id.toString(),
          };
        });
      resolve(secondPass);
    });
  }

  private async buildLexiconGroupRoomTree(): Promise<{
    [key: string]: IGroupRoomItem;
  }> {
    return new Promise<{
      [key: string]: IGroupRoomItem;
    }>((resolve, reject) => {
      const lexiconRoom = {};

      for (const grp of this._groupRoomTree) {
        if (!Array.isArray(grp.children)) {
          continue;
        }

        for (const room of grp.children) {
          lexiconRoom[room.id] ||= room;
        }
      }
      resolve(lexiconRoom);
    });
  }

  private async buildLexiconGRTByCat(catId: number): Promise<{
    [key: string]: IGroupRoomItem;
  }> {
    return new Promise<{
      [key: string]: IGroupRoomItem;
    }>((resolve, reject) => {
      const lexiconRoom = {};

      for (const grp of this._groupRoomTree) {
        if (!Array.isArray(grp.children) || grp.parentId !== catId) {
          continue;
        }

        for (const room of grp.children) {
          lexiconRoom[room.id] ||= room;
        }
      }
      resolve(lexiconRoom);
    });
  }

  // TODO Split the payload intro n-type LegendType chunk then color the viewer by color
  public async colorizeViewer() {
    const defaultColor =
      GroupRoomWithChildrenController.legendSpaceAssignation.find(
        (leg: Legend) => leg.type === "Not-assigned"
      );
    let idBuilding = this._roomManager.getIdCurrentBuilding();
    let lexicon = this._lexiconGrpRoomTree;

    return new Promise<void>((resolve, reject) => {
      this.buildLexiconGRTByCat(this._currentCategorie.id)
        .then((lex) => (lexicon = lex))
        .then(() => this.buildViewerFirstPass(lexicon, defaultColor))
        .then((pass) => this._viewerManager.colorItems(pass, idBuilding))
        .then(() => this.buildViewerSecondPass(lexicon, defaultColor))
        .then((pass) => this._viewerManager.colorItems(pass, idBuilding))
        .then(() => resolve())
        .catch((err) => {
          console.error(err);
          reject(new Error(err));
        });
    });
  }

  public async restoreItem(item: IGroupRoomItem) {
    return new Promise((resolve, reject) => {
      item.tmp = false;
      item.display = true;
      this.updateOperationsState(item, item.previousOperations);
      this.recomputeKpi();
      this.colorizeViewer();
      resolve(item);
    });
  }

  private async addNewItemErrorManagement(item: IGroupRoomItem): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!item) {
        reject(new Error("Aucun pièces n'a été selectioné"));
      }

      if (this._grpFocus === "GrpRoomList") {
        reject(
          new Error(
            "Il est seulement possible d'ajouter une piéce si un groupe est selectioné"
          )
        );
      }

      if (!this._selectedGrpRooms) {
        reject(new Error(this._genericErrMsg));
      }

      if (
        this._selectedGrpRooms.children.find(
          (el: IGroupRoomItem) => el.title === item.title
        )
      ) {
        reject("Cette item éxiste déja");
      }
      resolve();
    });
  }

  private sortAllGrpRoomDefault(): Promise<IGroupRoomItem[]> {
    return new Promise((resolve, reject) => {
      for (const grp of this._groupRoomTree) {
        grp.children = grp.children.sort(
          (a, b) =>
            +(b.operations !== "Assigned") - +(a.operations !== "Assigned")
        );
      }
      resolve(this._groupRoomTree);
    });
  }

  private checkHardDelete(item: IGroupRoomItem) {
    if (
      item.previousOperations === "ToReAssign" ||
      item.previousOperations === "ToAssign"
    ) {
      this._selectedGrpRooms.children = this._selectedGrpRooms.children.filter(
        (room: IGroupRoomItem) => room.id !== item.id
      );
    }
  }

  private async assignRoomArea(item: IGroupRoomItem): Promise<IGroupRoomItem> {
    return new Promise((resolve, reject) => {
      item.area = parseFloat(this.getAttributByName(item, "area"));
      resolve(item);
    });
  }

  private async addNewItemUpdateOperation(
    item: IGroupRoomItem
  ): Promise<IGroupRoomItem> {
    return new Promise((resolve, reject) => {
      if (item.operations === "Not-assigned") {
        this.updateOperationsState(item, "ToAssign");
      }
      this._selectedGrpRooms.children.push(item);
      this.recomputeKpi();
      resolve(item);
    });
  }

  private async canAddRoom(room: IGroupRoomItem): Promise<IGroupRoomItem> {
    return new Promise((resolve, reject) => {
      if (room.operations === "ToAssign" || room.operations === "ToReAssign") {
        resolve(room);
      }
      resolve(undefined);
    });
  }

  private async canDeleteRoom(room: IGroupRoomItem): Promise<IGroupRoomItem> {
    return new Promise((resolve, reject) => {
      if (room.operations === "ToDeAssign") {
        resolve(room);
      }
      resolve(undefined);
    });
  }

  private operationOnRoomCreation(
    room: IGroupRoomItem,
    verb: EAPIVerb,
    path: IGroupRoomItem[]
  ) {
    const pms: Array<Promise<any>> = [];

    if (verb === EAPIVerb.API_CREATION) {
      pms.push(
        this.roomGroupApiInstance.addRoomToRoomGroup(
          path[0].id,
          path[1].id,
          path[2].id,
          [room.id]
        )
      );
    }
    return pms;
  }

  private operationOnRoomDeletion(
    room: IGroupRoomItem,
    verb: EAPIVerb,
    path: IGroupRoomItem[]
  ) {
    const pms: Array<Promise<any>> = [];

    if (verb === EAPIVerb.API_DELETION) {
      pms.push(
        this.roomGroupApiInstance.deleteRoomToRoomGroup(
          path[0].id,
          path[1].id,
          path[2].id,
          [room.id]
        )
      );
    }
    return pms;
  }

  private async operationOnRoom(
    rooms: IGroupRoomItem[],
    verb: EAPIVerb
  ): Promise<Array<Promise<any>>> {
    let path: IGroupRoomItem[] = [];
    let pmsAdd: Array<Promise<any>> = [];
    let pmsDelete: Array<Promise<any>> = [];
    let parentTmp: IGroupRoomItem = undefined;

    return new Promise<Array<Promise<any>>>((resolve, reject) => {
      for (const room of rooms) {
        parentTmp = this.getParentItem(room);
        if (!parentTmp) {
          continue;
        }
        path = this.getPathItem(room);
        if (path.length < 3) {
          continue;
        }
        pmsAdd = this.operationOnRoomCreation(room, verb, path);
        pmsDelete = this.operationOnRoomDeletion(room, verb, path);
      }
      resolve([...pmsAdd, ...pmsDelete]);
    });
  }

  // TODO Check Valid path - Middle
  public async commitChange(): Promise<TGroupOperation> {
    let pmsAdd: Array<Promise<any>> = [];
    let pmsDelete: Array<Promise<any>> = [];

    return new Promise((resolve, reject) => {
      this.guessOperationRoom()
        .then(([pmsAd, pmsDel]) => {
          pmsAdd = pmsAd;
          pmsDelete = pmsDel;
        })
        .then(() => Promise.all(pmsDelete))
        .then((roomsToDel) => roomsToDel.filter((el) => el))
        .then((roomsDelFilter) => this.operationOnRoom(roomsDelFilter, 2))
        .then((pmsDeleteReq) => Promise.all(pmsDeleteReq))
        .then(() => Promise.all(pmsAdd))
        .then((roomsToAdd) => roomsToAdd.filter((el) => el))
        .then((roomsToAddFilt) => this.operationOnRoom(roomsToAddFilt, 0))
        .then((pmsAddReq) => Promise.all(pmsAddReq))
        .then(() => this.rebuildGrpRoom())
        .then(() => this.colorizeViewer())
        .then(() => this.recomputeKpi(true))
        .then(() => resolve("Success"))
        .catch((err: any) => {
          reject(new Error(err));
        });
    });
  }

  public async reset(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._grpFocus === "GrpRoom") {
        this.resetGrpRoom();
      } else if (this._grpFocus === "GrpRoomList") {
        this.resetEveryGrp();
      }
      resolve();
    });
  }

  public async commitChangeGrpRoom(): Promise<TGroupOperation> {
    let pmsAdd: Array<Promise<any>> = [];
    let pmsDelete: Array<Promise<any>> = [];

    return new Promise((resolve, reject) => {
      this.guessOperationGrpRoom()
        .then(([pmsAd, pmsDel]) => {
          pmsAdd = pmsAd;
          pmsDelete = pmsDel;
        })
        .then(() => Promise.all(pmsDelete))
        .then((roomsToDel) => roomsToDel.filter((el) => el))
        .then((roomsDelFilter) => this.operationOnRoom(roomsDelFilter, 2))
        .then((pmsDeleteReq) => Promise.all(pmsDeleteReq))
        .then(() => Promise.all(pmsAdd))
        .then((roomsToAdd) => roomsToAdd.filter((el) => el))
        .then((roomsToAddFilt) => this.operationOnRoom(roomsToAddFilt, 0))
        .then((pmsAddReq) => Promise.all(pmsAddReq))
        .then(() => this.rebuildSelectedGrpRoom())
        .then(() => this.colorizeViewer())
        .then(() => this.recomputeKpi(true))
        .then(() => resolve("Success"))
        .catch((err: any) => {
          reject(new Error(err));
        });
    });
  }

  public async saveGrpRoom(): Promise<TGroupOperation> {
    return new Promise((resolve, reject) => {});
  }

  public selectItem(item: IGroupRoomItem) {
    let itemOrigin: Room;

    if (this._grpFocus === "GrpRoomList") {
      this._selectedGrpRooms = item;
      this.recomputeKpi();
      this.colorizeViewer();
    } else if (this._grpFocus === "GrpRoom") {
      this._viewerManager ||= ViewerManager.getInstance();
      if (
        this._grpFocus === "GrpRoom" &&
        this._viewerManager &&
        this._roomManager
      ) {
        itemOrigin = this._allRooms.obj[item.id];
        if (!itemOrigin) {
          throw new Error("La pièce selectioné n'éxiste pas");
        }

        this._viewerManager
          .select(itemOrigin as IPlayload)
          .then()
          .catch((err: any) => {
            console.error(err);
            throw new Error(this._genericErrMsg);
          });
        this.colorizeViewer();
      }
    }
  }

  public getSelected(): IGroupRoomItem | undefined {
    return this._selectedGrpRooms;
  }

  public applyBusinessRules(item: IGroupRoomItem): Promise<IGroupRoomItem> {
    // TODO HERE
    throw new Error("Method not implemented.");
  }

  public get globalArea(): number {
    return this._globalArea;
  }

  public get groupToDisplay(): IGroupRoomItem[] {
    return this._groupToDisplay;
  }

  public get rooms(): ListAndObj<Room> {
    return this._allRooms;
  }

  public get currentCategory(): IGroupRoomItem {
    return this._currentCategorie;
  }

  public get categories(): IGroupRoomItem[] {
    return this._categories;
  }

  public get selectedGrpRoom(): IGroupRoomItem {
    return this._selectedGrpRooms;
  }

  public reloadGroupToDisplay(): IGroupRoomItem[] {
    this.recomputeKpi();
    if (this._grpFocus === "GrpRoomList") {
      this._groupToDisplay = this._groupRoomTree.filter((x) => {
        return this._currentCategorie.id === x.parentId;
      });
    } else if (this._grpFocus === "GrpRoom" && this._selectedGrpRooms) {
      this._groupToDisplay = this._selectedGrpRooms.children;
    } else {
      this._groupToDisplay = [];
    }

    return this._groupToDisplay;
  }

  public recomputeKpi(reset = false) {
    this.recomputeEveryGrp(reset);
    this.getDataSelectedRoom();
  }

  public async addItemFromViewer(ctx: string, item: IGroupRoomItem | any) {
    let roomOrigin: Room;
    let floor: Floor = undefined;
    let cacheItem: IGroupRoomItem = undefined;
    let parent: IGroupRoomItem = undefined;
    let grandParent: IGroupRoomItem = undefined;

    return new Promise((resolve, reject) => {
      if (item.id) {
        roomOrigin = this._allRooms.obj[item.id];
      } else if (item.dynamicId) {
        roomOrigin = this._allRooms.obj[item.dynamicId];
      }

      floor =
        this._roomManager.floors.obj[
          this._roomManager.rooms.obj[roomOrigin.dynamicId].floorId
        ];
      parent = this.getParentItem(
        this._lexiconGrpRoomTree[roomOrigin.dynamicId]
      );
      grandParent = this.getParentItem(parent);
      const newItem: IGroupRoomItem = iGroupRoomItemFactory.build({
        id: roomOrigin.dynamicId,
        title: roomOrigin.name,
        area: parseFloat(this.getAttributByName(roomOrigin, "area")),
        type: EGroupType.ROOM,
        tmp: true,
        floorId: floor?.dynamicId ?? -1,
        floorName: floor?.name ?? "",
        color: this.getAttributByName(roomOrigin, "color"),
        parentId: parent?.id,
        parentTitle: parent?.title,
        grandParentId: grandParent?.id,
        grandParentTitle: grandParent?.title,
      });
      if (this._grpFocus !== "GrpRoomList") {
        this.addNewItem(newItem, undefined)
          .then(() => this.colorizeViewer())
          .then(() => resolve(newItem))
          .catch((err: any) => {
            throw new Error(this._genericErrMsg);
          });
      }
    });
  }

  public applyColorsToRooms() {
    if (this._grpFocus === "GrpRoom") {
    }
  }

  private listenSelectionEventViewer() {
    let selecteds: any;

    this._emitterHandler.on(
      VIEWER_AGGREGATE_SELECTION_CHANGED,
      async (res: any) => {
        try {
          if (this._grpFocus === "GrpRoom") {
            selecteds = res.at(0)?.dbIds;
            if (!Array.isArray(selecteds)) {
              return;
            }

            selecteds = selecteds
              .map((dbId: number) =>
                this._roomManager?.getRoomByDbId(dbId.toString())
              )
              .flat(1);
            // for (const selected of selecteds) {
            //   this.addItemFromViewer("func", selected);
            // }
          }
        } catch (error) {
          console.error(error);
        }
      }
    );
    this._emitterHandler.on(VIEWER_START_LOAD_MODEL, async (res: any) => {
      this.colorizeViewer();
    });
  }

  private async resetGrpRoom() {
    let toDeleteId: number[] = [];

    try {
      for (const room of this._selectedGrpRooms.children) {
        if (room.operations === "ToAssign") {
          // Already Assigned case => Delete
          toDeleteId.push(room.id);
        } else if (room.operations === "ToReAssign") {
          toDeleteId.push(room.id);
          this.restoreStateAffectedItem(room.previousOpsItems);
        } else if (room.operations === "ToDeAssign") {
          // Delete case => Restore
          room.operations = room.previousOperations;
        }
      }
      //
      this._selectedGrpRooms.children = this._selectedGrpRooms.children.filter(
        (el) => toDeleteId.includes(el.id) === false
      );
      this._selectedGrpRooms.gainKpi = iKpiBaseFactory.build({});
      this._selectedGrpRooms.newArea = this._selectedGrpRooms.area;
    } catch (err) {
      throw new Error(err);
    }
  }

  private async resetEveryGrp() {
    let toDeleteId: number[] = [];

    for (const grp of this._groupRoomTree) {
      for (const room of grp.children) {
        if (room.operations === "ToAssign") {
          // Already Assigned case => Delete
          toDeleteId.push(room.id);
        } else if (room.operations === "ToReAssign") {
          // Case in wich the item was affected by an action that belong to an other group
          toDeleteId.push(room.id);
          this.restoreStateAffectedItem(room.previousOpsItems);
        } else if (room.operations === "ToDeAssign") {
          // Delete case => Restore
          room.operations = room.previousOperations;
        }
      }
      //
      grp.children = grp.children.filter((el) => !toDeleteId.includes(el.id));
      toDeleteId = [];
      grp.gainKpi = iKpiBaseFactory.build({});
      grp.newArea = this._selectedGrpRooms?.area ?? 0;
    }
    this._totalAreaListGrpRoom.value = this.globalArea;
    this._totalGainListGrpRoom = iKpiBaseFactory.build({});
  }

  private async rebuildGrpRoom(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      for (const grpRoom of this._groupRoomTree) {
        for (const [index, room] of grpRoom.children.entries()) {
          switch (room.operations) {
            case "ToAssign":
              room.operations = "Assigned";
              break;
            case "ToReAssign":
              room.operations = "Assigned";
              break;
            case "ToDeAssign":
              grpRoom.children = grpRoom.children.filter(
                (r) => r.id !== room.id
              );
              break;
          }
        }
      }
      resolve();
    });
  }

  private async rebuildSelectedGrpRoom(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      for (const room of this._selectedGrpRooms.children) {
        switch (room.operations) {
          case "ToAssign":
            room.operations = "Assigned";
            break;
          case "ToReAssign":
            room.operations = "Assigned";
            break;
          case "ToDeAssign":
            this._selectedGrpRooms.children =
              this._selectedGrpRooms.children.filter((r) => r.id !== room.id);
            break;
        }
      }
      resolve();
    });
  }

  public selectCategory(catId: number): Promise<IGroupRoomItem> {
    return new Promise<IGroupRoomItem>((resolve, reject) => {
      this._currentCategorie = this.categories.find((y) => y.id === catId);
      if (!this._currentCategorie) {
        reject(new Error("Aucune categorie n'a ete selectione"));
      }
      resolve(this._currentCategorie);
    });
  }

  public switchCategories(catId: number): Promise<IGroupRoomItem> {
    return new Promise<IGroupRoomItem>((resolve, reject) => {
      this.reset()
        .then(() => this.selectCategory(catId))
        .then((cat) => this.fillAreaGrpRoomByCat(this._groupRoomTree, cat))
        .then(() => this.buildLexiconGRTByCat(this._currentCategorie.id))
        .then((lex) => (this._lexiconGrpRoomTree = lex))
        .then(() => this.recomputeEveryGrpArea())
        .then(() => this.recomputeKpi())
        .then(() => resolve(this._currentCategorie))
        .catch((err: any) => {
          console.error(err);
        });
    });
  }

  private async guessOperationRoom(
    grpRoom = false
  ): Promise<[Array<Promise<any>>, Array<Promise<any>>]> {
    const roomsToAdd: Array<Promise<any>> = [];
    let roomsToDelete: Array<Promise<any>> = [];

    return new Promise<[Array<Promise<any>>, Array<Promise<any>>]>(
      (resolve, reject) => {
        for (const grp of this._groupRoomTree) {
          for (const room of grp.children) {
            roomsToAdd.push(this.canAddRoom(room));
            roomsToDelete.push(this.canDeleteRoom(room));
            room.tmp = false;
          }
          grp.gainKpi = iKpiBaseFactory.build();
          grp.area = grp.newArea as number;
        }
        resolve([roomsToAdd, roomsToDelete]);
      }
    );
  }

  private async guessOperationGrpRoom(): Promise<
    [Array<Promise<any>>, Array<Promise<any>>]
  > {
    const roomsToAdd: Array<Promise<any>> = [];
    let roomsToDelete: Array<Promise<any>> = [];
    let areaTotal: number = 0;

    return new Promise<[Array<Promise<any>>, Array<Promise<any>>]>(
      (resolve, reject) => {
        for (const room of this._selectedGrpRooms.children) {
          roomsToAdd.push(this.canAddRoom(room));
          roomsToDelete.push(this.canDeleteRoom(room));
          room.tmp = false;
          areaTotal += room.area;
        }
        this._selectedGrpRooms.gainKpi = iKpiBaseFactory.build();
        this._selectedGrpRooms.area = areaTotal;
        this._selectedGrpRooms.newArea = areaTotal;
        resolve([roomsToAdd, roomsToDelete]);
      }
    );
  }

  private getGrpAffectedToRoom(room: Room): IGroupRoomItem[] {
    let lexiconGrp: Object = {};
    let grps: Array<IGroupRoomItem> = [];

    for (const grpRoom of this._groupRoomTree) {
      if (grpRoom.parentId !== this._currentCategorie.id) {
        continue;
      }
      for (const roomGrp of grpRoom.children) {
        if (roomGrp.id === room.dynamicId) {
          lexiconGrp[room.dynamicId] = roomGrp;
        }
      }
    }
    for (const properties in lexiconGrp) {
      grps.push(lexiconGrp[properties]);
    }
    return grps;
  }

  public getFutureOperation(room: Room): TypeLegend {
    const grps = this.getGrpAffectedToRoom(room);
    if (grps.length > 0) {
      return "ToReAssign";
    } else {
      return "ToAssign";
    }
  }

  private recomputeSelectedGrp(grp?: IGroupRoomItem) {
    let gainValue = 0;
    let gainPercentage = 0;
    const selectedGrpRoom: IGroupRoomItem | undefined =
      grp ?? this._selectedGrpRooms;

    if (!selectedGrpRoom) {
      this._totalGainGrpRoom = iKpiBaseFactory.build({});
      return;
    }

    selectedGrpRoom.newArea = selectedGrpRoom.children
      .filter((room: IGroupRoomItem) => room.operations !== "ToDeAssign")
      .reduce((acc: number, curr: IGroupRoomItem) => acc + curr.area, 0);

    gainValue = selectedGrpRoom.newArea - selectedGrpRoom.area;
    gainPercentage =
      selectedGrpRoom.area !== 0 ? (gainValue / selectedGrpRoom.area) * 100 : 0;
    selectedGrpRoom.gainKpi.value = gainValue;
    selectedGrpRoom.gainKpi.percentage = gainPercentage;
  }

  private recomputeEveryGrpArea(grp?: IGroupRoomItem) {
    for (const grp of this._groupRoomTree) {
      grp.area = grp.children.reduce((acc: number, curr: IGroupRoomItem) => {
        if (grp.parentId === this._currentCategorie.id) {
          return acc + curr.area;
        }
        return acc;
      }, 0);
    }
  }

  private getDataSelectedRoom() {
    if (!this._selectedGrpRooms) {
      this._totalGainGrpRoom = iKpiBaseFactory.build({});
      this._totalAreaGrpRoom = iKpiBaseFactory.build({});
      return;
    }

    const gainValue =
      this._selectedGrpRooms.newArea - this._selectedGrpRooms.area;
    const gainPercentage =
      this._selectedGrpRooms.area !== 0
        ? (gainValue / this._selectedGrpRooms.area) * 100
        : 0;

    this._totalGainGrpRoom.value = gainValue;
    this._totalGainGrpRoom.percentage = gainPercentage;
    this._totalAreaGrpRoom.value = this._selectedGrpRooms.newArea;
    this._totalAreaGrpRoom.percentage = gainPercentage;
  }

  private recomputeEveryGrp(reset = false) {
    let gainValue = 0;
    let gainPercentage = 0;
    let newArea = 0;

    if (!this._groupRoomTree) {
      this._totalGainListGrpRoom = iKpiBaseFactory.build({});
      return;
    }

    for (const grp of this._groupRoomTree) {
      if (grp.parentId === this._currentCategorie.id) {
        this.recomputeSelectedGrp(grp);
      }
    }

    newArea = this._groupRoomTree.reduce(
      (acc: number, curr: IGroupRoomItem) => {
        if (curr.parentId === this._currentCategorie.id) {
          return acc + curr.newArea;
        }
        return acc;
      },
      0
    );
    if (reset) {
      this._globalArea = newArea;
    }

    gainValue = newArea - this._globalArea;
    gainPercentage = (gainValue / this._globalArea) * 100;
    this._totalAreaListGrpRoom.value = newArea;
    this._totalGainListGrpRoom.value = gainValue;
    this._totalGainListGrpRoom.percentage = gainPercentage;
  }

  // TODO change this function in order to use groupTree and abstract method instead
  // TODO Later
  // TODO Dont forget to do the error management on the gain function .... division by zero etc..

  public setFocus(val: GroupRoomFocus): void {
    this._grpFocus = val;
  }

  public getFocus(): GroupRoomFocus {
    return this._grpFocus;
  }

  public get totalGain(): KpiBase {
    if (this._grpFocus === "GrpRoomList") {
      return this._totalGainListGrpRoom;
    }

    if (this._grpFocus === "GrpRoom") {
      return this._totalGainGrpRoom;
    }

    return iKpiBaseFactory.build({});
  }

  public get totalArea(): KpiBase {
    if (this._grpFocus === "GrpRoomList") {
      return this._totalAreaListGrpRoom;
    }

    if (this._grpFocus === "GrpRoom") {
      return this._totalAreaGrpRoom;
    }

    return iKpiBaseFactory.build({});
  }

  private updateOperationsState(item: IGroupRoomItem, op: TypeLegend) {
    item.previousOperations = item.operations;
    item.operations = op;
  }

  private getAttributByName(room: IGroupRoomItem | Room, name: string): string {
    let node: AttributeCategory = this._lexiconAttributes[room.id];
    let attr: Attribute;
    let id: string | number = room.id || room["dynamicId"];

    if (!node) {
      node = this._lexiconAttributes[id];
      if (!node) {
        return "";
      }
    }

    attr = node?.attributs.find((attr: Attribute) => attr.label === name);
    if (attr) {
      return attr.value;
    }

    return "";
  }

  // TODO use this function
  private isGoodPath(path: IGroupRoomItem[]): boolean {
    const conditions: boolean[] = [
      path.filter(
        (el: IGroupRoomItem) => el.type === (EGroupType.GRP_CONTEXT as number)
      ).length === 1,
      path.filter(
        (el: IGroupRoomItem) => el.type === (EGroupType.GRP_CATEGORY as number)
      ).length === 1,
      path.filter(
        (el: IGroupRoomItem) => el.type === (EGroupType.GRP_GROUP as number)
      ).length === 1,
    ];

    for (const condition of conditions) {
      if (!condition) {
        return false;
      }
    }

    return true;
  }

  private deleteRoomAssignedToOtherGrpErrMng(
    path: IGroupRoomItem[],
    grp: IGroupRoomItem | undefined
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!grp) {
        reject(new Error(this._genericErrMsg));
      }

      if (
        !this.isGoodPath(path) ||
        grp.type !== (EGroupType.GRP_GROUP as number)
      ) {
        reject(new Error(this._genericErrMsg));
      }

      if (!path[1] || path[1].type !== EGroupType.GRP_CATEGORY) {
        reject(new Error(this._genericErrMsg));
      }
      resolve();
    });
  }

  private async checkRoomAlreadyExist(
    item: IGroupRoomItem,
    category: IGroupRoomItem | undefined
  ): Promise<Array<Promise<any>>> {
    const grp: IGroupRoomItem | undefined = this._selectedGrpRooms;
    let index = -1;
    const pms: Array<Promise<any>> = [];
    const parent = this.getParentItem(item);

    return new Promise<Array<Promise<any>>>((resolve, reject) => {
      for (const grpGroup of this._groupRoomTree) {
        if (parent.id === grpGroup.id || grpGroup.parentId !== category.id) {
          continue;
        }

        index = grpGroup.children.findIndex(
          (room: IGroupRoomItem) => room.id === item.id
        );
        if (index !== -1 && grpGroup.id !== grp.id) {
          this.updateOperationsState(item, "ToReAssign");
          item.previousOpsItems.push(grpGroup.children[index]);
          pms.push(this.deleteItem(grpGroup.children[index], grpGroup));
        }
      }
      resolve(pms);
    });
  }

  private async deleteRoomAssignedToOtherGrp(
    item: IGroupRoomItem
  ): Promise<TGroupOperation> {
    const path: IGroupRoomItem[] = this.getPathItem(item);

    item.previousOpsItems = [];
    return new Promise<TGroupOperation>((resolve, reject) => {
      this.deleteRoomAssignedToOtherGrpErrMng(path, this._selectedGrpRooms)
        .then(() => this.checkRoomAlreadyExist(item, this._currentCategorie))
        .then((pms) => Promise.all(pms))
        .then(() => resolve("Success"))
        .catch((err: any) => {
          reject(new Error(err));
        });
    });
  }

  private restoreStateAffectedItem(affecteds: IGroupRoomItem[]) {
    for (const affected of affecteds) {
      this.restoreStateAffectedItem(affected.previousOpsItems);
      this.updateOperationsState(affected, affected.previousOperations);
      affected.previousOpsItems = [];
    }
  }

  // TODO ExtractGrpGroup ShouldTake an id of category
  // TODO Then only take the groups of those categories
  // TODO
  private async transformTree(): Promise<IGroupRoomItem[]> {
    let roomsId: number[] = [];
    let grpRooms: IGroupRoomItem[] = [];

    roomsId = this._allRooms.list.map((el) => el.dynamicId);
    return new Promise((resolve, reject) => {
      // if (this._alreadyTransformed) {
      //   reject(false);
      // }
      this.fillLexiconAttributes(roomsId, "Spatial")
        .then(() => this.extractGrpGroup())
        .then((grpGrps) => this.transformGrpGroup(grpGrps))
        .then((trsfGrpRoom) => (grpRooms = trsfGrpRoom))
        .then((newGrpRooms) => (this._groupRoomTree = newGrpRooms))
        .then(() => this.buildLexiconGroupRoomTree())
        .then((lexicon) => (this._lexiconGrpRoomTree = lexicon))
        .then(() => resolve(this._groupRoomTree))
        .catch((e: any) => {
          reject(new Error(this._genericErrMsg));
        });
    });
  }

  private async getCategoryList(): Promise<IGroupRoomItem[]> {
    return new Promise((resolve, reject) => {
      resolve(
        this._groupTree
          .map((contextes: IGroupRoomItem) =>
            contextes.children.map((categories: IGroupRoomItem) => categories)
          )
          .flat(1)
      );
    });
  }

  private async pickDefaultCategory(): Promise<IGroupRoomItem> {
    return new Promise((resolve, reject) => {
      this.getCategoryList()
        .then((categories) => {
          this._categories = categories;
          if (categories.length === 0) {
            reject(new Error("Il n'y a aucune catégorie disponible"));
          }
          resolve(categories[0]);
        })
        .catch((err: any) => reject(err));
    });
  }

  private async fillAreaGrpRoomByCat(
    grpRooms: IGroupRoomItem[],
    categorie: IGroupRoomItem
  ): Promise<IGroupRoomItem[]> {
    let groupRooms: IGroupRoomItem[] = [];

    this._globalArea = 0;
    return new Promise<IGroupRoomItem[]>((resolve, reject) => {
      groupRooms = grpRooms.map((grpRoom: IGroupRoomItem) => {
        const area: number = grpRoom.children.reduce(
          (acc: number, curr: IGroupRoomItem) => {
            if (curr.grandParentId === categorie.id) {
              return acc + curr.area;
            }
            return 0;
          },
          0
        );
        this._globalArea += area;
        return {
          ...grpRoom,
          area,
          newArea: area,
        };
      });
      resolve(groupRooms);
    });
  }

  private async transformGrpGroup(
    grpGroups: IGroupRoomItem[]
  ): Promise<IGroupRoomItem[]> {
    let groupRooms: IGroupRoomItem[] = [];
    // Categorie => Room
    const lexiconRoom: { [key: number]: { [key: number]: IGroupRoomItem } } =
      {};

    return new Promise<IGroupRoomItem[]>((resolve, reject) => {
      groupRooms = grpGroups.map((grpGroup: IGroupRoomItem) => {
        const parent = this.getParentItem(grpGroup);
        const newGrpGroup: IGroupRoomItem = iGroupRoomItemFactory.build({
          id: grpGroup.id,
          title: grpGroup.title,
          type: grpGroup.type,
          idIndexesFromRoot: grpGroup.idIndexesFromRoot,
          parentId: parent.id,
          parentTitle: parent.title,
          children: grpGroup.children.map((room: IGroupRoomItem) => {
            const area = parseFloat(this.getAttributByName(room, "area")) ?? -1;
            const color =
              parseFloat(this.getAttributByName(room, "color")) ?? "";
            const floor =
              this._roomManager.floors.obj[
                this._roomManager.rooms.obj[room.id].floorId
              ];
            const item: IGroupRoomItem = iGroupRoomItemFactory.build({
              id: room.id,
              title: room.title,
              area: area,
              newArea: area,
              idIndexesFromRoot: room.idIndexesFromRoot,
              type: EGroupType.ROOM,
              floorId: floor?.dynamicId ?? -1,
              floorName: floor?.name ?? "",
              color: color,
              parentId: grpGroup.id,
              parentTitle: grpGroup.title,
              grandParentId: parent.id,
              grandParentTitle: parent.title,
            });
            if (lexiconRoom[item.grandParentId]?.[item.id]) {
              item.parentId =
                lexiconRoom[item.grandParentId]?.[item.id].parentId;
              item.parentTitle =
                lexiconRoom[item.grandParentId]?.[item.id].parentTitle;

              this.updateOperationsState(item, "AssignedToAnother");
            } else {
              if (!lexiconRoom[item.grandParentId]) {
                lexiconRoom[item.grandParentId] = {};
              }
              lexiconRoom[item.grandParentId][item.id] = item;
              this.updateOperationsState(item, "Assigned");
            }

            return item;
          }),
        });
        return newGrpGroup;
      });
      console.log("TransformGrpGroup");
      resolve(groupRooms);
    });
  }

  // TODO Refacto
  private async fillLexiconAttributes(
    roomIds: number[],
    attrName: string
  ): Promise<any> {
    let attributes: NodeAttributs[] = [];
    let categoryAttributes: AttributeCategory | undefined;

    this._lexiconAttributes = {};
    return new Promise((resolve, reject) => {
      this.nodeAttrApiInstance
        .getAttributesMultipleNode(roomIds)
        .then((response: NodeAttributs[]) => {
          attributes = response;
          for (const attr of attributes) {
            if (this._lexiconAttributes === undefined) {
              this._lexiconAttributes = {};
            }

            categoryAttributes = attr.categoryAttributes?.find(
              (categoryAttribut: AttributeCategory) =>
                categoryAttribut.name === attrName
            );

            if (!categoryAttributes) {
              continue;
            }

            this._lexiconAttributes[attr.dynamicId] = categoryAttributes;
          }

          resolve(this._lexiconAttributes);
        })
        .catch((err: any) => {
          console.error(err);
          reject(new Error(this._genericErrMsg));
        });
    });
  }

  private async extractGrpGroup(): Promise<IGroupRoomItem[]> {
    let groupGroups: IGroupRoomItem[] = [];

    return new Promise<IGroupRoomItem[]>((resolve, reject) => {
      groupGroups = this._groupTree
        .map((contextes: IGroupRoomItem) =>
          contextes.children.map((categories: IGroupRoomItem) =>
            categories.children.map((group: IGroupRoomItem) => group)
          )
        )
        .flat(2);
      resolve(groupGroups);
    });
  }

  private async extractRoomIdsFromGrpGroup(
    grpGroup: IGroupRoomItem[]
  ): Promise<number[]> {
    let roomIds: number[] = [];

    return new Promise<number[]>((resolve, reject) => {
      roomIds = grpGroup
        .map((grpGroup: IGroupRoomItem) =>
          grpGroup.children.map((room: IGroupRoomItem) => room.id)
        )
        .flat(1);
      resolve(roomIds);
    });
  }
}

export { GroupRoomWithChildrenController };
