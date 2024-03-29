<template>
  <div class="main-tab"
    style=" width: 100%; font-size: 14px !important;background-color: rgb(255, 255, 255);border-radius: 10px !important;border-color: black !important;">

    <nav @click.stop="showSelection = !showSelection" class="breadcrumbs">
      <a href="#selected_ctx" class="breadcrumbs__item">{{ selected_ctx }}</a>
      <a href="#selected_cat" class="breadcrumbs__item">{{ selected_cat }}</a>
      <div href="#selected_grp" class="breadcrumbs__item_chips">
        <v-chip color="#14202c" style="background-color: #14202c;margin-top: 10px !important; color: white"
          density="comfortable" size="small" v-for="(item, i) in selected_grp">
          {{ selected_grp[i] }}
          <div
            style="top: -5px;right:-5px;position: absolute;background-color: white;border-radius: 20px;height: 15px;width: 15px;display: flex;justify-content: center;align-items: center;border: 1px solid #14202c; color: #14202c;">
            <v-icon style="margin-top: 1px;" size="13px" @click.stop="tarrr(i)">mdi-close</v-icon>
          </div>
        </v-chip>
      </div>
    </nav>

    <div v-if="showSelection" @click="showSelection = !showSelection"
      style="width: 100%;height: 100%;background-color: rgba(0, 0, 0, 0.412);position:fixed;z-index: 99;top: 0px;left : 0px;display: flex;justify-content: center;align-items: center;flex-direction: column;">

      <div @click.stop style="display: flex;background-color: white;border-radius: 8px;height: 500px;">

        <div
          style="border-right: 2px solid rgb(166, 166, 166);margin: 10px;width: 25vw;background-color: white;min-height: 400px;padding: 10px;max-height: 400px;overflow-y: auto;box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;">

          <div
            style="padding: 5px;border-radius: 5px;background-color: rgba(211, 211, 211, 0.733);width: 100%;font-weight: bold;">
            Selectionner un contexte:</div>
          <ul>
            <div :class="{ 'selected': selected_ctx === ctx.name }" class="choose_li" style="cursor: pointer;"
              v-for="ctx in ctx_list" :key="ctx.name" @click="emitValue('ctx', ctx); selected_ctx = ctx.name">{{
      ctx.name }}</div>
          </ul>
        </div>
        <div
          style="border-right: 2px solid rgb(166, 166, 166);margin: 10px;width: 25vw;background-color: white;min-height: 400px;padding: 10px;max-height: 400px;overflow-y: auto;box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;">
          <div
            style="padding: 5px;border-radius: 5px;background-color: rgba(211, 211, 211, 0.733);width: 100%;font-weight: bold;">
            Selectionner une catégorie:</div>
          <ul>
            <div :class="{ 'selected': selected_cat === cat.name }" class="choose_li" style="cursor: pointer;"
              v-for="cat in cat_list" :key="cat.name" @click="emitValue('cat', cat); selected_cat = cat.name">{{
      cat.name }}</div>
          </ul>
        </div>
        <div
          style="margin: 10px;width: 25vw;background-color: white;min-height: 400px;padding: 10px;max-height: 400px;overflow-y: auto;box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;">

          <div
            style="padding: 5px;border-radius: 5px;background-color: rgba(211, 211, 211, 0.733);width: 100%;font-weight: bold;">
            Selectionner un groupe:</div>
          <ul>

            <div :class="{ 'selected': selected_grp.includes(grp.name) }" class="choose_li" v-for="grp in grp_list"
              :key="grp.name"><label style="cursor: pointer;" @click="toggleSelection(grp.name)" :for="grp.name">{{
      grp.name }}</label></div>

            <!-- <v-checkbox v-for="grp in grp_list" :key="grp.name" style="cursor: pointer;height: 30px;color: black;" color="" class="choose_li"
              :label="grp.name"></v-checkbox> -->
          </ul>
        </div>
        <div @click="showSelection = !showSelection"
          style="cursor:pointer; position:relative; top: -10px; right: -10px;height: 21px;width: 21px;border-radius: 20px;background-color: white; display: flex;justify-content: center;align-items: center;font-weight: bold;">
          X</div>
      </div>
      <div style="width: 78%;display: flex; justify-content: flex-end">

        <div @click="showSelection = !showSelection"
          style="cursor: pointer;border-radius: 5px;display: flex;justify-content: center;align-items: center;background-color: white;border: 1px solid #14202c;position: relative;width: 100px;height: 40px;transform: translate(0,-150%);color: #14202c;margin: 10px;">
          Annuler</div>
        <div @click="validate"
          style="cursor: pointer;border-radius: 5px;display: flex;justify-content: center;align-items: center;background-color: #14202c;position: relative;width: 100px;height: 40px;transform: translate(0,-150%);color: white;margin: 10px;">
          Valider</div>
      </div>
    </div>

    <div style="width: 100%; display: flex; margin-top: 10px; position: relative;">
      <div
        style="margin-left: 2px; z-index: 10; position: absolute; width: calc(100% - 70px - 10px); border-radius: 5px; background-color: rgb(255, 255, 255);">

        <div class="mouse" @click="showattribut = !showattribut" style="">
          <v-icon v-if="!showattribut" color="black" style="font-size: 2em">mdi-chevron-down</v-icon>
          <v-icon v-else color="black" style="font-size: 2em">mdi-chevron-up</v-icon>
          <div v-if="!keyselected[0]">Selectionner des attributs.</div>
          <!-- <div>{{ showelement() }}</div> -->
          <!-- {{ showelement(this.keyselected) }} -->
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
    </div>

    <div style="padding: 2px;" class="scrollable-table-container">

      <v-data-table id="my-data-table" ref="table" @click="selectDataView" class="fixed-first-column"
        style="box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;margin-top: 65px ;overflow: auto;max-height: 75vh; background: transparent !important;overflow: hidden;"
        mobile-breakpoint="0" no-data-text="Pas de données disponibles" :headers="dynamicHeaders()"
        :items="filteredContextsV" :items-per-page="8000" height="74vh" fixed-header>

        <!-- ajout du mode select -->
        <template v-for="header in dynamicHeaders()" v-slot:[`header.${header.value}`]="{ header }">
          <div
            style="display: flex;flex-direction: row;justify-content: space-between; align-items: center ; height: 40px;">
            <div style="width: 35px; overflow: hidden;  transform: translate(-10px,-3px); ">
              <v-select v-model="selections[header.text]" :menu-props="{ offsetY: true }" :label="' '" multiple
                append-icon="mdi-chevron-down" color="#14202C" item-color="#14202C" class=" d-inline-block"
                style="width:20px;min-width: 20px;font-size: 14px !important;transform: translate(-5%,10%) ;"
                v-if="header.filterable" :items="getUniqueColumnValues(filteredContexts, header.text)">
                >
                <template v-slot:selection="{ item, index }">
                  <div v-if="index == 0"
                    style="position: absolute;background-color: #14202c;color: white;border-radius: 10px;width: 16px;height: 16px;font-size: 11px;display: flex;justify-content: center;align-items: center;transform: translate(20px,-10px);">
                    {{ selections[header.text].length }} </div>
                </template>

              </v-select>
            </div>
            <span id="headerName">{{ header.text }}</span>
            <div style=" width: 30px;display: flex;justify-content: center;align-items: center;">
              <v-icon @click="filtercolumn(header)" color="black">mdi-arrow-up-thin</v-icon>

            </div>
            <div
              style="border-right: 2px solid #d9d9d9;height: 100%;background-color: red;position: absolute;transform: translate(-16px);">
            </div>
          </div>
        </template>

        <template v-slot:item="{ item }">
          <tr @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" :ref="`row-${item.dynamicId}`"
            @click="selectDataView(item)">
            <td :class="selected_id == item.dynamicId ? 'colortd' : ''">{{ item.name }}</td>
            <td style="white-space: nowrap;" :class="selected_id == item.dynamicId ? 'colortd' : ''"
              v-for="(header, index) in dynamicHeaders()" :key="`td-${index}-${item.id}`"
              v-if="header.value !== 'name'">
              {{ getAttributeValue(item, header.value) }}
            </td>
          </tr>
        </template>

      </v-data-table>
    </div>
    <div class="blur-background" @click="importAttr = !importAttr" v-if="importAttr">
      <div @click.stop
        style="background-color: white;width: auto;height: 400px;left: 50%;top:50%;position: relative;transform: translate(-50%,-50%);border-radius: 5px;">
        <div style="background-color: rgb(228, 228, 228);width: 100%;height: 50px;"></div>
        <input type="checkbox" id="checkbox" v-model="checked" />
        <label for="checkbox">Comparer avec la totalités les attribut du tableau </label>
        <div v-if="this.keyselected.length == undefined">{{ this.difference_data }}</div>
        <SpinalComparaison :dataTab="difference_data"></SpinalComparaison>
        <v-icon color="green" v-if="fileIsLoaded">mdi-check</v-icon>
        <input type="file" @change="handleFileUpload">
      </div>
    </div>

  </div>
</template>


<script>
import SpinalExcelManager from 'spinal-env-viewer-plugin-excel-manager-service'
import SmallLegend from './SmallLegend.vue';
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { Prop, Vue, Watch } from "vue-property-decorator";
import { PAGE_STATES } from "../../interfaces/pageStates";
import Component from "vue-class-component";
import { IConfig } from "../../interfaces/IConfig";
import lodash from "lodash";
import { State } from "vuex-class";
import { mapState } from "vuex";
import SpinalComparaison from './SpinalComparaison.vue';
import { exit } from 'process';
export default {
  components: {
    SmallLegend,
    SpinalComparaison
  },
  props: ['contexts', 'temporality', 'unit', 'label', 'reference', 'selectedItemTab', 'ctx_list', 'cat_list', 'grp_list'],
  data: () => ({
    selections: {},
    filters: {},
    tableData: [],
    selectedCategory: [],
    selectedAttribute: null,
    filteredAttributes: [],
    filteredItem: [],
    treeData: [],
    selectedKeys: [],
    keyselected: {},
    showattribut: false,
    selected_id: null,
    importAttr: false,
    fileIsLoaded: false,
    checked: false,
    selected_ctx: "",
    selected_grp: [],
    selected_cat: "",
    showSelection: true,
    difference_data: [],
    allFilteredData: [],
    currentfilter: null
  }),
  mounted() {
    this.extractData();
    this.$nextTick(() => {
      const headers = document.querySelectorAll('#my-data-table .v-data-table-header ');
      headers.forEach(header => {
        header.addEventListener('click', (e) => {
          this.onHeaderClick(e.target.textContent.trim());
        });
      });
    });
  },
  computed: {

    elementsToShow() {
      return this.keyselected.map(obj => obj.childName);
    },

    objToArray() {
      let data = this.contexts[0].nomenclature
      if (data) {
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            array = array.concat(data[key]);
          }
        }
        this.treeData = array
      }
      else
        this.treeData = []
    },
    treeviewItems() {
      const nomenclatureObj = this.contexts[0].nomenclature;
      const items = Object.entries(nomenclatureObj)?.map(([key, value], index) => {
        return {
          id: key + index,
          name: key,
          children: value?.map((item, itemIndex) => ({
            id: `${key}-${itemIndex}`,
            name: item,
          }))
        };
      });

      return items;
    },

    filteredContexts() {
      if (this.contexts) {
        return this.contexts[0]?.data;
      }
    },
    filteredContextsV() {
      console.log('LOG ??? NBR ------');
      if (this.contexts && this.contexts[0]?.data) {
        Object.keys(this.selections).forEach(key => {
          if (Array.isArray(this.selections[key]) && this.selections[key].length === 0) {
            delete this.selections[key];
          }
        });

        if (Object.keys(this.selections).length === 0) {
          let allFilteredData = this.contexts[0]?.data;


          this.$emit('allFiltredData', allFilteredData);

          if (this.currentfilter) {
            console.warn('PAssage 1');
            return this.sortDataByAttribute(this.currentfilter, [...allFilteredData])
          } else
            return this.contexts[0]?.data;
        }

        const criteria = Object.entries(this.selections).map(([key, values]) => {
          const [label, category] = key.split('/');
          return { label, category, values };
        });

        let allFilteredData = [];

        criteria.forEach((criterion, index) => {
          const filteredDataForCriterion = this.contexts[0].data.filter(object => {
            const category = object.categoryAttributes.find(cat => cat.name === criterion.category);
            return criterion.values.some(value => {
              if (value === "<empty>") {
                if (!category || !category.attributs.some(attr => attr.label === criterion.label)) {
                  return true;
                }
                const attribute = category.attributs.find(attr => attr.label === criterion.label);
                return !attribute || attribute.value === "";
              } else {
                return category && category.attributs.some(attr => attr.label === criterion.label && attr.value === value);
              }
            });
          });
          if (index === 0) {
            allFilteredData = filteredDataForCriterion;
          } else {
            allFilteredData = allFilteredData.filter(item => filteredDataForCriterion.includes(item));
          }
        });

        this.$emit('allFiltredData', allFilteredData);

        if (this.currentfilter && allFilteredData != []) {
          console.warn('PAssage 2');
          return this.sortDataByAttribute(this.currentfilter, [...allFilteredData])
        } else
          return allFilteredData;
      }
    }

  },
  methods: {
    filtercolumn(item) {
      console.log(item.text);
      this.currentfilter = item.text
    },

    sortDataByAttribute(categoryAttributePair, dataArray) {
      const [attributeName, categoryName] = categoryAttributePair.split('/');
      console.log(categoryName, attributeName);

      dataArray.sort((a, b) => {
        const findAttributeValue = (item) => {
          const category = item.categoryAttributes.find(cat => cat.name === categoryName);
          const attribute = category?.attributs.find(attr => attr.label === attributeName);
          return attribute ? attribute.value : '';
        };

        const aValue = findAttributeValue(a);
        const bValue = findAttributeValue(b);

        // Comparaison numérique si les deux valeurs sont des nombres
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return Number(aValue) - Number(bValue);
        }

        // Tri alphabétique dans les autres cas
        return aValue.localeCompare(bValue);
      });

      console.warn(dataArray);
      return dataArray;
    },

    deleteAttrSelected(item) {
      let selectedKeys = this.selectedKeys
      if (item.parentName === item.childName) {
        this.selectedKeys = selectedKeys.filter(key => !key.startsWith(item.parentName));
      } else {
        const childIndex = this.contexts[0].nomenclature[item.parentName].indexOf(item.childName);
        if (childIndex !== -1) {
          const keyToRemove = `${item.parentName}-${childIndex}`;
          this.selectedKeys = this.selectedKeys.filter(key => key !== keyToRemove);
        }
      }
    },

    getUniqueColumnValues(context, columnName) {
      const [attributeName, categoryName] = columnName.split('/');
      const uniqueValues = new Set();
      let attributeNotFound = false;

      context.forEach(item => {
        let foundInItem = false;

        item.categoryAttributes.forEach(category => {
          if (category.name === categoryName) {
            category.attributs.forEach(attribute => {
              if (attribute.label === attributeName) {
                uniqueValues.add(attribute.value);
                foundInItem = true;
              }
            });
          }
        });

        if (!foundInItem) {

          attributeNotFound = true;
        }
      });

      if (attributeNotFound) {
        uniqueValues.add("<empty>");
      }

      return uniqueValues.size >= 10 ? [] : [...uniqueValues];
    }
    ,

    applyFilters() {
      this.filteredContexts = this.contexts.filter(item => {
        return Object.keys(this.filters).every(filterKey => {
          const filterValue = this.filters[filterKey];
          if (!filterValue) return true;
          return item[filterKey] === filterValue;
        });
      });
    },
    tarrr(i) {
      this.selected_grp.splice(i, 1);
      this.validate();
    },

    showelement() {
      return this.keyselected.map(obj => obj.childName);
    },

    breadcrumbsItems() {
      return [
        { text: this.selected_ctx, disabled: false },
        { text: this.selected_cat, disabled: false },
        { text: this.selected_grp, disabled: false },
      ];
    },

    validate() {
      this.emitValue('grp', this.selected_grp);
      this.showSelection = false;
    },

    emitValue(listType, value) {
      this.$emit('itemSelected', { listType, value });
    },
    toggleSelection(groupName) {
      const index = this.selected_grp.indexOf(groupName);
      if (index === -1) {
        this.selected_grp.push(groupName);
      } else {
        this.selected_grp.splice(index, 1);
      }
    },


    findDifferencesByStaticId(array1, array2) {
      let differences = [];
      array1.forEach(a1 => {
        const a2 = array2.find(a2 => a2.staticId === a1.staticId);
        if (a2) {
          let diff = {};
          let keys = new Set([...Object.keys(a1), ...Object.keys(a2)]);
          keys.forEach(key => {
            if (a1[key] !== a2[key]) {
              diff[key] = { from: a1[key], to: a2[key] };
            }
          });
          if (Object.keys(diff).length > 0) {
            differences.push({ staticId: a1.staticId, name: a1.Nom, differences: diff });
          }
        }
      });
      return differences;
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      this.extractData();
      if (file) {
        this.fileIsLoaded = true;
        const loaded = (await SpinalExcelManager.convertExcelToJson(file))['sheet 1'];
        if (this.checked != true) {
          this.tableData = this.contexts[0].data?.map(item => {
            const dataForRow = {
              dynamicId: item.dynamicId,
              staticId: item.staticId,
              Nom: item.name,
            };

            item.categoryAttributes.forEach(category => {
              category.attributs.forEach(attr => {
                const attrKey = `${attr.label}/${category.name}`;
                dataForRow[attrKey] = attr.value;
              });
            });

            return dataForRow;
          });
          this.$store.commit(MutationTypes.SET_DLDATA, this.tableData);
        }

        const dldata = this.$store.state.appDataStore.dlData
        this.difference_data = this.findDifferencesByStaticId(loaded, dldata);
      }
    },


    handleMouseEnter(event) {
      const children = event.target.querySelectorAll('.colortd');
      children.forEach(child => {
        child.classList.add('custom-hover-color');
      });
    },
    handleMouseLeave(event) {
      const children = event.target.querySelectorAll('.colortd');
      children.forEach(child => {
        child.classList.remove('custom-hover-color');
      });
    },

    onHeaderClick(headerName) {
      // console.log(headerName.length, 'toto');
      if (headerName.length > 0)
        this.$store.commit(MutationTypes.SET_ATTR, headerName);
    },

    extractData() {
      const dynamicHeaders = this.dynamicHeaders()?.map(header => header.text);
      const { filteredContexts } = this;
      if (this.$store.state.appDataStore.dl_data_option == false || this.checked == true) {

        this.tableData = filteredContexts?.map(item => {
          const dataForRow = {};
          dynamicHeaders.forEach(header => {
            dataForRow['dynamicId'] = item.dynamicId;
            dataForRow['staticId'] = item.staticId;
            if (header.includes('Nom')) {
              dataForRow['Nom'] = item.name;
            } else {
              const attributeValue = this.getAttributeValueDL(item, header);
              dataForRow[header] = attributeValue;
            }
          });
          return dataForRow;
        });

      } else {
        this.tableData = filteredContexts?.map(item => {

          const dataForRow = {
            dynamicId: item.dynamicId,
            staticId: item.staticId,
            Nom: item.name,
          };

          item.categoryAttributes.forEach(category => {
            category.attributs.forEach(attr => {
              const attrKey = `${attr.label}/${category.name}`;
              dataForRow[attrKey] = attr.value;
            });
          });

          return dataForRow;
        });
      }
      this.ChipKeySlected();
      this.$store.commit(MutationTypes.SET_DLDATA, this.tableData);
    },

    getAttributeValueDL(item, attrLabel) {
      const [childName, parentName] = attrLabel.split('/');
      const category = item.categoryAttributes.find(cat => cat.name === parentName);
      if (category) {
        const attribute = category.attributs.find(a => a.label === childName);
        if (attribute) {
          return attribute.value;
        }
      }
      return '';
    },

    getAttributeValue(item, attrLabel) {
      for (const category of item.categoryAttributes) {
        const attribute = category.attributs.find(a => a.label === attrLabel);
        if (attribute) {
          return attribute.value;
        }
      }
      return '';
    },

    selectDataView(item) {
      console.log('dzada  dzza');
      this.selected_id = item.dynamicId
      this.$emit('item-selected', item);
    },
    ChipKeySlected() {
      const headers = [
        { text: 'Nom', value: 'name', sortable: true, filtrable: true, filtrable: true },
      ];
      const selectedItems = this.selectedKeys?.map(key => {
        const foundItem = this.treeviewItems?.find(item =>

          item.children && item.children.find(child => child.id === key)
        );
        if (foundItem) {
          const foundChild = foundItem.children.find(child => child.id === key);

          return {
            parentName: foundItem.name,
            childName: foundChild ? foundChild.name : null
          };
        }

        return null;
      }).filter(item => item && item.childName !== null);
      selectedItems.forEach(({ parentName, childName }) => {
        headers.push({ text: `${childName}/${parentName}`, value: childName, filtrable: true });
      });

      let parentCounts = {};
      let optimizedItems = [];

      if (!this.contexts) {
        return
      }
      let nomenclature = this.contexts[0].nomenclature

      selectedItems.forEach(item => {
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
        if (nomenclature[parentName] && nomenclature[parentName].length === parentInfo.count && nomenclature[parentName].every(child => parentInfo.children.includes(child))) {
          optimizedItems.push({ parentName, childName: parentName });
        } else {
          parentInfo.children.forEach(childName => optimizedItems.push({ parentName, childName }));
        }
      }
      this.keyselected = optimizedItems;

    },

    dynamicHeaders() {
    
      let headers = [{ text: 'Nom', value: 'name', sortable: true }];

      const selectedItems = this.selectedKeys?.map(key => {
        const foundItem = this.treeviewItems.find(item =>
          item.children && item.children.find(child => child.id === key)
        );
        if (foundItem) {
          const foundChild = foundItem.children.find(child => child.id === key);
          return {
            parentName: foundItem.name,
            childName: foundChild ? foundChild.name : null
          };
        }
        return null;
      }).filter(item => item && item.childName !== null);

      selectedItems.forEach(({ parentName, childName }) => {
        // Assurez-vous de ne pas ajouter un en-tête pour 'Nom' s'il existe déjà comme childName
        if (childName !== 'name') {
          headers.push({ text: `${childName}/${parentName}`, value: childName, filterable: true });
        }
      });

      return headers;
    }


  },
  watch: {

    allFilteredData(newVal, oldVal) {
      this.$emit('allFiltredData', newVal);
    },

    // contexts(newVal, oldVal){
    //   console.log('modification ?');
    // },

    '$store.state.appDataStore.dl_data_option': {
      handler(newValue, oldValue) {
        this.extractData();
      },
      deep: true,
      immediate: false,
    },


    selectedItemTab(newVal, oldVal) {
      this.selected_id = newVal
      if (this.$refs[`row-${newVal}`]) {
        this.$refs[`row-${newVal}`].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },

    selectedKeys(newVal, oldVal) {
      this.extractData();
      const resultat = {};
      newVal.forEach(s => {
        const dernierTiretIndex = s.lastIndexOf("-");
        const nom = s.substring(0, dernierTiretIndex);
        const numero = s.substring(dernierTiretIndex + 1);

        if (!resultat[nom]) {
          resultat[nom] = [];
        }
        resultat[nom].push(numero);
      });
      console.log(resultat, 'toto');
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
        this.contexts[0].data.forEach(context => {
          const category = context.categoryAttributes.find(cat => cat.name === this.selectedCategory);
          if (category) {
            const filteredAttributess = category.attributs.filter(attr => attr.label === newVal);
            filteredAttributess.forEach(attr => {
              allValues.push(attr.value);
            });
          }
        });
        this.filteredItem = Array.from(new Set(allValues));
      } else {
        this.filteredItem = [];
      }
    }
  }
}
</script>

<style scoped>
.blue-background {
  background-color: #14202c !important;
  color: white !important;
}


/* #my-data-table > div.v-data-table__wrapper > table > thead > tr {
  background-color: red !important;
} */

::v-deep .v-text-field.v-input--is-focused>.v-input__control>.v-input__slot:after {
  color: rgba(255, 255, 255, 0) !important;
}

::v-deep .theme--light.v-text-field>.v-input__control>.v-input__slot:before {
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

.selected {
  background-color: #e9e9e98f;
  border-radius: 5px;
  border: 1px solid #14202c;
}

.choose_li {
  margin: 5px;
  padding: 5px;
}

.choose_li:hover {
  background-color: rgb(229, 229, 229);
  border-radius: 5px;
}

::v-deep .v-data-table__wrapper>table>thead>tr>th:nth-child(1) {
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

/* ::v-deep div.v-data-table__wrapper > table > thead > tr > th:nth-child(2) > i{
  display: none;
} */
::v-deep div.v-data-table__wrapper>table>thead>tr>th>i {
  display: none;
}


.mouse {
  width: 102.5%;
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
  /* padding-right: 0px; */
}

.animate {
  -webkit-animation: scale-in-ver-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  animation: scale-in-ver-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
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


::v-deep v-treeview-node v-treeview-node--leaf {
  background-color: red !important;
}

::v-deep [data-v-716848] v-treeview-node v-treeview-node--leaf,
[data-v-716848] .v-treeview-node__children {
  background-color: red !important;
}

.my-custom-treeview .v-treeview-node__children {
  background-color: #b90202;
  padding-left: 20px;
}

#app .v-treeview-node__children {
  background-color: #b82c2c;
}

/* Ou en répétant la classe pour augmenter la spécificité */
.v-treeview-node__children.v-treeview-node__children {
  background-color: #ae1a1a;
}

::v-deep .v-treeview-node__children {
  /* Vos styles ici */
  padding-left: 20px
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

.v-data-table__wrapper>table>thead>tr>th:nth-child(1) {
  background-color: red !important;
}

.fixed-first-column tbody td:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
}

::v-deep .v-data-table__wrapper>table>tbody>tr:nth-child(1)>td:nth-child(1) {
  position: sticky;
  left: 0;
  z-index: 1;
}


.scrollable-table-container {
  overflow-x: auto;

}

.fixed-first-column thead th:first-child,
.fixed-first-column tbody td:first-child {
  /* width: 150px; */
}


.fixed-first-column thead th:first-child {
  position: sticky;
  left: 0;
  z-index: 2;
  background-color: white;
}


.select-attr {
  -webkit-animation: fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
  animation: fade-in 1.2s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
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
  color: #14202C;
  opacity: 1;
  box-shadow: none !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.text-success {
  color: rgb(14, 165, 14);
}

.text-danger {
  color: red;
}

.hover-magnify {
  display: flex;
  justify-content: center;
  align-items: center;
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
  color: #14202C !important;
  background-color: #F4F4F4;
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

::v-deep .v-text-field.v-input--is-focused>.v-input__control>.v-input__slot:after {
  color: #214353;
}

::v-deep .v-list-item--link:before {
  background-color: #1500ff !important;
}

::v-deep .v-application .primary--text {
  color: #14202C !important;
  caret-color: #14202C !important;
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

::v-deep tr>th:first-child {
  border-top-left-radius: 10px !important;
}

::v-deep tr>th:last-child {
  border-top-right-radius: 0px !important;
}

::v-deep tr>td.text-start {
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

/* Track */
::v-deep .v-data-table__wrapper::-webkit-scrollbar-track {
  background: #ffffff;

}

/* Handle */
::v-deep .v-data-table__wrapper::-webkit-scrollbar-thumb {
  background: #e8e8e8;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border: 1px solid rgb(195, 195, 195);
  transition: 1s;
}

/* Handle on hover */
::v-deep .v-data-table__wrapper::-webkit-scrollbar-thumb:hover {
  background: #dedede;
}





.breadcrumbs {
  border: 1px solid #cbd2d9;
  border-radius: 0.3rem;
  display: inline-flex;
  overflow: hidden;
}

.breadcrumbs__item {
  background: #fff;
  color: #333;
  outline: none;
  padding: 0.75em 0.75em 0.75em 1.25em;
  position: relative;
  text-decoration: none;
  transition: background 0.2s linear;
  justify-content: center;
  display: flex;
  align-items: center;
}

.breadcrumbs__item_chips {
  background: #fff;
  color: #333;
  outline: none;
  padding: 0.75em 0.75em 0.75em 1.25em;
  position: relative;
  text-decoration: none;
  transition: background 0.2s linear;

}

.breadcrumbs__item:hover:after,
.breadcrumbs__item:hover {
  background: #edf1f5;
}

.breadcrumbs__item:focus:after,
.breadcrumbs__item:focus,
.breadcrumbs__item.is-active:focus {
  background: #323f4a;
  color: #fff;
}

.breadcrumbs__item:after,
.breadcrumbs__item:before {
  background: white;
  bottom: 0;
  clip-path: polygon(50% 50%, -50% -50%, 0 100%);
  content: "";
  left: 100%;
  position: absolute;
  top: 0;
  transition: background 0.2s linear;
  width: 1em;
  z-index: 1;
}

.breadcrumbs__item:before {
  background: #cbd2d9;
  margin-left: 1px;
}

.breadcrumbs__item:last-child {
  border-right: none;
}

.breadcrumbs__item.is-active {
  background: #edf1f5;
}
</style>