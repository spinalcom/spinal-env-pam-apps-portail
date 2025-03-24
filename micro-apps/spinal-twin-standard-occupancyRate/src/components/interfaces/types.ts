export interface ChartData {
    label: string;
    backgroundColor: string;
    data: number[];
    stack: string;
    tooltipDate: string[];
  }
  
  export interface tempoFilter {
    name: string;
    value: string;
    color: string;
    lock: boolean;
    star: boolean;
  }