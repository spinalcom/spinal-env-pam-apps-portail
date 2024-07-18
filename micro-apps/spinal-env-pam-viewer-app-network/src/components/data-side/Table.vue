
<template>
  <div class="table-container">
    <div class="table-scroll">
      <table>
        <thead>
          <tr class="table-header">
            <th class="name">Name</th>

            <th
              :class="{ type: true, 'type-selected': selectedType !== 'all' }"
            >
              <select
                style="margin-right: 5px"
                v-model="selectedType"
                @change="filterData"
              >
                <option value="all">Typologie</option>
                <option
                  v-for="typology in uniqueTypologies"
                  :key="typology"
                  :value="typology"
                >
                  {{ typology }}
                </option>
              </select>
              <div class="filtre-icon" style="margin-left: 5px">
                <div class="filtreButtonTop"></div>
                <div class="filtreButton"></div>
              </div>
            </th>

            <th class="nb">NB</th>
            <th
              :class="{
                status: true,
                'status-selected': selectedStatus !== 'all',
              }"
            >
              <select class="" v-model="selectedStatus" @change="filterData">
                <option value="all">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="unknown">Unknown</option>
              </select>
              <div class="filtre-icon">
                <div class="filtreButtonTop"></div>
                <div class="filtreButton"></div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="table-body">
          <TableRow
            v-for="(item, index) in filteredData"
            :key="index"
            :data="item"
            :fulldata="data"
            :pairs="pairs"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Component } from "vue-property-decorator";
import TableRow from "./TableRow.vue";
import { EventBus } from "./EventBus";

interface ParentChildPair {
  parent: number;
  child: number;
}

@Component({
  name: "Table",
  components: { TableRow },
})
class Table extends Vue {
  @Prop() data!: any[];
  filteredData: any = [];
  pairs: ParentChildPair[] = [];

  selectedStatus: string = "all";
  selectedType: string = "all";

  dio() {
    EventBus.$emit("diselect");
  }

  getAllParentChildPairs(
    data: any[],
    parent: number | null = null
  ): ParentChildPair[] {
    const pair: ParentChildPair[] = [];
    data.forEach((item) => {
      if (parent !== null) {
        pair.push({ parent: parent, child: item.dynamicId });
      }
      if (item.nodes && item.nodes.length > 0) {
        pair.push(...this.getAllParentChildPairs(item.nodes, item.dynamicId));
      }
    });
    return pair;
  }

  filterData() {
    this.filteredData = this.data.filter((d) => {
      const statusMatch =
        this.selectedStatus === "all" || d.status === this.selectedStatus;
      const typeMatch =
        this.selectedType === "all" || d.typologie === this.selectedType;
      return statusMatch && typeMatch;
    });
  }

  get uniqueTypologies() {
    const typologies = this.data.map((d) => d.typologie);
    return Array.from(new Set(typologies));
  }
  async mounted() {
    // console.log("Received data..................", this.data);
    EventBus.$on("dio", this.dio);
    this.filterData();
    this.pairs = this.getAllParentChildPairs(this.data);
  }
  beforeDestroy() {
    EventBus.$off("dio", this.dio);
  }
}

export default Table;
</script>

<style lang="scss">
table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-family: Charlevoix Pro !important;
}
.thead {
  position: sticky;
  top: 0;
}
.table-container {
  // width: 70vh;
  // background-color: red;
  // height: 100%;
  // overflow: auto;
  // position: relative;
}
.table-scroll {
  height: 62vh;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  // position: relative;
}
/* For Webkit browsers (e.g., Chrome, Safari) */
::-webkit-scrollbar {
  width: 8px; /* Width of the scrollbar */
}

::-webkit-scrollbar-track {
  background: #f1f1f1; /* Track background */
  border-radius: 10px; /* Rounded corners on the track */
}

::-webkit-scrollbar-thumb {
  background: #14202c; /* Scrollbar color */
  border-radius: 10px; /* Rounded corners on the scrollbar */
}

::-webkit-scrollbar-thumb:hover {
  background: #181d49; /* Scrollbar color on hover */
}

/* For Firefox */
* {
  scrollbar-width: thin; /* Make scrollbar thinner */
  scrollbar-color: #888 #f1f1f1; /* Scrollbar thumb and track colors */
}
.table-header {
  display: flex;
  flex-direction: row;
  // justify-content: space-between;
  width: 100%;
  background-color: #f5f5f5;
  font-family: Charlevoix Pro !important;
  font-size: 16px;
}
// .table-header {

//   top: 0;
//   background-color: white; /* Ensure the background color matches your table's header background */
//   z-index: 1;
// }
.table-header:hover {
  background-color: #e4e4e4;
}
.table-header .name {
  width: 50%;
  padding-left: 1%;
  // background: red;
}
.table-header .type {
  width: 26%;
  display: flex;
  flex-direction: row;
}

.table-header .nb {
  width: 12%;
}
.table-header .status {
  width: 12%;
  text-align: end;
  padding-right: 1%;
  display: flex;
  flex-direction: row;
}

th,
td {
  padding: 8px 0px;
  text-align: left;
}
td {
  text-align: left;
  border-bottom: 1px solid #f1f1f1;
}
tr {
  // background-color: #f1f3fe;
}
tr:hover {
  // background-color: #eef0ff;
}

tr:nth-child(even) {
  // background-color: #f2f2f2;
}
select {
  font-family: Charlevoix Pro !important;
  font-size: 16px;
  // padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
  border: none !important;
  transition: border 0.2s ease-in-out;
}
select:focus {
  transform: scale(1);
  width: 100%;
  transition: transform 0.2s ease-in-out;
  border: none !important;
}

option {
  font-family: Charlevoix Pro !important;
  font-size: 16px;
}

select option:checked {
  // color: white;
}
.table-header .status {
  width: 12%;
  text-align: end;
}

.table-header .status-selected {
  background-color: #dae7fe;
}

.table-header .type-selected {
  background-color: #dae7fe;
}

.table-header .status {
  width: 12%;
  text-align: end;
}

.table-header .status-selected {
  background-color: #dae7fe;
}
.filtre-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: -10px;
}
.filtreButtonTop {
  background-image: url("../viewer/assets/down-arrow.png");
  background-size: contain;
  width: 8px;
  height: 8px;
  // padding: 5px 10px;
  border-radius: 5px;
  transform: rotate(180deg);
}
.filtreButton {
  background-image: url("../viewer/assets/down-arrow.png");
  background-size: contain;
  width: 8px;
  height: 8px;
  // padding: 5px 10px;
  border-radius: 5px;
}
</style>
