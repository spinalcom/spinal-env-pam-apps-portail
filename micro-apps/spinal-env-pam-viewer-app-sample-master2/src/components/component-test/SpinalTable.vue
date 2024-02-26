<template>
  <div class="main-tab"
    style=" width: 100%; font-size: 14px !important;background-color: rgb(255, 255, 255);border-radius: 10px !important;border-color: black !important;">

    <div style="width: 100%;display: flex;justify-content: center;margin-top: 10px;">
      <div class="hauteur"
        style="padding: 10px;z-index: 10;width: 97.5%; position: absolute;border-radius: 5px;background-color: rgb(255, 255, 255);box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;border: 1px solid rgb(206, 206, 206);">
        <div class="mouse" @click="showattribut = !showattribut" style="">
          <v-icon v-if="!showattribut" color="black" style="font-size: 2em">mdi-chevron-down</v-icon>
          <v-icon v-else color="black" style="font-size: 2em">mdi-chevron-up</v-icon>
          Attribut
          <!-- <div @click.stop="importAttr = !importAttr"
            style="position: absolute; right :20px;border: 1px solid black;border-radius: 5px;">
            <v-icon title="import" color="black" style="font-size: 2em">mdi-file-upload</v-icon>
          </div> -->
        </div>

        <div>
          <v-treeview class="my-custom-treeview animate" v-if="showattribut"
            style="width: 100%;padding-left: 20px;user-select: none;" v-model="selectedKeys" selectable
            item-disabled="locked" :items="treeviewItems"></v-treeview>
        </div>
      </div>
    </div>
    <div style="padding: 10px;" class="scrollable-table-container">
      <v-data-table id="my-data-table" ref="table" @click="selectDataView" class="fixed-first-column"
        style="box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;height: 90%;margin-top: 80px ;overflow: auto;max-height: 80vh; background: transparent !important;"
        mobile-breakpoint="0" no-data-text="Pas de données disponibles" :headers="dynamicHeaders()"
        :items="filteredContexts" :items-per-page="8000" height="78vh" fixed-header>

        <template v-slot:item="{ item }">
          <tr @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave" :ref="`row-${item.dynamicId}`"
            @click="selectDataView(item)">
            <td :class="selected_id == item.dynamicId ? 'colortd' : ''">{{ item.name }}
            </td>
            <td style="
                white-space: nowrap;
                " :class="selected_id == item.dynamicId ? 'colortd' : ''" v-for="(header, index) in dynamicHeaders()"
              :key="`td-${index}-${item.id}`" v-if="header.value !== 'name'">
              {{ getAttributeValue(item, header.text) }}
            </td>
          </tr>
        </template>

      </v-data-table>

    </div>



    <div class="blur-background" @click="importAttr = !importAttr" v-if="importAttr">
      <div @click.stop
        style="background-color: white;width: 500px;height: 400px;left: 50%;top:50%;position: relative;transform: translate(-50%,-50%);border-radius: 5px;">
        <div style="background-color: rgb(228, 228, 228);width: 100%;height: 50px;"></div>

        <input type="checkbox" id="checkbox" v-model="checked" />
        <label for="checkbox">Comparer avec la totalités des attributs </label>

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

export default {
  components: {
    SmallLegend,
  },
  props: ['contexts', 'temporality', 'unit', 'label', 'reference', 'selectedItemTab'],
  data: () => ({
    tableData: [],
    // selectedFloors: [],
    selectedCategory: [],
    selectedAttribute: null,
    filteredAttributes: [],
    filteredItem: [],
    treeData: [],
    selectedKeys: [],
    showattribut: false,
    selected_id: null,
    // isHovered: false,
    importAttr: false,
    fileIsLoaded: false,
    checked: false,

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
      return this.contexts[0]?.data;
    },

  },
  methods: {


    // compareObjects(obj1, obj2) {
    //   const keys1 = Object.keys(obj1);
    //   const keys2 = Object.keys(obj2);
    //   const allKeys = [...new Set([...keys1, ...keys2])];
    //   const differences = {};

    //   allKeys.forEach(key => {
    //     if (obj1[key] !== obj2[key]) {
    //       differences[key] = { from: obj1[key], to: obj2[key] };
    //     }
    //   });

    //   return differences;
    // },

    // compareArrays(array1, array2) {
    //   const differences = [];
    //   array1.forEach(obj1 => {
    //     array2.forEach(obj2 => {
    //       const objDifferences = this.compareObjects(obj1, obj2);
    //       if (Object.keys(objDifferences).length > 0) {
    //         differences.push({ obj1, obj2, differences: objDifferences });
    //       }
    //     });
    //   });

    //   return differences;
    // },

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
            differences.push({ staticId: a1.staticId, differences: diff });
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

        const dldata = this.$store.state.appDataStore.dlData

        console.log(this.$store.state.appDataStore.dlData);
        console.log('file', loaded);

        // console.log(this.checked, 'aaaaaaaaaaaaaaaaaaaaaa');
        if (this.checked == true) {
          console.log(this.contexts[0].data , 'aaaaaaaaaaaaaaa');

        }

        console.log(this.findDifferencesByStaticId(loaded, dldata));
        // compareArrays(loaded , dldata)
        // this.uploadFile(file);
      }
    },
    test() {
      console.log('rayane');

      console.log(this.$store.state.appDataStore.dlData);
    },

    handleMouseEnter(event) {
      const children = event.target.querySelectorAll('.colortd');
      children.forEach(child => {
        child.classList.add('custom-hover-color');
        console.log('ici0, child', child);
      });
    },
    handleMouseLeave(event) {
      const children = event.target.querySelectorAll('.colortd');
      children.forEach(child => {
        child.classList.remove('custom-hover-color');
      });
    },

    onHeaderClick(headerName) {
      console.log('Header cliqué:', headerName);
      this.$store.commit(MutationTypes.SET_ATTR, headerName);
    },

    extractData() {
      const dynamicHeaders = this.dynamicHeaders()?.map(header => header.text);
      const { filteredContexts } = this;
      this.tableData = filteredContexts?.map(item => {
        const dataForRow = {};
        dynamicHeaders.forEach(header => {
          if (header === 'Nom') {
            dataForRow[header] = item.name;
          } else {
            dataForRow[header] = this.getAttributeValue(item, header) || item[header];
          }
        });

        dataForRow['dynamicId'] = item.dynamicId
        dataForRow['staticId'] = item.staticId
        return dataForRow;
      });
      this.$store.commit(MutationTypes.SET_DLDATA, this.tableData);

    },

    getAttributeValue(item, attrLabel) {
      for (const category of item.categoryAttributes) {
        const attribute = category.attributs.find(a => a.label === attrLabel);
        if (attribute) {
          return attribute.value;
        }
      }
      return '';
    }
    ,

    selectDataView(item) {
      this.selected_id = item.dynamicId
      this.$emit('item-selected', item);
    },

    dynamicHeaders() {
      const headers = [
        { text: 'Nom', value: 'name', sortable: true },
      ];

      const selectedNames = this.selectedKeys?.map(key => {
        const foundItem = this.treeviewItems.find(item =>
          item.children && item.children.find(child => child.id === key)
        );
        return foundItem ? foundItem.children.find(child => child.id === key).name : null;
      }).filter(name => name !== null); // Filtrer les éventuels null

      selectedNames.forEach(name => {
        headers.push({ text: name, value: name, sortable: true });
      });
      return headers;
    },
  },
  watch: {

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

        // Parcourir chaque élément dans le tableau contexts
        this.contexts[0].data.forEach(context => {
          // Trouver la catégorie sélectionnée dans chaque objet de data
          const category = context.categoryAttributes.find(cat => cat.name === this.selectedCategory);

          if (category) {
            // Filtrer les attributs pour obtenir ceux qui correspondent à newVal
            const filteredAttributess = category.attributs.filter(attr => attr.label === newVal);

            // Extraire les valeurs et les ajouter au tableau allValues
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
  background-color: rgb(100, 206, 255) !important;
  /* Utilisez `!important` uniquement si nécessaire */
}

tr .colortd.custom-hover-color {
  background-color: rgb(100, 206, 255) !important;
}

::v-deep .custom-hover-color {
  background-color: rgb(100, 206, 255) !important;
}

.colortd {
  background-color: rgb(201, 232, 255);
}

/* .colortd:hover {
  background-color: rgb(156, 199, 229) !important;
} */

td {
  min-width: 150px;
}

.fixed-first-column table {
  position: relative;

}

::v-deep .v-data-footer {
  display: none;
}



.mouse {
  width: 100%;
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

/* .mouse:hover {
  background-color: rgb(238, 238, 238);
  border: 1px solid rgb(83, 83, 83);
} */

/* .v-application--is-ltr .v-data-table>.v-data-table__wrapper>table>thead>tr>th:nth-child(1)::v-deep {
  background-color: red !important;
} */

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

.scrollable-table-container {
  overflow-x: auto;

}

.fixed-first-column thead th:first-child,
.fixed-first-column tbody td:first-child {
  width: 150px;
  /* ou la largeur que vous souhaitez */
}


.fixed-first-column thead th:first-child {
  position: sticky;
  left: 0;
  z-index: 2;
  /* Assurez-vous que cela est au-dessus du corps du tableau */
  background-color: white;
  /* ou la couleur de votre choix */
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
</style>