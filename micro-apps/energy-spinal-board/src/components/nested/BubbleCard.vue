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
                <Scatter v-if="this.toto" ref="scatterChart" style="width: 100% !important;position: relative;"
                    :data="bubbleChartData" :options="bubbleChartOptions" />
            </div>
        </div>
    </v-card>
</template>
  
<script>
const fs = require('fs');
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
        navEnabled: {
            type: Boolean,
            default: false,
        },
        navText: {
            type: String,
            default: "",
        },
        step: {
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
        unitsx :{
            type: String,
            default: '',
        },
        unitsy :{
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
                                return [val+this.unitsx]},
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
                                return [val+this.unitsy]},
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
                    console.log('key pressed');
                    this.isShiftPressed = true;
                }
            },
            handleKeyUp(event) {
                if (event.key === 'Shift') {
                    console.log('key unpressed');
                    this.isShiftPressed = false;
                    this.$refs.myChart.$el.classList.remove('grabbing-cursor'); // Assurez-vous de supprimer le style au relâchement de la touche Shift
                }
            },
            check() {
                if (this.isMouseDown) {
                    console.log("La souris est toujours enfoncée");
                } else {
                    console.log("La souris n'est pas enfoncée");
                }
            },


            reloadgraph() {
                this.toto = !this.toto
                setTimeout(() => {
                    this.toto = true;
                    this.currentMode = null
                }, 5);
                this.startTimer();
            },
            generateBubbleData(a, b) {
                let data = [
                    {
                        "date": 1681311600000,
                        "value": 106,
                        "value2": 19.26
                    },
                    {
                        "date": 1681452000000,
                        "value": 122.875,
                        "value2": 0
                    },
                    {
                        "date": 1681466400000,
                        "value": 114.875,
                        "value2": 13.91
                    },
                    {
                        "date": 1681502400000,
                        "value": 62,
                        "value2": 0
                    },
                    {
                        "date": 1681506000000,
                        "value": 63,
                        "value2": 0
                    },
                    {
                        "date": 1681520400000,
                        "value": 58,
                        "value2": 0
                    },
                    {
                        "date": 1681545600000,
                        "value": 66,
                        "value2": 0.03
                    },
                    {
                        "date": 1681556400000,
                        "value": 49,
                        "value2": 0.06
                    },
                    {
                        "date": 1681560000000,
                        "value": 38.875,
                        "value2": 0.03
                    },
                    {
                        "date": 1681570800000,
                        "value": 24,
                        "value2": 0.03
                    },
                    {
                        "date": 1681574400000,
                        "value": 27.875,
                        "value2": 0.03
                    },
                    {
                        "date": 1681581600000,
                        "value": 49,
                        "value2": 0.09
                    },
                    {
                        "date": 1681585200000,
                        "value": 59,
                        "value2": 0.09
                    },
                    {
                        "date": 1681596000000,
                        "value": 54,
                        "value2": 0.09
                    },
                    {
                        "date": 1681610400000,
                        "value": 60.875,
                        "value2": 0.09
                    },
                    {
                        "date": 1681614000000,
                        "value": 63,
                        "value2": 0.09
                    },
                    {
                        "date": 1681621200000,
                        "value": 60.875,
                        "value2": 0.09
                    },
                    {
                        "date": 1681624800000,
                        "value": 60,
                        "value2": 0.09
                    },
                    {
                        "date": 1681635600000,
                        "value": 20,
                        "value2": 0.06
                    },
                    {
                        "date": 1681642800000,
                        "value": 0,
                        "value2": 0.09
                    },
                    {
                        "date": 1681646400000,
                        "value": 0,
                        "value2": 0.03
                    },
                    {
                        "date": 1681653600000,
                        "value": 0,
                        "value2": 0.06
                    },
                    {
                        "date": 1681657200000,
                        "value": 1.125,
                        "value2": 0.06
                    },
                    {
                        "date": 1681668000000,
                        "value": 49,
                        "value2": 0.06
                    },
                    {
                        "date": 1681675200000,
                        "value": 62.125,
                        "value2": 0.06
                    },
                    {
                        "date": 1681678800000,
                        "value": 59.875,
                        "value2": 0.06
                    },
                    {
                        "date": 1681693200000,
                        "value": 81.875,
                        "value2": 0.06
                    },
                    {
                        "date": 1681704000000,
                        "value": 87.875,
                        "value2": 0.06
                    },
                    {
                        "date": 1681707600000,
                        "value": 90,
                        "value2": 0.06
                    },
                    {
                        "date": 1681714800000,
                        "value": 121,
                        "value2": 14.89
                    },
                    {
                        "date": 1681722000000,
                        "value": 139,
                        "value2": 34.54
                    },
                    {
                        "date": 1681740000000,
                        "value": 130.125,
                        "value2": 23.57
                    },
                    {
                        "date": 1681758000000,
                        "value": 71.125,
                        "value2": 0
                    },
                    {
                        "date": 1681768800000,
                        "value": 53,
                        "value2": 0
                    },
                    {
                        "date": 1681804800000,
                        "value": 138.875,
                        "value2": 39.660000000000004
                    },
                    {
                        "date": 1681812000000,
                        "value": 93.875,
                        "value2": 41.89
                    },
                    {
                        "date": 1681819200000,
                        "value": 96.875,
                        "value2": 34.34
                    },
                    {
                        "date": 1681822800000,
                        "value": 103,
                        "value2": 37.63
                    },
                    {
                        "date": 1682064000000,
                        "value": 119,
                        "value2": 10.600000000000001
                    },
                    {
                        "date": 1682074800000,
                        "value": 98.875,
                        "value2": 5.7700000000000005
                    },
                    {
                        "date": 1682082000000,
                        "value": 96,
                        "value2": 7.46
                    },
                    {
                        "date": 1683212400000,
                        "value": 110.125,
                        "value2": 22.6
                    },
                    {
                        "date": 1683216000000,
                        "value": 95,
                        "value2": 6.43
                    },
                    {
                        "date": 1683223200000,
                        "value": 72.875,
                        "value2": 0
                    },
                    {
                        "date": 1683230400000,
                        "value": 65,
                        "value2": 0
                    },
                    {
                        "date": 1683252000000,
                        "value": 56.875,
                        "value2": 0
                    },
                    {
                        "date": 1683255600000,
                        "value": 60,
                        "value2": 0
                    },
                    {
                        "date": 1683266400000,
                        "value": 90,
                        "value2": 0
                    },
                    {
                        "date": 1683270000000,
                        "value": 103,
                        "value2": 5.3500000000000005
                    },
                    {
                        "date": 1683277200000,
                        "value": 98.125,
                        "value2": 13.56
                    },
                    {
                        "date": 1683288000000,
                        "value": 76,
                        "value2": 10.950000000000001
                    },
                    {
                        "date": 1683291600000,
                        "value": 76.875,
                        "value2": 10.82
                    },
                    {
                        "date": 1683788400000,
                        "value": 117,
                        "value2": 24.13
                    },
                    {
                        "date": 1683792000000,
                        "value": 121.125,
                        "value2": 48.47
                    },
                    {
                        "date": 1683799200000,
                        "value": 104.875,
                        "value2": 53.07
                    },
                    {
                        "date": 1683802800000,
                        "value": 107,
                        "value2": 39.84
                    },
                    {
                        "date": 1683810000000,
                        "value": 123,
                        "value2": 50.120000000000005
                    },
                    {
                        "date": 1683838800000,
                        "value": 62.875,
                        "value2": 0
                    },
                    {
                        "date": 1683889200000,
                        "value": 103.875,
                        "value2": 15.92
                    },
                    {
                        "date": 1683892800000,
                        "value": 103.875,
                        "value2": 15.13
                    },
                    {
                        "date": 1683900000000,
                        "value": 122,
                        "value2": 14.100000000000001
                    },
                    {
                        "date": 1684317600000,
                        "value": 88.125,
                        "value2": 38.1
                    },
                    {
                        "date": 1684324800000,
                        "value": 91,
                        "value2": 29.89
                    },
                    {
                        "date": 1684836000000,
                        "value": 129,
                        "value2": 44.15
                    },
                    {
                        "date": 1684854000000,
                        "value": 102.875,
                        "value2": 44.15
                    },
                    {
                        "date": 1684864800000,
                        "value": 75,
                        "value2": 44.15
                    },
                    {
                        "date": 1684868400000,
                        "value": 67.125,
                        "value2": 44.15
                    },
                    {
                        "date": 1684879200000,
                        "value": 53,
                        "value2": 44.15
                    },
                    {
                        "date": 1684890000000,
                        "value": 59.875,
                        "value2": 44.15
                    },
                    {
                        "date": 1684897200000,
                        "value": 61.875,
                        "value2": 44.15
                    },
                    {
                        "date": 1684900800000,
                        "value": 62.125,
                        "value2": 44.15
                    },
                    {
                        "date": 1684911600000,
                        "value": 114.875,
                        "value2": 44.15
                    },
                    {
                        "date": 1684922400000,
                        "value": 91,
                        "value2": 43.57
                    },
                    {
                        "date": 1684926000000,
                        "value": 74,
                        "value2": 30.39
                    },
                    {
                        "date": 1684940400000,
                        "value": 78,
                        "value2": 18.66
                    },
                    {
                        "date": 1685347200000,
                        "value": 91,
                        "value2": 20.85
                    },
                    {
                        "date": 1685358000000,
                        "value": 41,
                        "value2": 13.47
                    },
                    {
                        "date": 1685361600000,
                        "value": 35.125,
                        "value2": 17.580000000000002
                    },
                    {
                        "date": 1685365200000,
                        "value": 40.125,
                        "value2": 20.61
                    },
                    {
                        "date": 1685430000000,
                        "value": 113,
                        "value2": 23.84
                    },
                    {
                        "date": 1685433600000,
                        "value": 123.875,
                        "value2": 55.31
                    },
                    {
                        "date": 1685444400000,
                        "value": 75,
                        "value2": 33.21
                    },
                    {
                        "date": 1685451600000,
                        "value": 76,
                        "value2": 48.01
                    },
                    {
                        "date": 1685462400000,
                        "value": 85,
                        "value2": 5.18
                    },
                    {
                        "date": 1685520000000,
                        "value": 112,
                        "value2": 41.5
                    },
                    {
                        "date": 1685527200000,
                        "value": 82.125,
                        "value2": 43.08
                    },
                    {
                        "date": 1685530800000,
                        "value": 66.875,
                        "value2": 30.22
                    },
                    {
                        "date": 1685545200000,
                        "value": 74,
                        "value2": 23.3
                    },
                    {
                        "date": 1685602800000,
                        "value": 113.875,
                        "value2": 23.05
                    },
                    {
                        "date": 1685613600000,
                        "value": 93.875,
                        "value2": 52.11
                    },
                    {
                        "date": 1685617200000,
                        "value": 80,
                        "value2": 35.07
                    },
                    {
                        "date": 1685631600000,
                        "value": 88.125,
                        "value2": 31.88
                    },
                    {
                        "date": 1686132000000,
                        "value": 96,
                        "value2": 44.65
                    },
                    {
                        "date": 1686135600000,
                        "value": 81.875,
                        "value2": 26.41
                    },
                    {
                        "date": 1686139200000,
                        "value": 78.875,
                        "value2": 37.730000000000004
                    },
                    {
                        "date": 1686153600000,
                        "value": 113.125,
                        "value2": 7.88
                    },
                    {
                        "date": 1686297600000,
                        "value": 114.875,
                        "value2": 16.21
                    },
                    {
                        "date": 1686301200000,
                        "value": 117,
                        "value2": 18.95
                    },
                    {
                        "date": 1686322800000,
                        "value": 88,
                        "value2": 9.25
                    },
                    {
                        "date": 1686729600000,
                        "value": 126,
                        "value2": 49.83
                    },
                    {
                        "date": 1686733200000,
                        "value": 120,
                        "value2": 54.730000000000004
                    },
                    {
                        "date": 1686747600000,
                        "value": 85.875,
                        "value2": 48.47
                    },
                    {
                        "date": 1687276800000,
                        "value": 119.875,
                        "value2": 9.41
                    },
                    {
                        "date": 1687334400000,
                        "value": 127,
                        "value2": 42.29
                    },
                    {
                        "date": 1687356000000,
                        "value": 93,
                        "value2": 37.19
                    },
                    {
                        "date": 1687377600000,
                        "value": 64,
                        "value2": 0.08
                    },
                    {
                        "date": 1687395600000,
                        "value": 59,
                        "value2": 0.08
                    },
                    {
                        "date": 1687410000000,
                        "value": 82.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1687431600000,
                        "value": 99,
                        "value2": 45.85
                    },
                    {
                        "date": 1687438800000,
                        "value": 104.125,
                        "value2": 56.14
                    },
                    {
                        "date": 1687446000000,
                        "value": 112,
                        "value2": 39.22
                    },
                    {
                        "date": 1687507200000,
                        "value": 118.125,
                        "value2": 18.490000000000002
                    },
                    {
                        "date": 1687514400000,
                        "value": 90,
                        "value2": 20.44
                    },
                    {
                        "date": 1687518000000,
                        "value": 79,
                        "value2": 16.71
                    },
                    {
                        "date": 1687528800000,
                        "value": 91,
                        "value2": 15.26
                    },
                    {
                        "date": 1687532400000,
                        "value": 81.875,
                        "value2": 7.21
                    },
                    {
                        "date": 1687550400000,
                        "value": 70.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1687572000000,
                        "value": 60.125,
                        "value2": 0.08
                    },
                    {
                        "date": 1687579200000,
                        "value": 60.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1687590000000,
                        "value": 64,
                        "value2": 0.04
                    },
                    {
                        "date": 1687597200000,
                        "value": 49,
                        "value2": 0.04
                    },
                    {
                        "date": 1687608000000,
                        "value": 0,
                        "value2": 0
                    },
                    {
                        "date": 1687618800000,
                        "value": 0,
                        "value2": 0
                    },
                    {
                        "date": 1687629600000,
                        "value": 30,
                        "value2": 0.04
                    },
                    {
                        "date": 1687633200000,
                        "value": 56.875,
                        "value2": 0.04
                    },
                    {
                        "date": 1687644000000,
                        "value": 59,
                        "value2": 0.04
                    },
                    {
                        "date": 1687651200000,
                        "value": 62,
                        "value2": 0.04
                    },
                    {
                        "date": 1687662000000,
                        "value": 59.125,
                        "value2": 0.04
                    },
                    {
                        "date": 1687669200000,
                        "value": 58,
                        "value2": 0.04
                    },
                    {
                        "date": 1687672800000,
                        "value": 61,
                        "value2": 0.04
                    },
                    {
                        "date": 1687683600000,
                        "value": 47.125,
                        "value2": 0
                    },
                    {
                        "date": 1687690800000,
                        "value": 0,
                        "value2": 0
                    },
                    {
                        "date": 1687694400000,
                        "value": 0,
                        "value2": 0
                    },
                    {
                        "date": 1687705200000,
                        "value": 0,
                        "value2": 0.04
                    },
                    {
                        "date": 1687708800000,
                        "value": 1.125,
                        "value2": 0.04
                    },
                    {
                        "date": 1687716000000,
                        "value": 32,
                        "value2": 0.12
                    },
                    {
                        "date": 1687719600000,
                        "value": 60,
                        "value2": 0.12
                    },
                    {
                        "date": 1687730400000,
                        "value": 54.875,
                        "value2": 0.12
                    },
                    {
                        "date": 1687741200000,
                        "value": 81.875,
                        "value2": 0.12
                    },
                    {
                        "date": 1687744800000,
                        "value": 44.875,
                        "value2": 0.12
                    },
                    {
                        "date": 1687766400000,
                        "value": null,
                        "value2": 50.17
                    },
                    {
                        "date": 1687788000000,
                        "value": null,
                        "value2": 43.12
                    },
                    {
                        "date": 1687795200000,
                        "value": null,
                        "value2": 10.950000000000001
                    },
                    {
                        "date": 1687806000000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687809600000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687827600000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687834800000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687838400000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687845600000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687874400000,
                        "value": null,
                        "value2": 45.980000000000004
                    },
                    {
                        "date": 1687878000000,
                        "value": null,
                        "value2": 33.42
                    },
                    {
                        "date": 1687892400000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687896000000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687903200000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687910400000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687921200000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687924800000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687932000000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687939200000,
                        "value": null,
                        "value2": 43.160000000000004
                    },
                    {
                        "date": 1687950000000,
                        "value": null,
                        "value2": 32.88
                    },
                    {
                        "date": 1687978800000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1687989600000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1688004000000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1688011200000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1688018400000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1688022000000,
                        "value": null,
                        "value2": 16.87
                    },
                    {
                        "date": 1688072400000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1688083200000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1688090400000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1688097600000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1688101200000,
                        "value": null,
                        "value2": 0
                    },
                    {
                        "date": 1688108400000,
                        "value": null,
                        "value2": 6.18
                    },
                    {
                        "date": 1688115600000,
                        "value": null,
                        "value2": 17.54
                    },
                    {
                        "date": 1688122800000,
                        "value": null,
                        "value2": 13.52
                    },
                    {
                        "date": 1689775200000,
                        "value": 108.875,
                        "value2": 33.29
                    },
                    {
                        "date": 1689836400000,
                        "value": 110.125,
                        "value2": 18.91
                    },
                    {
                        "date": 1689843600000,
                        "value": 112,
                        "value2": 47.93
                    },
                    {
                        "date": 1689854400000,
                        "value": 76.875,
                        "value2": 39.39
                    },
                    {
                        "date": 1689861600000,
                        "value": 96.875,
                        "value2": 39.34
                    },
                    {
                        "date": 1689926400000,
                        "value": 97.125,
                        "value2": 13.52
                    },
                    {
                        "date": 1689933600000,
                        "value": 81,
                        "value2": 15.71
                    },
                    {
                        "date": 1689937200000,
                        "value": 78,
                        "value2": 10.36
                    },
                    {
                        "date": 1689944400000,
                        "value": 84.125,
                        "value2": 13.39
                    },
                    {
                        "date": 1689951600000,
                        "value": 86.875,
                        "value2": 4.6000000000000005
                    },
                    {
                        "date": 1689969600000,
                        "value": 75.875,
                        "value2": 0
                    },
                    {
                        "date": 1689973200000,
                        "value": 67,
                        "value2": 0
                    },
                    {
                        "date": 1689991200000,
                        "value": 63,
                        "value2": 0
                    },
                    {
                        "date": 1689994800000,
                        "value": 60,
                        "value2": 0
                    },
                    {
                        "date": 1690002000000,
                        "value": 85,
                        "value2": 0
                    },
                    {
                        "date": 1690005600000,
                        "value": 88.125,
                        "value2": 0
                    },
                    {
                        "date": 1690016400000,
                        "value": 78.875,
                        "value2": 0.17
                    },
                    {
                        "date": 1690030800000,
                        "value": 9.125,
                        "value2": 0.12
                    },
                    {
                        "date": 1690041600000,
                        "value": 5,
                        "value2": 0.08
                    },
                    {
                        "date": 1690052400000,
                        "value": 59.875,
                        "value2": 0.04
                    },
                    {
                        "date": 1690056000000,
                        "value": 65,
                        "value2": 0.04
                    },
                    {
                        "date": 1690063200000,
                        "value": 63,
                        "value2": 0.04
                    },
                    {
                        "date": 1690077600000,
                        "value": 62.125,
                        "value2": 0.04
                    },
                    {
                        "date": 1690081200000,
                        "value": 62,
                        "value2": 0.04
                    },
                    {
                        "date": 1690088400000,
                        "value": 61,
                        "value2": 0.04
                    },
                    {
                        "date": 1690099200000,
                        "value": 52.125,
                        "value2": 0.04
                    },
                    {
                        "date": 1690110000000,
                        "value": 55.125,
                        "value2": 0
                    },
                    {
                        "date": 1690117200000,
                        "value": 48,
                        "value2": 0.04
                    },
                    {
                        "date": 1690120800000,
                        "value": 26,
                        "value2": 0.04
                    },
                    {
                        "date": 1690142400000,
                        "value": 65,
                        "value2": 0.04
                    },
                    {
                        "date": 1690164000000,
                        "value": 82.875,
                        "value2": 0.04
                    },
                    {
                        "date": 1690174800000,
                        "value": 88.125,
                        "value2": 0.04
                    },
                    {
                        "date": 1690189200000,
                        "value": 117,
                        "value2": 41.87
                    },
                    {
                        "date": 1690200000000,
                        "value": 93.875,
                        "value2": 34.29
                    },
                    {
                        "date": 1690210800000,
                        "value": 97,
                        "value2": 27.07
                    },
                    {
                        "date": 1690225200000,
                        "value": 72,
                        "value2": 0
                    },
                    {
                        "date": 1690228800000,
                        "value": 72.125,
                        "value2": 0
                    },
                    {
                        "date": 1690246800000,
                        "value": 59,
                        "value2": 0
                    },
                    {
                        "date": 1690257600000,
                        "value": 62.125,
                        "value2": 0
                    },
                    {
                        "date": 1690272000000,
                        "value": 120.125,
                        "value2": 48.71
                    },
                    {
                        "date": 1690282800000,
                        "value": 89.125,
                        "value2": 38.35
                    },
                    {
                        "date": 1690290000000,
                        "value": 116.875,
                        "value2": 47.68
                    },
                    {
                        "date": 1690300800000,
                        "value": 112,
                        "value2": 12.19
                    },
                    {
                        "date": 1690354800000,
                        "value": 106,
                        "value2": 12.06
                    },
                    {
                        "date": 1690358400000,
                        "value": 118.875,
                        "value2": 32.300000000000004
                    },
                    {
                        "date": 1690362000000,
                        "value": 109.125,
                        "value2": 36.82
                    },
                    {
                        "date": 1690365600000,
                        "value": 88,
                        "value2": 37.11
                    },
                    {
                        "date": 1690376400000,
                        "value": 88.125,
                        "value2": 35.2
                    },
                    {
                        "date": 1690380000000,
                        "value": 92.125,
                        "value2": 32.92
                    },
                    {
                        "date": 1690401600000,
                        "value": 62,
                        "value2": 0
                    },
                    {
                        "date": 1690419600000,
                        "value": 62.125,
                        "value2": 0
                    },
                    {
                        "date": 1690426800000,
                        "value": 64,
                        "value2": 0
                    },
                    {
                        "date": 1690437600000,
                        "value": 103.125,
                        "value2": 0
                    },
                    {
                        "date": 1690448400000,
                        "value": 111,
                        "value2": 40.800000000000004
                    },
                    {
                        "date": 1690459200000,
                        "value": 102.125,
                        "value2": 30.93
                    },
                    {
                        "date": 1690506000000,
                        "value": 64,
                        "value2": 0
                    },
                    {
                        "date": 1690516800000,
                        "value": 65,
                        "value2": 0
                    },
                    {
                        "date": 1690524000000,
                        "value": 103,
                        "value2": 0
                    },
                    {
                        "date": 1690527600000,
                        "value": 108.875,
                        "value2": 4.44
                    },
                    {
                        "date": 1690534800000,
                        "value": 110.125,
                        "value2": 11.61
                    },
                    {
                        "date": 1690538400000,
                        "value": 111,
                        "value2": 11.57
                    },
                    {
                        "date": 1690545600000,
                        "value": 93,
                        "value2": 9.99
                    },
                    {
                        "date": 1690552800000,
                        "value": 88,
                        "value2": 8.25
                    },
                    {
                        "date": 1690581600000,
                        "value": 58,
                        "value2": 0.08
                    },
                    {
                        "date": 1690592400000,
                        "value": 64.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1690596000000,
                        "value": 64,
                        "value2": 0.08
                    },
                    {
                        "date": 1690603200000,
                        "value": 65,
                        "value2": 0.08
                    },
                    {
                        "date": 1690606800000,
                        "value": 87.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1690617600000,
                        "value": 87.125,
                        "value2": 0.21
                    },
                    {
                        "date": 1690621200000,
                        "value": 80,
                        "value2": 0.21
                    },
                    {
                        "date": 1690628400000,
                        "value": 81,
                        "value2": 0.12
                    },
                    {
                        "date": 1690632000000,
                        "value": 57.125,
                        "value2": 0.12
                    },
                    {
                        "date": 1690642800000,
                        "value": 35.125,
                        "value2": 0.08
                    },
                    {
                        "date": 1690653600000,
                        "value": 57.125,
                        "value2": 0.08
                    },
                    {
                        "date": 1690657200000,
                        "value": 60,
                        "value2": 0.08
                    },
                    {
                        "date": 1690668000000,
                        "value": 55.125,
                        "value2": 0.08
                    },
                    {
                        "date": 1690678800000,
                        "value": 57.125,
                        "value2": 0.08
                    },
                    {
                        "date": 1690686000000,
                        "value": 56.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1690689600000,
                        "value": 58,
                        "value2": 0.08
                    },
                    {
                        "date": 1690700400000,
                        "value": 54.875,
                        "value2": 0.04
                    },
                    {
                        "date": 1690711200000,
                        "value": 25.125,
                        "value2": 0.04
                    },
                    {
                        "date": 1690722000000,
                        "value": 11,
                        "value2": 0
                    },
                    {
                        "date": 1690729200000,
                        "value": 13.875,
                        "value2": 0
                    },
                    {
                        "date": 1690732800000,
                        "value": 59,
                        "value2": 0
                    },
                    {
                        "date": 1690740000000,
                        "value": 56.125,
                        "value2": 0
                    },
                    {
                        "date": 1690750800000,
                        "value": 60.875,
                        "value2": 0
                    },
                    {
                        "date": 1690768800000,
                        "value": 86,
                        "value2": 0
                    },
                    {
                        "date": 1690776000000,
                        "value": 85,
                        "value2": 0
                    },
                    {
                        "date": 1690783200000,
                        "value": 98.875,
                        "value2": 0
                    },
                    {
                        "date": 1690786800000,
                        "value": 108,
                        "value2": 11.07
                    },
                    {
                        "date": 1690797600000,
                        "value": 108,
                        "value2": 32.84
                    },
                    {
                        "date": 1690804800000,
                        "value": 110,
                        "value2": 26.37
                    },
                    {
                        "date": 1690826400000,
                        "value": 72,
                        "value2": 0
                    },
                    {
                        "date": 1690830000000,
                        "value": 76,
                        "value2": 0
                    },
                    {
                        "date": 1690840800000,
                        "value": 62.125,
                        "value2": 0
                    },
                    {
                        "date": 1690848000000,
                        "value": 62.125,
                        "value2": 0
                    },
                    {
                        "date": 1690855200000,
                        "value": 62,
                        "value2": 0
                    },
                    {
                        "date": 1690858800000,
                        "value": 61.125,
                        "value2": 0
                    },
                    {
                        "date": 1690869600000,
                        "value": 100.125,
                        "value2": 0
                    },
                    {
                        "date": 1690884000000,
                        "value": 95,
                        "value2": 43.62
                    },
                    {
                        "date": 1690887600000,
                        "value": 100.875,
                        "value2": 28.77
                    },
                    {
                        "date": 1690902000000,
                        "value": 106,
                        "value2": 25.04
                    },
                    {
                        "date": 1690905600000,
                        "value": 115,
                        "value2": 4.44
                    },
                    {
                        "date": 1690916400000,
                        "value": 68.125,
                        "value2": 0.08
                    },
                    {
                        "date": 1690923600000,
                        "value": 61.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1690941600000,
                        "value": 59.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1690952400000,
                        "value": 80.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1690956000000,
                        "value": 103,
                        "value2": 0.08
                    },
                    {
                        "date": 1690963200000,
                        "value": 114.125,
                        "value2": 25.95
                    },
                    {
                        "date": 1690977600000,
                        "value": 72,
                        "value2": 27.11
                    },
                    {
                        "date": 1690984800000,
                        "value": 100,
                        "value2": 25.46
                    },
                    {
                        "date": 1691024400000,
                        "value": 61,
                        "value2": 0
                    },
                    {
                        "date": 1691035200000,
                        "value": 60.875,
                        "value2": 0
                    },
                    {
                        "date": 1691038800000,
                        "value": 81.125,
                        "value2": 0
                    },
                    {
                        "date": 1691046000000,
                        "value": 111,
                        "value2": 11.48
                    },
                    {
                        "date": 1691049600000,
                        "value": 118,
                        "value2": 26.45
                    },
                    {
                        "date": 1691056800000,
                        "value": 103,
                        "value2": 28.19
                    },
                    {
                        "date": 1691067600000,
                        "value": 101,
                        "value2": 24.46
                    },
                    {
                        "date": 1691074800000,
                        "value": 107,
                        "value2": 12.85
                    },
                    {
                        "date": 1691078400000,
                        "value": 117,
                        "value2": 0
                    },
                    {
                        "date": 1691096400000,
                        "value": 66,
                        "value2": 0
                    },
                    {
                        "date": 1691100000000,
                        "value": 62.125,
                        "value2": 0
                    },
                    {
                        "date": 1691114400000,
                        "value": 60,
                        "value2": 0
                    },
                    {
                        "date": 1691118000000,
                        "value": 62,
                        "value2": 0
                    },
                    {
                        "date": 1691128800000,
                        "value": 101,
                        "value2": 0
                    },
                    {
                        "date": 1691132400000,
                        "value": 105.875,
                        "value2": 4.3500000000000005
                    },
                    {
                        "date": 1691139600000,
                        "value": 102.125,
                        "value2": 11.44
                    },
                    {
                        "date": 1691143200000,
                        "value": 85,
                        "value2": 10.99
                    },
                    {
                        "date": 1691150400000,
                        "value": 101,
                        "value2": 9.66
                    },
                    {
                        "date": 1691154000000,
                        "value": 75,
                        "value2": 9.040000000000001
                    },
                    {
                        "date": 1691164800000,
                        "value": 103,
                        "value2": 0
                    },
                    {
                        "date": 1691168400000,
                        "value": 91,
                        "value2": 0
                    },
                    {
                        "date": 1691179200000,
                        "value": 67.125,
                        "value2": 0
                    },
                    {
                        "date": 1691182800000,
                        "value": 66,
                        "value2": 0
                    },
                    {
                        "date": 1691200800000,
                        "value": 61.125,
                        "value2": 0
                    },
                    {
                        "date": 1691208000000,
                        "value": 60.875,
                        "value2": 0
                    },
                    {
                        "date": 1691211600000,
                        "value": 88.125,
                        "value2": 0
                    },
                    {
                        "date": 1691218800000,
                        "value": 92,
                        "value2": 0.04
                    },
                    {
                        "date": 1691222400000,
                        "value": 90,
                        "value2": 0.17
                    },
                    {
                        "date": 1691229600000,
                        "value": 85,
                        "value2": 0.29
                    },
                    {
                        "date": 1691236800000,
                        "value": 78,
                        "value2": 0.17
                    },
                    {
                        "date": 1691240400000,
                        "value": 35.875,
                        "value2": 0.12
                    },
                    {
                        "date": 1691247600000,
                        "value": 8.125,
                        "value2": 0.04
                    },
                    {
                        "date": 1691254800000,
                        "value": 43,
                        "value2": 0
                    },
                    {
                        "date": 1691391600000,
                        "value": 108.125,
                        "value2": 10.41
                    },
                    {
                        "date": 1691398800000,
                        "value": 100,
                        "value2": 25.29
                    },
                    {
                        "date": 1691402400000,
                        "value": 87.875,
                        "value2": 23.26
                    },
                    {
                        "date": 1691409600000,
                        "value": 65,
                        "value2": 19.61
                    },
                    {
                        "date": 1691413200000,
                        "value": 70,
                        "value2": 21.97
                    },
                    {
                        "date": 1691420400000,
                        "value": 90,
                        "value2": 11.32
                    },
                    {
                        "date": 1691424000000,
                        "value": 90,
                        "value2": 0
                    },
                    {
                        "date": 1691431200000,
                        "value": 75,
                        "value2": 0
                    },
                    {
                        "date": 1691438400000,
                        "value": 69,
                        "value2": 0
                    },
                    {
                        "date": 1691463600000,
                        "value": 61.875,
                        "value2": 0
                    },
                    {
                        "date": 1691467200000,
                        "value": 63.125,
                        "value2": 0
                    },
                    {
                        "date": 1691474400000,
                        "value": 100.125,
                        "value2": 0
                    },
                    {
                        "date": 1691485200000,
                        "value": 101.875,
                        "value2": 32.92
                    },
                    {
                        "date": 1691492400000,
                        "value": 76.125,
                        "value2": 24.17
                    },
                    {
                        "date": 1691496000000,
                        "value": 86,
                        "value2": 24.59
                    },
                    {
                        "date": 1691503200000,
                        "value": 81,
                        "value2": 26.490000000000002
                    },
                    {
                        "date": 1691506800000,
                        "value": 94.125,
                        "value2": 16.75
                    },
                    {
                        "date": 1691514000000,
                        "value": 99.125,
                        "value2": 0.04
                    },
                    {
                        "date": 1691521200000,
                        "value": 69,
                        "value2": 0
                    },
                    {
                        "date": 1691532000000,
                        "value": 61.125,
                        "value2": 0
                    },
                    {
                        "date": 1691542800000,
                        "value": 61.125,
                        "value2": 0
                    },
                    {
                        "date": 1691553600000,
                        "value": 61,
                        "value2": 0
                    },
                    {
                        "date": 1691557200000,
                        "value": 81,
                        "value2": 0
                    },
                    {
                        "date": 1691564400000,
                        "value": 107,
                        "value2": 9.370000000000001
                    },
                    {
                        "date": 1691575200000,
                        "value": 94,
                        "value2": 25.62
                    },
                    {
                        "date": 1691578800000,
                        "value": 96,
                        "value2": 17.87
                    },
                    {
                        "date": 1691586000000,
                        "value": 79,
                        "value2": 24.05
                    },
                    {
                        "date": 1691589600000,
                        "value": 114.125,
                        "value2": 20.400000000000002
                    },
                    {
                        "date": 1691596800000,
                        "value": 107,
                        "value2": 0.9500000000000001
                    },
                    {
                        "date": 1691611200000,
                        "value": 69,
                        "value2": 0
                    },
                    {
                        "date": 1691632800000,
                        "value": 60.875,
                        "value2": 0
                    },
                    {
                        "date": 1691643600000,
                        "value": 80,
                        "value2": 0
                    },
                    {
                        "date": 1691647200000,
                        "value": 99.875,
                        "value2": 0
                    },
                    {
                        "date": 1691661600000,
                        "value": 85,
                        "value2": 25.54
                    },
                    {
                        "date": 1691672400000,
                        "value": 100.875,
                        "value2": 24.96
                    },
                    {
                        "date": 1691679600000,
                        "value": 77.125,
                        "value2": 14.76
                    },
                    {
                        "date": 1691694000000,
                        "value": 71.125,
                        "value2": 0
                    },
                    {
                        "date": 1691740800000,
                        "value": 107.125,
                        "value2": 7.05
                    },
                    {
                        "date": 1691751600000,
                        "value": 73,
                        "value2": 7.46
                    },
                    {
                        "date": 1691755200000,
                        "value": 81.875,
                        "value2": 7.55
                    },
                    {
                        "date": 1691762400000,
                        "value": 102.875,
                        "value2": 5.76
                    },
                    {
                        "date": 1691766000000,
                        "value": 100.125,
                        "value2": 1.62
                    },
                    {
                        "date": 1691773200000,
                        "value": 99.875,
                        "value2": 0
                    },
                    {
                        "date": 1691780400000,
                        "value": 65.875,
                        "value2": 0
                    },
                    {
                        "date": 1691784000000,
                        "value": 59,
                        "value2": 0
                    },
                    {
                        "date": 1691791200000,
                        "value": 60.875,
                        "value2": 0
                    },
                    {
                        "date": 1691802000000,
                        "value": 61.125,
                        "value2": 0
                    },
                    {
                        "date": 1691812800000,
                        "value": 62,
                        "value2": 0
                    },
                    {
                        "date": 1691823600000,
                        "value": 70,
                        "value2": 0.12
                    },
                    {
                        "date": 1691827200000,
                        "value": 55.875,
                        "value2": 0.12
                    },
                    {
                        "date": 1691834400000,
                        "value": 74,
                        "value2": 0.12
                    },
                    {
                        "date": 1691845200000,
                        "value": 11,
                        "value2": 0.08
                    },
                    {
                        "date": 1691856000000,
                        "value": 22.875,
                        "value2": 0
                    },
                    {
                        "date": 1691859600000,
                        "value": 42,
                        "value2": 0
                    },
                    {
                        "date": 1691913600000,
                        "value": 53,
                        "value2": 0.04
                    },
                    {
                        "date": 1691924400000,
                        "value": 11.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1691935200000,
                        "value": 13.125,
                        "value2": 0
                    },
                    {
                        "date": 1691946000000,
                        "value": 27,
                        "value2": 0.08
                    },
                    {
                        "date": 1691949600000,
                        "value": 61.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1691953200000,
                        "value": 64,
                        "value2": 0.08
                    },
                    {
                        "date": 1691964000000,
                        "value": 61.875,
                        "value2": 0.08
                    },
                    {
                        "date": 1691974800000,
                        "value": 85,
                        "value2": 0.08
                    },
                    {
                        "date": 1691982000000,
                        "value": 86,
                        "value2": 0.08
                    },
                    {
                        "date": 1691989200000,
                        "value": 87,
                        "value2": 0.08
                    },
                    {
                        "date": 1692007200000,
                        "value": 71.875,
                        "value2": 6.22
                    },
                    {
                        "date": 1692014400000,
                        "value": 62.125,
                        "value2": 4.6000000000000005
                    },
                    {
                        "date": 1692025200000,
                        "value": 93,
                        "value2": 0.46
                    },
                    {
                        "date": 1692032400000,
                        "value": 88,
                        "value2": 0
                    },
                    {
                        "date": 1692036000000,
                        "value": 75,
                        "value2": 0
                    },
                    {
                        "date": 1692046800000,
                        "value": 66,
                        "value2": 0
                    },
                    {
                        "date": 1692050400000,
                        "value": 62.125,
                        "value2": 0
                    },
                    {
                        "date": 1692061200000,
                        "value": 61,
                        "value2": 0
                    },
                    {
                        "date": 1692064800000,
                        "value": 62,
                        "value2": 0
                    },
                    {
                        "date": 1692072000000,
                        "value": 66.125,
                        "value2": 0
                    },
                    {
                        "date": 1692079200000,
                        "value": 96,
                        "value2": 0
                    },
                    {
                        "date": 1692090000000,
                        "value": 80,
                        "value2": 0
                    },
                    {
                        "date": 1692097200000,
                        "value": 52,
                        "value2": 0
                    },
                    {
                        "date": 1692108000000,
                        "value": 80,
                        "value2": 0
                    },
                    {
                        "date": 1692115200000,
                        "value": 85,
                        "value2": 0.04
                    },
                    {
                        "date": 1692118800000,
                        "value": 71.875,
                        "value2": 0.04
                    },
                    {
                        "date": 1692129600000,
                        "value": 66,
                        "value2": 0.04
                    },
                    {
                        "date": 1692151200000,
                        "value": 64,
                        "value2": 0.04
                    },
                    {
                        "date": 1692158400000,
                        "value": 62.875,
                        "value2": 0.04
                    },
                    {
                        "date": 1692162000000,
                        "value": 82.125,
                        "value2": 0.04
                    },
                    {
                        "date": 1692172800000,
                        "value": 95.125,
                        "value2": 20.85
                    },
                    {
                        "date": 1692183600000,
                        "value": 83.125,
                        "value2": 16.63
                    },
                    {
                        "date": 1692194400000,
                        "value": 89.125,
                        "value2": 18.86
                    },
                    {
                        "date": 1692201600000,
                        "value": 96,
                        "value2": 0.41000000000000003
                    },
                    {
                        "date": 1692208800000,
                        "value": 75,
                        "value2": 0
                    },
                    {
                        "date": 1692219600000,
                        "value": 72.125,
                        "value2": 0
                    },
                    {
                        "date": 1692234000000,
                        "value": 61.875,
                        "value2": 0
                    },
                    {
                        "date": 1692241200000,
                        "value": 63,
                        "value2": 0
                    },
                    {
                        "date": 1692244800000,
                        "value": 65,
                        "value2": 0
                    },
                    {
                        "date": 1692255600000,
                        "value": 88,
                        "value2": 10.07
                    },
                    {
                        "date": 1692259200000,
                        "value": 109.875,
                        "value2": 23.18
                    },
                    {
                        "date": 1692270000000,
                        "value": 81.875,
                        "value2": 17.580000000000002
                    },
                    {
                        "date": 1692280800000,
                        "value": 71.125,
                        "value2": 20.650000000000002
                    },
                    {
                        "date": 1692291600000,
                        "value": 82.875,
                        "value2": 0
                    },
                    {
                        "date": 1692302400000,
                        "value": 69,
                        "value2": 0
                    },
                    {
                        "date": 1692327600000,
                        "value": 63,
                        "value2": 0
                    },
                    {
                        "date": 1692331200000,
                        "value": 64,
                        "value2": 0
                    },
                    {
                        "date": 1692342000000,
                        "value": 103.875,
                        "value2": 4.44
                    },
                    {
                        "date": 1692352800000,
                        "value": 83.125,
                        "value2": 8.96
                    },
                    {
                        "date": 1692363600000,
                        "value": 96,
                        "value2": 7.75
                    },
                    {
                        "date": 1692525600000,
                        "value": 6.875,
                        "value2": 0
                    },
                    {
                        "date": 1692579600000,
                        "value": 88.125,
                        "value2": 0
                    },
                    {
                        "date": 1692590400000,
                        "value": 90.125,
                        "value2": 0
                    },
                    {
                        "date": 1692594000000,
                        "value": 93.875,
                        "value2": 0
                    },
                    {
                        "date": 1692601200000,
                        "value": 114.875,
                        "value2": 10.28
                    },
                    {
                        "date": 1692604800000,
                        "value": 120.125,
                        "value2": 24.59
                    },
                    {
                        "date": 1692612000000,
                        "value": 80,
                        "value2": 26.37
                    },
                    {
                        "date": 1692622800000,
                        "value": 83.125,
                        "value2": 25.080000000000002
                    },
                    {
                        "date": 1692630000000,
                        "value": 90,
                        "value2": 15.09
                    },
                    {
                        "date": 1692633600000,
                        "value": 87.125,
                        "value2": 2.36
                    },
                    {
                        "date": 1692651600000,
                        "value": 64,
                        "value2": 0.08
                    },
                    {
                        "date": 1692669600000,
                        "value": 63,
                        "value2": 0.08
                    },
                    {
                        "date": 1692687600000,
                        "value": 111,
                        "value2": 14.47
                    },
                    {
                        "date": 1692694800000,
                        "value": 103.875,
                        "value2": 32.17
                    },
                    {
                        "date": 1692705600000,
                        "value": 78,
                        "value2": 28.52
                    }
                ]
                const values1 = data.map(d => d.value2);
                const values2 = data.map(d => d.value);

                const datasets = values1.map((value1, index) => {
                    return {
                        label: `Point ${index + 1}`,
                        data: [
                            {
                                x: Math.max(0, value1),
                                y: Math.max(0, values2[index]),
                                r: 10
                            }
                        ],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: this.bubbleColor,
                        borderWidth: 1,
                    };
                });

                return {
                    datasets: datasets
                };

            },
            generateBubbleData2(data1, data2) {
                const datasets = data1.map((value, index) => {
                    return {
                        label: `Point ${index + 1}`,
                        data: [
                            {
                                x: Math.max(0, data2[index]),
                                y: Math.max(0, value),
                                r: 10
                            }
                        ],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    };
                });

                return {
                    datasets: datasets
                };
            },

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
                return this.generateBubbleData(this.data1[0].data, this.data2[0].data);
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