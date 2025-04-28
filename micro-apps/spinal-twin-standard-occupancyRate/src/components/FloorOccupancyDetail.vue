<template>
  <div class="occupancy-details">
    <v-card class="chart-card">
      <h2>DÉTAIL DE L'OCCUPATION PAR GROUPE EN TEMPS RÉEL</h2>
      <v-card-text>
        <div class="chart-container">
          <div class="chart-title">Étage</div>
          <div class="charts">
             <div v-if="config.charts.globalChart.firstData.display && floorData.length" class="chart-block">
              <div class="occupancy-summary">
                <span class="occupancy-percentage">
                  <span class="percentage">{{ buildingOccupancyRate }}%</span> DU BÂTIMENT EST OCCUPÉ
                </span>
                <span class="total-surface">{{ totalSurface }} m² de surface totale</span>
              </div>
              <canvas ref="chartCanvas"></canvas>
            </div>
            <div v-if="config.charts.globalChart.secondData.display && secondFloorData.length" class="chart-block">
               <div class="occupancy-summary">
                <span class="occupancy-percentage">
                  <span class="percentage">{{ secondBuildingOccupancyRate }}%</span> DES SALLES DE RÉUNIONS SONT OCCUPÉES
                </span>
                <span class="total-surface">{{ totalSurface2.toFixed(2) }} m² de surface totale</span>
              </div>
              <canvas ref="secondChartCanvas"></canvas>
            </div>
             <div v-if="config.charts.globalChart.thirdData.display && thirdChartFloorData.length" class="chart-block">           
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
import {config} from '../config';
import moment from 'moment';
import {getSecondChartOccupancyDataByFloor,
        getTotalSurface2,
        getThirdChartOccupancyDataByFloor,
        getPeriodArray,
        groupSecondChartsByFloor,
        getRoomPositions,
        getFloors,
        getThirdChartData,
        getFloorOccupancyDynamicIds,
        getFloorOccupancyRatesByPeriod,
        fetchTotalSurface,
        initializeData,
        initializeThirdChartData,
        getRoomData,
        fetchThirdChartTotalCount,
        getThirdChartPositions,
        groupThirdChartsByFloor,
        initializeSources,
        cachedRoomEntryPoints,
      } from '../services/index'; 
import { FloorOccupancyMapping } from './interfaces/types';
/* import { SpinalAPI } from '../services/spinalAPI/spinalAPI';
 */


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
    const secondFloorData = ref<{ floor: string; occupancy: number | null; area?: number }[]>([]);
    const totalSurface = ref<number>(0);
    const totalSurface2 = ref<number>(0);
    const allFloors = ref<string[]>([]);
    const thirdChartCanvas = ref<HTMLCanvasElement | null>(null);
    const thirdChartOccupancyChart = ref<Chart | null>(null);
    const thirdChartFloorData = ref<{ floor: string; occupancy: number; area?: number }[]>([]);
    const thirdChartTotalCount = ref<number>(0);

    
      let firstChartCache = {
      dynamicIds: null as string[] | null,
      floorNames: null as Record<string, string> | null,
      floorOccupancyMapping: null as FloorOccupancyMapping | null,
    };
    
    let secondChartCache = {
      roomIds: null as string[] | null,
      floorsWithRooms: null as string[] | null,
      floorsWithoutRooms: null as string[] | null,
    };
    
    let thirdChartCache = {
      thirdChartIds: null as string[] | null,
      floorNames: null as Record<string, string> | null,
      thirdChartPositions: [] as any[],
      equipmentsByFloor: {} as Record<string, { floorName: string; equipments: string[] }>,
      dynamicIdsByFloor: {} as Record<string, string[]>,
    };


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
   
// Ajoutez des caches locaux pour stocker les résultats
let cachedDynamicIds: string[] | null = null;
let cachedFloorOccupancyMapping: FloorOccupancyMapping | null = null;
let isFetchingFirstChart = false;

const fetchFloorData = async (period, timestamp, startTime, endTime) => {
  if (isFetchingFirstChart) {
    console.warn("fetchFloorData déjà en cours d'exécution.");
    return;
  }
  isFetchingFirstChart = true;

  try {
    console.log("Fetching floor data for temporalité:", period);

    if (!firstChartCache.dynamicIds || !firstChartCache.floorNames || !firstChartCache.floorOccupancyMapping) {
      console.log("Fetching dynamic IDs and floor names...");
      const { dynamicIds, floorNames, floorOccupancyMapping } = await getFloorOccupancyDynamicIds();
      if (dynamicIds.length === 0) {
        throw new Error("Aucun Dynamic ID trouvé pour les taux d'occupation.");
      }
      firstChartCache.dynamicIds = dynamicIds;
      firstChartCache.floorNames = floorNames;
      console.log("Noms des étages récupérés :", floorNames);
      firstChartCache.floorOccupancyMapping = floorOccupancyMapping;
    } else {
      console.log("Using cached dynamic IDs and floor names.");
    }

    const occupancyRates = await getFloorOccupancyRatesByPeriod(
      period,
      timestamp,
      firstChartCache.dynamicIds,
      startTime,
      endTime
    );

    console.log("Données récupérées pour les taux d'occupation :", occupancyRates);

    floorData.value = occupancyRates.map(floor => {
      const realFloorId = firstChartCache.floorOccupancyMapping
      ? firstChartCache.floorOccupancyMapping[floor.dynamicId]
      : null;
      return {
      floor: mapFloorDynamicId(realFloorId, firstChartCache.floorNames),
      occupancy: parseFloat(floor.occupancy),
      area: floor.area,
      };
    });

    console.log("Données formatées pour floorData :", floorData.value);

    renderChart();
  } catch (error) {
    console.error("Erreur dans fetchFloorData :", error);
  } finally {
    isFetchingFirstChart = false;
  }
};
const fetchTotalSurfaceWrapper = async () => {
  try {
    const surface = await fetchTotalSurface();
    if (surface !== null) {
      totalSurface.value = surface;
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à fetchTotalSurface :", error);
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

    // Créer un mapping entre `dynamicId` et `floorName`
    const floorMapping = {};
    allFloors.forEach(floor => {
      floorMapping[floor.dynamicId] = floor.name;
    });

    console.log("Mapping entre dynamicId et floorName :", floorMapping);

    return { floorsWithRooms, floorsWithoutRooms, floorMapping };
  } catch (error) {
    console.error("Erreur lors de la récupération des étages avec/sans salles de réunion :", error);
    return { floorsWithRooms: [], floorsWithoutRooms: [], floorMapping: {} };
  }
}

// Ajoutez des caches locaux pour stocker les résultats
let cachedRoomIds: string[] | null = null;
let cachedFloorsWithRooms: string[] | null = null;
let cachedFloorsWithoutRooms: string[] | null;
let isFetchingSecondChart = false;

const fetchSecondFloorData = async (timestamp, startTime, endTime) => {
  if (isFetchingSecondChart) {
    console.warn("fetchSecondFloorData déjà en cours d'exécution.");
    return;
  }
  isFetchingSecondChart = true;

  try {
    console.log("Fetching second chart data for temporalité:", props.temporality.name);
    // Réinitialiser les caches
    secondChartCache.roomIds = null;
    secondChartCache.floorsWithRooms = null;
    secondChartCache.floorsWithoutRooms = null;

    if (!secondChartCache.roomIds) {
      console.log("Fetching room IDs...");
      secondChartCache.roomIds = Object.values(await getRoomData()).flat();
      if (!secondChartCache.roomIds || secondChartCache.roomIds.length === 0) {
        throw new Error("Aucun ID de salle trouvé.");
      }
    }

    if (!secondChartCache.floorsWithRooms || !secondChartCache.floorsWithoutRooms) {
      console.log("Fetching floors with and without rooms...");
      const { floorsWithRooms, floorsWithoutRooms, floorMapping } = await getFloorsWithAndWithoutRooms(secondChartCache.roomIds);
      secondChartCache.floorsWithRooms = floorsWithRooms;
      secondChartCache.floorsWithoutRooms = floorsWithoutRooms;
      secondChartCache.floorMapping = floorMapping; // Stocker le mapping dans le cache
    }

    const [label, data, averages] = await getSecondChartOccupancyDataByFloor(
      { type: "building" },
      props.temporality.name,
      timestamp,
      secondChartCache.roomIds,
      startTime,
      endTime
    );

    // Ajouter tous les étages (avec et sans salles)
    const allFloors = [...secondChartCache.floorsWithRooms, ...secondChartCache.floorsWithoutRooms];
    secondFloorData.value = allFloors.map(floorName => {
      const dynamicId = Object.keys(secondChartCache.floorMapping).find(id => secondChartCache.floorMapping[id] === floorName);
      const floorDataEntry = averages.find(floor => floor.floor === floorName);
      return {
        floor: floorName,
        occupancy: floorDataEntry ? floorDataEntry.average : null, // Null si pas de données
        area: 0,
      };
    });
    console.log("Données pour le deuxieme graphiquesecondFloorData :", secondFloorData.value );

    renderSecondChart();
  } catch (error) {
    console.error("Erreur dans fetchSecondFloorData :", error);
  } finally {
    isFetchingSecondChart = false;
  }
};
// Ajoutez des caches locaux pour stocker les résultats
let cachedThirdChartIds: string[] | null = null;
let cachedFloorNames: Record<string, string> | null = null;
  let isFetchingThirdChart = false;

const fetchThirdChartFloorData = async (timestamp, startTime, endTime) => {
  if (isFetchingThirdChart) {
    console.warn("fetchThirdChartFloorData déjà en cours d'exécution.");
    return;
  }
  isFetchingThirdChart = true;

  try {
    console.log("Fetching third chart data...");
        thirdChartCache.thirdChartIds = null;
    thirdChartCache.equipmentsByFloor = {};
    thirdChartCache.dynamicIdsByFloor = {};
    // Étape 1 : Récupérer les IDs des équipements
    if (!thirdChartCache.thirdChartIds) {
      console.log("Fetching third chart IDs...");
      thirdChartCache.thirdChartIds = await getThirdChartData();
      if (!thirdChartCache.thirdChartIds || thirdChartCache.thirdChartIds.length === 0) {
        throw new Error("Aucun ID d'équipement trouvé.");
      }
    }

    // Étape 2 : Récupérer les étages avec et sans équipements
    if (!thirdChartCache.equipmentsByFloor || !Object.keys(thirdChartCache.equipmentsByFloor).length) {
      console.log("Fetching floors with and without equipments...");
      const { floorsWithEquipments, floorsWithoutEquipments, floorMapping } = await getFloorsWithAndWithoutEquipments(thirdChartCache.thirdChartIds);
      thirdChartCache.equipmentsByFloor = groupThirdChartsByFloor(await getThirdChartPositions(thirdChartCache.thirdChartIds));
      thirdChartCache.floorNames = floorMapping;
      thirdChartCache.floorsWithEquipments = floorsWithEquipments;
      thirdChartCache.floorsWithoutEquipments = floorsWithoutEquipments;
    }

    // Étape 3 : Récupérer les données d'occupation
    const [label, data, averages] = await getThirdChartOccupancyDataByFloor(
      { type: "building" },
      props.temporality.name,
      timestamp,
      thirdChartCache.thirdChartIds,
      startTime,
      endTime
    );

    console.log("Données d'occupation récupérées :", averages);

    // Étape 4 : Ajouter tous les étages (avec et sans équipements)
    const allFloors = [...thirdChartCache.floorsWithEquipments, ...thirdChartCache.floorsWithoutEquipments];
    thirdChartFloorData.value = allFloors.map(floorName => {
      // Trouver l'ID dynamique correspondant au nom de l'étage
      const dynamicId = Object.keys(thirdChartCache.floorNames).find(id => thirdChartCache.floorNames[id] === floorName);

      // Trouver les données d'occupation pour cet ID dynamique
      const floorDataEntry = averages.find(floor => floor.floor === dynamicId);

      return {
        floor: floorName,
        occupancy: floorDataEntry ? floorDataEntry.average : null, // Null si pas de données
        area: 0,
      };
    });

    console.log("Données pour le troisième graphique :", thirdChartFloorData.value);
    renderThirdChart();
  } catch (error) {
    console.error("Erreur dans fetchThirdChartFloorData :", error);
  } finally {
    isFetchingThirdChart = false;
  }
};
async function getFloorsWithAndWithoutEquipments(equipmentIds: string[]): Promise<{ floorsWithEquipments: string[]; floorsWithoutEquipments: string[]; floorMapping: Record<string, string> }> {
  try {
    // Étape 1 : Récupérer tous les étages du bâtiment
    const allFloors = await getFloors();
    if (!allFloors || allFloors.length === 0) {
      throw new Error("Aucun étage trouvé dans le bâtiment.");
    }

    // Créer un mapping entre IDs dynamiques et noms des étages
    const floorMapping: Record<string, string> = {};
    allFloors.forEach(floor => {
      floorMapping[floor.dynamicId] = floor.name;
    });

    // Étape 2 : Récupérer les positions des équipements
    const equipmentPositions = await getThirdChartPositions(equipmentIds);
    if (!equipmentPositions || equipmentPositions.length === 0) {
      console.warn("Aucune position d'équipement trouvée.");
    }

    // Étape 3 : Regrouper les équipements par étage
    const equipmentsByFloor = groupThirdChartsByFloor(equipmentPositions);
    console.log("Équipements regroupés par étage :", equipmentsByFloor);

    // Étape 4 : Identifier les étages avec et sans équipements
    const floorsWithEquipments = Object.values(equipmentsByFloor).map(floor => floor.floorName);
    const floorsWithoutEquipments = allFloors
      .map(floor => floor.name)
      .filter(floorName => !floorsWithEquipments.includes(floorName));

    console.log("Étages avec équipements :", floorsWithEquipments);
    console.log("Étages sans équipements :", floorsWithoutEquipments);

    return { floorsWithEquipments, floorsWithoutEquipments, floorMapping };
  } catch (error) {
    console.error("Erreur lors de la récupération des étages avec/sans équipements :", error);
    return { floorsWithEquipments: [], floorsWithoutEquipments: [], floorMapping: {} };
  }
}

const fetchTotalSurface2 = async () => {
  try {
    console.log("Fetching total surface for meeting rooms...");

    // Utiliser getRoomData pour récupérer les roomIds
    const roomIds = await getRoomData();
    if (!roomIds || roomIds.length === 0) {
      throw new Error("Aucun ID de salle trouvé.");
    }

    // Calculer la surface totale des salles
    const result = await getTotalSurface2(Object.values(roomIds).flat());
    if (result !== null) {
      totalSurface2.value = result;
    }

    console.log(`Surface totale des salles de réunion : ${totalSurface2.value} m²`);
  } catch (error) {
    console.error("Erreur lors de la récupération de la surface totale des salles de réunion :", error);
  }
};


    const buildingOccupancyRate = computed(() => {
      if (floorData.value.length === 0) return 0;
      const totalOccupancy = floorData.value.reduce((sum, floor) => sum + floor.occupancy, 0);
      return (totalOccupancy / floorData.value.length).toFixed(3);
    });

    const secondBuildingOccupancyRate = computed(() => {
      if (secondFloorData.value.length === 0) return 0;
      const totalOccupancy = secondFloorData.value.reduce((sum, floor) => sum + floor.occupancy, 0);
      return (totalOccupancy / secondFloorData.value.length).toFixed(3);
    });

    const thirdChartOccupancyRate = computed(() => {
      if (thirdChartFloorData.value.length === 0) return 0;
      const totalOccupancy = thirdChartFloorData.value.reduce((sum, floor) => sum + floor.occupancy, 0);
      return (totalOccupancy / thirdChartFloorData.value.length).toFixed(3);
    });

const renderChart = () => {
  if (!chartCanvas.value || !floorData.value.length || !firstChartCache.floorNames) {
    console.warn("Les données ou le canvas ne sont pas prêts pour le premier graphique.");
    return;
  }

  const ctx = chartCanvas.value.getContext('2d');
  if (ctx) {
    if (occupancyChart.value) {
      occupancyChart.value.destroy();
    }

    const floorLabels = Object.values(firstChartCache.floorNames); // Utiliser les noms des étages depuis le cache
    const occupancyData = floorLabels.map(floor => {
      const floorDataEntry = floorData.value.find(f => f.floor === floor);
      return floorDataEntry ? floorDataEntry.occupancy : null; // Null si pas de données
    });

    const chartConfig = config.charts.byFloorChart.firstData;

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
                return value === null ? 'Aucune donnée' : `${chartConfig.label}: ${value.toFixed(3)}%`;
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
                return dataValue === null ? 'Aucune donnée' : `${dataValue.toFixed(3)}%`;
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
  if (!secondChartCanvas.value || !secondFloorData.value.length) {
    console.warn("Les données ou le canvas ne sont pas prêts pour le second graphique.");
    return;
  }

  const ctx = secondChartCanvas.value.getContext('2d');
  if (ctx) {
    if (secondOccupancyChart.value) {
      secondOccupancyChart.value.destroy();
    }

    const floorLabels = secondFloorData.value.map(floor => floor.floor);
    const occupancyData = secondFloorData.value.map(floor => floor.occupancy);

    const chartConfig = config.charts.byFloorChart.secondData;

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
                return value === null ? 'Aucune donnée' : `${chartConfig.label}: ${value.toFixed(3)}%`;
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
                return dataValue === null ? 'Aucune donnée' : `${dataValue.toFixed(3)}%`;
              },
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
  if (!thirdChartCanvas.value || !thirdChartFloorData.value.length) {
    console.warn("Les données ou le canvas ne sont pas prêts pour le troisième graphique.");
    console.log("Canvas:", thirdChartCanvas.value);
    console.log("Données du graphique :", thirdChartFloorData.value);
    return;
  }

  const ctx = thirdChartCanvas.value.getContext('2d');
  if (ctx) {
    if (thirdChartOccupancyChart.value) {
      thirdChartOccupancyChart.value.destroy();
    }

    const floorLabels = thirdChartFloorData.value.map(floor => floor.floor);
    const occupancyData = thirdChartFloorData.value.map(floor => floor.occupancy);

    const chartConfig = config.charts.byFloorChart.thirdData;

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
                return value === null ? 'Aucune donnée' : `${chartConfig.label}: ${value.toFixed(3)}%`;
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
                return dataValue === null ? 'Aucune donnée' : `${dataValue.toFixed(3)}%`;
              },
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

    thirdChartOccupancyChart.value = new Chart(ctx, chartConfiguration);
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

      // Mettre à jour les données pour les graphiques
      await fetchFloorData(newTemporality.name, timestamp, newStartTime, newEndTime);
      if (chartCanvas.value && floorData.value.length && allFloors.value.length) {
        renderChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le premier graphique.");
      }

      await fetchSecondFloorData(timestamp, newStartTime, newEndTime);
      if (secondChartCanvas.value && secondFloorData.value.length && allFloors.value.length) {
        renderSecondChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le deuxième graphique.");
      }

      await fetchThirdChartFloorData(timestamp, newStartTime, newEndTime);
      if (thirdChartCanvas.value && thirdChartFloorData.value.length && allFloors.value.length) {
        renderThirdChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le troisième graphique.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des graphiques :", error);
    }
  }
);

onMounted(async () => {
  try {
    console.log("Initialisation des données et des graphiques...");

    // Étape 1 : Initialiser les sources globales
    await initializeSources();
    console.log('Room Entry Points:', cachedRoomEntryPoints);

    // === Premier graphique ===
    try {
      console.log("Initialisation des données pour le premier graphique...");
      const timestamp = moment().valueOf();
      await fetchFloorData(props.temporality.name, timestamp, props.startTime, props.endTime);
      await fetchTotalSurfaceWrapper(); 
      if (floorData.value.length && chartCanvas.value) {
        renderChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le premier graphique.");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du premier graphique :", error);
    }


    // === Deuxième graphique ===
    try {
      console.log("Initialisation des données pour le deuxième graphique...");

      // 1. Récupérer les IDs des salles
      const roomIds = await getRoomData();
      if (!roomIds || Object.keys(roomIds).length === 0) {
        throw new Error("Les données nécessaires pour les salles de réunion ne sont pas initialisées.");
      }

      // 2. Initialiser les données pour les salles
      await initializeData(Object.values(roomIds).flat());

      // 3. Récupérer les données d'occupation
      const timestamp = moment().valueOf();
      await fetchSecondFloorData(timestamp, props.startTime, props.endTime);
      await fetchTotalSurface2(); // Surface totale des salles de réunion

      // 4. Afficher le graphique si les données sont prêtes
      if (secondFloorData.value.length && secondChartCanvas.value) {
        renderSecondChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le deuxième graphique.");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du deuxième graphique :", error);
    }

    // === Troisième graphique ===
    try {
      console.log("Initialisation des données pour le troisième graphique...");
      const thirdChartIds = await getThirdChartData();
      if (!thirdChartIds || thirdChartIds.length === 0) {
        throw new Error("Aucun ID d'équipement trouvé.");
      }

      await initializeThirdChartData(thirdChartIds);
      const timestamp = moment().valueOf();
      await fetchThirdChartFloorData(timestamp, props.startTime, props.endTime);

      const totalCount = await fetchThirdChartTotalCount(); // Nombre total d'équipements
      thirdChartTotalCount.value = totalCount;

      if (thirdChartFloorData.value.length && thirdChartCanvas.value) {
        renderThirdChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le troisième graphique.");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du troisième graphique :", error);
    }

    console.log("Initialisation terminée avec succès.");
  } catch (error) {
    console.error("Erreur dans onMounted :", error);
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
  fetchTotalSurfaceWrapper,
  fetchFloorData, 
  fetchSecondFloorData,
  fetchThirdChartFloorData,
  fetchThirdChartTotalCount,
  handleTimeChange,
  config // Add config to the return object
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