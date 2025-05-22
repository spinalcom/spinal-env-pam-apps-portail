import { FloorOccupancyDynamicIdsResponse, TimeSeriesPoint, FloorOccupancyMapping, ChartData, RoomData, TimeSeriesData, ControlProfile, ControlEndpoint } from '../components/interfaces/types';
import { getFloors , getThirdChartData } from './index';
import {processBuildingEndpoint, processRoomEndpoint,processEquipmentEndpoint,calculateTimeWeightedAverage,processInBatches, getPeriodArray,cachedRoomEntryPoints,cachedEquipmentEntryPoints,cachedBuildingEntryPoints,extractDynamicIds, filterTimeSeries } from './calculationUtils';
import lodash from 'lodash';
import moment from 'moment';
import { SpinalAPI } from './spinalAPI/spinalAPI';
import { config } from '../config';
import { EntryPoint } from '../components/interfaces/configTypes';
import { apiEndpoints } from '../configConstants'; 
import { calculateBinaryOccupancyRate } from './calculationUtils'; // Assurez-vous que cette fonction est importée



// Cache pour les données
let cachedFloorNames: Record<string, string> = {};
let cachedFloorOccupancyMapping: Record<string, { dynamicId: string; occupancy: string }> = {};

// Fonction pour récupérer les IDs dynamiques d'occupation pour les étages
export async function getFloorOccupancyDynamicIds(): Promise<FloorOccupancyDynamicIdsResponse> {
  try {
    // Utiliser la fonction getFloors pour récupérer les étages
    const floors = await getFloors();
    if (!floors || floors.length === 0) {
      console.error('Aucun étage trouvé pour ce bâtiment.');
      return { dynamicIds: [], floorNames: {}, floorOccupancyMapping: {} };
    }

    // Préparer les noms des étages et leurs IDs dynamiques
    const floorNames: Record<string, string> = {};
    const floorDynamicIds = floors.map(floor => {
      floorNames[floor.dynamicId] = floor.name;
      return floor.dynamicId;
    });


    // Diviser les IDs dynamiques en lots
    const batchSize = 50;
    const chunkedFloorDynamicIds = lodash.chunk(floorDynamicIds, batchSize);

    // Envoyer les requêtes en parallèle pour chaque lot
    const promises = chunkedFloorDynamicIds.map(async (batch) => {
      const spinalApi = SpinalAPI.getInstance();
      const batchUrl = spinalApi.createUrlWithPlatformId(localStorage.getItem("idBuilding")!, 'api/v1/node/control_endpoint_list_multiple');
      const response = await (spinalApi.post as <T>(url: string, body: any) => Promise<{ data: T }>)(batchUrl, batch);
      return response.data;
    });

    // Attendre que toutes les requêtes soient terminées
    const results = await Promise.all(promises);

    // Combiner les résultats des lots
    const combinedResults = results.flat();
     

    // Extraire les IDs dynamiques et créer le mapping
       if (!cachedBuildingEntryPoints || cachedBuildingEntryPoints.length === 0) {
      console.warn("Aucun buildingEntryPoint valide trouvé. Assurez-vous d'avoir appelé initializeSources.");
      return { dynamicIds: [], floorNames: {}, floorOccupancyMapping: {} };
    }
    
    const floorOccupancyMapping: FloorOccupancyMapping = {};
    const allDynamicIds: string[] = [];
    
    // Parcourir tous les entryPoints dans cachedBuildingEntryPoints
    for (const buildingEntryPoint of cachedBuildingEntryPoints) {
      
      const dynamicIds = extractDynamicIds(combinedResults, buildingEntryPoint, processBuildingEndpoint, floorOccupancyMapping);
    
      // Ajouter les IDs dynamiques extraits à la liste globale
      allDynamicIds.push(...dynamicIds);
    }
    
    if (allDynamicIds.length === 0) {
      console.warn('⚠️ Aucun Dynamic ID trouvé pour les taux d\'occupation.');
    }
    

    
    return { dynamicIds: allDynamicIds, floorNames, floorOccupancyMapping };
  } catch (error) {
    console.error('Error in getFloorOccupancyDynamicIds:', error);
    return { dynamicIds: [], floorNames: {}, floorOccupancyMapping: {} };
  }
}

// Fonction pour récupérer les IDs dynamiques d'occupation pour les salles données
let cachedSecondChartDynamicIds: Record<string, string[]> = {};

export async function fetchSecondChartOccupationDynamicIds(
  roomIds: string[],
  entryPoint: EntryPoint
): Promise<string[]> {

  const cacheKey = `${entryPoint.name}-${roomIds.sort().join(',')}`; // Utiliser une clé unique basée sur l'entryPoint et les roomIds
  if (cachedSecondChartDynamicIds[cacheKey]) {
    return cachedSecondChartDynamicIds[cacheKey];
  }

  try {

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('No building ID found in localStorage');
      return []; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const batchSize = 50;
    const chunkedRoomIds = lodash.chunk(roomIds, batchSize);

    const promises = chunkedRoomIds.map(async (batch) => {
      const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
      const response = await spinalApi.post(url, batch);
      return response.data;
    });

    const combinedResults = (await Promise.all(promises)).flat();
    const dynamicIds = extractDynamicIds(combinedResults, entryPoint, processRoomEndpoint);

    cachedSecondChartDynamicIds[cacheKey] = dynamicIds; // Mettre en cache
    return dynamicIds;
  } catch (error) {
    console.error(`Error in fetchSecondChartOccupationDynamicIds for entryPoint: ${entryPoint.name}`, error);
    return [];
  }
}


// On Récupère les IDs dynamiques d'occupation pour les équipements donnés.
let cachedThirdChartDynamicIds: Record<string, string[]> = {};

export async function fetchThirdChartOccupationDynamicIds(
  thirdChartIds: string[],
  entryPoint: EntryPoint
): Promise<string[]> {

  const cacheKey = `${entryPoint.name}-${thirdChartIds.sort().join(',')}`; // Utiliser une clé unique basée sur l'entryPoint et les thirdChartIds
  if (cachedThirdChartDynamicIds[cacheKey]) {
    return cachedThirdChartDynamicIds[cacheKey];
  }

  try {

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('No building ID found in localStorage');
      return []; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const batchSize = 50;
    const chunkedThirdChartIds = lodash.chunk(thirdChartIds, batchSize);

    const promises = chunkedThirdChartIds.map(async (batch) => {
      const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
      const response = await spinalApi.post(url, batch);
      return response.data;
    });

    const combinedResults = (await Promise.all(promises)).flat();

    // Traiter les résultats pour cet entryPoint
    const dynamicIds = extractDynamicIds(combinedResults, entryPoint, processEquipmentEndpoint);

    // Mettre en cache les résultats pour cet entryPoint
    cachedThirdChartDynamicIds[cacheKey] = dynamicIds;

    return dynamicIds;
  } catch (error) {
    console.error(`Error in fetchThirdChartOccupationDynamicIds for entryPoint: ${entryPoint.name}`, error);
    return [];
  }
}


// Fonction pour récupérer les données de graphe pour un bâtiment
let cachedGraphData: string | null = null;

export async function getGraphData(): Promise<string | null> {
  if (cachedGraphData) {
    return cachedGraphData;
  }

  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('idBuilding not found in localStorage');
      return null; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const buildingUrl = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/building/read');
    const buildingResponse = await spinalApi.get<{ dynamicId: string }>(buildingUrl);

    const controlEndpointUrl = spinalApi.createUrlWithPlatformId(
      buildingId,
      `api/v1/node/${buildingResponse.data.dynamicId}/control_endpoint_list`
    );
    const controlEndpointResponse = await spinalApi.get<ControlProfile[]>(controlEndpointUrl);

    let occupancyEndpoint: ControlEndpoint | null = null;

    for (const buildingEntryPoint of cachedBuildingEntryPoints || []) {
      for (const source of buildingEntryPoint.source || []) {
        controlEndpointResponse.data.forEach((profile) => {
          const endpoint = profile.endpoints.find(
            (ep) =>
              ep.name.toLowerCase() === source.name.toLowerCase() &&
              profile.profileName.toLowerCase() === source.profileName.toLowerCase()
          );
          if (endpoint) {
            occupancyEndpoint = endpoint;
          }
        });
        if (occupancyEndpoint) break;
      }
      if (occupancyEndpoint) break;
    }

    if (!occupancyEndpoint) {
      console.error('Aucun point de contrôle correspondant trouvé.');
      return null;
    }

    cachedGraphData = occupancyEndpoint.dynamicId; // Mettre en cache
    return cachedGraphData;
  } catch (error) {
    console.error('Error in getGraphData:', error);
    return null;
  }
}


const processData = (timeSeriesData: TimeSeriesPoint[], sourceType: string): number[] => {
  if (sourceType === 'binaire') {
    return calculateBinaryOccupancyRate(timeSeriesData, label, tempo);
  } else if (sourceType === 'continue') {
    return calculateTimeWeightedAverage(timeSeriesData, label, tempo);
  } else {
    console.warn(`Type de données inconnu : ${sourceType}`);
    return [];
  }
};

export async function getData(
  space: { type: string; dynamicId?: string },
  tempo: string,
  currentTimestamp: number,
  roomIds: string[],
  startTime: string | null = null,
  endTime: string | null = null
): Promise<[string[], ChartData[], any[]]> {
  const data: ChartData[] = [];
  const label: string[] = [];
  const tooltipDate: string[] = [];

  try {
    const buildingId = localStorage.getItem("idBuilding");
/*     if (!buildingId) throw new Error("Building ID not found in localStorage");
 */
    const spinalApi = SpinalAPI.getInstance();
    const periodArray = getPeriodArray(currentTimestamp, tempo);
    label.push(...periodArray[0]);
    tooltipDate.push(...periodArray[5]);

    const currentHour = moment(currentTimestamp).hour();

    // Fonction pour traiter les données en fonction du type
    const processData = (timeSeriesData: TimeSeriesPoint[], sourceType: string): number[] => {
      if (sourceType === 'binaire') {
        return calculateBinaryOccupancyRate(timeSeriesData, label, tempo);
      } else if (sourceType === 'continue') {
        return calculateTimeWeightedAverage(timeSeriesData, label, tempo);
      } else {
        console.warn(`Type de données inconnu : ${sourceType}`);
        return [];
      }
    };

    // 1. Occupation bâtiment
    try {
      console.log("=== TAUX OCCUPATION BÂTIMENT ===");

      if (!cachedBuildingEntryPoints || cachedBuildingEntryPoints.length === 0) {
        throw new Error("cachedBuildingEntryPoints is not initialized. Ensure initializeSources is called.");
      }

      for (const buildingEntryPoint of cachedBuildingEntryPoints) {
        for (const source of buildingEntryPoint.source || []) {
          if (!source.globalDisplay) {
            continue;
          }

          const occupancyDynamicId = await getGraphData();
          if (!occupancyDynamicId) {
            console.warn(`Dynamic ID introuvable pour la source : ${source.name}`);
            continue;
          }

          const url = spinalApi.createUrlWithPlatformId(
            buildingId,
            `api/v1/endpoint/${occupancyDynamicId}/timeSeries/read/${periodArray[1]}/${periodArray[2]}`
          );
          const response = await spinalApi.get<{ data: TimeSeriesPoint[] }>(url);

          // Appliquer le filtre temporel
          const filteredData = filterTimeSeries(response.data, startTime, endTime);

          const processedData = processData(filteredData, source.type);

          if (tempo === "Valeur Courante") {
            processedData.splice(currentHour + 1);
            processedData.push(...Array(24 - processedData.length).fill(null));
          }

          data.push({
            label: source.label,
            data: processedData,
            tooltipDate,
            backgroundColor: source.backgroundColor,
            borderColor: source.borderColor || source.backgroundColor,
            borderWidth: 1,
            fill: false,
          });
        }
      }
    } catch (error) {
      console.error("Error in building occupancy calculation:", error);
    }

    // 2. Occupation salles de réunion
    try {
      console.log("=== TAUX OCCUPATION SALLES DE RÉUNION ===");

      if (!cachedRoomEntryPoints || cachedRoomEntryPoints.length === 0) {
        throw new Error("cachedRoomEntryPoints is not initialized. Ensure initializeSources is called.");
      }

      for (const roomEntryPoint of cachedRoomEntryPoints) {
        for (const source of roomEntryPoint.source || []) {
          if (!source.globalDisplay) {
            continue;
          }

          const dynamicIds = await fetchSecondChartOccupationDynamicIds(roomIds, roomEntryPoint);
          if (dynamicIds.length > 0) {
            const results = await Promise.all(
              Array(Math.ceil(dynamicIds.length / 50))
                .fill(null)
                .map((_, i) => {
                  const batch = dynamicIds.slice(i * 50, (i + 1) * 50);
                  const url = spinalApi.createUrlWithPlatformId(
                    buildingId,
                    `api/v1/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`
                  );
                  return spinalApi.post<{ data: RoomData[] }>(url, batch);
                })
            );

            const seriesData = results.flatMap(r =>
              r.data.flatMap(room => room.timeseries || [])
            );

            // Appliquer le filtre temporel
            const filteredData = filterTimeSeries(seriesData, startTime, endTime);

            const processedData = processData(filteredData, source.type);

            if (tempo === "Valeur Courante") {
              processedData.splice(currentHour + 1);
              processedData.push(...Array(24 - processedData.length).fill(null));
            }

            data.push({
              label: source.label,
              data: processedData,
              tooltipDate,
              backgroundColor: source.backgroundColor,
              borderColor: source.borderColor || source.backgroundColor,
              borderWidth: 1,
              fill: false,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in meeting room occupancy calculation:", error);
    }

        // 3. Occupation positions de travail
    try {
      console.log("=== TAUX OCCUPATION POSITIONS DE TRAVAIL ===");
    
      if (!cachedEquipmentEntryPoints || cachedEquipmentEntryPoints.length === 0) {
        throw new Error("cachedEquipmentEntryPoints is not initialized. Ensure initializeSources is called.");
      }
    
      // Récupérer les données des équipements groupés par entryPoint
      const thirdChartData = await getThirdChartData();
      if (!thirdChartData || Object.keys(thirdChartData).length === 0) {
        console.warn("Aucun équipement trouvé pour les entryPoints.");
        return;
      }
    
      for (const equipmentEntryPoint of cachedEquipmentEntryPoints) {
        const thirdChartIds = thirdChartData[equipmentEntryPoint.name];
        if (!thirdChartIds || thirdChartIds.length === 0) {
          console.warn(`Aucun équipement trouvé pour l'entryPoint : ${equipmentEntryPoint.name}`);
          continue;
        }
    
        for (const source of equipmentEntryPoint.source || []) {
          if (!source.globalDisplay) {
            continue;
          }
    
          // Récupérer les IDs dynamiques pour cet entryPoint
          const dynamicIds = await fetchThirdChartOccupationDynamicIds(thirdChartIds, equipmentEntryPoint);
    
          if (dynamicIds.length > 0) {
            const results = await Promise.all(
              Array(Math.ceil(dynamicIds.length / 50))
                .fill(null)
                .map((_, i) => {
                  const batch = dynamicIds.slice(i * 50, (i + 1) * 50);
                  const url = spinalApi.createUrlWithPlatformId(
                    buildingId,
                    `api/v1/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`
                  );
                  return spinalApi.post<{ data: TimeSeriesData[] }>(url, batch);
                })
            );
    
            const seriesData = results.flatMap(r =>
              r.data.flatMap(eq => eq.timeseries || [])
            );
    
            // Appliquer le filtre temporel
            const filteredData = filterTimeSeries(seriesData, startTime, endTime);
    
            const processedData = processData(filteredData, source.type);
    
            if (tempo === "Valeur Courante") {
              processedData.splice(currentHour + 1);
              processedData.push(...Array(24 - processedData.length).fill(null));
            }
    
            data.push({
              label: source.label,
              data: processedData,
              tooltipDate,
              backgroundColor: source.backgroundColor,
              borderColor: source.borderColor || source.backgroundColor,
              borderWidth: 1,
              fill: false,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in workstation occupancy calculation:", error);
    }
    return [label, data, []];
  } catch (error) {
    console.error("Error in getData:", error);
    return [[], [], []];
  }
}
