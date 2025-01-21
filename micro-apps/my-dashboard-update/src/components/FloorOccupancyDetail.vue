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
import { defineComponent, ref, computed, onMounted } from 'vue';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { HTTP } from '../services/http-constants'; 
import { getGestionDesEspacesId, getTypologieCategoryId, getMeetingRoomGroupId, getRoomIds, getRoomPositions, groupRoomsByFloor, getOccupationDataByFloor, calculateAverageOccupation } from '../services/index';
Chart.register(...registerables);

export default defineComponent({
  name: 'FloorOccupancyDetail',
  props: {
    buildingOccupancyRate: {
      type: Number,
      default: 0
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

    const fetchFloorData = async () => {
      try {
        const occupancyRates = await getFloorOccupancyRates();
        floorData.value = occupancyRates.map(floor => ({
          floor: floor.name,
          occupancy: floor.occupancyRate || 0,
          area: floor.area || 0
        }));

        // Mettre à jour la liste des étages
        allFloors.value = floorData.value.map(floor => floor.floor);

        renderChart();
        renderSecondChart();
      } catch (error) {
        console.error("Erreur lors de la récupération des données des étages :", error);
      }
    };

    const fetchSecondFloorData = async () => {
      try {
        const gestionDesEspacesId = await getGestionDesEspacesId();
        const typologieCategoryId = await getTypologieCategoryId(gestionDesEspacesId);
        const meetingRoomGroupId = await getMeetingRoomGroupId(gestionDesEspacesId, typologieCategoryId);
        const roomIds = await getRoomIds(gestionDesEspacesId, typologieCategoryId, meetingRoomGroupId);
        const roomPositions = await getRoomPositions(roomIds);

        const response = await HTTP.post(
          `building/${localStorage.getItem('idBuilding')}/node/attribute_list_multiple`,
          roomIds
        );

        let totalMeetingRoomSurface = 0;

        response.data.forEach(room => {
          const category = room.categoryAttributes.find(cat => cat.name === "Spatial");
          if (category && category.attributs) {
            const areaAttribute = category.attributs.find(attr => attr.label === "area");
            if (areaAttribute && areaAttribute.value) {
              totalMeetingRoomSurface += parseFloat(areaAttribute.value);
            }
          }
        });

        totalSurface2.value = totalMeetingRoomSurface;

        const roomsByFloor = groupRoomsByFloor(roomPositions);
        const occupationByFloor = await getOccupationDataByFloor(roomsByFloor);
        const averagesByFloor = calculateAverageOccupation(roomsByFloor, occupationByFloor);

        secondFloorData.value = averagesByFloor.map(floor => ({
          floor: floor.floorName,
          occupancy: floor.averageOccupation,
          area: floor.area || 0
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

    const getFloorOccupancyRates = async () => {
      const buildingId = localStorage.getItem('idBuilding');
      const result = await HTTP.get(`building/${buildingId}/floor/list`);
      let promises = result.data.map(async (floor) => {
        let cpList = await HTTP.get(`building/${buildingId}/node/${floor.dynamicId}/control_endpoint_list`);
        for (let j = 0; j < cpList.data.length; j++) {
          for (let i = 0; i < cpList.data[j].endpoints.length; i++) {
            if (cpList.data[j].endpoints[i].name === 'taux d\'occupation') {
              let occupancyRate = cpList.data[j].endpoints[i].currentValue;
              floor.occupancyRate = occupancyRate;
              floor.name = floor.name || `Étage ${floor.dynamicId}`;
              return floor;
            }
          }
        }
        return null;
      });
      let values = await Promise.all(promises);
      return values.filter((value) => value !== null);
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

          const floorLabels = allFloors.value;
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

          const floorLabels = allFloors.value;
          const occupancyData = floorLabels.map(floor => {
            const floorDataEntry = secondFloorData.value.find(f => f.floor === floor);
            return floorDataEntry ? floorDataEntry.occupancy : 0;
          });

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

    onMounted(() => {
      fetchFloorData();
      fetchSecondFloorData();
      fetchTotalSurface();
    });

    return {
      chartCanvas,
      secondChartCanvas,
      floorData,
      secondFloorData,
      totalSurface,
      totalSurface2,
      buildingOccupancyRate,
      secondBuildingOccupancyRate,
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