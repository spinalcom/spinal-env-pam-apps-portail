import { BarChart } from "./BarChart";
import {
  getAttributsList,
  getMonthTimeSeriesAsync,
  getNodeControlEndpointsListAsync,
  getTimeSeriesAsync,
  getWeekTimeSeriesAsync,
  getYearTimeSeriesAsync,
} from "../api-requests";
import { barColors } from "../colors";
import { lastWeek, sameWeek } from "../date-comparison";
import { Endpoint } from "./Endpoint";

export class Workflow {
  private readonly dynamicId: number;
  private readonly buildingId: string;
  private name: string;
  private initiated: boolean;
  private color: number;
  private readonly endpoints: Endpoint[];
  private barChart: BarChart[];
  private pieChart: { label: string; value: number }[];
  private readonly indicators: {
    unit: string;
    title: string;
    subtitle: string;
    value: number;
    compared: string;
    type: string;
  }[];

  constructor(buildingId: string, dynamicId: number, name: string) {
    this.buildingId = buildingId;
    this.dynamicId = dynamicId;
    this.name = name;
    this.initiated = false;
    this.color = 0;
    this.endpoints = <Endpoint[]>[];
    this.indicators = [];
    this.barChart = <BarChart[]>[];
    this.pieChart = [];
  }

  public isLoaded(period: string) {
    return (
      this.initiated &&
      this.barChart.length &&
      this.barChart[0].isLoaded(period)
    );
  }

  public getBuildingId(): string {
    return this.buildingId;
  }

  public getDynamicId(): number {
    return this.dynamicId;
  }

  public setColor(color: number) {
    this.color = color;
  }

  public getColor() {
    return this.color;
  }

  public getBarChart(period: string) {
    return this.barChart.map((p) => p.getData(period));
  }

  public getPieChart() {
    if (this.pieChart.length === 1 && this.pieChart[0].value == 0) return [];
    return this.pieChart;
  }

  public getIndicators() {
    return this.indicators;
  }

  public async buildWorkflow(period: string) {
    await this.initWorkflow();
    await this.buildBarChart(period);
  }

  private initWorkflow() {
    if (this.initiated) return;
    this.initiated = true;
    const promises = [];
    promises.push(getAttributsList(this.buildingId, this.dynamicId));
    promises.push(
      getNodeControlEndpointsListAsync(this.buildingId, this.dynamicId)
    );

    return Promise.all(promises)
      .then((results) => {
        const [attribute_list, endpoint_list] = results;

        this.pieChart =
          attribute_list
            .find((a: any) => a.name === "Nombre de tickets par declarant")
            ?.attributs.map((att: any) => ({
              label: att.label,
              value: Number(att.value),
            })) || [];

        const colors = barColors();
        let i = 0;
        for (const endpoint of endpoint_list?.endpoints || []) {
          this.endpoints.push({
            dynamicId: endpoint.dynamicId,
            name: endpoint.name,
            currentValue: endpoint.currentValue,
          });
          if (endpoint.name === "Temps moyen de résolution de tickets")
            continue;
          this.barChart.push(
            new BarChart(colors[i], colors[i++], 1, endpoint.name)
          );
        }
      })
      .catch(() => (this.initiated = false));
  }

  private async buildBarChart(period: string) {
    if (!this.barChart.length) return;
    if (this.barChart[0].isLoaded(period)) return;
    for (const endpoint of this.endpoints) {
      let series = [{ date: Date.now(), value: 0 }];
      switch (period) {
        case "week":
          series = await getWeekTimeSeriesAsync(
            this.buildingId,
            endpoint.dynamicId
          );
          break;
        case "month":
          series = await getMonthTimeSeriesAsync(
            this.buildingId,
            endpoint.dynamicId
          );
          break;
        case "year":
          series = await getYearTimeSeriesAsync(
            this.buildingId,
            endpoint.dynamicId
          );
          break;
        case "decade":
          series = await getTimeSeriesAsync(
            this.buildingId,
            endpoint.dynamicId
          );
          break;
      }
      this.barChart.forEach((b) => {
        if (b.getLabel() === endpoint.name) {
          if (endpoint.name === "Nombre de tickets en cours") {
            b.setDataAVG(period, series);
          } else b.setData(period, series);
        }
      });
      this.buildIndicators(endpoint, series);
    }
  }

  private compareWeek(series: { date: number; value: number }[]) {
    const this_week_value = series[series.length - 1]?.value || 0;
    const last_week_value = series[series.length - 8]?.value || 0;

    const sign = this_week_value < last_week_value ? "-" : "+";
    return `${sign}${Math.abs(this_week_value - last_week_value)}`;
  }

  private buildIndicators(
    endpoint: any,
    series: { date: number; value: number }[]
  ) {
    if (this.indicators.length >= 4) return;

    const val =
      series.length === 0
        ? 0
        : new Date(
            series.map((ts) => ts.value).reduce((ts1, ts2) => ts1 + ts2, 0) /
              series.length
          ).getHours();
    switch (endpoint.name) {
      case "Nombre de tickets créés":
        this.indicators.push({
          unit: "Tickets",
          title: "créés aujourd'hui",
          subtitle: "Aujourd'hui",
          value: series[series.length - 1]?.value || 0,
          compared: "",
          type: "date",
        });
        this.indicators.push({
          unit: "Tickets",
          title: "créés cette semaine",
          subtitle: "cette semaine",
          value: series
            .filter((s) => sameWeek(new Date(s.date), new Date()))
            .map((t) => t.value)
            .reduce((t1, t2) => t1 + t2, 0),
          compared: "",
          type: "date",
        });
        break;
      case "Nombre de tickets en cours":
        this.indicators.push({
          unit: "Tickets",
          title: "en cours",
          subtitle: "par rapport à la semaine dernière",
          value: series[series.length - 1]?.value || 0,
          compared: this.compareWeek(series),
          type: "comparison",
        });
        break;
      case "Temps moyen de résolution de tickets":
        this.indicators.push({
          unit: "Heures",
          title: "Temps de résolution moyen",
          subtitle: "par rapport à la moyenne",
          value: val,
          compared: val < 3 ? "Rapide " : val < 5 ? "Normal " : "Lent ",
          type: "comparison",
        });
        break;
    }
  }
}
