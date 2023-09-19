import { BarChart } from "./BarChart";
import {
  getMonthTimeSeriesAsync,
  getNodeControlEndpointsListAsync,
  getTimeSeriesAsync,
  getWeekTimeSeriesAsync,
  getYearTimeSeriesAsync,
} from "../api-requests";
import * as config from "../../config";
import moment from "moment";

export class Process {
  private readonly workflowId: number;
  private readonly dynamicId: number;
  private name: string;
  private initiated: boolean;
  private closedInPeriod: number;
  private color: number;
  private readonly endpoints: { dynamicId: number; name: string }[];
  private barChart: BarChart[];
  private lineChart: BarChart[];

  constructor(workflowId: number, dynamicId: number, name: string) {
    this.workflowId = workflowId;
    this.dynamicId = dynamicId;
    this.name = name;
    this.initiated = false;
    this.color = 0;
    this.endpoints = [];
    this.barChart = <BarChart[]>[];
    this.lineChart = <BarChart[]>[];
    this.closedInPeriod = 0;
  }

  public isLoaded(period: string) {
    return this.initiated && this.barChart[0].isLoaded(period);
  }

  public getWorkflowId(): number {
    return this.workflowId;
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

  public getClosedInPeriod() {
    return this.closedInPeriod;
  }

  public getBarChart(period: string) {
    return this.barChart.map((p) => p.getData(period));
  }

  public getLineChart(period: string) {
    return this.lineChart.map((p) => p.getData(period));
  }

  public async buildProcess(period: string, index: number = 0) {
    await this.initProcess();
    await this.buildBarChart(period, index);
  }

  private async initProcess() {
    if (this.initiated) return;
    const endpoint_list = await getNodeControlEndpointsListAsync(
      this.dynamicId
    );

    if (endpoint_list)
      for (const endpoint of endpoint_list.endpoints) {
        this.endpoints.push({
          dynamicId: endpoint.dynamicId,
          name: endpoint.name,
        });
        const color = config.controlPointProfil.endpoints.find(
          (e: any) => e.name === endpoint.name
        ).color;
        if (endpoint.name === "Temps de résolution")
          this.lineChart.push(new BarChart(color, color, 1, endpoint.name));
        else this.barChart.push(new BarChart(color, color, 1, endpoint.name));
      }
    else
      for (const endpoint of config.controlPointProfil.endpoints)
        if (endpoint.name === "Temps de résolution")
          this.lineChart.push(
            new BarChart(endpoint.color, endpoint.color, 2, endpoint.name)
          );
        else
          this.barChart.push(
            new BarChart(endpoint.color, endpoint.color, 1, endpoint.name)
          );

    this.initiated = true;
  }

  private async buildBarChart(period: string, index: number = 0) {
    if (this.barChart[0].isLoaded(period)) return;
    for (const endpoint of this.endpoints) {
      let series = [{ date: Date.now(), value: 0 }];
      const currentPeriod = moment();
      switch (period) {
        case "week":
          series = await getWeekTimeSeriesAsync(endpoint.dynamicId, index);
          currentPeriod.add(index, "weeks");
          if (endpoint.name === "Temps de résolution")
            this.closedInPeriod = series.filter((s) =>
              moment(s.date - s.value).isSame(currentPeriod, "week")
            ).length;
          break;
        case "month":
          series = await getMonthTimeSeriesAsync(endpoint.dynamicId, index);
          currentPeriod.add(index, "months");
          if (endpoint.name === "Temps de résolution")
            this.closedInPeriod = series.filter((s) =>
              moment(s.date - s.value).isSame(currentPeriod, "month")
            ).length;
          break;
        case "year":
          series = await getYearTimeSeriesAsync(endpoint.dynamicId, index);
          currentPeriod.add(index, "years");
          if (endpoint.name === "Temps de résolution")
            this.closedInPeriod = series.filter((s) =>
              moment(s.date - s.value).isSame(currentPeriod, "year")
            ).length;
          break;
        case "decade":
          series = await getTimeSeriesAsync(endpoint.dynamicId, index);
          currentPeriod.add(index * 10, "years");
          if (endpoint.name === "Temps de résolution")
            this.closedInPeriod = series.filter((s) =>
              moment(s.date - s.value).isBetween(
                currentPeriod,
                moment(currentPeriod).add(10, "years"),
                "year"
              )
            ).length;
          break;
      }
      this.barChart.forEach((b) => {
        if (b.getLabel() === endpoint.name) {
          if (endpoint.name === "Nombre de tickets en cours")
            b.setDataAVG(period, series, index);
          else b.setData(period, series, index);
        }
      });
      this.lineChart.forEach((b) => {
        if (b.getLabel() === endpoint.name)
          b.setLineData(period, series, index);
      });
    }
  }
}
