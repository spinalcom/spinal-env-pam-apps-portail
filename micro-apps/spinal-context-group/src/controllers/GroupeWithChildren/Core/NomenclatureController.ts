// * Enums
import { EGroupType } from "../../../interfaces/GroupWithChildren";

// * Generic
import { GroupWithChildren } from "./Generic/GroupWithChildren";

// * Factory
import { iDynamicFilterFactory } from "../../../interfaces/GroupWithChildren/Factory";

// * Services
import { GroupContextApi, SpinalAPI } from "../../../services";
import { RoomManager } from "../../../services";
import { RoomsGroupAPI } from "../../../services";

// * Types
import { DynamicFilter } from "../../../interfaces/GroupWithChildren";
import { IGroupItem, IPregnant, IGroupDisplayable } from "../../../interfaces/GroupWithChildren";
import { Room } from "@/interfaces/API/Geographic Context/DTO/Request/Room";
import { ListAndObj } from "@/interfaces";
import { TGroupOperation } from "../../../interfaces/GroupWithChildren";
import { Attribute } from "@/services/spinalAPI/Node Attributs";

class NomenclatureController
  extends GroupWithChildren<IGroupItem>
  implements IGroupDisplayable<IGroupItem, TGroupOperation, Error>
{
  private _allRooms: ListAndObj<Room>;
  private _filters: DynamicFilter[];
  private _selectedFilters: DynamicFilter[];
  private readonly _genericErrMsg: string;
  private _nbGroup: number;

  private _groupToDisplay: IGroupItem[];
  private _roomToDisplay: Room[];
  private _roomAttributeLexicon: {
    [key: string]: { [key: string]: Attribute[] };
  };
  private _displayNameLexicon: { [key: string]: string };
  private _selectedItems: Array<IGroupItem | undefined> = [
    undefined,
    undefined,
    undefined,
  ];

  private readonly _grpCtxApiInstance: GroupContextApi;
  private readonly _roomGroupApiInstance: RoomsGroupAPI;
  private readonly _roomManager: RoomManager;

  constructor() {
    super();
    this._genericErrMsg = "Une erreur est survenue";
    this._roomToDisplay = [];
    this._selectedFilters = [];
    this._roomAttributeLexicon = {};
    this._displayNameLexicon = {};
    this._roomManager = new RoomManager();
    this._grpCtxApiInstance = new GroupContextApi(SpinalAPI.getInstance());
    this._roomGroupApiInstance = new RoomsGroupAPI();
    this._nbGroup = 3;
  }

  applyBusinessRules(item: IGroupItem): Promise<IGroupItem> {
    throw new Error("Method not implemented.");
  }

  public async loadData(): Promise<TGroupOperation> {
    return new Promise((resolve, reject) => {
      this._roomManager
        .loadData()
        .then(() => (this._allRooms = this._roomManager.rooms))
        .then(() => console.log("All rooms = ", this._allRooms))
        .then(() => this.buildDisplayNameLexicon())
        .then(() => this.extractFilters(this._allRooms.list))
        .then((filters) => (this._filters = filters))
        .then(() => this._grpCtxApiInstance.getGroupContextTree())
        .then((response) => super.loadData(response))
        .then(() => this.transformData())
        .then(() => resolve("Success"))
        .catch((e: any) => {
          console.error(e);
          reject(new Error(this._genericErrMsg));
        });
    });
  }

  public reloadGroupToDisplay(): IGroupItem[] {
    const emptyArray: IGroupItem[] | undefined = Array(this._nbGroup).fill([]);
    const grpToDisplay: IGroupItem[] | undefined = emptyArray;
    let subGrpToDisplay: IGroupItem[] | undefined;
    let grpTmp: IGroupItem | undefined;

    if (this._groupTree === undefined) {
      return emptyArray;
    } // Throw Exception

    grpToDisplay[0] = [...this._groupTree];
    for (const [i, selectedItem] of this._selectedItems.entries()) {
      if (selectedItem) {
        grpTmp = this.findItemInTree(selectedItem, this._groupTree);
        if (grpTmp?.display) {
          subGrpToDisplay = grpTmp.children;
        } else {
          break;
        }
      } else {
        subGrpToDisplay = [];
      }

      subGrpToDisplay ||= [];
      if (i + 1 < this._nbGroup) {
        grpToDisplay[i + 1] = subGrpToDisplay;
      }
    }

    this._groupToDisplay = grpToDisplay;
    return this._groupToDisplay;
  }

  public selectItem(item: IGroupItem | undefined): TGroupOperation {
    if (!item) {
      return "Failure";
    }

    this.saveSelected(item);
    this.checkValidSelected();
    return "Success";
  }

  public getSelected(): Array<IGroupItem | undefined> {
    return this._selectedItems;
  }

  public get filters(): DynamicFilter[] {
    return this._filters;
  }

  // TODO Implement boolean as well
  // TODO Refacto
  public async reloadRoomToDisplay(filters: DynamicFilter[]): Promise<Room[]> {
    const rooms: Room[] = [];
    let attrTmp: string;
    let nbrAttrTmp: number;
    let check: number = 0;

    return new Promise((resolve, reject) => {
      if (filters.length === 0) {
        resolve(this._allRooms.list);
      }

      for (const room of this._allRooms.list) {
        for (const filter of filters) {
          nbrAttrTmp = parseFloat(
            this.getAttributByName(room, filter.name, filter.category)
          );
          if (filter.type === "string") {
            attrTmp = this.getAttributByName(
              room,
              filter.name,
              filter.category
            );
            if (filter.value.length > 0 && attrTmp.startsWith(filter.value)) {
              check += 1;
            }
          } else if (filter.type === "number") {
            check += this.applyFilterRoomNumber(filter, nbrAttrTmp);
          }
        }
        if (check === filters.length) {
          rooms.push(room);
        }
        check = 0;
      }
      resolve(rooms);
    });
  }

  public async commitChange(
    rooms: Room[],
    groupeObj: IGroupItem
  ): Promise<Room[]> {
    return new Promise<Room[]>((resolve, reject) => {
      const path: IGroupItem[] = this.getPathItem(groupeObj);
      const pms: Array<Promise<any>> = [];

      console.log("Rooms = ", rooms);
      console.log("groupe selected = ", groupeObj);
      pms.push(
        this._roomGroupApiInstance.addRoomToRoomGroup(
          path[0]?.id,
          path[1]?.id,
          path[2]?.id,
          rooms.map((x: Room) => x.dynamicId)
        )
      );
      Promise.all(pms)
        .then(() => resolve(rooms))
        .catch((err: any) => console.error(err));
    });
  }

  public get groupToDisplay(): (IGroupItem & IPregnant<IGroupItem>)[] {
    return this._groupToDisplay;
  }

  private buildDisplayNameLexicon() {
    this._displayNameLexicon["name"] = "Nom";
    this._displayNameLexicon["category"] = "Catégorie";
    this._displayNameLexicon["level"] = "Niveau";
    this._displayNameLexicon["number"] = "Nombre";
    this._displayNameLexicon["area"] = "Superficie";
    this._displayNameLexicon["perimeter"] = "Périmètre";
    this._displayNameLexicon["volume"] = "Volume";
    this._displayNameLexicon["stype"] = "Stype";
  }

  private async transformData(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      for (const grpCtx of this._groupTree) {
        for (const grpCtg of grpCtx.children) {
          for (const grpGrp of grpCtg.children) {
            delete grpGrp.children;
          }
        }
      }
      resolve();
    });
  }

  private applyFilterRoomNumber(
    filter: DynamicFilter,
    nbrAttrTmp: number
  ): number {
    switch (filter.comparaison) {
      case "gt":
        return nbrAttrTmp > parseFloat(filter.value) ? 1 : 0;
      case "lt":
        return nbrAttrTmp < parseFloat(filter.value) ? 1 : 0;
      case "btw":
        return nbrAttrTmp >= parseFloat(filter.min) &&
          nbrAttrTmp <= parseFloat(filter.max)
          ? 1
          : 0;
      case "eq":
        return nbrAttrTmp === parseFloat(filter.value) ? 1 : 0;
      default:
    }
    return 0;
  }

  // TODO Include Boolean Filters as well
  // TODO Refacto
  // TODO Create a global attribute set By [Category][Room Id]
  private async extractFilters(rooms: Room[]): Promise<DynamicFilter[]> {
    let filterLexicon: { [key: string]: DynamicFilter } = {};
    let roomAttributeLexicon: {
      [key: string]: { [key: string]: Attribute[] };
    } = {};
    let filters: DynamicFilter[] = [];
    let typeTmp: string = "";
    let valueNbrTmp: number;

    return new Promise((resolve, reject) => {
      for (const room of rooms) {
        if (room.categoryAttributes && room.categoryAttributes.length) {
          for (const catAttr of room.categoryAttributes) {
            if (!roomAttributeLexicon[catAttr.name]?.[room.id]) {
              if (!roomAttributeLexicon[catAttr.name]) {
                roomAttributeLexicon[catAttr.name] = {};
              }
              roomAttributeLexicon[catAttr.name][room.id] = catAttr.attributs;
            }
            for (const attr of catAttr.attributs) {
              valueNbrTmp = parseFloat(attr.value);
              typeTmp = isNaN(valueNbrTmp) ? "string" : "number";
              if (!filterLexicon[attr.label]) {
                filterLexicon[attr.label] = iDynamicFilterFactory.build({
                  name: attr.label,
                  min: typeTmp === "number" ? valueNbrTmp : 0,
                  max: typeTmp === "number" ? valueNbrTmp : 0,
                  type: typeTmp,
                  value: typeTmp === "number" ? attr.value : "",
                  displayName: this._displayNameLexicon[attr.label]
                    ? this._displayNameLexicon[attr.label]
                    : attr.label,
                  category: catAttr.name,
                });
              } else {
                if (filterLexicon[attr.label].type !== "number") {
                  continue;
                }

                if (parseFloat(filterLexicon[attr.label].min) > valueNbrTmp) {
                  filterLexicon[attr.label].min = valueNbrTmp.toString();
                }

                if (parseFloat(filterLexicon[attr.label].max) < valueNbrTmp) {
                  filterLexicon[attr.label].max = valueNbrTmp.toString();
                }
              }
              typeTmp = "";
            }
          }
        }
      }

      for (const properties in filterLexicon) {
        filters.push(filterLexicon[properties]);
      }

      this._roomAttributeLexicon = roomAttributeLexicon;
      resolve(filters);
    });
  }

  private getAttributByName(
    room: Room,
    name: string,
    category: string
  ): string {
    let attrs: Attribute[] = room.categoryAttributes?.find(
      (el) => el.name === category
    )?.attributs;
    let attr: Attribute;

    if (!attrs || attrs.length === 0) {
      return "";
    }

    attr = attrs?.find((attr: Attribute) => attr.label === name);
    if (attr) {
      return attr.value;
    }

    return "";
  }

  private checkValidSelected(): TGroupOperation {
    let check: TGroupOperation = "Failure";
    let resetCodes: Array<number | undefined> = [];

    if (this._selectedItems.length !== this._nbGroup) {
      this.resetSelectedItem();
      return "Error";
    }

    for (const [i, selectedItem] of this._selectedItems.entries()) {
      resetCodes = this.buildResetCode(i);
      if (selectedItem) {
        check = this.checkValidSelectedItem(selectedItem, ...resetCodes);
        if (check !== "Success") {
          return "Failure";
        }
      }
    }

    return "Success";
  }

  private checkValidSelectedItem(
    selectedItem: IGroupItem | undefined,
    ...resetCodes: Array<number | undefined>
  ): TGroupOperation {
    if (!selectedItem) {
      this.resetSelectedItem(...resetCodes);
      return "Failure";
    }

    if (
      !this.findItemInTree(selectedItem, this._groupTree) ||
      !this.isValidRelationSelectedItems()
    ) {
      this.resetSelectedItem(...resetCodes);
      return "Error";
    }

    return "Success";
  }

  private resetSelectedItem(
    ...resetCodes: Array<number | undefined>
  ): TGroupOperation {
    let tmpCode: number | undefined = 0;
    const emptyArray: any[] = Array(this._nbGroup).fill(undefined);

    if (resetCodes.length !== this._nbGroup) {
      this._selectedItems = emptyArray;
      return "Error";
    }

    for (const [i, selectedItem] of this._selectedItems.entries()) {
      tmpCode = resetCodes.at(i);
      this._selectedItems[i] = tmpCode === 0 ? selectedItem : undefined;
    }

    return "Success";
  }

  private isValidRelationSelectedItems(): boolean {
    let parentItem: IGroupItem | undefined;

    parentItem = this._selectedItems.at(0);
    if (!parentItem) {
      return false;
    } // Throw Exception

    for (const [i, childItem] of this._selectedItems.entries()) {
      if (i === 0) {
        continue;
      }

      if (!childItem) {
        break;
      }

      if (
        !parentItem.children.find((el: IGroupItem) => el.id === childItem?.id)
      ) {
        return false;
      }

      parentItem = childItem;
    }

    return true;
  }

  private saveSelected(item: IGroupItem): TGroupOperation {
    if (!item.id || item.type === (EGroupType.GRP_NONE as number)) {
      return "Error";
    }

    this._selectedItems[item.type] = { ...item };
    return "Success";
  }

  private buildResetCode(limit: number): Array<number | undefined> {
    const arr: Array<number | undefined> = [];

    for (let i = 0; i < this._nbGroup; i += 1) {
      if (i <= limit) {
        arr.push(0);
      } else {
        arr.push(undefined);
      }
    }

    return arr;
  }
}

export { NomenclatureController };
