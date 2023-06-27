import { PeriodicFigures } from "./PeriodicFigures";

export class BarChart {
  private readonly backgroundColor: string;
  private readonly borderColor: string;
  private readonly borderWidth: number;
  private readonly label: string;
  private data: PeriodicFigures;

  constructor(
    backgroundColor: string,
    borderColor: string,
    borderWidth: number,
    label: string
  ) {
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.borderWidth = borderWidth;
    this.label = label;
    this.data = new PeriodicFigures();
  }

  public getLabel() {
    return this.label;
  }

  public setData(
    period: string,
    series: { date: number; value: number }[]
  ): void {
    this.data.setData(period, series);
  }

  public setDataAVG(
    period: string,
    series: { date: number; value: number }[]
  ): void {
    this.data.setDataAVG(period, series);
  }

  public isLoaded(period: string) {
    return this.data.isLoaded(period);
  }

  public getData(period: string) {
    return {
      label: this.label,
      data: this.data.getData(period),
      backgroundColor: this.backgroundColor,
      borderColor: this.borderColor,
      borderWidth: this.borderWidth,
    };
  }
}
