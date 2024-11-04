<template>
    <div v-if="dataTable && dataTable.length > 0">
        <line-chart :chart-data="test"></line-chart>
    </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default {
    name: 'LineChartComponent',
    components: {
        LineChart: Line,
    },
    props: {
        begin: {
            type: String,
            required: true,
        },
        end: {
            type: String,
            required: true,
        },
        dataTable: {
            type: Array,
            required: true,
        },
    },
    computed: {
        labels() {
            if (!this.dataTable) {
                return [];
            }

            const parseDate = (dateStr) => {
                const [day, month, yearTime] = dateStr.split('-');
                const [year, time] = yearTime.split(' ');
                const [hours, minutes, seconds] = time.split(':');

                // Crée un objet Date avec des valeurs numériques
                return new Date(
                    parseInt(year, 10),      // Année
                    parseInt(month, 10) - 1, // Mois (0 = janvier, donc on soustrait 1)
                    parseInt(day, 10),       // Jour
                    parseInt(hours, 10),     // Heures
                    parseInt(minutes, 10),   // Minutes
                    parseInt(seconds, 10)    // Secondes
                );
            };

            const beginDate = parseDate(this.begin);
            const endDate = parseDate(this.end);

            // Ensuite, on peut les convertir directement en objets Date
            // const date1 = new Date(dateString1);
            // const date2 = new Date(dateString2);


            console.log(beginDate, endDate, this.end, this.begin)
            const dates = [];
            this.dataTable.forEach((graph) => {
                graph.data.forEach((dataPoint) => {
                    const date = new Date(dataPoint.date);
                    if (date.getTime() >= beginDate && date.getTime() <= endDate) {
                        dates.push(date.toLocaleString());
                    }
                });
            });
            console.log(dates, ' les dates');

            return dates;
        },
        chartDataObject() {
            if (!this.dataTable || this.dataTable.length === 0) {
                return {};
            }
            return {
                labels: this.labels,
                datasets: this.dataTable.map((graph) => {
                    return {
                        label: 'toto',
                        data: graph.data.map((dataPoint) => dataPoint.value),
                        borderColor: 'red',
                        fill: false,
                    };
                })
            };
        },

        test() {
            return {
                labels: [0, 1, 2, 3, 4],
                datasets: {
                    label: 'toto',
                    data: [1 , 2, 3 ,4 , 5],
                    borderColor: 'red',
                    fill: false,
                }
            };
        }
    },
    methods: {
        getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            console.log('color,', color);

            return color;
        },
    },
};
</script>

<style scoped>
.line-chart {
    max-width: 800px;
    margin: 0 auto;
}
</style>