import {config} from '../config';
import { HTTP } from "./http-constants";

import moment from 'moment';
import lodash from 'lodash';
import 'moment/locale/fr';
import { SpinalAPI } from './spinalAPI/spinalAPI';
import {
  ChartData,
  tempoFilter,
  Building,
  Floor,
  Space,
  Context,
  Category,
  Group,
  Room,
  CombinedResult,
  FloorOccupancyDynamicIdsResponse,
  FloorOccupancyRate,
  TimeSeriesPoint,
  RoomsByFloor,
  FloorData,
  RoomData,
  Equipment,
  DynamicIdsByFloor,
  AggregatedFloorData,
  ControlEndpoint,
  ControlProfile,
  TimeSeriesData,
  Endpoint,
  FloorOccupancyMapping,
  RoomPosition
} from '../components/interfaces/types';
import { EntryPoint } from '../components/interfaces/configTypes';


let cachedThirdChartContextId: string | null = null;
let cachedThirdChartCategoryId: string | null = null;
let cachedThirdChartGroupId: string | null = null;
let cachedThirdChartIds: string[] = [];

let cachedContextId: string | null = null;
let cachedCategoryId: string | null = null;
let cachedGroupId: string | null = null;
let cachedRoomIds: string[] = [];



// On Récupère les informations sur un bâtiment spécifique.
export async function getBuilding(): Promise<Building | null> {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error("Building ID not found in localStorage");
      return null;
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/building/read');
    console.log("Generated URL for getBuilding:", url);

    const result = await spinalApi.get(url) as { data: Building };
    return result.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des informations du bâtiment :", error);
    return null;
  }
}

// Récupère la liste des étages d'un bâtiment.
export async function getFloors(): Promise<Floor[]> {
  try {
    const buildingId = localStorage.getItem('idBuilding');
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return [];
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/floor/list');
    const result = await spinalApi.get(url) as { data: Floor[] };
    return result.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des étages :', error);
    return [];
  }
}

// On Récupère la surface d'un espace (bâtiment ou étage).
export async function getArea(space: Space): Promise<number> {
  try {
    console.log('Get Area');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error("Building ID not found in localStorage");
      return 0;
    }

    const spinalApi = SpinalAPI.getInstance();

    if (space.type === 'building') {
      console.log('of building');
      const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/building/read');
      console.log("Generated URL for getArea (building):", url);
      const result = await spinalApi.get(url) as { data: { area: number } };
      console.log("Response for building area:", result.data);
      return +result.data.area;
    } else if (space.type === 'floor' && space.dynamicId) {
      console.log('of floor');
      const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/floor/${space.dynamicId}/attributes`);
      console.log("Generated URL for getArea (floor):", url);
      const result = await spinalApi.get(url) as { data: { attributs: { label: string; value: number }[] } };
      console.log("Response for floor area:", result.data);
      const area = result.data.attributs.find(attr => attr.label === 'area')?.value || 0;
      return +area;
    }

    console.error("Invalid space type or missing dynamicId for floor");
    return 0;
  } catch (error) {
    console.error("Erreur lors de la récupération de la surface :", error);
    return 0;
  }
}

export async function processEntryPoints(): Promise<{
  roomEntryPoints: EntryPoint[];
  equipmentEntryPoints: EntryPoint[];
  buildingEntryPoints: EntryPoint[];
}> {
  try {
    const roomEntryPoints: EntryPoint[] = [];
    const equipmentEntryPoints: EntryPoint[] = [];
    const buildingEntryPoints: EntryPoint[] = [];

    // Récupérer les données du bâtiment
    const buildingData = await getBuilding();
    if (!buildingData) {
      console.error("Impossible de récupérer les données du bâtiment.");
      return { roomEntryPoints, equipmentEntryPoints, buildingEntryPoints };
    }

    // Récupérer l'ID du bâtiment
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error("Building ID not found in localStorage");
      return { roomEntryPoints, equipmentEntryPoints, buildingEntryPoints };
    }

    const spinalApi = SpinalAPI.getInstance();

    // Récupérer les contextes via groupContext/list
    const contextUrl = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/groupContext/list');
    const contextResponse = await spinalApi.get<{ data: Context[] }>(contextUrl);
    const groupContexts = contextResponse.data;
    console.log("Group contexts retrieved:", groupContexts);

    // Récupérer les contextes d'équipements via equipementsGroup/list
    const equipmentContextUrl = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/equipementsGroup/list');
    const equipmentContextResponse = await spinalApi.get<{ data: Context[] }>(equipmentContextUrl);
    const equipmentContexts = equipmentContextResponse.data;
    console.log("Equipment contexts retrieved:", equipmentContexts);

    // Parcourir les entryPoints définis dans la configuration
    for (const entryPoint of config.entryPoints) {
      console.log(`Processing entryPoint: type=${entryPoint.type}, name=${entryPoint.name}`);

      let isMatched = false;

      // Vérification dans les contextes d'équipements
      const equipmentContextMatch = equipmentContexts.find(
        (context) => context.type === entryPoint.type && context.name === entryPoint.name
      );
      if (equipmentContextMatch) {
        console.log(`Match found in equipementsGroup/list for type=${entryPoint.type}, name=${entryPoint.name}`);
        equipmentEntryPoints.push(entryPoint);
        isMatched = true;
        continue; // Éviter d'ajouter cet entryPoint à roomEntryPoints
      }

      // Vérification dans les contextes de groupContext/list
      const groupContextMatch = groupContexts.find(
        (context) => context.type === entryPoint.type && context.name === entryPoint.name
      );
      if (groupContextMatch) {
        console.log(`Match found in groupContext/list for type=${entryPoint.type}, name=${entryPoint.name}`);
        roomEntryPoints.push(entryPoint);
        isMatched = true;
      }

      // Vérification pour les contextes de bâtiments
      if (entryPoint.type === 'geographicBuilding' && entryPoint.name === buildingData.name) {
        console.log(`Match found for building context: name=${entryPoint.name}`);
        buildingEntryPoints.push(entryPoint);
        isMatched = true;
      }

      if (!isMatched) {
        console.warn(`No match found for entryPoint: type=${entryPoint.type}, name=${entryPoint.name}`);
      }
    }

    // Afficher les entryPoints valides trouvés
    console.log("Room entryPoints found:", roomEntryPoints);
    console.log("Equipment entryPoints found:", equipmentEntryPoints);
    console.log("Building entryPoints found:", buildingEntryPoints);

    return { roomEntryPoints, equipmentEntryPoints, buildingEntryPoints };
  } catch (error) {
    console.error("Error in processEntryPoints:", error);
    return { roomEntryPoints: [], equipmentEntryPoints: [], buildingEntryPoints: [] };
  }
}

export let cachedRoomEntryPoints: EntryPoint[] | null = null;
export let cachedEquipmentEntryPoints: EntryPoint[] | null = null;
export let cachedBuildingEntryPoints: EntryPoint[] | null = null;
export async function initializeRoomSources(): Promise<void> {
  try {
    console.log('🔄 Initialisation des sources pour les salles...');
    const { roomEntryPoints } = await processEntryPoints();
    if (!roomEntryPoints || roomEntryPoints.length === 0) {
      console.warn('⚠️ Aucun entryPoint valide trouvé pour les salles.');
      return;
    }
    cachedRoomEntryPoints = roomEntryPoints;
    console.log('✅ Sources des salles initialisées avec succès :', cachedRoomEntryPoints);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des sources pour les salles :', error);
  }
}

export async function initializeEquipmentSources(): Promise<void> {
  try {
    console.log('🔄 Initialisation des sources pour les équipements...');
    const { equipmentEntryPoints } = await processEntryPoints();
    if (!equipmentEntryPoints || equipmentEntryPoints.length === 0) {
      console.warn('⚠️ Aucun entryPoint valide trouvé pour les équipements.');
      return;
    }
    cachedEquipmentEntryPoints = equipmentEntryPoints;
    console.log('✅ Sources des équipements initialisées avec succès :', cachedEquipmentEntryPoints);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des sources pour les équipements :', error);
  }
}

export async function initializeBuildingSources(): Promise<void> {
  try {
    console.log('🔄 Initialisation des sources pour le bâtiment...');
    const { buildingEntryPoints } = await processEntryPoints();
    if (!buildingEntryPoints || buildingEntryPoints.length === 0) {
      console.warn('⚠️ Aucun entryPoint valide trouvé pour le bâtiment.');
      return;
    }
    cachedBuildingEntryPoints = buildingEntryPoints;
    console.log('✅ Sources du bâtiment initialisées avec succès :', cachedBuildingEntryPoints);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des sources pour le bâtiment :', error);
  }
}
export async function initializeSources(): Promise<void> {
  try {
    console.log('🔄 Initialisation des sources globales...');
    await initializeBuildingSources();
    await initializeEquipmentSources();
    await initializeRoomSources();
    console.log('✅ Toutes les sources ont été initialisées.');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des sources globales :', error);
  }
}



// On Récupère l'ID du contexte.
export async function getContextId(contextName: string): Promise<string | null> {
  try {
    console.log('getContextId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/groupContext/list');
    console.log(`Fetching context ID for context: ${contextName} in building: ${buildingId}`);
    const response = await spinalApi.get(url) as unknown as { data: Context[] };
    console.log('Response data:', response.data);

    const context = response.data.find(item => item.name === contextName);
    return context ? context.dynamicId : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID du contexte :', error);
    return null;
  }
}

// On Récupère l'ID de la catégorie pour un contexte donné.
export async function getCategoryId(contextId: string, categoryName: string): Promise<string | null> {
  try {
    console.log('getCategoryId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/groupeContext/${contextId}/category_list`);
    console.log(`Fetching category ID for category: ${categoryName} in context: ${contextId}`);
    const response = await spinalApi.get(url) as { data: Category[] };
    console.log('Response data:', response.data);

    const category = (response.data as Category[]).find(item => item.name === categoryName);
    return category ? category.dynamicId : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID de la catégorie :', error);
    return null;
  }
}

// On Récupère l'ID du groupe pour un contexte et une catégorie donnés.
export async function getGroupId(contextId: string, categoryId: string, groupName: string): Promise<string | null> {
  try {
    console.log('getGroupId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/groupeContext/${contextId}/category/${categoryId}/group_list`);
    console.log(`Fetching group ID for group: ${groupName} in category: ${categoryId}`);
    const response = await spinalApi.get(url) as { data: Group[] };
    console.log('Response data:', response.data);

    const group = response.data.find(item => item.name === groupName);
    return group ? group.dynamicId : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID du groupe :', error);
    return null;
  }
}

// On Récupère les IDs des salles pour un contexte, une catégorie et un groupe donnés.
export async function getRoomIds(contextId: string, categoryId: string, groupId: string): Promise<string[]> {
  try {
    console.log('getRoomIds called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return [];
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/roomsGroup/${contextId}/category/${categoryId}/group/${groupId}/roomList`);
    console.log(`Fetching room IDs for group: ${groupId}`);
    const response = await (spinalApi.get as <T>(url: string) => Promise<{ data: T }>)(url) as { data: Room[] };
    console.log('Response data:', response.data);

    return response.data.map(room => room.dynamicId);
  } catch (error) {
    console.error('Erreur lors de la récupération des IDs des salles :', error);
    return [];
  }
}

// On Récupère les positions des salles données.

export async function getRoomPositions(roomIds: string[]): Promise<RoomPosition[] | null> {
  console.log('getRoomPositions called');
  const buildingId = localStorage.getItem("idBuilding");
  if (!buildingId) {
    console.error('idBuilding not found in localStorage');
    return null;
  }

  console.log('Building ID:', buildingId);
  console.log('Room IDs:', roomIds);

  try {
    const spinalAPI = SpinalAPI.getInstance();
    const url = spinalAPI.createUrlWithPlatformId(buildingId, 'api/v1/room/get_position_multiple');

    // Diviser les roomIds en lots de 50
    const batchSize = 50;
    const chunkedRoomIds = lodash.chunk(roomIds, batchSize);

    // Envoyer les requêtes en parallèle pour chaque lot
    const promises = chunkedRoomIds.map(async (batch) => {
      console.log('Processing batch:', batch);
      const response = await (spinalAPI.post as <T>(url: string, body: any) => Promise<{ data: T }>)(url, batch) as { data: RoomPosition[] };
      console.log('Batch response:', response.data);
      return response.data;
    });

    // Attendre que toutes les requêtes soient terminées
    const results = await Promise.allSettled(promises);

    // Combiner les résultats des lots réussis
    const combinedResults = results.reduce<RoomPosition[]>((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.push(...result.value);
      } else {
        console.error('Error in batch:', result.reason);
      }
      return acc;
    }, []);

    console.log('Combined results:', combinedResults);
    return combinedResults;
  } catch (error) {
    console.error('Error in getRoomPositions:', error);
    return null;
  }
}

export async function getRoomData(): Promise<Record<string, string[]>> {
  try {
    if (!cachedRoomEntryPoints || cachedRoomEntryPoints.length === 0) {
      console.warn("Aucun roomEntryPoint valide trouvé. Assurez-vous d'avoir appelé initializeSources.");
      return {};
    }

    const roomData: Record<string, string[]> = {};
    for (const roomEntryPoint of cachedRoomEntryPoints) {
      console.log(`Traitement de l'entryPoint : ${roomEntryPoint.name}`);
      const contextId = await getContextId(roomEntryPoint.name);
      if (!contextId) {
        console.warn(`Aucun contexte trouvé pour l'entryPoint : ${roomEntryPoint.name}`);
        continue;
      }

      const categoryId = await getCategoryId(contextId, roomEntryPoint.category);
      if (!categoryId) {
        console.warn(`Aucune catégorie trouvée pour l'entryPoint : ${roomEntryPoint.name}`);
        continue;
      }

      const groupId = await getGroupId(contextId, categoryId, roomEntryPoint.group);
      if (!groupId) {
        console.warn(`Aucun groupe trouvé pour l'entryPoint : ${roomEntryPoint.name}`);
        continue;
      }

      const roomIds = await getRoomIds(contextId, categoryId, groupId);
      if (roomIds.length === 0) {
        console.warn(`Aucune salle trouvée pour l'entryPoint : ${roomEntryPoint.name}`);
        continue;
      }

      roomData[roomEntryPoint.name] = roomIds;
    }

    console.log('Room Data:', roomData);
    return roomData;
  } catch (error) {
    console.error('Erreur dans getRoomData :', error);
    return {};
  }
}
// Fonction pour extraire les IDs dynamiques
function extractDynamicIds(
  combinedResults: CombinedResult[],
  configEntryPoint: { source: { name: string; profileName: string }[] },
  processEndpoint: (endpoint: Endpoint, item: CombinedResult, dynamicIds: string[], ...extraParams: any[]) => void,
  ...extraParams: any[]
): string[] {
  const dynamicIds: string[] = [];
  combinedResults.forEach((endpointsList) => {
    if (endpointsList && Array.isArray(endpointsList)) {
      endpointsList.forEach((item) => {
        if (item.endpoints && Array.isArray(item.endpoints)) {
          item.endpoints.forEach((endpoint) => {
            const matchingSource = configEntryPoint.source.find((source) =>
              endpoint.name.trim().toLowerCase() === source.name.trim().toLowerCase() &&
              item.profileName.trim().toLowerCase() === source.profileName.trim().toLowerCase()
            );

            if (matchingSource) {
              processEndpoint(endpoint, item, dynamicIds, ...extraParams);
            }
          });
        }
      });
    }
  });
  return dynamicIds;
}

// Fonction pour traiter les endpoints des bâtiments
function processBuildingEndpoint(
  endpoint: Endpoint,
  item: CombinedResult,
  dynamicIds: string[],
  floorOccupancyMapping: FloorOccupancyMapping
): void {
  if (item.dynamicId) {
    dynamicIds.push(endpoint.dynamicId);
    floorOccupancyMapping[endpoint.dynamicId] = { dynamicId: item.dynamicId, occupancy: '' };
  }
}

// Fonction pour traiter les endpoints des salles
function processRoomEndpoint(endpoint: Endpoint, room: { dynamicId: string }, dynamicIds: string[]): void {
  dynamicIds.push(endpoint.dynamicId);
}

// Fonction pour traiter les endpoints des équipements
function processEquipmentEndpoint(endpoint: Endpoint, equipment: { dynamicId: string }, dynamicIds: string[]): void {
  dynamicIds.push(endpoint.dynamicId);
}

// Fonction pour traiter les endpoints des salles par étage
function processRoomEndpointByFloor(
  endpoint: Endpoint,
  room: { dynamicId: string },
  dynamicIdsByFloor: Record<string, string[]>,
  roomsByFloor: Record<string, { rooms: string[] }>
): void {
  const floorId = Object.keys(roomsByFloor).find((floorId) =>
    roomsByFloor[floorId].rooms.includes(room.dynamicId)
  );
  if (floorId) {
    if (!dynamicIdsByFloor[floorId]) {
      dynamicIdsByFloor[floorId] = [];
    }
    dynamicIdsByFloor[floorId].push(endpoint.dynamicId);
  }
}
// On Récupère les IDs dynamiques d'occupation pour les étages
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
  }
}

// Fonction pour récupérer les taux d'occupation des étages par période
export async function getFloorOccupancyRatesByPeriod(
  period: string,
  timestamp: number,
  dynamicIds: string[],
  startTime: string | null = null,
  endTime: string | null = null
): Promise<FloorOccupancyRate[]> {
  try {
    const buildingId = localStorage.getItem('idBuilding');
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    const spinalApi = SpinalAPI.getInstance();
    const periodArray: string[] = getPeriodArray(timestamp, period);

    const start: string = periodArray[1];
    const end: string = periodArray[2];

    const combinedResults: { timeseries: TimeSeriesPoint[] }[] = await processInBatches(dynamicIds, 50, async (batch) => {
      const url = spinalApi.createUrlWithPlatformId(
        buildingId,
        `api/v1/endpoint/timeSeries/read_multiple/${start}/${end}`
      );
      const response = await spinalApi.post<{ data: { timeseries: TimeSeriesPoint[] }[] }>(url, batch);
      return response.data;
    });

    console.log('Données brutes récupérées depuis l\'API :', combinedResults);

    // Filtrage des données avec la fonction utilitaire
    combinedResults.forEach(series => {
      series.timeseries = filterTimeSeries(series.timeseries, startTime, endTime);
    });

    const aggregatedData: Record<string, TimeSeriesPoint[]> = {};
    dynamicIds.forEach(dynamicId => {
      aggregatedData[dynamicId] = [];
    });

    combinedResults.forEach((series, index) => {
      aggregatedData[dynamicIds[index]].push(...series.timeseries);
    });

    console.log('Aggregated data:', aggregatedData);

    const labels = getPeriodArray(timestamp, period)[0]; // Générer les labels pour la période

    const floorData: FloorOccupancyRate[] = dynamicIds.map(dynamicId => {
      const floorSeries = aggregatedData[dynamicId];
      const weightedAverages = calculateTimeWeightedAverage(floorSeries, labels, period);
      const averageValue = weightedAverages.length > 0 ? weightedAverages.reduce((sum, val) => sum + val, 0) / weightedAverages.length : 0;
      console.log('hadi dar lwarata ', averageValue);
      return {
        dynamicId,
        occupancy: averageValue.toFixed(7),
      };
    });

    return floorData;
  } catch (error) {
    console.error("Erreur lors de la récupération des taux d'occupation des étages :", error);
    return [];
  }
}
export function filterTimeSeries<T extends { date: string }>(
  timeSeriesData: T[],
  startTime: string | null,
  endTime: string | null
): T[] {
  if (!startTime || !endTime) {
    return timeSeriesData; // Si aucune plage horaire n'est spécifiée, retourner les données non filtrées.
  }

/*   console.log('Filtrage des séries temporelles avec la plage horaire :', { startTime, endTime });
 */
  const filteredData = timeSeriesData.filter(point => {
    const pointTime = moment(point.date).format('HH:mm');
    return moment(pointTime, 'HH:mm').isBetween(
      moment(startTime, 'HH:mm'),
      moment(endTime, 'HH:mm'),
      null,
      '[]' // Inclut les bornes
    );
  });

  /* console.log('Données après filtrage :', {
    nombrePoints: filteredData.length,
    échantillon: filteredData.slice(0, 3).map(point => ({
      date: moment(point.date).format('HH:mm'),
      valeur: (point as any).value, // Supposant que `value` est une propriété des points.
    })),
  }); */

  return filteredData;
}
// Fonction pour traiter les éléments en lots
async function processInBatches<T>(
  items: T[],
  batchSize: number,
  callback: (batch: T[]) => Promise<any>
): Promise<any[]> {
  const results: any[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResult = await callback(batch);
    results.push(batchResult);
  }
  return results.flat();
}

// Fonction pour récupérer les IDs dynamiques d'occupation pour les salles données
export async function fetchSecondChartOccupationDynamicIds(
  roomIds: string[]
): Promise<string[]> {
  try {
    console.log('fetchSecondChartOccupationDynamicIds called with roomIds:', roomIds);

    if (!cachedRoomEntryPoints || cachedRoomEntryPoints.length === 0) {
      console.warn("Aucun roomEntryPoint valide trouvé. Assurez-vous d'avoir appelé initializeSources.");
      return [];
    }

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
    console.log('Generated URL for control endpoint list:', url);

    const batchSize = 50;
    const chunkedRoomIds = lodash.chunk(roomIds, batchSize);
    console.log('Chunked room IDs into batches of size:', batchSize, chunkedRoomIds);

    const allDynamicIds: string[] = [];

    // Parcourir chaque entryPoint dans cachedRoomEntryPoints
    for (const entryPoint of cachedRoomEntryPoints) {
      console.log(`Traitement de l'entryPoint : ${entryPoint.name}`);

      // Envoyer les requêtes en parallèle pour chaque lot
      const promises = chunkedRoomIds.map(async (batch, index) => {
        console.log(`Processing batch ${index + 1}/${chunkedRoomIds.length} for entryPoint: ${entryPoint.name}`);
        const response = await (spinalApi.post as <T>(url: string, body: any) => Promise<{ data: T }>)(url, batch);
        console.log(`Batch ${index + 1} response for entryPoint ${entryPoint.name}:`, response.data);
        return response.data as CombinedResult[];
      });

      const combinedResults = (await Promise.all(promises)).flat();
      console.log(`Combined results for entryPoint ${entryPoint.name}:`, combinedResults);

      // Extraire les IDs dynamiques pour cet entryPoint
      const dynamicIds = extractDynamicIds(combinedResults, entryPoint, processRoomEndpoint);
      console.log(`Dynamic IDs for entryPoint ${entryPoint.name}:`, dynamicIds);

      // Ajouter les IDs dynamiques au tableau global
      allDynamicIds.push(...dynamicIds);
    }

    console.log('All extracted dynamic IDs:', allDynamicIds);
    return allDynamicIds;
  } catch (error) {
    console.error('Error in fetchSecondChartOccupationDynamicIds:', error);
    return [];
  }
}
// On Regroupe les salles par étage.
export function groupSecondChartsByFloor(roomPositions: RoomPosition[]): RoomsByFloor {
  try {
    console.log('Grouping rooms by floor');
    const roomsByFloor: RoomsByFloor = {};
    roomPositions.forEach(room => {
      const floorId = (room as any)?.info?.floor?.dynamicId;
      const floorName = (room as any)?.info?.floor?.name;

      if (!floorId || !floorName) return;
      if (!roomsByFloor[floorId]) {
        roomsByFloor[floorId] = { floorName, rooms: [] };
      }

      roomsByFloor[floorId].rooms.push(room.dynamicId);
    });

    console.log('Rooms grouped by floor:', roomsByFloor);
    return roomsByFloor;
  } catch (error) {
    console.error('Error in groupSecondChartsByFloor:', error);
    return {};
  }
}

// Fonction pour récupérer les IDs dynamiques d'occupation des salles de réunion par étage
export async function getFloorSecondChartOccupationDynamicIds(
  roomIds: string[],
  roomsByFloor: RoomsByFloor
): Promise<DynamicIdsByFloor> {
  try {
    // Vérifier si les roomEntryPoints sont initialisés
    if (!cachedRoomEntryPoints || cachedRoomEntryPoints.length === 0) {
      console.warn("Aucun roomEntryPoint valide trouvé. Assurez-vous d'avoir appelé initializeSources.");
      return {};
    }

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return {};
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');

    const batchSize = 50;
    const chunkedRoomIds = lodash.chunk(roomIds, batchSize);

    // Envoyer les requêtes en parallèle pour chaque lot
    const promises = chunkedRoomIds.map(async (batch) => {
      const response = await (spinalApi.post as <T>(url: string, body: any) => Promise<{ data: T }>)(url, batch);
      return response.data as CombinedResult[];
    });

    const combinedResults = (await Promise.all(promises)).flat();

    const dynamicIdsByFloor: DynamicIdsByFloor = {};

    // Parcourir tous les entryPoints dans cachedRoomEntryPoints
    for (const roomEntryPoint of cachedRoomEntryPoints) {
      console.log(`Traitement de l'entryPoint : ${roomEntryPoint.name}`);

      extractDynamicIds(
        combinedResults,
        roomEntryPoint, // Utilisation de l'entryPoint actuel
        (endpoint, room) => processRoomEndpointByFloor(endpoint, room, dynamicIdsByFloor, roomsByFloor)
      );
    }

    return dynamicIdsByFloor;
  } catch (error) {
    console.error('Error in getFloorSecondChartOccupationDynamicIds:', error);
    return {};
  }
}

let cachedFloors: Floor[] = [];
let cachedRoomPositions: RoomPosition[] = [];
let cachedRoomsByFloor: RoomsByFloor = {};
let cachedDynamicIdsByFloor: DynamicIdsByFloor = {};
let cachedDynamicIds: string[] = [];
let cachedFloorNames: Record<string, string> = {};
let cachedFloorOccupancyMapping: FloorOccupancyMapping = {};


export async function initializeData(roomIds: string[]): Promise<void> {
  try {
    console.log("Initialisation des données...");
        console.log("Room IDs passés à initializeData :", roomIds);

    if (cachedFloors.length === 0) {
      cachedFloors = await getFloors();
      console.log("Étages récupérés :", cachedFloors);
      if (!cachedFloors.length) {
        throw new Error("Aucun étage trouvé.");
      }
    }

    if (cachedRoomPositions.length === 0) {
      cachedRoomPositions = await getRoomPositions(roomIds) || [];
      console.log("Positions des salles mises en cache :", cachedRoomPositions);
    }

    if (Object.keys(cachedRoomsByFloor).length === 0) {
      cachedRoomsByFloor = groupSecondChartsByFloor(cachedRoomPositions);
      console.log("Salles regroupées par étage :", cachedRoomsByFloor);
    }

    if (Object.keys(cachedDynamicIdsByFloor).length === 0) {
      cachedDynamicIdsByFloor = await getFloorSecondChartOccupationDynamicIds(roomIds, cachedRoomsByFloor);
      console.log("IDs dynamiques des salles par étage mis en cache :", cachedDynamicIdsByFloor);
    }

    if (cachedDynamicIds.length === 0 || Object.keys(cachedFloorNames).length === 0) {
      const { dynamicIds, floorNames, floorOccupancyMapping } = await getFloorOccupancyDynamicIds();
      cachedDynamicIds = dynamicIds;
      cachedFloorNames = floorNames;
      cachedFloorOccupancyMapping = floorOccupancyMapping;
      console.log("IDs dynamiques et noms des étages mis en cache :", { cachedDynamicIds, cachedFloorNames });
    }

    console.log("Données initialisées avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des données :", error);
  }
}

// Fonction pour récupérer les données d'occupation par étage
export async function getSecondChartOccupancyDataByFloor(
  space: { type: string; dynamicId?: string },
  tempo: string,
  currentTimestamp: number,
  roomIds: string[],
  startTime: string | null = null,
  endTime: string | null = null
): Promise<[string[], any[], { floor: string; average: number }[]]> {
  try {
    const periodArray = getPeriodArray(currentTimestamp, tempo);
    const label = periodArray[0];
    const tooltipDate = periodArray[5];
    const data: any[] = [];
    const averages: { floor: string; average: number }[] = [];

    if (cachedFloors.length === 0 || Object.keys(cachedRoomsByFloor).length === 0 || Object.keys(cachedDynamicIdsByFloor).length === 0) {
      console.error("Les données nécessaires ne sont pas initialisées. Appelez initializeData d'abord.");
      return [[], [], []];
    }

    const aggregatedFloorData: Record<string, Record<string, number[]>> = {};

    for (const floor of cachedFloors) {
      const dynamicIds = cachedDynamicIdsByFloor[floor.dynamicId];
      if (dynamicIds && dynamicIds.length > 0) {
        const batchSize = 50;
        const chunkedDynamicIds = lodash.chunk(dynamicIds, batchSize);

        const promises = chunkedDynamicIds.map(async (batch) => {
          const url = spinalApi.createUrlWithPlatformId(
            localStorage.getItem("idBuilding")!,
            `api/v1/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`
          );
          const response = await spinalApi.post<{ data: RoomData[] }>(url, batch);
          return response.data;
        });

        const results = await Promise.all(promises);
        let timeSeriesData: RoomData[] = results.flat();

        // Utiliser la fonction de filtre
        timeSeriesData.forEach(roomData => {
          roomData.timeseries = filterTimeSeries(roomData.timeseries || [], startTime, endTime);
        });

        aggregatedFloorData[floor.name] = {};
        label.forEach((periodLabel) => {
          aggregatedFloorData[floor.name][periodLabel] = [];
        });

        timeSeriesData.forEach((roomData) => {
          roomData.timeseries.forEach((point) => {
            const formattedLabel = formatLabel(point.date, tempo);
            if (aggregatedFloorData[floor.name][formattedLabel]) {
              aggregatedFloorData[floor.name][formattedLabel].push(point.value);
            }
          });
        });

        // Calculer les moyennes pondérées pour chaque étage
        const floorSeries = timeSeriesData.flatMap(roomData => roomData.timeseries);
        const weightedAverages = calculateTimeWeightedAverage(floorSeries, label, tempo);

        averages.push({
          floor: floor.name,
          average: weightedAverages.length > 0
            ? weightedAverages.reduce((sum, val) => sum + val, 0) / weightedAverages.length
            : 0,
        });
      }
    }

    return [label, data, averages];
  } catch (error) {
    console.error("Erreur dans getSecondChartOccupancyDataByFloor :", error);
    return [[], [], []];
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

    console.log(`Total surface of meeting rooms: ${totalSurface2.toFixed(7)} m²`);
    return totalSurface2;
  } catch (error) {
    console.error('Error in getTotalSurface2:', error);
    return null;
  }
}
// On Récupère l'ID du contexte pour un groupe d'équipements.
export async function getThirdChartContextId(contextName: string): Promise<string | null> {
  try {
    console.log('getThirdChartContextId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/equipementsGroup/list');
    console.log(`Fetching equipment context ID for context: ${contextName} in building: ${buildingId}`);
    console.log("Generated URL for getThirdChartContextId:", url);

    const response = await spinalApi.get(url) as { data: Context[] };
    console.log('Response data:', response.data);

    const context = response.data.find(item => item.name === contextName);
    console.log('Context:', context);

    return context ? context.dynamicId : null;
  } catch (error) {
    console.error('Error in getThirdChartContextId:', error);
    return null;
  }
}

// On Récupère l'ID de la catégorie pour un contexte d'équipement donné.
export async function getThirdChartCategoryId(contextId: string, categoryName: string): Promise<string | null> {
  try {
    console.log('getThirdChartCategoryId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/equipementsGroup/${contextId}/category_list`);
    console.log(`Fetching Category ID for context: ${contextId} in building: ${buildingId}`);
    console.log("Generated URL for getThirdChartCategoryId:", url);

    const response = await spinalApi.get(url) as { data: Context[] };
    console.log('Response data:', response.data);

    const category = response.data.find(item => item.name === categoryName);
    console.log('Category:', category);

    return category ? category.dynamicId : null;
  } catch (error) {
    console.error('Error in getThirdChartCategoryId:', error);
    return null;
  }
}

// On Récupère l'ID du groupe pour un contexte et une catégorie d'équipement donnés.
export async function getThirdChartGroupId(contextId: string, categoryId: string, groupName: string): Promise<string | null> {
  try {
    console.log('getThirdChartGroupId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(
      buildingId,
      `api/v1/equipementsGroup/${contextId}/category/${categoryId}/group_list`
    );
    console.log(`Fetching Group ID for context: ${contextId}, category: ${categoryId} in building: ${buildingId}`);
    console.log("Generated URL for getThirdChartGroupId:", url);

    const response = await spinalApi.get(url) as { data: Group[] };
    console.log('Response data:', response.data);

    const group = response.data.find(item => item.name === groupName);
    console.log('Group:', group);

    return group ? group.dynamicId : null;
  } catch (error) {
    console.error('Error in getThirdChartGroupId:', error);
    return null;
  }
}

// On Récupère la liste des équipements pour un contexte, une catégorie et un groupe donnés.
export async function getThirdChartIds(contextId: string, categoryId: string, groupId: string): Promise<string[]> {
  try {
    console.log('getThirdChartIds called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return [];
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(
      buildingId,
      `api/v1/equipementsGroup/${contextId}/category/${categoryId}/group/${groupId}/equipementList`
    );
    console.log(`Fetching Equipment IDs for context: ${contextId}, category: ${categoryId}, group: ${groupId} in building: ${buildingId}`);
    console.log("Generated URL for getThirdChartIds:", url);

    const response = await (spinalApi.get as <T>(url: string) => Promise<{ data: T }>)(url) as { data: Equipment[] };
    console.log('Response data:', response.data);

    return response.data.map(equipment => equipment.dynamicId);
  } catch (error) {
    console.error('Error in getThirdChartIds:', error);
    return [];
  }
}

export async function getThirdChartData(): Promise<string[]> {
  try {
    console.log("getThirdChartData called");

    // Vérifier si les equipmentEntryPoints sont initialisés
    if (!cachedEquipmentEntryPoints || cachedEquipmentEntryPoints.length === 0) {
      console.warn("Aucun equipmentEntryPoint valide trouvé. Assurez-vous d'avoir appelé initializeSources.");
      return [];
    }

    // Initialiser un tableau pour stocker les IDs des équipements
    const allEquipmentIds: string[] = [];

    // Parcourir tous les entryPoints dans cachedEquipmentEntryPoints
    for (const equipmentEntryPoint of cachedEquipmentEntryPoints) {
      console.log(`Traitement de l'entryPoint : ${equipmentEntryPoint.name}`);

      // Récupérer les IDs dynamiques pour le contexte, la catégorie et le groupe
      if (!cachedThirdChartContextId) {
        console.log(`Fetching context ID for entryPoint: ${equipmentEntryPoint.name}`);
        cachedThirdChartContextId = await getThirdChartContextId(equipmentEntryPoint.name);
        console.log(`Context ID fetched: ${cachedThirdChartContextId}`);
      }

      if (!cachedThirdChartCategoryId) {
        console.log(`Fetching category ID for context: ${cachedThirdChartContextId}, category: ${equipmentEntryPoint.category}`);
        cachedThirdChartCategoryId = await getThirdChartCategoryId(
          cachedThirdChartContextId,
          equipmentEntryPoint.category
        );
        console.log(`Category ID fetched: ${cachedThirdChartCategoryId}`);
      }

      if (!cachedThirdChartGroupId) {
        console.log(`Fetching group ID for context: ${cachedThirdChartContextId}, category: ${cachedThirdChartCategoryId}, group: ${equipmentEntryPoint.group}`);
        cachedThirdChartGroupId = await getThirdChartGroupId(
          cachedThirdChartContextId,
          cachedThirdChartCategoryId,
          equipmentEntryPoint.group
        );
        console.log(`Group ID fetched: ${cachedThirdChartGroupId}`);
      }

      // Récupérer les IDs des équipements pour le groupe
      if (cachedThirdChartIds.length === 0) {
        console.log(`Fetching equipment IDs for context: ${cachedThirdChartContextId}, category: ${cachedThirdChartCategoryId}, group: ${cachedThirdChartGroupId}`);
        cachedThirdChartIds = await getThirdChartIds(
          cachedThirdChartContextId,
          cachedThirdChartCategoryId,
          cachedThirdChartGroupId
        );
        console.log(`Equipment IDs fetched: ${cachedThirdChartIds}`);
      }

      // Ajouter les IDs récupérés au tableau global
      console.log(`Adding ${cachedThirdChartIds.length} equipment IDs to the global list`);
      allEquipmentIds.push(...cachedThirdChartIds);
    }

    console.log(`Total equipment IDs collected: ${allEquipmentIds.length}`);
    // Retourner tous les IDs des équipements
    return allEquipmentIds;
  } catch (error) {
    console.error("Erreur dans getThirdChartData :", error);
    return [];
  }
}

// On Récupère les positions des équipements donnés.
export async function getThirdChartPositions(thirdChartIds: string[]): Promise<any[]> {
  try {
    console.log('getThirdChartPositions called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return [];
    }

    console.log(`Fetching positions for equipment IDs: ${thirdChartIds}`);

    const spinalApi = SpinalAPI.getInstance();
    const url = `api/v1/building/${buildingId}/equipment/get_position_multiple`;

    // Diviser les IDs en lots pour éviter de surcharger l'API
    const batchSize = 50;
    const chunkedIds = lodash.chunk(thirdChartIds, batchSize);

    // Envoyer les requêtes en parallèle pour chaque lot
    const promises = chunkedIds.map(async (batch) => {
      const response = await (spinalApi.post as <T>(url: string, body: any) => Promise<{ data: { datas: any[] } }>)(
        url,
        batch
      );

      // Vérifier si la réponse contient la clé `data.datas`
      if (response && response.data && Array.isArray(response.data.datas)) {
        return response.data.datas;
      } else {
        console.error('Invalid response format for batch:', batch, response);
        return [];
      }
    });

    // Attendre que toutes les requêtes soient terminées
    const results = await Promise.all(promises);

    // Combiner les résultats des lots
    const combinedResults = results.flat();
    console.log('Combined equipment positions:', combinedResults);

    return combinedResults;
  } catch (error) {
    console.error('Error in getThirdChartPositions:', error);
    return [];
  }
}

// On Récupère les IDs dynamiques d'occupation pour les équipements donnés.
export async function fetchThirdChartOccupationDynamicIds(
  thirdChartIds: string[],
  entryPoint: EntryPoint
): Promise<string[]> {
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
      console.log('Batch response:', response.data);

      return response.data;
    });

    console.log('Combined results:', combinedResults);

    // Utiliser l'entryPoint passé en paramètre pour extraire les IDs dynamiques
    const dynamicIds = extractDynamicIds(combinedResults, entryPoint, processEquipmentEndpoint);
    console.log('Extracted dynamic IDs:', dynamicIds);

    return dynamicIds;
  } catch (error) {
    console.error('Error in fetchThirdChartOccupationDynamicIds:', error);
    return [];
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

        const results = await Promise.all(batchedPromises);
        let timeSeriesData = results.flatMap(result => result?.data || []);

        // Utiliser la fonction de filtre
        timeSeriesData.forEach((roomData) => {
          roomData.timeseries = filterTimeSeries(roomData.timeseries || [], startTime, endTime);
        });

        // Calculer les moyennes pondérées pour chaque étage
        const floorSeries = timeSeriesData.flatMap(roomData => roomData.timeseries);
        const weightedAverages = calculateTimeWeightedAverage(floorSeries, label, tempo);

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
        const average = values.length > 0 ? parseFloat((sum / values.length).toFixed(7)) : 0;
        return {
          floor,
          average
        };
      })
    );

    return [label, floorProcessedTimeSeries, averages];
  } catch (e) {
    console.error('Error in getThirdChartOccupancyDataByFloor:', e);
    return [[], [], []]; // Retourner des valeurs vides en cas d'erreur
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


// Fonction utilitaire pour formater les labels
function formatLabel(date: string, tempo: string): string {
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
// Fonction pour récupérer les données de graphe pour un bâtiment
export async function getGraphData(): Promise<string | null> {
  try {
    console.log('getGraphData called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    const spinalApi = SpinalAPI.getInstance();

    // Récupération des données du bâtiment
    const buildingUrl = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/building/read');
    console.log("Generated URL for building data:", buildingUrl);
    const buildingResponse = await spinalApi.get<{ dynamicId: string }>(buildingUrl);
    console.log('Building data:', buildingResponse.data);

    // Récupération des points de contrôle
    const controlEndpointUrl = spinalApi.createUrlWithPlatformId(
      buildingId,
      `api/v1/node/${buildingResponse.data.dynamicId}/control_endpoint_list`
    );
    console.log("Generated URL for control endpoints:", controlEndpointUrl);
    const controlEndpointResponse = await spinalApi.get<ControlProfile[]>(controlEndpointUrl);
    console.log('Control endpoint response data:', controlEndpointResponse.data);

    // Vérifier si les buildingEntryPoints sont initialisés
    if (!cachedBuildingEntryPoints || cachedBuildingEntryPoints.length === 0) {
      console.error('Aucun buildingEntryPoint valide trouvé. Assurez-vous d\'avoir appelé initializeSources.');
      return null;
    }

    let occupancyEndpoint: ControlEndpoint | null = null;

    // Parcourir tous les entryPoints dans cachedBuildingEntryPoints
    for (const buildingEntryPoint of cachedBuildingEntryPoints) {
      console.log(`Traitement de l'entryPoint : ${buildingEntryPoint.name}`);

      if (!buildingEntryPoint.source || buildingEntryPoint.source.length === 0) {
        console.warn(`Aucune source valide trouvée pour l'entryPoint : ${buildingEntryPoint.name}`);
        continue;
      }

      // Parcourir toutes les sources de l'entryPoint
      for (const source of buildingEntryPoint.source) {
        console.log(`Traitement de la source : ${source.name}, profileName : ${source.profileName}`);

        // Rechercher le point de contrôle correspondant
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

        if (occupancyEndpoint) {
          console.log(`Point de contrôle trouvé pour la source : ${source.name}`);
          break;
        }
      }

      if (occupancyEndpoint) {
        break;
      }
    }

    if (!occupancyEndpoint) {
      console.error('Aucun point de contrôle correspondant trouvé.');
      return null;
    }

    const occupancyDynamicId = occupancyEndpoint.dynamicId;
    console.log('Occupancy dynamic ID:', occupancyDynamicId);

    return occupancyDynamicId;
  } catch (error) {
    console.error('Error in getGraphData:', error);
    return null;
  }
}
//Récupère les données pour un espace donné, une temporalité et un timestamp.
// Fonction principale pour récupérer les données

// mth 2 : Calcule moy temp.

export function calculateTimeWeightedAverage(
  timeSeriesData: TimeSeriesPoint[],
  labels: string[],
  tempo: string
): number[] {
  if (!timeSeriesData || !Array.isArray(timeSeriesData)) {
    console.error('timeSeriesData must be an array');
    return [];
  }

  if (!labels || !Array.isArray(labels)) {
    console.error('labels must be an array');
    return [];
  }

  console.log('calculateTimeWeightedAverage inputs:', {
    dataLength: timeSeriesData.length,
    labelsLength: labels.length,
    tempo: tempo,
  });

  // Traitement spécial pour la temporalité Journée
  if (tempo === 'Journée' || tempo === 'Valeur Courante') {
    return labels.map(hour => {
      const pointsForHour = timeSeriesData.filter(point => 
        moment(point.date).format('HH') === hour
      );
      
      if (pointsForHour.length === 0) return 0;
      
      // Calculer la moyenne simple pour l'heure
      const sum = pointsForHour.reduce((acc, point) => 
        acc + (parseFloat(point.value.toString()) || 0), 0
      );
      return parseFloat((sum / pointsForHour.length).toFixed(7));
    });
  }

  // Pour les autres temporalités, utiliser la moyenne pondérée existante
  const weightedAverages: number[] = [];
  const aggregatedData: Record<string, { value: number; timestamp: number }[]> = {};

  // Initialize aggregatedData for all labels
  labels.forEach((periodLabel) => {
    aggregatedData[periodLabel] = [];
  });

  // Process data points and group them by formatted labels
  timeSeriesData.forEach((point) => {
    if (!point || !point.date) {
      console.warn('Invalid data point:', point);
      return;
    }

    let formattedLabel: string;
    try {
      switch (tempo) {
        case 'Semaine':
        case 'Mois':
        case 'Trimestre':
          formattedLabel = moment(point.date).format('DD MMM');
          break;
        case 'Année':
          formattedLabel = moment(point.date).format('MMM');
          break;
        case 'Décennie':
          formattedLabel = moment(point.date).format('YYYY');
          break;
        default:
          formattedLabel = moment(point.date).format('DD MMM');
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      return;
    }

    if (aggregatedData[formattedLabel]) {
      aggregatedData[formattedLabel].push({
        value: parseFloat(point.value.toString()) || 0,
        timestamp: moment(point.date).valueOf(),
      });
    }
  });

  // Calculate time-weighted averages for each label
  labels.forEach((periodLabel) => {
    const values = aggregatedData[periodLabel] || [];
    if (values.length < 2) {
      weightedAverages.push(0);
      return;
    }

    let totalTime = 0;
    let weightedSum = 0;

    for (let i = 0; i < values.length - 1; i++) {
      const deltaTime = values[i + 1].timestamp - values[i].timestamp;
      if (deltaTime > 0) {
        totalTime += deltaTime;
        weightedSum += values[i].value * deltaTime;
      }
    }

    weightedAverages.push(totalTime > 0 ? +(weightedSum / totalTime).toFixed(7) : 0);
  });

  console.log('calculateTimeWeightedAverage output:', {
    averagesLength: weightedAverages.length,
    sampleValues: weightedAverages.slice(0, 3),
  });

  return weightedAverages;
}


export async function getData(
  space: { type: string; dynamicId?: string },
  tempo: string,
  currentTimestamp: number,
  roomIds: string[],
  startTime: string | null = null,
  endTime: string | null = null
): Promise<[string[], ChartData[], any[]]> {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    const spaceArea = await getArea(space);
    let periodArray = getPeriodArray(currentTimestamp, tempo);
    const label: string[] = periodArray[0];
    const tooltipDate: string[] = periodArray[5];
    const data: ChartData[] = [];

    // 1. Taux d'occupation du bâtiment
    if (config.chartDisplayConfig.globalOccupancyChart[0]) {
      console.log('=== TAUX OCCUPATION BÂTIMENT ===');
      try {
        const occupancyDynamicId = await getGraphData();
        if (!occupancyDynamicId) throw new Error('Occupancy dynamic ID not found');

        const spinalApi = SpinalAPI.getInstance();
        const timeSeriesUrl = spinalApi.createUrlWithPlatformId(
          buildingId,
          `api/v1/endpoint/${occupancyDynamicId}/timeSeries/read/${periodArray[1]}/${periodArray[2]}`
        );
        console.log("Generated URL for time series data:", timeSeriesUrl);

        const timeSeriesResponse = await spinalApi.get<{ data: TimeSeriesPoint[] }>(timeSeriesUrl);
        let occupancyRateData: TimeSeriesPoint[] = timeSeriesResponse.data;

        console.log('Données bâtiment avant filtrage:', {
          nombrePoints: occupancyRateData.length,
          échantillon: occupancyRateData.slice(0, 3).map(point => ({
            date: moment(point.date).format('HH:mm'),
            valeur: point.value
          }))
        });

        // Filtrer les données si nécessaire
        occupancyRateData = filterTimeSeries(occupancyRateData, startTime, endTime);

        // Calculer les moyennes pondérées
        const buildingProcessedData = calculateTimeWeightedAverage(occupancyRateData, label, tempo);

        console.log('Données après calculateTimeWeightedAverage:', buildingProcessedData);
        data.push({
          label: config.charts.globalChart.firstData.label,
          data: buildingProcessedData,
          tooltipDate: tooltipDate,
          backgroundColor: config.charts.globalChart.firstData.backgroundColor,
          borderColor: config.charts.globalChart.firstData.borderColor,
          borderWidth: 1,
          fill: false,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données du bâtiment:', error);
      }
    }

    // 2. Taux d'occupation des salles de réunion
    if (config.chartDisplayConfig.globalOccupancyChart[1]) {
      console.log('=== TAUX OCCUPATION SALLES DE RÉUNION ===');
      const dynamicIds = await fetchSecondChartOccupationDynamicIds(roomIds);

      if (dynamicIds.length > 0) {
        const spinalApi = SpinalAPI.getInstance();
        const roomResults = await Promise.all(
          Array(Math.ceil(dynamicIds.length / 50)).fill().map((_, i) => {
            const batch = dynamicIds.slice(i * 50, (i + 1) * 50);
            const url = spinalApi.createUrlWithPlatformId(
              buildingId,
              `api/v1/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`
            );
            return spinalApi.post<{ data: RoomData[] }>(url, batch);
          })
        );

        let timeSeriesData: TimeSeriesPoint[] = roomResults.flatMap(result =>
          result.data.flatMap(room => room.timeseries || [])
        );

        // Filtrer les données si nécessaire
        timeSeriesData = filterTimeSeries(timeSeriesData, startTime, endTime);

        // Calculer les moyennes pondérées
        const roomProcessedData = calculateTimeWeightedAverage(timeSeriesData, label, tempo);

        console.log('Données salles après calcul de la moyenne pondérée:', {
          nombrePoints: timeSeriesData.length,
          échantillon: timeSeriesData.slice(0, 3).map(point => ({
            date: moment(point.date).format('HH:mm'),
            valeur: point.value
          }))
        });

        data.push({
          label: config.charts.globalChart.secondData.label,
          data: roomProcessedData,
          tooltipDate: tooltipDate,
          backgroundColor: config.charts.globalChart.secondData.backgroundColor,
          borderColor: config.charts.globalChart.secondData.backgroundColor,
          borderWidth: 1,
          fill: false,
        });
      }
    }

    // 3. Taux d'occupation des positions de travail
    if (config.chartDisplayConfig.globalOccupancyChart[2]) {
      console.log('=== TAUX OCCUPATION POSITIONS DE TRAVAIL ===');
      const thirdChartIds = await getThirdChartData();

      if (thirdChartIds.length > 0) {
        const equipmentDynamicIds = await fetchThirdChartOccupationDynamicIds(thirdChartIds, cachedEquipmentEntryPoints[0]);

        if (equipmentDynamicIds.length > 0) {
          const spinalApi = SpinalAPI.getInstance();
          const equipmentResults: { data: TimeSeriesData[] }[] = await Promise.all(
            Array(Math.ceil(equipmentDynamicIds.length / 50))
              .fill(null)
              .map((_, i) => {
                const batch: string[] = equipmentDynamicIds.slice(i * 50, (i + 1) * 50);
                const url: string = spinalApi.createUrlWithPlatformId(
                  buildingId,
                  `api/v1/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`
                );
                return spinalApi.post<{ data: TimeSeriesData[] }>(url, batch);
              })
          );

          let equipmentTimeSeriesData: TimeSeriesPoint[] = equipmentResults.flatMap(result =>
            result.data.flatMap(equipment => equipment.timeseries || [])
          );

          // Filtrer les données si nécessaire
          equipmentTimeSeriesData = filterTimeSeries(equipmentTimeSeriesData, startTime, endTime);

          // Calculer les moyennes pondérées
          const equipmentProcessedData = calculateTimeWeightedAverage(equipmentTimeSeriesData, label, tempo);

          console.log('Données positions après calcul de la moyenne pondérée:', {
            nombrePoints: equipmentTimeSeriesData.length,
            échantillon: equipmentTimeSeriesData.slice(0, 3).map(point => ({
              date: moment(point.date).format('HH:mm'),
              valeur: point.value
            }))
          });

          data.push({
            label: config.charts.globalChart.thirdData.label,
            data: equipmentProcessedData,
            tooltipDate: tooltipDate,
            backgroundColor: config.charts.globalChart.thirdData.backgroundColor,
            borderColor: config.charts.globalChart.thirdData.backgroundColor,
            borderWidth: 1,
            fill: false,
          });
        }
      }
    }

    return [label, data, []];

  } catch (error) {
    console.error('Error in getData:', error);
    return [null, null, []];
  }
}

export function getPeriodArray(timestamp: number, period: string): any[] {
  if (period === 'Journée' || period === 'Valeur Courante') {
    const startOfDay = moment(timestamp).startOf('day');
    const endOfDay = moment(timestamp).endOf('day');
    const hoursInDay: string[] = [];
    const tooltipDate: string[] = [];
    let currentHour = moment(startOfDay);

    while (currentHour.isSameOrBefore(endOfDay)) {
      hoursInDay.push(currentHour.format('HH'));
      tooltipDate.push(
        currentHour.format('ddd DD/MM/YYYY HH:mm').slice(0, 1).toUpperCase() +
        currentHour.format('ddd DD/MM/YYYY HH:mm').slice(1)
      );
      currentHour.add(1, 'hour');
    }

    return [
      hoursInDay,
      startOfDay.format('DD-MM-yyyy HH:mm:ss'),
      endOfDay.format('DD-MM-yyyy HH:mm:ss'),
      startOfDay.subtract(1, 'day').format('DD-MM-yyyy HH:mm:ss'),
      endOfDay.subtract(1, 'day').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate
    ];
  } else if (period === 'Semaine') {
    const startOfWeek = moment(timestamp).startOf('week');
    const endOfWeek = moment(timestamp).endOf('week');
    const daysInWeek: string[] = [];
    const abstractDaysInWeek: string[] = [];
    const tooltipDate: string[] = [];
    let currentDay = moment(startOfWeek);

    while (currentDay.isSameOrBefore(endOfWeek)) {
      daysInWeek.push(currentDay.format('DD MMM'));
      abstractDaysInWeek.push(
        currentDay.format('dddd').slice(0, 1).toUpperCase() +
        currentDay.format('dddd').slice(1)
      );
      tooltipDate.push(
        currentDay.format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() +
        currentDay.format('ddd DD/MM/YYYY').slice(1)
      );
      currentDay.add(1, 'day');
    }

    return [
      daysInWeek,
      startOfWeek.format('DD-MM-yyyy HH:mm:ss'),
      endOfWeek.format('DD-MM-yyyy HH:mm:ss'),
      startOfWeek.subtract(1, 'week').format('DD-MM-yyyy HH:mm:ss'),
      endOfWeek.subtract(1, 'week').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate,
      abstractDaysInWeek
    ];
  } else if (period === 'Mois') {
    const startOfMonth = moment(timestamp).startOf('month');
    const endOfMonth = moment(timestamp).endOf('month');
    const daysInMonth: string[] = [];
    const abstractDaysInMonth: string[] = [];
    const tooltipDate: string[] = [];
    let currentDay = moment(startOfMonth);

    while (currentDay.isSameOrBefore(endOfMonth)) {
      abstractDaysInMonth.push(currentDay.format('DD'));
      daysInMonth.push(currentDay.format('DD MMM'));
      tooltipDate.push(
        currentDay.format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() +
        currentDay.format('ddd DD/MM/YYYY').slice(1)
      );
      currentDay.add(1, 'day');
    }

    return [
      daysInMonth,
      startOfMonth.format('DD-MM-yyyy HH:mm:ss'),
      endOfMonth.format('DD-MM-yyyy HH:mm:ss'),
      startOfMonth.subtract(1, 'month').format('DD-MM-yyyy HH:mm:ss'),
      endOfMonth.subtract(1, 'month').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate,
      abstractDaysInMonth
    ];
  } else if (period === 'Année') {
    const monthsInYear: string[] = [];
    const tooltipDate: string[] = [];

    for (let i = 0; i < 12; i++) {
      const currentMonth = moment(timestamp).month(i);
      monthsInYear.push(currentMonth.format('MMM'));
      tooltipDate.push(
        currentMonth.format('MMMM/YYYY').slice(0, 1).toUpperCase() +
        currentMonth.format('MMMM/YYYY').slice(1)
      );
    }

    return [
      monthsInYear,
      moment(timestamp).startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).subtract(1, 'year').startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).subtract(1, 'year').endOf('year').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate
    ];
  } else if (period === 'Décennie') {
    const yearsInDecade: string[] = [];
    const tooltipDate: string[] = [];

    for (let i = -9; i <= 0; i++) {
      const currentYear = moment(timestamp).add(i, 'years');
      yearsInDecade.push(currentYear.format('YYYY'));
      tooltipDate.push(
        currentYear.format('YYYY').slice(0, 1).toUpperCase() +
        currentYear.format('YYYY').slice(1)
      );
    }

    return [
      yearsInDecade,
      moment(timestamp).subtract(10, 'years').startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss'),
      '',
      '',
      tooltipDate
    ];
  } else if (period === 'Trimestre') {
    const currentMonth = moment(timestamp).month() + 1;
    const trimester = Math.ceil(currentMonth / 3);
    let startOfTrimester: string;
    let endOfTrimester: string;
    let currentDay: moment.Moment;
    let endDay: moment.Moment;

    switch (trimester) {
      case 1:
        startOfTrimester = moment(`01/01/${moment(timestamp).year()}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
        endOfTrimester = moment(`31/03/${moment(timestamp).year()}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
        currentDay = moment(`01/01/${moment(timestamp).year()}`, 'DD/MM/YYYY');
        endDay = moment(`31/03/${moment(timestamp).year()}`, 'DD/MM/YYYY');
        break;
      case 2:
        startOfTrimester = moment(`01/04/${moment(timestamp).year()}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
        endOfTrimester = moment(`30/06/${moment(timestamp).year()}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
        currentDay = moment(`01/04/${moment(timestamp).year()}`, 'DD/MM/YYYY');
        endDay = moment(`30/06/${moment(timestamp).year()}`, 'DD/MM/YYYY');
        break;
      case 3:
        startOfTrimester = moment(`01/07/${moment(timestamp).year()}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
        endOfTrimester = moment(`30/09/${moment(timestamp).year()}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
        currentDay = moment(`01/07/${moment(timestamp).year()}`, 'DD/MM/YYYY');
        endDay = moment(`30/09/${moment(timestamp).year()}`, 'DD/MM/YYYY');
        break;
      case 4:
        startOfTrimester = moment(`01/10/${moment(timestamp).year()}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
        endOfTrimester = moment(`31/12/${moment(timestamp).year()}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
        currentDay = moment(`01/10/${moment(timestamp).year()}`, 'DD/MM/YYYY');
        endDay = moment(`31/12/${moment(timestamp).year()}`, 'DD/MM/YYYY');
        break;
      default:
        throw new Error('Invalid trimester');
    }

    const daysInTrimester: string[] = [];
    const abstractDaysInTrimester: string[] = [];
    const tooltipDate: string[] = [];

    while (currentDay.isSameOrBefore(endDay)) {
      daysInTrimester.push(currentDay.format('DD MMM'));
      abstractDaysInTrimester.push(currentDay.format('DD'));
      tooltipDate.push(
        currentDay.format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() +
        currentDay.format('ddd DD/MM/YYYY').slice(1)
      );
      currentDay.add(1, 'day');
    }

    return [
      daysInTrimester,
      startOfTrimester,
      endOfTrimester,
      moment(timestamp).subtract(5, 'months').startOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).subtract(3, 'months').endOf('month').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate,
      `T${trimester}`,
      abstractDaysInTrimester
    ];
  } else {
    return [];
  }
}