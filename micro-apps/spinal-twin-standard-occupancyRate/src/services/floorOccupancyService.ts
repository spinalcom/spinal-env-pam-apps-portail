import { FloorOccupancyDynamicIdsResponse, TimeSeriesPoint, FloorOccupancyMapping, ChartData, RoomData, TimeSeriesData, ControlProfile, ControlEndpoint } from '../components/interfaces/types';
import { getFloors , getThirdChartData } from './index';
import {processBuildingEndpoint, processRoomEndpoint,processEquipmentEndpoint,calculateTimeWeightedAverage,processInBatches, getPeriodArray,cachedRoomEntryPoints,cachedEquipmentEntryPoints,cachedBuildingEntryPoints,extractDynamicIds } from './calculationUtils';
import lodash from 'lodash';
import moment from 'moment';
import { SpinalAPI } from './spinalAPI/spinalAPI';
import { config } from '../config';
import { EntryPoint } from '../components/interfaces/configTypes';

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
    console.log('Étages récupérés depuis getFloors :', floors);

    // Préparer les noms des étages et leurs IDs dynamiques
    const floorNames: Record<string, string> = {};
    const floorDynamicIds = floors.map(floor => {
      floorNames[floor.dynamicId] = floor.name;
      return floor.dynamicId;
    });

    console.log('Correspondance ID → Nom des étages :', floorNames);

    // Diviser les IDs dynamiques en lots
    const batchSize = 50;
    const chunkedFloorDynamicIds = lodash.chunk(floorDynamicIds, batchSize);

    // Envoyer les requêtes en parallèle pour chaque lot
    const promises = chunkedFloorDynamicIds.map(async (batch) => {
      console.log('Processing batch:', batch);
      const spinalApi = SpinalAPI.getInstance();
      const batchUrl = spinalApi.createUrlWithPlatformId(localStorage.getItem("idBuilding")!, 'api/v1/node/control_endpoint_list_multiple');
      const response = await (spinalApi.post as <T>(url: string, body: any) => Promise<{ data: T }>)(batchUrl, batch);
      console.log('Batch response:', response.data);
      return response.data;
    });

    // Attendre que toutes les requêtes soient terminées
    const results = await Promise.all(promises);

    // Combiner les résultats des lots
    const combinedResults = results.flat();
    console.log('Combined endpoints response:', combinedResults);

    // Extraire les IDs dynamiques et créer le mapping
       if (!cachedBuildingEntryPoints || cachedBuildingEntryPoints.length === 0) {
      console.warn("Aucun buildingEntryPoint valide trouvé. Assurez-vous d'avoir appelé initializeSources.");
      return { dynamicIds: [], floorNames: {}, floorOccupancyMapping: {} };
    }
    
    const floorOccupancyMapping: FloorOccupancyMapping = {};
    const allDynamicIds: string[] = [];
    
    // Parcourir tous les entryPoints dans cachedBuildingEntryPoints
    for (const buildingEntryPoint of cachedBuildingEntryPoints) {
      console.log(`Traitement de l'entryPoint : ${buildingEntryPoint.name}`);
      
      const dynamicIds = extractDynamicIds(combinedResults, buildingEntryPoint, processBuildingEndpoint, floorOccupancyMapping);
      console.log(`Dynamic IDs pour l'entryPoint ${buildingEntryPoint.name} :`, dynamicIds);
    
      // Ajouter les IDs dynamiques extraits à la liste globale
      allDynamicIds.push(...dynamicIds);
    }
    
    if (allDynamicIds.length === 0) {
      console.warn('⚠️ Aucun Dynamic ID trouvé pour les taux d\'occupation.');
    }
    
    console.log('Tous les Dynamic IDs des taux d\'occupation :', allDynamicIds);
    console.log('Mapping Dynamic ID → Étages :', floorOccupancyMapping);
    
    return { dynamicIds: allDynamicIds, floorNames, floorOccupancyMapping };
  } catch (error) {
    console.error('Error in getFloorOccupancyDynamicIds:', error);
    return { dynamicIds: [], floorNames: {}, floorOccupancyMapping: {} };
  }
}

// Fonction pour récupérer les IDs dynamiques d'occupation pour les salles données
let cachedSecondChartDynamicIds: Record<string, string[]> = {};

export async function fetchSecondChartOccupationDynamicIds(
  roomIds: string[]
): Promise<string[]> {
  const cacheKey = roomIds.sort().join(','); // Utiliser une clé unique basée sur les roomIds
  if (cachedSecondChartDynamicIds[cacheKey]) {
    console.log(`Dynamic IDs for rooms retrieved from cache.`);
    return cachedSecondChartDynamicIds[cacheKey];
  }

  try {
    console.log('fetchSecondChartOccupationDynamicIds called with roomIds:', roomIds);

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    const spinalApi = SpinalAPI.getInstance();
    const batchSize = 50;
    const chunkedRoomIds = lodash.chunk(roomIds, batchSize);

    const allDynamicIds: string[] = [];
    for (const entryPoint of cachedRoomEntryPoints || []) {
      const promises = chunkedRoomIds.map(async (batch) => {
        const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
        const response = await spinalApi.post(url, batch);
        return response.data;
      });

      const combinedResults = (await Promise.all(promises)).flat();
      const dynamicIds = extractDynamicIds(combinedResults, entryPoint, processRoomEndpoint);
      allDynamicIds.push(...dynamicIds);
    }

    cachedSecondChartDynamicIds[cacheKey] = allDynamicIds; // Mettre en cache
    return allDynamicIds;
  } catch (error) {
    console.error('Error in fetchSecondChartOccupationDynamicIds:', error);
    return [];
  }
}


// On Récupère les IDs dynamiques d'occupation pour les équipements donnés.
let cachedThirdChartDynamicIds: Record<string, string[]> = {};

export async function fetchThirdChartOccupationDynamicIds(
  thirdChartIds: string[],
  entryPoint: EntryPoint
): Promise<string[]> {
  const cacheKey = thirdChartIds.sort().join(','); // Utiliser une clé unique basée sur les thirdChartIds
  if (cachedThirdChartDynamicIds[cacheKey]) {
    console.log(`Dynamic IDs for equipment retrieved from cache.`);
    return cachedThirdChartDynamicIds[cacheKey];
  }

  try {
    console.log('fetchThirdChartOccupationDynamicIds called with thirdChartIds:', thirdChartIds);

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    const spinalApi = SpinalAPI.getInstance();
    const combinedResults = await processInBatches(thirdChartIds, 50, async (batch) => {
      const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
      const response = await spinalApi.post(url, batch);
      return response.data;
    });

    const dynamicIds = extractDynamicIds(combinedResults, entryPoint, processEquipmentEndpoint);
    cachedThirdChartDynamicIds[cacheKey] = dynamicIds; // Mettre en cache
    return dynamicIds;
  } catch (error) {
    console.error('Error in fetchThirdChartOccupationDynamicIds:', error);
    return [];
  }
}


// Fonction pour récupérer les données de graphe pour un bâtiment
let cachedGraphData: string | null = null;

export async function getGraphData(): Promise<string | null> {
  if (cachedGraphData) {
    console.log('Graph data retrieved from cache.');
    return cachedGraphData;
  }

  try {
    console.log('getGraphData called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
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
    if (!buildingId) throw new Error("Building ID not found in localStorage");

    const spinalApi = SpinalAPI.getInstance();
    const periodArray = getPeriodArray(currentTimestamp, tempo);
    label.push(...periodArray[0]);
    tooltipDate.push(...periodArray[5]);

    const currentHour = moment(currentTimestamp).hour();

    // 1. Occupation bâtiment
    try {
      console.log("=== TAUX OCCUPATION BÂTIMENT ===");
      const occupancyDynamicId = await getGraphData();
      if (!occupancyDynamicId) throw new Error("Occupancy dynamic ID not found");

      const url = spinalApi.createUrlWithPlatformId(
        buildingId,
        `api/v1/endpoint/${occupancyDynamicId}/timeSeries/read/${periodArray[1]}/${periodArray[2]}`
      );
      const response = await spinalApi.get<{ data: TimeSeriesPoint[] }>(url);
      let processedData = calculateTimeWeightedAverage(response.data, label, tempo);

      if (tempo === "Valeur Courante") {
        processedData = processedData.slice(0, currentHour + 1);
        processedData = [
          ...processedData,
          ...Array(24 - processedData.length).fill(null),
        ];
      }

      data.push({
        label: config.charts.globalChart.firstData.label,
        data: processedData,
        tooltipDate,
        backgroundColor: config.charts.globalChart.firstData.backgroundColor,
        borderColor: config.charts.globalChart.firstData.borderColor,
        borderWidth: 1,
        fill: false,
      });
    } catch (error) {
      console.error("Error in building occupancy calculation:", error);
    }

    // 2. Occupation salles de réunion
    try {
      console.log("=== TAUX OCCUPATION SALLES DE RÉUNION ===");
      const dynamicIds = await fetchSecondChartOccupationDynamicIds(roomIds);
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

        let seriesData = results.flatMap(r =>
          r.data.flatMap(room => room.timeseries || [])
        );
        let processedData = calculateTimeWeightedAverage(seriesData, label, tempo);

        if (tempo === "Valeur Courante") {
          processedData = processedData.slice(0, currentHour + 1);
          processedData = [
            ...processedData,
            ...Array(24 - processedData.length).fill(null),
          ];
        }

        data.push({
          label: config.charts.globalChart.secondData.label,
          data: processedData,
          tooltipDate,
          backgroundColor: config.charts.globalChart.secondData.backgroundColor,
          borderColor: config.charts.globalChart.secondData.borderColor,
          borderWidth: 1,
          fill: false,
        });
      }
    } catch (error) {
      console.error("Error in meeting room occupancy calculation:", error);
    }

    // 3. Occupation positions de travail
    try {
      console.log("=== TAUX OCCUPATION POSITIONS DE TRAVAIL ===");
      const thirdChartIds = await getThirdChartData();
      if (thirdChartIds.length > 0) {
        if (!cachedEquipmentEntryPoints || cachedEquipmentEntryPoints.length === 0) {
          console.error("cachedEquipmentEntryPoints is null or empty.");
          return [label, data, []];
        }
        const dynamicIds = await fetchThirdChartOccupationDynamicIds(thirdChartIds, cachedEquipmentEntryPoints[0]);

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

          let seriesData = results.flatMap(r =>
            r.data.flatMap(eq => eq.timeseries || [])
          );
          let processedData = calculateTimeWeightedAverage(seriesData, label, tempo);

          if (tempo === "Valeur Courante") {
            processedData = processedData.slice(0, currentHour + 1);
            processedData = [
              ...processedData,
              ...Array(24 - processedData.length).fill(null),
            ];
          }

          data.push({
            label: config.charts.globalChart.thirdData.label,
            data: processedData,
            tooltipDate,
            backgroundColor: config.charts.globalChart.thirdData.backgroundColor,
            borderColor: config.charts.globalChart.thirdData.borderColor,
            borderWidth: 1,
            fill: false,
          });
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
