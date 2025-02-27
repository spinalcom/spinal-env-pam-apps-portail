import config from '../../config.js'; 
import { HTTP } from "./http-constants";
import moment from 'moment';

//Récupère les informations sur un bâtiment spécifique.
export async function getBuilding(cp) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(config.apiEndpoints.building.replace('{buildingId}', buildingId));
  let cpList = await HTTP.get(config.apiEndpoints.controlEndpointList.replace('{buildingId}', buildingId).replace('{dynamicId}', result.data.dynamicId));
  for (let j = 0; j < cpList.data.length; j++) {
    for (let i = 0; i < cpList.data[j].endpoints.length; i++) {
      if (cpList.data[j].endpoints[i].name === cp[0].name) {
        result.data.cp = cpList.data[j].endpoints[i].dynamicId;
      }
    }
  }
  return result.data;
}

//Récupère la liste des étages d'un bâtiment.

export async function getFloors(cp) {
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

    // Pour chaque étage, obtenir ses points de contrôle
    let promises = result.data.map(async (floor) => {
      console.log(`Fetching control points for floor: ${floor.name}`);
      let cpList = await HTTP.get(config.apiEndpoints.controlEndpointList.replace('{buildingId}', buildingId).replace('{dynamicId}', floor.dynamicId));
      console.log(`Control points for floor ${floor.name}:`, cpList.data);

      for (let j = 0; j < cpList.data.length; j++) {
        for (let i = 0; i < cpList.data[j].endpoints.length; i++) {

          // if there is a match add floor to array + area + cp id
          if (cpList.data[j].endpoints[i].name === cp[0].name) {
            console.log(`Matching control point found for floor ${floor.name}:`, cpList.data[j].endpoints[i]);
            let area = await HTTP.get(config.apiEndpoints.floorAttributes.replace('{buildingId}', buildingId).replace('{dynamicId}', floor.dynamicId));
            if (area.data && area.data[0] && area.data[0].attributs) {
              const areaIndex = area.data[0].attributs.findIndex(e => e.label === 'area');
              if (areaIndex !== -1) {
                floor.area = area.data[0].attributs[areaIndex].value;
              } else {
                console.warn(`No area attribute found for floor ${floor.name}`);
                floor.area = null;
              }
            } else {
              console.warn(`Invalid area data for floor ${floor.name}`, area.data);
              floor.area = null;
            }
            floor.cp = cpList.data[j].endpoints[i].dynamicId;
            return floor;
          }
        }
      }
      // Si aucun point de contrôle correspondant n'est trouvé, retourner l'étage sans points de contrôle
      floor.area = null;
      floor.cp = null;
      return floor;
    });

    let values = await Promise.all(promises);
    console.log("Données des étages après traitement :", values);
    return values;
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

    console.log(`Fetching positions for room IDs: ${roomIds}`);
    const response = await HTTP.post(config.apiEndpoints.roomPositions.replace('{buildingId}', buildingId), roomIds);
    console.log('Room positions:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error in getRoomPositions:', error);
    return null;
  }
}
//Récupère les IDs dynamiques d'occupation pour les salles données.
export async function fetchMeetingRoomOccupationDynamicIds(roomIds) {
  try {
    console.log('fetchMeetingRoomOccupationDynamicIds called');
    console.log('Input Room IDs:', roomIds);

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    console.log('Building ID:', buildingId);

    const response = await HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), roomIds);
    console.log('Response from control endpoint list multiple:', response.data);

    const dynamicIds = [];

    // Parcourir chaque sous-liste dans response.data
    response.data.forEach((roomEndpointsList, index) => {
    /*   console.log(`Processing room endpoints list at index ${index}:`, roomEndpointsList); */

      if (roomEndpointsList && Array.isArray(roomEndpointsList)) {
        roomEndpointsList.forEach(room => {
          if (room.endpoints && Array.isArray(room.endpoints)) {
            room.endpoints.forEach(endpoint => {
              if (
                endpoint.name === config.sources[0].name &&
                endpoint.type === config.sources[0].type
              ) {
               /*  console.log('Matching endpoint found:', endpoint); */
                dynamicIds.push(endpoint.dynamicId);
              }
            });
          }
        });
      }
    });
    
    console.log('Dynamic IDs collected:', dynamicIds);
    return dynamicIds;
  } catch (error) {
    console.error('Error in fetchMeetingRoomOccupationDynamicIds:', error);
    return [];
  }
}
//Regroupe les salles par étage.
export function groupMeetingRoomsByFloor(roomPositions) {
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
    console.error('Error in groupMeetingRoomsByFloor:', error);
    return {};
  }
}

// Fonction pour récupérer les IDs dynamiques d'occupation des salles de réunion par étage
export async function getFloorMeetingRoomOccupationDynamicIds(roomIds, roomsByFloor) {
  try {
    console.log('Fetching occupation dynamic IDs for rooms by floor');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return {};
    }

    // Appel à l'API pour récupérer les endpoints de contrôle
    const response = await HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), roomIds);
    console.log('Response from control endpoint list multiple:', response.data);

    const dynamicIdsByFloor = {};

    // Parcourir la réponse pour extraire les Dynamic IDs
    response.data.forEach((roomEndpointsList) => {
      if (roomEndpointsList && Array.isArray(roomEndpointsList)) {
        roomEndpointsList.forEach(room => {
          if (room.endpoints && Array.isArray(room.endpoints)) {
            room.endpoints.forEach(endpoint => {
              if (
                endpoint.name === config.sources[0].name &&
                endpoint.type === config.sources[0].type
              ) {
                const floorId = Object.keys(roomsByFloor).find(floorId => roomsByFloor[floorId].rooms.includes(room.dynamicId));
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
    console.error('Error fetching occupation dynamic IDs by floor:', error);
    return {};
  }
}


//Récupère les données d'occupation par étage.
export async function getMeetingRoomOccupancyDataByFloor(space, tempo, currentTimestamp, roomIds) {
  const buildingId = localStorage.getItem("idBuilding");
  const spaceArea = await getArea(space); 
  let periodArray = getPeriodArray(currentTimestamp, tempo);
  let label = periodArray[0];
  let tooltipDate = periodArray[5];
  let data = [];
  let avg = [];
  let total = [];
  let meter = [];
  let timeSeries;

  try {
    console.log('Fetching floors for building:', buildingId);
    const floors = await getFloors([{ name: 'nom_du_cp' }]); 
    console.log('Floors fetched:', floors);

    const roomPositions = await getRoomPositions(roomIds);
    const roomsByFloor = groupMeetingRoomsByFloor(roomPositions);
    console.log('Rooms grouped by floor:', roomsByFloor);

    const dynamicIdsByFloor = await getFloorMeetingRoomOccupationDynamicIds(roomIds, roomsByFloor);
    console.log('Dynamic IDs by floor:', dynamicIdsByFloor);

    console.log('Period array from index index:', periodArray);
    console.log('Start date from index index:', periodArray[1]); 
    console.log('End date from index index:', periodArray[2]); 

    const aggregatedFloorData = {};
    for (const floor of floors) {
      const dynamicIds = dynamicIdsByFloor[floor.dynamicId];
      if (dynamicIds && dynamicIds.length > 0) {
        console.log(`Fetching time series data for floor: ${floor.name}`);
        const timeSeriesResponse = await HTTP.post(
          config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
          dynamicIds
        );
        const timeSeriesData = timeSeriesResponse.data;
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

    floors.forEach(floor => {
      data.push({
        label: `Taux d'occupation des salles de réunion - Étage ${floor.name}`,
        data: floorProcessedTimeSeries.map(floorData => floorData[floor.name]),
        backgroundColor: '#A7001E',
        borderColor: '#A7001E',
        borderWidth: 1,
        fill: false,
      });
    });
    console.log('Final data prepared for display:', data);

    return [label, data, avg, total, averages, meter];

  } catch (e) {
    console.error('Error fetching data:', e);
    return [null, null, null, null, [], []];
  }
}
// meth 1 : Calcule les taux d'occupation moyens par étage.
export function calculateAverageOccupation(roomsByFloor, occupationByFloor) {
  try {
    console.log('Calculating average occupation rates by floor');
    console.log('Rooms by floor:', roomsByFloor);
    console.log('Occupation by floor:', occupationByFloor);

    return Object.entries(roomsByFloor).map(([floorId, floorData]) => {
      const floorOccupation = occupationByFloor[floorId];
      if (!floorOccupation || !floorOccupation.occupationRates) {
        console.warn(`No occupation data found for floor: ${floorData.floorName}`);
        return {
          floorId,
          floorName: floorData.floorName,
          averageOccupation: 0,
        };
      }

      const occupationRates = floorOccupation.occupationRates;
      const totalOccupation = occupationRates.reduce((acc, rate) => acc + rate, 0);
      const averageOccupation = occupationRates.length > 0 ? totalOccupation / occupationRates.length : 0;

      return {
        floorId,
        floorName: floorData.floorName,
        averageOccupation,
      };
    });
  } catch (error) {
    console.error('Error in calculateAverageOccupation:', error);
    return [];
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

    const response = await HTTP.post(
      config.apiEndpoints.attributeListMultiple.replace('{buildingId}', buildingId),
      roomIds
    );

    console.log('Response:', response);

    // Vérifier si les données sont valides
    if (!response || !response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response data');
    }

    console.log('Attribute data:', response.data);

    // Extraire les surfaces et calculer la somme totale
    let totalSurface2 = 0; 
    response.data.forEach(room => {
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
export async function getEquipmentContextId(contextName) {
  try {
    console.log('getEquipmentContextId called');
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
    console.error('Error in getEquipmentContextId:', error);
    return null;
  }
}

// Récupère l'ID de la catégorie pour un contexte d'équipement donné.
export async function getEquipmentCategoryId(contextId, categoryName) {
  try {
    console.log('getEquipmentCategoryId called');
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
    console.error('Error in getEquipmentCategoryId:', error);
    return null;
  }
}
// Récupère l'ID du groupe pour un contexte et une catégorie d'équipement donnés.
export async function getEquipmentGroupId(contextId, categoryId, groupName) {
  try {
    console.log('getEquipmentGroupId called');
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
    console.error('Error in getEquipmentGroupId:', error);
    return null;
  }
}

// Récupère la liste des équipements pour un contexte, une catégorie et un groupe donnés.
export async function getEquipmentIds(contextId, categoryId, groupId) {
  try {
    console.log('getEquipmentIds called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return [];
    }

    console.log(`Fetching Equipment IDs for context: ${contextId}, category: ${categoryId}, group: ${groupId} in building: ${buildingId}`);
    const response = await HTTP.get(config.apiEndpoints.equipmentList.replace('{buildingId}', buildingId).replace('{contextId}', contextId).replace('{categoryId}', categoryId).replace('{groupId}', groupId));
    console.log('Response data:', response.data);

    return response.data.map(equipment => equipment.dynamicId);
  } catch (error) {
    console.error('Error in getEquipmentIds:', error);
    return [];
  }
}

// Récupère les positions des équipements donnés.
export async function getEquipmentPositions(equipmentIds) {
  try {
    console.log('getEquipmentPositions called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching positions for equipment IDs: ${equipmentIds}`);
    const response = await HTTP.post(config.apiEndpoints.equipmentPositions.replace('{buildingId}', buildingId), equipmentIds);
    console.log('Equipment positions:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error in getEquipmentPositions:', error);
    return null;
  }
}

// Récupère les IDs dynamiques d'occupation pour les équipements donnés.
export async function fetchEquipmentOccupationDynamicIds(equipmentIds) {
  try {
    console.log('fetchEquipmentOccupationDynamicIds called');
    console.log('Input Equipment IDs:', equipmentIds);

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    console.log('Building ID:', buildingId);

    const response = await HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), equipmentIds);
    console.log('Response from control endpoint list multiple:', response.data);

    const dynamicIds = [];

    // Parcourir chaque sous-liste dans response.data
    response.data.forEach((equipmentEndpointsList, index) => {
/*       console.log(`Processing equipment endpoints list at index ${index}:`, equipmentEndpointsList);
 */
      if (equipmentEndpointsList && Array.isArray(equipmentEndpointsList)) {
        equipmentEndpointsList.forEach(equipment => {
          if (equipment.endpoints && Array.isArray(equipment.endpoints)) {
            equipment.endpoints.forEach(endpoint => {
              const endpointName = config.sources[0].name.trim().toLowerCase();
              const endpointType = config.sources[0].type.trim().toLowerCase();
              if (
                endpoint.name.trim().toLowerCase() === endpointName &&
                endpoint.type.trim().toLowerCase() === endpointType
              ) {
/*                 console.log('Matching endpoint found:', endpoint);
 */                dynamicIds.push(endpoint.dynamicId);
              }
            });
          }
        });
      }
    });
    
    console.log('Dynamic IDs collected:', dynamicIds);
    return dynamicIds;
  } catch (error) {
    console.error('Error in fetchEquipmentOccupationDynamicIds:', error);
    return [];
  }
}

// Regroupe les équipements par étage.
export function groupEquipmentsByFloor(equipmentPositions) {
  try {
    console.log('Grouping equipments by floor');
    const equipmentsByFloor = {};
    equipmentPositions.forEach(equipment => {
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
    console.error('Error in groupEquipmentsByFloor:', error);
    return {};
  }
}

// Récupère les IDs dynamiques des points de contrôle de taux d'occupation pour les équipements par étage.
export async function getEquipmentOccupationDynamicIdsByFloor(equipmentIds, equipmentsByFloor) {
  try {
    console.log('getEquipmentOccupationDynamicIdsByFloor called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return {};
    }

    console.log(`Fetching control endpoints for equipment IDs: ${equipmentIds}`);
    const response = await HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), equipmentIds);
    console.log('Response data:', response.data);

    const dynamicIdsByFloor = {};

    response.data.forEach((equipmentEndpointsList) => {
      if (equipmentEndpointsList && Array.isArray(equipmentEndpointsList)) {
        equipmentEndpointsList.forEach(equipment => {
          if (equipment.endpoints && Array.isArray(equipment.endpoints)) {
            equipment.endpoints.forEach(endpoint => {
              if (
                endpoint.name.trim().toLowerCase() === config.sources[0].name.trim().toLowerCase() &&
                endpoint.type.trim().toLowerCase() === config.sources[0].type.trim().toLowerCase()
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
    console.error('Error in getEquipmentOccupationDynamicIdsByFloor:', error);
    return {};
  }
}

// Récupère les données de séries temporelles pour les équipements par étage.
export async function getEquipmentOccupancyDataByFloor(space, tempo, currentTimestamp, equipmentIds) {
  const buildingId = localStorage.getItem("idBuilding");
  const spaceArea = await getArea(space); 
  let periodArray = getPeriodArray(currentTimestamp, tempo);
  let label = periodArray[0];
  let tooltipDate = periodArray[5];
  let data = [];
  let avg = [];
  let total = [];
  let meter = [];
  let timeSeries;

  try {
    const equipmentPositions = await getEquipmentPositions(equipmentIds);

    const equipmentsByFloor = groupEquipmentsByFloor(equipmentPositions);
    console.log('Equipments grouped by floor:', equipmentsByFloor);

    const dynamicIdsByFloor = await getEquipmentOccupationDynamicIdsByFloor(equipmentIds, equipmentsByFloor);
    console.log('Dynamic IDs by floor:', dynamicIdsByFloor);

    const aggregatedFloorData = {};
    for (const floor of Object.keys(equipmentsByFloor)) {
      const dynamicIds = dynamicIdsByFloor[floor];
      if (dynamicIds && dynamicIds.length > 0) {
        console.log(`Fetching time series data for floor: ${floor}`);
        const timeSeriesResponse = await HTTP.post(
          config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
          dynamicIds
        );
        const timeSeriesData = timeSeriesResponse.data;
        console.log(`Time series data for floor ${floor}:`, timeSeriesData);

        aggregatedFloorData[floor] = {};
        label.forEach(periodLabel => {
          aggregatedFloorData[floor][periodLabel] = [];
        });

        timeSeriesData.forEach(equipmentData => {
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

    Object.keys(equipmentsByFloor).forEach(floor => {
      data.push({
        label: `Taux d'occupation des équipements - Étage ${floor}`,
        data: floorProcessedTimeSeries.map(floorData => floorData[floor]),
        backgroundColor: '#212FD4',
        borderColor: '#212FD4',
        borderWidth: 1,
        fill: false,
      });
    });
    console.log('Final data prepared for display:', data);

    return [label, data, avg, total, averages, meter];

  } catch (e) {
    console.error('Error fetching data:', e);
    return [null, null, null, null, [], []];
  }
}

export async function executeFlow() {
  try {
    console.log('Starting flow execution');
    const graphData = await getGraphData();
    if (!graphData) {
      console.error("Graph data could not be retrieved. Aborting flow.");
      return;
    }
    console.log("Graph data retrieved:", graphData);

    const contextId = await getContextId();
    if (!contextId) {
/*       console.error('Gestion des Espaces ID not found. Aborting flow.');
*/      return;
    }

    const categoryId = await getCategoryId(contextId);
    if (!categoryId) {
      console.error('Typologie Category ID not found. Aborting flow.');
      return;
    }

    const groupId = await getGroupId(contextId, categoryId);
    if (!groupId) {
      console.error('Meeting Room Group ID not found. Aborting flow.');
      return;
    }

    const roomIds = await getRoomIds(contextId, categoryId, groupId);
    if (!roomIds || roomIds.length === 0) {
      console.error('No Room IDs found. Aborting flow.');
      return;
    }

    const occupationDynamicIds = await fetchMeetingRoomOccupationDynamicIds(roomIds);
    if (!occupationDynamicIds) {
      console.error("Occupation DynamicIds could not be retrieved. Aborting flow.");
      return;
    }
    console.log("Occupation DynamicIds retrieved:", occupationDynamicIds);

    const totalSurface2 = await getTotalSurface2(roomIds);
    if (totalSurface2 !== null) {
      console.log(`Total surface of all meeting rooms: ${totalSurface2.toFixed(2)} m²`);
    }

    const roomPositions = await getRoomPositions(roomIds);
    if (!roomPositions || roomPositions.length === 0) {
      console.error('No Room Positions found. Aborting flow.');
      return;
    }

    const roomsByFloor = groupMeetingRoomsByFloor(roomPositions);

    const occupationByFloor = await getOccupationDataByFloor(roomsByFloor);
    if (!occupationByFloor) {
      console.error('No occupation data by floor found. Aborting flow.');
      return;
    }

    const averagesByFloor = calculateAverageOccupation(roomsByFloor, occupationByFloor);

    averagesByFloor.forEach(floor => {
      console.log(`Floor: ${floor.floorName}, Average Occupation: ${floor.averageOccupation.toFixed(2)}%`);
    });

    console.log('Flow execution complete');
  } catch (error) {
    console.error('Error during flow execution:', error);
  }
}

executeFlow();

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
    const endpointName = config.sources[0].name.toLowerCase();
    const endpointType = config.sources[0].type;

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


export async function getData(space, tempo, currentTimestamp, roomIds) {
  const buildingId = localStorage.getItem("idBuilding");
  const spaceArea = await getArea(space); 
  let periodArray = getPeriodArray(currentTimestamp, tempo);
  let label = periodArray[0];
  let tooltipDate = periodArray[5];
  let data = [];
  let avg = [];
  let total = [];
  let meter = [];
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
    const occupancyRateData = timeSeries.data;
    console.log('Occupancy rate data:', occupancyRateData);

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
      label: 'Taux d\'occupation du bâtiment',
      data: processedTimeSeries,
      backgroundColor: '#14202C',
      borderColor: '#14202C',
      borderWidth: 1,
      fill: false,
    });

    // 2. Taux d'occupation des salles de réunion
    console.log('Fetching dynamic IDs using fetchMeetingRoomOccupationDynamicIds');
    const dynamicIds = await fetchMeetingRoomOccupationDynamicIds(roomIds);
    if (dynamicIds.length > 0) {
      console.log('Period array from index:', periodArray); 
      console.log('Start date from index:', periodArray[1]);
      console.log('End date from index:', periodArray[2]);

      const timeSeriesResponse = await HTTP.post(
        config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
        dynamicIds
      );
      const timeSeriesData = timeSeriesResponse.data;
      console.log('Time series data for meeting rooms:', timeSeriesData);

      let aggregatedRoomData = {};
      label.forEach(periodLabel => {
        aggregatedRoomData[periodLabel] = [];
      });

      timeSeriesData.forEach(roomData => {
        roomData.timeseries.forEach(point => {
          let formattedLabel = tempo === 'Journée' || tempo === 'Valeur Courante'
            ? moment(point.date).format('HH')
            : moment(point.date).format('DD MMM');
          if (aggregatedRoomData[formattedLabel]) {
            aggregatedRoomData[formattedLabel].push(point.value);
          }
        });
      });

      // Moyenne des salles de réunion
      const roomProcessedTimeSeries = label.map(periodLabel => {
        const values = aggregatedRoomData[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        return values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      }).filter((_, index) => tempo === 'Valeur Courante' ? index <= moment(currentTimestamp).hour() : true);

      data.push({
        label: 'Taux d\'occupation des salles de réunion',
        data: roomProcessedTimeSeries,
        backgroundColor: '#1C5791',
        borderColor: '#1C5791',
        borderWidth: 1,
        fill: false,
      });
    }

    // 3. Taux d'occupation des équipements
    console.log('Fetching equipment dynamic IDs');
    const equipmentEntryPoint = config.entryPoints.find(ep => ep.context === 'Gestion des équipements' && ep.category === 'Typologie' && ep.group === 'Positions de travail');
    if (!equipmentEntryPoint) {
      throw new Error('Equipment entry point not found');
    }

    const equipmentContextId = await getEquipmentContextId(equipmentEntryPoint.context);
    const equipmentCategoryId = await getEquipmentCategoryId(equipmentContextId, equipmentEntryPoint.category);
    const equipmentGroupId = await getEquipmentGroupId(equipmentContextId, equipmentCategoryId, equipmentEntryPoint.group);
    const equipmentIds = await getEquipmentIds(equipmentContextId, equipmentCategoryId, equipmentGroupId);

    console.log('Equipment IDs:', equipmentIds);

    const equipmentDynamicIds = await fetchEquipmentOccupationDynamicIds(equipmentIds);
    if (equipmentDynamicIds.length > 0) {
      console.log('Fetching time series data for equipment');
      const equipmentTimeSeriesResponse = await HTTP.post(
        config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
        equipmentDynamicIds
      );
      const equipmentTimeSeriesData = equipmentTimeSeriesResponse.data;
      console.log('Time series data for equipment:', equipmentTimeSeriesData);

      let aggregatedEquipmentData = {};
      label.forEach(periodLabel => {
        aggregatedEquipmentData[periodLabel] = [];
      });

      equipmentTimeSeriesData.forEach(equipmentData => {
        equipmentData.timeseries.forEach(point => {
          let formattedLabel = tempo === 'Journée' || tempo === 'Valeur Courante'
            ? moment(point.date).format('HH')
            : moment(point.date).format('DD MMM');
          if (aggregatedEquipmentData[formattedLabel]) {
            aggregatedEquipmentData[formattedLabel].push(point.value);
          }
        });
      });

      // Moyenne des équipements
      const equipmentProcessedTimeSeries = label.map(periodLabel => {
        const values = aggregatedEquipmentData[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        return values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      }).filter((_, index) => tempo === 'Valeur Courante' ? index <= moment(currentTimestamp).hour() : true);

      data.push({
        label: 'Taux d\'occupation des positions de travail',
        data: equipmentProcessedTimeSeries,
        backgroundColor: '#418FDD',
        borderColor: '#418FDD',
        borderWidth: 1,
        fill: false,
      });
    }

    return [label, data, avg, total, [], meter];

  } catch (e) {
    console.error('Error fetching data:', e);
    return [null, null, null, null, [], []];
  }
}


// Fonction principale pour récupérer les données d'occupation
/* export async function getOccupancyData(space, tempo, currentTimestamp, roomIds) {
  const buildingId = localStorage.getItem("idBuilding");
  const spaceArea = await getArea(space); 
  let periodArray = getPeriodArray(currentTimestamp, tempo);
  let label = periodArray[0];
  let tooltipDate = periodArray[5];
  let data = [];
  let avg = [];
  let total = [];
  let meter = [];
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
    const occupancyRateData = timeSeries.data;

    let processedTimeSeries = [];

    if (tempo === 'Valeur Courante') {
      processedTimeSeries = occupancyRateData.map(item => item.value);
    } else {
      processedTimeSeries = occupancyRateData.map(item => item.value);
    }

    // Calcul des moyennes globales
    const sumSeries = occupancyRateData.reduce((acc, current) => acc + current.value, 0);
    const average = +(sumSeries / label.length).toFixed(1);
    const normalizedValue = +(sumSeries / spaceArea).toFixed(1);

    data.push({
      label: 'Taux d\'occupation du bâtiment',
      data: processedTimeSeries,
      backgroundColor: '#1f2937',
      borderColor: '#1f2937',
      borderWidth: 1,
      fill: false,
    });

    // 2. Taux d'occupation des salles de réunion
    console.log('Fetching dynamic IDs using fetchMeetingRoomOccupationDynamicIds');
    const dynamicIds = await fetchMeetingRoomOccupationDynamicIds(roomIds);
    if (dynamicIds.length > 0) {
      console.log('Period array from index:', periodArray); 
      console.log('Start date from index:', periodArray[1]);
      console.log('End date from index:', periodArray[2]);

      const timeSeriesResponse = await HTTP.post(
        config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
        dynamicIds
      );
      const timeSeriesData = timeSeriesResponse.data;
      console.log('Time series data for meeting rooms:', timeSeriesData);

      let aggregatedRoomData = {};
      label.forEach(periodLabel => {
        aggregatedRoomData[periodLabel] = [];
      });

      timeSeriesData.forEach(roomData => {
        roomData.timeseries.forEach(point => {
          let formattedLabel = tempo === 'Journée' || tempo === 'Valeur Courante'
            ? moment(point.date).format('HH')
            : moment(point.date).format('DD MMM');
          if (aggregatedRoomData[formattedLabel]) {
            aggregatedRoomData[formattedLabel].push(point.value);
          }
        });
      });

      // Moyenne des salles de réunion
      const roomProcessedTimeSeries = label.map(periodLabel => {
        const values = aggregatedRoomData[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        return values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      });

      data.push({
        label: 'Taux d\'occupation des salles de réunion',
        data: roomProcessedTimeSeries,
        backgroundColor: '#A7001E',
        borderColor: '#A7001E',
        borderWidth: 1,
        fill: false,
      });
    }

    // Retourner les données finales
    return [label, data, avg, total, [], meter];

  } catch (e) {
    console.error('Error fetching data:', e);
    return [null, null, null, null, [], []];
  }
} */

/* export async function getBuildingOccupancyData(space, tempo, currentTimestamp, roomIds) {
  try {
    const [label, data] = await getData(space, tempo, currentTimestamp, roomIds);
    const occupancyData = data.find(d => d.label === "Taux d'occupation du bâtiment");

    return {
      labels: label,
      datasets: [occupancyData],
    };
  } catch (error) {
    console.error('Error fetching building occupancy data:', error);
    return {
      labels: [],
      datasets: [],
    };
  }
}

// Fonction pour préparer les données d'occupation
export async function prepareOccupancyData(space, tempo, currentTimestamp) {  
  try {
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      throw new Error('idBuilding not found in localStorage');
    }

    const contextId = await getContextId();
    const categoryId = await getCategoryId(contextId, config.categoryNames.typologie);
    const groupId = await getGroupId(contextId, categoryId,config.groupNames.meetingRoom);
    const roomIds = await getRoomIds(contextId, categoryId, groupId);

    const roomPositions = await getRoomPositions(roomIds);
    const roomsByFloor = groupMeetingRoomsByFloor(roomPositions);
    const occupationByFloor = await getOccupationDataByFloor(roomsByFloor);
    const averagesByFloor = calculateAverageOccupation(roomsByFloor, occupationByFloor);

    const labels = averagesByFloor.map(floor => floor.floorName);
    const data = averagesByFloor.map(floor => floor.averageOccupation);

    return { labels, data };
  } catch (error) {
    console.error('Error in prepareOccupancyData:', error);
  }
}

 */


function getPeriodArray(timestamp, period) {
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
 //Récupère les données pour aujourd'hui pour un espace donné et des points de contrôle.
/* export async function getTodaysData(space, controlEndpoints) {
  const data = [];
  const buildingId = localStorage.getItem("idBuilding");
  var startOfDay = moment().startOf('day').format('DD-MM-yyyy HH:mm:ss');
  var endOfDay = moment().endOf('day').format('DD-MM-yyyy HH:mm:ss');
  let cpList, cpID, timeSeries, sumSeries, sub;
  for (const controlEndpoint of controlEndpoints) {
    cpList = await HTTP.get(`building/${buildingId}/node/${space.dynamicId}/control_endpoint_list`);
   

    for (let j = 0; j < cpList.data.length; j++) {
      for (let i = 0; i < cpList.data[j].endpoints.length; i++) {
        if (cpList.data[j].endpoints[i].name === controlEndpoint.name) {
          cpID = cpList.data[j].endpoints[i].dynamicId;
        }
      }
    }
    if (cpID) {
    timeSeries = await HTTP.get(`/building/${buildingId}/endpoint/${cpID}/timeSeries/read/${startOfDay}/${endOfDay}`);
    // timeSeries = await HTTP.get(`/building/${buildingId}/endpoint/${cpID}/timeSeries/read/07-02-2023 00:00:00/07-02-2023 23:59:59`);
    timeSeries = timeSeries.data;
    sumSeries = timeSeries.reduce((accumulator, current) => accumulator + current.value, 0);
    data.push({
      color: controlEndpoint.color,
      value: sumSeries,
      unit: controlEndpoint.unit,
      title: controlEndpoint.title,
      subValue: '+0%',
      subtitle: controlEndpoint.subtitle,
      root: controlEndpoint.root
    })
  }
  }
  let sum = data[0].value;
  for (let i = 1; i < data.length; i++) {
    if (data[i].unit !== data[i-1].unit) {
      sum = data[i].value;
      data[i].subtitle = null;
      data[i].subValue = null

    }
    else {
      data[i].subValue = (data[i].value * 100 / sum).toFixed(1) + '%';
    }
  }
  return data;
} */