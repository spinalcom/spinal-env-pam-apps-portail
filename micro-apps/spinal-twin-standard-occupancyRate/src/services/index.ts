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
// On Récupère l'ID du contexte pour un bâtiment.
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
            if (
              endpoint.name.trim().toLowerCase() === configEntryPoint.source[0].name.trim().toLowerCase() &&
              item.profileName.trim().toLowerCase() === configEntryPoint.source[0].profileName.trim().toLowerCase()
            ) {
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
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('Building ID not found in localStorage');
      return { dynamicIds: [], floorNames: {}, floorOccupancyMapping: {} };
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/floor/list');
    console.log("Generated URL for getFloorOccupancyDynamicIds:", url);

    // Récupérer la liste des étages
    const floorsResponse = await (spinalApi.get as <T>(url: string) => Promise<{ data: T }>)(url);
    const floors: Floor[] = floorsResponse.data as Floor[];

    if (!floors || floors.length === 0) {
      console.error('Aucun étage trouvé pour ce bâtiment.');
      return { dynamicIds: [], floorNames: {}, floorOccupancyMapping: {} };
    }
    console.log('Étages récupérés :', floors);

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
      const batchUrl = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
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
    const floorOccupancyMapping: FloorOccupancyMapping = {};
    const dynamicIds = extractDynamicIds(combinedResults, config.entryPoints[2], processBuildingEndpoint, floorOccupancyMapping);

    if (dynamicIds.length === 0) {
      console.warn('⚠️ Aucun Dynamic ID trouvé pour les taux d\'occupation.');
    }

    console.log('Dynamic IDs des taux d\'occupation:', dynamicIds);
    console.log('Mapping Dynamic ID → Étages:', floorOccupancyMapping);

    return { dynamicIds, floorNames, floorOccupancyMapping };
  } catch (error) {
    console.error('Erreur dans getFloorOccupancyDynamicIds:', error);
    return { dynamicIds: [], floorNames: {}, floorOccupancyMapping: {} };
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

    // Filtrage des données avec startTime et endTime
    if (startTime && endTime) {
      combinedResults.forEach(series => {
        series.timeseries = series.timeseries.filter(point => {
          const pointTime = moment(point.date).format('HH:mm');
          return moment(pointTime, 'HH:mm').isBetween(
            moment(startTime, 'HH:mm'),
            moment(endTime, 'HH:mm'),
            null,
            '[]' // Inclut les bornes
          );
        });
      });
    }

    const aggregatedData: Record<string, { date: string; value: number }[]> = {};
    dynamicIds.forEach(dynamicId => {
      aggregatedData[dynamicId] = [];
    });

    combinedResults.forEach((series, index) => {
      series.timeseries.forEach(point => {
        const formattedLabel = period === 'Journée' || period === 'Valeur Courante'
          ? moment(point.date).format('HH')
          : moment(point.date).format('DD MMM');
        aggregatedData[dynamicIds[index]].push({
          date: point.date,
          value: point.value
        });
      });
    });

    const floorData: FloorOccupancyRate[] = dynamicIds.map(dynamicId => {
      const floorSeries = aggregatedData[dynamicId];
      const totalValue = floorSeries.reduce((sum, point) => sum + point.value, 0);
      const averageValue = floorSeries.length > 0 ? (totalValue / floorSeries.length).toFixed(2) : '0';
      return {
        dynamicId,
        occupancy: averageValue
      };
    });

    return floorData;
  } catch (error) {
    console.error("Erreur lors de la récupération des taux d'occupation des étages :", error);
    return [];
  }
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
export async function fetchSecondChartOccupationDynamicIds(roomIds: string[]): Promise<string[]> {
  try {
    console.log('fetchSecondChartOccupationDynamicIds called with roomIds:', roomIds);

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }
    console.log('Building ID:', buildingId);

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
    console.log('Generated URL for control endpoint list:', url);

    const batchSize = 50;
    const chunkedRoomIds = lodash.chunk(roomIds, batchSize);
    console.log('Chunked room IDs into batches of size:', batchSize, chunkedRoomIds);

    // Envoyer les requêtes en parallèle pour chaque lot
    const promises = chunkedRoomIds.map(async (batch, index) => {
      console.log(`Processing batch ${index + 1}/${chunkedRoomIds.length}:`, batch);
      const response = await (spinalApi.post as <T>(url: string, body: any) => Promise<{ data: T }>)(url, batch);
      console.log(`Batch ${index + 1} response:`, response.data);
      return response.data as CombinedResult[];
    });

    const combinedResults = (await Promise.all(promises)).flat();
    console.log('Combined results from all batches:', combinedResults);

    // Extraire les IDs dynamiques
    const dynamicIds = extractDynamicIds(combinedResults, config.entryPoints[0], processRoomEndpoint);
    console.log('Extracted Extracted dynamic IDsdynamic IDs:', dynamicIds);

    return dynamicIds;
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
    extractDynamicIds(
      combinedResults,
      config.entryPoints[0],
      (endpoint, room) => processRoomEndpointByFloor(endpoint, room, dynamicIdsByFloor, roomsByFloor)
    );

    return dynamicIdsByFloor;
  } catch (error) {
    console.error('Error in getFloorSecondChartOccupationDynamicIds:', error);
    return {};
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
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error("No building ID found in localStorage");
      return [[], [], []];
    }

    const spaceArea = await getArea(space);
    const periodArray = getPeriodArray(currentTimestamp, tempo);

    const label = periodArray[0];
    const tooltipDate = periodArray[5];
    const data: any[] = [];
    const averages: { floor: string; average: number }[] = [];

    const floors = await getFloors();
    const roomPositions = await getRoomPositions(roomIds);
    if (!roomPositions) {
      console.error("No room positions found");
      return [[], [], []];
    }

    const roomsByFloor = groupSecondChartsByFloor(roomPositions);
    const dynamicIdsByFloor = await getFloorSecondChartOccupationDynamicIds(roomIds, roomsByFloor);

    const aggregatedFloorData: Record<string, Record<string, number[]>> = {};

    for (const floor of floors) {
      const dynamicIds = dynamicIdsByFloor[floor.dynamicId];
      if (dynamicIds && dynamicIds.length > 0) {
        const batchSize = 50;
        const chunkedDynamicIds = lodash.chunk(dynamicIds, batchSize);

        // Envoyer les requêtes en parallèle pour chaque lot
        const promises = chunkedDynamicIds.map(async (batch) => {
          const spinalApi = SpinalAPI.getInstance();
          const url = spinalApi.createUrlWithPlatformId(
            buildingId,
            `api/v1/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`
          );
          const response = await (spinalApi.post as <T>(url: string, body: any) => Promise<{ data: T }>)(url, batch);
          return response.data as RoomData[];
        });

        const results = await Promise.all(promises);
        let timeSeriesData: RoomData[] = results.flat();

        // Filtrage des données avec startTime et endTime
        if (startTime && endTime) {
          timeSeriesData.forEach((roomData) => {
            if (Array.isArray(roomData.timeseries)) {
              roomData.timeseries = roomData.timeseries.filter((point) => {
                const pointTime = moment(point.date).format("HH:mm");
                return moment(pointTime, "HH:mm").isBetween(
                  moment(startTime, "HH:mm"),
                  moment(endTime, "HH:mm"),
                  null,
                  "[]"
                );
              });
            } else {
              console.warn("timeseries est manquant ou n'est pas un tableau :", roomData);
              roomData.timeseries = [];
            }
          });
        }

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
      }
    }

    const floorProcessedTimeSeries = label.map((periodLabel) => {
      const floorData: Record<string, number> = {};
      floors.forEach((floor) => {
        const values = aggregatedFloorData[floor.name]?.[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        floorData[floor.name] = values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;
      });
      return floorData;
    });

    averages.push(
      ...floors.map((floor) => {
        const values = Object.values(aggregatedFloorData[floor.name] || {}).flat();
        const sum = values.reduce((acc, val) => acc + val, 0);
        const average = values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;
        return {
          floor: floor.name,
          average,
        };
      })
    );

    console.log("Data sent to the graph:", {
      labels: label,
      timeSeries: floorProcessedTimeSeries,
      averages,
      temporalité: tempo,
    });

    return [label, floorProcessedTimeSeries, averages];
  } catch (error) {
    console.error("Error fetching data:", error);
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

    console.log(`Total surface of meeting rooms: ${totalSurface2.toFixed(2)} m²`);
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
export async function fetchThirdChartOccupationDynamicIds(thirdChartIds) {
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

    console.log('Combined resultsCombined results:', combinedResults);

    const dynamicIds = extractDynamicIds(combinedResults, config.entryPoints[1], processEquipmentEndpoint);
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
  equipmentsByFloor: Record<string, { floorName: string; equipments: string[] }>
): Promise<DynamicIdsByFloor> {
  try {
    console.log('getThirdChartOccupationDynamicIdsByFloor called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return {};
    }

    console.log(`Fetching control endpoints for equipment IDs: ${thirdChartIds}`);

    
    const batchSize = 50;
    const batchedPromises = [];

    for (let i = 0; i < thirdChartIds.length; i += batchSize) {
      const batch = thirdChartIds.slice(i, i + batchSize);
      console.log(batch, 'batch');

      const spinalApi = SpinalAPI.getInstance();
      const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/node/control_endpoint_list_multiple');
      batchedPromises.push(spinalApi.post(url, batch));
    }

    const results = await Promise.all(batchedPromises);

    const combinedResults = results.flatMap(result => result.data);
    console.log('Combined endpoints response:', combinedResults);

    const dynamicIdsByFloor: DynamicIdsByFloor = {};

    const processEquipmentEndpointByFloor = (
      endpoint: { dynamicId: string },
      equipment: Equipment,
      dynamicIdsByFloor: DynamicIdsByFloor,
      equipmentsByFloor: Record<string, { floorName: string; equipments: string[] }>
    ) => {
      if (!equipmentsByFloor || Object.keys(equipmentsByFloor).length === 0) {
        console.error('equipmentsByFloor est vide ou non défini');
        return;
      }

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

    extractDynamicIds(combinedResults, config.entryPoints[1], (endpoint, equipment, dynamicIds, ...extraParams) => {
      processEquipmentEndpointByFloor(endpoint, equipment, dynamicIdsByFloor, equipmentsByFloor);
    });

    console.log('Dynamic IDs by floor:', dynamicIdsByFloor);
    return dynamicIdsByFloor;
  } catch (error) {
    console.error('Error in getThirdChartOccupationDynamicIdsByFloor:', error);
    return {};
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
  console.log('getThirdChartOccupancyDataByFloor called with parameters:', {
    space,
    tempo,
    currentTimestamp,
    thirdChartIds,
    startTime,
    endTime,
  });

  const buildingId = localStorage.getItem("idBuilding");
  console.log('Building ID:', buildingId);

  const spaceArea = await getArea(space);
  console.log('Space area:', spaceArea);

  const periodArray = getPeriodArray(currentTimestamp, tempo);
  console.log('Period array:', periodArray);

  const label = periodArray[0];
  const tooltipDate = periodArray[5];
  const data: any[] = [];
  const averages: { floor: string; average: number }[] = [];

  try {
    const thirdChartPositions = await getThirdChartPositions(thirdChartIds);
    console.log('Third chart positions:', thirdChartPositions);

    const equipmentsByFloor = groupThirdChartsByFloor(thirdChartPositions);
    console.log('Equipments grouped by floor:', equipmentsByFloor);

    if (!equipmentsByFloor || Object.keys(equipmentsByFloor).length === 0) {
      console.error('equipmentsByFloor is undefined or empty:', equipmentsByFloor);
      return [label, data, averages];
    }

    const dynamicIdsByFloor = await getThirdChartOccupationDynamicIdsByFloor(thirdChartIds, equipmentsByFloor);
    console.log('Dynamic IDs by floor:', dynamicIdsByFloor);

    const aggregatedFloorData: AggregatedFloorData = {};
    for (const floor of Object.keys(equipmentsByFloor)) {
      console.log('Processing floor:', floor);

      const dynamicIds = dynamicIdsByFloor[floor];
      console.log('Dynamic IDs for floor:', floor, dynamicIds);

      if (dynamicIds && dynamicIds.length > 0) {
        const batchSize = 50;
        const batchedPromises = [];

        for (let i = 0; i < dynamicIds.length; i += batchSize) {
          const batch = dynamicIds.slice(i, i + batchSize);
          console.log('Processing batch for floor:', floor, batch);

          const spinalApi = SpinalAPI.getInstance();
          const url = spinalApi.createUrlWithPlatformId(
            buildingId!,
            `api/v1/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`
          );
          console.log('Generated URL for batch:', url);

          batchedPromises.push(spinalApi.post(url, batch));
        }

        const results = await Promise.all(batchedPromises);
        console.log('Results for floor:', floor, results);

        let timeSeriesData = results.flatMap(result => result?.data || []);
        console.log('Time series data for floor:', floor, timeSeriesData);

        if (!timeSeriesData || timeSeriesData.length === 0) {
          console.warn('No time series data found for floor:', floor);
          continue;
        }

        // Vérification et filtrage des données avec startTime et endTime
        if (startTime && endTime) {
          console.log('Filtering time series data with startTime and endTime:', { startTime, endTime });

          timeSeriesData.forEach(equipmentData => {
            if (Array.isArray(equipmentData?.timeseries)) {
              equipmentData.timeseries = equipmentData.timeseries.filter(point => {
                const pointTime = moment(point.date).format('HH:mm');
                return moment(pointTime, 'HH:mm').isBetween(
                  moment(startTime, 'HH:mm'),
                  moment(endTime, 'HH:mm'),
                  null,
                  '[]'
                );
              });
            } else {
              console.warn("timeseries is missing or not an array:", equipmentData);
              equipmentData.timeseries = []; // Initialize to an empty array if necessary
            }
          });
        }

        aggregatedFloorData[floor] = {};
        label.forEach(periodLabel => {
          aggregatedFloorData[floor][periodLabel] = [];
        });

        timeSeriesData.forEach(equipmentData => {
          if (Array.isArray(equipmentData.timeseries)) {
            equipmentData.timeseries.forEach(point => {
              const formattedLabel = formatLabel(point.date, tempo);
              if (aggregatedFloorData[floor][formattedLabel]) {
                aggregatedFloorData[floor][formattedLabel].push(point.value);
              }
            });
          }
        });
      }
    }

    console.log('Aggregated floor data:', aggregatedFloorData);

    const floorProcessedTimeSeries = label.map(periodLabel => {
      const floorData: Record<string, number> = {};
      Object.keys(equipmentsByFloor).forEach(floor => {
        const values = aggregatedFloorData[floor]?.[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        floorData[floor] = values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;
      });
      return floorData;
    });

    console.log('Floor processed time series:', floorProcessedTimeSeries);

    averages.push(
      ...Object.keys(equipmentsByFloor).map(floor => {
        const values = Object.values(aggregatedFloorData[floor] || {}).flat();
        const sum = values.reduce((acc, val) => acc + val, 0);
        const average = values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;
        return {
          floor,
          average
        };
      })
    );

    console.log('Averages:', averages);

    return [label, data, averages];
  } catch (e) {
    console.error('Error fetching data:', e);
    return [[], [], []];
  }
}

export async function fetchThirdChartTotalCount(): Promise<number> {
  try {
    const entryPoint = config.entryPoints[1]; // Accéder directement au deuxième élément
    const contextId = await getThirdChartContextId(entryPoint.context);
    const categoryId = await getThirdChartCategoryId(contextId, entryPoint.category);
    const groupId = await getThirdChartGroupId(contextId, categoryId, entryPoint.group);
    const thirdChartIds = await getThirdChartIds(contextId, categoryId, groupId);

    if (!thirdChartIds || thirdChartIds.length === 0) {
      throw new Error('No equipment IDs found');
    }

    console.log('Total Equipment Count:', thirdChartIds.length);
    return thirdChartIds.length;
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

    // Recherche du point de contrôle correspondant
    let occupancyEndpoint: ControlEndpoint | null = null;
    const endpointName = config.entryPoints[2].source[0].name;
    const profileName = config.entryPoints[2].source[0].profileName;

    console.log('Endpoint name from config:', endpointName);
    console.log('Profile name from config:', profileName);

    controlEndpointResponse.data.forEach((profile) => {
      const endpoint = profile.endpoints.find(
        (ep) =>
          ep.name.toLowerCase() === endpointName.toLowerCase() &&
          profile.profileName.toLowerCase() === profileName.toLowerCase()
      );
      if (endpoint) {
        occupancyEndpoint = endpoint;
      }
    });

    if (!occupancyEndpoint) {
      console.error(`No control endpoint found for "${endpointName}" with profile name "${profileName}"`);
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
  tempo: string = 'Journée'
): number[] {
  if (!timeSeriesData || !Array.isArray(timeSeriesData)) {
    console.error('timeSeriesData must be an array');
    return [];
  }

  if (!labels || !Array.isArray(labels)) {
    console.error('labels must be an array');
    return [];
  }

  if (!tempo || typeof tempo !== 'string') {
    console.warn('tempo not provided or invalid, defaulting to Journée');
    tempo = 'Journée';
  }

  console.log('calculateTimeWeightedAverage inputs:', {
    dataLength: timeSeriesData.length,
    labelsLength: labels.length,
    tempo: tempo,
  });

  const weightedAverages: number[] = [];
  const aggregatedData: Record<string, { value: number; timestamp: number }[]> = {};

  // Initialize aggregatedData
  labels.forEach((periodLabel) => {
    aggregatedData[periodLabel] = [];
  });

  // Process data points
  timeSeriesData.forEach((point) => {
    if (!point || !point.date) {
      console.warn('Invalid data point:', point);
      return;
    }

    let formattedLabel: string;
    try {
      formattedLabel =
        tempo === 'Journée' || tempo === 'Valeur Courante'
          ? moment(point.date).format('HH')
          : moment(point.date).format('DD MMM');
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

  // Calculate averages
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

    weightedAverages.push(totalTime > 0 ? +(weightedSum / totalTime).toFixed(2) : 0);
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
): Promise<[string[], ChartData[], any[]]>  {
  try {
        const buildingId = localStorage.getItem("idBuilding");
    const spaceArea = await getArea(space); 
    let periodArray = getPeriodArray(currentTimestamp, tempo);
    const label: string[] = periodArray[0];
    const tooltipDate: string[] = periodArray[5];
    const data: ChartData[] = [];
    
    // 1. Taux d'occupation du bâtiment
    console.log('=== TAUX OCCUPATION BÂTIMENT ===');
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
    
    // Traitement des données du bâtiment
    let buildingProcessedData: number[];
    if (tempo === 'Journée' || tempo === 'Valeur Courante') {
      buildingProcessedData = label.map(hour => {
        const point = occupancyRateData.find(data => 
          moment(data.date).format('HH') === hour
        );
        return point ? parseFloat(point.value).toFixed(2) : 0;
      });
    
      if (tempo === 'Valeur Courante') {
        const currentHour = moment(currentTimestamp).hour();
        buildingProcessedData = buildingProcessedData.slice(0, currentHour + 1);
      }
    } else if (tempo === 'Année') {
      if (startTime && endTime) {
        occupancyRateData = occupancyRateData.filter(point => {
          const pointTime = moment(point.date).format('HH:mm');
          return moment(pointTime, 'HH:mm').isBetween(
            moment(startTime, 'HH:mm'),
            moment(endTime, 'HH:mm'),
            null,
            '[]'
          );
        });
      }
      buildingProcessedData = label.map(month => {
        const pointsForMonth = occupancyRateData.filter(data =>
          moment(data.date).format('MMM') === month
        );
        const total = pointsForMonth.reduce((sum, point) => sum + parseFloat(point.value || 0), 0);
        return pointsForMonth.length > 0 ? (total / pointsForMonth.length).toFixed(2) : 0;
      });
    } else if (tempo === 'Décennie') {
      if (startTime && endTime) {
        occupancyRateData = occupancyRateData.filter(point => {
          const pointTime = moment(point.date).format('HH:mm');
          return moment(pointTime, 'HH:mm').isBetween(
            moment(startTime, 'HH:mm'),
            moment(endTime, 'HH:mm'),
            null,
            '[]'
          );
        });
      }
      buildingProcessedData = label.map(year => {
        const pointsForYear = occupancyRateData.filter(data =>
          moment(data.date).format('YYYY') === year
        );
        const total = pointsForYear.reduce((sum, point) => sum + parseFloat(point.value || 0), 0);
        return pointsForYear.length > 0 ? (total / pointsForYear.length).toFixed(2) : 0;
      });
    } else {
      if (startTime && endTime) {
        occupancyRateData = occupancyRateData.filter(point => {
          const pointTime = moment(point.date).format('HH:mm');
          return moment(pointTime, 'HH:mm').isBetween(
            moment(startTime, 'HH:mm'),
            moment(endTime, 'HH:mm'),
            null,
            '[]'
          );
        });
      }
      buildingProcessedData = calculateTimeWeightedAverage(occupancyRateData, label, tempo);
      
      console.log('Données bâtiment après filtrage:', {
        nombrePoints: occupancyRateData.length,
        échantillon: occupancyRateData.slice(0, 3).map(point => ({
          date: moment(point.date).format('HH:mm'),
          valeur: point.value
        }))
      });
    }
    
    data.push({
      label: config.charts.firstChart.label,
      data: buildingProcessedData,
      tooltipDate: tooltipDate,
      backgroundColor: config.charts.firstChart.backgroundColor,
      borderColor: config.charts.firstChart.borderColor,
      borderWidth: 1,
      fill: false,
    });

    // 2. Taux d'occupation des salles de réunion
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
      console.log('Données salles avant filtrage:', {
        nombrePoints: timeSeriesData.length,
        échantillon: timeSeriesData.slice(0, 3).map(point => ({
          date: moment(point.date).format('HH:mm'),
          valeur: point.value
        }))
      });
      let roomProcessedData: number[];
      if (tempo === 'Journée' || tempo === 'Valeur Courante') {
        const aggregatedData: Record<string, number[]> = {};
        label.forEach(l => aggregatedData[l] = []);

        timeSeriesData.forEach(point => {
          const hourKey = moment(point.date).format('HH');
          if (aggregatedData[hourKey]) {
            aggregatedData[hourKey].push(parseFloat(point.value) || 0);
          }
        });

        roomProcessedData = label.map(hour => {
          const values = aggregatedData[hour] || [];
          return values.length > 0 ? 
            (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '0';
        });

        if (tempo === 'Valeur Courante') {
          const currentHour = moment(currentTimestamp).hour();
          roomProcessedData = roomProcessedData.slice(0, currentHour + 1);
        }
      } else if (tempo === 'Année') {
        if (startTime && endTime) {
          timeSeriesData = timeSeriesData.filter(point => {
            const pointTime = moment(point.date).format('HH:mm');
            return moment(pointTime, 'HH:mm').isBetween(
              moment(startTime, 'HH:mm'),
              moment(endTime, 'HH:mm'),
              null,
              '[]'
            );
          });
        }
        roomProcessedData = label.map(month => {
          const pointsForMonth = timeSeriesData.filter(data =>
            moment(data.date).format('MMM') === month
          );
          const total = pointsForMonth.reduce((sum, point) => sum + parseFloat(point.value || 0), 0);
          return pointsForMonth.length > 0 ? (total / pointsForMonth.length).toFixed(2) : 0;
        });
      } else if (tempo === 'Décennie') {
        if (startTime && endTime) {
          timeSeriesData = timeSeriesData.filter(point => {
            const pointTime = moment(point.date).format('HH:mm');
            return moment(pointTime, 'HH:mm').isBetween(
              moment(startTime, 'HH:mm'),
              moment(endTime, 'HH:mm'),
              null,
              '[]'
            );
          });
        }
        roomProcessedData = label.map(year => {
          const pointsForYear = timeSeriesData.filter(data =>
            moment(data.date).format('YYYY') === year
          );
          const total = pointsForYear.reduce((sum, point) => sum + parseFloat(point.value || 0), 0);
          return pointsForYear.length > 0 ? (total / pointsForYear.length).toFixed(2) : 0;
        });
      } else {
        if (startTime && endTime) {
          timeSeriesData = timeSeriesData.filter(point => {
            const pointTime = moment(point.date).format('HH:mm');
            return moment(pointTime, 'HH:mm').isBetween(
              moment(startTime, 'HH:mm'),
              moment(endTime, 'HH:mm'),
              null,
              '[]'
            );
          });
        }
        roomProcessedData = calculateTimeWeightedAverage(timeSeriesData, label, tempo);
        console.log('Données salles après filtrage:', {
          nombrePoints: timeSeriesData.length,
          échantillon: timeSeriesData.slice(0, 3).map(point => ({
            date: moment(point.date).format('HH:mm'),
            valeur: point.value
          }))
        });
      }

      data.push({
        label: config.charts.secondChart.label,
        data: roomProcessedData,
        tooltipDate: tooltipDate,
        backgroundColor: config.charts.secondChart.backgroundColor,
        borderColor: config.charts.secondChart.backgroundColor,
        borderWidth: 1,
        fill: false,
      });
    }

    // 3. Taux d'occupation des positions de travail
    console.log('=== TAUX OCCUPATION POSITIONS DE TRAVAIL ===');
    const thirdChartContextId = await getThirdChartContextId(config.entryPoints[1].context);
    if (!thirdChartContextId) {
      console.warn('No context ID found for third chart');
      return [label, data, []];
    }

    const thirdChartCategoryId = await getThirdChartCategoryId(thirdChartContextId, config.entryPoints[1].category);
    if (!thirdChartCategoryId) {
      console.warn('No category ID found for third chart');
      return [label, data, []];
    }

    const thirdChartGroupId: string | null = await getThirdChartGroupId(thirdChartContextId, thirdChartCategoryId, config.entryPoints[1].group);
    if (!thirdChartGroupId) {
      console.warn('No group ID found for third chart');
      return [label, data, []];
    }

    const thirdChartIds: string[] = await getThirdChartIds(thirdChartContextId, thirdChartCategoryId, thirdChartGroupId);
    if (!thirdChartIds || thirdChartIds.length === 0) {
      console.warn('No equipment IDs found');
      return [label, data, []];
    }

    const equipmentDynamicIds: string[] = await fetchThirdChartOccupationDynamicIds(thirdChartIds);

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

      console.log('Données positions avant filtrage:', {
        nombrePoints: equipmentTimeSeriesData.length,
        échantillon: equipmentTimeSeriesData.slice(0, 3).map((point: TimeSeriesPoint) => ({
          date: moment(point.date).format('HH:mm'),
          valeur: point.value
        }))
      });

      let equipmentProcessedData;
      if (tempo === 'Journée' || tempo === 'Valeur Courante') {
        const aggregatedData = {};
        label.forEach(l => aggregatedData[l] = []);

        equipmentTimeSeriesData.forEach(point => {
          if (!point.value) return;
          const hourKey = moment(point.date).format('HH');
          if (aggregatedData[hourKey]) {
            aggregatedData[hourKey].push(parseFloat(point.value) || 0);
          }
        });

        equipmentProcessedData = label.map(hour => {
          const values = aggregatedData[hour] || [];
          return values.length > 0 ? 
            (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '0';
        });

        if (tempo === 'Valeur Courante') {
          const currentHour = moment(currentTimestamp).hour();
          equipmentProcessedData = equipmentProcessedData.slice(0, currentHour + 1);
        }
      } else       if (tempo === 'Année') {
        if (startTime && endTime) {
          equipmentTimeSeriesData = equipmentTimeSeriesData.filter(point => {
            const pointTime = moment(point.date).format('HH:mm');
            return moment(pointTime, 'HH:mm').isBetween(
              moment(startTime, 'HH:mm'),
              moment(endTime, 'HH:mm'),
              null,
              '[]'
            );
          });
        }
        equipmentProcessedData = label.map(month => {
          const pointsForMonth = equipmentTimeSeriesData.filter(data =>
            moment(data.date).format('MMM') === month
          );
          const total = pointsForMonth.reduce((sum, point) => sum + parseFloat(point.value || 0), 0);
          return pointsForMonth.length > 0 ? (total / pointsForMonth.length).toFixed(2) : 0;
        });
      } else if (tempo === 'Décennie') {
        if (startTime && endTime) {
          equipmentTimeSeriesData = equipmentTimeSeriesData.filter(point => {
            const pointTime = moment(point.date).format('HH:mm');
            return moment(pointTime, 'HH:mm').isBetween(
              moment(startTime, 'HH:mm'),
              moment(endTime, 'HH:mm'),
              null,
              '[]'
            );
          });
        }
        equipmentProcessedData = label.map(year => {
          const pointsForYear = equipmentTimeSeriesData.filter(data =>
            moment(data.date).format('YYYY') === year
          );
          const total = pointsForYear.reduce((sum, point) => sum + parseFloat(point.value || 0), 0);
          return pointsForYear.length > 0 ? (total / pointsForYear.length).toFixed(2) : 0;
        });
      } else {
        if (startTime && endTime) {
          equipmentTimeSeriesData = equipmentTimeSeriesData.filter(point => {
            if (!point.value) return false;
            const pointTime = moment(point.date).format('HH:mm');
            return moment(pointTime, 'HH:mm').isBetween(
              moment(startTime, 'HH:mm'),
              moment(endTime, 'HH:mm'),
              null,
              '[]'
            );
          });
        }
        equipmentProcessedData = calculateTimeWeightedAverage(equipmentTimeSeriesData, label, tempo);

        console.log('Données positions après filtrage:', {
          nombrePoints: equipmentTimeSeriesData.length,
          échantillon: equipmentTimeSeriesData.slice(0, 3).map(point => ({
            date: moment(point.date).format('HH:mm'),
            valeur: point.value
          }))
        });
      }

      data.push({
        label: config.charts.thirdChart.label,
        data: equipmentProcessedData,
        tooltipDate: tooltipDate,
        backgroundColor: config.charts.thirdChart.backgroundColor,
        borderColor: config.charts.thirdChart.backgroundColor,
        borderWidth: 1,
        fill: false,
      });
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