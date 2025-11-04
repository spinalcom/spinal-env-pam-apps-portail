<template>
    <div class="list_container">
        <div class="mapContainer">
            <!-- <Map :buildings="buildings" /> -->
            <map-bats @clickedVignette="clickedVignette" ref="mapBats" :buildings="buildings"
                @openBosConfig="openBosConfig" @closedPopup="closedPopup" :infobuilding="informationBuilding"
                :center="[2.4, 46.6]" :zoom="2"
                :style-url="'https://api.maptiler.com/maps/basic-v2/style.json?key=uVQyEUqWhEnCvtHBaPOK'" />
        </div>

        <div class="listContainer">
            <BuildingListView :dataCP="controlPointsByBuilding" @selectedCP="selectedCP" :tabInfo="itemsCP"
                @elementClique="onBuildingClicked" :buildings="buildings" :buildingSelected="buildingSelected" />

        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

import { Component, Prop, Watch } from "vue-property-decorator";
import Map from "./map/MapView.vue";
import MapBats from "./map/MapBats.vue";
import BuildingListView from "./portofolio/BuildingListView.vue";
import { getBuildingDynamicId, getBuildingControlEndpointsList } from "../requests/building";

@Component({
    components: {
        Map,
        BuildingListView,
        MapBats
    },
})
class PortofolioView extends Vue {
    @Prop({ default: () => null }) portofolioSelected!: any;


    buildingReads: any[] = []
    informationBuilding: any = null;
    itemsCP: any = [];
    buildingSelected: String | null = null;


    controlPointsByBuilding: any = [];
    allControlPointsFlat: any = [];

    get buildings() {
        return this.portofolioSelected?.buildings?.map(el => {
            return {
                ...el,
                color: this._getRandomColor()
            }
        }) || [];
    }


    async fetchAllBuildingsInfo() {
        // const { itemCPName, controlPointsByBuilding } = await this._getBuildingsControlEndpointsList("KPI USI");
        const { itemCPName, controlPointsByBuilding } = await this._getBuildingsControlEndpointsList();

        this.itemsCP = itemCPName;
        this.controlPointsByBuilding = controlPointsByBuilding;
    }

    async openBosConfig(buildingInfo) {
        this.$emit('openBosConfig', { buildingId: buildingInfo.id });
    }

    async onBuildingClicked(building) {
        (this.$refs as any).mapBats?.focusOn(building, { zoom: 14 })
        this.buildingSelected = building.id;
        this.informationBuilding = await this._fetchBuildingReads(building);
    }

    selectedCP(item) {
    }

    async clickedVignette(item) {
        this.buildingSelected = item.id;
        this.informationBuilding = await this._fetchBuildingReads(item);
    }

    closedPopup() {
        this.buildingSelected = null;
        this.informationBuilding = null;
    }

    @Watch('portofolioSelected.buildings', { immediate: true, deep: true })
    onBuildingsChanged(newBuildings: any[]) {
        this.fetchAllBuildingsInfo();
    }


    _fetchBuildingReads(building) {
        const buildingInfo = this.controlPointsByBuilding.find(b => b.buildingId === building.id);
        if (!buildingInfo) return;

        return {
            ...buildingInfo.profile
        }
    }

    _getBuildingsDynamicIds() {
        const promises = this.buildings.map(building => getBuildingDynamicId(building.id));
        return Promise.all(promises).then((result) => {
            return result.filter(dynamicId => !!dynamicId);
        })
    }

    async _getBuildingsControlEndpointsList() {
        const buildings = await this._getBuildingsDynamicIds();
        const promises = buildings.map(building => getBuildingControlEndpointsList(building));
        return Promise.all(promises).then((result) => {
            return result.reduce((obj: any, item) => {
                if (item) {
                    obj.controlPointsByBuilding.push(item);
                    obj.itemCPName.push(...item.controlPoints.map(cp => cp.name));
                }

                return obj;
            }, { itemCPName: [], controlPointsByBuilding: [] });
        })
    }


    _getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}

export default PortofolioView;
</script>


<style scoped lang="scss">
.list_container {
    width: 100%;
    display: flex;
    height: 100%;
    flex-direction: row;

    .mapContainer {
        // height: 100%;
        padding: 0px !important;
        overflow: hidden;
        flex: 0 0 50%;
    }

    .listContainer {
        // height: 100%;
        padding: 0px !important;
        overflow: hidden;
        flex: 0 0 50%;
        height: 100%;
    }
}
</style>