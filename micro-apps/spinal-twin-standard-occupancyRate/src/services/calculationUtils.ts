import moment from 'moment';
import { DynamicIdsByFloor, Floor, FloorOccupancyMapping, RoomPosition, RoomsByFloor, TimeSeriesPoint } from "../components/interfaces/types";
import { config } from '../config';
import { SpinalAPI } from './spinalAPI/spinalAPI';
import { Context, Endpoint } from '../components/interfaces/types';
import { getBuilding, getFloorOccupancyDynamicIds, getFloors, getFloorSecondChartOccupationDynamicIds, getRoomPositions, groupSecondChartsByFloor } from './index';
import { EntryPoint } from '../components/interfaces/configTypes';
import { apiEndpoints } from '../configConstants'; 




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

export let cachedFloors: Floor[] = [];
export let cachedRoomPositions: RoomPosition[] = [];
export let cachedRoomsByFloor: RoomsByFloor = {};
export let cachedDynamicIdsByFloor: DynamicIdsByFloor = {};
export let cachedDynamicIds: string[] = [];
export let cachedFloorNames: Record<string, string> = {};
export let cachedFloorOccupancyMapping: FloorOccupancyMapping = {};


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

// Fonction pour extraire les IDs dynamiques
export function extractDynamicIds(
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


// Fonction pour traiter les éléments en lots
export async function processInBatches<T>(
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

// Fonction pour traiter les endpoints des bâtiments
export function processBuildingEndpoint(
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
export function processRoomEndpoint(endpoint: Endpoint, room: { dynamicId: string }, dynamicIds: string[]): void {
  dynamicIds.push(endpoint.dynamicId);
}

// Fonction pour traiter les endpoints des équipements
export function processEquipmentEndpoint(endpoint: Endpoint, equipment: { dynamicId: string }, dynamicIds: string[]): void {
  dynamicIds.push(endpoint.dynamicId);
}

// Fonction pour traiter les endpoints des salles par étage
export function processRoomEndpointByFloor(
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
      return parseFloat((sum / pointsForHour.length).toFixed(3));
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

    weightedAverages.push(totalTime > 0 ? +(weightedSum / totalTime).toFixed(3) : 0);
  });

  console.log('calculateTimeWeightedAverage output:', {
    averagesLength: weightedAverages.length,
    sampleValues: weightedAverages.slice(0, 3),
  });

  return weightedAverages;
}

export function calculateBinaryOccupancyRate(
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

  console.log('calculateBinaryOccupancyRate inputs:', {
    dataLength: timeSeriesData.length,
    labelsLength: labels.length,
    tempo: tempo,
  });

  // Traitement spécial pour la temporalité Journée ou Valeur Courante
  if (tempo === 'Journée' || tempo === 'Valeur Courante') {
    return labels.map(hour => {
      const pointsForHour = timeSeriesData.filter(point =>
        moment(point.date).format('HH') === hour
      );

      if (pointsForHour.length === 0) return 0;

      // Calculer le pourcentage d'occupation pour l'heure
      const occupiedCount = pointsForHour.reduce((acc, point) => acc + (point.value === 1 ? 1 : 0), 0);
      return parseFloat(((occupiedCount / pointsForHour.length) * 100).toFixed(3));
    });
  }

  // Pour les autres temporalités, utiliser une moyenne pondérée
  const weightedAverages: number[] = [];
  const aggregatedData: Record<string, { value: number; timestamp: number }[]> = {};

  // Initialiser les données agrégées pour chaque période
  labels.forEach((periodLabel) => {
    aggregatedData[periodLabel] = [];
  });

  // Grouper les points de données par période
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
        value: point.value === 1 ? 1 : 0, // Convertir en binaire explicite
        timestamp: moment(point.date).valueOf(),
      });
    }
  });

  // Calculer les moyennes pondérées pour chaque période
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

    weightedAverages.push(totalTime > 0 ? +(weightedSum / totalTime * 100).toFixed(3) : 0);
  });

  console.log('calculateBinaryOccupancyRate output:', {
    averagesLength: weightedAverages.length,
    sampleValues: weightedAverages.slice(0, 3),
  });

  return weightedAverages;
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