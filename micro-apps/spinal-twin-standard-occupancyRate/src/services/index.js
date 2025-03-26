import config from '../../config.js'; 
import { HTTP } from "./http-constants";
import moment from 'moment';

//Récupère les informations sur un bâtiment spécifique.
export async function getBuilding() {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(config.apiEndpoints.building.replace('{buildingId}', buildingId));
  return result.data;
}

// Récupère la liste des étages d'un bâtiment.
export async function getFloors() {
  const buildingId = localStorage.getItem('idBuilding');
  if (!buildingId) {
    console.error('idBuilding not found in localStorage');
    return [];
  }

  try {
    const result = await HTTP.get(config.apiEndpoints.floors.replace('{buildingId}', buildingId));
    console.log("Liste des étages brute :", result.data);

    if (!result.data || result.data.length === 0) {
      console.error('No floors found');
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error in getFloors:', error);
    return [];
  }
}

//Récupère la surface d'un espace (bâtiment ou étage).
async function getArea(space) {
  console.log('Get Area');
  const buildingId = localStorage.getItem("idBuilding");

  if (space.type === 'building') {
    console.log('of building');
    const result = await HTTP.get(config.apiEndpoints.building.replace('{buildingId}', buildingId));
    console.log(result);
    return +result.data.area;
  } else if (space.type === 'floor') {
    let area = await HTTP.get(config.apiEndpoints.floorAttributes.replace('{buildingId}', buildingId).replace('{dynamicId}', space.dynamicId));
    area = area.data[0].attributs[area.data[0].attributs.findIndex(e => e.label === 'area')].value;
    return +area;
  }
}

//Récupère l'ID du contexte pour un bâtiment.
export async function getContextId(contextName) {
  try {
    console.log('getContextId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching context ID for context: ${contextName} in building: ${buildingId}`);
    const response = await HTTP.get(config.apiEndpoints.groupContextList.replace('{buildingId}', buildingId));
    console.log('Response data:', response.data);

    const context = response.data.find(item => item.name === contextName);
    console.log('Context:', context);

    return context ? context.dynamicId : null;
  } catch (error) {
    console.error('Error in getContextId:', error);
    return null;
  }
}

//Récupère l'ID de la catégorie pour un contexte donné.
export async function getCategoryId(contextId, categoryName) {
  try {
    console.log('getCategoryId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching Category ID for context: ${contextId} in building: ${buildingId}`);
    const response = await HTTP.get(config.apiEndpoints.categoryList.replace('{buildingId}', buildingId).replace('{contextId}', contextId));
    console.log('Response data:', response.data);

    const category = response.data.find(item => item.name === categoryName);
    console.log('Category:', category);

    return category ? category.dynamicId : null;
  } catch (error) {
    console.error('Error in getCategoryId:', error);
    return null;
  }
}

// Récupère l'ID du groupe pour un contexte et une catégorie donnés.
export async function getGroupId(contextId, categoryId, groupName) {
  try {
    console.log('getGroupId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching Group ID for context: ${contextId}, category: ${categoryId} in building: ${buildingId}`);
    const response = await HTTP.get(config.apiEndpoints.groupList.replace('{buildingId}', buildingId).replace('{contextId}', contextId).replace('{categoryId}', categoryId));
    console.log('Response data:', response.data);

    const group = response.data.find(item => item.name === groupName);
    console.log('Group:', group);

    return group ? group.dynamicId : null;
  } catch (error) {
    console.error('Error in getGroupId:', error);
    return null;
  }
}

//Récupère les IDs des salles pour un contexte, une catégorie et un groupe donnés.
export async function getRoomIds(contextId, categoryId, groupId) {
  try {
    console.log('getRoomIds called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching Room IDs for context: ${contextId}, category: ${categoryId}, group: ${groupId} in building: ${buildingId}`);
    const response = await HTTP.get(config.apiEndpoints.roomList.replace('{buildingId}', buildingId).replace('{contextId}', contextId).replace('{categoryId}', categoryId).replace('{groupId}', groupId));
    console.log('Response data:', response.data);

    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid response data for room IDs');
      return null;
    }

    return response.data.map(room => room.dynamicId);
  } catch (error) {
    console.error('Error in getRoomIds:', error);
    return null;
  }
}

//Récupère les positions des salles données.
export async function getRoomPositions(roomIds) {
  try {
    console.log('getRoomPositions called');
    console.log('Input Room IDs:', roomIds);
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    const batchSize = 50;
    const batchedPromises = [];

    for (let i = 0; i < roomIds.length; i += batchSize) {
      const batch = roomIds.slice(i, i + batchSize);
      console.log(batch, 'batch');

      batchedPromises.push(
        HTTP.post(config.apiEndpoints.roomPositions.replace('{buildingId}', buildingId), batch)
      );
    }

    // Exécuter les requêtes en parallèle
    const results = await Promise.all(batchedPromises);

    // Combiner les résultats des lots
    const combinedResults = results.flatMap(result => result.data);
    console.log('Combined room positions response:', combinedResults);

    return combinedResults;
  } catch (error) {
    console.error('Error in getRoomPositions:', error);
    return null;
  }
}

function extractDynamicIds(combinedResults, configEntryPoint, processEndpoint, ...extraParams) {
  const dynamicIds = [];
  combinedResults.forEach((endpointsList) => {
    if (endpointsList && Array.isArray(endpointsList)) {
      endpointsList.forEach(item => {
        if (item.endpoints && Array.isArray(item.endpoints)) {
          item.endpoints.forEach(endpoint => {
            if (
              endpoint.name.trim().toLowerCase() === configEntryPoint.source[0].name.trim().toLowerCase() &&
              endpoint.type.trim().toLowerCase() === configEntryPoint.source[0].type.trim().toLowerCase()
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
function processBuildingEndpoint(endpoint, floor, dynamicIds, floorOccupancyMapping) {
  dynamicIds.push(endpoint.dynamicId);
  floorOccupancyMapping[endpoint.dynamicId] = floor.dynamicId;
}

function processRoomEndpoint(endpoint, room, dynamicIds) {
  dynamicIds.push(endpoint.dynamicId);
}

function processEquipmentEndpoint(endpoint, equipment, dynamicIds) {
  dynamicIds.push(endpoint.dynamicId);
}

function processRoomEndpointByFloor(endpoint, room, dynamicIdsByFloor, roomsByFloor) {
  const floorId = Object.keys(roomsByFloor).find(floorId => roomsByFloor[floorId].rooms.includes(room.dynamicId));
  if (floorId) {
    if (!dynamicIdsByFloor[floorId]) {
      dynamicIdsByFloor[floorId] = [];
    }
    dynamicIdsByFloor[floorId].push(endpoint.dynamicId);
  }
}

// Récupère les IDs dynamiques d'occupation pour les étages
export async function getFloorOccupancyDynamicIds() {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('Building ID not found in localStorage');
      return { dynamicIds: [], floorNames: {} };
    }

    // Récupérer la liste des étages
    const floorsResponse = await HTTP.get(config.apiEndpoints.floors.replace('{buildingId}', buildingId));
    const floors = floorsResponse.data;

    if (!floors || floors.length === 0) {
      console.error('Aucun étage trouvé pour ce bâtiment.');
      return { dynamicIds: [], floorNames: {} };
    }
    console.log('Étages récupérés :', floors);

    const floorNames = {};
    const floorDynamicIds = floors.map(floor => {
      floorNames[floor.dynamicId] = floor.name;
      return floor.dynamicId;
    });

    console.log('Correspondance ID → Nom des étages :', floorNames);

    const batchSize = 50;
    const batchedPromises = [];

    for (let i = 0; i < floorDynamicIds.length; i += batchSize) {
      const batch = floorDynamicIds.slice(i, i + batchSize);
      console.log(batch, 'batch');

      batchedPromises.push(
        HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), batch)
      );
    }

    const results = await Promise.all(batchedPromises);

    const combinedResults = results.flatMap(result => result.data);
    console.log('Combined endpoints response:', combinedResults);

    const floorOccupancyMapping = {};
    const dynamicIds = extractDynamicIds(combinedResults, config.entryPoints[0], processBuildingEndpoint, floorOccupancyMapping);

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

// Récupère les taux d'occupation des étages par période
export async function getFloorOccupancyRatesByPeriod(period, timestamp, dynamicIds) {
  try {
    const buildingId = localStorage.getItem('idBuilding');
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    const periodArray = getPeriodArray(timestamp, period);

    const batchSize = 50;
    const batchedPromises = [];

    for (let i = 0; i < dynamicIds.length; i += batchSize) {
      const batch = dynamicIds.slice(i, i + batchSize);
      console.log(batch, 'batch');

      batchedPromises.push(
        HTTP.post(
          config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
          batch
        )
      );
    }

    const results = await Promise.all(batchedPromises);

    const combinedResults = results.flatMap(result => result.data);
    console.log('Combined time series response:', combinedResults);

    const aggregatedData = {};
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

    console.log('Aggregated data:', aggregatedData);

    const floorData = dynamicIds.map(dynamicId => {
      const floorSeries = aggregatedData[dynamicId];
      const totalValue = floorSeries.reduce((sum, point) => sum + point.value, 0);
      const averageValue = floorSeries.length > 0 ? (totalValue / floorSeries.length).toFixed(2) : 0;
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


//Récupère les IDs dynamiques d'occupation pour les salles données.
export async function fetchSecondChartOccupationDynamicIds(roomIds) {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    const batchSize = 50;
    const batchedPromises = [];
    for (let i = 0; i < roomIds.length; i += batchSize) {
      const batch = roomIds.slice(i, i + batchSize);
      batchedPromises.push(
        HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), batch)
      );
    }

    const results = await Promise.all(batchedPromises);
    const combinedResults = results.flatMap(result => result.data);

    const dynamicIds = extractDynamicIds(combinedResults, config.entryPoints[1], processRoomEndpoint);

    return dynamicIds;
  } catch (error) {
    console.error('Error in fetchSecondChartOccupationDynamicIds:', error);
    return [];
  }
}
//Regroupe les salles par étage.
export function groupSecondChartsByFloor(roomPositions) {
  try {
    console.log('Grouping rooms by floor');
    const roomsByFloor = {};
    roomPositions.forEach(room => {
      const floorId = room.info?.floor?.dynamicId;
      const floorName = room.info?.floor?.name;

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
export async function getFloorSecondChartOccupationDynamicIds(roomIds, roomsByFloor) {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return {};
    }

    const batchSize = 50;
    const batchedPromises = [];
    for (let i = 0; i < roomIds.length; i += batchSize) {
      const batch = roomIds.slice(i, i + batchSize);
      batchedPromises.push(
        HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), batch)
      );
    }

    const results = await Promise.all(batchedPromises);
    const combinedResults = results.flatMap(result => result.data);

    const dynamicIdsByFloor = {};
    extractDynamicIds(combinedResults, config.entryPoints[1], (endpoint, room) => processRoomEndpointByFloor(endpoint, room, dynamicIdsByFloor, roomsByFloor));

    return dynamicIdsByFloor;
  } catch (error) {
    console.error('Error in getFloorSecondChartOccupationDynamicIds:', error);
    return {};
  }
}


//Récupère les données d'occupation par étage.
export async function getSecondChartOccupancyDataByFloor(space, tempo, currentTimestamp, roomIds) {
  const buildingId = localStorage.getItem("idBuilding");
  const spaceArea = await getArea(space); 
  let periodArray = getPeriodArray(currentTimestamp, tempo);
  let label = periodArray[0];
  let tooltipDate = periodArray[5];
  let data = [];
  let averages = [];
  let timeSeries;

  try {
    console.log('Fetching floors for building:', buildingId);
    const floors = await getFloors([{ name: 'nom_du_cp' }]); 
    console.log('Floors fetched:', floors);

    const roomPositions = await getRoomPositions(roomIds);
    const roomsByFloor = groupSecondChartsByFloor(roomPositions);
    console.log('Rooms grouped by floor:', roomsByFloor);

    const dynamicIdsByFloor = await getFloorSecondChartOccupationDynamicIds(roomIds, roomsByFloor);
    console.log('Dynamic IDs by floor:', dynamicIdsByFloor);

    console.log('Period array from index index:', periodArray);
    console.log('Start date from index index:', periodArray[1]); 
    console.log('End date from index index:', periodArray[2]); 

    const aggregatedFloorData = {};
    for (const floor of floors) {
      const dynamicIds = dynamicIdsByFloor[floor.dynamicId];
      if (dynamicIds && dynamicIds.length > 0) {
        console.log(`Fetching time series data for floor: ${floor.name}`);

        const batchSize = 50;
        const batchedPromises = [];

        for (let i = 0; i < dynamicIds.length; i += batchSize) {
          const batch = dynamicIds.slice(i, i + batchSize);
          console.log(batch, 'batch');

          batchedPromises.push(
            HTTP.post(
              config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
              batch
            )
          );
        }

        const results = await Promise.all(batchedPromises);

        const timeSeriesData = results.flatMap(result => result.data);
        console.log(`Time series data for floor ${floor.name}:`, timeSeriesData);

        aggregatedFloorData[floor.name] = {};
        label.forEach(periodLabel => {
          aggregatedFloorData[floor.name][periodLabel] = [];
        });

        timeSeriesData.forEach(roomData => {
          roomData.timeseries.forEach(point => {
            let formattedLabel;
            switch (tempo) {
              case 'Journée':
              case 'Valeur Courante':
                formattedLabel = moment(point.date).format('HH');
                break;
              case 'Semaine':
                formattedLabel = moment(point.date).format('DD MMM');
                break;
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
            if (aggregatedFloorData[floor.name][formattedLabel]) {
              aggregatedFloorData[floor.name][formattedLabel].push(point.value);
            }
          });
        });
      } else {
        console.log(`No dynamic IDs found for floor: ${floor.name}`);
      }
    }
    console.log('Aggregated floor data:', aggregatedFloorData);

    const floorProcessedTimeSeries = label.map(periodLabel => {
      const floorData = {};
      floors.forEach(floor => {
        const values = aggregatedFloorData[floor.name]?.[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        floorData[floor.name] = values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      });
      return floorData;
    });
    console.log('Processed time series data for floors:', floorProcessedTimeSeries);

    const averages = floors.map(floor => {
      const values = Object.values(aggregatedFloorData[floor.name] || {}).flat();
      const sum = values.reduce((acc, val) => acc + val, 0);
      const average = values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      return {
        floor: floor.name,
        average: parseFloat(average)
      };
    });
    console.log('Average occupancy rates for floors:', averages);
    return [label, data, averages];

  } catch (e) {
    console.error('Error fetching data:', e);
    return [null, null, []];
  }
}

// Récupère la surface totale des salles données.
export async function getTotalSurface2(roomIds) {
  try {
    console.log('Fetching total surface for rooms');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log('Building ID:', buildingId);
    console.log('Room IDs:', roomIds);

    const batchSize = 50;
    const batchedPromises = [];

    for (let i = 0; i < roomIds.length; i += batchSize) {
      const batch = roomIds.slice(i, i + batchSize);
      console.log(batch, 'batch');

      batchedPromises.push(
        HTTP.post(
          config.apiEndpoints.attributeListMultiple.replace('{buildingId}', buildingId),
          batch
        )
      );
    }

    const results = await Promise.all(batchedPromises);

    const combinedResults = results.flatMap(result => result.data);
    console.log('Combined attribute data:', combinedResults);

    let totalSurface2 = 0; 
    combinedResults.forEach(room => {
      const category = room.categoryAttributes.find(cat => cat.name === "Spatial");
      if (category && category.attributs) {
        const areaAttribute = category.attributs.find(attr => attr.label === "area");
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
// Récupère l'ID du contexte pour un groupe d'équipements.
export async function getThirdChartContextId(contextName) {
  try {
    console.log('getThirdChartContextId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching equipment context ID for context: ${contextName} in building: ${buildingId}`);
    const response = await HTTP.get(config.apiEndpoints.equipmentContextList.replace('{buildingId}', buildingId));
    console.log('Response data:', response.data);

    const context = response.data.find(item => item.name === contextName);
    console.log('Context:', context);

    return context ? context.dynamicId : null;
  } catch (error) {
    console.error('Error in getThirdChartContextId:', error);
    return null;
  }
}

// Récupère l'ID de la catégorie pour un contexte d'équipement donné.
export async function getThirdChartCategoryId(contextId, categoryName) {
  try {
    console.log('getThirdChartCategoryId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching Category ID for context: ${contextId} in building: ${buildingId}`);
    const response = await HTTP.get(config.apiEndpoints.equipmentCategoryList.replace('{buildingId}', buildingId).replace('{contextId}', contextId));
    console.log('Response data:', response.data);

    const category = response.data.find(item => item.name === categoryName);
    console.log('Category:', category);

    return category ? category.dynamicId : null;
  } catch (error) {
    console.error('Error in getThirdChartCategoryId:', error);
    return null;
  }
}
// Récupère l'ID du groupe pour un contexte et une catégorie d'équipement donnés.
export async function getThirdChartGroupId(contextId, categoryId, groupName) {
  try {
    console.log('getThirdChartGroupId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching Group ID for context: ${contextId}, category: ${categoryId} in building: ${buildingId}`);
    const response = await HTTP.get(config.apiEndpoints.equipmentGroupList.replace('{buildingId}', buildingId).replace('{contextId}', contextId).replace('{categoryId}', categoryId));
    console.log('Response data:', response.data);

    const group = response.data.find(item => item.name === groupName);
    console.log('Group:', group);

    return group ? group.dynamicId : null;
  } catch (error) {
    console.error('Error in getThirdChartGroupId:', error);
    return null;
  }
}

// Récupère la liste des équipements pour un contexte, une catégorie et un groupe donnés.
export async function getThirdChartIds(contextId, categoryId, groupId) {
  try {
    console.log('getThirdChartIds called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return [];
    }

    console.log(`Fetching Equipment IDs for context: ${contextId}, category: ${categoryId}, group: ${groupId} in building: ${buildingId}`);
    const response = await HTTP.get(config.apiEndpoints.equipmentList.replace('{buildingId}', buildingId).replace('{contextId}', contextId).replace('{categoryId}', categoryId).replace('{groupId}', groupId));
    console.log('Response dataazs:', response.data);

    return response.data.map(equipment => equipment.dynamicId);
  } catch (error) {
    console.error('Error in getThirdChartIds:', error);
    return [];
  }
}

// Récupère les positions des équipements donnés.
export async function getThirdChartPositions(thirdChartIds) {
  try {
    console.log('getThirdChartPositions called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching positions for equipment IDs: ${thirdChartIds}`);
    const response = await HTTP.post(config.apiEndpoints.thirdChartPositions.replace('{buildingId}', buildingId), thirdChartIds);
    console.log('Equipment positions:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error in getThirdChartPositions:', error);
    return null;
  }
}

// Récupère les IDs dynamiques d'occupation pour les équipements donnés.
export async function fetchThirdChartOccupationDynamicIds(thirdChartIds) {
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    const batchSize = 50;
    const batchedPromises = [];
    for (let i = 0; i < thirdChartIds.length; i += batchSize) {
      const batch = thirdChartIds.slice(i, i + batchSize);
      batchedPromises.push(
        HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), batch)
      );
    }

    const results = await Promise.all(batchedPromises);
    const combinedResults = results.flatMap(result => result.data);

    const dynamicIds = extractDynamicIds(combinedResults, config.entryPoints[2], processEquipmentEndpoint);

    return dynamicIds;
  } catch (error) {
    console.error('Error in fetchThirdChartOccupationDynamicIds:', error);
    return [];
  }
}

// Regroupe les équipements par étage.
export function groupThirdChartsByFloor(thirdChartPositions) {
  try {
    console.log('Grouping equipments by floor');
    const equipmentsByFloor = {};
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

// Récupère les IDs dynamiques des points de contrôle de taux d'occupation pour les équipements par étage.
export async function getThirdChartOccupationDynamicIdsByFloor(thirdChartIds, equipmentsByFloor) {
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

      batchedPromises.push(
        HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), batch)
      );
    }

    const results = await Promise.all(batchedPromises);

    const combinedResults = results.flatMap(result => result.data);
    console.log('Combined endpoints response:', combinedResults);

    const dynamicIdsByFloor = {};

    combinedResults.forEach((equipmentEndpointsList) => {
      if (equipmentEndpointsList && Array.isArray(equipmentEndpointsList)) {
        equipmentEndpointsList.forEach(equipment => {
          if (equipment.endpoints && Array.isArray(equipment.endpoints)) {
            equipment.endpoints.forEach(endpoint => {
              if (
                endpoint.name.trim().toLowerCase() === config.entryPoints[2].source[0].name.trim().toLowerCase() &&
                endpoint.type.trim().toLowerCase() === config.entryPoints[2].source[0].type.trim().toLowerCase()
              ) {
                const floorId = Object.keys(equipmentsByFloor).find(floorId => equipmentsByFloor[floorId].equipments.includes(equipment.dynamicId));
                if (floorId) {
                  if (!dynamicIdsByFloor[floorId]) {
                    dynamicIdsByFloor[floorId] = [];
                  }
                  dynamicIdsByFloor[floorId].push(endpoint.dynamicId);
                }
              }
            });
          }
        });
      }
    });

    console.log('Dynamic IDs by floor:', dynamicIdsByFloor);
    return dynamicIdsByFloor;
  } catch (error) {
    console.error('Error in getThirdChartOccupationDynamicIdsByFloor:', error);
    return {};
  }
}

// Récupère les données de séries temporelles pour les équipements par étage.
export async function getThirdChartOccupancyDataByFloor(space, tempo, currentTimestamp, thirdChartIds) {
  const buildingId = localStorage.getItem("idBuilding");
  const spaceArea = await getArea(space); 
  let periodArray = getPeriodArray(currentTimestamp, tempo);
  let label = periodArray[0];
  let tooltipDate = periodArray[5];
  let data = [];
  let averages = [];
  let timeSeries;

  try {
    const thirdChartPositions = await getThirdChartPositions(thirdChartIds);

    const equipmentsByFloor = groupThirdChartsByFloor(thirdChartPositions);
    console.log('Equipments grouped by floor:', equipmentsByFloor);

    const dynamicIdsByFloor = await getThirdChartOccupationDynamicIdsByFloor(thirdChartIds, equipmentsByFloor);
    console.log('Dynamic IDs by floor:', dynamicIdsByFloor);

    const aggregatedFloorData = {};
    for (const floor of Object.keys(equipmentsByFloor)) {
      const dynamicIds = dynamicIdsByFloor[floor];
      if (dynamicIds && dynamicIds.length > 0) {
        console.log(`Fetching time series data for floor: ${floor}`);

        const batchSize = 50;
        const batchedPromises = [];

        for (let i = 0; i < dynamicIds.length; i += batchSize) {
          const batch = dynamicIds.slice(i, i + batchSize);
          console.log(batch, 'batch');

          batchedPromises.push(
            HTTP.post(
              config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
              batch
            )
          );
        }

        const results = await Promise.all(batchedPromises);

        const timeSeriesData = results.flatMap(result => result.data);
        console.log(`Time series data for floor ${floor}:`, timeSeriesData);

        aggregatedFloorData[floor] = {};
        label.forEach(periodLabel => {
          aggregatedFloorData[floor][periodLabel] = [];
        });

        timeSeriesData.forEach(equipmentData => {
          if (equipmentData.timeseries) {
            equipmentData.timeseries.forEach(point => {
              let formattedLabel;
              switch (tempo) {
                case 'Journée':
                case 'Valeur Courante':
                  formattedLabel = moment(point.date).format('HH');
                  break;
                case 'Semaine':
                  formattedLabel = moment(point.date).format('DD MMM');
                  break;
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
      const floorData = {};
      Object.keys(equipmentsByFloor).forEach(floor => {
        const values = aggregatedFloorData[floor]?.[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        floorData[floor] = values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      });
      return floorData;
    });
    console.log('Processed time series data for floors:', floorProcessedTimeSeries);

    const averages = Object.keys(equipmentsByFloor).map(floor => {
      const values = Object.values(aggregatedFloorData[floor] || {}).flat();
      const sum = values.reduce((acc, val) => acc + val, 0);
      const average = values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      return {
        floor,
        average: parseFloat(average)
      };
    });
    console.log('Average occupancy rates for floors:', averages);
    return [label, data, averages];

  } catch (e) {
    console.error('Error fetching data:', e);
    return [null, null, []];
  }
}



//Récupère les données de graphe pour un bâtiment.
export async function getGraphData() {
  try {
    console.log('getGraphData called');
    const buildingId = localStorage.getItem("idBuilding");
    const result = await HTTP.get(config.apiEndpoints.building.replace('{buildingId}', buildingId));
    console.log('Building data:', result.data);

    let controlEndpointResponse = await HTTP.get(config.apiEndpoints.controlEndpointList.replace('{buildingId}', buildingId).replace('{dynamicId}', result.data.dynamicId));
    console.log('Control endpoint response data:', controlEndpointResponse.data);

    let occupancyEndpoint = null;
    const endpointName = config.entryPoints[2].source[0].name;
    const endpointType = config.entryPoints[2].source[0].type;

    console.log('Endpoint name from config:', endpointName);
    console.log('Endpoint type from config:', endpointType);

    controlEndpointResponse.data.forEach((profile) => {
      const endpoint = profile.endpoints.find(
        (ep) => ep.name.toLowerCase() === endpointName && ep.type === endpointType
      );
      if (endpoint) {
        occupancyEndpoint = endpoint;
      }
    });

    if (!occupancyEndpoint) {
      console.error(`No control endpoint found for "${endpointName}"`);
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

function calculateTimeWeightedAverage(timeSeriesData, labels, tempo) {
  let weightedAverages = [];
  let aggregatedData = {};
  labels.forEach(periodLabel => {
    aggregatedData[periodLabel] = [];
  });

  timeSeriesData.forEach(point => {
    let formattedLabel = tempo === 'Journée' || tempo === 'Valeur Courante'
      ? moment(point.date).format('HH')
      : moment(point.date).format('DD MMM');
    if (aggregatedData[formattedLabel]) {
      aggregatedData[formattedLabel].push({ value: point.value, timestamp: moment(point.date).valueOf() });
    }
  });

  labels.forEach(periodLabel => {
    const values = aggregatedData[periodLabel] || [];
    if (values.length < 2) {
      weightedAverages.push(0);
      return;
    }

    let totalTime = 0;
    let weightedSum = 0;

    for (let i = 0; i < values.length - 1; i++) {
      let deltaTime = values[i + 1].timestamp - values[i].timestamp;
      totalTime += deltaTime;
      weightedSum += values[i].value * deltaTime;
    }

    weightedAverages.push(totalTime > 0 ? (weightedSum / totalTime).toFixed(2) : 0);
  });

  return weightedAverages;
}


export async function getData(space, tempo, currentTimestamp, roomIds, startTime = null, endTime = null) {
  const buildingId = localStorage.getItem("idBuilding");
  const spaceArea = await getArea(space); 
  let periodArray = getPeriodArray(currentTimestamp, tempo);
  let label = periodArray[0];
  let tooltipDate = periodArray[5];
  let data = [];
  let timeSeries;

  try {
    // 1. Taux d'occupation du bâtiment
    console.log('Fetching occupancy dynamic ID');
    const occupancyDynamicId = await getGraphData();
    if (!occupancyDynamicId) {
      throw new Error('Occupancy dynamic ID not found');
    }

    console.log('Fetching occupancy rate data');
    timeSeries = await HTTP.get(
      config.apiEndpoints.timeSeries.replace('{buildingId}', buildingId).replace('{dynamicId}', occupancyDynamicId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2])
    );
    let occupancyRateData = timeSeries.data;
    console.log('Occupancy rate data:', occupancyRateData);

    // Filtrer les données en fonction des heures spécifiques pour toutes les temporalités sauf "Journée" et "Valeur Courante"
    if (startTime && endTime && tempo !== 'Journée' && tempo !== 'Valeur Courante') {
      const start = moment(startTime, 'HH:mm');
      const end = moment(endTime, 'HH:mm');
      occupancyRateData = occupancyRateData.filter(point => {
        const pointTime = moment(point.date).format('HH:mm');
        return moment(pointTime, 'HH:mm').isBetween(start, end, null, '[]');
      });
    }

    let processedTimeSeries = [];

    if (tempo === 'Valeur Courante') {
      const currentHour = moment(currentTimestamp).hour();
      processedTimeSeries = label.map(hour => {
        const value = occupancyRateData.find(elem => moment(elem.date).format('HH') === hour)?.value || 0;
        return parseFloat(value).toFixed(2);
      }).filter((_, index) => index <= currentHour);
    } else if (tempo === 'Journée') {
      processedTimeSeries = label.map(hour => {
        const value = occupancyRateData.find(elem => moment(elem.date).format('HH') === hour)?.value || 0;
        return parseFloat(value).toFixed(2);
      });
    } else if (tempo === 'Année') {
      processedTimeSeries = label.map(month => {
        const value = occupancyRateData.find(elem => moment(elem.date).format('MMM') === month)?.value || 0;
        return parseFloat(value).toFixed(2);
      });
    } else {
      processedTimeSeries = calculateTimeWeightedAverage(occupancyRateData, label, tempo);
    }

    // Calcul des moyennes globales avec pondération temporelle
    const totalTime = occupancyRateData.reduce((acc, current, index, arr) => {
      if (index === arr.length - 1) return acc;
      return acc + (arr[index + 1].timestamp - current.timestamp);
    }, 0);

    const weightedSum = occupancyRateData.reduce((acc, current, index, arr) => {
      if (index === arr.length - 1) return acc;
      const deltaTime = arr[index + 1].timestamp - current.timestamp;
      return acc + (current.value * deltaTime);
    }, 0);

    const average = +(weightedSum / totalTime).toFixed(1);
    const normalizedValue = +(weightedSum / (totalTime * spaceArea)).toFixed(1);

    data.push({
      label: config.charts.firstChart.label,
      data: processedTimeSeries,
      backgroundColor: config.charts.firstChart.backgroundColor,
      borderColor: config.charts.firstChart.borderColor,
      borderWidth: 1,
      fill: false,
    });

    // Stocker les données non filtrées
    localStorage.setItem('unfilteredData', JSON.stringify(data));

    // 2. Taux d'occupation des salles de réunion
    console.log('Fetching dynamic IDs using fetchSecondChartOccupationDynamicIds');
    const dynamicIds = await fetchSecondChartOccupationDynamicIds(roomIds);
    if (dynamicIds.length > 0) {
      console.log('Period array from index:', periodArray); 
      console.log('Start date from index:', periodArray[1]);
      console.log('End date from index:', periodArray[2]);

      const batchSize = 50;
      const batchedPromises = [];

      for (let i = 0; i < dynamicIds.length; i += batchSize) {
        const batch = dynamicIds.slice(i, i + batchSize);
        console.log(batch, 'batch');

        batchedPromises.push(
          HTTP.post(
            config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
            batch
          )
        );
      }

      const results = await Promise.all(batchedPromises);

      let timeSeriesData = results.map(result => result.data).flat();
      console.log('Time series data for meeting rooms:', timeSeriesData);

      // Filtrer les données en fonction des heures spécifiques pour toutes les temporalités sauf "Journée" et "Valeur Courante"
      if (startTime && endTime && tempo !== 'Journée' && tempo !== 'Valeur Courante') {
        const start = moment(startTime, 'HH:mm');
        const end = moment(endTime, 'HH:mm');
        timeSeriesData = timeSeriesData.filter(point => {
          const pointTime = moment(point.date).format('HH:mm');
          return moment(pointTime, 'HH:mm').isBetween(start, end, null, '[]');
        });
      }

      let aggregatedRoomData = {};
      label.forEach(periodLabel => {
        aggregatedRoomData[periodLabel] = [];
      });

      timeSeriesData.forEach(roomData => {
        if (roomData.timeseries) { 
          roomData.timeseries.forEach(point => {
            let formattedLabel = tempo === 'Journée' || tempo === 'Valeur Courante'
              ? moment(point.date).format('HH')
              : moment(point.date).format('DD MMM');
            if (aggregatedRoomData[formattedLabel]) {
              aggregatedRoomData[formattedLabel].push(point.value);
            }
          });
        }
      });

      // Moyenne des salles de réunion
      const roomProcessedTimeSeries = label.map(periodLabel => {
        const values = aggregatedRoomData[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        return values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      }).filter((_, index) => tempo === 'Valeur Courante' ? index <= moment(currentTimestamp).hour() : true);

      data.push({
        label: config.charts.secondChart.label,
        data: roomProcessedTimeSeries,
        backgroundColor: config.charts.secondChart.backgroundColor,
        borderColor: config.charts.secondChart.backgroundColor,
        borderWidth: 1,
        fill: false,
      });
    }

    // 3. Taux d'occupation des équipements
    console.log('Fetching equipment dynamic IDs');
    const thirdChartEntryPoint = config.entryPoints[1]; // Accéder directement au deuxième élément
    const thirdChartContextId = await getThirdChartContextId(thirdChartEntryPoint.context);
    const thirdChartCategoryId = await getThirdChartCategoryId(thirdChartContextId, thirdChartEntryPoint.category);
    const thirdChartGroupId = await getThirdChartGroupId(thirdChartContextId, thirdChartCategoryId, thirdChartEntryPoint.group);
    const thirdChartIds = await getThirdChartIds(thirdChartContextId, thirdChartCategoryId, thirdChartGroupId);

    console.log('thirdChart IDs:', thirdChartIds);

    const equipmentDynamicIds = await fetchThirdChartOccupationDynamicIds(thirdChartIds);
    if (equipmentDynamicIds.length > 0) {
      console.log('Fetching time series data for equipment');

      const batchSize = 50;
      const batchedPromises = [];

      for (let i = 0; i < equipmentDynamicIds.length; i += batchSize) {
        const batch = equipmentDynamicIds.slice(i, i + batchSize);
        console.log(batch, 'batch');

        batchedPromises.push(
          HTTP.post(
            config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
            batch
          )
        );
      }

      let equipmentTimeSeriesData = await Promise.all(batchedPromises).then(results => results.map(result => result.data).flat());
      console.log('Time series data for equipment:', equipmentTimeSeriesData);

      // Filtrer les données en fonction des heures spécifiques pour toutes les temporalités sauf "Journée" et "Valeur Courante"
      if (startTime && endTime && tempo !== 'Journée' && tempo !== 'Valeur Courante') {
        const start = moment(startTime, 'HH:mm');
        const end = moment(endTime, 'HH:mm');
        equipmentTimeSeriesData = equipmentTimeSeriesData.filter(point => {
          const pointTime = moment(point.date).format('HH:mm');
          return moment(pointTime, 'HH:mm').isBetween(start, end, null, '[]');
        });
      }

      let aggregatedEquipmentData = {};
      label.forEach(periodLabel => {
        aggregatedEquipmentData[periodLabel] = [];
      });

      equipmentTimeSeriesData.forEach(equipmentData => {
        if (equipmentData.timeseries) { // Ajout de cette vérification
          equipmentData.timeseries.forEach(point => {
            let formattedLabel = tempo === 'Journée' || tempo === 'Valeur Courante'
              ? moment(point.date).format('HH')
              : moment(point.date).format('DD MMM');
            if (aggregatedEquipmentData[formattedLabel]) {
              aggregatedEquipmentData[formattedLabel].push(point.value);
            }
          });
        }
      });

      // Moyenne des équipements
      const equipmentProcessedTimeSeries = label.map(periodLabel => {
        const values = aggregatedEquipmentData[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        return values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      }).filter((_, index) => tempo === 'Valeur Courante' ? index <= moment(currentTimestamp).hour() : true);

      data.push({
        label: config.charts.thirdChart.label,
        data: equipmentProcessedTimeSeries,
        backgroundColor: config.charts.thirdChart.backgroundColor,
        borderColor: config.charts.thirdChart.backgroundColor,
        borderWidth: 1,
        fill: false,
      });
    }

    return [label, data, []];

  } catch (e) {
    console.error('Error fetching data:', e);
    return [null, null, []];
  }
}

export function getPeriodArray(timestamp, period) {
  if (period === 'Journée' || period === 'Valeur Courante') {
    var startOfDay = moment(timestamp).startOf('day');
    var endOfDay = moment(timestamp).endOf('day');
    var hoursInDay = [];
    var tooltipDate = [];
    var currentHour = moment(startOfDay);
    while (currentHour.isSameOrBefore(endOfDay)) {
      hoursInDay.push(currentHour.format('HH'));
      tooltipDate.push(moment(currentHour).format('ddd DD/MM/YYYY HH:mm').slice(0, 1).toUpperCase() + moment(currentHour).format('ddd DD/MM/YYYY HH:mm').slice(1));
      currentHour.add(1, 'hour');
    }
    
    return [hoursInDay,
      moment(timestamp).startOf('day').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('day').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'day').startOf('day').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'day').endOf('day').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate
    ];
  } else if (period === 'Semaine') {
    var startOfWeek = moment(timestamp).startOf('week');
    var endOfWeek = moment(timestamp).endOf('week');
    var daysInMonth = [];
    var abstractDaysInMonth = [];
    var tooltipDate = [];
    var currentDay = moment(startOfWeek);
    while (currentDay.isSameOrBefore(endOfWeek)) {
      daysInMonth.push(currentDay.format('DD MMM'));
      abstractDaysInMonth.push(currentDay.format('dddd').slice(0, 1).toUpperCase() + currentDay.format('dddd').slice(1));
      tooltipDate.push(moment(currentDay).format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() + moment(currentDay).format('ddd DD/MM/YYYY').slice(1));
      currentDay.add(1, 'day');
    }
    return [daysInMonth,
      moment(timestamp).startOf('week').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('week').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'weeks').startOf('week').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'weeks').endOf('week').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate,
      abstractDaysInMonth
    ];
  } else if (period === 'Mois') {
    var startOfMonth = moment(timestamp).startOf('month');
    var endOfMonth = moment(timestamp).endOf('month');
    var daysInMonth = [];
    var abstractDaysInMonth = [];
    var tooltipDate = [];
    var currentDay = moment(startOfMonth);
    while (currentDay.isSameOrBefore(endOfMonth)) {
      abstractDaysInMonth.push(currentDay.format('DD'));
      daysInMonth.push(currentDay.format('DD MMM'));
      tooltipDate.push(moment(currentDay).format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() + moment(currentDay).format('ddd DD/MM/YYYY').slice(1));
      currentDay.add(1, 'day');
    }
    return [daysInMonth,
      moment(timestamp).startOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'months').startOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'months').endOf('month').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate,
      abstractDaysInMonth
    ];
  } else if (period === 'Année') {
    var monthsInYear = [];
    var tooltipDate = [];
    for (var i = 0; i < 12; i++) {
      var currentMonth = moment(timestamp).month(i);
      monthsInYear.push(currentMonth.format('MMM'));
      tooltipDate.push(moment(currentMonth).format('MMMM/YYYY').slice(0, 1).toUpperCase() + moment(currentMonth).format('MMMM/YYYY').slice(1));
    }
    return [monthsInYear,
      moment(timestamp).startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'years').startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-1, 'years').endOf('year').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate
    ];
  } else if (period === 'Décennie') {
    var yearsInDecade = [];
    var tooltipDate = [];
    for (var i = -9; i <= 0; i++) {
      var currentYear = moment(timestamp).add(i, 'years');
      yearsInDecade.push(currentYear.format('YYYY'));
      tooltipDate.push(moment(currentYear).format('YYYY').slice(0, 1).toUpperCase() + moment(currentYear).format('YYYY').slice(1));
    }
    return [yearsInDecade,
      moment(timestamp).add(-10, 'years').startOf('year').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).endOf('year').format('DD-MM-yyyy HH:mm:ss'), '', '', tooltipDate];
  } else if (period === 'Trimestre') {
    let currentMM = moment(timestamp).format('MM');
    let T = 'T'+Math.ceil(currentMM / 3);
    var startOfTrimester;
    var endOfTrimester;
    var currentDay;
    var endDay;
    switch (T) {
        case 'T1':
            startOfTrimester = moment(`01/01/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
            endOfTrimester = moment(`31/03/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
            currentDay = moment(`01/01/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            endDay = moment(`31/03/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            break;

        case 'T2':
            startOfTrimester = moment(`01/04/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
            endOfTrimester = moment(`30/06/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
            currentDay = moment(`01/04/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            endDay = moment(`30/06/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            break;
    
        case 'T3':
            startOfTrimester = moment(`01/07/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
            endOfTrimester = moment(`30/09/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
            currentDay = moment(`01/07/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            endDay = moment(`30/09/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            break;
    
        case 'T4':
            startOfTrimester = moment(`01/10/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').startOf('day').format('DD-MM-yyyy HH:mm:ss');
            endOfTrimester = moment(`31/12/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY').endOf('day').format('DD-MM-yyyy HH:mm:ss');
            currentDay = moment(`01/10/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            endDay = moment(`31/12/${moment(timestamp).format('YYYY')}`, 'DD/MM/YYYY');
            break;
    }

    var daysIn3Months = [];
    var abstractDaysIn3Months = [];
    var tooltipDate = [];
    while (currentDay.isSameOrBefore(endDay)) {
      daysIn3Months.push(currentDay.format('DD MMM'));
      abstractDaysIn3Months.push(currentDay.format('DD'));
      tooltipDate.push(moment(currentDay).format('ddd DD/MM/YYYY').slice(0, 1).toUpperCase() + moment(currentDay).format('ddd DD/MM/YYYY').slice(1));
      currentDay.add(1, 'day');
    }

    
    return [daysIn3Months,
      startOfTrimester,
      endOfTrimester,
      moment(timestamp).add(-5, 'months').startOf('month').format('DD-MM-yyyy HH:mm:ss'),
      moment(timestamp).add(-3, 'months').endOf('month').format('DD-MM-yyyy HH:mm:ss'),
      tooltipDate,
      T,
      abstractDaysIn3Months
    ];
  } else {
    return [];
  }
}