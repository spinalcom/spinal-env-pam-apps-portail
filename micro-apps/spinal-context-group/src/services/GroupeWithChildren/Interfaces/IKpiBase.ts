import * as Factory from "factory.ts";

type KpiBase = {
  value: number;
  percentage: number;
};

const iKpiBaseFactory = Factory.Sync.makeFactory<KpiBase>({
  value: 0,
  percentage: 0,
});

export { type KpiBase, iKpiBaseFactory };
