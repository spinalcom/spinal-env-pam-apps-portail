import { BarChart } from "./BarChart";
import {
  getAttributsList,
  getMonthTimeSeriesAsync,
  getNodeControlEndpointsListAsync,
  getTimeSeriesAsync,
  getWeekTimeSeriesAsync,
  getYearTimeSeriesAsync,
} from "../api-requests";
import * as config from "../../config";
import moment from "moment";

export class Workflow {
  private readonly dynamicId: number;
  private name: string;
  private initiated: boolean;
  private color: number;
  private readonly endpoints: { dynamicId: number; name: string }[];
  private barChart: BarChart[];
  private lineChart: BarChart[];

  constructor(dynamicId: number, name: string) {
    this.dynamicId = dynamicId;
    this.name = name;
    this.initiated = false;
    this.color = 0;
    this.endpoints = [];
    this.barChart = <BarChart[]>[];
    this.lineChart = <BarChart[]>[];
  }

  public isLoaded(period: string) {
    return this.initiated && this.barChart[0].isLoaded(period);
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

  public getLineChart(period: string) {
    return this.lineChart.map((p) => p.getData(period));
  }

  public async buildWorkflow(period: string, index: number = 0) {
    await this.initWorkflow();
    await this.buildBarChart(period, index);
  }

  private async initWorkflow() {
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
          this.lineChart.push(new BarChart(color, color, 2, endpoint.name));
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
    for (const endpoint of this.endpoints) {
      let series = [{ date: Date.now(), value: 0 }];
      switch (period) {
        case "week":
          series = await getWeekTimeSeriesAsync(endpoint.dynamicId, index);
          break;
        case "month":
          series = await getMonthTimeSeriesAsync(endpoint.dynamicId, index);
          break;
        case "year":
          series = await getYearTimeSeriesAsync(endpoint.dynamicId, index);
          break;
        case "decade":
          series = await getTimeSeriesAsync(endpoint.dynamicId, index);
          break;
      }
      this.barChart.forEach((b) => {
        if (b.getLabel() === endpoint.name) {
          if (endpoint.name === "Nombre de tickets en cours") {
            b.setDataAVG(period, series, index);
          } else b.setData(period, series, index);
        }
      });
      this.lineChart.forEach((b) => {
        if (b.getLabel() === endpoint.name) {
          b.setLineData(period, series, index);
        }
      });
    }
  }
}
