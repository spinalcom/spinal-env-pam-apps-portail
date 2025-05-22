<template>
  <div class="occupancy-details">
    <v-card class="chart-card">
      <h2>DÉTAIL DE L'OCCUPATION PAR GROUPE EN TEMPS RÉEL</h2>
      <v-card-text>
        <div class="chart-container">
          <div class="chart-title">Étage</div>
          <div class="charts">

            <!-- Premier graphique : cachedBuildingEntryPoints -->
            <div v-if="showBuildingChart" class="chart-block">
              <div class="occupancy-summary">
                <span class="occupancy-percentage">
                  <span class="percentage">{{ buildingOccupancyRate }}%</span> DU BÂTIMENT EST OCCUPÉ
                </span>
                <span class="total-surface">{{ totalSurface }} m² de surface totale</span>
              </div>
              <canvas ref="chartCanvas"></canvas>
            </div>

            <div v-if="showRoomChart" class="chart-block">
              <div v-for="entryPoint in cachedRoomEntryPoints" :key="entryPoint.name" class="entry-point-summary">
                <div class="occupancy-summary">
                  <span class="occupancy-percentage">
                    <span class="percentage">{{ getOccupancyRateByEntryPoint(entryPoint.name) }}%</span> DES SALLES DE RÉUNIONS SONT OCCUPÉES
                  </span>
                  <span class="total-surface">
                    {{ getSurfaceByEntryPoint(entryPoint.name) }} m² de surface totale
                  </span>
                </div>
                <canvas :ref="el => secondChartCanvasRefs[entryPoint.name] = el"></canvas>
              </div>
            </div>

            <!-- Troisième graphique : cachedEquipmentEntryPoints -->
            <div v-if="showEquipmentChart" class="chart-block">
              <div v-for="entryPoint in cachedEquipmentEntryPoints" :key="entryPoint.name" class="entry-point-summary">
                <div class="occupancy-summary">
                  <span class="occupancy-percentage">
                    <span class="percentage">{{ getThirdChartOccupancyRateByEntryPoint(entryPoint.name) }}%</span> DES POSITIONS DE TRAVAIL SONT OCCUPÉES
                  </span>
                  <span class="total-surface">
                    {{ thirdChartTotalCountByEntryPoint[entryPoint.name] || 0 }} positions de travail
                  </span>
                </div>
                <canvas :ref="el => thirdChartCanvasRefs[entryPoint.name] = el"></canvas>
              </div>
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
import { cachedThirdChartPositions } from '../services/secondChartData';
import { cachedEquipmentsByFloor } from '../services/secondChartData';
import { cachedDynamicIdsByFloorForThirdChart } from '../services/secondChartData';
import { getThirdChartOccupationDynamicIdsByFloor } from '../services/secondChartData';
import moment from 'moment';
import { getFloorOccupancyDynamicIds } from '../services/floorOccupancyService';
import {getSecondChartOccupancyDataByFloor,
        groupSecondChartsByFloor,
        getRoomPositions,
        getFloors,
        getFloorOccupancyRatesByPeriod,
        getThirdChartData,
        getRoomData,
        getThirdChartPositions,
      } from '../services/index';
      import { nextTick } from 'vue';
import { cachedFloors } from '../services/calculationUtils';
import { initializeSources,cachedRoomEntryPoints,initializeData, cachedBuildingEntryPoints,cachedEquipmentEntryPoints, cachedRoomsByFloor } from '../services/calculationUtils'; 
import { fetchTotalSurface, getTotalSurface2, fetchThirdChartTotalCount, initializeThirdChartData, 
  getThirdChartOccupancyDataByFloor, groupThirdChartsByFloor
    } from '../services/secondChartData';
    import { reactive } from 'vue';
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
  setup(props) {
const totalSurfacesByEntryPoint = ref<Record<string, number>>({});
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const occupancyChart = ref<Chart | null>(null);
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
    const secondFloorDataByEntryPoint = ref<Record<string, { floor: string; occupancy: number | null; area?: number }[]>>({});
    const secondOccupancyCharts = ref<Record<string, Chart | null>>({});
    const secondChartCanvas = ref<HTMLCanvasElement | null>(null); 
    const thirdChartFloorDataByEntryPoint = ref<Record<string, { floor: string; occupancy: number | null; area?: number }[]>>({});
    const isSourcesInitialized = ref(false);
    const secondChartCanvasRefs = reactive<Record<string, HTMLCanvasElement | null>>({});
    const secondOccupancyChartsByEntryPoint = reactive<Record<string, Chart | null>>({});
    const thirdChartCanvasRefs = reactive<Record<string, HTMLCanvasElement | null>>({});
    const thirdOccupancyChartsByEntryPoint = reactive<Record<string, Chart | null>>({});
    const thirdChartTotalCountByEntryPoint = ref<Record<string, number>>({});

    const getSurfaceByEntryPoint = (entryPointName: string): string => {
        const surface = totalSurfacesByEntryPoint.value[entryPointName];
        return surface !== undefined ? surface.toFixed(2) : '0.00';
      };
    const showBuildingChart = computed(() => {
      if (!isSourcesInitialized.value) return false;
      if (!cachedBuildingEntryPoints || cachedBuildingEntryPoints.length === 0) {
        console.warn("cachedBuildingEntryPoints n'est pas initialisé ou vide.");
        return false;
      }
      return cachedBuildingEntryPoints.some(entryPoint =>
        entryPoint.source.some(source => source.byFloorDisplay)
      );
    });

    const showRoomChart = computed(() => {
  if (!isSourcesInitialized.value) return false; // Attendre que les sources soient initialisées
  if (!cachedRoomEntryPoints || cachedRoomEntryPoints.length === 0) {
    console.warn("cachedRoomEntryPoints n'est pas initialisé ou vide.");
    return false;
  }
  return cachedRoomEntryPoints.some(entryPoint =>
    entryPoint.source.some(source => source.byFloorDisplay)
  );
});

const showEquipmentChart = computed(() => {
  if (!isSourcesInitialized.value) return false; // Attendre que les sources soient initialisées
  if (!cachedEquipmentEntryPoints || cachedEquipmentEntryPoints.length === 0) {
    console.warn("cachedEquipmentEntryPoints n'est pas initialisé ou vide.");
    return false;
  }
  return cachedEquipmentEntryPoints.some(entryPoint =>
    entryPoint.source.some(source => source.byFloorDisplay)
  );
});
    
      let firstChartCache = {
      dynamicIds: null as string[] | null,
      floorNames: null as Record<string, string> | null,
      floorOccupancyMapping: null as FloorOccupancyMapping | null,
    };
    
    
    let thirdChartCache = {
      thirdChartIds: null as string[] | null,
      floorNames: null as Record<string, string> | null,
      thirdChartPositions: [] as any[],
      equipmentsByFloor: {} as Record<string, { floorName: string; equipments: string[] }>,
      dynamicIdsByFloor: {} as Record<string, string[]>,
    };

        const getGroupName = (type: string) => {
      const entryPoint = config.entryPoints.find((entry) => entry.type === type);
      return entryPoint && entryPoint.group ? entryPoint.group.toUpperCase() : '';
    };

function mapFloorDynamicId(floorDynamicId, floorNames) {

      
        // Extraire la clé `dynamicId` si `floorDynamicId` est un objet
        const dynamicId = typeof floorDynamicId === 'object' && floorDynamicId !== null
          ? floorDynamicId.dynamicId
          : floorDynamicId;
      
      
        // Trouver le nom correspondant
        const matchingKey = Object.keys(floorNames).find(key => key === dynamicId.toString());
        if (!matchingKey) {
          console.warn(`No matching floor name found for dynamicId: ${dynamicId}`);
        }
        return matchingKey ? floorNames[matchingKey] : `Étage ${dynamicId}`;
      }
const handleTimeChange = async ({ startTime, endTime }) => {
      try {
        const timestamp = moment().valueOf();

        // Màj les données pour le premier graphique
        await fetchFloorData(props.temporality.name, timestamp, startTime, endTime);
        renderChart();

        // Màj les données pour le deuxième graphique
        await fetchSecondFloorData(timestamp, startTime, endTime, roomData);
        renderSecondCharts();

        // Màj les données pour le troisième graphique
        await fetchThirdChartFloorData(timestamp, startTime, endTime);
        renderThirdChart();
      } catch (error) {
        console.error("Erreur lors de la mise à jour des graphiques :", error);
      }
    };
   
let isFetchingFirstChart = false;

const fetchFloorData = async (period, timestamp, startTime, endTime) => {
  if (isFetchingFirstChart) {
    console.warn("fetchFloorData déjà en cours d'exécution.");
    return;
  }
  isFetchingFirstChart = true;

  try {

    if (!firstChartCache.dynamicIds || !firstChartCache.floorNames || !firstChartCache.floorOccupancyMapping) {
      const { dynamicIds, floorNames, floorOccupancyMapping } = await getFloorOccupancyDynamicIds();
      if (dynamicIds.length === 0) {
        throw new Error("Aucun Dynamic ID trouvé pour les taux d'occupation.");
      }
      firstChartCache.dynamicIds = dynamicIds;
      firstChartCache.floorNames = floorNames;
      firstChartCache.floorOccupancyMapping = floorOccupancyMapping;
    } else {
    }

    const occupancyRates = await getFloorOccupancyRatesByPeriod(
      period,
      timestamp,
      firstChartCache.dynamicIds,
      startTime,
      endTime
    );


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
const fetchTotalSurface2Wrapper = async (roomData: Record<string, string[]>) => {
  try {


    const totalSurfaces = await getTotalSurface2(roomData);

    totalSurfacesByEntryPoint.value = totalSurfaces; 
  } catch (error) {
    console.error("Erreur lors de la récupération de totalSurface2 :", error);
  }
};

let isFetchingSecondChart = false;

const fetchSecondFloorData = async (timestamp, startTime, endTime, roomData) => {
  if (isFetchingSecondChart) {
    console.warn("fetchSecondFloorData déjà en cours d'exécution.");
    return;
  }
  isFetchingSecondChart = true;

  try {

    if (!roomData) {
      throw new Error("roomData n'est pas défini.");
    }

    secondFloorDataByEntryPoint.value = {};

    for (const roomEntryPoint of cachedRoomEntryPoints || []) {

      const roomIds = roomData[roomEntryPoint.name];
      if (!roomIds || roomIds.length === 0) {
        console.warn(`Aucun roomId trouvé pour l'entryPoint : ${roomEntryPoint.name}`);
        continue;
      }

      if (!cachedRoomsByFloor[roomEntryPoint.name]) {
        await initializeData(roomIds, roomEntryPoint.name);
      } else {
      }

      const [label, data, averages] = await getSecondChartOccupancyDataByFloor(
        { type: "building" },
        props.temporality.name,
        timestamp,
        roomIds,
        startTime,
        endTime
      );

      secondFloorDataByEntryPoint.value = {
        ...secondFloorDataByEntryPoint.value,
        [roomEntryPoint.name]: averages.map(floor => ({
          floor: floor.floor,
          occupancy: floor.average !== undefined && floor.average !== null ? parseFloat(floor.average.toFixed(3)) : null,
          area: 0,
        })),
      };
    }


    renderSecondCharts();
  } catch (error) {
    console.error("Erreur dans fetchSecondFloorData :", error);
  } finally {
    isFetchingSecondChart = false;
  }
};
  let isFetchingThirdChart = false;

const fetchThirdChartFloorData = async (timestamp, startTime, endTime) => {
  if (isFetchingThirdChart) {
    console.warn("fetchThirdChartFloorData déjà en cours d'exécution.");
    return;
  }
  isFetchingThirdChart = true;

  try {


    if (!Array.isArray(cachedEquipmentEntryPoints) || cachedEquipmentEntryPoints.length === 0) {
      console.warn("cachedEquipmentEntryPoints n'est pas un tableau ou est vide. Initialisation...");
      const { equipmentsByFloorByEntryPoint } = await initializeThirdChartData();
    }

    thirdChartFloorDataByEntryPoint.value = {};

    const { equipmentsByFloorByEntryPoint } = await initializeThirdChartData();

    for (const entryPoint of cachedEquipmentEntryPoints) {

      const equipmentIds = await getThirdChartData();

      if (!equipmentIds[entryPoint.name] || equipmentIds[entryPoint.name].length === 0) {
        console.warn(`Aucun équipement trouvé pour l'entryPoint : ${entryPoint.name}`);
        continue;
      }

      const equipmentsByFloor = equipmentsByFloorByEntryPoint[entryPoint.name];

      const dynamicIdsByFloor = await getThirdChartOccupationDynamicIdsByFloor(
        equipmentIds[entryPoint.name],
        equipmentsByFloor,
        entryPoint
      );

      const { resultsByEntryPoint } = await getThirdChartOccupancyDataByFloor(
        { type: "building" },
        props.temporality.name,
        timestamp,
        Object.values(dynamicIdsByFloor).flat(),
        startTime,
        endTime
      );

      thirdChartFloorDataByEntryPoint.value = {
        ...thirdChartFloorDataByEntryPoint.value,
        [entryPoint.name]: resultsByEntryPoint[entryPoint.name]?.averages.map(floor => ({
          floor: floor.floor,
          occupancy: floor.average !== undefined && floor.average !== null ? parseFloat(floor.average.toFixed(3)) : null,
          area: 0,
        })) || [],
      };
    }


    renderThirdChart();
  } catch (error) {
    console.error("Erreur dans fetchThirdChartFloorData :", error);
  } finally {
    isFetchingThirdChart = false;
  }
};



function calculateOccupancyRate(data: { occupancy: number | null }[]): number {
  const filtered = data.filter(item => item.occupancy !== null);
  if (filtered.length === 0) return 0;
  const totalOccupancy = filtered.reduce((sum, item) => sum + (item.occupancy ?? 0), 0);
  return parseFloat((totalOccupancy / filtered.length).toFixed(3));
}
const getOccupancyRateByEntryPoint = (entryPointName: string): number => {
  const dataForEntryPoint = secondFloorDataByEntryPoint.value[entryPointName] || [];
  const filtered = dataForEntryPoint.filter(item => item.occupancy !== null);
  if (filtered.length === 0) return 0;
  const totalOccupancy = filtered.reduce((sum, item) => sum + (item.occupancy ?? 0), 0);
  return parseFloat((totalOccupancy / filtered.length).toFixed(2));
};
    const buildingOccupancyRate = computed(() => calculateOccupancyRate(floorData.value));
    const secondBuildingOccupancyRate = computed(() => {
    
      const aggregatedData = Object.values(secondFloorDataByEntryPoint.value).reduce((acc, entryPointData) => {
        if (Array.isArray(entryPointData)) {
          acc.push(...entryPointData);
        }
        return acc;
      }, []);
      return calculateOccupancyRate(aggregatedData);
    });
    
    const thirdChartOccupancyRate = computed(() => {
    
      const aggregatedData = Object.values(thirdChartFloorDataByEntryPoint.value).reduce((acc, entryPointData) => {
        if (Array.isArray(entryPointData)) {
          acc.push(...entryPointData);
        }
        return acc;
      }, []);
    
    
      return calculateOccupancyRate(aggregatedData);
    });
        const getThirdChartOccupancyRateByEntryPoint = (entryPointName: string): number => {
      const dataForEntryPoint = thirdChartFloorDataByEntryPoint.value[entryPointName] || [];
      const filtered = dataForEntryPoint.filter(item => item.occupancy !== null);
      if (filtered.length === 0) return 0;
      const totalOccupancy = filtered.reduce((sum, item) => sum + (item.occupancy ?? 0), 0);
      return parseFloat((totalOccupancy / filtered.length).toFixed(2));
    };

        const getThirdChartSurfaceByEntryPoint = (entryPointName: string): string => {
      const dataForEntryPoint = thirdChartFloorDataByEntryPoint.value[entryPointName] || [];
      const totalSurface = dataForEntryPoint.reduce((sum, item) => sum + (item.area ?? 0), 0);
      return totalSurface.toFixed(2);
    };

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
        
            const floorLabels = Object.values(firstChartCache.floorNames);
            const occupancyData = floorLabels.map(floor => {
              const floorDataEntry = floorData.value.find(f => f.floor === floor);
              return floorDataEntry ? floorDataEntry.occupancy : null;
            });
        
            const chartConfig = cachedBuildingEntryPoints?.flatMap(entryPoint =>
              entryPoint.source.map(source => ({
                label: source.label,
                backgroundColor: source.backgroundColor,
                borderColor: source.borderColor || source.backgroundColor,
                displayX1: source.displayX1 || false,
              }))
            );
        
            if (!chartConfig || chartConfig.length === 0) {
              console.error("Aucune configuration valide trouvée pour le premier graphique.");
              return;
            }
        
            const chartConfiguration: ChartConfiguration<'bar'> = {
              type: 'bar',
              data: {
                labels: floorLabels,
                datasets: chartConfig.map(config => ({
                  label: config.label,
                  data: occupancyData,
                  backgroundColor: occupancyData.map(value => value === null ? '#d3d3d3' : config.backgroundColor),
                  borderColor: config.borderColor,
                  barPercentage: 0.4,
                  categoryPercentage: 1,
                  borderRadius: 10,
                })),
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    callbacks: {
                      label: function (context) {
                        const value = context.raw;
                        return value === null ? 'Aucune donnée' : `${context.dataset.label}: ${value.toFixed(3)}%`;
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
                  y: { display: false },
                  x1: {
                    display: chartConfig.some(config => config.displayX1),
                    position: 'top',
                    ticks: { font: { size: 15 } },
                  },
                },
                layout: { padding: { top: 10, bottom: 10 } },
              }
            };
        
            occupancyChart.value = new Chart(ctx, chartConfiguration);
          }
        };
        

        let isRenderingSecondCharts = false;

        const renderSecondCharts = async () => {
  if (isRenderingSecondCharts) {
    console.warn("Rendu déjà en cours, skip.");
    return;
  }
  isRenderingSecondCharts = true;

  await nextTick();

  const allFloorsSet = new Set<string>();
  if (cachedFloors && cachedFloors.length > 0) {
    cachedFloors.forEach(floor => allFloorsSet.add(floor.name));
  }

  cachedRoomEntryPoints.forEach(entryPoint => {
    const canvas = secondChartCanvasRefs[entryPoint.name];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (secondOccupancyChartsByEntryPoint[entryPoint.name]) {
      secondOccupancyChartsByEntryPoint[entryPoint.name].destroy();
      secondOccupancyChartsByEntryPoint[entryPoint.name] = null;
    }

    const dataForEntryPoint = secondFloorDataByEntryPoint.value[entryPoint.name] || [];
    const floorLabels = Array.from(allFloorsSet); 
    const occupancyData = floorLabels.map(floor => {
      const found = dataForEntryPoint.find(d => d.floor === floor);
      return found ? found.occupancy : null; 
    });

    secondOccupancyChartsByEntryPoint[entryPoint.name] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: floorLabels,
        datasets: [{
          label: `Occupation ${entryPoint.name}`,
          data: occupancyData,
          backgroundColor: entryPoint.source[0].backgroundColor,
          borderColor: entryPoint.source[0].borderColor || entryPoint.source[0].backgroundColor,
          barPercentage: 0.6,
          categoryPercentage: 1,
          borderRadius: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.raw;
                return val === null ? 'Aucune donnée' : `${ctx.dataset.label}: ${val.toFixed(3)}%`;
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
            },
          },
          y: { display: false },
          x1: {
            display: false, 
            position: 'top',
            ticks: { font: { size: 15 } },
          },
        },
        layout: { padding: { top: 10, bottom: 10 } },
      }
    });
  });

  isRenderingSecondCharts = false;
};

let isRenderingThirdCharts = false;

const renderThirdChart = async () => {
  if (isRenderingThirdCharts) {
    console.warn("Rendu déjà en cours pour le troisième graphique, skip.");
    return;
  }
  isRenderingThirdCharts = true;

  await nextTick();

  const allFloorsSet = new Set<string>();
  if (cachedFloors && cachedFloors.length > 0) {
    cachedFloors.forEach(floor => allFloorsSet.add(floor.name));
  }

  cachedEquipmentEntryPoints.forEach(entryPoint => {
    const canvas = thirdChartCanvasRefs[entryPoint.name];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (thirdOccupancyChartsByEntryPoint[entryPoint.name]) {
      thirdOccupancyChartsByEntryPoint[entryPoint.name].destroy();
      thirdOccupancyChartsByEntryPoint[entryPoint.name] = null;
    }

    const dataForEntryPoint = thirdChartFloorDataByEntryPoint.value[entryPoint.name] || [];
    const floorLabels = Array.from(allFloorsSet); 
    const occupancyData = floorLabels.map(floor => {
      const found = dataForEntryPoint.find(d => d.floor === floor);
      return found ? found.occupancy : null; 
    });

    thirdOccupancyChartsByEntryPoint[entryPoint.name] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: floorLabels,
        datasets: [{
          label: `Occupation ${entryPoint.name}`,
          data: occupancyData,
          backgroundColor: entryPoint.source[0].backgroundColor,
          borderColor: entryPoint.source[0].borderColor || entryPoint.source[0].backgroundColor,
          barPercentage: 0.6,
          categoryPercentage: 1,
          borderRadius: 10,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.raw;
                return val === null ? 'Aucune donnée' : `${ctx.dataset.label}: ${val.toFixed(3)}%`;
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
            },
          },
          y: { display: false },
          x1: {
            display: true, 
            position: 'top',
            ticks: { font: { size: 15 } },
          },
        },
        layout: { padding: { top: 10, bottom: 10 } },
      }
    });
  });

  isRenderingThirdCharts = false;
};

watch(
  () => [props.temporality, props.startTime, props.endTime],
  async ([newTemporality, newStartTime, newEndTime]) => {
    try {
      // Vérifiez si les sources sont initialisées
      if (!isSourcesInitialized.value) {
        console.warn("Les sources ne sont pas initialisées. Appel de initializeSources...");
        await initializeSources();
        isSourcesInitialized.value = true;
      }

      const timestamp = moment().valueOf();

      // Récupérer les données des salles
      const roomData = await getRoomData();
      if (!roomData || Object.keys(roomData).length === 0) {
        console.warn("Les données des salles sont vides ou non définies.");
        return;
      }

      // === Mise à jour du premier graphique ===
      await fetchFloorData(newTemporality.name, timestamp, newStartTime, newEndTime);
      if (chartCanvas.value && floorData.value.length && allFloors.value.length) {
        renderChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le premier graphique.");
      }

      // === Mise à jour des surfaces totales ===
      await fetchTotalSurface2Wrapper(roomData);

      // === Mise à jour du deuxième graphique ===
      await fetchSecondFloorData(timestamp, newStartTime, newEndTime, roomData);
      if (Object.keys(secondChartCanvasRefs).length > 0 && Object.keys(secondFloorDataByEntryPoint.value).length > 0) {
        await renderSecondCharts();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le deuxième graphique.");
      }

      // === Mise à jour du troisième graphique ===
      await fetchThirdChartFloorData(timestamp, newStartTime, newEndTime);
      if (Object.keys(thirdChartCanvasRefs).length > 0 && Object.keys(thirdChartFloorDataByEntryPoint.value).length > 0) {
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

    await initializeSources();
    isSourcesInitialized.value = true;


    // === Premier graphique ===
    try {
      const timestamp = moment().valueOf();
      await fetchFloorData(props.temporality.name, timestamp, props.startTime, props.endTime);
      await fetchTotalSurfaceWrapper();
      if (floorData.value.length && chartCanvas.value) {
        await nextTick();
        renderChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le premier graphique.");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du premier graphique :", error);
    }

    try {

      const roomData = await getRoomData();
      if (!roomData || Object.keys(roomData).length === 0) {
        throw new Error("Les données nécessaires pour les salles de réunion ne sont pas initialisées.");
      }
      await fetchTotalSurface2Wrapper(roomData);

      const timestamp = moment().valueOf();
      await fetchSecondFloorData(timestamp, props.startTime, props.endTime, roomData);
      await nextTick();
      renderSecondCharts();
    } catch (error) {
      console.error("Erreur lors de l'initialisation du deuxième graphique :", error);
    }

    try {
      const thirdChartIds = await getThirdChartData();
      if (!thirdChartIds || thirdChartIds.length === 0) {
        throw new Error("Aucun ID d'équipement trouvé.");
      }

      await initializeThirdChartData(thirdChartIds);
      const timestamp = moment().valueOf();
      await fetchThirdChartFloorData(timestamp, props.startTime, props.endTime);

      const totalCountByEntryPoint = await fetchThirdChartTotalCount();
      thirdChartTotalCountByEntryPoint.value = totalCountByEntryPoint;

      if (thirdChartFloorData.value.length && thirdChartCanvas.value) {
        renderThirdChart();
      } else {
        console.warn("Les données ou le canvas ne sont pas prêts pour le troisième graphique.");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du troisième graphique :", error);
    }

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
  config, 
  cachedBuildingEntryPoints,
  cachedRoomEntryPoints,
  cachedEquipmentEntryPoints,
  showBuildingChart,
  showRoomChart,
  showEquipmentChart,
  getGroupName,
  calculateOccupancyRate, 
  secondFloorDataByEntryPoint, 
  secondChartCanvasRefs,
  renderSecondCharts,
  totalSurfacesByEntryPoint,
  getSurfaceByEntryPoint,
  getOccupancyRateByEntryPoint,
  getThirdChartOccupancyRateByEntryPoint,
  getThirdChartSurfaceByEntryPoint,
  thirdChartCanvasRefs,
  thirdChartTotalCountByEntryPoint,
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