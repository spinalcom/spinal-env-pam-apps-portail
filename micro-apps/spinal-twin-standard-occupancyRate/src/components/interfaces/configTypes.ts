import { ChartData } from "chart.js";

// Définition des types pour les propriétés spécifiques
export interface ApiEndpoints {
  building: string;
  floors: string;
  controlEndpointList: string;
  timeSeries: string;
  timeSeriesMultiple: string;
  roomPositions: string;
  attributeListMultiple: string;
  groupContextList: string;
  categoryList: string;
  groupList: string;
  roomList: string;
  controlEndpointListMultiple: string;
  contextList: string;
  contextTree: string;
  floorAttributes: string;
  equipmentContextList: string;
  equipmentCategoryList: string;
  equipmentGroupList: string;
  equipmentList: string;
  thirdChartPositions: string;
}

export interface EntryPoint {
  name: string;
  context: string;
  category: string;
  group: string;
  type: string;
  id: number;
  source: {
    label: any;
    borderColor: any;
    globalDisplay: string;
    byFloorDisplay: string;
    display: unknown;
    profileName: string;
    name: string;
    type: string;
  }[];
}

export interface ChartsConfig {
  globalChart: any;
  firstChart: ChartData;
  secondChart: ChartData;
  thirdChart: ChartData;
}