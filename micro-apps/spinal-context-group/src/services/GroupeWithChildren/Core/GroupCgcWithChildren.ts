// * Classes
import { type GroupContextApi } from "../../spinalAPI/Group Context";
import { GroupWithChildren } from "./GroupWithChildren";

// * Enums
import { EAPIVerb, EGroupType } from "../Interfaces";

// * Factory
import { GroupItemFactory } from "../Factory";

// * Interfaces
import { type IGroupItem } from "../Interfaces";

// * Types
import { type TGroupOperation } from "..";
import { type IGroupDisplayable } from "../Interfaces";

class GrpCgcWithChildren
  extends GroupWithChildren<IGroupItem>
  implements IGroupDisplayable<IGroupItem, TGroupOperation, Error>
{
  private readonly _apiInstance: GroupContextApi;
  private _groupToDisplay: IGroupItem[];
  private readonly _nbGroup: number = 0;
  private _selectedItems: Array<IGroupItem | undefined> = [
    undefined,
    undefined,
    undefined,
  ];

  private readonly _genericErrMsg: string;

  constructor(_apiInstance: any, nbGroupeType: number) {
    super();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._apiInstance = _apiInstance;
    this._nbGroup = nbGroupeType;
    this._genericErrMsg = "Une erreur est survenue";
    this._groupToDisplay = [];
  }

  public async loadData(): Promise<TGroupOperation> {
    return new Promise((resolve, reject) => {
      this._apiInstance
        .getGroupContextTree()
        .then((res: IGroupItem[]) => resolve(super.loadData(res)))
        .catch((e: any) => {
          console.error(e);
          reject(new Error("[GroupCgc] => Erreur loading data ..."));
        });
    });
  }

  // --------------------------PUBLIC--------------------------

  public async addNewItem(
    newItem: IGroupItem,
    parent?: IGroupItem
  ): Promise<IGroupItem> {
    let itemTmp: IGroupItem;

    return new Promise<IGroupItem>((resolve, reject) => {
      if (newItem.type === undefined) {
        reject(Error(this._genericErrMsg));
      }

      if (newItem.type === EGroupType.GRP_CONTEXT) {
        parent = undefined;
      } else {
        parent = this._selectedItems.find(
          (el: IGroupItem | undefined) => el?.type === newItem.type - 1
        );
      }

      super
        .addNewItem(newItem, parent)
        .then((newItemCreated: IGroupItem) => (itemTmp = newItemCreated))
        .then(() => this.applyBusinessRules(itemTmp, EAPIVerb.API_CREATION))
        .then((newCorrectItem: IGroupItem) =>
          this._apiInstance.createGenericRequest(
            newCorrectItem,
            EAPIVerb.API_CREATION,
            this.getPathItem(newCorrectItem)
          )
        )
        .then((res: any) => {
          this.checkErrorResponse(res);
          itemTmp.title = res.data?.name ?? this._genericErrMsg;
          itemTmp.id = res.data?.dynamicId ?? -1;
          itemTmp.display = true;
          resolve(itemTmp);
        })
        .catch((err: any) => {
          super
            .deleteItem(itemTmp)
            .then((itemDeleted: IGroupItem) => {
              reject(new Error(err));
            })
            .catch((err: any) => {
              reject(new Error(err));
            });
        });
    });
  }

  public async applyBusinessRules(
    item: IGroupItem,
    verb?: EAPIVerb
  ): Promise<IGroupItem> {
    const checkList: Array<
      (item: IGroupItem, verb?: EAPIVerb) => TGroupOperation | Error
    > = [this.checkAlreadyExistingName];
    let res: TGroupOperation | Error | undefined;

    return new Promise<IGroupItem>((resolve, reject) => {
      if (!item) {
        reject("[Error] Item non definie");
      }

      this.assignDefaultValue(item)
        .then((newTitle: string) => {
          item.title = newTitle;

          for (const check of checkList) {
            res = check.bind(this)(item, verb);
            if (res instanceof Error || res !== "Success") {
              reject(new Error(res));
            }
          }

          resolve(item);
        })
        .catch((err: any) => {
          reject(new Error(err));
        });
    });
  }

  public async deleteItem(item: IGroupItem): Promise<IGroupItem> {
    return new Promise<IGroupItem>((resolve, reject) => {
      super
        .deleteItem(item)
        .then((itemDeleted) => this.deleteItemChildRecursive(itemDeleted))
        .then((item: IGroupItem) => this.checkValidSelected())
        .then(() => resolve(item))
        .catch((err: any) => {
          reject(new Error(err));
        });
    });
  }

  public async editItem(
    newItem: Partial<IGroupItem>,
    item: IGroupItem
  ): Promise<IGroupItem> {
    let itemTmp: IGroupItem;

    return new Promise<IGroupItem>((resolve, reject) => {
      super
        .editItem(newItem, item)
        .then((editedItem) => this.applyBusinessRules(editedItem))
        .then((editedItem) => (itemTmp = editedItem))
        .then((editedItem: IGroupItem) =>
          this._apiInstance.createGenericRequest(
            editedItem,
            EAPIVerb.API_UPDATE,
            this.getPathItem(editedItem)
          )
        )
        .then((res: any) => this.checkErrorResponse(res))
        .then(() => resolve(itemTmp))
        .catch((err) => {
          super.editItem(item, item).then(() => {
            reject(err);
          });
        });
    });
  }

  public get groupToDisplay(): IGroupItem[] {
    return this._groupToDisplay;
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

  private checkErrorResponse(res: any): TGroupOperation {
    if (res?.status !== 200) {
      throw new Error(this._genericErrMsg);
    }

    return "Success";
  }

  // Middle
  private async assignDefaultValue(
    item: IGroupItem | undefined
  ): Promise<string> {
    const defaultValueTemplate = "Nouveau groupe-{index}";
    let str: string = item.title;
    const fakeItem: IGroupItem = GroupItemFactory.build({
      ...item,
      idIndexesFromRoot: item.idIndexesFromRoot,
    });

    return new Promise((resolve, reject) => {
      if (!item || item.title.length > 0) {
        resolve(item.title);
      }

      for (let i = 0; i < 100; i += 1) {
        // This is wrong btw
        str = defaultValueTemplate.replace("{index}", i.toString());
        fakeItem.title = str;
        if (this.checkAlreadyExistingName(fakeItem) === "Success") {
          resolve(str);
        }
      }

      resolve(item.title);
    });
  }

  private checkAlreadyExistingName(
    item: IGroupItem,
    verb?: EAPIVerb
  ): TGroupOperation | Error {
    const path: IGroupItem[] = this.getPathItem(item);
    const indexItem: number = path.findIndex((el) => el.id === item.id);
    let listToCheck: IGroupItem[] | undefined = [];
    let check: IGroupItem | undefined;

    if (path.length === 0) {
      listToCheck = this._groupTree;
    } else {
      if (indexItem === -1) {
        item.display = false;
        return "Error";
      }

      if (indexItem === 0) {
        listToCheck = this._groupTree;
      } else {
        listToCheck = path.at(indexItem - 1)?.children;
      }

      if (!listToCheck) {
        return "Error";
      }
    }

    check = listToCheck.find(
      (el: IGroupItem) =>
        el.title.trim() === item.title.trim() && el.id !== item.id && el.display
    );
    if (check) {
      if (verb === EAPIVerb.API_CREATION) {
        item.display = false;
      }

      return new Error("Un élément porte déjà ce nom");
    }

    return "Success";
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

  private async deleteItemChildRecursive(
    itemToDelete: IGroupItem
  ): Promise<IGroupItem> {
    const deleteRequest: Array<Promise<any>> = [];
    let req: Promise<any>;
    let itemPath: IGroupItem[] | undefined;

    return new Promise((resolve, reject) => {
      for (const child of itemToDelete.children) {
        void this.deleteItemChildRecursive(child);
        itemPath = this.getPathItem(child);
        if (!itemPath) {
          continue;
        }

        req = this._apiInstance.createGenericRequest(
          child,
          EAPIVerb.API_DELETION,
          itemPath
        );

        deleteRequest.push(req);
      }

      itemPath = this.getPathItem(itemToDelete);
      req = this._apiInstance.createGenericRequest(
        itemToDelete,
        EAPIVerb.API_DELETION,
        itemPath
      );
      deleteRequest.push(req);
      Promise.all(deleteRequest).catch((e) => {
        this.checkErrorResponse(e); // Need to be tested
      });
      resolve(itemToDelete);
    });
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
      console.error("L'item selectione n'est pas correct");
      this.resetSelectedItem(...resetCodes);
      return "Error";
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

  private saveSelected(item: IGroupItem): TGroupOperation {
    if (!item.id || item.type === (EGroupType.GRP_NONE as number)) {
      return "Error";
    }

    this._selectedItems[item.type] = { ...item };
    return "Success";
  }
}

export { GrpCgcWithChildren };
