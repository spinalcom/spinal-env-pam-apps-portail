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

<template>
  <div>
    <v-card elevation="4" class="cardContainer">
      <v-card
        class="d-flex flex-column justify-space-around align-center"
        style="
          position: absolute;
          left: -75px;
          width: 70px;
          height: 150px;
          z-index: 2;
        "
      >
        <v-switch dense v-model="sprites"></v-switch>
        <div style="display: flex; align-items: center">
          <div
            class="rounded mr-2"
            :style="{
              background: legend.min.color,
              width: '9px',
              height: '18px',
            }"
          ></div>
          <div style="font-size: 13px">{{ legend.min.value }}</div>
        </div>
        <div v-if="legend.median" style="display: flex; align-items: center">
          <div
            class="rounded mr-2"
            :style="{
              background: legend.median.color,
              width: '9px',
              height: '18px',
            }"
          ></div>
          <div style="font-size: 13px">{{ legend.median.value }}</div>
        </div>
        <div style="display: flex; align-items: center">
          <div
            class="rounded mr-2"
            :style="{
              background: legend.max.color,
              width: '9px',
              height: '18px',
            }"
          ></div>
          <div style="font-size: 13px">{{ legend.max.value }}</div>
        </div>
      </v-card>
      <button
        @click="
          () => {
            $emit('buttonClicked');
            resize();
          }
        "
        style="
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
          z-index: 2;
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
          z-index: 2;
        "
        :style="{ left: DActive ? '-35px' : '-20px' }"
      >
        <v-icon v-if="ActiveData">mdi-chevron-double-right</v-icon>
        <v-icon v-else-if="DActive">mdi-chevron-left</v-icon>
        <v-icon v-else>mdi-chevron-right</v-icon>
      </button>
      <div
        class="dataContainer"
        @onSpriteClick="updateSelected"
        v-show="ActiveData || !DActive"
      >
        <div class="detail_header">
          <div class="title_date">
            <div class="_title">{{ config.title }}</div>
            <div v-if="navigable">
              <v-btn elevation="0" fab small @click="t_index--">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              {{ displayDate }}
              <v-btn
                elevation="0"
                fab
                small
                :disabled="!t_index"
                @click="t_index++"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
            <div v-else>
              <v-progress-circular
                :rotate="-90"
                :size="40"
                :width="2"
                color="purple"
                :value="reload_countdown"
                @click="reload()"
              >
                <v-icon>mdi-reload</v-icon>
              </v-progress-circular>
            </div>
          </div>

          <v-row class="source_regroupement_select">
            <v-col>
              <v-autocomplete
                v-model="sourceSelectedName"
                item-text="name"
                outlined
                dense
                rounded
                flat
                :hide-details="true"
                :items="sources"
                label="Source"
              ></v-autocomplete>
            </v-col>

            <v-col>
              <v-autocomplete
                v-model="regroupementSelected"
                item-text="name"
                item-value="value"
                outlined
                dense
                rounded
                flat
                :hide-details="true"
                :items="regroupements"
                label="Regroupement"
              ></v-autocomplete>
            </v-col>
          </v-row>

          <div class="d-flex">
            <div class="gradient_content">
              <div class="indicators">
                <div class="indicator">{{ min }}</div>
                <div class="indicator">{{ max }}</div>
              </div>

              <div
                class="gradient_bar"
                :style="{ background: gradientColor }"
              ></div>
            </div>
            <v-btn icon @click="dialog = true"><v-icon>mdi-cog</v-icon></v-btn>
          </div>

          <div class="calcul_content">
            <div class="calcul">
              <div class="select">
                <v-select
                  v-model="calculMode"
                  :items="calculItems"
                  height="30"
                  background-color="#eaeef0"
                  dense
                  append-icon=""
                  solo
                  flat
                  :hide-details="true"
                >
                  <template v-slot:item="{ item, index }">
                    <div style="display: flex; align-items: center">
                      <div
                        class="color"
                        :style="{
                          background: '#14202c',
                          width: '8px',
                          height: '15px',
                          marginRight: '5px',
                        }"
                      ></div>
                      <div style="font-size: 13px">{{ item }}</div>
                    </div>
                  </template>

                  <template v-slot:selection="{ item, index }">
                    <div style="display: flex; align-items: center">
                      <div
                        class="color"
                        :style="{
                          height: '15px',
                          background: '#14202c',
                          borderRadius: '3px',
                        }"
                      ></div>
                      <div style="font-size: 13px">{{ item }}</div>
                    </div>
                  </template>
                </v-select>
              </div>

              <div class="calculResult">
                <div class="color" :style="{ background: toltalColor }"></div>
                <div class="value">{{ total | round }}</div>
                <div class="value">{{ unit }}</div>
                <div class="text">Pour l'étage {{ selectedZone.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected"
          class="detail_container"
        >
          <GroupDataView
            v-for="(d, i) in data"
            :key="i"
            :data="d"
            :config="config"
            :calculMode="calculMode"
            :unit="unit"
            :legend="legend"
            :percent="percent"
            @onClick="selectDataView"
          />
        </div>

        <div
          class="centered"
          v-else-if="pageSate === PAGE_STATES.loaded && isBuildingSelected"
        >
          <p>
            Aucune donnée à afficher ! veuillez selectionner un étage ou une
            pièce.
          </p>
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
      </div>
    </v-card>
    <v-dialog v-model="dialog" width="80%">
      <config-legend v-if="dialog" v-model="legend" @close="dialog = false">
      </config-legend>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import { PAGE_STATES } from "../../interfaces/pageStates";
import GroupDataView from "./groupDataView.vue";
import ConfigLegend from "./configLegend.vue";
import Component from "vue-class-component";
import {
  IConfig,
  calculTypes,
  ISource,
  IRegroupement,
  ITemporality,
} from "../../interfaces/IConfig";
import { ISpaceSelectorItem } from "global-components";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import {
  calculItemsValue,
  getColor,
  calculateTotal,
} from "../../services/calcul/calculItems";
import SpriteComponent from "./SpriteComponent.vue";
import ChartSpriteComponent from "./ChartSpriteComponent.vue";
import lodash from "lodash";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";
import moment from "moment";
import "moment/locale/fr";

moment.updateLocale("fr", {
  months: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
});

@Component({
  components: {
    GroupDataView,
    ConfigLegend,
  },
  filters: {
    round(value) {
      try {
        var num = Number(value);
        var rounded = num.toFixed(2);
        return Number(rounded);
      } catch (error) {
        console.error(error);
        return "-";
      }
    },
  },
})
class InsightApp extends Vue {
  // @State data!: any[];

  @Prop() config!: IConfig;
  @Prop() selectedZone: ISpaceSelectorItem;
  @Prop() selectedTime: ISpaceSelectorItem;
  @Prop() data: any[];
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;

  time: any = null;
  sprites: boolean = true;
  reload_countdown: number = 0;
  t_index: number = 0;
  sourceSelectedName: string = this.config.source[0].name;
  regroupementSelected: "floors" | "rooms" | IRegroupement =
    this.config.regroupement[0];
  legend: any = this.config.source[0].legend;
  dialog: boolean = false;
  reload = function () {};

  initiated: boolean = false;

  selectedItem: any = null;

  intervalId: any;

  regroupItemsAndCalculateDebounced: any = lodash.debounce(
    this.regroupItemsAndCalculate.bind(this),
    500
  );

  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  calculMode: calculTypes = this.calculItems[0];
  percent: boolean = false;
  total: number = 0;
  retry: Function;
  timeoutId: any;

  public get sourceSelected() {
    return this.config.source.find((el) => el.name === this.sourceSelectedName);
  }

  async mounted() {
    await this.retriveData();
  }

  get navigable() {
    return ![ITemporality.currentValue, ITemporality.custom].includes(
      this.selectedTime.name
    );
  }

  get displayDate() {
    const currentDay = moment();
    let end;
    switch (this.selectedTime.name) {
      case ITemporality.custom:
        return `${moment(this.selectedTime.range.begin).format(
          "DD/MM/YYYY HH:mm"
        )} - ${moment(this.selectedTime.range.end).format("DD/MM/YYYY HH:mm")}`;
      case ITemporality.hour:
        if (!this.t_index) return "Dernière heure";
        currentDay.add(this.t_index, "hours");
        end = moment(currentDay).add(1, "hours");
        return (
          currentDay.format("DD/MM/YY HH[h]") + " - " + end.format("HH[h]")
        );
      case ITemporality.day:
        if (!this.t_index) return "Aujourd'hui";
        currentDay.add(this.t_index, "days");
        return currentDay.format("DD/MM/YYYY");
      case ITemporality.week:
        if (!this.t_index) return "Cette semaine";
        currentDay.add(this.t_index, "week");
        end = moment(currentDay).endOf("week");
        return `${moment(end).add(-6, "days").format("DD MMMM")} - ${end.format(
          "DD MMMM"
        )}`;
      case ITemporality.month:
        if (!this.t_index) return "Ce mois";
        currentDay.add(this.t_index, "months");
        return currentDay.format("MMMM YYYY");
      case ITemporality.year:
        if (!this.t_index) return "Cette année";
        currentDay.add(this.t_index, "years");
        return currentDay.format("YYYY");
      default:
        return "";
    }
  }

  resize() {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 1);
  }

  getFirstSource() {
    return Array.isArray(this.config.source)
      ? this.config.source[0]
      : this.config.source;
  }

  getFirstRegroupement() {
    return Array.isArray(this.config.regroupement)
      ? this.config.regroupement[0]
      : this.config.regroupement;
  }

  async retriveData() {
    try {
      this.pageSate = PAGE_STATES.loading;
      const buildingId = localStorage.getItem("idBuilding");
      const promises = [
        this.$store.dispatch(ActionTypes.GET_GROUPS_ITEMS, {
          config: this.config,
          buildingId,
          forceUpdate: true,
        }),
      ];
      if (!["rooms", "equipments"].includes(this.regroupementSelected as any)) {
        promises.push(
          this.$store.dispatch(ActionTypes.GET_CATEGORIES_TREE, {
            buildingId,
            forceUpdate: true,
            context: (this.regroupementSelected as any).context,
          })
        );
      }

      await Promise.all(promises);
      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      console.error(err);
      this.retry = this.retriveData;
      this.pageSate = PAGE_STATES.error;
    }
  }

  async regroupItemsAndCalculate(forceUpdate: boolean = false) {
    try {
      const config_copy = {
        ...this.config,
        regroupement: this.regroupementSelected,
        source: this.sourceSelected,
      };

      const playload = {
        config: config_copy,
        item: this.selectedZone,
        forceUpdate,
      };

      this.pageSate = PAGE_STATES.loading;
      const regrouped = await this.$store.dispatch(
        ActionTypes.REGROUP_ITEMS,
        playload
      );
      const calculated = await calculItemsValue(
        regrouped,
        this.calculMode,
        this.time,
        this.legend.min.value,
        this.legend.max.value
      );

      this.$store.commit(MutationTypes.SET_DATA, calculated);

      this.pageSate = PAGE_STATES.loaded;
      this.reload_countdown = 0;
    } catch (error) {
      console.error(error);
      this.retry = this.regroupItemsAndCalculateDebounced;
      this.pageSate = PAGE_STATES.error;
    }
  }

  updateSelected(item) {
    this.selectedItem = item.detail || item;
  }

  async updateDataOnTimeChanged() {
    const end = moment().minutes(59).seconds(59);
    switch (this.selectedTime.name) {
      case ITemporality.currentValue:
        this.time = null;
        break;
      case ITemporality.hour:
        end.add(this.t_index, "hours");
        this.time = {
          begin: moment(end).startOf("hour").format("DD-MM-YYYY HH:mm:ss"),
          end: end.format("DD-MM-YYYY HH:mm:ss"),
        };
        break;
      case ITemporality.day:
        end.endOf("day").add(this.t_index, "days");
        this.time = {
          begin: moment(end).startOf("day").format("DD-MM-YYYY HH:mm:ss"),
          end: end.format("DD-MM-YYYY HH:mm:ss"),
        };
        break;
      case ITemporality.week:
        end.endOf("week").add(this.t_index, "weeks");
        this.time = {
          begin: moment(end).startOf("week").format("DD-MM-YYYY HH:mm:ss"),
          end: end.format("DD-MM-YYYY HH:mm:ss"),
        };
        break;
      case ITemporality.month:
        end.endOf("month").add(this.t_index, "months");
        this.time = {
          begin: moment(end).startOf("month").format("DD-MM-YYYY HH:mm:ss"),
          end: end.format("DD-MM-YYYY HH:mm:ss"),
        };
        break;
      case ITemporality.year:
        end.endOf("year").add(this.t_index, "years");
        this.time = {
          begin: moment(end).startOf("year").format("DD-MM-YYYY HH:mm:ss"),
          end: end.format("DD-MM-YYYY HH:mm:ss"),
        };
        break;
      case ITemporality.custom:
        this.time = this.selectedTime.range;
        break;
      default:
        this.time = null;
        break;
    }
    await this.regroupItemsAndCalculate();
    await this.updateSprites();
  }

  async updateSprites() {
    const buildingId = localStorage.getItem("idBuilding");
    const itemsToColor = this.data.flatMap((el) => el.children || []);
    itemsToColor.forEach((el) => {
      el.unit = this.sourceSelected.unit;
      el.navIndex = this.t_index;
    });

    if (this.sprites) {
      await this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);

      await this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
        items: itemsToColor,
        buildingId,
        component: SpriteComponent,
      });
      if (!this.selectedItem) return;
      const emitterHandler = EmitterViewerHandler.getInstance();
      emitterHandler.emit(VIEWER_SPRITE_CLICK, { node: this.selectedItem });
      const selectedIds = this.selectedItem.children?.map(
        (el) => el.dynamicId
      ) || [this.selectedItem.dynamicId];
      setTimeout(() => {
        this.$store.dispatch(ActionTypes.SELECT_SPRITES, selectedIds);
      }, 500);
      this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
        items: itemsToColor.map((el) => ({ ...el, color: null })),
        buildingId,
      });
    } else {
      this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
        items: itemsToColor,
        buildingId,
      });
    }
  }

  updateChartSprite() {
    if (!this.sprites) this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    if (
      !this.selectedItem ||
      this.sprites ||
      this.selectedTime.name === ITemporality.currentValue
    )
      return;
    this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
      items: [{ ...this.selectedItem, navIndex: this.t_index }],
      buildingId: localStorage.getItem("idBuilding"),
      component: ChartSpriteComponent,
    });
  }

  selectDataView(item) {
    console.log(item, "etape 1");
    this.updateSelected(item);
    this.$store.dispatch(ActionTypes.SELECT_ITEMS, item.children || item);
    this.$emit("clickOnDataView", item);
  }

  /**
   * Watchers
   */

  @Watch("pageSate")
  watchPageState(state) {
    if (state === PAGE_STATES.error) {
      clearInterval(this.intervalId);
      this.reload_countdown = 0;
    }
  }

  // watch sprites
  @Watch("sprites")
  watchSprites() {
    this.updateSprites();
    this.updateChartSprite();
  }

  @Watch("selectedZone")
  watchSelectedZone() {
    if (this.selectedZone.type === "building") {
      this.isBuildingSelected = true;
      this.$store.commit(MutationTypes.SET_DATA, []);
      this.reload = function () {};
      return;
    }
    this.initiated = false;
    this.isBuildingSelected = false;
    this.reload = this.updateDataOnTimeChanged;
    if (this.selectedTime.name === ITemporality.currentValue) {
      this.intervalId = setInterval(() => {
        this.reload_countdown += 1 / 6;
      }, 100);
    } else {
      clearInterval(this.intervalId);
    }

    this.updateDataOnTimeChanged();
  }

  // waych selectedItem
  @Watch("selectedItem")
  watchSelectedItem() {
    this.updateChartSprite();
  }

  @Watch("reload_countdown")
  watchReloadCountdown() {
    if (this.reload_countdown > 100) this.reload();
  }

  @Watch("calculMode")
  async watchCaculMode(mode) {
    this.percent = mode === calculTypes.MoyennePercent;
    if (this.isBuildingSelected) return;

    const calculated = await calculItemsValue(
      this.data,
      this.calculMode,
      this.time,
      this.legend.min.value,
      this.legend.max.value
    );

    this.$store.commit(MutationTypes.SET_DATA, calculated);

    await this.updateSprites();
  }

  @Watch("data")
  watchData() {
    if (this.isBuildingSelected) return;

    const values = this.data.map((el) => el.displayValue);
    this.total = calculateTotal(values, this.calculMode);

    if (!this.initiated) {
      this.updateSprites();
      this.initiated = true;
    }
  }

  @Watch("sourceSelectedName")
  async watchSource(newVal) {
    if (!newVal) return;
    this.legend = this.config.source.find((el) => el.name === newVal).legend;

    if (this.isBuildingSelected) return;

    await this.regroupItemsAndCalculate(true);
    await this.updateSprites();
    this.updateChartSprite();
  }

  @Watch("regroupementSelected")
  watchRegroupement() {
    if (this.isBuildingSelected) return;
    this.regroupItemsAndCalculateDebounced();
    this.updateChartSprite();
  }

  @Watch("selectedTime")
  async watchSelectedTime(newVal) {
    if (this.isBuildingSelected) return;
    if (!this.t_index) await this.updateDataOnTimeChanged();
    else this.t_index = 0;
    if (newVal.name === ITemporality.currentValue) {
      this.intervalId = setInterval(() => {
        this.reload_countdown += 1 / 6;
      }, 100);
    } else {
      clearInterval(this.intervalId);
    }
    this.updateChartSprite();
  }

  @Watch("t_index")
  async watchTIndex() {
    if (this.isBuildingSelected) return;
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(async () => {
      await this.updateDataOnTimeChanged();
      this.updateChartSprite();
    }, 500);
  }

  @Watch("legend")
  async watchLegend() {
    if (this.isBuildingSelected) return;
    await this.updateSprites();
  }

  /**
   * Getters
   */

  public get gradientColor(): string {
    const maxColor = this.legend.max.color;
    const minColor = this.legend.min.color;
    const medianColor = this.legend.median?.color;

    if (!medianColor) {
      return `linear-gradient(to right, ${minColor},  ${maxColor})`;
    }

    return `linear-gradient(to right, ${minColor} 25%, ${medianColor} 50%, ${maxColor} 75%)`;
  }

  public get min(): number {
    return this.legend.min.value;
  }

  public get max(): number {
    return this.legend.max.value;
  }

  public get calculItems() {
    return this.config.calculs || [];
  }

  public get unit() {
    return this.config.source?.unit || "";
  }

  public get toltalColor() {
    return getColor({ displayValue: this.total }, this.legend, this.percent);
  }

  public get sources(): ISource[] {
    if (this.config && this.config.source)
      return Array.isArray(this.config.source)
        ? this.config.source
        : [this.config.source];
    return [];
  }

  public get regroupements(): {
    name: string;
    value: "floors" | "rooms" | IRegroupement;
  }[] {
    if (this.config && this.config.regroupement) {
      const arr = Array.isArray(this.config.regroupement)
        ? this.config.regroupement
        : [this.config.regroupement];

      return arr.map((el: any) => {
        return {
          name: el.category || el.context || el,
          value: el,
        };
      });
    }
    return [];
  }
}

export { InsightApp };
export default InsightApp;
</script>
<style lang="scss">
.cardContainer {
  width: 100%;
  height: 100%;

  $titleDateHeight: 40px;
  $gradientContentHeight: 40px;
  $calculContentHeight: 50px;
  $selectionHeight: 60px;

  .dataContainer {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    padding: 10px;

    .detail_header {
      width: 100%;
      height: #{$titleDateHeight + $gradientContentHeight + $calculContentHeight +
        $selectionHeight};
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .title_date {
        width: 100%;
        height: $titleDateHeight;
        display: flex;
        align-items: center;
        justify-content: space-between;

        ._title {
          max-width: 50%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
          font-size: 0.8em;
        }
      }

      .source_regroupement_select {
        /*width: 100%;*/
        height: $selectionHeight;
        display: flex;
        align-items: center;
      }

      .gradient_content {
        width: 100%;
        height: $gradientContentHeight;

        .gradient_bar {
          width: 100%;
          height: 15px;
          border-radius: 5px;
        }

        .indicators {
          width: 100%;
          height: 15px;
          font-size: 11px;
          display: flex;
          justify-content: space-between;
        }
      }

      .calcul_content {
        width: 100%;
        height: $calculContentHeight;

        .calcul {
          width: 100%;
          height: 30px;
          display: flex;

          .select {
            width: 35%;
            min-height: unset;
            margin-right: 50px;
          }

          .calculResult {
            display: flex;
            align-items: center;
            font-size: 13px;

            .value {
              margin-right: 1px;
              font-weight: 900;
            }

            .text {
              margin-left: 2px;
            }
          }
        }

        .color {
          width: 8px;
          height: 15px;
          margin-right: 5px;
          border-radius: 3px;
        }
      }
    }

    .detail_container {
      width: 100%;
      height: calc(
        100% - #{$titleDateHeight + $gradientContentHeight +
          $calculContentHeight + $selectionHeight}
      );
      overflow: auto;
      scroll-behavior: smooth;
    }
  }

  .centered {
    width: 100%;
    height: calc(100% - 190px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
}
</style>
