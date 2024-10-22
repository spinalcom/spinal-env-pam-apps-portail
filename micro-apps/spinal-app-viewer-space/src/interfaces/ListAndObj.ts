// * Types
import { type DynamicIndexable } from "./";
import { type IIdentifiable } from "../services/GroupeWithChildren/Interfaces/IIdentifiable";

// * Factory
import * as Factory from "factory.ts";

type IndexObj<T> = Record<string | number | symbol, T>;

type ListAndObj<T> = {
  list: T[];
  obj: IndexObj<T>;
};

function createListAndObjByDynamicId<T>(
  list: Array<T & DynamicIndexable>
): ListAndObj<T> {
  const obj = {};

  for (const cell of list) {
    if (cell.dynamicId) {
      obj[cell.dynamicId] = cell;
    }
  }

  return { list, obj };
}

function createListAndObjByTag<T>(
  list: Array<T & DynamicIndexable>,
  tag: string
): ListAndObj<T> {
  const obj = {};

  for (const cell of list) {
    if (cell[tag]) {
      obj[cell[tag]] = cell;
    }
  }

  return { list, obj };
}

function createListAndObjById<T>(
  list: Array<T & IIdentifiable>
): ListAndObj<T> {
  const obj = {};

  for (const cell of list) {
    if (cell.id) {
      obj[cell.id] = cell;
    }
  }

  return { list, obj };
}

const iListObjFactory: Factory.Sync.Factory<any, string | number | symbol> =
  Factory.Sync.makeFactory<ListAndObj<any>>({
    list: [],
    obj: {},
  });

export {
  type IndexObj,
  type ListAndObj,
  createListAndObjByDynamicId,
  createListAndObjById,
  createListAndObjByTag,
  iListObjFactory,
};
