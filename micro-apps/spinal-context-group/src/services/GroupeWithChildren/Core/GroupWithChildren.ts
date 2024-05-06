// * Classes
import { AGroupeWithChildren } from "./AGroupeWithChildren";

// * Types
import {
  type IDisplayable,
  type TGroupOperation,
  type IIdentifiable,
  type IIndexableFromRoot,
  type IOperation,
  type IPregnant,
  type IStatable,
} from "../Interfaces";
import { type IItemV1 } from "@/interfaces";

class GroupWithChildren<T> extends AGroupeWithChildren<T, TGroupOperation> {
  protected _groupTree: Array<
    T & IIndexableFromRoot & IPregnant<T> & IDisplayable & IIdentifiable
  > = [];

  public async loadData(
    data: Array<
      T & IIndexableFromRoot & IPregnant<T> & IDisplayable & IIdentifiable
    >
  ): Promise<TGroupOperation> {
    return new Promise<TGroupOperation>((resolve, reject) => {
      if (data.length === 0) {
        reject(new Error("[GroupWithChildren] => (loadData)"));
      }

      this._groupTree = data;
      resolve("Success");
    });
  }

  public async addNewItem(
    newItemInfo: T &
      IIndexableFromRoot &
      IPregnant<T> &
      IDisplayable &
      IOperation &
      IItemV1 &
      IIdentifiable,
    parent?:
      | (T &
          IIndexableFromRoot &
          IPregnant<T> &
          IDisplayable &
          IOperation &
          IIdentifiable)
      | undefined
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      newItemInfo.idIndexesFromRoot =
        parent === undefined
          ? [this._groupTree.length]
          : [...parent.idIndexesFromRoot, parent.children.length];
      newItemInfo.id = Date.now();
      newItemInfo.children = [];
      newItemInfo.operation = "create";
      if (!parent) {
        this._groupTree.push(newItemInfo);
      } else {
        parent.children.push(newItemInfo);
      }

      resolve(newItemInfo);
    });
  }

  public async editItem(
    newItem: Partial<T>,
    item: T & IIndexableFromRoot
  ): Promise<T & any> {
    return new Promise<T & any>((resolve, reject) => {
      const realItem: (T & IOperation) | undefined = this.findItemInTree(
        item,
        this._groupTree
      ) as T & IOperation;

      if (!newItem || !realItem) {
        reject(new Error("[GroupWithChildren] => (editItem)"));
      }

      Object.assign(realItem, newItem);

      realItem.operation = "update";
      resolve(realItem);
    });
  }

  public async deleteItem(
    item: T & IIndexableFromRoot & IDisplayable
  ): Promise<T & any> {
    return new Promise<T & any>((resolve, reject) => {
      const itemToDelete: (T & IOperation & IDisplayable) | undefined =
        this.findItemInTree(item, this._groupTree) as T &
          IOperation &
          IIdentifiable &
          IDisplayable;

      if (itemToDelete === undefined) {
        item.display = false;
        reject(new Error("Impossible de supprimer l'élément"));
      }

      itemToDelete.display = false;
      itemToDelete.operation = "delete";
      resolve(itemToDelete);
    });
  }

  public findItemInTree(
    item: T & IIndexableFromRoot,
    items: Array<T & IIndexableFromRoot & IPregnant<T>>
  ): T | undefined {
    let fullPath: number[] = [];
    let itemToFind: (T & IPregnant<T>) | undefined;

    if (!item || !item.idIndexesFromRoot) {
      return undefined;
    }

    fullPath = item.idIndexesFromRoot;
    if (fullPath.length === 0) {
      return undefined;
    }

    itemToFind = items.at(fullPath[0]);
    for (const [i, path] of fullPath.entries()) {
      if (!itemToFind) {
        return undefined;
      }

      if (i === 0) {
        continue;
      }

      itemToFind = itemToFind.children.at(path);
    }

    return itemToFind;
  }

  public getTree(): T[] {
    return this._groupTree;
  }

  public getPathItem(
    item: T & IIndexableFromRoot,
    arr?: Array<
      T & IIndexableFromRoot & IPregnant<T> & IDisplayable & IIdentifiable & any
    >
  ): T[] {
    let parentItem:
      | (T &
          IIndexableFromRoot &
          IPregnant<T> &
          IDisplayable &
          IIdentifiable &
          any)
      | undefined;
    const path: T[] = [];
    const tree: T[] = arr && arr.length > 0 ? arr : this._groupTree;
    let childItem: T | undefined;

    if (
      !item ||
      !item.idIndexesFromRoot ||
      item.idIndexesFromRoot.length === 0
    ) {
      return [];
    }

    parentItem = tree[item.idIndexesFromRoot[0]];
    path.push(parentItem);
    for (const [i, index] of item.idIndexesFromRoot.entries()) {
      if (i === 0) {
        continue;
      }

      childItem = parentItem.children.at(index);
      if (!childItem) {
        break;
      }

      path.push(childItem);
      parentItem = childItem;
    }

    return path;
  }

  public getParentItem(
    item: T & IIndexableFromRoot,
    arr?: Array<
      T & IIndexableFromRoot & IPregnant<T> & IDisplayable & IIdentifiable
    >
  ): (T & IIdentifiable & IPregnant<T>) | undefined {
    const tree: T[] = arr && arr.length > 0 ? arr : this._groupTree;
    const pathItem: T[] = this.getPathItem(item, tree);

    if (pathItem.length < 2) {
      return undefined;
    }

    return pathItem.at(pathItem.length - 2) as T & IIdentifiable & IPregnant<T>;
  }
}

export { GroupWithChildren };
