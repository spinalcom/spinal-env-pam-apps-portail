<template>
    <v-card
        class="bar-card  d-flex flex-shrink-1 flex-column"
    >
    <v-card-title class="card-title flex-shrink-1 justify-space-between">
      <p class="mb-0" style="padding: 10px;">
        {{ title }}
        <!-- <br> -->
        <!-- <span class="desc">{{ subtitle }}</span> -->
      </p>
      <div class="d-flex align-center mln6" style="position: absolute; right: calc(50% - 50px); font-size: 14px;" v-if="true">
        <v-icon style="margin-top: -1px; font-size: 18px; margin-right: 10px; color: #63717f;">{{ env.unit.left.icon }}</v-icon>
        <v-switch @click="$emit('calendar', switchValue)" style="margin-top: 1px; padding: 0px;height: 24px;" v-model="switchValue" inset color="blue-grey" dense/>
        <v-icon style="margin-top: -1px; font-size: 18px; margin-left: -10px; color: #63717f;">{{ env.unit.right.icon }}</v-icon>
      </div>
      <div v-if="true" style="height: 40px; align-self: flex-start; padding-top: 10px; padding-right: 10px;">
        <v-btn :disabled="false" @click="$emit('nav', -1)" style="font-size: 14px !important; border-radius: 10px;  min-width: 36px !important; box-shadow: none; border: 1px solid #EAEEF0 !important;"><v-icon style="color: #14202c !important" icon>mdi-chevron-left</v-icon>{{ prev }}</v-btn>
        <v-btn :disabled="false" @click="$emit('nav', +1)" style="font-size: 14px !important; border-radius: 10px;  min-width: 36px !important; box-shadow: none; border: 1px solid #EAEEF0 !important;">{{ next }}<v-icon style="color: #14202c !important" icon>mdi-chevron-right</v-icon></v-btn>
      </div>
    </v-card-title>
    <div class="d-flex flex-column flex-grow-1">
      <!-- <slot name="extras" v-if="switchValue && true"></slot> -->
      <div class="selects">
        <v-select v-model="space" append-icon="mdi-chevron-down" :items="spaceList" outlined menu-props="{ bottom: true }" color="#000000DE" item-color="#000000DE" dense style="margin-left: 10px !important; min-width: 100px; width: 250px; flex-grow: 0; font-size: 14px !important;" class="ml-8" label="Espace sélectionné">
            <template #label="{ attrs }"> <label :for="attrs.id" style="font-size: 14px;">Select an item</label></template>

            <template #item="{ item }">
            {{ item }}
            <!-- <SmallLegend :color="item.color" :text="item.name" :size="14"/> -->
            </template>

            <template #selection="{ item }">
            {{ item }}
            <!-- <SmallLegend :color="item.color" :text="item.name" :size="14"/> -->
            </template>
        </v-select>

        <v-select v-model="calculation" append-icon="mdi-chevron-down" :items="calculationList" outlined menu-props="{ bottom: true }" color="#000000DE" item-color="#000000DE" dense style="margin-left: 10px !important; min-width: 100px; width: 250px; flex-grow: 0; font-size: 14px !important;" class="ml-8" label="Calcul">
            <template #label="{ attrs }"> <label :for="attrs.id" style="font-size: 14px;">Select an item</label></template>

            <template #item="{ item }">
            {{ item }}
            <!-- <SmallLegend :color="item.color" :text="item.name" :size="14"/> -->
            </template>

            <template #selection="{ item }">
            {{ item }}
            <!-- <SmallLegend :color="item.color" :text="item.name" :size="14"/> -->
            </template>
        </v-select>
      </div>
      <div class="flex-grow-1">
        <CalendarAndStripe :results="data" :unit="unit" v-if="data && data.d && data.d.length>0"/>
      </div>
    </div>
    </v-card>
</template>

<script>
import env from '../../config';
import CalendarAndStripe from './CalendarAndStripe'
export default {
    name: 'HeatCal',
    components: {
        CalendarAndStripe
    },
    props: {
        next: {type: String, required: true},
        prev: {type: String, required: true},
        data: {required: true}
    },
    mounted() {
        this.arrCal = this.data.d;
        this.data.d = this.arrCal.max;
        this.unit = this.switchValue ? this.env.unit.right.name : this.env.unit.left.name
    },
    data() {
        return {
            env: env,
            title: 'Title of the heat cal',
            subtitle: 'No sub',
            switchValue: env.unit.default,
            unit: null,
            arrCal: [],
            /*data: {
                "y": "2023",
                "n": "Energie globale",
                "d": [
                    [
                        1454.25,
                        2442.75,
                        2440.125,
                        2442.75,
                        2366,
                        2347.125,
                        1534,
                        1297.625,
                        2698,
                        2512.625,
                        2455.125,
                        2374.375,
                        2356.875,
                        1848.625,
                        1839.875,
                        2684.5,
                        2600.625,
                        2494,
                        2463.375,
                        2494.25,
                        1850.375,
                        1882,
                        2882.25,
                        2859.25,
                        2743.375,
                        2877.25,
                        2799,
                        2086.875,
                        1973.875,
                        2764.875,
                        2502
                    ],
                    [
                        2581,
                        2576.125,
                        2557.125,
                        1961.375,
                        1847.25,
                        2712.875,
                        2471.125,
                        2522,
                        2572.125,
                        2497,
                        1872.25,
                        1826,
                        2647.75,
                        2473.125,
                        2431.875,
                        2427,
                        2466.125,
                        1780.25,
                        1655.75,
                        2431.75,
                        2238,
                        2585.375,
                        2441,
                        2243.5,
                        1672,
                        1604.5,
                        2352.875,
                        2364
                    ],
                    [
                        2314.125,
                        2237.625,
                        2158,
                        1619.125,
                        1819.75,
                        2669.125,
                        2365.5,
                        2392.5,
                        2262.875,
                        2345.25,
                        1753.25,
                        1739.625,
                        2451.75,
                        2292.75,
                        2231.75,
                        2118.875,
                        2170.375,
                        1645.75,
                        1727.875,
                        2443.75,
                        2316.5,
                        2359.875,
                        2106.625,
                        2073.75,
                        1565.75,
                        1583.375,
                        2425.5030000000006,
                        2874.0060000000003,
                        2882.0660000000003,
                        2870.9390000000003,
                        2997.062
                    ],
                    [
                        2232,
                        218.938,
                        208,
                        209,
                        210,
                        207,
                        208.938,
                        207,
                        -1,
                        2789.062,
                        2339.124,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ],
                    [
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ],
                    [
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ],
                    [
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ],
                    [
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ],
                    [
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ],
                    [
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ],
                    [
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ],
                    [
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1,
                        -1
                    ]
                ],
                "max": 3500,
                "min": null
            },*/
            space: 'Bâtiment',
            spaceList: ['Bâtiment'],
            calculation: 'Maximum',
            calculationList: ['Maximum', 'Minimum', 'Moyenne', 'Somme'],
        }
    },
    watch: {
        calculation(v) {
            if (v === 'Maximum') this.data.d = this.arrCal.max;
            if (v === 'Minimum') this.data.d = this.arrCal.min;
            if (v === 'Moyenne') this.data.d = this.arrCal.mean;
            if (v === 'Somme') this.data.d = this.arrCal.sum;
        },
        switchValue(v) {
            this.unit = v ? this.env.unit.right.name : this.env.unit.left.name;
        }
    }
}
</script>

<style>
.bar-card {
  width: 100%;
  background-color: #f9f9f9;
  font-family: "Charlevoix Pro";
  font-size: 14px;
  min-height: 220px !important;
  background: #f9f9f9;
  border-radius: 10px !important;
  box-shadow: 0px 3px 10px #49545C29 !important;
}

.card-title {
  letter-spacing: 1.1px !important;
  color: #000000DE !important;
  font-size: 20px !important;
  height: fit-content !important;
  padding: 0 !important;
}

.desc {
  margin-left: 23px;
  font-family: "Charlevoix Pro";
  font-size: 16px !important;
}

.selects {
    display: flex;
    flex-direction: row;
    gap: 20px;
}

.v-text-field.v-text-field--enclosed:not(.v-text-field--rounded) > .v-input__control > .v-input__slot {
    background: #EAEEF0 !important;
    border-radius: 5px !important;
}

.v-input__icon.v-input__icon--append .v-icon.notranslate.mdi.mdi-chevron-down.theme--light {
    color: #000000DE !important;
}

.theme--light.v-input--switch .v-input--switch__thumb, .theme--light.v-input--switch .v-input--switch__track {
  color: #607d8b !important;
}
</style>