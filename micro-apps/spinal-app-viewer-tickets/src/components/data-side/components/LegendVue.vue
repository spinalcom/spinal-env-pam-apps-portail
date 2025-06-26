<template>
    <div class="legend-container">
        <div class="d-flex flex-row" style="justify-content: space-between;width: 100%; align-items: center;">
            <p class="legend-text">Légende</p>
            <div class="d-flex flex-row align-center" style="gap: 10px;">
                <p class="legend-text">{{ !isPriority ? 'Par Priorité' : 'Par Étape' }}</p>
                <v-switch class="switch" v-model="localPriority" @change="emitToggle" color="#14202c" inset dense
                    hide-details />
            </div>
        </div>
        <v-divider style="margin: 5px 0px ;position: relative;"></v-divider>
        <div class="circle-indicators">
            <template v-if="localPriority">
                <div v-for="(step, index) in stepslist" :key="'step-' + index" class="indicator-circle"
                    :style="{ backgroundColor: step.color }"></div>
            </template>
            <template v-else>
                <div v-for="(color, index) in priorityColors" :key="'priority-' + index" class="indicator-circle"
                    :style="{ backgroundColor: color }"></div>
            </template>
        </div>

        <div v-for="(item, index) in legendItems" :key="index" class="legend-item"
            v-if="item.type !== 'pentagon' || item.number > 0" @click="selectLegend(item, index)">
            <div :class="['legend-icon', item.type]" :style="{ borderColor: item.color }"></div>
            <div v-if="item.type == 'triangle'" class="triangle-border" :style="{ backgroundColor: item.color }">
                <div class="triangle-himself"></div>
            </div>
            <div v-if="item.type == 'pentagon' && item.number > 0" class="pentagon-border"
                :style="{ backgroundColor: item.color }">
                <div class="pentagon-himself"></div>
            </div>
            <span class="legend-text">
                Ticket sur <span class="legend-title">{{ item.title }}</span> (<span class="legend-title">{{ item.number
                    }}</span>)
            </span>
        </div>
    </div>
</template>


<script>
export default {
    name: "LegendVue",
    props: {
        legendItems: {
            type: Array,
            default: () => [],
        },
        isPriority: {
            type: Boolean,
            default: false,
        },
        stepslist: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            selectedIndex: 0,
            localPriority: this.isPriority,
            priorityColors: ['#f44336', '#ffeb3b', '#4caf50'],
        };
    },
    watch: {
        isPriority(newVal) {
            this.localPriority = newVal;
        }
    },
    methods: {
        selectLegend(item, index) {
            this.selectedIndex = index;
            this.$emit("legendSelected", item);
        },
        emitToggle() {
            this.$emit("togglePriority", this.localPriority);
        }
    },
    mounted() {
    }
};

</script>

<style scoped>
.legend-container {
    width: 320px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    overflow: hidden;
}

.legend-item {
    display: flex;
    align-items: center;
    /* gap: 5px; */
    font-size: 11px !important;
    font-weight: bold;
    cursor: pointer;
    z-index: 2;
    height: 30px;
}

.legend-icon {
    background-color: #fff;
    border: 2.5px solid;
    width: 17px;
    height: 17px;
    margin-right: 7px;
}

.legend-icon.circle {
    border-radius: 50%;
}

.legend-icon.triangle {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    display: none;
}

.legend-icon.square {
    border-radius: 0;
}

.legend-icon.pentagon {
    clip-path: polygon(50% 0%, 100% 35%, 85% 100%, 15% 100%, 0% 35%);
    display: none;
}

.pentagon-border {
    clip-path: polygon(50% 0%, 100% 35%, 85% 100%, 15% 100%, 0% 35%);
    width: 20px;
    height: 19px;
    margin-right: 5px;
    margin-left: -1px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.pentagon-himself {
    clip-path: polygon(50% 0%, 100% 35%, 85% 100%, 15% 100%, 0% 35%);
    width: 15px;
    height: 15px;
    background-color: #fff;
    margin-top: 0.5px;
}

.triangle-border {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    width: 20px;
    height: 20px;
    margin-left: -2px;
    margin-right: 7px;
    display: flex;
    margin-top: -3px;
    justify-content: center;
    align-items: center;
}

.triangle-himself {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    width: 12px;
    height: 14px;
    background-color: #fff;
    margin-top: 2px;
    /* margin-left: 0.5px; */
}

.selected-background {
    width: 280px;
    height: 40px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    position: absolute;
    top: 0;
    left: 0;
    transition: transform 0.3s ease;
    z-index: 1;
}

.legend-title {
    font-size: 13px;
    font-weight: 600;
}

.switch {
    width: 40px;
    height: 20px;
    margin: 0px !important;
    padding: 0px !important;
}

.legend-text {
    font-size: 12px;
    font-weight: 500;
    color: #14202c;
    margin: 0px !important;
}

.circle-indicators {
    position: absolute;
    top: 43px;
    /* Adjust based on your divider spacing */
    right: 10px;
    display: flex;
    gap: 5px;
    z-index: 3;
}

.indicator-circle {
    border-radius: 2px;
    width: 8px;
    height: 20px;
}
</style>
