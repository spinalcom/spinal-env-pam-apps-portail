import * as Factory from "factory.ts";

type KpiBase = {
  value: number;
  percentage: number;
  unitValue: number;

};

const iKpiBaseFactory = Factory.Sync.makeFactory<KpiBase>({
  value: 0,
  percentage: 0,
  unitValue: 0,
});

export { type KpiBase, iKpiBaseFactory };
