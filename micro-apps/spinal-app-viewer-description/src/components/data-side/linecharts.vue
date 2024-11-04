<template>
  <div>
    <canvas ref="myChart"></canvas>
  </div>
</template>

<script>
import { Chart } from "chart.js";
import { ref, onMounted, watch } from "vue";

export default {
  name: "LineChart",
  props: {
    begin: {
      type: String,
      required: false,
    },
    end: {
      type: String,
      required: false,
    },
    dataTable: {
      type: Array,
      required: false,
    },
  },
  setup(props) {

    const parseDate = (dateStr) => {
      const [day, month, yearTime] = dateStr.split('-');
      const [year, time] = yearTime.split(' ');
      const [hours, minutes, seconds] = time.split(':');

      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        parseInt(hours, 10),
        parseInt(minutes, 10),
        parseInt(seconds, 10)
      );
    };

    const beginDate = ref(parseDate(props.begin));
    const endDate = ref(parseDate(props.end));

    const myChart = ref(null);
    const chartInstance = ref(null);

    const createChart = () => {
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      if (!beginDate.value || !endDate.value || !props.dataTable || props.dataTable.length === 0) {
        return; // Ne crée pas le graphique si les dates ou les données ne sont pas disponibles
      }

      const datasets = props.dataTable.map((dataItem) => {
        const filteredData = dataItem.data.filter((d) => {
          const date = new Date(d.date);
          return date >= beginDate.value && date <= endDate.value;
        });

        return {
          label: dataItem.name,
          data: filteredData.map((d) => ({ x: new Date(d.date), y: d.value })),
          borderColor: getRandomColor(),
          fill: false,
        };
      });

      chartInstance.value = new Chart(myChart.value, {
        type: "line",
        data: {
          datasets: datasets,
        },
        options: {
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day",
              },
              title: {
                display: true,
                text: "Date",
              },
              min: beginDate.value,
              max: endDate.value,
            },
            y: {
              title: {
                display: true,
                text: "Value",
              },
            },
          },
        },
      });
    };

    const getRandomColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    onMounted(() => {
      createChart();
    });

    watch(
      () => [props.begin, props.end, props.dataTable],
      () => {
        beginDate.value = parseDate(props.begin);
        endDate.value = parseDate(props.end);
        createChart();
      },
      { deep: true, immediate: true }
    );

    return {
      myChart,
    };
  },
};
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: 400px;
}
</style>
