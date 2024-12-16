<template>
  <div
    class="main-tab"
    style="
      width: 100%;
      font-size: 14px !important;
      background-color: rgb(255, 255, 255);
      border-radius: 10px !important;
      border-color: black !important;
    "
  >
    <!-- BREADCRUMBS -->
    <SpinalbreadCrumb
      @itemSelected="emitValue($event.listType, $event.value)"
      :ctx_list="ctx_list"
      :cat_list="cat_list"
      :grp_list="grp_list"
      :selected_item="selected_data_item_name"
    ></SpinalbreadCrumb>

    
    <!-- Vselect + t_index selector -->
    <div>
      <div class="title">
        <div class="button" style="">
          <v-select
            v-model="vSelectedTab"
            :items="vSelectTabs"
            label="Select"
          ></v-select>
        </div>

        <div
          v-if="ActiveData && labelsChart && [ 'Indicateur', 'Points de mesures'].includes(vSelectedTab)"
          style="
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
            margin-left: 15px;
            margin-right: 15px;
          "
        >
          <v-btn
            style="margin: 10px"
            elevation="0"
            fab
            small
            @click="t_index--"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <div style="white-space: nowrap">{{ timeactuelle }}</div>
          <v-btn
            style="margin: 10px"
            elevation="0"
            fab
            small
            @click="t_index++"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- LE TREEVIEW -->
    <!-- <div title="Sélection de la catégory d'attribut / attribut" style="width: 70%; display: flex; margin-top: 10px; position: relative;">
      <div
        style="margin-left: 2px; z-index: 10; position: absolute; width: calc(100% - 70px - 10px); border-radius: 5px; background-color: rgb(255, 255, 255);">
        <div class="mouse" @click="showattribut = !showattribut" style="">
          <v-icon v-if="!showattribut" color="black" style="font-size: 2em">mdi-chevron-down</v-icon>
          <v-icon v-else color="black" style="font-size: 2em">mdi-chevron-up</v-icon>
          <div v-if="!keyselected[0]">Selectionner des données à ajouter au tableau.</div>
          <div style="padding-top: 5px;">
            <v-chip style="margin: 2px " v-for="(element, index) in keyselected" :key="index" :class="{
      'blue-background': element.parentName === element.childName,
      'red-background': element.parentName !== element.childName
    }">
              {{ element.childName }}
              <div
                style="top: -5px;right:-5px;position: absolute;background-color: white;border-radius: 20px;height: 15px;width: 15px;display: flex;justify-content: center;align-items: center;border: 1px solid #14202c; color: #14202c;">
                <v-icon style="margin-top: 1px;" size="13px"
                  @click.stop="deleteAttrSelected(element)">mdi-close</v-icon>
              </div>
            </v-chip>
          </div>
        </div>

        <div>
          <v-treeview class="my-custom-treeview animate" v-if="showattribut"
            style="width: 100%;padding-left: 20px;user-select: none;" v-model="selectedKeys" selectable
            item-disabled="locked" :items="treeviewItems"></v-treeview>
        </div>
      </div>
      <div @click.stop="importAttr = !importAttr"
        style="cursor: pointer;  position: absolute; right: 0;  border-radius: 5px;  margin-left: 10px;">
        <v-icon title="import" color="black"
          style="font-size: 2em;border: 1px solid black;border-radius: 5px;padding: 10px;">mdi-file-upload</v-icon>
      </div>
    </div> -->

    <!-- LE DATA TABLE -->
    <!-- items = filtred items / headers = headers / contexts = global items / selection = items du select / -->

    
    <div v-if="vSelectedTab === 'Equipements'"
      style="padding: 2px;"
      class="scrollable-table-container"
    >
      <DataTable
        :selectedItemTab="selectedItemTab"
        :height="'74vh'"
        :items="filteredContextsV"
        :headers="dynamicHeaders()"
        :contexts="contexts"
        :selections="selections"
        @item-selected="selectDataView($event)"
        @unselect-data-view="unselectDataView($event)"
        @fit-to-view="fitToView($event)"
        @filter="filtercolumn($event)"
      />
    </div>
    <!-- ONGLET attribut (attribut)-->
    <div v-if="vSelectedTab == 'Attributs'" class="scrollable-content"  >
      <h3>Attribut de la selection</h3>

      <div
        v-for="(item, index) in vSelectItemAttributes"
        class="blocInformation"
      >
        <span
          style="
            font-size: 19px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: bold;
          "
          >{{ item.name }}</span
        >
        <div
          v-if="vSelectItemAttributes == null"
          style="
            justify-content: center;
            align-items: center;
            width: 100%;
            display: flex;
            margin-top: 10px;
            margin-bottom: 10px;
          "
        >
          <v-progress-circular
            :size="50"
            color="primary"
            indeterminate
          ></v-progress-circular>
        </div>
        <div v-else class="inventory-container">
          <div
            class="inventory-item"
            style="
              color: #14202c;
              padding: 16px;
              border-radius: 5px;
              padding-left: 6px;
              background-color: #f9f9f9;
              box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
                rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
            "
            v-for="(attr, index2) in item.attributs"
          >
            <li> {{ attr.label }}: {{ attr.value }} </li>
          </div>
        </div>
      </div>
    </div>

    <!-- ONGLET Documentation -->
    <div v-if="vSelectedTab == 'Documentation'" class="scrollable-content">

      <v-row style="padding: 20px;">
        <AddBtn @open-dialog="ShowFormDoc" />
      </v-row>
      <div v-if="vSelectItemDocumentation && vSelectItemDocumentation.length > 0">
        <div class="blocInformation">
          <div
            v-for="(item, index) in vSelectItemDocumentation"
            :key="index"
            :class="['inventory-item', { 'inventory-item-image': item.fileUrl }]"
          >
            <li>{{ item.Name }}</li>
            <!-- Display the image if fileUrl exists -->
            <img
              v-if="item.fileUrl"
              :src="item.fileUrl"
              alt="Preview"
              class="item-preview-image"
            />
            <v-icon
              @click="downloadFile(item.dynamicId, item.Name)"
              style="cursor: pointer; font-size: 40px"
              color="green"
            >
              mdi-download-box
            </v-icon>
          </div>
        </div>
      </div>
      <div v-else>
        <p>Aucune documentation disponible.</p>
      </div>
    </div>

    <!-- ONGLET TICKETS -->
    <div v-if="vSelectedTab == 'Tickets'" class="scrollable-content">
      <!-- Vérification si les tickets existent -->
      <div v-if="vSelectItemTickets && vSelectItemTickets.length > 0">
        <!-- Boucle sur chaque ticket -->
        <div
          v-for="(ticket, index) in vSelectItemTickets"
          :key="index"
          class="blocInformation"
        >
          <div class="">
            <div>
              <!-- Affichage des informations principales du ticket -->
              <span
                style="
                  font-size: 19px;
                  font-family: Arial, Helvetica, sans-serif;
                  font-weight: bold;
                "
              >
                {{ ticket.name }}</span
              >
              <div class="back_blanc">
                <li><strong>Description :</strong> {{ ticket.description }}</li>
                <li
                  ><strong>Date de création :</strong>
                  {{ new Date(ticket.creationDate).toLocaleString() }}</li
                >
                <li><strong>Priorité :</strong> {{ ticket.priority }}</li>
                <li
                  ><strong>Étape actuelle :</strong> {{ ticket.step.name }}</li
                >
                <li><strong>Processus :</strong> {{ ticket.process.name }}</li>
                <li
                  ><strong>Nom du workflow :</strong>
                  {{ ticket.workflowName }}</li
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Affichage lorsqu'il n'y a pas de tickets -->
      <div v-else>
        <p>Aucun ticket disponible.</p>
      </div>
    </div>

    <!-- ONGLET Notes -->
    <div v-if="vSelectedTab == 'Notes'" class="scrollable-content">
      <!-- Vérification si les notes existent -->
      <div v-if="vSelectItemNotes && vSelectItemNotes.length > 0">
        <!-- Boucle sur chaque note -->
        <div
          v-for="(note, index) in vSelectItemNotes"
          :key="index"
          class="blocInformation"
        >
          <div class="">
            <div>
              <!-- Affichage des informations principales de la note -->
              <span
                style="
                  font-size: 19px;
                  font-family: Arial, Helvetica, sans-serif;
                  font-weight: bold;
                "
              >
                {{ new Date(note.date).toLocaleString() }}</span
              >
              <div v-if="note.type != 'img'" class="back_blanc">
                <li><strong>Message :</strong> {{ note.message }}</li>
              </div>
              <div v-else>
                <img
                  :src="note.fileUrl"
                  alt="Preview"
                  class="item-preview-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Affichage lorsqu'il n'y a pas de notes -->
      <div v-else>
        <p>Aucune note disponible.</p>
      </div>
    </div>

    

    <!-- ONGLET INDICATEUR (controleEndpoint) et Points de mesures -->
    <div v-if="vSelectedTab == 'Indicateur' || vSelectedTab =='Points de mesures'" style="display: flex">
      
      <div v-if="ActiveData && labelsChart"
        class="graphContainer"
      >
      <LineCardComponent :title="'Donnée Insight'" :labels="labelsChart" :datasets="chartData"
            :step="labelsChart.length" :tooltipCallbacks="{
              title: (context) => { },
              label: (tooltipItem) =>
                `${tooltipItem.dataset.label}: ${tooltipItem.parsed.y.toFixed(
                  2
                )} `,
              footer: (data) => { },
      }"></LineCardComponent>
      </div>

      <!-- ONGLET INDICATEUR -->
      <div style="width: 100%" v-if="vSelectedTab == 'Indicateur'">
        <div
          v-for="(item, index) in vSelectItemInsights"
          class="blocInformation"
        >
          <span
            style="
              font-size: 19px;
              font-family: Arial, Helvetica, sans-serif;
              font-weight: bold;
            "
            >{{ item.profileName }}</span
          >
          <div v-if="vSelectItemInsights == null"
            
            style="
              justify-content: center;
              align-items: center;
              width: 100%;
              display: flex;
              margin-top: 10px;
              margin-bottom: 10px;
            "
          >
            <v-progress-circular
              :size="50"
              color="primary"
              indeterminate
            ></v-progress-circular>
          </div>
          <div v-else>
            <div v-for="(item, index2) in vSelectItemInsights[index].endpoints"
              class="inventory-container"
              :key="index2"
            >
              <div
                class="inventory-item"
                :style="{
                  width: '100%',
                  color: '#14202c',
                  padding: '16px',
                  borderRadius: '5px',
                  paddingLeft: '6px',
                  boxShadow:
                    'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
                }"
              >
                <li
                  >{{ item.name }}: {{ item.currentValue }}
                  {{ item.unit || '' }}</li
                >
                <v-icon
                  @click="
                    () => {
                      fullData();
                      addOrRemove(item.dynamicId);
                      resize();
                    }
                  "
                  v-if="
                    cpIdToDraw.includes(item.dynamicId) &&
                    !activeChart.includes(item.dynamicId)
                  "
                  >mdi-chart-line</v-icon
                >
                <v-icon
                  @click="
                    () => {
                      addOrRemove(item.dynamicId);
                    }
                  "
                  v-if="activeChart.includes(item.dynamicId)"
                  >mdi-close</v-icon
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ONGLET POINT DE MESURE (endpoints)-->
    <div style="width: 100%" v-if="vSelectedTab == 'Points de mesures'">
      <div
        v-for="(item, index) in vSelectItemEndpoints"
        :key="index"
        class="blocInformation"
      >
        <div v-if="!vSelectItemEndpoints">
          <v-progress-circular
            :size="50"
            color="primary"
            indeterminate
          ></v-progress-circular>
        </div>
        <div v-else class="inventory-container">
          <div
            class="inventory-item"
            style="
              color: #14202c;
              padding: 16px;
              border-radius: 5px;
              padding-left: 6px;
              background-color: #f9f9f9;
              box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,
                rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
              width: 100%;
            "
          >
            <li>
              {{ item.name }}: {{ item.currentValue }} {{ item.unit || '' }}</li
            >
            <v-icon
                  @click="
                    () => {
                      fullData();
                      addOrRemove(item.dynamicId);
                      resize();
                    }
                  "
                  v-if="
                    cpIdToDraw.includes(item.dynamicId) &&
                    !activeChart.includes(item.dynamicId)
                  "
                  >mdi-chart-line</v-icon
                >
                <v-icon
                  @click="
                    () => {
                      addOrRemove(item.dynamicId);
                    }
                  "
                  v-if="activeChart.includes(item.dynamicId)"
                  >mdi-close</v-icon
                >
          </div>
        </div>
      </div>
    </div>
    </div>

    
  </div>
</template>

<script>
import SmallLegend from './SmallLegend.vue';
import { MutationTypes } from '../../services/store/appDataStore/mutations';
import SpinalComparaison from './SpinalComparaison.vue';
import SpinalbreadCrumb from './SpinalbreadCrumb.vue';
import DataTable from './SpinalDataTable';
import { ActionTypes } from '../../interfaces/vuexStoreTypes';
import LineCardComponent from './LineCardComponent.vue';
import { IConfig, ITemporality } from '../../interfaces/IConfig';
import moment from 'moment';

import Alert from './Alert.vue'
import ShowDocumentation from './Documentation.vue'
import FormDoc from "./FormDoc.vue";
import AddBtn from './ButtonAdd.vue';
import getIcon from "../../services/function/getIcon";
import Loader from "./Loader.vue";

export default {
  components: {
    SmallLegend,
    SpinalComparaison,
    SpinalbreadCrumb,
    DataTable,
    LineCardComponent,
    Alert,
    ShowDocumentation,
    FormDoc,
    AddBtn,
    Loader
  },
  props: [
    'contexts',
    'temporality',
    'unit',
    'label',
    'reference',
    'selectedItemTab',
    'ctx_list',
    'cat_list',
    'grp_list',
    'ActiveData',
    'DActive',
  ],
  data: () => ({
    selections: {},
    tableData: [],
    selectedCategory: [],
    selectedAttribute: null,
    filteredAttributes: [],
    filteredItem: [],
    selectedKeys: [],
    keyselected: {},
    showattribut: false,
    selected_id: null,
    selected_data_item_name: '',
    selectedEquipement: null,

    importAttr: false,
    checked: false,
    allFilteredData: [],
    currentfilter: null,
    order: false,
    vSelectTabs: [
      'Equipements',
      'Attributs',
      'Documentation',
      'Notes',
      'Tickets',
      'Indicateur',
      'Points de mesures',
    ],
    vSelectedTab: 'Equipements',
    vSelectItemAttributes: [],
    vSelectItemAutodeskAttributes: [],
    vSelectItemDocumentation: [],
    vSelectItemNotes: [],
    vSelectItemTickets: [],
    vSelectItemInsights: [],
    vSelectItemEndpoints: [],
    cpIdToDraw: [],
    beginDate: (any = null),
    endDate: (any = null),
    dataTable: (any = []),
    activeChart: (any = []),
    labelsChart: (any = null),
    chartData: (any = null),
    t_index: (number = 0),
    timeactuelle: (string = 'date ?'),
  }),
  mounted() {
    this.timeactuelle = this.getFormattedDateFromTemporalData();
    this.$nextTick(() => {
      const headers = document.querySelectorAll(
        '#my-data-table .v-data-table-header '
      );
      headers.forEach((header) => {
        header.addEventListener('click', (e) => {
          this.onHeaderClick(e.target.textContent.trim());
        });
      });
    });
  },
  computed: {
    // treeviewItems() {
    //   console.log('------> contexts', this.contexts);
    //   if (!this.contexts[0].nomenclature) {
    //     return [];
    //   }
    //   let index = 0;
    //   let res = [];
    //   const nomenclatureObj = this.contexts[0].nomenclature;
    //   const attributeItems = Object.entries(nomenclatureObj).map(
    //     ([key, value]) => {
    //       const obj = {
    //         id: key + index,
    //         name: "Catégorie d'attribut: " + key,
    //         children: value?.map((item, itemIndex) => ({
    //           id: `${key}-${itemIndex}`,
    //           name: item,
    //         })),
    //       };
    //       index += 1;
    //       return obj;
    //     }
    //   );
    //   res = res.concat(attributeItems);
    //   res.push({
    //     id: 'Tickets' + index,
    //     name: 'Tickets',
    //     children: [
    //       { id: 'Tickets-declare0', name: 'Tickets déclarés', children: [] },
    //       { id: 'Tickets-en-cours1', name: 'Tickets en cours', children: [] },
    //       { id: 'Tickets-ferme2', name: 'Tickets cloturés', children: [] },
    //     ],
    //   });
    //   index += 1;
    //   res.push({
    //     id: 'Insights' + index,
    //     name: 'Insights',
    //     children: [
    //       { id: 'cp0', name: 'cp1', children: [] },
    //       { id: 'cp1', name: 'cp2', children: [] },
    //       { id: 'cp2', name: 'cp3', children: [] },
    //     ],
    //   });
    //   index += 1;

    //   res.push({
    //     id: 'Endoints' + index,
    //     name: 'Endpoints',
    //     children: [
    //       { id: 'ep0', name: 'ep1', children: [] },
    //       { id: 'ep1', name: 'ep2', children: [] },
    //       { id: 'ep2', name: 'ep3', children: [] },
    //     ],
    //   });
    //   index += 1;

    //   res.push({
    //     id: 'Notes' + index,
    //     name: 'Notes',
    //     children: [
    //       { id: 'Nombre de notes', name: 'Nombre de notes', children: [] },
    //     ],
    //   });
    //   index += 1;

    //   res.push({
    //     id: 'Documents' + index,
    //     name: 'Documents',
    //     children: [
    //       {
    //         id: 'Nombre de documents',
    //         name: 'Nombre de documents',
    //         children: [],
    //       },
    //     ],
    //   });
    //   index += 1;

    //   console.log('------> items', res);

    //   return res;
    // },

    filteredContexts() {
      if (this.contexts) {
        return this.contexts[0]?.data;
      }
    },

    filteredContextsV() {
      if (this.contexts && this.contexts[0]?.data) {
        Object.keys(this.selections).forEach((key) => {
          if (
            Array.isArray(this.selections[key]) &&
            this.selections[key].length === 0
          ) {
            delete this.selections[key];
          }
        });

        if (Object.keys(this.selections).length === 0) {
          let allFilteredData = this.contexts[0]?.data;
          this.$emit('allFiltredData', allFilteredData);
          if (this.currentfilter) {
            this.$store.commit(
              MutationTypes.SET_DLDATA,
              this.sortDataByAttribute(this.currentfilter, [...allFilteredData])
            );
            return this.sortDataByAttribute(this.currentfilter, [
              ...allFilteredData,
            ]);
          } else {
            //this.extractData();
            return this.contexts[0]?.data;
          }
        }

        const criteria = Object.entries(this.selections).map(
          ([key, values]) => {
            const [label, category] = key.split('/');
            return { label, category, values };
          }
        );

        let allFilteredData = [];

        criteria.forEach((criterion, index) => {
          const filteredDataForCriterion = this.contexts[0].data.filter(
            (object) => {
              const category = object.categoryAttributes.find(
                (cat) => cat.name === criterion.category
              );
              return criterion.values.some((value) => {
                if (value === '<empty>') {
                  if (
                    !category ||
                    !category.attributs.some(
                      (attr) => attr.label === criterion.label
                    )
                  ) {
                    return true;
                  }
                  const attribute = category.attributs.find(
                    (attr) => attr.label === criterion.label
                  );
                  return !attribute || attribute.value === '';
                } else {
                  return (
                    category &&
                    category.attributs.some(
                      (attr) =>
                        attr.label === criterion.label && attr.value === value
                    )
                  );
                }
              });
            }
          );
          if (index === 0) {
            allFilteredData = filteredDataForCriterion;
          } else {
            allFilteredData = allFilteredData.filter((item) =>
              filteredDataForCriterion.includes(item)
            );
          }
        });
        this.$emit('allFiltredData', allFilteredData);
        if (this.currentfilter && allFilteredData != []) {
          this.$store.commit(
            MutationTypes.SET_DLDATA,
            this.sortDataByAttribute(this.currentfilter, [...allFilteredData])
          );
          return this.sortDataByAttribute(this.currentfilter, [
            ...allFilteredData,
          ]);
        } else {
          //this.extractData(allFilteredData);

          return allFilteredData;
        }
      }
    },

    temporality() {
      return this.$store.state.appDataStore.temporalitySelected.name;
    },

    currentTargetItemId() {
      let dynamicId = null;
      if (this.selected_id) {
        dynamicId = this.selected_id;
      } else if (this.$store.state.appDataStore.user_selected.grp.length > 0) {
        let found = this.grp_list.find(
          (grp) =>
            grp.name === this.$store.state.appDataStore.user_selected.grp[0]
        );
        dynamicId = found.dynamicId;
      } else if (this.$store.state.appDataStore.user_selected.cat) {
        let found = this.cat_list.find(
          (cat) => cat.name === this.$store.state.appDataStore.user_selected.cat
        );
        dynamicId = found.dynamicId;
      } else if (this.$store.state.appDataStore.user_selected.ctx) {
        let found = this.ctx_list.find(
          (ctx) => ctx.name === this.$store.state.appDataStore.user_selected.ctx
        );
        dynamicId = found.dynamicId;
      }
      return dynamicId;
    }
  },

  methods: {
    fullData() {
      if (!this.ActiveData) {
        this.$emit('buttonClicked');
      }
    },

    resize() {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 1);
    },

    handleSuccess() {
      this.importAttr = false;
      this.$emit('updateSuccess');
    },

    filtercolumn(item) {
      this.order = !this.order;
      this.currentfilter = item.text;
    },

    sortDataByAttribute(categoryAttributePair, dataArray) {
      const [attributeName, categoryName] = categoryAttributePair.split('/');

      const findAttributeValue = (item) => {
        const category = item.categoryAttributes.find(
          (cat) => cat.name === categoryName
        );
        const attribute = category?.attributs.find(
          (attr) => attr.label === attributeName
        );
        return attribute ? attribute.value : '';
      };

      const sortOrder = this.order ? 1 : -1;

      dataArray.sort((a, b) => {
        const aValue = findAttributeValue(a);
        const bValue = findAttributeValue(b);

        if (!isNaN(aValue) && !isNaN(bValue)) {
          return (Number(aValue) - Number(bValue)) * sortOrder;
        }
        return aValue.localeCompare(bValue) * sortOrder;
      });

      return dataArray;
    },

    deleteAttrSelected(item) {
      let selectedKeys = this.selectedKeys;
      if (item.parentName === item.childName) {
        this.selectedKeys = selectedKeys.filter(
          (key) => !key.startsWith(item.parentName)
        );
      } else {
        const childIndex = this.contexts[0].nomenclature[
          item.parentName
        ].indexOf(item.childName);
        if (childIndex !== -1) {
          const keyToRemove = `${item.parentName}-${childIndex}`;
          this.selectedKeys = this.selectedKeys.filter(
            (key) => key !== keyToRemove
          );
        }
      }
    },

    emitValue(listType, value) {
      if (listType == 'item') {
        this.selected_id = null;
        this.selected_data_item_name = null;
        return;
      }
      if (listType == 'ctx' || listType == 'cat') {
        this.selected_grp = [];
      }
      if (listType == 'ctx') {
        this.selected_cat = '';
      }
      this.$emit('itemSelected', { listType, value });
    },

    onHeaderClick(headerName) {
      console.log('onHeaderClick de-activated uncomment to activate');
      // if (headerName.length > 0)
      //   this.$store.commit(MutationTypes.SET_ATTR, headerName);
    },

    // extractData(givendata = this.filteredContexts) {
    //   const dynamicHeaders = this.dynamicHeaders()?.map(
    //     (header) => header.text
    //   );
    //   const filteredContexts = givendata;

    //   // const { filteredContexts } = this;
    //   if (
    //     this.$store.state.appDataStore.dl_data_option == false ||
    //     this.checked == true
    //   ) {
    //     this.tableData = filteredContexts?.map((item) => {
    //       const dataForRow = {};
    //       dynamicHeaders.forEach((header) => {
    //         dataForRow['dynamicId'] = item.dynamicId;
    //         dataForRow['staticId'] = item.staticId;
    //         if (header.includes('Nom')) {
    //           dataForRow['Nom'] = item.name;
    //         } else {
    //           const attributeValue = this.getAttributeValueDL(item, header);
    //           dataForRow[header] = attributeValue;
    //         }
    //       });
    //       return dataForRow;
    //     });
    //   } else {
    //     this.tableData = filteredContexts?.map((item) => {
    //       const dataForRow = {
    //         dynamicId: item.dynamicId,
    //         staticId: item.staticId,
    //         Nom: item.name,
    //       };

    //       item.categoryAttributes.forEach((category) => {
    //         category.attributs.forEach((attr) => {
    //           const attrKey = `${attr.label}/${category.name}`;
    //           dataForRow[attrKey] = attr.value;
    //         });
    //       });

    //       return dataForRow;
    //     });
    //   }
    //   this.ChipKeySlected();
    //   this.$store.commit(MutationTypes.SET_DLDATA, this.tableData);
    // },

    getAttributeValueDL(item, attrLabel) {
      const [childName, parentName] = attrLabel.split('/');
      const category = item.categoryAttributes.find(
        (cat) => cat.name === parentName
      );
      if (category) {
        const attribute = category.attributs.find((a) => a.label === childName);
        if (attribute) {
          return attribute.value;
        }
      }
      return '';
    },

    getAttributeValue(item, attrLabel) {
      for (const category of item.categoryAttributes) {
        const attribute = category.attributs.find((a) => a.label === attrLabel);
        if (attribute) {
          return attribute.value;
        }
      }
      return '';
    },

    selectDataView(item) {
      console.log('SELECTED ITEM : ', item);
      this.selected_id = item.dynamicId;
      this.selected_data_item_name = item.name;
      this.selectedEquipement = item;
      this.$emit('item-selected', item);
    },
    unselectDataView(items){
      this.selected_id = null;
      this.selected_data_item_name = null;
      this.selectedEquipement = null;
      this.$emit('unselect-data-view', items);
    },

    fitToView(item){
      this.$emit('fit-to-view', item);
    },

    ChipKeySlected() {
      const headers = [
        {
          text: 'Nom',
          value: 'name',
          sortable: true,
          filtrable: true,
          filtrable: true,
        },
      ];
      const selectedItems = this.selectedKeys
        ?.map((key) => {
          const foundItem = this.treeviewItems?.find(
            (item) =>
              item.children && item.children.find((child) => child.id === key)
          );
          if (foundItem) {
            const foundChild = foundItem.children.find(
              (child) => child.id === key
            );

            return {
              parentName: foundItem.name,
              childName: foundChild ? foundChild.name : null,
            };
          }
          return null;
        })
        .filter((item) => item && item.childName !== null);
      selectedItems.forEach(({ parentName, childName }) => {
        headers.push({
          text: `${childName}/${parentName}`,
          value: childName,
          filtrable: true,
        });
      });

      let parentCounts = {};
      let optimizedItems = [];

      if (!this.contexts) {
        return;
      }
      let nomenclature = this.contexts[0].nomenclature;

      selectedItems.forEach((item) => {
        const { parentName, childName } = item;
        if (!parentCounts[parentName]) {
          parentCounts[parentName] = { count: 1, children: [childName] };
        } else {
          parentCounts[parentName].count++;
          parentCounts[parentName].children.push(childName);
        }
      });

      for (const parentName in parentCounts) {
        const parentInfo = parentCounts[parentName];
        if (
          nomenclature[parentName] &&
          nomenclature[parentName].length === parentInfo.count &&
          nomenclature[parentName].every((child) =>
            parentInfo.children.includes(child)
          )
        ) {
          optimizedItems.push({ parentName, childName: parentName });
        } else {
          parentInfo.children.forEach((childName) =>
            optimizedItems.push({ parentName, childName })
          );
        }
      }
      this.keyselected = optimizedItems;
    },

    dynamicHeaders() {
      let headers = [
        { text: 'Nom', value: 'name', sortable: true },
        { text: 'Etage', value: 'floor', sortable: true },
        { text: 'Pièce', value: 'room', sortable: true },
        { text: 'Nombre de tickets', value: 'nbr_tickets', sortable: true },
        { text: 'Nombre de notes', value: 'nbr_notes', sortable: true },
        { text: 'Nombre de documents', value: 'nbr_files', sortable: true },
        { text: 'Nombre de points de mesure', value: 'nbr_ep', sortable: true },
        { text: 'Nombre d\'insights (profils)', value: 'nbr_cp', sortable: true },
        { text: 'Nombre de catégories d\'attributs', value: 'nbr_category_attributes', sortable: true },


      ];
      if (
        this.$store.state.appDataStore.user_selected.grp.length !=1 
      ) {
        headers.push({ text: 'Groupe', value: 'group', sortable: true });
      }

      const selectedItems = this.selectedKeys
        ?.map((key) => {
          const foundItem = this.treeviewItems.find(
            (item) =>
              item.children && item.children.find((child) => child.id === key)
          );
          if (foundItem) {
            const foundChild = foundItem.children.find(
              (child) => child.id === key
            );
            return {
              parentName: foundItem.name,
              childName: foundChild ? foundChild.name : null,
            };
          }
          return null;
        })
        .filter((item) => item && item.childName !== null);

      selectedItems.forEach(({ parentName, childName }) => {
        if (childName !== 'name') {
          headers.push({
            text: `${childName}/${parentName}`,
            value: childName,
            filterable: true,
          });
        }
      });
      return headers;
    },

    async downloadFile(referenceIds, filename) {
      const promises = [
        this.$store.dispatch(ActionTypes.POST_DOWNLOAD_FILE, {
          buildingId: localStorage.getItem('idBuilding'),
          referenceIds: referenceIds,
        }),
      ];
      const result = await Promise.all(promises);

      result.forEach((blob) => {
        const type = blob.type.split('/', 2);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      });

      return result;
    },

    async addOrRemove(dyn) {
      if (this.activeChart.includes(dyn)) {
        this.dataTable = this.dataTable.filter(
          (item) => item.dynamicId !== dyn
        );
        this.activeChart = this.activeChart.filter((id) => id !== dyn);
        this.removegraphInfoCp(dyn);
        if(this.activeChart.length == 0){
          this.$emit('buttonClicked');
        }
      } else {
        this.addgraphInfoCp(dyn);
        this.activeChart.push(dyn);
      }
    },
    async removegraphInfoCp(dyn) {
      const datatable = this.dataTable;
      this.chartData = this.chartDataObject(datatable);
    },

    parseDateString(dateString) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      return new Date(`${year}-${month}-${day}T${timePart}`);
    },

    async reloadNewChartData() {
      console.log(this.activeChart, '5');
      this.dataTable = [];

      for (const id of this.activeChart) {
        await this.addgraphInfoCp(id);
      }
    },

    async addgraphInfoCp(dyn) {
      if (!this.cpIdToDraw.includes(dyn)) return;

      const { begintime, endtime } = this.getBeginAndEndTime();
      const buildingId = localStorage.getItem('idBuilding');
      const beginTimestamp = this.parseDateString(begintime).getTime();
      const endTimestamp = this.parseDateString(endtime).getTime();

      const result = await this.$store.dispatch(ActionTypes.GET_TIMES_SERIES, {
        buildingId,
        referenceIds: dyn,
        begin: begintime,
        end: endtime,
      });

      const timeStep = 60000; // Une minute en millisecondes
      const seenMinutes = new Map();

      result.forEach(({ date, value }) => {
        const minuteTimestamp =
          Math.floor(new Date(date).getTime() / timeStep) * timeStep;
        seenMinutes.set(minuteTimestamp, value);
      });

      const processedResult = Array.from(
        { length: Math.floor((endTimestamp - beginTimestamp) / timeStep) + 1 },
        (_, i) => {
          const date = beginTimestamp + i * timeStep;
          return {
            date,
            value: seenMinutes.get(date) ?? NaN,
          };
        }
      );
      let findEp = this.vSelectItemEndpoints.find((item) => item.dynamicId == dyn);
      if (!findEp) {
        for(const profil of this.vSelectItemInsights){
          findEp = profil.endpoints.find((ep) => ep.dynamicId == dyn);
          if(findEp) break;
        }
      }
      // Mettre à jour le tableau de données
      const actuelleTable = {
        dynamicId: dyn,
        data: processedResult.map(({ date, value }) => ({ x: date, y: value })),
        unit: findEp.unit,
        name: findEp.name,
      };

      this.dataTable = [...this.dataTable, actuelleTable];
      this.labelsChart = this.labels(begintime, endtime).map(this.toDate);
      this.chartData = this.chartDataObject(this.dataTable);
    },

    //fonction pour retourner la date string ( beging et end )
    getBeginAndEndTime() {
      const temporality =
        this.$store.state.appDataStore.temporalitySelected.name;
      const t_index = this.t_index || 0;
      let begintime, endtime;

      switch (temporality) {
        case ITemporality.hour:
          begintime = moment()
            .add(t_index, 'hours')
            .startOf('hour')
            .format('DD-MM-YYYY HH:mm:ss');
          endtime = moment()
            .add(t_index, 'hours')
            .endOf('hour')
            .format('DD-MM-YYYY HH:mm:ss');
          break;
        case ITemporality.day:
          begintime = moment()
            .add(t_index, 'days')
            .startOf('day')
            .format('DD-MM-YYYY HH:mm:ss');
          endtime = moment()
            .add(t_index, 'days')
            .endOf('day')
            .format('DD-MM-YYYY HH:mm:ss');
          break;
        case ITemporality.week:
          begintime = moment()
            .add(t_index, 'weeks')
            .startOf('week')
            .format('DD-MM-YYYY HH:mm:ss');
          endtime = moment()
            .add(t_index, 'weeks')
            .endOf('week')
            .format('DD-MM-YYYY HH:mm:ss');
          break;
        case ITemporality.month:
          begintime = moment()
            .add(t_index, 'months')
            .startOf('month')
            .format('DD-MM-YYYY HH:mm:ss');
          endtime = moment()
            .add(t_index, 'months')
            .endOf('month')
            .format('DD-MM-YYYY HH:mm:ss');
          break;
        case ITemporality.year:
          begintime = moment()
            .add(t_index, 'years')
            .startOf('year')
            .format('DD-MM-YYYY HH:mm:ss');
          endtime = moment()
            .add(t_index, 'years')
            .endOf('year')
            .format('DD-MM-YYYY HH:mm:ss');
          break;
        default:
          // Retourner la journée actuelle par défaut, ajustée avec t_index
          begintime = moment()
            .add(t_index, 'days')
            .startOf('day')
            .format('DD-MM-YYYY HH:mm:ss');
          endtime = moment()
            .add(t_index, 'days')
            .endOf('day')
            .format('DD-MM-YYYY HH:mm:ss');
          break;
      }

      return { begintime, endtime };
    },

    getFormattedDateFromTemporalData() {
      // Assurer une valeur par défaut de 0 pour t_index si ce n'est pas défini
      const temporality =
        this.$store.state.appDataStore.temporalitySelected.name;
      const t_index = this.t_index || 0;
      let formattedDate;

      switch (temporality) {
        case ITemporality.hour:
          formattedDate = moment()
            .add(t_index, 'hours')
            .startOf('hour')
            .format('DD-MM-YYYY HH:mm:ss');
          break;
        case ITemporality.day:
          formattedDate = moment()
            .add(t_index, 'days')
            .startOf('day')
            .format('DD-MM-YYYY');
          break;
        case ITemporality.week:
          // Pour les semaines, afficher la semaine entière, ex: "15-11-2024 au 21-11-2024"
          const weekStart = moment()
            .add(t_index, 'weeks')
            .startOf('week')
            .format('DD-MM-YYYY');
          const weekEnd = moment()
            .add(t_index, 'weeks')
            .endOf('week')
            .format('DD-MM-YYYY');
          formattedDate = `${weekStart} au ${weekEnd}`;
          break;
        case ITemporality.month:
          // Afficher le mois et l'année, ex: "Novembre 2023"
          formattedDate = moment()
            .add(t_index, 'months')
            .startOf('month')
            .format('MMMM YYYY');
          break;
        case ITemporality.year:
          // Afficher uniquement l'année, ex: "2024"
          formattedDate = moment().add(t_index, 'years').format('YYYY');
          break;
        default:
          // Si la temporalité est inconnue, retourner la date du jour par défaut
          formattedDate = moment()
            .add(t_index, 'days')
            .startOf('day')
            .format('DD-MM-YYYY');
          break;
      }

      return formattedDate;
    },

    toDate(date) {
      switch (this.$store.state.appDataStore.temporalitySelected.name) {
        case ITemporality.hour:
          return moment(date).format('HH:mm');
        case ITemporality.day:
          return moment(date).format('HH[h]');
        case ITemporality.week:
          return moment(date).format('dd');
        case ITemporality.month:
          return moment(date).format('D/M/YY');
        case ITemporality.year:
          return moment(date).format('MMM');
        case ITemporality.custom:
          const { begin, end } =
            this.$store.state.appDataStore.temporalitySelected.range;
          const duration = moment.duration(
            moment(end, 'DD-MM-YYYY HH:mm:ss').diff(
              moment(begin, 'DD-MM-YYYY HH:mm:ss')
            )
          );
          if (duration.asMonths() > 2) return moment(date).format('MMM');
          if (duration.asDays() > 1) return moment(date).format('D/M/YY');
          if (duration.asHours() > 1) return moment(date).format('HH[h]');
          return moment(date).format('HH:mm');
        default:
          return moment(date).format('D/M/YY');
      }
    },

    labels(begin, end) {
      if (!this.dataTable) {
        return [];
      }

      const parseDate = (dateStr) => {
        const [day, month, yearTime] = dateStr.split('-');
        const [year, time] = yearTime.split(' ');
        const [hours, minutes, seconds] = time.split(':');

        return new Date(
          parseInt(year, 10), // Année
          parseInt(month, 10) - 1, // Mois (0 = janvier, donc on soustrait 1)
          parseInt(day, 10), // Jour
          parseInt(hours, 10), // Heures
          parseInt(minutes, 10), // Minutes
          parseInt(seconds, 10) // Secondes
        );
      };

      const beginDate = parseDate(begin);
      const endDate = parseDate(end);

      const dates = [];
      const interval = 60 * 1000; // Intervalle d'une journée en millisecondes

      for (
        let date = beginDate;
        date <= endDate;
        date = new Date(date.getTime() + interval)
      ) {
        dates.push(new Date(date)); // Ajoute une nouvelle date au tableau
      }
      return dates;
    },

    chartDataObject(dataTable) {
      console.log('dataTable', dataTable);
      return dataTable.map((el, index) => ({
        data: [...el.data],
        label: `${el.name} ${el.unit || ''}`,
        color: 'blue',
        dynamicId: el.dynamicId,
        specialAxis: index,
      }));
    },
  },

  watch: {
    allFilteredData(newVal, oldVal) {
      this.$emit('allFiltredData', newVal);
    },

    async vSelectedTab(newVal, oldVal) {
      console.log('vSelectedTab', newVal);
      // get the dynamic id of the current item
      const dynamicId = this.currentTargetItemId;

      const buildingId = localStorage.getItem('idBuilding');
      if (newVal === 'Attributs') {
        const attributs = await this.$store.dispatch(
          ActionTypes.GET_ATTRIBUT_LIST_MULTIPLE,
          {
            buildingId,
            referenceIds: [dynamicId],
          }
        );
        const response = attributs.find(
          (response) => response.dynamicId === dynamicId
        );
        this.vSelectItemAttributes = response.categoryAttributes;
        if(this.selectedEquipement?.dynamicId == dynamicId ) { // 
          // get autodesk viewer properties 
          console
          const properties = await this.$store.dispatch(
          ActionTypes.GET_VIEWER_OBJECT_PROPERTIES,this.selectedEquipement.dbid
        );

          const newAttributs = properties.properties.map((prop) => {
            return {
              label: prop.displayName,
              value: prop.displayValue,
            };
          })

          const revitCategory = {
            name: 'Revit-Autodesk properties',
            attributs: newAttributs
          }
        this.vSelectItemAttributes.push(revitCategory);
        
        }
        // this.$forceUpdate()
      }
      if (newVal === 'Documentation') {
        const documentation = await this.$store.dispatch(
          ActionTypes.GET_DOCUMENTATION,
          {
            buildingId: buildingId,
            referenceIds: dynamicId,
          }
        );
        this.vSelectItemDocumentation = await Promise.all(
          documentation.map(async (item) => {
            // Check for image file extensions
            const isImage = /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(item.Name);

            if (isImage) {
              const fileBlob = await this.$store.dispatch(
                ActionTypes.POST_DOWNLOAD_FILE,
                {
                  buildingId: buildingId,
                  referenceIds: item.dynamicId,
                }
              );
              return {
                ...item,
                fileUrl: URL.createObjectURL(fileBlob), // Attach fileUrl for image preview
              };
            }

            // Return the item as-is for non-image files
            return item;
          })
        );
      }
      if (newVal === 'Notes') {
        const notes = await this.$store.dispatch(ActionTypes.GET_NOTES, {
          buildingId: buildingId,
          referenceIds: dynamicId,
        });

        const documentation = await this.$store.dispatch(
          ActionTypes.GET_DOCUMENTATION,
          {
            buildingId: buildingId,
            referenceIds: dynamicId,
          }
        );

        this.vSelectItemNotes = await Promise.all(
          notes.map(async (item) => {
            if (item.type == 'img') {
              const findDoc = documentation.find(
                (doc) => doc.Name === item.message
              );
              const fileBlob = await this.$store.dispatch(
                ActionTypes.POST_DOWNLOAD_FILE,
                {
                  buildingId: buildingId,
                  referenceIds: findDoc.dynamicId,
                }
              );
              return {
                ...item,
                fileUrl: URL.createObjectURL(fileBlob), // Attach fileUrl for image preview
              };
            }
            return item;
          })
        );
        console.log('vSelectItemNotes', this.vSelectItemNotes);
      }
      if (newVal === 'Tickets') {
        const tickets = await this.$store.dispatch(ActionTypes.GET_TICKET, {
          buildingId: buildingId,
          referenceIds: dynamicId,
        });
        this.vSelectItemTickets = tickets;
      }
      if (newVal === 'Indicateur') {
        const control_endpoints = await this.$store.dispatch(
          ActionTypes.GET_NODE_CONTROL_ENDPOINT_LIST,
          {
            buildingId: buildingId,
            referenceIds: dynamicId,
          }
        );
        const tmpLst = [];
        control_endpoints.map((profil) =>
          profil.endpoints
            .filter((ep) => ep.saveTimeSeries == 1)
            .map((item) => tmpLst.push(item.dynamicId))
        );
        this.cpIdToDraw = tmpLst;
        this.vSelectItemInsights = control_endpoints;
      }
      if (newVal === 'Points de mesures') {
        const endpoints = await this.$store.dispatch(
          ActionTypes.GET_NODE_ENDPOINT_LIST,
          {
            buildingId: buildingId,
            referenceIds: dynamicId,
          }
        );
        
        const tmpLst = [];
        endpoints.filter((ep) => ep.saveTimeSeries == 1).map((item) => tmpLst.push(item.dynamicId));
        this.cpIdToDraw = tmpLst;
        this.vSelectItemEndpoints = endpoints;
      }
    },

    temporality(newVal, oldVal) {
      
      if(this.t_index!= 0) {
        this.t_index = 0;
        return;
      } 

      this.timeactuelle = this.getFormattedDateFromTemporalData();
      this.reloadNewChartData();
    },

    t_index(newVal,oldVal) {
      
      this.timeactuelle = this.getFormattedDateFromTemporalData();
      this.reloadNewChartData();
    },




    '$store.state.appDataStore.dl_data_option': {
      handler(newValue, oldValue) {
        //this.extractData();
      },
      deep: true,
      immediate: false,
    },

    // selectedItemTab(newVal, oldVal) {
    //   this.selected_id = newVal
    //   if (this.$refs[`row-${newVal}`]) {
    //     this.$refs[`row-${newVal}`].scrollIntoView({ behavior: 'smooth', block: 'center' });
    //   }
    // },

    selectedKeys(newVal, oldVal) {
      //this.extractData();
      const resultat = {};
      newVal.forEach((s) => {
        const dernierTiretIndex = s.lastIndexOf('-');
        const nom = s.substring(0, dernierTiretIndex);
        const numero = s.substring(dernierTiretIndex + 1);

        if (!resultat[nom]) {
          resultat[nom] = [];
        }
        resultat[nom].push(numero);
      });
      return resultat;
    },

    selectedCategory(newVal, oldVal) {
      if (newVal) {
        this.filteredAttributes = this.contexts[0].nomenclature[newVal];
      } else {
        this.filteredAttributes = [];
      }
      this.selectedAttribute = null;
    },

    selectedAttribute(newVal, oldVal) {
      if (newVal && this.selectedCategory) {
        let allValues = [];
        this.contexts[0].data.forEach((context) => {
          const category = context.categoryAttributes.find(
            (cat) => cat.name === this.selectedCategory
          );
          if (category) {
            const filteredAttributess = category.attributs.filter(
              (attr) => attr.label === newVal
            );
            filteredAttributess.forEach((attr) => {
              allValues.push(attr.value);
            });
          }
        });
        this.filteredItem = Array.from(new Set(allValues));
      } else {
        this.filteredItem = [];
      }
    },
  },
};
</script>

<style scoped>
.graphContainer {
  border-radius: 0px;
  width: 160%;
  height: 100%;
  min-height: 700px;
  display: flex;
  padding: 10px;
}

.blue-background {
  background-color: #14202c !important;
  color: white !important;
}

.scrollable-content{
  max-height: 74vh;
  overflow-y: scroll;
}

.scrollable-table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-height: fit-content;
}

::v-deep
  .v-text-field.v-input--is-focused
  > .v-input__control
  > .v-input__slot:after {
  color: rgba(255, 255, 255, 0) !important;
}

::v-deep
  .theme--light.v-text-field
  > .v-input__control
  > .v-input__slot:before {
  border-color: rgba(255, 255, 255, 0) !important;
}

.red-background {
  background-color: rgb(255, 255, 255) !important;
  color: #14202c !important;
  border: 1px solid #14202c !important;
}

::v-deep .theme--light.menuable__content__active {
  background-color: red !important;
  z-index: 99999999 !important;
}

::v-deep .v-chip {
  height: 22px !important;
  margin: 3px !important;
  transform: translate(0, -10%);
  overflow: visible;
}

::v-deep .v-breadcrumbs__divider {
  background-color: red !important;
}

::v-deep .v-data-table__wrapper > table > thead > tr > th:nth-child(1) {
  position: sticky;
  left: 0;
  z-index: 9;
}

.blur-background {
  background-color: rgba(0, 0, 0, 0.528);
  top: 0;
  left: 0;
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 99999;
  content: '';
}

.custom-hover-color {
  background-color: rgb(142, 196, 221) !important;
}

tr .colortd.custom-hover-color {
  background-color: rgb(155, 223, 255) !important;
}

::v-deep .custom-hover-color {
  background-color: rgb(100, 206, 255) !important;
}

::v-deep .v-breadcrumbs {
  padding: 2px !important;
}

.colortd {
  background-color: rgb(201, 232, 255);
}

td {
  min-width: 250px;
}

.fixed-first-column table {
  position: relative;
}

::v-deep .v-data-footer {
  display: none;
}

::v-deep div.v-data-table__wrapper > table > thead > tr > th > i {
  display: none;
}

.mouse {
  width: 101%;
  height: 50px;
  background-color: rgb(255, 255, 255);
  border-radius: 5px;
  border: 1px solid rgb(0, 0, 0);
  padding-left: 20px;
  font-size: 17px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: 0.5s;
  color: rgb(47, 47, 47);
}

.animate {
  -webkit-animation: scale-in-ver-top 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    both;
  animation: scale-in-ver-top 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@-webkit-keyframes scale-in-ver-top {
  0% {
    -webkit-transform: scaleY(0);
    transform: scaleY(0);
    -webkit-transform-origin: 100% 0%;
    transform-origin: 100% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
    -webkit-transform-origin: 100% 0%;
    transform-origin: 100% 0%;
    opacity: 1;
  }
}

@keyframes scale-in-ver-top {
  0% {
    -webkit-transform: scaleY(0);
    transform: scaleY(0);
    -webkit-transform-origin: 100% 0%;
    transform-origin: 100% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
    -webkit-transform-origin: 100% 0%;
    transform-origin: 100% 0%;
    opacity: 1;
  }
}

::v-deep .v-treeview-node__children {
  padding-left: 20px;
}

::v-deep .v-treeview-node__root {
  position: relative;
  border-radius: 5px;
  border: 0.2px solid rgb(143, 143, 143);
  max-height: 20px !important;
  overflow: hidden;
  background-color: rgb(255, 255, 255);
}

::v-deep .v-treeview-node__root:hover {
  background-color: rgb(238, 238, 238);
  border: 1px solid rgb(83, 83, 83);
}

.fixed-first-column tbody td:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
}

::v-deep
  .v-data-table__wrapper
  > table
  > tbody
  > tr:nth-child(1)
  > td:nth-child(1) {
  position: sticky;
  left: 0;
  z-index: 1;
}



.fixed-first-column thead th:first-child {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: white;
}

.select-attr {
  -webkit-animation: fade-in 1.2s cubic-bezier(0.39, 0.575, 0.565, 1) both;
  animation: fade-in 1.2s cubic-bezier(0.39, 0.575, 0.565, 1) both;
}

@-webkit-keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.line {
  position: relative;
  width: 0;
  top: 16px;
  height: 1px;
  background-color: rgb(143, 143, 143);
  animation: expandLine 0.5s forwards;
}

@keyframes expandLine {
  to {
    width: 46px;
  }
}

.font-table {
  font: normal normal normal 16px/13px Charlevoix !important;
  letter-spacing: 1.1px;
  color: #14202c;
  opacity: 1;
  box-shadow: none !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hover-magnify:hover {
  background-color: rgb(219, 218, 218) !important;
}

.card-title {
  color: #214353 !important;
  font-size: 20px !important;
}

.text-start {
  justify-content: center;
  display: flex !important;
  flex-direction: row !important;
}

.v-data-table {
  display: flex;
  flex-direction: column;
}

::v-deep .v-data-table__wrapper {
  flex-shrink: 0;
  flex-grow: 1;
  overflow-y: auto !important;
}

::v-deep th {
  height: 48px !important;
  font-size: 14px !important;
  color: #214353 !important;
}

::v-deep td {
  font-size: 14px !important;
  color: #14202c !important;
  background-color: #f4f4f4;
  border-bottom: 1px solid white !important;
  border-right: 1px solid white !important;
}

::v-deep tr:hover td {
  cursor: pointer;
  background-color: #f0f0f0 !important;
}

::v-deep .v-icon__svg {
  fill: #214353 !important;
}

::v-deep .v-list .v-list-item--active,
.v-list .v-list-item--active .v-icon {
  background-color: #2f5321 !important;
}

::v-deep
  .v-text-field.v-input--is-focused
  > .v-input__control
  > .v-input__slot:after {
  color: #214353;
}

::v-deep .v-list-item--link:before {
  background-color: #1500ff !important;
}

::v-deep .v-application .primary--text {
  color: #14202c !important;
  caret-color: #14202c !important;
  background-color: #1500ff !important;
}

::v-deep .v-data-footer__select {
  visibility: hidden;
}

.title {
  letter-spacing: 1.1px;
  color: #214353;
  opacity: 1;
  font-size: 20px !important;
}

.text {
  font-size: 14px;
  font-family: Charlevoix;
  letter-spacing: 0.7px;
  color: #214353;
  opacity: 1;
  font-size: 14px;
}

.theme--light.v-data-table .v-data-footer {
  background: #7b5151 !important;
}

::v-deep .v-data-footer {
  width: 100%;
  margin-right: 0px !important;
  background: #fff !important;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 0px;
}

::v-deep tr > th:first-child {
  border-top-left-radius: 10px !important;
}

::v-deep tr > th:last-child {
  border-top-right-radius: 0px !important;
}

::v-deep tr > td.text-start {
  display: flex;
  align-items: center;
}

::v-deep .v-data-table__wrapper::-webkit-scrollbar-thumb {
  background: #e8e8e8;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border: 1px solid rgb(195, 195, 195);
  transition: 1s;
}

::v-deep .v-data-table__wrapper::-webkit-scrollbar {
  width: 10px;
}

::v-deep .v-data-table__wrapper::-webkit-scrollbar-track {
  background: #ffffff;
}

::v-deep .v-data-table__wrapper::-webkit-scrollbar-thumb {
  background: #e8e8e8;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border: 1px solid rgb(195, 195, 195);
  transition: 1s;
}

::v-deep .v-data-table__wrapper::-webkit-scrollbar-thumb:hover {
  background: #dedede;
}

.blocInformation {
  background-color: #f8f8f8d0;
  border-radius: 2px;
  margin-top: 10px;
  margin-bottom: 20px;
  margin-left: 11px;
  padding: 5px;
  box-shadow: 0 6px 24px #0000000d, 0 0 0 1px #00000014;
  border: 2px dashed #dbdbdb;
  border-radius: 6px;
}
.inventory-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}
/* Inventory item with an image */
.inventory-item.inventory-item-image {
  width: 74%; /* Make it take full width for better preview */
  height: auto; /* Adjust height dynamically */
  flex-direction: column; /* Stack content vertically */
  align-items: flex-start; /* Align text and image */
  /* box-shadow: 0 6px 24px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.1); */
  border-radius: 4px;
  background-color: white;
}

/* Preview image inside an inventory item */
.item-preview-image {
  max-width: 100%;
  max-height: 200px; /* Limit height for large images */
  margin-top: 10px;
  border-radius: 4px; /* Add a slight border radius for aesthetics */
  object-fit: contain; /* Maintain aspect ratio */
}

/* Inventory item without an image remains the same */
.inventory-item {
  width: 74%; /* Keep as-is for non-image items */
  margin: 5px;
  height: 45px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  justify-content: space-between;
  background-color: white;
}

.button {
  display: inline-block;
  padding: 5px;
  text-decoration: none;
  height: 59px;
  padding-left: 10px;
  padding-right: 10px;
  transition: 0.2s;
  white-space: nowrap;
  margin-left: 20px;
  margin-top: 6px;
  margin-bottom: 18px;
  font-size: xx-large;
  cursor: pointer;
  padding-left: 0px;
}

.button:hover {
  background-color: rgb(228, 228, 228);
}

.btn:hover {
  background-color: rgb(199, 199, 199);
}

.adaptative {
  /* width: 80%; */
  overflow: hidden;
  /* height: 50px; */
  position: relative;
  right: 0px;
}

.title {
  position: relative;
  width: 100%;
  display: flex;
}


::v-deep .scrollable-content {
  padding-right: 5px; /* Adds space on the right to simulate a margin */
}

::v-deep .scrollable-content::-webkit-scrollbar-thumb {
  background: #e8e8e8;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border: 1px solid rgb(195, 195, 195);
  transition: 1s;
}

::v-deep .scrollable-content::-webkit-scrollbar {
  width: 10px;
  margin-left: 10px;
}

::v-deep .scrollable-content::-webkit-scrollbar-track {
  background: #ffffff;

}

::v-deep .scrollable-content::-webkit-scrollbar-thumb:hover {
  background: #dedede;
}
</style>
