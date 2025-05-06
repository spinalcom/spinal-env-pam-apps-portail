import { FloorOccupancyRate, DynamicIdsByFloor, RoomsByFloor, FloorOccupancyMapping, AggregatedFloorData, Equipment } from '../components/interfaces/types';
import { getFloors, getRoomPositions, groupSecondChartsByFloor, getFloorSecondChartOccupationDynamicIds, getFloorOccupancyRatesByPeriod, getThirdChartPositions, getThirdChartData } from './index';
import { cachedFloors, cachedRoomPositions, cachedRoomsByFloor, cachedDynamicIdsByFloor, cachedDynamicIds, cachedFloorNames, cachedFloorOccupancyMapping, getPeriodArray, calculateTimeWeightedAverage, filterTimeSeries, cachedEquipmentEntryPoints, processEntryPoints, extractDynamicIds, processInBatches, calculateBinaryOccupancyRate } from './calculationUtils';
import moment from 'moment';
import { config } from '../config';
import { SpinalAPI } from './spinalAPI/spinalAPI';
import { EntryPoint } from '../components/interfaces/configTypes';
import { apiEndpoints } from '../configConstants'; 

// On Récupère les données de graphe pour un bâtiment.

export async function fetchTotalSurface(): Promise<number | null> {
  try {
    console.log('fetchTotalSurface called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('Building ID not found in localStorage');
      return null;
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/building/read');
    console.log("Generated URL for fetchTotalSurface:", url);

    const result = await spinalApi.get(url);
    console.log('Response from fetchTotalSurface:', result.data);

    const totalSurface = Math.round(result.data.area);
    console.log('Total surface:', totalSurface);
    return totalSurface;
  } catch (error) {
    console.error("Erreur lors de la récupération de la surface totale :", error);
    return null;
  }
}

// Fonction pour récupérer la surface totale des salles données
export async function getTotalSurface2(roomIds: string[]): Promise<number | null> {
  try {
    console.log('Fetching total surface for rooms');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null; 
    }

    

    console.log('Building ID:', buildingId);
    console.log('Room IDs:', roomIds);

    const spinalApi = SpinalAPI.getInstance();
    const combinedResults = await processInBatches(roomIds, 50, async (batch) => {
      const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/attribute_list_multiple');
      const response = await spinalApi.post(url, batch);
      return response.data;
    });

    let totalSurface2 = 0; 
    combinedResults.forEach(room => {
      const category = room.categoryAttributes.find((cat: any) => cat.name === "Spatial");
      if (category && category.attributs) {
        const areaAttribute = category.attributs.find((attr: any) => attr.label === "area");
        if (areaAttribute && areaAttribute.value) {
          totalSurface2 += parseFloat(areaAttribute.value);
        }
      }
    });

    console.log(`Total surface of meeting rooms: ${totalSurface2.toFixed(3)} m²`);
    return totalSurface2;
  } catch (error) {
    console.error('Error in getTotalSurface2:', error);
    return null;
  }
}

export async function fetchThirdChartTotalCount(): Promise<number> {
  try {
    console.log('fetchThirdChartTotalCount called');

    // Appeler getThirdChartData pour récupérer tous les IDs des équipements
    const thirdChartIds = await getThirdChartData();

    // Retourner le nombre total d'équipements
    const totalCount = thirdChartIds.length;
    console.log('Total Equipment Count:', totalCount);
    return totalCount;
  } catch (error) {
    console.error("Erreur lors de la récupération du nombre total d'équipements :", error);
    return 0;
  }
}



// Fonction pour regrouper les équipements par étage
export function groupThirdChartsByFloor(thirdChartPositions: Equipment[]): Record<string, { floorName: string; equipments: string[] }> {
    try {
      console.log('Grouping equipments by floor');
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
  
      console.log('Equipments grouped by floor:', equipmentsByFloor);
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
    entryPoint: EntryPoint // Passer l'entryPoint dynamiquement
  ): Promise<DynamicIdsByFloor> {
    try {
      console.log('getThirdChartOccupationDynamicIdsByFloor called');
      const buildingId = localStorage.getItem("idBuilding");
      if (!buildingId) {
        console.error('Building ID not found in localStorage');
        return {};
      }
  
      if (!thirdChartIds || thirdChartIds.length === 0) {
        console.warn('No thirdChartIds provided.');
        return {};
      }
  
      if (!equipmentsByFloor || Object.keys(equipmentsByFloor).length === 0) {
        console.warn('equipmentsByFloor is empty or undefined.');
        return {};
      }
  
      console.log(`Fetching control endpoints for equipment IDs: ${thirdChartIds.length} IDs`);
  
      const batchSize = 50;
      const batchedPromises = [];
  
      // Diviser les IDs en lots pour éviter de surcharger l'API
      for (let i = 0; i < thirdChartIds.length; i += batchSize) {
        const batch = thirdChartIds.slice(i, i + batchSize);
        console.log(`Processing batch ${i / batchSize + 1}:`, batch);
  
        const spinalApi = SpinalAPI.getInstance();
        const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
        batchedPromises.push(spinalApi.post(url, batch));
      }
  
      // Attendre que toutes les requêtes soient terminées
      const results = await Promise.all(batchedPromises);
  
      // Combiner les résultats des lots
      const combinedResults = results.flatMap(result => result.data);
      console.log('Combined endpoints response:', combinedResults);
  
      const dynamicIdsByFloor: DynamicIdsByFloor = {};
  
      // Fonction pour traiter les endpoints par étage
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
  
      // Extraire les IDs dynamiques par étage
      extractDynamicIds(combinedResults, entryPoint, (endpoint, equipment, dynamicIds, ...extraParams) => {
        processEquipmentEndpointByFloor(endpoint, equipment, dynamicIdsByFloor, equipmentsByFloor);
      });
  
      console.log('Dynamic IDs by floor:', dynamicIdsByFloor);
      return dynamicIdsByFloor;
    } catch (error) {
      console.error('Error in getThirdChartOccupationDynamicIdsByFloor:', error);
      return {};
    }
  }
  
  export let cachedThirdChartPositions: any[] = [];
  export let cachedEquipmentsByFloor: Record<string, { floorName: string; equipments: string[] }> = {};
  export let cachedDynamicIdsByFloorForThirdChart: DynamicIdsByFloor = {};
  export async function initializeThirdChartData(thirdChartIds: string[]): Promise<void> {
    try {
      console.log("Initialisation des données pour le troisième graphique...");
  
      // Récupérer les positions des équipements
          if (cachedThirdChartPositions.length === 0) {
        cachedThirdChartPositions = await getThirdChartPositions(thirdChartIds);
        if (!cachedThirdChartPositions.length) {
          throw new Error("Aucune position d'équipement trouvée.");
        }
      }
  
      // Regrouper les équipements par étage
      if (Object.keys(cachedEquipmentsByFloor).length === 0) {
        cachedEquipmentsByFloor = groupThirdChartsByFloor(cachedThirdChartPositions);
        console.log("Équipements regroupés par étage :", cachedEquipmentsByFloor);
      }
  
      // Récupérer les IDs dynamiques des équipements par étage
      if (Object.keys(cachedDynamicIdsByFloorForThirdChart).length === 0) {
        // Vérifiez si les equipmentEntryPoints sont déjà mis en cache
        if (!cachedEquipmentEntryPoints || cachedEquipmentEntryPoints.length === 0) {
          console.warn("Aucun equipmentEntryPoint valide trouvé. Initialisation des sources...");
          const { equipmentEntryPoints } = await processEntryPoints();
          cachedEquipmentEntryPoints = equipmentEntryPoints;
        }
      
        // Parcourir les entryPoints pour traiter chaque cas
        for (const entryPoint of cachedEquipmentEntryPoints) {
          console.log(`Traitement de l'entryPoint : ${entryPoint.name}`);
      
          const dynamicIdsByFloor = await getThirdChartOccupationDynamicIdsByFloor(
            thirdChartIds,
            cachedEquipmentsByFloor,
            entryPoint // EntryPoint dynamique
          );
      
          // Fusionner les résultats dans le cache global
          Object.keys(dynamicIdsByFloor).forEach((floorId) => {
            if (!cachedDynamicIdsByFloorForThirdChart[floorId]) {
              cachedDynamicIdsByFloorForThirdChart[floorId] = [];
            }
            cachedDynamicIdsByFloorForThirdChart[floorId].push(...dynamicIdsByFloor[floorId]);
          });
        }
      
        console.log("IDs dynamiques des équipements par étage mis en cache :", cachedDynamicIdsByFloorForThirdChart);
      }
  
      console.log("Données pour le troisième graphique initialisées avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données pour le troisième graphique :", error);
    }
  }
  // Fonction pour récupérer les données de séries temporelles pour les équipements par étage
  export async function getThirdChartOccupancyDataByFloor(
    space: { type: string; dynamicId?: string },
    tempo: string,
    currentTimestamp: number,
    thirdChartIds: string[],
    startTime: string | null = null,
    endTime: string | null = null
  ): Promise<[string[], any[], { floor: string; average: number }[]]> {
    try {
      console.log('getThirdChartOccupancyDataByFloor called with parameters:', {
        space,
        tempo,
        currentTimestamp,
        thirdChartIds,
        startTime,
        endTime,
      });
  
      const buildingId = localStorage.getItem("idBuilding");
      if (!buildingId) {
        console.error('Building ID not found in localStorage');
        return [[], [], []];
      }
  
      const periodArray = getPeriodArray(currentTimestamp, tempo);
      const label = periodArray[0];
      const tooltipDate = periodArray[5];
      const data: any[] = [];
      const averages: { floor: string; average: number }[] = [];
  
      // Vérifiez si les données nécessaires sont initialisées
      if (
        cachedThirdChartPositions.length === 0 ||
        Object.keys(cachedEquipmentsByFloor).length === 0 ||
        Object.keys(cachedDynamicIdsByFloorForThirdChart).length === 0
      ) {
        throw new Error("Les données nécessaires pour le troisième graphique ne sont pas initialisées. Appelez initializeThirdChartData d'abord.");
      }
  
      console.log('Temporalité sélectionnée :', tempo);
      const aggregatedFloorData: AggregatedFloorData = {};
  
      for (const floor of Object.keys(cachedEquipmentsByFloor)) {
        const dynamicIds = cachedDynamicIdsByFloorForThirdChart[floor];
  
        if (dynamicIds && dynamicIds.length > 0) {
          const batchSize = 50;
          const batchedPromises = [];
  
          for (let i = 0; i < dynamicIds.length; i += batchSize) {
            const batch = dynamicIds.slice(i, i + batchSize);
            const spinalApi = SpinalAPI.getInstance();
            const url = spinalApi.createUrlWithPlatformId(
              buildingId,
              `api/v1/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`
            );
            batchedPromises.push(spinalApi.post(url, batch));
          }
  
          // Utiliser Promise.allSettled pour gérer les erreurs
          const results = await Promise.allSettled(batchedPromises);
          const successfulResults = results
            .filter(result => result.status === 'fulfilled')
            .map(result => (result as PromiseFulfilledResult<any>).value);
  
          let timeSeriesData = successfulResults.flatMap(result => result?.data || []);
  
          // Utiliser la fonction de filtre
          timeSeriesData.forEach((roomData) => {
            roomData.timeseries = filterTimeSeries(roomData.timeseries || [], startTime, endTime);
          });
  
          // Déterminer le type de données (binaire ou continue) à partir des entryPoints
          const entryPoint = cachedEquipmentEntryPoints?.find((entry) =>
            entry.source.some((source) => source.byFloorDisplay && source.type)
          );
          const sourceType = entryPoint?.source.find((source) => source.byFloorDisplay)?.type || "continue";
  
          // Calculer les moyennes pondérées ou binaires pour chaque étage
          const floorSeries = timeSeriesData.flatMap(roomData => roomData.timeseries);
          const weightedAverages =
            sourceType === "binaire"
              ? calculateBinaryOccupancyRate(floorSeries, label, tempo)
              : calculateTimeWeightedAverage(floorSeries, label, tempo);
  
          // Ajouter les données agrégées pour chaque période
          aggregatedFloorData[floor] = {};
          label.forEach((periodLabel, index) => {
            aggregatedFloorData[floor][periodLabel] = weightedAverages[index] || 0;
          });
        }
      }
  
      // Préparer les données pour chaque période
      const floorProcessedTimeSeries = label.map(periodLabel => {
        const floorData: Record<string, number> = {};
        Object.keys(cachedEquipmentsByFloor).forEach(floor => {
          floorData[floor] = aggregatedFloorData[floor]?.[periodLabel] || 0;
        });
        return floorData;
      });
  
      // Calculer les moyennes globales par étage
      averages.push(
        ...Object.keys(cachedEquipmentsByFloor).map(floor => {
          const values = Object.values(aggregatedFloorData[floor] || {});
          const sum = values.reduce((acc, val) => acc + val, 0);
          const average = values.length > 0 ? parseFloat((sum / values.length).toFixed(3)) : 0;
          return {
            floor,
            average
          };
        })
      );
  
      console.log('Final aggregated data: ', aggregatedFloorData);
      console.log('Averages by floor:', averages, 'Temporalité:', tempo);
  
      return [label, floorProcessedTimeSeries, averages];
    } catch (e) {
      console.error('Error in getThirdChartOccupancyDataByFloor:', e);
      return [[], [], []]; // Retourner des valeurs vides en cas d'erreur
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
 