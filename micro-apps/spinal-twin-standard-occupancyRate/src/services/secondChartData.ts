import { FloorOccupancyRate, DynamicIdsByFloor, RoomsByFloor, FloorOccupancyMapping, AggregatedFloorData, Equipment } from '../components/interfaces/types';
import { getFloors, getRoomPositions, groupSecondChartsByFloor, getFloorSecondChartOccupationDynamicIds, getFloorOccupancyRatesByPeriod, getThirdChartPositions, getThirdChartData } from './index';
import { cachedFloors, cachedRoomPositions, cachedRoomsByFloor, cachedDynamicIdsByFloor, cachedDynamicIds, cachedFloorNames, cachedFloorOccupancyMapping, getPeriodArray, calculateTimeWeightedAverage, filterTimeSeries, cachedEquipmentEntryPoints, processEntryPoints, extractDynamicIds, processInBatches, calculateBinaryOccupancyRate } from './calculationUtils';
import moment from 'moment';
import { config } from '../config';
import { SpinalAPI } from './spinalAPI/spinalAPI';
import { EntryPoint } from '../components/interfaces/configTypes';
import { apiEndpoints } from '../configConstants'; 
import lodash from 'lodash';
// On Récupère les données de graphe pour un bâtiment.

export async function fetchTotalSurface(): Promise<number | null> {
  try {
    
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('Building ID not found in localStorage');
      return null; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/building/read');
    

    const result = await spinalApi.get(url);
    
    const totalSurface = Math.round(result.data.area);
    
    return totalSurface;
  } catch (error) {
    console.error("Erreur lors de la récupération de la surface totale :", error);
    return null;
  }
}

// Fonction pour récupérer la surface totale des salles données
export async function getTotalSurface2(roomIdsByEntryPoint: Record<string, string[]>): Promise<Record<string, number>> {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('idBuilding not found in localStorage');
      return {}; // Retourne un objet vide si l'ID du bâtiment est introuvable */
    }

    const spinalApi = SpinalAPI.getInstance();
    const totalSurfacesByEntryPoint: Record<string, number> = {};

    for (const [entryPoint, roomIds] of Object.entries(roomIdsByEntryPoint)) {
      if (!roomIds || roomIds.length === 0) {
        console.warn(`No room IDs found for entryPoint: ${entryPoint}`);
        totalSurfacesByEntryPoint[entryPoint] = 0;
        continue;
      }


      const combinedResults = await processInBatches(roomIds, 50, async (batch) => {
        const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/attribute_list_multiple');
        const response = await spinalApi.post(url, batch);
        return response.data;
      });

      let totalSurface = 0;
      combinedResults.forEach(room => {
        const category = room.categoryAttributes.find((cat: any) => cat.name === "Spatial");
        if (category && category.attributs) {
          const areaAttribute = category.attributs.find((attr: any) => attr.label === "area");
          if (areaAttribute && areaAttribute.value) {
            totalSurface += parseFloat(areaAttribute.value);
          }
        }
      });

      totalSurfacesByEntryPoint[entryPoint] = totalSurface;
    }

    return totalSurfacesByEntryPoint;
  } catch (error) {
    console.error('Error in getTotalSurface2:', error);
    return {};
  }
}

export async function fetchThirdChartTotalCount(): Promise<Record<string, number>> {
  try {

    // Appeler getThirdChartData pour récupérer tous les IDs des équipements
    const thirdChartData = await getThirdChartData();

    // Calculer le nombre total d'équipements pour chaque entryPoint
    const totalCountByEntryPoint: Record<string, number> = {};
    for (const [entryPoint, equipmentIds] of Object.entries(thirdChartData)) {
      totalCountByEntryPoint[entryPoint] = equipmentIds.length;
    }

    return totalCountByEntryPoint;
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre total d'équipements :", error);
    return {};
  }
}


const groupThirdChartsCache: Map<string, Record<string, { floorName: string; equipments: string[] }>> = new Map();
// Fonction pour regrouper les équipements par étage
export function groupThirdChartsByFloor(thirdChartPositions: Equipment[]): Record<string, { floorName: string; equipments: string[] }> {
  try {

    // Générer une clé unique pour le cache en fonction des IDs des équipements
    const cacheKey = JSON.stringify(thirdChartPositions.map(equipment => equipment.dynamicId).sort());

    // Vérifier si les résultats sont déjà dans le cache
    if (groupThirdChartsCache.has(cacheKey)) {
      return groupThirdChartsCache.get(cacheKey)!;
    }

    const equipmentsByFloor: Record<string, { floorName: string; equipments: string[] }> = {};
    thirdChartPositions.forEach(equipment => {
      const floorId = equipment.info?.floor?.dynamicId;
      const floorName = equipment.info?.floor?.name;

      if (!floorId || !floorName) return;
      if (!equipmentsByFloor[floorId]) {
        equipmentsByFloor[floorId] = { floorName, equipments: [] };
      }

      equipmentsByFloor[floorId].equipments.push(equipment.dynamicId);
    });


    // Stocker les résultats dans le cache
    groupThirdChartsCache.set(cacheKey, equipmentsByFloor);

    return equipmentsByFloor;
  } catch (error) {
    console.error('Error in groupThirdChartsByFloor:', error);
    return {};
  }
}
  
  // Fonction pour récupérer les IDs dynamiques des points de contrôle pour les équipements par étage
  export async function getThirdChartOccupationDynamicIdsByFloor(
    thirdChartIds: string[],
    equipmentsByFloor: Record<string, { floorName: string; equipments: string[] }>,
    entryPoint: EntryPoint
  ): Promise<DynamicIdsByFloor> {
    try {

      const buildingId = localStorage.getItem("idBuilding");
      if (!buildingId) {
 /*        console.error('Building ID not found in localStorage');
        return {}; */
      }
  
      if (!thirdChartIds || thirdChartIds.length === 0) {
        console.warn('No thirdChartIds provided.');
        return {};
      }
  
      if (!equipmentsByFloor || Object.keys(equipmentsByFloor).length === 0) {
        console.warn('equipmentsByFloor is empty or undefined.');
        return {};
      }
  
      const batchSize = 50;
      const batchedPromises = [];
  
      for (let i = 0; i < thirdChartIds.length; i += batchSize) {
        const batch = thirdChartIds.slice(i, i + batchSize);
  
        const spinalApi = SpinalAPI.getInstance();
        const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
        batchedPromises.push(spinalApi.post(url, batch));
      }
  
      const results = await Promise.all(batchedPromises);
      const combinedResults = results.flatMap(result => result.data);
  
      const dynamicIdsByFloor: DynamicIdsByFloor = {};
  
      const processEquipmentEndpointByFloor = (
        endpoint: { dynamicId: string },
        equipment: Equipment,
        dynamicIdsByFloor: DynamicIdsByFloor,
        equipmentsByFloor: Record<string, { floorName: string; equipments: string[] }>
      ) => {
        const floorId = Object.keys(equipmentsByFloor).find(floorId =>
          equipmentsByFloor[floorId]?.equipments?.includes(equipment.dynamicId)
        );
        if (floorId) {
          if (!dynamicIdsByFloor[floorId]) {
            dynamicIdsByFloor[floorId] = [];
          }
          dynamicIdsByFloor[floorId].push(endpoint.dynamicId);
        }
      };
  
      extractDynamicIds(combinedResults, entryPoint, (endpoint, equipment, dynamicIds, ...extraParams) => {

        processEquipmentEndpointByFloor(endpoint, equipment, dynamicIdsByFloor, equipmentsByFloor);
      });
  
      return dynamicIdsByFloor;
    } catch (error) {
      console.error('Error in getThirdChartOccupationDynamicIdsByFloor:', error);
      return {};
    }
  }
  
  export let cachedThirdChartPositions: any[] = [];
  export let cachedEquipmentsByFloor: Record<string, { floorName: string; equipments: string[] }> = {};
  export let cachedDynamicIdsByFloorForThirdChart: DynamicIdsByFloor = {};
  export async function initializeThirdChartData(): Promise<{
    equipmentsByFloorByEntryPoint: Record<string, Record<string, { floorName: string; equipments: string[] }>>;
    positionsByEntryPoint: Record<string, any[]>;
    dynamicIdsByFloorByEntryPoint: Record<string, DynamicIdsByFloor>;
  }> {
    try {
  
      if (!cachedEquipmentEntryPoints || cachedEquipmentEntryPoints.length === 0) {
        console.warn(" Aucun equipmentEntryPoint valide trouvé. Initialisation des sources...");
        const { equipmentEntryPoints } = await processEntryPoints();
        cachedEquipmentEntryPoints.length = 0;
        cachedEquipmentEntryPoints.push(...equipmentEntryPoints);
        if (!cachedEquipmentEntryPoints || cachedEquipmentEntryPoints.length === 0) {
          throw new Error("Aucun equipmentEntryPoint valide trouvé après initialisation.");
        }
      }
  
      const equipmentsByFloorByEntryPoint: Record<string, Record<string, { floorName: string; equipments: string[] }>> = {};
      const positionsByEntryPoint: Record<string, any[]> = {};
      const dynamicIdsByFloorByEntryPoint: Record<string, DynamicIdsByFloor> = {};
  
      for (const entryPoint of cachedEquipmentEntryPoints) {
  
        const equipmentData = await getThirdChartData();
        const equipmentIds = equipmentData[entryPoint.name];
        if (!equipmentIds || equipmentIds.length === 0) {
          console.warn(` Aucun équipement trouvé pour l'entryPoint : ${entryPoint.name}`);
          continue;
        }
  
        const positions = await getThirdChartPositions(equipmentIds, entryPoint.name);
        if (!positions || positions.length === 0) {
          console.warn(` Aucune position d'équipement trouvée pour l'entryPoint : ${entryPoint.name}`);
          continue;
        }
  
        const equipmentsByFloor = groupThirdChartsByFloor(positions);
        if (!equipmentsByFloor || Object.keys(equipmentsByFloor).length === 0) {
          console.warn(` Aucun équipement regroupé par étage pour l'entryPoint : ${entryPoint.name}`);
          continue;
        }
  
        const dynamicIdsByFloor = await getThirdChartOccupationDynamicIdsByFloor(
          equipmentIds,
          equipmentsByFloor,
          entryPoint
        );
        if (!dynamicIdsByFloor || Object.keys(dynamicIdsByFloor).length === 0) {
          console.warn(` Aucun ID dynamique trouvé pour l'entryPoint : ${entryPoint.name}`);
          continue;
        }
  
        equipmentsByFloorByEntryPoint[entryPoint.name] = equipmentsByFloor;
        positionsByEntryPoint[entryPoint.name] = positions;
        dynamicIdsByFloorByEntryPoint[entryPoint.name] = dynamicIdsByFloor;
  
      }
  
      // Mettre à jour les caches globaux
      cachedThirdChartPositions = Object.values(positionsByEntryPoint).flat();
      cachedEquipmentsByFloor = Object.assign({}, ...Object.values(equipmentsByFloorByEntryPoint));
      cachedDynamicIdsByFloorForThirdChart = {};
      for (const entryPointName in dynamicIdsByFloorByEntryPoint) {
        const dynamicIdsByFloor = dynamicIdsByFloorByEntryPoint[entryPointName];
        for (const floorId in dynamicIdsByFloor) {
          if (!cachedDynamicIdsByFloorForThirdChart[floorId]) {
            cachedDynamicIdsByFloorForThirdChart[floorId] = [];
          }
          cachedDynamicIdsByFloorForThirdChart[floorId].push(...dynamicIdsByFloor[floorId]);
        }
      }
      cachedDynamicIdsByFloorByEntryPoint = dynamicIdsByFloorByEntryPoint; // Mettre à jour le cache global
  
      return {
        equipmentsByFloorByEntryPoint,
        positionsByEntryPoint,
        dynamicIdsByFloorByEntryPoint,
      };
    } catch (error) {
      console.error(" Erreur lors de l'initialisation des données pour le troisième graphique :", error);
      throw error;
    }
  }
  // Fonction pour récupérer les données de séries temporelles pour les équipements par étage
    export let cachedDynamicIdsByFloorByEntryPoint: Record<string, DynamicIdsByFloor> = {};
    export async function getThirdChartOccupancyDataByFloor(
      space: { type: string; dynamicId?: string },
      tempo: string,
      currentTimestamp: number,
      thirdChartIds: string[],
      startTime: string | null = null,
      endTime: string | null = null
    ): Promise<{
      resultsByEntryPoint: Record<string, { label: string[]; data: any[]; averages: { floor: string; average: number }[] }>;
    }> {
      try {

    
        const buildingId = localStorage.getItem("idBuilding");
        if (!buildingId) {
/*           console.error('Building ID not found in localStorage');
          return { resultsByEntryPoint: {} }; */
        }
    
        const periodArray = getPeriodArray(currentTimestamp, tempo);
        const label = periodArray[0];
        const tooltipDate = periodArray[5];
    
        if (
          cachedThirdChartPositions.length === 0 ||
          Object.keys(cachedEquipmentsByFloor).length === 0 ||
          Object.keys(cachedDynamicIdsByFloorForThirdChart).length === 0
        ) {
          throw new Error("Les données nécessaires pour le troisième graphique ne sont pas initialisées. Appelez initializeThirdChartData d'abord.");
        }
    
    
        const resultsByEntryPoint: Record<string, { label: string[]; data: any[]; averages: { floor: string; average: number }[] }> = {};
    
        for (const entryPoint of cachedEquipmentEntryPoints || []) {
    
          // Utiliser le cache global pour récupérer les Dynamic IDs
          const dynamicIdsByFloor = cachedDynamicIdsByFloorByEntryPoint[entryPoint.name];
          if (!dynamicIdsByFloor) {
            console.warn(`Aucun Dynamic ID trouvé pour l'entryPoint : ${entryPoint.name}`);
            continue;
          }
    
    
        const averages: { floor: string; average: number }[] = [];
        const data: any[] = [];
  
        for (const floor of Object.keys(dynamicIdsByFloor)) {
          const floorName = cachedEquipmentsByFloor[floor]?.floorName || `Étage ${floor}`;
  
          const dynamicIds = dynamicIdsByFloor[floor];
          if (dynamicIds && dynamicIds.length > 0) {
  
            const batchSize = 50;
            const chunkedDynamicIds = lodash.chunk(dynamicIds, batchSize);
  
            const promises = chunkedDynamicIds.map(async (batch) => {
              const url = SpinalAPI.getInstance().createUrlWithPlatformId(
                buildingId,
                `api/v1/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`
              );
              const response = await SpinalAPI.getInstance().post<{ data: any[] }>(url, batch);
              return response.data;
            });
  
            const results = await Promise.all(promises);
            let timeSeriesData: any[] = results.flat();
  
            timeSeriesData.forEach((roomData) => {
              roomData.timeseries = filterTimeSeries(roomData.timeseries || [], startTime, endTime);
            });
  
            const floorSeries = timeSeriesData.flatMap((roomData) => roomData.timeseries);
  
            const sourceType = entryPoint.source.find((source) => source.byFloorDisplay)?.type || "continue";
  
            const weightedAverages =
              sourceType === "binaire"
                ? calculateBinaryOccupancyRate(floorSeries, label, tempo)
                : calculateTimeWeightedAverage(floorSeries, label, tempo);
  
  
            averages.push({
              floor: floorName,
              average:
                weightedAverages.length > 0
                  ? weightedAverages.reduce((sum, val) => sum + val, 0) / weightedAverages.length
                  : 0,
            });
          } else {
          }
        }
  
        resultsByEntryPoint[entryPoint.name] = {
          label,
          data,
          averages,
        };
      }  
      return { resultsByEntryPoint };
    } catch (error) {
      console.error("Erreur dans getThirdChartOccupancyDataByFloor :", error);
      return { resultsByEntryPoint: {} };
    }
  }
  
  // Fonction utilitaire pour formater les labels
  export function formatLabel(date: string, tempo: string): string {
    switch (tempo) {
      case 'Journée':
      case 'Valeur Courante':
        return moment(date).format('HH');
      case 'Semaine':
      case 'Mois':
      case 'Trimestre':
        return moment(date).format('DD MMM');
      case 'Année':
        return moment(date).format('MMM');
      case 'Décennie':
        return moment(date).format('YYYY');
      default:
        return moment(date).format('DD MMM');
    }
  }
 