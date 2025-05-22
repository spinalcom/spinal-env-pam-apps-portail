
import lodash from 'lodash';
import 'moment/locale/fr';
import { SpinalAPI } from './spinalAPI/spinalAPI';
export * from './floorOccupancyService';
import { apiEndpoints } from '../configConstants'; 

import {
  Building,
  Floor,
  Space,
  Context,
  Category,
  Group,
  Room,
  CombinedResult,
  FloorOccupancyRate,
  TimeSeriesPoint,
  RoomsByFloor,
  RoomData,
  Equipment,
  DynamicIdsByFloor,
  RoomPosition
} from '../components/interfaces/types';

import { calculateTimeWeightedAverage, getPeriodArray,cachedFloors,cachedRoomsByFloor,cachedDynamicIdsByFloor,
          cachedRoomEntryPoints,cachedEquipmentEntryPoints,filterTimeSeries,
          extractDynamicIds,processInBatches,processRoomEndpointByFloor, 
          calculateBinaryOccupancyRate,
          cachedBuildingEntryPoints} from './calculationUtils';
import { formatLabel} from './secondChartData';
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
/*       console.error("Building ID not found in localStorage");
      return null; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/building/read');
 
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
/*       console.error('idBuilding not found in localStorage');
      return []; */
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
let cachedAreas: Record<string, number> = {};

export async function getArea(space: Space): Promise<number> {
  const cacheKey = `${space.type}-${space.dynamicId || 'building'}`;
  if (cachedAreas[cacheKey]) {
     return cachedAreas[cacheKey];
  }

  try {
     const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error("Building ID not found in localStorage");
      return 0; */
    }

    const spinalApi = SpinalAPI.getInstance();

    if (space.type === 'building') {
       const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/building/read');
      const result = await spinalApi.get(url) as { data: { area: number } };
      cachedAreas[cacheKey] = +result.data.area; // Mettre en cache
      return cachedAreas[cacheKey];
    } else if (space.type === 'floor' && space.dynamicId) {
       const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/floor/${space.dynamicId}/attributes`);
      const result = await spinalApi.get(url) as { data: { attributs: { label: string; value: number }[] } };
      const area = result.data.attributs.find(attr => attr.label === 'area')?.value || 0;
      cachedAreas[cacheKey] = +area; // Mettre en cache
      return cachedAreas[cacheKey];
    }

    console.error("Invalid space type or missing dynamicId for floor");
    return 0;
  } catch (error) {
    console.error("Erreur lors de la récupération de la surface :", error);
    return 0;
  }
}


let cachedContextIds: Record<string, string | null> = {};
let cachedCategoryIds: Record<string, string | null> = {};
let cachedGroupIds: Record<string, string | null> = {};
let cachedRoomIdsByGroup: Record<string, string[]> = {};
// On Récupère l'ID du contexte.
export async function getContextId(contextName: string): Promise<string | null> {
  if (cachedContextIds[contextName]) {
     return cachedContextIds[contextName];
  }

  try {
     const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('idBuilding not found in localStorage');
      return null; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/groupContext/list');
    const response = await spinalApi.get(url) as { data: Context[] };

    const context = response.data.find(item => item.name === contextName);
    const contextId = context ? context.dynamicId : null;

    // Mettre en cache le résultat
    cachedContextIds[contextName] = contextId;

    return contextId;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID du contexte :', error);
    return null;
  }
}

// On Récupère l'ID de la catégorie pour un contexte donné.
export async function getCategoryId(contextId: string, categoryName: string): Promise<string | null> {
  const cacheKey = `${contextId}-${categoryName}`;
  if (cachedCategoryIds[cacheKey]) {
     return cachedCategoryIds[cacheKey];
  }

  try {
     const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
 /*      console.error('idBuilding not found in localStorage');
      return null; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/groupeContext/${contextId}/category_list`);
    const response = await spinalApi.get(url) as { data: Category[] };

    const category = response.data.find(item => item.name === categoryName);
    const categoryId = category ? category.dynamicId : null;

    // Mettre en cache le résultat
    cachedCategoryIds[cacheKey] = categoryId;

    return categoryId;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID de la catégorie :', error);
    return null;
  }
}

// On Récupère l'ID du groupe pour un contexte et une catégorie donnés.
export async function getGroupId(contextId: string, categoryId: string, groupName: string): Promise<string | null> {
  const cacheKey = `${contextId}-${categoryId}-${groupName}`;
  if (cachedGroupIds[cacheKey]) {
    return cachedGroupIds[cacheKey];
  }

  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('idBuilding not found in localStorage');
      return null; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/groupeContext/${contextId}/category/${categoryId}/group_list`);
    const response = await spinalApi.get(url) as { data: Group[] };

    const group = response.data.find(item => item.name === groupName);
    const groupId = group ? group.dynamicId : null;

    // Mettre en cache le résultat
    cachedGroupIds[cacheKey] = groupId;

    return groupId;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID du groupe :', error);
    return null;
  }
}

// On Récupère les IDs des salles pour un contexte, une catégorie et un groupe donnés.
export async function getRoomIds(contextId: string, categoryId: string, groupId: string): Promise<string[]> {
  const cacheKey = `${contextId}-${categoryId}-${groupId}`;
  if (cachedRoomIdsByGroup[cacheKey]) {
    return cachedRoomIdsByGroup[cacheKey];
  }

  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('idBuilding not found in localStorage');
      return []; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/roomsGroup/${contextId}/category/${categoryId}/group/${groupId}/roomList`);
    const response = await spinalApi.get(url) as { data: Room[] };

    const roomIds = response.data.map(room => room.dynamicId);

    // Mettre en cache le résultat
    cachedRoomIdsByGroup[cacheKey] = roomIds;

    return roomIds;
  } catch (error) {
    console.error('Erreur lors de la récupération des IDs des salles :', error);
    return [];
  }
}

// On Récupère les positions des salles données.

export async function getRoomPositions(
  roomIds: string[],
  entryPointName: string
): Promise<RoomPosition[] | null> {
  const buildingId = localStorage.getItem("idBuilding");
  if (!buildingId) {
/*     console.error('idBuilding not found in localStorage');
    return null; */
  }



  try {
    const spinalAPI = SpinalAPI.getInstance();
    const url = spinalAPI.createUrlWithPlatformId(buildingId, 'api/v1/room/get_position_multiple');

    // Diviser les roomIds en lots de 50
    const batchSize = 50;
    const chunkedRoomIds = lodash.chunk(roomIds, batchSize);

    const promises = chunkedRoomIds.map(async (batch) => {
      const response = await (spinalAPI.post as <T>(url: string, body: any) => Promise<{ data: T }>)(url, batch) as { data: RoomPosition[] };
      return response.data;
    });

    const results = await Promise.allSettled(promises);

    const combinedResults = results.reduce<RoomPosition[]>((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.push(...result.value);
      } else {
        console.error(`Error in batch for ${entryPointName}:`, result.reason);
      }
      return acc;
    }, []);

    return combinedResults;
  } catch (error) {
    console.error(`Error in getRoomPositions for ${entryPointName}:`, error);
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

    return roomData;
  } catch (error) {
    console.error('Erreur dans getRoomData :', error);
    return {};
  }
}

// On Regroupe les salles par étage.
export function groupSecondChartsByFloor(
  roomPositions: RoomPosition[],
  entryPointName: string
): RoomsByFloor {
  try {
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

     
    return roomsByFloor;
  } catch (error) {
    console.error(`Error in groupSecondChartsByFloor for ${entryPointName}:`, error);
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
/*       console.error('No building ID found in localStorage');
      return {}; */
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
/*       console.error('No building ID found in localStorage');
      return []; */
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

    

    const labels = getPeriodArray(timestamp, period)[0]; 

    const floorData: FloorOccupancyRate[] = dynamicIds.map(dynamicId => {
      const floorSeries = aggregatedData[dynamicId];

      // Déterminer le type de données (binaire ou continue) à partir des entryPoints
      const entryPoint = cachedBuildingEntryPoints?.find(entry =>
        entry.source.some(source => source.byFloorDisplay && source.type)
      );
      const sourceType = entryPoint?.source.find(source => source.byFloorDisplay)?.type || 'continue';

      // Appliquer la méthode appropriée
      const weightedAverages =
        sourceType === 'binaire'
          ? calculateBinaryOccupancyRate(floorSeries, labels, period)
          : calculateTimeWeightedAverage(floorSeries, labels, period);

      const averageValue =
        weightedAverages.length > 0
          ? weightedAverages.reduce((sum, val) => sum + val, 0) / weightedAverages.length
          : 0;

      return {
        dynamicId,
        occupancy: averageValue.toFixed(3),
      };
    });

    return floorData;
  } catch (error) {
    console.error("Erreur lors de la récupération des taux d'occupation des étages :", error);
    return [];
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



    if (
      cachedFloors.length === 0 ||
      Object.keys(cachedRoomsByFloor).length === 0 ||
      Object.keys(cachedDynamicIdsByFloor).length === 0
    ) {
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
        timeSeriesData.forEach((roomData) => {
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


        // Déterminer le type de données (binaire ou continue) à partir des entryPoints
        const entryPoint = cachedRoomEntryPoints?.find((entry) =>
          entry.source.some((source) => source.byFloorDisplay && source.type)
        );
        const sourceType = entryPoint?.source.find((source) => source.byFloorDisplay)?.type || "continue";


        // Calculer les moyennes pondérées pour chaque étage
        const floorSeries = timeSeriesData.flatMap((roomData) => roomData.timeseries);
        const weightedAverages =
          sourceType === "binaire"
            ? calculateBinaryOccupancyRate(floorSeries, label, tempo)
            : calculateTimeWeightedAverage(floorSeries, label, tempo);


        averages.push({
          floor: floor.name,
          average:
            weightedAverages.length > 0
              ? weightedAverages.reduce((sum, val) => sum + val, 0) / weightedAverages.length
              : 0,
        });
      } else {
      }
    }



    return [label, data, averages];
  } catch (error) {
    console.error("Erreur dans getSecondChartOccupancyDataByFloor :", error);
    return [[], [], []];
  }
}

// On Récupère l'ID du contexte pour un groupe d'équipements.
export async function getThirdChartContextId(contextName: string): Promise<string | null> {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('idBuilding not found in localStorage');
      return null; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/equipementsGroup/list');

    const response = await spinalApi.get(url) as { data: Context[] };
  

    const context = response.data.find(item => item.name === contextName);
 
    return context ? context.dynamicId : null;
  } catch (error) {
    console.error('Error in getThirdChartContextId:', error);
    return null;
  }
}

// On Récupère l'ID de la catégorie pour un contexte d'équipement donné.
export async function getThirdChartCategoryId(contextId: string, categoryName: string): Promise<string | null> {
  try {

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('idBuilding not found in localStorage');
      return null; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, `api/v1/equipementsGroup/${contextId}/category_list`);

    const response = await spinalApi.get(url) as { data: Context[] };


    const category = response.data.find(item => item.name === categoryName);


    return category ? category.dynamicId : null;
  } catch (error) {
    console.error('Error in getThirdChartCategoryId:', error);
    return null;
  }
}

// On Récupère l'ID du groupe pour un contexte et une catégorie d'équipement donnés.
export async function getThirdChartGroupId(contextId: string, categoryId: string, groupName: string): Promise<string | null> {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('idBuilding not found in localStorage');
      return null; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(
      buildingId,
      `api/v1/equipementsGroup/${contextId}/category/${categoryId}/group_list`
    );


    const response = await spinalApi.get(url) as { data: Group[] };

    const group = response.data.find(item => item.name === groupName);


    return group ? group.dynamicId : null;
  } catch (error) {
    console.error('Error in getThirdChartGroupId:', error);
    return null;
  }
}

// On Récupère la liste des équipements pour un contexte, une catégorie et un groupe donnés.
export async function getThirdChartIds(contextId: string, categoryId: string, groupId: string): Promise<string[]> {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
/*       console.error('idBuilding not found in localStorage');
      return []; */
    }

    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(
      buildingId,
      `api/v1/equipementsGroup/${contextId}/category/${categoryId}/group/${groupId}/equipementList`
    );


    const response = await (spinalApi.get as <T>(url: string) => Promise<{ data: T }>)(url) as { data: Equipment[] };

    return response.data.map(equipment => equipment.dynamicId);
  } catch (error) {
    console.error('Error in getThirdChartIds:', error);
    return [];
  }
}

export async function getThirdChartData(): Promise<Record<string, string[]>> {
  try {


    // Vérifier si les equipmentEntryPoints sont initialisés
    if (!cachedEquipmentEntryPoints || cachedEquipmentEntryPoints.length === 0) {
      console.warn("Aucun equipmentEntryPoint valide trouvé. Assurez-vous d'avoir appelé initializeSources.");
      return {};
    }

    // Initialiser un objet pour stocker les IDs des équipements par entryPoint
    const equipmentData: Record<string, string[]> = {};

    // Parcourir tous les entryPoints dans cachedEquipmentEntryPoints
    for (const equipmentEntryPoint of cachedEquipmentEntryPoints) {


      // Récupérer les IDs dynamiques pour le contexte, la catégorie et le groupe
      const contextId = await getThirdChartContextId(equipmentEntryPoint.name);
      if (!contextId) {
        console.warn(`Aucun contexte trouvé pour l'entryPoint : ${equipmentEntryPoint.name}`);
        continue;
      }

      const categoryId = await getThirdChartCategoryId(contextId, equipmentEntryPoint.category);
      if (!categoryId) {
        console.warn(`Aucune catégorie trouvée pour l'entryPoint : ${equipmentEntryPoint.name}`);
        continue;
      }

      const groupId = await getThirdChartGroupId(contextId, categoryId, equipmentEntryPoint.group);
      if (!groupId) {
        console.warn(`Aucun groupe trouvé pour l'entryPoint : ${equipmentEntryPoint.name}`);
        continue;
      }

      const equipmentIds = await getThirdChartIds(contextId, categoryId, groupId);
      if (equipmentIds.length === 0) {
        console.warn(`Aucun équipement trouvé pour l'entryPoint : ${equipmentEntryPoint.name}`);
        continue;
      }

      // Associer les `equipmentIds` à l'`entryPoint`
      equipmentData[equipmentEntryPoint.name] = equipmentIds;
    }


    return equipmentData;
  } catch (error) {
    console.error("Erreur dans getThirdChartData :", error);
    return {};
  }
}

// On Récupère les positions des équipements donnés.
export async function getThirdChartPositions(
  thirdChartIds: string[],
  entryPointName: string
): Promise<any[]> {

  const buildingId = localStorage.getItem("idBuilding");
  if (!buildingId) {
/*     console.error('idBuilding not found in localStorage');
    return []; */
  }


  try {
    const spinalApi = SpinalAPI.getInstance();
    const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/equipment/get_position_multiple');

    // Diviser les thirdChartIds en lots de 50
    const batchSize = 50;
    const chunkedIds = lodash.chunk(thirdChartIds, batchSize);

    // Envoyer les requêtes en parallèle pour chaque lot
    const promises = chunkedIds.map(async (batch) => {
      const response = await (spinalApi.post as <T>(url: string, body: any) => Promise<{ data: T }>)(url, batch) as { data: any[] };
      return response.data;
    });

    // Attendre que toutes les requêtes soient terminées
    const results = await Promise.allSettled(promises);

    // Combiner les résultats des lots réussis
    const combinedResults = results.reduce<any[]>((acc, result) => {
      if (result.status === 'fulfilled') {
        acc.push(...result.value);
      } else {
        console.error(`Error in batch for ${entryPointName}:`, result.reason);
      }
      return acc;
    }, []);

    return combinedResults;
  } catch (error) {
    console.error(`Error in getThirdChartPositions for ${entryPointName}:`, error);
    return [];
  }
}


