import { type IIdentifiable } from "./IIdentifiable";

type Comparaison = "gt" | "lt" | "btw" | "eq";

type DynamicFilter = {
  name: string;
  type: "string" | "number" | "boolean";
  min: string;
  max: string;
  value: string;
  category: string;
  displayName: string;
  comparaison: Comparaison;
} & IIdentifiable;

export { type Comparaison, type DynamicFilter };
