<template>
  <div class="occupancy-details">
    <v-card class="chart-card">
      <h2>DÉTAIL DE L'OCCUPATION PAR GROUPE EN TEMPS RÉEL</h2>
      <v-card-text>
        <div class="chart-container">
          <div class="chart-title">Étage</div>
          <div class="charts">
            <div class="occupancy-summary">
              <span class="occupancy-percentage ">
                <span class="percentage">{{ buildingOccupancyRate }}%</span> DU BÂTIMENT EST OCCUPÉ
              </span>
              <span class="total-surface">{{ totalSurface }} m² de surface totale</span>
            </div>
            <div class="chart-block">
              <canvas ref="chartCanvas"></canvas>
            </div>
            <div class="chart-block">
              <div class="occupancy-summary ">
                <span class="occupancy-percentage">
                  <span class="percentage">{{ secondBuildingOccupancyRate }}%</span> DES SALLES DE RÉUNIONS SONT OCCUPÉES
                </span>
                <span class="total-surface">{{ totalSurface2.toFixed(2) }} m² de surface totale</span>
              </div>
              <canvas ref="secondChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { HTTP } from '../services/http-constants'; 
import config from '../../config';
import moment from 'moment';

import { getFloors, getOccupancyDataByFloor, getContextId, getCategoryId, getGroupId, getRoomIds, getTotalSurface2 } from '../services/index';
Chart.register(...registerables);

function extractDynamicIdFromResponse(response, endpointName, endpointType) {
  let dynamicId = null;
  response.data.forEach((profile) => {
    const endpoint = profile.endpoints.find(
      (ep) => ep.name === endpointName && ep.type === endpointType
    );
    if (endpoint) {
      dynamicId = endpoint.dynamicId;
    }
  });
  return dynamicId;
}


export default defineComponent({
  name: 'FloorOccupancyDetail',
  
  props: {
    buildingOccupancyRate: {
      type: Number,
      default: 0
    },
    temporality: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const occupancyChart = ref<Chart | null>(null);
    const secondChartCanvas = ref<HTMLCanvasElement | null>(null);
    const secondOccupancyChart = ref<Chart | null>(null);
    const floorData = ref<{ floor: string; occupancy: number; area?: number }[]>([]);
    const secondFloorData = ref<{ floor: string; occupancy: number; area?: number }[]>([]);
    const totalSurface = ref<number>(0);
    const totalSurface2 = ref<number>(0);
    const allFloors = ref<string[]>([]);

    function mapFloorDynamicId(floorDynamicId, floorNames) {
  const matchingKey = Object.keys(floorNames).find(key => floorDynamicId.toString().includes(key));
  return matchingKey ? floorNames[matchingKey] : `Étage ${floorDynamicId}`;
}

    
const fetchFloorData = async (period, timestamp) => {
  try {
    console.log(`Récupération des données des étages pour la période : ${period}`);
    
    // Récupérer les IDs d'occupation et les noms des étages
    const { dynamicIds, floorNames, floorOccupancyMapping } = await getFloorOccupancyDynamicIds();
    console.log('Dynamic IDs:', dynamicIds);
    console.log('Floor Names:', floorNames);
    console.log('Mapping Dynamic ID → Étages:', floorOccupancyMapping);

    if (dynamicIds.length === 0) {
      throw new Error('Aucun Dynamic ID trouvé pour les taux d\'occupation.');
    }

    // Récupérer les taux d'occupation
    const occupancyRates = await getFloorOccupancyRatesByPeriod(period, timestamp, dynamicIds);
    console.log('Occupancy Rates:', occupancyRates);

    // Transformer les Dynamic IDs en noms d'étages
    floorData.value = occupancyRates.map(floor => {
      const realFloorId = floorOccupancyMapping ? floorOccupancyMapping[floor.dynamicId] : null; // Associer au bon étage
      return {
        floor: mapFloorDynamicId(realFloorId, floorNames),
        occupancy: parseFloat(floor.occupancy), // S'assurer que l'occupation est un nombre
        area: floor.area
      };
    });

    console.log('Étages après correction:', floorData.value.map(f => f.floor));

    // Mettre à jour la liste des étages pour le graphique
    allFloors.value = floorData.value.map(floor => floor.floor);
    console.log('Labels envoyés au graphique:', allFloors.value);

    // Rafraîchir les graphiques
    renderChart();
    renderSecondChart();
  } catch (error) {
    console.error("Erreur dans fetchFloorData :", error);
  }
};

const fetchSecondFloorData = async (timestamp) => {
  try {
    const space = { type: 'building' }; // ou 'floor' selon votre besoin
    const tempo = props.temporality.name;

    // Récupérer les IDs nécessaires
    const contextId = await getContextId(config.contextNames.gestionDesEspaces);
    const categoryId = await getCategoryId(contextId, config.categoryNames.typologie);
    const groupId = await getGroupId(contextId, categoryId, config.groupNames.meetingRoom);

    // Récupérer les IDs des salles de réunion
    const roomIds = await getRoomIds(contextId, categoryId, groupId);
    if (!roomIds || roomIds.length === 0) {
      throw new Error('No room IDs found');
    }

    // Appeler getOccupancyDataByFloor avec les IDs des salles
    const [label, data, avg, total, averages, meter] = await getOccupancyDataByFloor(space, tempo, timestamp, roomIds);

    // Mettre à jour les données pour le graphique
    secondFloorData.value = averages.map(floor => ({
      floor: floor.floor,
      occupancy: floor.average,
      area: 0 
    }));

    renderSecondChart();
  } catch (error) {
    console.error("Erreur lors de la récupération des données des étages pour le deuxième graphique:", error);
  }
};

    const fetchTotalSurface = async () => {
      try {
        const buildingId = localStorage.getItem("idBuilding");
        const result = await HTTP.get(`building/${buildingId}/building/read`);
        totalSurface.value = Math.round(result.data.area);
      } catch (error) {
        console.error("Erreur lors de la récupération de la surface totale :", error);
      }
    };
    const fetchTotalSurface2 = async () => {
      try {
        const contextId = await getContextId(config.contextNames.gestionDesEspaces);
        const categoryId = await getCategoryId(contextId,  config.categoryNames.typologie);
        const groupId = await getGroupId(contextId, categoryId, config.groupNames.meetingRoom);
        const roomIds = await getRoomIds(contextId, categoryId, groupId);

        if (!roomIds || roomIds.length === 0) {
          console.error('No Room IDs found. Aborting fetchTotalSurface2.');
          return;
        }

        const result = await getTotalSurface2(roomIds);
        if (result !== null) {
          totalSurface2.value = result;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la surface totale des salles de réunion :", error);
      }
    };
    const getFloorOccupancyDynamicIds = async () => {
  try {
    console.log('Récupération des noms et Dynamic IDs des étages...');
    
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

    // Construire l'objet associant `dynamicId` → `nom d'étage`
    const floorNames = {};
    const floorDynamicIds = floors.map(floor => {
      floorNames[floor.dynamicId] = floor.name; // Associer l'ID dynamique au nom d'étage
      return floor.dynamicId; // Retourner uniquement les IDs
    });

    console.log('Correspondance ID → Nom des étages :', floorNames);

    // Récupérer les endpoints d'occupation associés aux étages
    const response = await HTTP.post(config.apiEndpoints.controlEndpointListMultiple.replace('{buildingId}', buildingId), floorDynamicIds);
    const endpointsData = response.data;

    if (!endpointsData || endpointsData.length === 0) {
      console.error('Aucun endpoint trouvé pour les étages.');
      return { dynamicIds: [], floorNames: {} };
    }
    console.log('Endpoints récupérés :', endpointsData);

    // Extraire les Dynamic IDs des points de contrôle des taux d'occupation
    const dynamicIds = [];
    const floorOccupancyMapping = {}; // Associe chaque Dynamic ID d'occupation à son étage

    endpointsData.forEach(floorEndpointsList => {
      const floorId = floorEndpointsList[0]?.dynamicId; // L'ID de l'étage

      floorEndpointsList.forEach(profile => {
        profile.endpoints.forEach(endpoint => {
          if (endpoint.name === config.endpointCriteria.name && endpoint.type === config.endpointCriteria.type) {
            dynamicIds.push(endpoint.dynamicId);
            floorOccupancyMapping[endpoint.dynamicId] = floorId;
          }
        });
      });
    });

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
};



const getFloorOccupancyRatesByPeriod = async (period, timestamp, dynamicIds) => {
  try {
    console.log(`Fetching floor occupancy rates for period: ${period}`);
    const buildingId = localStorage.getItem('idBuilding');
    if (!buildingId) {
      console.error('No building ID found in localStorage');
      return [];
    }

    const periodArray = getPeriodArray(timestamp, period);
    console.log('Period array from detail:', periodArray);

    console.log('Start date from detail:', periodArray[1]);
    console.log('End date from detail:', periodArray[2]);
    console.log('Dynamic IDs:', dynamicIds);

    const timeSeriesResponse = await HTTP.post(
      config.apiEndpoints.timeSeriesMultiple.replace('{buildingId}', buildingId).replace('{start}', periodArray[1]).replace('{end}', periodArray[2]),
      dynamicIds
    );
    console.log('Time series response:', timeSeriesResponse.data);

    const timeSeriesData = timeSeriesResponse.data;

    const aggregatedData = {};
    dynamicIds.forEach(dynamicId => {
      aggregatedData[dynamicId] = [];
    });

    timeSeriesData.forEach((series, index) => {
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

    console.log('Floor data:', floorData);
    return floorData;
  } catch (error) {
    console.error("Erreur lors de la récupération des taux d'occupation des étages :", error);
    return [];
  }
};

    const buildingOccupancyRate = computed(() => {
      if (floorData.value.length === 0) return 0;
      const totalOccupancy = floorData.value.reduce((sum, floor) => sum + floor.occupancy, 0);
      return (totalOccupancy / floorData.value.length).toFixed(0);
    });

    const secondBuildingOccupancyRate = computed(() => {
      if (secondFloorData.value.length === 0) return 0;
      const totalOccupancy = secondFloorData.value.reduce((sum, floor) => sum + floor.occupancy, 0);
      return (totalOccupancy / secondFloorData.value.length).toFixed(0);
    });

    const renderChart = () => {
      if (chartCanvas.value) {
        const ctx = chartCanvas.value.getContext('2d');
        if (ctx) {
          if (occupancyChart.value) {
            occupancyChart.value.destroy();
          }

          const floorLabels = floorData.value.map(floor => floor.floor);
          const occupancyData = floorLabels.map(floor => {
            const floorDataEntry = floorData.value.find(f => f.floor === floor);
            return floorDataEntry ? floorDataEntry.occupancy : 0;
          });

          const config: ChartConfiguration<'bar'> = {
            type: 'bar',
            data: {
              labels: floorLabels,
              datasets: [{
                label: 'Occupation des étages',
                data: occupancyData,
                backgroundColor: '#1f2937',
                barPercentage: 0.4,
                categoryPercentage: 1,
                borderRadius: 10,
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value, index) => `${occupancyData[index].toFixed(2)}%`,
                    stepSize: 10,
                    font: { size: 15 },
                  }
                },
                y: {
                  display: false,
                },
                x1: {
                  position: 'top',
                  ticks: {
                    font: { size: 15 }
                  }
                },
              },
              layout: {
                padding: {
                  top: 10,
                  bottom: 10
                }
              }
            }
          };

          occupancyChart.value = new Chart(ctx, config);
        }
      } else {
        console.warn("Aucune donnée d'étage disponible pour le graphique");
      }
    };

    const renderSecondChart = () => {
      if (secondChartCanvas.value) {
        const ctx = secondChartCanvas.value.getContext('2d');
        if (ctx) {
          if (secondOccupancyChart.value) {
            secondOccupancyChart.value.destroy();
          }

          const floorLabels = secondFloorData.value.map(floor => floor.floor);
          const occupancyData = secondFloorData.value.map(floor => floor.occupancy);

          const config: ChartConfiguration<'bar'> = {
            type: 'bar',
            data: {
              labels: floorLabels,
              datasets: [{
                label: 'Occupation des salles de réunion',
                data: occupancyData,
                backgroundColor: '#A7001E',
                barPercentage: 0.4,
                categoryPercentage: 1,
                borderRadius: 10,
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value, index) => `${occupancyData[index].toFixed(2)}%`,
                    stepSize: 10,
                    font: { size: 15 }
                  }
                },
                y: {
                  display: false,
                },
              },
              layout: {
                padding: {
                  top: 10,
                  bottom: 10
                }
              }
            }
          };

          secondOccupancyChart.value = new Chart(ctx, config);
        }
      } else {
        console.warn("Aucune donnée d'étage disponible pour le graphique");
      }
    };

    watch(() => props.temporality, async (newTemporality) => {
  await fetchFloorData(newTemporality.name);
  await fetchSecondFloorData();
  await fetchTotalSurface();
  await fetchTotalSurface2(); 
});

onMounted(async () => {
  await fetchFloorData(props.temporality.name);
  await fetchSecondFloorData();
  await fetchTotalSurface();
  await fetchTotalSurface2(); 
});

    return {
      chartCanvas,
      occupancyChart,
      secondChartCanvas,
      buildingOccupancyRate,
      secondBuildingOccupancyRate,
      secondOccupancyChart,
      floorData,
      secondFloorData,
      totalSurface,
      totalSurface2,
      allFloors,
      fetchFloorData, 
      fetchSecondFloorData
    };
  }
});


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
</script>

<style scoped>
.occupancy-details {
  margin-top: 20px;
  width: 100%;
}

.chart-card {
  padding: 16px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 18px;
  border: 1px solid #e0e0e0;
  font-family: "Charlevoix Pro";
  width: 100% !important;  
  font-size: 14px;
}

.chart-container {
  display: flex;
  flex-direction: row;
}

.charts {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.occupancy-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.occupancy-percentage {
  font-family: "Charlevoix Pro";
  font-size: 14px;
  color: #374151;
}
.building-summary {
  margin-left: 112px;
}
.meeting-summary {
  margin-left: 0; /* Pas de marge spécifique */
}
.occupancy-percentage .percentage {
  font-size: 2em; 
}

.total-surface {
  font-size: 16px;
  color: #949DA6;
  font-family: "Charlevoix Pro";
}

.chart-block {
  flex: 1;
    margin-bottom: 20px;
  }

  .chart-title {
    flex: 0 0 100px; 
    font-size: 15px;
    color: #374151;
    text-align: start;
    margin-right: 10px;
    margin-top: 52px;
    font-family: "Charlevoix Pro";
  }

  canvas {
    width: 100% !important;
    height: 200px !important; 
  }
</style>