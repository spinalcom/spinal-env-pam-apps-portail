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
import { getFloorOccupancyDynamicIds, getFloorOccupancyRatesByPeriod } from '../services/index';
import { getFloors } from '../services/index';
import { getRoomPositions } from '../services/index';
import { groupSecondChartsByFloor } from '../services/index';
import { SpinalAPI } from '../services/spinalAPI/spinalAPI';

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
    startTime: {
      type: String,
      default: '00:00',
    },
    endTime: {
      type: String,
      default: '23:59',
    },
  },
  setup(props, { emit }) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const occupancyChart = ref<Chart | null>(null);
    const secondChartCanvas = ref<HTMLCanvasElement | null>(null);
    const secondOccupancyChart = ref<Chart | null>(null);
    const floorData = ref<{ floor: string; occupancy: number | null; area?: number }[]>([]);
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
        console.log("Mapping floorDynamicId:", floorDynamicId);
        console.log("Available floorNames:", floorNames);
      
        // Extraire la clé `dynamicId` si `floorDynamicId` est un objet
        const dynamicId = typeof floorDynamicId === 'object' && floorDynamicId !== null
          ? floorDynamicId.dynamicId
          : floorDynamicId;
      
        console.log("Extracted dynamicId:", dynamicId);
      
        // Trouver le nom correspondant
        const matchingKey = Object.keys(floorNames).find(key => key === dynamicId.toString());
        if (!matchingKey) {
          console.warn(`No matching floor name found for dynamicId: ${dynamicId}`);
        }
        return matchingKey ? floorNames[matchingKey] : `Étage ${dynamicId}`;
      }
const handleTimeChange = async ({ startTime, endTime }) => {
  try {
    console.log("Time changed:", startTime, endTime);
    const timestamp = moment().valueOf();

    // Màj les données pour le premier graphique
    await fetchFloorData(props.temporality.name, timestamp, startTime, endTime);
    renderChart();

    // Màj les données pour le deuxième graphique
    await fetchSecondFloorData(timestamp, startTime, endTime);
    renderSecondChart();

    // Màj les données pour le troisième graphique
    await fetchThirdChartFloorData(timestamp, startTime, endTime);
    renderThirdChart();
  } catch (error) {
    console.error("Erreur lors de la mise à jour des graphiques :", error);
  }
};
    
const fetchFloorData = async (period, timestamp, startTime, endTime) => {
  try {

    // Récupérer les IDs dynamiques et les noms des étages
    const { dynamicIds, floorNames, floorOccupancyMapping } = await getFloorOccupancyDynamicIds();

    if (dynamicIds.length === 0) {
      throw new Error("Aucun Dynamic ID trouvé pour les taux d'occupation.");
    }

    const occupancyRates = await getFloorOccupancyRatesByPeriod(period, timestamp, dynamicIds, startTime, endTime);

    console.log("Taux d'occupation du bâtimrnt récupérés :", occupancyRates);

    // Màj les données pour les étages avec des données d'occupation
    floorData.value = occupancyRates.map(floor => {
      const realFloorId = floorOccupancyMapping ? floorOccupancyMapping[floor.dynamicId] : null;
      return {
        floor: mapFloorDynamicId(realFloorId, floorNames),
        occupancy: parseFloat(floor.occupancy),
        area: floor.area,
      };
    });

    console.log("Données initiales de floorData.value :", floorData.value);

    // Pour identifier les étages sans données d'occupation
    const allFloorsList = await getFloors();/* 
        await this.$store.dispatch('GET_FLOORS', buildingId);
    const allFloorsList = this.$store.state.floors[buildingId]; */
    const floorsWithData = floorData.value.map(floor => floor.floor);
    const floorsWithoutData = allFloorsList
      .map(floor => floor.name)
      .filter(floorName => !floorsWithData.includes(floorName));

    console.log("Étages sans données d'occupation :", floorsWithoutData);

    // j'ajoute les étages sans données d'occupation avec "Aucune donnée"
    floorsWithoutData.forEach(floorName => {
      const existingFloor = floorData.value.find(f => f.floor === floorName);
      if (!existingFloor) {
        floorData.value.push({ floor: floorName, occupancy: null, area: 0 }); // Now occupancy can be null
      }
    });

    console.log("Données finales de floorData.value :", floorData.value);

    // Màj le graphique
    renderChart();
  } catch (error) {
    console.error("Erreur dans fetchFloorData :", error);
  }
};
async function getFloorsWithAndWithoutRooms(roomIds) {
  try {
    const allFloors = await getFloors(); 
    const roomPositions = await getRoomPositions(roomIds); 
    const roomsByFloor = groupSecondChartsByFloor(roomPositions); 

    console.log("Étages avec des salles de réunion :", roomsByFloor);

    // Étape 3 : Identifier les étages sans salles de réunion
    const floorsWithRooms = Object.values(roomsByFloor).map(floor => floor.floorName);
    const floorsWithoutRooms = allFloors
      .map(floor => floor.name)
      .filter(floorName => !floorsWithRooms.includes(floorName));

    console.log("Étages sans salles de réunion :", floorsWithoutRooms);

    return { floorsWithRooms, floorsWithoutRooms };
  } catch (error) {
    console.error("Erreur lors de la récupération des étages avec/sans salles de réunion :", error);
    return { floorsWithRooms: [], floorsWithoutRooms: [] };
  }
}

const fetchSecondFloorData = async (timestamp, startTime, endTime) => {
  try {
    console.log("Fetching second chart data for temporalité:", props.temporality.name);
    const entryPoint = config.entryPoints[0];
    const contextId = await getContextId(entryPoint.context);
    const categoryId = await getCategoryId(contextId, entryPoint.category);
    const groupId = await getGroupId(contextId, categoryId, entryPoint.group);

    const roomIds = await getRoomIds(contextId, categoryId, groupId);
    if (!roomIds?.length) throw new Error("No room IDs found");

    // Pour identifier les étages avec et sans salles de réunion
    const { floorsWithRooms, floorsWithoutRooms } = await getFloorsWithAndWithoutRooms(roomIds);

    console.log("Étages avec des salles de réunion :", floorsWithRooms);
    console.log("Étages sans salles de réunion :", floorsWithoutRooms);

    // Récupération les données d'occupation par étage pour les salles de réunion
    const [label, data, averages] = await getSecondChartOccupancyDataByFloor(
      { type: "building" },
      props.temporality.name,
      timestamp,
      roomIds,
      startTime,
      endTime
    );

    console.log("Données récupérées depuis getSecondChartOccupancyDataByFloor :", { label, data, averages });

    // Màj les données pour les étages avec des salles de réunion
    secondFloorData.value = averages.map(floor => ({
      floor: floor.floor,
      occupancy: floor.average !== null ? floor.average : 0,
      area: 0,
    }));

    // On ajoute les étages sans salles de réunion avec "Aucune donnée"
    floorsWithoutRooms.forEach(floorName => {
      const existingFloor = secondFloorData.value.find(f => f.floor === floorName);
      if (!existingFloor) {
        secondFloorData.value.push({ floor: floorName, occupancy: null, area: 0 });
      }
    });

    // Pour Corriger les étages avec `occupancy: 0` qui devraient être `null`
    secondFloorData.value = secondFloorData.value.map(floor => {
      if (floorsWithoutRooms.includes(floor.floor)) {
        return { ...floor, occupancy: null };
      }
      return floor;
    });

    console.log("Données finales de secondFloorData.value :", secondFloorData.value);

    // POUR Mettre à jour le graphique
    renderSecondChart();
  } catch (error) {
    console.error("Erreur lors de la récupération des données des salles de réunion :", error);
  }
};
const fetchThirdChartFloorData = async (timestamp, startTime, endTime) => {
  try {
    const tempo = props.temporality.name;
    console.log(`Fetching third chart data for temporalité: ${tempo}`);

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
      { type: 'building' }, tempo, timestamp, thirdChartIds, startTime, endTime
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
    console.log("Données finales de thirdChartFloorData.value (complétées) :", thirdChartFloorData.value);

    // Mettre à jour le graphique
    renderThirdChart();

  } catch (error) {
    console.error("Erreur lors de la récupération des données des équipements:", error);
  }
};


    const fetchTotalSurface = async () => {
      try {
        console.log('fetchTotalSurface called');
        const buildingId = localStorage.getItem("idBuilding");
        if (!buildingId) {
          console.error('Building ID not found in localStorage');
          return;
        }
    
        const spinalApi = SpinalAPI.getInstance();
        const url = spinalApi.createUrlWithPlatformId(buildingId, 'api/v1/building/read');
        console.log("Generated URL for fetchTotalSurface:", url);
    
        const result = await spinalApi.get(url);
        console.log('Response from fetchTotalSurface:', result.data);
    
        totalSurface.value = Math.round(result.data.area);
        console.log('Total surface:', totalSurface.value);
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
        if (!chartCanvas.value || !floorData.value.length || !allFloors.value.length) {
          console.warn("Les données ou le canvas ne sont pas prêts pour le graphique.");
          return;
        }
      
        const ctx = chartCanvas.value.getContext('2d');
        if (ctx) {
          if (occupancyChart.value) {
            occupancyChart.value.destroy();
          }
      
          const floorLabels = allFloors.value; // Utiliser tous les étages
          const occupancyData = floorLabels.map(floor => {
            const floorDataEntry = floorData.value.find(f => f.floor === floor);
            return floorDataEntry ? floorDataEntry.occupancy : null; // Null si pas de données
          });
      
          const chartConfig = config.charts.firstChart;
      
          const chartConfiguration: ChartConfiguration<'bar'> = {
            type: 'bar',
            data: {
              labels: floorLabels,
              datasets: [{
                label: chartConfig.label,
                data: occupancyData,
                backgroundColor: occupancyData.map(value => value === null ? '#d3d3d3' : chartConfig.backgroundColor), // Gris pour "Aucune donnée"
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
                      return value === null ? 'Aucune donnée' : `${chartConfig.label}: ${value.toFixed(2)}%`;
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
      };

const renderSecondChart = () => {
  if (!secondChartCanvas.value || !secondFloorData.value.length || !allFloors.value.length) {
    console.warn("Les données ou le canvas ne sont pas prêts pour le second graphique.");
    return;
  }

  const ctx = secondChartCanvas.value.getContext('2d');
  if (ctx) {
    if (secondOccupancyChart.value) {
      secondOccupancyChart.value.destroy();
    }

    const floorLabels = allFloors.value; // Utiliser tous les étages
    const occupancyData = floorLabels.map(floor => {
      const floorDataEntry = secondFloorData.value.find(f => f.floor === floor);
      return floorDataEntry ? floorDataEntry.occupancy : null; // Null si pas de données
    });

    const chartConfig = config.charts.secondChart;

    const chartConfiguration: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: floorLabels,
        datasets: [{
          label: chartConfig.label,
          data: occupancyData,
          backgroundColor: occupancyData.map(value => value === null ? '#d3d3d3' : chartConfig.backgroundColor), // Gris pour "Aucune donnée"
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
                return value === null ? 'Aucune donnée' : `${chartConfig.label}: ${value.toFixed(2)}%`;
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

secondOccupancyChart.value = new Chart(ctx, chartConfiguration);
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

watch(
  () => [props.temporality, props.startTime, props.endTime],
  async ([newTemporality, newStartTime, newEndTime]) => {
    try {
      console.log("Changements détectés :", {
        temporalité: newTemporality.name,
        startTime: newStartTime,
        endTime: newEndTime,
      });

      const timestamp = moment().valueOf();

      // Mettre à jour les données pour le premier graphique
      await fetchFloorData(newTemporality.name, timestamp, newStartTime, newEndTime);
      if (chartCanvas.value && floorData.value.length && allFloors.value.length) {
        renderChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le premier graphique.");
      }

      // Mettre à jour les données pour le deuxième graphique
      await fetchSecondFloorData(timestamp, newStartTime, newEndTime);
      if (secondChartCanvas.value && secondFloorData.value.length && allFloors.value.length) {
        renderSecondChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le deuxième graphique.");
      }

      // Mettre à jour les données pour le troisième graphique
      await fetchThirdChartFloorData(timestamp, newStartTime, newEndTime);
      if (thirdChartCanvas.value && thirdChartFloorData.value.length && allFloors.value.length) {
        renderThirdChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le troisième graphique.");
      }

      // Mettre à jour les surfaces totales et le nombre total d'équipements
      await fetchTotalSurface();
      await fetchTotalSurface2();
      await fetchThirdChartTotalCount();
    } catch (error) {
      console.error("Erreur lors de la mise à jour des graphiques :", error);
    }
  },
  { immediate: true } 
);

onMounted(async () => {
  const timestamp = moment().valueOf(); 
  await fetchFloorData(props.temporality.name, timestamp, props.startTime, props.endTime);
  await fetchSecondFloorData(timestamp, props.startTime, props.endTime);
  await fetchThirdChartFloorData(timestamp, props.startTime, props.endTime);
  await fetchTotalSurface();
  await fetchTotalSurface2();
  await fetchThirdChartTotalCount();

  // Vérifiez si les données sont prêtes avant de rendre le premier graphique
  if (floorData.value.length && allFloors.value.length && chartCanvas.value) {
    renderChart();
  } else {
    console.warn("Les données ou le canvas ne sont pas prêts pour le premier graphique après le chargement initial.");
  }

  // Vérifiez si les données sont prêtes avant de rendre le second graphique
  if (secondFloorData.value.length && allFloors.value.length && secondChartCanvas.value) {
    renderSecondChart();
  } else {
    console.warn("Les données ou le canvas ne sont pas prêts pour le second graphique après le chargement initial.");
  }

  // Vérifiez si les données sont prêtes avant de rendre le troisième graphique
  if (thirdChartFloorData.value.length && allFloors.value.length && thirdChartCanvas.value) {
    renderThirdChart();
  } else {
    console.warn("Les données ou le canvas ne sont pas prêts pour le troisième graphique après le chargement initial.");
  }
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
  displayThirdChart,
  handleTimeChange
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