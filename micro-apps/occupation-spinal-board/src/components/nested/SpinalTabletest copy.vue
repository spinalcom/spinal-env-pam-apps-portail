<template >
  <div class="main-tab"
    style="width: 100%; max-height: 295px;min-height: 295px; font-size: 14px !important;background-color: white;border-radius: 10px !important;border-color: black !important;">
    <span C class="v-card__title card-title pa-3 text-uppercase justify-space-between mb-6 ml-1 mt-2">{{
      title }}</span>
    <v-data-table style="height: 100%; background: transparent !important;" mobile-breakpoint="0"
    no-data-text="Pas de données disponibles" :headers="dynamicHeaders()" :items="filteredContexts" :items-per-page="9"
    fixed-header :footer-props="{
      'color': '#000',
      'items-per-page-text': '',
      'page-text': '',
    }">
    <template v-for="header in headers" v-slot:[`header.${header.value}`]="{ header }">
        <v-select  multiple chips :items="selectOptions(header)" class="d-inline-block no-underline"
          v-model="selectedFloors" :label="header.text" dense v-if="header.filtrable"/>
        <span v-else >{{ header.text }}</span>
    </template>

    <template class="d-flex justify-center" v-slot:[`item.presence`]="{ item }">
      <div style="left:50%;" class="d-flex align-center align-items-center ">
        <v-badge style="margin-top: 11px;" :color="item.presence ? 'red' : 'green'" class="mr-6 d-flex justify-center">
          <v-icon size="l" icon="mdi-vuetify"></v-icon>
        </v-badge>
        <span :class="{ 'text-success': !item.presence, 'text-danger': item.presence }">
          {{ item.presence ? 'Occupé' : 'Disponible' }}
        </span>
      </div>
    </template>
    
    <template v-for="header in headers" v-slot:[`item.${header.value}`]="{ item }">
      {{ item[header.value] }} {{ header.unit }}
    </template>
  </v-data-table>
  </div>
</template>

<script>
import SmallLegend from './SmallLegend.vue';
export default {
  components: {
    SmallLegend,
  },
  props: ['context', 'temporality', 'unit', 'label', 'reference', 'title', 'tab', 'headers'],
  data: () => ({
    selectedFloors: [],
    formattedHeaders: [],
  }),
  computed: {
    filteredContexts() {
      if (this.selectedFloors.length === 0) {
        return this.roundedContext();
      }
      return this.roundedContext().filter(context => {
        const contextValues = Object.values(context);
        const isIncluded = contextValues.some(value => this.selectedFloors.includes(value));
        return isIncluded;
      });
    },

    floors() {
      return [...new Set(this.context.map((context) => context.floor))];
    },
  },
  methods: {
    selectOptions(header) {
      const column = this.context.map(item => item[header.value]);
      const uniqueValues = [...new Set(column)];
      const roundedValues = uniqueValues.map(value => {
        if (typeof value === 'number') {
          return parseFloat(value.toFixed(2));
        } else {
          return value;
        }
      });
      return roundedValues;
    },
    dynamicHeaders() {
      return this.headers.map((header, index) => {
        const updatedHeader = { ...header };
        if (header.value === 'presence') {
          updatedHeader.text = 'Présence (Occupé/Disponible)';
        }
          updatedHeader.align = 'center';
          return updatedHeader;
      });
    },
    roundedContext() {
      return this.context.map(item => {
        const newItem = { ...item };
        Object.keys(newItem).forEach(key => {
          if (typeof newItem[key] === 'number') {
            newItem[key] = parseFloat(newItem[key].toFixed(2));
          }
        });
        return newItem;
      });
    }

  },
}
</script>

<style scoped>

::v-deep .v-select__slot::before {
  display: none !important;
  background-color: red;
}


::v-deep > div.v-input__slot::before{
  
}

.no-underline .v-input__slot::before,
.no-underline .v-input__slot::after {
    border-bottom: none !important;
}

/* ::v-deep .v-select__slot {
  text-align: right;
}

::v-deep .v-input.row-class.my-custom-select {
  margin-right: 0;
}

.v-icon.notranslate.v-data-table-header__icon.mdi.mdi-arrow-up {
  transform: translate(-500px);
} */

/* .my-custom-select[data-v-937be0] {
  max-width: 200px;
  max-height: 50px;
  overflow: hidden;
} */

/* ::v-deep th.text-start.sortable.active.asc,
::v-deep th.text-start.sortable.active.desc,
::v-deep th.text-start.sortable {
  display: flex;
} */

/* ::v-deep .theme--light.v-data-table .v-data-table-header th.sortable .v-data-table-header__icon {
  color: #00000061;
  /* transform: translate(-400%); */
/* }

.my-custom-menu {
  /* Styles personnalisés pour le menu déroulant */
  /* max-width: 200px; */
/* } */

/* #application>div.v-menu__content.theme--light.menuable__content__active {
  background-color: blue;
  color: rgb(124, 31, 31);
} */


/* .v-application--is-ltr .v-data-table>.v-data-table__wrapper>table>thead>tr>th {
  max-width: 50px !important;
} */

/* .font-table {
  font: normal normal normal 16px/13px Charlevoix !important;
  letter-spacing: 1.1px;
  color: #14202C;
  opacity: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
} */

.text-success {
  color: rgb(14, 165, 14);
}

.text-danger {
  color: red;
}

.card-title {
  color: #214353;
  font-size: 20px;
}

/* .text-start {
  justify-content: center;
  display: flex !important;
  flex-direction: row !important;
} */

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

/* .title {
  letter-spacing: 1.1px;
  color: #214353;
  opacity: 1;
  font-size: 20px !important;
} */

/* .text {
  font-size: 14px;
  font-family: Charlevoix;
  letter-spacing: 0.7px;
  color: #214353;
  opacity: 1;
  font-size: 14px;
} */

/* .theme--light.v-data-table .v-data-footer {
  background: #7b5151 !important;
} */

::v-deep .v-data-footer {
  width: 100%;
  margin-right: 0px !important;
  background: #fff !important;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

::v-deep tr>th:first-child  > div{
  /* background-color: red; */
  position: relative;
  top: 10px;
  /* left : 0px */
}

/* ::v-deep tr>th:last-child {
  border-top-right-radius: 10px !important;
} */

::v-deep tr>td.text-start {
  display: flex;
  align-items: center;
}
</style>