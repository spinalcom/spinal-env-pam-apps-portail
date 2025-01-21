import { HTTP } from "./http-constants";
import moment from 'moment';
import fr from 'moment/locale/fr';

//Récupère les informations sur un bâtiment spécifique.
export async function getBuilding(cp) {
  const buildingId = localStorage.getItem("idBuilding");
  const result = await HTTP.get(`building/${buildingId}/building/read`);
  let cpList = await HTTP.get(`building/${buildingId}/node/${result.data.dynamicId}/control_endpoint_list`);
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
  // get all floors
  const result = await HTTP.get(`building/${buildingId}/floor/list`);
  console.log("Liste des étages brute :", result.data); // Vérifiez que vous obtenez des données ici  
  // for each floor get its cp names
  let promises = result.data.map(async (floor) => {
    let cpList = await HTTP.get(`building/${buildingId}/node/${floor.dynamicId}/control_endpoint_list`);
    for (let j = 0; j < cpList.data.length; j++) {
      for (let i = 0; i < cpList.data[j].endpoints.length; i++) {
        // if there is a match add floor to array + area + cp id
        if (cpList.data[j].endpoints[i].name === cp[0].name) {
          let area = await HTTP.get(`building/${buildingId}/node/${floor.dynamicId}/attributsList`);
          area = area.data[0].attributs[area.data[0].attributs.findIndex(e => e.label === 'area')].value;
          floor.area = area;
          floor.cp = cpList.data[j].endpoints[i].dynamicId;
          return floor;
          
        }
      }
    }
    return null;
  });
  let values = await Promise.all(promises);
  let filteredValues = values.filter((value) => value !== null);
  console.log("Données des étages après filtrage :", filteredValues); // Log des données filtrées
  return filteredValues;
}
//Récupère la surface d'un espace (bâtiment ou étage).
async function getArea(space) {
  console.log('Get Area');
  const buildingId = localStorage.getItem("idBuilding");

  if (space.type === 'building') {
    console.log('of building');
    const result = await HTTP.get(`building/${buildingId}/building/read`);
    console.log(result);
    return +result.data.area;
  }
  else if (space.type === 'floor') {
    let area = await HTTP.get(`building/${buildingId}/node/${space.dynamicId}/attributsList`);
    area = area.data[0].attributs[area.data[0].attributs.findIndex(e => e.label === 'area')].value;
    return +area;
  }
}




//Récupère l'ID du contexte "Gestion des espaces" pour un bâtiment.
export async function getGestionDesEspacesId() {
  try {
    console.log('getGestionDesEspacesId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching Gestion des Espaces ID for building: ${buildingId}`);
    const response = await HTTP.get(`building/${buildingId}/groupContext/list`);
    console.log('Response data:', response.data);

    const gestionDesEspaces = response.data.find(item => item.name === "Gestion des espaces");
    console.log('Gestion des Espaces:', gestionDesEspaces);

    return gestionDesEspaces ? gestionDesEspaces.dynamicId : null;
  } catch (error) {
    console.error('Error in getGestionDesEspacesId:', error);
    return null;
  }
}
//Récupère l'ID de la catégorie "Typologie" pour un contexte donné.
export async function getTypologieCategoryId(contextId) {
  try {
    console.log('getTypologieCategoryId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching Typologie Category ID for context: ${contextId} in building: ${buildingId}`);
    const response = await HTTP.get(`building/${buildingId}/groupeContext/${contextId}/category_list`);
    console.log('Response data:', response.data);

    const typologieCategory = response.data.find(item => item.name === "Typologie");
    console.log('Typologie Category:', typologieCategory);

    return typologieCategory ? typologieCategory.dynamicId : null;
  } catch (error) {
    console.error('Error in getTypologieCategoryId:', error);
    return null;
  }
}
// Récupère l'ID du groupe "Salle de réunion" pour un contexte et une catégorie donnés.
export async function getMeetingRoomGroupId(contextId, categoryId) {
  try {
    console.log('getMeetingRoomGroupId called');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    console.log(`Fetching Meeting Room Group ID for context: ${contextId}, category: ${categoryId} in building: ${buildingId}`);
    const response = await HTTP.get(`building/${buildingId}/groupeContext/${contextId}/category/${categoryId}/group_list`);
    console.log('Response data:', response.data);

    const meetingRoomGroup = response.data.find(item => item.name === "Salle de réunion");
    console.log('Meeting Room Group:', meetingRoomGroup);

    return meetingRoomGroup ? meetingRoomGroup.dynamicId : null;
  } catch (error) {
    console.error('Error in getMeetingRoomGroupId:', error);
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
    const response = await HTTP.get(`building/${buildingId}/roomsGroup/${contextId}/category/${categoryId}/group/${groupId}/roomList`);
    console.log('Response data&&&&&&&:', response.data);

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
    const response = await HTTP.post(`building/${buildingId}/room/get_position_multiple`, roomIds);
    console.log('Room positions:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error in getRoomPositions:', error);
    return null;
  }
}
//Récupère les IDs dynamiques d'occupation pour les salles données.
export async function getOccupationDynamicIds(roomIds) {
  try {
    console.log('getOccupationDynamicIds called');
    console.log('Input Room IDsss:', roomIds);

    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    console.log('Building ID:', buildingId);

    const response = await HTTP.post(`building/${buildingId}/node/control_endpoint_list_multiple`, roomIds);
    //console.log('Response from control endpoint list multiple:', response.data);

    const dynamicIds = [];

    // Parcourir chaque sous-liste dans response.data
    response.data.forEach((roomEndpointsList, index) => {
      //console.log(`Processing room endpoints list at index ${index}:`, roomEndpointsList);

      if (roomEndpointsList && Array.isArray(roomEndpointsList)) {
        roomEndpointsList.forEach(room => {
          if (room.endpoints && Array.isArray(room.endpoints)) {
            room.endpoints.forEach(endpoint => {
             // console.log(`Inspecting endpoint:`, endpoint);
              if (
                endpoint.name &&
                endpoint.type &&
                endpoint.name.trim().toLowerCase() === "taux d'occupation" &&
                endpoint.type.trim().toLowerCase() === "occupation"
              ) {
              //  console.log('Matching endpoint found:', endpoint);
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
    console.error('Error in getOccupationDynamicIds:', error);
    return [];
  }
}




//Regroupe les salles par étage.
export function groupRoomsByFloor(roomPositions) {
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
    console.error('Error in groupRoomsByFloor:', error);
    return {};
  }
}
//Récupère les données d'occupation par étage.

export async function getOccupationDataByFloor(roomsByFloor) {
  try {
    console.log('Fetching occupation data by floor');
    const buildingId = localStorage.getItem("idBuilding");
    if (!buildingId) {
      console.error('idBuilding not found in localStorage');
      return null;
    }

    const occupationByFloor = {};

    for (const [floorId, floorData] of Object.entries(roomsByFloor)) {
      console.log(`Fetching occupation data for floor: ${floorData.floorName}`);
      const response = await HTTP.post(`building/${buildingId}/node/control_endpoint_list_multiple`,floorData.rooms);

      // Vérification de la structure de response.data
      if (!response || !response.data || !Array.isArray(response.data) || !Array.isArray(response.data[0])) {
        console.warn(`Invalid response data for floor: ${floorData.floorName}`, response);
        occupationByFloor[floorId] = {
          floorName: floorData.floorName,
          data: [],
          occupationRates: [],
        };
        continue;
      }

      // Extraire les taux d'occupation pour chaque salle
      const occupationRates = [];
      response.data.forEach(roomArray => {
        roomArray.forEach(room => {
          if (!room || !room.dynamicId) {
            console.warn(`Invalid room structure:`, room);
            return; // Ignorer cette salle
          }

          if (!room.endpoints || !Array.isArray(room.endpoints)) {
            console.warn(`Invalid endpoints for room: ${room.dynamicId}`, room);
            return; // Ignorer cette salle
          }

          room.endpoints.forEach(endpoint => {
            if (endpoint.name === "Taux d'occupation" && endpoint.type === "Occupation") {
              occupationRates.push(endpoint.currentValue);
            }
          });
        });
      });

      console.log(`Taux d'occupation des salles de réunion dans ${floorData.floorName} :`, occupationRates);

      occupationByFloor[floorId] = {
        floorName: floorData.floorName,
        data: response.data,
        occupationRates,
      };
    }

    console.log('Occupation data by floor:', occupationByFloor);
    return occupationByFloor;
  } catch (error) {
    console.error('Error in getOccupationDataByFloor:', error);
    return null;
  }
}

// Calcule les taux d'occupation moyens par étage.
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
          averageOccupation: 0, // Aucun taux d'occupation disponible
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

    // Effectuer la requête pour obtenir les attributs des salles
    const response = await HTTP.post(
      `building/${buildingId}/node/attribute_list_multiple`,
      roomIds
    );

    // Vérifier si les données sont valides
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.warn('Invalid response data for attribute list:', response);
      return null;
    }

    console.log('Attribute data:', response.data);

    // Extraire les surfaces et calculer la somme totale
    let totalSurface1 = 0;
    response.data.forEach(room => {
      const category = room.categoryAttributes.find(cat => cat.name === "Spatial");
      if (category && category.attributs) {
        const areaAttribute = category.attributs.find(attr => attr.label === "area");
        if (areaAttribute && areaAttribute.value) {
          totalSurface2 += parseFloat(areaAttribute.value); // Ajouter la valeur de la surface
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


export async function executeFlow() {
  try {
    console.log('Starting flow execution');
    // Appel de `getGraphData`
    const graphData = await getGraphData();
    if (!graphData) {
      console.error("Graph data could not be retrieved. Aborting flow.");
      return;
    }
    console.log("Graph data retrieved:", graphData);

    const gestionDesEspacesId = await getGestionDesEspacesId();
    if (!gestionDesEspacesId) {
      console.error('Gestion des Espaces ID not found. Aborting flow.');
      return;
    }

    const typologieCategoryId = await getTypologieCategoryId(gestionDesEspacesId);
    if (!typologieCategoryId) {
      console.error('Typologie Category ID not found. Aborting flow.');
      return;
    }

    const meetingRoomGroupId = await getMeetingRoomGroupId(gestionDesEspacesId, typologieCategoryId);
    if (!meetingRoomGroupId) {
      console.error('Meeting Room Group ID not found. Aborting flow.');
      return;
    }

    const roomIds = await getRoomIds(gestionDesEspacesId, typologieCategoryId, meetingRoomGroupId);
    if (!roomIds || roomIds.length === 0) {
      console.error('No Room IDs found. Aborting flow.');
      return;
    }

    // Appel de `getOccupationDynamicIds` avec `roomIds`
    const occupationDynamicIds = await getOccupationDynamicIds(roomIds);
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

    const roomsByFloor = groupRoomsByFloor(roomPositions);

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


// Execute the flow
executeFlow();

//Récupère les données de graphe pour un bâtiment.
export async function getGraphData() {
  try {
    console.log('getGraphData called');

    const buildingId = localStorage.getItem("idBuilding");
    const result = await HTTP.get(`building/${buildingId}/building/read`);
    let controlEndpointResponse = await HTTP.get(`building/${buildingId}/node/${result.data.dynamicId}/control_endpoint_list`);
    console.log('Control endpoint response data:', controlEndpointResponse.data);

    let occupancyEndpoint = null;
    controlEndpointResponse.data.forEach((profile) => {
      const endpoint = profile.endpoints.find(
        (ep) => ep.name === "taux d'occupation" && ep.type === "Occupation"
      );
      if (endpoint) {
        occupancyEndpoint = endpoint;
      }
    });

    if (!occupancyEndpoint) {
      console.error('No control endpoint found for "taux d\'occupation"');
      return null;
    }

    const occupancyDynamicId = occupancyEndpoint.dynamicId;
    console.log('Occupancy dynamic ID:', occupancyDynamicId);//hna kanakhd le dynamic id dial taux d'occupation dl batiment bach ndiro f timeseries

    return occupancyDynamicId;
  } catch (error) {
    console.error('Error in getGraphData:', error);
    return null;
  }
}
//Récupère les données pour un espace donné, une temporalité et un timestamp.
// Fonction principale pour récupérer les données
export async function getData(space, tempo, currentTimestamp, roomIds) {
  const buildingId = localStorage.getItem("idBuilding");
  const spaceArea = await getArea(space); // Récupère la surface de l'espace
  let periodArray = getPeriodArray(currentTimestamp, tempo);
  let label = periodArray[0];
  let tooltipDate = periodArray[5];
  let data = [];
  let avg = [];
  let total = [];
  let meter = [];
  let timeSeries;

  try {
    // 📊 **1. Taux d'occupation du bâtiment**
    console.log('Fetching occupancy dynamic ID');
    const occupancyDynamicId = await getGraphData();
    if (!occupancyDynamicId) {
      throw new Error('Occupancy dynamic ID not found');
    }

    console.log('Fetching occupancy rate data');
    timeSeries = await HTTP.get(
      `/building/${buildingId}/endpoint/${occupancyDynamicId}/timeSeries/read/${periodArray[1]}/${periodArray[2]}`
    );
    const occupancyRateData = timeSeries.data;

    let processedTimeSeries = [];

    if (tempo === 'Valeur Courante') {
      // 🟢 **Traitement Spécifique pour "Valeur Courante"**
      const currentHour = moment(currentTimestamp).hour();
      processedTimeSeries = label.map(hour => {
        const value = occupancyRateData.find(elem => moment(elem.date).format('HH') === hour)?.value || 0;
        return parseFloat(value).toFixed(2);
      }).filter((_, index) => index <= currentHour);
    } else {
      // 🛠️ **Agrégation des données en fonction de la temporalité**
      let aggregatedData = {};
      label.forEach(periodLabel => {
        aggregatedData[periodLabel] = [];
      });

      occupancyRateData.forEach(point => {
        let formattedLabel;
        switch (tempo) {
          case 'Journée':
            formattedLabel = moment(point.date).format('HH');
            break;
          case 'Semaine':
          case 'Mois':
            formattedLabel = moment(point.date).format('DD MMM');
            break;
          case 'Année':
            formattedLabel = moment(point.date).format('MMM');
            break;
        }

        if (aggregatedData[formattedLabel]) {
          aggregatedData[formattedLabel].push(point.value);
        }
      });

      // 🛠️ **Calcul des moyennes par période**
      processedTimeSeries = label.map(periodLabel => {
        const values = aggregatedData[periodLabel] || [];
        const sum = values.reduce((acc, val) => acc + val, 0);
        return values.length > 0 ? (sum / values.length).toFixed(2) : 0;
      });
    }

    // 🛠️ **Calcul des moyennes globales**
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

    // 📊 **2. Taux d'occupation des salles de réunion**
    console.log('Fetching dynamic IDs using getOccupationDynamicIds');
    const dynamicIds = await getOccupationDynamicIds(roomIds);
    if (dynamicIds.length > 0) {
      const timeSeriesResponse = await HTTP.post(
        `/building/${buildingId}/endpoint/timeSeries/read_multiple/${periodArray[1]}/${periodArray[2]}`,
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

      // 🛠️ **Moyenne des salles de réunion**
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
}


export async function getBuildingOccupancyData(space, tempo, currentTimestamp, roomIds) {
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
export async function getTodaysData(space, controlEndpoints) {
  // var data = [
  //   {
  //     label: 'Energie globale',
  //     name: 'Energie globale',
  //     color: '#14202c',
  //     unit: 'Kw',
  //     title: 'title',
  //     subtitle: 'sub',
  //     root: true,
  //   }
  // ]
  const data = [];
  const buildingId = localStorage.getItem("idBuilding");
  var startOfDay = moment().startOf('day').format('DD-MM-yyyy HH:mm:ss');
  var endOfDay = moment().endOf('day').format('DD-MM-yyyy HH:mm:ss');
  let cpList, cpID, timeSeries, sumSeries, sub;
  for (const controlEndpoint of controlEndpoints) {
    cpList = await HTTP.get(`building/${buildingId}/node/${space.dynamicId}/control_endpoint_list`);
    // cpList = cpList.data[1].endpoints;
    // for (let i = 0; i < cpList.length; i++) {
    //   if (cpList[i].name === controlEndpoint.name) {
    //     cpID = cpList[i].dynamicId;
    //   }
    // }

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
}
// Génère des données mensuelles pour une année donnée.
function generateMonthlyData(y) {
  const monthlyData = [];
  const date = moment(y, 'YYYY');
  // loop through 12 months
  for (let i = 0; i < 12; i++) {
    let daysInMonth = date.month(i).daysInMonth();
    if (i === 1) { // February
      if (moment([y]).isLeapYear()) {
        daysInMonth = 29;
      }
    }
    const monthArray = Array(daysInMonth).fill(-1);
    monthlyData.push(monthArray);
  }
// console.log({
//   y: year,
//   d: monthlyData
// })
  return {
    n: '',
    y: y,
    d: monthlyData
  };
}
//Prépare un calendrier avec des séries temporelles.
function prepareCalendar(year, timeSeries) {
  var data = generateMonthlyData(year).d;
  var month, day;
  for (const timeSerie of timeSeries) {
    month = +moment(timeSerie.date).format('MM') - 1;
    day = +moment(timeSerie.date).format('DD') - 1;
    data[month][day] = (data[month][day] == -1) ? timeSerie.value : data[month][day] + timeSerie.value;
  }
  return data;
}
// Récupère des suggestions de temporalité.
export function getTempoSuggestion(tempo, currentTimestamp) {
  if (tempo === 'Mois') {
    return [
      'Mois choisi (' + moment(currentTimestamp).format('MMMM YYYY') + ')',
      'Mois précédent (' + moment(currentTimestamp).add(-1,'months').format('MMMM YYYY') + ')',
      'Même mois que l\'année dernière (' + moment(currentTimestamp).add(-12, 'months').format('MMMM YYYY') + ')']
  }
}
//Récupère des données pour un espace donné, une temporalité, un timestamp, un format, des points de contrôle, une couleur et une carte totale.
export async function getSolo(space, tempo, currentTimestamp, format, controlEndpoints, color, totalCard) {
  let ts = moment(currentTimestamp, format).valueOf();
  if (tempo === 'Trimestre') {
    let t = currentTimestamp.split('/');
    switch(t[0]) {
      case 'T1': ts = moment(`01/01/${t[1]}`, 'DD/MM/YYYY'); break;
      case 'T2': ts = moment(`01/04/${t[1]}`, 'DD/MM/YYYY'); break;
      case 'T3': ts = moment(`01/07/${t[1]}`, 'DD/MM/YYYY'); break;
      case 'T4': ts = moment(`01/10/${t[1]}`, 'DD/MM/YYYY'); break;
    }
  }
  let res = await getData(space, tempo, ts, controlEndpoints);
  res[1][0].stack = currentTimestamp;
  res[1][0].backgroundColor = color;
  res[2][0].root = false;
  res[2][0].color = color;
  res[3][0].root = false;
  res[3][0].color = color;
  let comparison = '∞';
  if (totalCard[0].value !== 0 && res[3][0].value > 0) {
    comparison = (((res[3][0].value - totalCard[0].value) / totalCard[0].value) * 100).toFixed(1) + '%';
    // comparison = (res[3][0].value * 100 / totalCard[0].value).toFixed(1) + '%'
  }
  res[3][0].subValue = comparison;
  res[3][0].subtitle = 'de la consommation de référence';

  res[5][0].root = false;
  res[5][0].color = color;
  res[5][0].title = 'Consommation au m²';
  res[5][0].title = 'Consommation au m²';
  

  return [res[1][0], res[2][0], res[3][0], res[5][0], res[4][0], res[0]];
}
