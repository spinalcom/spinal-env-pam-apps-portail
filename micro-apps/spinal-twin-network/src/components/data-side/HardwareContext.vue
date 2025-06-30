<!--
Copyright 2024 SpinalCom - www.spinalcom.com

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
  <div class="HardwareContextContainer">
    <div class="custom-dropdown">
      <div class="dropdown-selected" style="font-size: 15px!important;" @click="toggleDropdown">
        <!-- {{ selectedLabel }} -->
          <div>
            <span v-if="label.length > 0">
              <ul style="display: flex; gap: 20px; list-style: none; ">
                <li v-for="(item, index) in label" :key="index" class="hardware-item">
                  <span :style="{'background-color': item.color, width: `5px`, height: `15px`, 'border-radius': `5px`, 'margin-right': `5px`}"></span> 
                  
                  {{  item.name }}
                </li>
              </ul>
            </span>
            <span v-else>Select an option</span>
          </div>
        <div>
          <span class="arrow"></span>
        </div>
      </div>
      <ul v-show="dropdownOpen" class="dropdown-options" style="font-size: 15px!important;">
        <li v-for="(item, index) in visibleItems" :key="index" @click="selectItem(item.nodeId)">
          <span :style="{'background-color': getItemColor(item.contextId), width: `5px`, height: `15px`, 'border-radius': `5px`, 'margin-right': `15px`}"></span> 

          {{ item.name }}
          <!-- {{ item.nodes[0].name.length > 60 ? item.nodes[0].name.substring(0, 60) + '...' : item.nodes[0].name }} -->
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import Component from "vue-class-component";

@Component({
  name: "HardwareContext",
})
class HardwareContext extends Vue {
  @Prop() data!: any[];
  @Prop() selectedDynamicId!: {contextId: number,  nodeId: number }[];

  selectedItemId: number []  = [];
  hardwareContextSelected : {contextId: number, nodeId: number}[] = [];
  label: {contextId: number, name: string, color: string}[] = [];
  startIndex: number = 0;
  dropdownOpen: boolean = false;
  indHardWareContextSelected: number[] = [];

  get visibleItems() {
    return this.data.map((item) => {
      return {
        nodeId: item.dynamicId,
        contextId: item.nodes[0].realid,
        name: item.nodes[0].name,
      };
    })
  }

  getItemColor(contextId: number): string {
    const color = this.$store.state.appDataStore.hardwareColor.get(contextId);
    return color ? color : '#fff'; // Default color if not found
  }





  selectItem(dynamicId: number) {
    console.warn('selectItem called with dynamicId: ', dynamicId);
    const index = this.hardwareContextSelected.findIndex(item => item.nodeId === dynamicId);
    if(index != -1){
      this.hardwareContextSelected.splice(index, 1);
    }
    else {
      if(this.hardwareContextSelected.length < 2 ) {
        this.hardwareContextSelected.push({
          nodeId: dynamicId,
          contextId: this.data.find(item => item.dynamicId === dynamicId)?.nodes[0].realid || 0
        });

      }
      else {
        this.hardwareContextSelected.shift();
        this.hardwareContextSelected.push({
          nodeId: dynamicId,
          contextId: this.data.find(item => item.dynamicId === dynamicId)?.nodes[0].realid || 0
        })
     
      }
    }
    this.hardwareContextSelected.forEach((item) => {
      console.warn("item: ", item);
      const color = this.$store.state.appDataStore.hardwareColor.get(item.contextId);
      console.warn("color: ", color);
      if (color) {
        this.label.push({
          contextId: item.contextId,
          name: this.data.find(dataItem => dataItem.dynamicId === item.nodeId)?.nodes[0].name || '',
          color: color
    })
  }
});

  console.warn("label after selection: ", this.label);
    // this.label = this.hardwareContextSelected.map(item => {
    //       const foundItem = this.data.find(dataItem => dataItem.dynamicId === item.nodeId);
    //       return foundItem ? { contextId: foundItem.nodes[0].realid, name: foundItem.nodes[0].name } : null;
    //   }).filter((el): el is { contextId: number, name: string } => el !== null);

      

      this.indHardWareContextSelected = this.hardwareContextSelected.map(item => item.contextId);
      console.warn('indHardWareContextSelected: ', this.indHardWareContextSelected);
    console.warn('HardwareContext selected: ', this.hardwareContextSelected);
    this.$emit('update-selected', this.hardwareContextSelected);

  }


  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  prevItem() {
    if (this.data.length > 3) {
      this.startIndex =
        (this.startIndex - 1 + this.data.length) % this.data.length;
    }
  }

  nextItem() {
    if (this.data.length > 3) {
      this.startIndex = (this.startIndex + 1) % this.data.length;
    }
  }

@Watch('selectedDynamicId', { immediate: true, deep: true })
onSelectedDynamicIdChange(newVal: any) {
  if (!Array.isArray(newVal) || newVal.length === 0) return;

  const newIds = newVal.map((el: any) => el.nodeId).sort();
  const currentIds = this.hardwareContextSelected.map(el => el.nodeId).sort();

  // Vérifie si les tableaux ont la même longueur et contiennent les mêmes éléments
  const isSame =
    newIds.length === currentIds.length &&
    newIds.every((id, idx) => id === currentIds[idx]);

  if (isSame) return;

  this.hardwareContextSelected = [];
  this.indHardWareContextSelected = [];
  this.label = [];

  for (const element of newVal) {
    const item = this.data.find(dataItem => dataItem.dynamicId === element.nodeId);
    if (item) {
      this.hardwareContextSelected.push({
        nodeId: item.dynamicId,
        contextId: item.nodes[0].realid
      });

      this.indHardWareContextSelected.push(item.nodes[0].realid);
      const color = this.$store.state.appDataStore.hardwareColor.get(item.nodes[0].realid);
      
      this.label.push({
        contextId: item.nodes[0].realid,
        name: item.nodes[0].name,
        color: color || '#00ff00' // Default color if not found
      });
      console.warn("label after change: ", this.label);
    }
  }


  this.hardwareContextSelected = [...this.hardwareContextSelected];
  this.indHardWareContextSelected = [...this.indHardWareContextSelected];
  this.label = [...this.label];

  // Facultatif : évite d'émettre si inutile
  // this.$emit('update-selected', this.hardwareContextSelected);
}

}

export { HardwareContext };
export default HardwareContext;
</script>


<style lang="scss">
.HardwareContextContainer {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 80px;
}

.custom-dropdown {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dropdown-selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  background-color: #14202c;
  color: #fff;
  border-radius: 7px;
  cursor: pointer;
  position: relative;
}

.dropdown-selected .arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #fff;
  // background-color: turquoise;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #14202c;
  color: #fff;
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid #ccc;
  max-height: 150px;
  overflow-y: auto;
  z-index: 2;
  border-radius: 7px;
}

.dropdown-options li {
  padding: 10px;
  cursor: pointer;
}

.dropdown-options li.selected {
  background-color: #1c2a38;
}

.dropdown-options li:hover {
  background-color: #1c2a38;
}
.select-hardware {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
  display: inline-block;
  background-color: #00ff00;
  outline: #00ff00a2 solid 2px;
}
.hardware-item {
  width: max-content;
  height: max-content;
  font-size: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  max-width: 200px;
  width: max-content;
  border-radius: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
}
</style>
