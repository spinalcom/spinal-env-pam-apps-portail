<template>
    <v-card style="min-height: 220px !important" class="bar-card pa-1 rounded-lg d-flex flex-column" outlined>
        <v-card-title style="font-size: 20px; height: 56px" class="card-title pa-3 text-uppercase justify-space-between">
            <p>{{ title }}</p>
            <div class="d-flex align-center mln6"
                style="position: absolute; right: calc(50% - 55px);transform: translate(0,20px);">
                <v-icon icon class="pr-3" size="default">mdi-chart-bar</v-icon>
                <v-switch @click="$emit('stack', this.switchvalue)" style="margin-top: 1px; padding: 0px;height: 24px;"
                    v-model="this.switchvalue" inset color="blue-grey" dense />
                <v-icon icon size="default">mdi-chart-scatter-plot</v-icon>
            </div>
            <div @click="reloadgraph()"
                style="z-index: 99;border-radius: 8px;background-color: #e7e7e7; width: 58px; height: 38px;cursor: pointer;display: flex;justify-content: center;align-items: center;left: 54%;position: absolute; transform: translate(0,45%);">
                <v-icon icon>mdi-refresh</v-icon>
            </div>
            <div v-if="navEnabled" style="height: 40px">
                <v-btn @click="$emit('nav', -1)" style="
              font-size: 14px !important;
              border-radius: 10px;
              min-width: 36px !important;
              box-shadow: none;
            ">
                    <v-icon icon>mdi-chevron-left</v-icon>
                </v-btn>
                {{ navText }}
                <v-btn @click="$emit('nav', +1)" style="
              font-size: 14px !important;
              border-radius: 10px;
              min-width: 36px !important;
              box-shadow: none;
            ">
                    <v-icon icon>mdi-chevron-right</v-icon>
                </v-btn>
            </div>
        </v-card-title>

        <div style="height: calc(100% - 56px)" class="d-flex flex-column ">
            <slot name="extras" class="flex-shrink-1"></slot>

            <div id="bar-legend-container" class="d-flex flex-row justify-space-between"
                style="height: 81px ; transform: translate(0, 60%);"></div>
            <div :class="isShiftPressed ? 'shifted' : ''" @mousedown="handleMouseDown" @mouseup="handleMouseUp"
                style="height: calc(100% - 21px)">


                <Bubble v-if="this.toto && !this.isScatter" ref="scatterChart"
                    style="width: 100% !important;position: relative;" :data="bubbleChartData"
                    :options="bubbleChartOptions" />


                <Scatter v-if="this.toto && this.isScatter" ref="scatterChart"
                    style="width: 100% !important;position: relative;" :data="bubbleChartData"
                    :options="bubbleChartOptions" />
            </div>
        </div>
    </v-card>
</template>
  
<script>
// import simpleStats from 'simple-statistics';

import polynomial from './polynomial.js';
import regression from 'regression';
const fs = require('fs');
import { Bubble } from "vue-chartjs";
import { Scatter } from "vue-chartjs";
import zoomPlugin from 'chartjs-plugin-zoom';
import {
    customBackgroundPlugin,
    customLegendPlugin,
} from "../../plugins/canvasPlugins";
import {
    Legend,
    BarElement,
    LinearScale,
    CategoryScale,
    LogarithmicScale,
    Chart as ChartJS,
} from "chart.js";
import {
    defaultColor,
    gradiant,
    RGBtoHexa,
    HSVtoRGB,
    hexaToRGB,
} from "../colors";

ChartJS.register(
    zoomPlugin,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    customBackgroundPlugin,
    customLegendPlugin
);

export default {
    name: "bar-card",
    components: {
        Bubble,
        Scatter
    },
    props: {
        title: {
            type: String,
            default: "Bubble Card",
        },
        data1: {
            type: Array,
            default: () => [],
        },
        data2: {
            type: Array,
            default: () => [],
        },
        scatterdata: {
            type: Array,
            default: () => [],
        },

        navEnabled: {
            type: Boolean,
            default: false,
        },
        regression: {
            type: Boolean,
            default: false,
        },
        isScatter: {
            type: Boolean,
            default: true,
        },
        navText: {
            type: String,
            default: "",
        },
        step: {
            type: Number,
            default: 1,
        },
        bubbleSize: {
            type: Number,
            default: 1,
        },
        seuilBubble: {
            type: Number,
            default: 1,
        },
        showBarCard: {
            type: Boolean,
            default: true,
        },
        bubbleColor: {
            type: String,
            default: 'blue',
        },
        unitsx: {
            type: String,
            default: '',
        },
        unitsy: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            // unitsx : "toto",
            // unitsy : "tata",
            isShiftPressed: null,
            switchvalue: this.showBarCard,
            dialogs: true,
            // bubbleChartData: generateBubbleData(this.data1[0].data, this.data2[0].data),
            previousXRange: { min: null, max: null },
            previousYRange: { min: null, max: null },
            pointX: null,
            pointY: null,
            iszoom: false,
            mode: 'xy',
            toto: true,
            isMouseDown: false,
            startX: null,
            startY: null,
            currentMode: null,
            bubbleChartOptions: {
                maintainAspectRatio: false,
                scales: {
                    x: {

                        // type: 'logarithmic', 
                        beginAtZero: true,
                        // max: Math.max(...this.data1[0].data),
                        ticks: {
                            callback: (val, i, tab) => {
                                return [val + this.unitsx]
                            },
                            font: {
                                family: "Charlevoix Pro",
                                size: 11,
                            },
                            color: "#214353",
                        },
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        // max: Math.max(...this.data2[0].data),
                        // type: 'logarithmic',
                        ticks: {
                            callback: (val, i, tab) => {
                                return [val + this.unitsy]
                            },
                            font: {
                                family: "Charlevoix Pro",
                                size: 11,
                            },
                            color: "#214353",
                        },
                        grid: {
                            color: "#f9f9f9",
                            lineWidth: 2,
                        },
                    },
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy',
                            modifierKey: 'shift',

                        },
                        zoom: {
                            // enabled: true,

                            mode: this.mode,
                            drag: {
                                enabled: true,
                                borderColor: 'red',
                                borderWidth: 1
                            },
                            scaleMode: 'x',

                        }
                    },
                    legend: {
                        display: false,
                        align: "start",
                        labels: {
                            color: "#214353",
                            font: {
                                family: "Charlevoix Pro",
                                size: 14,
                                letterSpacing: 0.7,
                            },
                            useBorderRadius: true,
                            borderRadius: 5,
                            boxWidth: 9,
                            boxHeight: 21,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: (${context.raw.x}, ${context.raw.y}, ${context.raw.r})`;
                            },
                        },
                    },
                },
                interaction: {
                    mode: "nearest",
                    axis: "xy",
                    intersect: false,
                },
            }
        };
    },

    methods: {
        handleKeyDown(event) {
            if (event.key === 'Shift') {
                // console.log('key pressed');
                this.isShiftPressed = true;
            }
        },
        handleKeyUp(event) {
            if (event.key === 'Shift') {
                // console.log('key unpressed');
                this.isShiftPressed = false;
                this.$refs.myChart.$el.classList.remove('grabbing-cursor'); // Assurez-vous de supprimer le style au relâchement de la touche Shift
            }
        },
        // check() {
        //     if (this.isMouseDown) {
        //         console.log("La souris est toujours enfoncée");
        //     } else {
        //         console.log("La souris n'est pas enfoncée");
        //     }
        // },


        reloadgraph() {
            this.toto = !this.toto
            setTimeout(() => {
                this.toto = true;
                this.currentMode = null
            }, 5);
            this.startTimer();
        },

        generateBubblePoint() {
            const seuil = this.seuilBubble;
            let data = this.scatterdata
            const data4 = [];

            const getDistance = (p1, p2) => Math.sqrt(Math.pow(p2.value - p1.value, 2) + Math.pow(p2.value2 - p1.value2, 2));

            data.forEach(p1 => {
                if (!data4.some(p2 => getDistance(p1, p2) < seuil)) {
                    const closePoints = data.filter(p2 => getDistance(p1, p2) < seuil);
                    const aggregatedPoint = {
                        date: p1.date, // on garde la date du point d'origine
                        value: closePoints.reduce((acc, curr) => acc + curr.value, 0) / closePoints.length,
                        value2: closePoints.reduce((acc, curr) => acc + curr.value2, 0) / closePoints.length,
                        radius: closePoints.length / this.bubbleSize
                    };
                    data4.push(aggregatedPoint);
                }
            });
            // console.log(data4);
            return data4;
        }
        ,
        generateBubbleData() {
            let data = this.generateBubblePoint();
            // console.log("ici les data = scatter data", data);

            const datasets = data.map((point, index) => {
                return {
                    label: `Point ${index + 1}`,
                    data: [
                        {
                            x: Math.max(0, point.value),
                            y: Math.max(0, point.value2),
                            r: point.radius // utilisation du rayon ici
                        }
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: this.bubbleColor,
                    borderWidth: 1,
                };
            });

            const x = data.map(point => point.value);
            const y = data.map(point => point.value2);
            // const maxX = Math.max(...x);
            const sortedX = [...x].sort((a, b) => b - a); // Trier le tableau par ordre décroissant
            const secondLargest = sortedX[1];
            var degree = 6;
            var poly = new Polyfit(x, y);
            var polynomialFunction = poly.getPolynomial(degree);
            // console.log('polynomial : ', polynomialFunction);
            let xValues = [];
            for (let i = 0; i <= secondLargest; i += 1 * sortedX[0] / 100) {
                xValues.push(i);
            }

            // Utilisez la fonction polynomiale pour calculer les valeurs y pour chaque x
            let dataPoints = xValues.map(x => {
                return { x: x, y: polynomialFunction(x) };
            });

            if (this.regression) {
                const lineDataset = {
                    type: 'line',
                    label: 'Moyenne mobile',
                    data: dataPoints,
                    borderColor: 'red',
                    fill: false,
                    pointRadius: 0,
                };

                return {
                    datasets: [...datasets, lineDataset]  // Ajouter la ligne au graphique
                };
            }
            else
                return {
                    datasets: [...datasets]  // Ajouter la ligne au graphique
                };
        },
        generateScatterData() {
            // this.generateBubblePoint();
            let data = this.scatterdata
            // console.log("ici les data = scatter data", data);

            const values1 = data.map(d => d.value);
            const values2 = data.map(d => d.value2);

            const scatterDatasets = values1.map((value1, index) => {
                return {
                    label: `Point ${index + 1}`,
                    data: [{
                        x: Math.max(0, value1),
                        y: Math.max(0, values2[index]),
                        r: 10
                    }],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: this.bubbleColor,
                    borderWidth: 1,
                };
            });

            const x = data.map(point => point.value);
            const y = data.map(point => point.value2);
            // const maxX = Math.max(...x);
            const sortedX = [...x].sort((a, b) => b - a); // Trier le tableau par ordre décroissant
            const secondLargest = sortedX[1];
            var degree = 6;
            var poly = new Polyfit(x, y);
            var polynomialFunction = poly.getPolynomial(degree);
            // console.log('polynomial : ', polynomialFunction);
            let xValues = [];
            for (let i = 0; i <= secondLargest; i += 1 * sortedX[0] / 100) {
                xValues.push(i);
            }

            // Utilisez la fonction polynomiale pour calculer les valeurs y pour chaque x
            let dataPoints = xValues.map(x => {
                return { x: x, y: polynomialFunction(x) };
            });

            if (this.regression) {
                const lineDataset = {
                    type: 'line',
                    label: 'Moyenne mobile',
                    data: dataPoints,
                    borderColor: 'red',
                    fill: false,
                    pointRadius: 0,
                };

                return {
                    datasets: [...scatterDatasets, lineDataset]  // Ajouter la ligne au graphique
                };
            }
            else
                return {
                    datasets: [...scatterDatasets]  // Ajouter la ligne au graphique
                };
        },
        // generateBubbleData(data1, data2) {
        //     console.log('la fonction de buble : data1', data1);
        //     const datasets = data1.map((value, index) => {
        //         return {
        //             label: `Point ${index + 1}`,
        //             data: [
        //                 {
        //                     x: Math.max(0, data2[index]),
        //                     y: Math.max(0, value),
        //                     r: 10
        //                 }
        //             ],
        //             backgroundColor: 'rgba(54, 162, 235, 0.2)',
        //             borderColor: 'rgba(54, 162, 235, 1)',
        //             borderWidth: 1,
        //         };
        //     });

        //     return {
        //         datasets: datasets
        //     };
        // },

        handleMouseDown(event) {
            this.startX = event.clientX;
            this.startY = event.clientY;

            // Ajout de l'écouteur d'événements mousemove au document
            document.addEventListener('mousemove', this.calculateDistance);
        },
        handleMouseUp(event) {
            document.removeEventListener('mousemove', this.calculateDistance);
        },
        calculateDistance(event) {
            const endX = event.clientX;
            const endY = event.clientY;

            const deltaX = Math.abs(endX - this.startX);
            const deltaY = Math.abs(endY - this.startY);

            // console.log(`Différence entre x1 et x2: ${deltaX} px`);
            // console.log(`Différence entre y1 et y2: ${deltaY} px`);

            if (deltaX * 8.5 < deltaY) {
                // this.mode = 'y';
                this.setZoomMode('y')
                // this.currentMode = 'y'
            } else if (deltaY * 8.5 < deltaX) {
                // this.mode = 'x';
                // this.currentMode = 'x'
                this.setZoomMode('x')
            } else {
                // this.mode = 'xy';

                this.setZoomMode('xy')
                // this.currentMode = 'xy'
            }
        },
        setZoomMode(mode) {
            this.bubbleChartOptions.plugins.zoom.zoom.mode = mode;
        }
    },

    mounted() {
        // Ajoutez un écouteur d'événement pour détecter quand la touche Shift est enfoncée ou relâchée
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }
    ,
    computed: {
        bubbleChartData() {
            if (!this.isScatter)
                return this.generateBubbleData();
            else
                return this.generateScatterData();
        },

        bubbleChartOptions2() {
            return {
                maintainAspectRatio: false,
                scales: {
                    x: {

                        // type: 'logarithmic', 
                        beginAtZero: true,
                        // max: Math.max(...this.data1[0].data),
                        ticks: {

                            font: {
                                family: "Charlevoix Pro",
                                size: 11,
                            },
                            color: "#214353",
                        },
                        grid: {
                            display: false,
                        },
                    },
                    y: {
                        // max: Math.max(...this.data2[0].data),
                        // type: 'logarithmic',
                        ticks: {
                            font: {
                                family: "Charlevoix Pro",
                                size: 11,
                            },
                            color: "#214353",
                        },
                        grid: {
                            color: "#f9f9f9",
                            lineWidth: 2,
                        },
                    },
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: false,
                            mode: 'xy'
                        },
                        zoom: {
                            enabled: true,

                            mode: this.mode,
                            drag: {
                                enabled: true,
                                borderColor: 'red',
                                borderWidth: 1
                            },
                            scaleMode: 'x',

                        }
                    },
                    legend: {
                        display: false,
                        align: "start",
                        labels: {
                            color: "#214353",
                            font: {
                                family: "Charlevoix Pro",
                                size: 14,
                                letterSpacing: 0.7,
                            },
                            useBorderRadius: true,
                            borderRadius: 5,
                            boxWidth: 9,
                            boxHeight: 21,
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: (${context.raw.x}, ${context.raw.y}, ${context.raw.r})`;
                            },
                        },
                    },
                },
                interaction: {
                    mode: "nearest",
                    axis: "xy",
                    intersect: false,
                },
            };
        }

    },

};
</script>
<style>
html {
    overflow-y: auto !important;
}

.v-application {
    font-family: "Charlevoix Pro";
}
</style>
<style scoped>
.bar-card {
    background-color: #f9f9f9;
    font-family: "Charlevoix Pro";
    font-size: 14px;
}

.card-title {
    letter-spacing: 1.1px;
    color: #214353;
    opacity: 1;
    font-size: 11px/13px;
}


.button-icon {
    z-index: 99;
    width: 50px;
    height: 50px;
    position: relative;
    font-size: 40px;
    transition: font-size 0.1s ease-in-out;
    /* Pour une transition en douceur */
}

.button-icon:hover {
    cursor: pointer;
    font-size: 50px;
    /* Augmenter la taille comme vous le souhaitez */
}

.shifted:hover {
    cursor: grab;
}
</style>