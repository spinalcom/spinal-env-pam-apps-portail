<template>
  <div class="occupancy-details">
    <v-card class="chart-card">
      <h2>DÉTAIL DE L'OCCUPATION PAR GROUPE EN TEMPS RÉEL</h2>
      <v-card-text>
        <div class="chart-container">
          <div class="chart-title">Étage</div>
          <div class="charts">
            <div v-if="displayBuildingOccupancyChart" class="chart-block">
              <div class="occupancy-summary">
                <span class="occupancy-percentage ">
                  <span class="percentage">{{ buildingOccupancyRate }}%</span> DU BÂTIMENT EST OCCUPÉ
                </span>
                <span class="total-surface">{{ totalSurface }} m² de surface totale</span>
              </div>
              <canvas ref="chartCanvas"></canvas>
            </div>
            <div v-if="displaySecondChart" class="chart-block">
              <div class="occupancy-summary ">
                <span class="occupancy-percentage">
                  <span class="percentage">{{ secondBuildingOccupancyRate }}%</span> DES SALLES DE RÉUNIONS SONT OCCUPÉES
                </span>
                <span class="total-surface">{{ totalSurface2.toFixed(2) }} m² de surface totale</span>
              </div>
              <canvas ref="secondChartCanvas"></canvas>
            </div>
            <div v-if="displayThirdChart" class="chart-block">
              <div class="occupancy-summary">
                <span class="occupancy-percentage">
                  <span class="percentage">{{ thirdChartOccupancyRate }}%</span> DES POSITIONS DE TRAVAIL SONT OCCUPÉES
                </span>
                <span class="total-surface">{{ thirdChartTotalCount }} positions de travail</span>
              </div>
              <canvas ref="thirdChartCanvas"></canvas>
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
import { getSecondChartOccupancyDataByFloor, getContextId, getCategoryId, getGroupId, getRoomIds, getTotalSurface2, getThirdChartCategoryId, getThirdChartContextId, getThirdChartGroupId, getThirdChartIds, getThirdChartOccupancyDataByFloor, getPeriodArray } from '../services/index'; 
Chart.register(...registerables);

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
    },
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
    const thirdChartCanvas = ref<HTMLCanvasElement | null>(null);
    const thirdChartOccupancyChart = ref<Chart | null>(null);
    const thirdChartFloorData = ref<{ floor: string; occupancy: number; area?: number }[]>([]);
    const thirdChartTotalCount = ref<number>(0);
    const displayBuildingOccupancyChart = ref(config.displayBuildingOccupancyChart);
    const displayThirdChart = ref(config.displayThirdChart);
    const displaySecondChart = ref(config.displaySecondChart);


    function mapFloorDynamicId(floorDynamicId, floorNames) {
  const matchingKey = Object.keys(floorNames).find(key => floorDynamicId.toString().includes(key));
  return matchingKey ? floorNames[matchingKey] : `Étage ${floorDynamicId}`;
}

    
const fetchFloorData = async (period, timestamp) => {
  try {
    
    // Récupérer les IDs d'occupation et les noms des étages
    const { dynamicIds, floorNames, floorOccupancyMapping } = await getFloorOccupancyDynamicIds();

    if (dynamicIds.length === 0) {
      throw new Error('Aucun Dynamic ID trouvé pour les taux d\'occupation.');
    }

    // Récupérer les taux d'occupation
    const occupancyRates = await getFloorOccupancyRatesByPeriod(period, timestamp, dynamicIds);

    // Transformer les Dynamic IDs en noms d'étages
    floorData.value = occupancyRates.map(floor => {
      const realFloorId = floorOccupancyMapping ? floorOccupancyMapping[floor.dynamicId] : null; 
      return {
        floor: mapFloorDynamicId(realFloorId, floorNames),
        occupancy: parseFloat(floor.occupancy), // pour s'assurer que l'occupation est un nombre
        area: floor.area
      };
    });


    // Mettre à jour la liste des étages pour le graphique
    allFloors.value = floorData.value.map(floor => floor.floor);
    // Rafraîchir les graphiques
    renderChart();
    renderSecondChart();
  } catch (error) {
    console.error("Erreur dans fetchFloorData :", error);
  }
};

const fetchSecondFloorData = async (timestamp) => {
  try {
    const tempo = props.temporality.name;

    const entryPoint = config.entryPoints[0]; 

    const [contextId, categoryId, groupId] = await Promise.all([
      getContextId(entryPoint.context),
      getCategoryId(await getContextId(entryPoint.context), entryPoint.category),
      getGroupId(await getContextId(entryPoint.context), await getCategoryId(await getContextId(entryPoint.context), entryPoint.category), entryPoint.group)
    ]);

    const roomIds = await getRoomIds(contextId, categoryId, groupId);
    if (!roomIds?.length) throw new Error('No room IDs found');

    const [label, data, averages] = await getSecondChartOccupancyDataByFloor(
      { type: 'building' }, tempo, timestamp, roomIds
    );

    const { floorNames } = await getFloorOccupancyDynamicIds();

    secondFloorData.value = averages.map(floor => ({
      floor: floorNames[floor.floor] || `${floor.floor}`,
      occupancy: floor.average !== null ? floor.average : 0,
      area: 0 
    }));

    allFloors.value = Object.values(floorNames);

    secondFloorData.value = allFloors.value.map(floor => {
      const existingData = secondFloorData.value.find(f => f.floor === floor);
      return existingData || { floor, occupancy: null, area: 0 }; 
    });

    renderSecondChart();

  } catch (error) {
    console.error("Erreur lors de la récupération des données des salles de réunion:", error);
  }
};
const fetchThirdChartFloorData = async (timestamp) => {
      try {
        const tempo = props.temporality.name;

        const entryPoint = config.entryPoints[1]; // Accéder directement au deuxième élément

        // Récupérer les IDs nécessaires en parallèle
        const [contextId, categoryId, groupId] = await Promise.all([
        getThirdChartContextId(entryPoint.context),
        getThirdChartCategoryId(await getThirdChartContextId(entryPoint.context), entryPoint.category),
        getThirdChartGroupId(await getThirdChartContextId(entryPoint.context), await getThirdChartCategoryId(await getThirdChartContextId(entryPoint.context), entryPoint.category), entryPoint.group)
        ]);

        // Récupérer les IDs des équipements
        const thirdChartIds = await getThirdChartIds(contextId, categoryId, groupId);
        if (!thirdChartIds?.length) throw new Error('No equipment IDs found');

        // Récupérer les données d'occupation par étage
        const [label, data, averages] = await getThirdChartOccupancyDataByFloor(
          { type: 'building' }, tempo, timestamp, thirdChartIds
        );

        // Récupérer le mapping ID → Nom d'étage
        const { floorNames } = await getFloorOccupancyDynamicIds();

        // Mettre à jour les données pour le graphique
        thirdChartFloorData.value = averages.map(floor => ({
          floor: floorNames[floor.floor] || ` ${floor.floor}`,
          occupancy: floor.average,
          area: 0 
        }));

        // Ajouter tous les étages, même ceux sans positions de travail
        allFloors.value = Object.values(floorNames); 

        // Compléter les données d'occupation avec null pour les étages sans équipement
        thirdChartFloorData.value = allFloors.value.map(floor => {
        const existingData = thirdChartFloorData.value.find(f => f.floor === floor);
        return existingData || { floor, occupancy: null, area: 0 }; 
        });

        // Mettre à jour le graphique
        renderThirdChart();

      } catch (error) {
        console.error("Erreur lors de la récupération des données des équipements:", error);
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
        const entryPoint = config.entryPoints[0]; // Accéder directement au premier élément
        const contextId = await getContextId(entryPoint.context);
        const categoryId = await getCategoryId(contextId, entryPoint.category);
        const groupId = await getGroupId(contextId, categoryId, entryPoint.group);
        const roomIds = await getRoomIds(contextId, categoryId, groupId);

        if (!roomIds || roomIds.length === 0) {
          throw new Error('No room IDs found');
        }

        const result = await getTotalSurface2(roomIds);
        if (result !== null) {
          totalSurface2.value = result;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la surface totale des salles de réunion :", error);
      }
    };

const fetchThirdChartTotalCount = async () => {
      try {
        const entryPoint = config.entryPoints[1]; // Accéder directement au deuxième élément
        const contextId = await getThirdChartContextId(entryPoint.context);
        const categoryId = await getThirdChartCategoryId(contextId, entryPoint.category);
        const groupId = await getThirdChartGroupId(contextId, categoryId, entryPoint.group);
        const thirdChartIds = await getThirdChartIds(contextId, categoryId, groupId);

        if (!thirdChartIds || thirdChartIds.length === 0) {
          throw new Error('No equipment IDs found');
        }

        thirdChartTotalCount.value = thirdChartIds.length;
        console.log('Total Equipment Count:', thirdChartTotalCount.value);
      } catch (error) {
        console.error("Erreur lors de la récupération du nombre total d'équipements :", error);
      }
    };


const getFloorOccupancyDynamicIds = async () => {
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

    const dynamicIds = [];
    const floorOccupancyMapping = {}; 

    combinedResults.forEach(floorEndpointsList => {
      const floorId = floorEndpointsList[0]?.dynamicId;

      floorEndpointsList.forEach(profile => {
        profile.endpoints.forEach(endpoint => {
          if (
            endpoint.name.trim().toLowerCase() === config.entryPoints[0].source[0].name.trim().toLowerCase() &&
            endpoint.type.trim().toLowerCase() === config.entryPoints[0].source[0].type.trim().toLowerCase()
          ) {
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

    const thirdChartOccupancyRate = computed(() => {
      if (thirdChartFloorData.value.length === 0) return 0;
      const totalOccupancy = thirdChartFloorData.value.reduce((sum, floor) => sum + floor.occupancy, 0);
      return (totalOccupancy / thirdChartFloorData.value.length).toFixed(0);
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

      const chartConfig = config.charts.firstChart;

      const chartConfiguration: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: floorLabels,
          datasets: [{
            label: chartConfig.label,
            data: occupancyData,
            backgroundColor: chartConfig.backgroundColor,
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
              display: true,
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

      occupancyChart.value = new Chart(ctx, chartConfiguration);
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

      const floorLabels = allFloors.value;
      const occupancyData = floorLabels.map(floor => {
        const floorDataEntry = secondFloorData.value.find(f => f.floor === floor);
        return floorDataEntry ? floorDataEntry.occupancy : null;
      });

      const chartConfig = config.charts.secondChart;

      const chartConfiguration: ChartConfiguration<'bar'> = {
        type: 'bar',  
        data: {
          labels: floorLabels,
          datasets: [{
            label: chartConfig.label,
            data: occupancyData,
            backgroundColor: occupancyData.map(value => value === null ? '#d3d3d3' : chartConfig.backgroundColor),
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
            tooltip: {
              enabled: true,
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  return value === null ? 'Aucune donnée' : `${config.charts.secondChart.label}: ${value.toFixed(2)}%`; 
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (value, index) => {
                  const dataValue = occupancyData[index];
                  return dataValue === null ? 'Aucune donnée' : `${dataValue.toFixed(2)}%`;
                },
                stepSize: 10,
                font: { size: 15 },
              }
            },
            y: {
              display: false,
            },
            x1: {
              display: false,
              position: 'top',
              ticks: {
                callback: (value, index) => `${floorLabels[index]}`,
                font: { size: 15 }
              }
            }
          }
        }
      };

      secondOccupancyChart.value = new Chart(ctx, chartConfiguration);
    }
  }
};

const renderThirdChart = () => {
  if (thirdChartCanvas.value) {
    const ctx = thirdChartCanvas.value.getContext('2d');
    if (ctx) {
      if (thirdChartOccupancyChart.value) {
        thirdChartOccupancyChart.value.destroy();
      }

      const floorLabels = allFloors.value;
      const occupancyData = floorLabels.map(floor => {
        const floorDataEntry = thirdChartFloorData.value.find(f => f.floor === floor);
        return floorDataEntry ? floorDataEntry.occupancy : null;
      });

      const chartConfig = config.charts.thirdChart;

      const chartConfiguration: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: floorLabels,
          datasets: [{
            label: chartConfig.label,
            data: occupancyData,
            backgroundColor: occupancyData.map(value => value === null ? '#d3d3d3' : chartConfig.backgroundColor),
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
            tooltip: {
              enabled: true,
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                    return value === null ? 'Aucune donnée' : `${config.charts.thirdChart.label}: ${value.toFixed(2)}%`;
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (value, index) => {
                  const dataValue = occupancyData[index];
                  return dataValue === null ? 'Aucune donnée' : `${dataValue.toFixed(2)}%`;
                },
                stepSize: 10,
                font: { size: 15 },
              }
            },
            y: {
              display: false,
            },
            x1: {
              display: false,
              position: 'top',
              ticks: {
                callback: (value, index) => `${floorLabels[index]}`,
                font: { size: 15 }
              }
            }
          }
        }
      };

      thirdChartOccupancyChart.value = new Chart(ctx, chartConfiguration);
    }
  }
};

watch(() => props.temporality, async (newTemporality) => {
  await fetchFloorData(newTemporality.name);
  await fetchSecondFloorData();
  await fetchThirdChartFloorData(timestamp);
  await fetchTotalSurface();
  await fetchTotalSurface2();
  await fetchThirdChartTotalCount();
});

onMounted(async () => {
  await fetchFloorData(props.temporality.name);
  await fetchSecondFloorData();
  await fetchThirdChartFloorData();
  await fetchTotalSurface();
  await fetchTotalSurface2();
  await fetchThirdChartTotalCount();
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
  thirdChartCanvas,
  thirdChartOccupancyChart,
  thirdChartFloorData,
  totalSurface,
  totalSurface2,
  thirdChartTotalCount,
  thirdChartOccupancyRate,
  allFloors,
  fetchFloorData, 
  fetchSecondFloorData,
  fetchThirdChartFloorData,
  fetchThirdChartTotalCount,
  displayBuildingOccupancyChart,
  displaySecondChart,
  displayThirdChart
};
  }
});
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