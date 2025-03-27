import { type IDisplayable } from "@/services/GroupeWithChildren/Interfaces";
import { type IIdentifiable } from "../services/GroupeWithChildren/Interfaces/IIdentifiable";

type IItemV1 = {
  title: string;
} & IIdentifiable &
  IDisplayable;

export type { IItemV1 };
