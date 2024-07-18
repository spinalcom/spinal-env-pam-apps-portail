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
      <div class="dropdown-selected" @click="toggleDropdown">
        {{ selectedLabel }}
        <span class="arrow"></span>
      </div>
      <ul v-show="dropdownOpen" class="dropdown-options">
        <li
          v-for="(item, index) in visibleItems"
          :key="index"
          @click="selectItem(item.dynamicId)"
          :class="{ selected: item.dynamicId === selectedItemId }"
        >
          {{ item.nodes[0] }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue } from "vue-property-decorator";
import Component from "vue-class-component";

@Component({
  name: "HardwareContext",
})
class HardwareContext extends Vue {
  @Prop() data!: any[];
  @Prop() selectedDynamicId!: number;

  selectedItemId: number | null = null;
  startIndex: number = 0;
  dropdownOpen: boolean = false;

  get visibleItems() {
    const dataLength = this.data.length;
    const endIndex = Math.min(this.startIndex + 3, dataLength);
    return this.data.slice(this.startIndex, endIndex);
  }

  get selectedLabel() {
    const selectedItem = this.data.find(
      (item) => item.dynamicId === this.selectedItemId
    );
    return selectedItem ? selectedItem.nodes[0] : "Select an option";
  }

  mounted() {
    this.selectedItemId = this.selectedDynamicId;
    console.log("mounted HardwareContext", this.data, this.selectedItemId);
  }

  selectItem(dynamicId: number) {
    this.selectedItemId = dynamicId;
    this.dropdownOpen = false;
    this.$emit("update-selected", dynamicId);
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
  margin-bottom: 10px;
}

.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-selected {
  background-color: #14202c;
  color: #fff;
  padding: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 7px;
}

.dropdown-selected .arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #fff;
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
</style>

