<!-- 
Copyright 2023 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->
<!-- Ala -->
<template>
  <v-card elevation="4" class="cardContainer">
    <div
      class="dataContainer"
      v-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected"
    >
      <button
        @click="
          () => {
            $emit('buttonClicked');
            resize();
          }
        "
        style="
          z-index: 10;
          position: absolute;
          top: 47.5%;
          left: -20px;
          background-color: white;
          border-radius: 10px;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-right: 5px;
          border-left: 2px solid gainsboro;
        "
        :style="{ left: DActive ? '-35px' : '-20px' }"
      >
        <v-icon v-if="DActive"> mdi-chevron-double-left </v-icon>
        <v-icon v-else-if="ActiveData">mdi-chevron-right</v-icon>
        <v-icon v-else>mdi-chevron-left</v-icon>
      </button>
      <button
        @click="
          () => {
            $emit('buttonClicked3D');
            resize();
          }
        "
        style="
          z-index: 10;
          position: absolute;
          top: 52.5%;
          background-color: white;
          border-radius: 10px;
          width: 30px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-right: 5px;
          border-left: 2px solid gainsboro;
        "
        :style="{ left: DActive ? '-35px' : '-20px' }"
      >
        <v-icon v-if="ActiveData">mdi-chevron-double-right</v-icon>
        <v-icon v-else-if="DActive">mdi-chevron-left</v-icon>
        <v-icon v-else>mdi-chevron-right</v-icon>
      </button>
      <div class="detail_header">
        <div class="title_date">
          <div class="date" title="recharger"></div>
        </div>
      </div>
      <!-- <button
        @click="
          () => {
            $emit('changeRoute', tickets);
          }
        "
        style="border: 1px solid black; padding: 5px"
      >
        go to tickets apps
      </button>
      <button
        @click="
          () => {
            $emit('changeRoute', insights);
          }
        "
        style="border: 1px solid black; padding: 5px"
      >
        go to insights apps
      </button> -->
      <div
        :style="{
          'overflow-y': 'hidden',
          height: 'calc(100% )',
        }"
        class="data-container"
      >
        <div>
          <NodeItem :data="data" :DActive="DActive" :ActiveData="ActiveData" />
        </div>
      </div>
    </div>

    <div
      class="centered"
      v-else-if="pageSate === PAGE_STATES.loaded && isBuildingSelected"
    >
      Aucune donnée à afficher ! veuillez selectionner un étage ou une pièce.
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.loading">
      <v-progress-circular
        :size="70"
        :width="3"
        color="purple"
        indeterminate
      ></v-progress-circular>
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.error">
      <div>
        <v-icon color="red" style="font-size: 5em"
          >mdi-alert-circle-outline</v-icon
        >
      </div>
      <div color="red">
        Quelque chose s'est mal passé ! Veuillez
        <v-btn small outlined color="red" @click="retry">réessayer </v-btn>
      </div>
    </div>
  </v-card>
</template>
  
  <script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import { PAGE_STATES } from "../../interfaces/pageStates";
import Component from "vue-class-component";
import { IConfig } from "../../interfaces/IConfig";
import { ISpaceSelectorItem } from "global-components";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import lodash from "lodash";
import { State } from "vuex-class";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { mapState } from "vuex";
import SpriteComponent from "./SpriteComponent.vue";
import NodeItem from "./NodeItem.vue";
import Filtre from "./Filtres.vue";
import SpriteComponentLuminaire from "./SpriteComponentLuminaire.vue";
import { warn } from "console";

@Component({
  components: { NodeItem, Filtre },
  filters: {},
})
class dataSideApp extends Vue {
  // @State data!: any[];

  @Prop() config!: IConfig;
  @Prop() selectedZone: ISpaceSelectorItem;
  @Prop() data: any[];
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;
  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  insights =
    "eyJuYW1lIjoiSW5zaWdodHMiLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImIwZTEtNzI3NS02YWNhLTE4ZjJlMjE1NmE4IiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxNDQ2NTk0NzM4MCwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE0NDY1ODg3OTEyLCJpY29uIjoibWRpLWN1cnRhaW5zLWNsb3NlZCIsImRlc2NyaXB0aW9uIjoiSU5zaWdodHMiLCJ0YWdzIjpbIkluc2lnaHRzIl0sImNhdGVnb3J5TmFtZSI6IiIsImdyb3VwTmFtZSI6IiIsImhhc1ZpZXdlciI6ZmFsc2UsInBhY2thZ2VOYW1lIjoic3BpbmFsLWVudi1wYW0taW5zaWdodHMiLCJpc0V4dGVybmFsQXBwIjpmYWxzZSwibGluayI6IiIsInJlZmVyZW5jZXMiOnt9LCJwYXJlbnQiOnsicG9ydG9mb2xpb0lkIjoiMzdkZS0wMmI4LWUxOGItMTg1MDY0M2I2OGEiLCJidWlsZGluZ0lkIjoiNTkzMi02MDg2LTllMWEtMTg1MDY0Nzg0NjAifX0";
  // tickets =
  //   "eyJuYW1lIjoiVGlja2V0IiwidHlwZSI6IkJ1aWxkaW5nQXBwIiwiaWQiOiJmNmE5LWQ3YmMtNTViMC0xOGYxMDBmYmViOCIsImRpcmVjdE1vZGlmaWNhdGlvbkRhdGUiOjE3MTM5NjE0NDQzMjQsImluZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxMzk2MTQxODQyNCwiaWNvbiI6Im1kaS1hYmFjdXMiLCJkZXNjcmlwdGlvbiI6IiIsInRhZ3MiOltdLCJjYXRlZ29yeU5hbWUiOiIiLCJncm91cE5hbWUiOiIiLCJoYXNWaWV3ZXIiOmZhbHNlLCJwYWNrYWdlTmFtZSI6Im1pY3JvLWFwcHMtc3BpbmFsLWVudi1wYW0tdGlja2V0cyIsImlzRXh0ZXJuYWxBcHAiOmZhbHNlLCJsaW5rIjoiIiwicmVmZXJlbmNlcyI6e30sInBhcmVudCI6eyJwb3J0b2ZvbGlvSWQiOiIzN2RlLTAyYjgtZTE4Yi0xODUwNjQzYjY4YSIsImJ1aWxkaW5nSWQiOiI1OTMyLTYwODYtOWUxYS0xODUwNjQ3ODQ2MCJ9fQ";

  selectedNodeIndex: number | null = null;

  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 1);
  }
  async mounted() {
    this.pageSate = PAGE_STATES.loaded;
    this.isBuildingSelected = true;
  }

  equipementsXYZ: {
    dynamicId: number;
    X: number;
    Y: number;
    Z: number;
    parent?: number;
  }[] = [];
  contextType: "networkTreeContext";
  selectedSprites = [];

  async retriveData() {
    try {
      this.pageSate = PAGE_STATES.loading;
      const buildingId = localStorage.getItem("idBuilding");
      const patrimoineString = localStorage.getItem("patrimoine");

      const patrimoineId = patrimoineString
        ? JSON.parse(patrimoineString).id
        : null;

      const contextpromises = [
        this.$store.dispatch(ActionTypes.GET_CONTEXT, {
          buildingId,
          patrimoineId,
        }),
      ];
      const ctxresult = await Promise.all(contextpromises);
      const filteredCtx = ctxresult
        .flat()
        .filter((item) => item.type === "networkTreeContext");
      let contextId = filteredCtx[0].dynamicId;
      const floorpromises = [
        this.$store.dispatch(ActionTypes.GET_CHILDREN, {
          buildingId,
          patrimoineId,
          nodeId: contextId,
        }),
      ];
      let floorresult = await Promise.all(floorpromises);
      floorresult = floorresult.flat();
      console.log("floorresult", floorresult[0]);
      let nodeId = floorresult[0].dynamicId;
      let relation = "hasNetworkTreeBimObject";

      const automates = [
        this.$store.dispatch(ActionTypes.GET_CHILDREN_BY_RELATION, {
          buildingId,
          patrimoineId,
          nodeId: nodeId,
          relation: relation,
        }),
      ];
      let childrenbyrelation = await Promise.all(automates);
      childrenbyrelation = childrenbyrelation.flat();
      console.log("childrenbyrelation", childrenbyrelation);

      let childrenIds = childrenbyrelation.map((r) => r.dynamicId);
      childrenIds = childrenIds.flat();

      let parentsIds = childrenbyrelation.map((r) => r.dynamicId);
      parentsIds = parentsIds.flat();

      let relations: { dynamicId: number; relation: any }[];
      relations = childrenIds.map((r) => {
        return { dynamicId: r, relation: ["hasNetworkTreeBimObject"] };
      });
      // console.warn("relations", relations);

      const luminaireChildren = [
        this.$store.dispatch(ActionTypes.GET_CHILDREN_BY_RELATION_MULTIPLE, {
          buildingId,
          patrimoineId,
          relations: relations,
        }),
      ];
      console.log("luminaireChildren", luminaireChildren);
      console.log("buildingId", buildingId);
      console.log("floorId");
      let luminairechildrenbyrelation = await Promise.all(luminaireChildren);
      luminairechildrenbyrelation = luminairechildrenbyrelation.flat();
      luminairechildrenbyrelation.forEach((item) => {
        item.nodes = item.nodes.filter((node) => node.type === "BIMObject");
      });
      // console.log("luminaire", luminairechildrenbyrelation);

      childrenIds = [];
      luminairechildrenbyrelation.forEach((lum) => {
        childrenIds = this.collectDynamicIds(lum.nodes, childrenIds);
      });

      //Get the name of the parent items
      const childrenMap = new Map(
        childrenbyrelation.map((child) => [child.dynamicId, child])
      );
      luminairechildrenbyrelation.forEach((luminaire) => {
        const matchingChild = childrenMap.get(luminaire.dynamicId);
        if (matchingChild) {
          luminaire.name = matchingChild.name;
          luminaire.staticId = matchingChild.staticId;
          luminaire.type = matchingChild.type;
        }
        // const statuses = ["active", "inactive"];
        // const randomIndex = Math.floor(Math.random() * statuses.length);
        // luminaire.status = statuses[randomIndex];
      });

      console.log("luminaire list:", luminairechildrenbyrelation);

      luminairechildrenbyrelation.forEach((luminaire) =>
        this.updateStatus(luminaire)
      );

      // Now each luminaire object and its children have updated status attributes
      console.log("Updated luminaire list:", luminairechildrenbyrelation);
      // let nextIds = luminairechildrenbyrelation.map((r) =>
      //   r.nodes.map((e) => e.dynamicId)
      // );
      // nextIds = nextIds.flat();
      // console.warn("childrenIds", childrenIds);
      // console.warn("nextIds", nextIds);
      childrenIds = [...parentsIds, ...childrenIds];
      const attributes = [
        this.$store.dispatch(ActionTypes.GET_ATTRIBUTE_LIST_MULTIPLE, {
          buildingId,
          dynamicIds: childrenIds,
        }),
      ];
      const attributes_result = await Promise.all(attributes);

      this.equipementsXYZ = attributes_result[0].map((r) => {
        const { dynamicId, categoryAttributes } = r;
        let X, Y, Z;
        categoryAttributes.forEach((attribute) => {
          if (attribute.name === "Spatial") {
            const [x, y, z] = attribute.attributs[0].value.split(";");
            X = parseFloat(x);
            Y = parseFloat(y);
            Z = parseFloat(z);
          }
        });

        return {
          dynamicId,
          X,
          Y,
          Z,
        };
      });

      const addParentToNodes = (nodes: any[], parentId?: number) => {
        nodes.forEach((node) => {
          // Find the corresponding item in equipementsXYZ
          const equipItem = this.equipementsXYZ.find(
            (equip) => equip.dynamicId === node.dynamicId
          );
          if (equipItem) {
            equipItem.parent = parentId;
          }

          // Recursively process child nodes if any
          if (node.nodes && node.nodes.length > 0) {
            addParentToNodes(node.nodes, node.dynamicId);
          }
        });
      };
      luminairechildrenbyrelation.forEach((item) => {
        addParentToNodes([item]);
      });
      // console.log("Updated equipementsXYZ:", this.equipementsXYZ);

      this.$store.commit(MutationTypes.SET_DATA, luminairechildrenbyrelation);
      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.log(err);
      this.retry = this.retriveData;
      this.pageSate = PAGE_STATES.error;
    }
  }
  collectDynamicIds(nodes, collectedIds: number[]) {
    nodes.forEach((node) => {
      if (node.dynamicId !== undefined) {
        collectedIds.push(node.dynamicId);
      }
      if (Array.isArray(node.nodes) && node.nodes.length > 0) {
        this.collectDynamicIds(node.nodes, collectedIds);
      }
    });

    return collectedIds;
  }
  getDropdownItems(items) {
    console.log("inside drop down function");
    return items.map((item) => ({
      text: item.dynamicId,
      value: item.dynamicId,
    }));
  }
  updateStatus(node) {
    if (node.nodes && node.nodes.length > 0) {
      // Recursively update children first
      node.nodes.forEach((child) => this.updateStatus(child));

      const statuses = [
        "active",
        "active",
        "active",
        "active",
        "unknown",
        "inactive",
      ];
      const randomIndex = Math.floor(Math.random() * statuses.length);
      node.self_status = statuses[randomIndex];
      // Determine parent's status based on children's status
      const childrenStatus = node.nodes.map((child) => child.status);
      const hasInactiveChild = childrenStatus.includes("inactive");
      const hasUnkownChild = childrenStatus.includes("unknown");
      const selfStatus =
        node.status === "active" && !hasInactiveChild ? "active" : "inactive";
      if (node.self_status == "inactive" || hasInactiveChild) {
        node.status = "inactive";
      } else if (node.self_status == "unknown" || hasUnkownChild) {
        node.status = "unknown";
      } else {
        node.status = "active";
      }

      // // Update children's self_status
      // node.nodes.forEach((child) => {
      //   child.self_status = selfStatus;
      // });
    } else {
      const statuses = [
        "active",
        "active",
        "active",
        "active",
        "unknown",
        "inactive",
      ];
      const randomIndex = Math.floor(Math.random() * statuses.length);
      node.self_status = statuses[randomIndex];
      node.status = node.self_status;
    }
  }

  updateSelectedSprites(sprites, number) {
    // Find the index of the number in the list
    const index = sprites.indexOf(number);

    // Check if the number is in the list
    if (index === -1) {
      // Number not in the list, add it
      sprites.push(number);
      console.log(`${number} added to the list.`);
    } else {
      // Number is in the list, remove it
      sprites.splice(index, 1);
      console.log(`${number} removed from the list.`);
    }
  }

  selectDataView(item) {
    this.$emit("clickOnDataView", item);
  }

  /**
   * Watch
   */

  @Watch("selectedZone")
  watchSelectedZone() {
    if (this.selectedZone.type === "building") {
      this.isBuildingSelected = true;
      return;
    }

    this.isBuildingSelected = false;
    this.retriveData();
  }

  @Watch("data")
  watchData() {
    if (this.config.sprites)
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    if (this.isBuildingSelected) return;
    const items = new Array();
    console.log("this data", this.data);
    // const microControllers = automates;
    for (const key of Object.keys(this.equipementsXYZ)) {
      items.push({
        dynamicId: this.equipementsXYZ[key].dynamicId,
        buildingId: localStorage.getItem("idBuilding"),
        data: this.equipementsXYZ[key],
        parent: this.equipementsXYZ[key].parent,
        position: new THREE.Vector3(
          this.equipementsXYZ[key].X,
          this.equipementsXYZ[key].Y,
          this.equipementsXYZ[key].Z
        ),
      });
    }
    // const automates = items.slice(0, 6);
    // const luminaires = items.slice(6);

    this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
      items: items.flat(),
      buildingId: localStorage.getItem("idBuilding"),
      component: SpriteComponent,
    });
    // this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
    //   items: luminaires.flat(),
    //   buildingId: localStorage.getItem("idBuilding"),
    //   component: SpriteComponentLuminaire,
    // });

    return;
    // }
    const buildingId = localStorage.getItem("idBuilding");
    this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
      items: [],
      buildingId: buildingId || this.selectedZone.staticId,
    });
  }
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export { dataSideApp };
export default dataSideApp;
</script>
  <style lang="scss">
.dataContainer {
  // display: flex;
  height: 100%;
  width: 100%;
  // background: orange;
  font-family: Charlevoix Pro !important;
  // font-size: 13px;
}
.data-container {
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
  height: 100%;
  padding: 10px 20px;

  // background: #00a2ff;
}
.graph-inspector {
  margin-top: 25px;
  width: 100%;
  height: 300px;
  background: #222222;
}
</style>