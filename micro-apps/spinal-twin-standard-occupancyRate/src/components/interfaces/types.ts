
  // Interface pour un bâtiment
  export interface Building {
    dynamicId: string;
    area: number;
    cp: number;
    [key: string]: any; // Pour d'autres propriétés non spécifiées
  }
  
  // Interface pour un étage
  export interface Floor {
    dynamicId: string;
    name: string;
  }
  
  export interface Room {
    dynamicId: string;
  }

  // Interface pour un espace (bâtiment ou étage)
  export interface Space {
    type: 'building' | 'floor';
    dynamicId?: string;
  }
  // Interface pour un contexte
  export interface Context {
    dynamicId: string;
    name: string;
  }
  
  // Interface pour une catégorie
  export interface Category {
    dynamicId: string;
    name: string;
  }
  
  // Interface pour un groupe
  export interface Group {
    dynamicId: string;
    name: string;
  }
  
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
  // Interface pour les résultats combinés
  export interface CombinedResult {
    dynamicId: any;
    endpoints: Endpoint[];
    profileName: string;
    timeseries?: TimeSeriesPoint[]; // Ajout de `timeseries` comme optionnel
  }
  
  // Interface pour les données retournées par la fonction
  export interface FloorOccupancyDynamicIdsResponse {
    dynamicIds: string[];
    floorNames: Record<string, string>;
    floorOccupancyMapping: FloorOccupancyMapping;
  }
  // Interface pour les taux d'occupation des étages
  export interface FloorOccupancyRate {
    dynamicId: string;
    occupancy: string;
      area?: number; 
  }
  
  // Interface pour les salles regroupées par étage
  export interface RoomsByFloor {
    [floorId: string]: {
      floorName: string;
      rooms: string[];
    };
  }
  
  
  // Interface pour les données des étages
  export interface FloorData {
    floor: string;
    occupancy: number;
    area?: number;
  }
  
  // Interface pour les données des salles
  export interface RoomData {
    dynamicId: string;
    timeseries: TimeSeriesPoint[];
  }
  
  // Interface pour les points de séries temporelles
  export interface TimeSeriesPoint {
    date: string;
    value: number;
  }
  
  export interface DynamicIdsByFloor {
    [floorId: string]: string[];
  }
  
  export interface AggregatedFloorData {
    [floorId: string]: {
      [periodLabel: string]: number[];
    };
  }
  // Interface pour un point de contrôle
  export interface ControlEndpoint {
    dynamicId: string;
    name: string;
  }
  
  // Interface pour un profil de point de contrôle
  export interface ControlProfile {
    profileName: string;
    endpoints: ControlEndpoint[];
  }
  
  export interface TimeSeriesData {
    timeseries: TimeSeriesPoint[];
  }
  
  export interface ChartData {
    label: string;
    data: number[];
    tooltipDate: string[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    fill: boolean;
  }
  
  export interface TimeSeriesPoint {
    date: string;
    value: number;
  }
  export interface Endpoint {
    dynamicId: string;
    id: string;
    name: string;
    url: string;
  }
  
  export interface FloorOccupancyMapping {
    [floorId: string]: {
      dynamicId: string;
      occupancy: string;
    };
  }
  
  export interface RoomPosition {
    dynamicId(dynamicId: any): unknown;
    id: string;
    name: string;
    floorId: string;
    coordinates: { x: number; y: number };
  }
export interface FloorOccupancyRate {
  dynamicId: string;
  occupancy: string;
  area?: number;
}
  
  export interface Equipment {
    dynamicId: string;
    name?: string; // `name` est optionnel pour éviter les conflits
    info?: {
      floor?: {
        dynamicId: string;
        name: string;
      };
    };
  }