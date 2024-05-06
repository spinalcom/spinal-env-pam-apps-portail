import * as Factory from "factory.ts";

import { DynamicFilter } from "../Interfaces";

const iDynamicFilterFactory: Factory.Sync.Factory<
  any,
  string | number | symbol
> = Factory.Sync.makeFactory<DynamicFilter>({
  name: "Default",
  min: 0,
  max: 0,
  type: "number",
  value: "",
  category: "Spatial",
  displayName: "Default",
  id: Date.now(),
});

export { iDynamicFilterFactory };
