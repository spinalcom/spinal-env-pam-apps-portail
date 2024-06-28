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
  <div class="container">
    <div class="title-container">
      <p class="stat-title">Typologie Overview</p>

      <div class="stat-num">
        <div class="app-button">Descreption</div>
        <div class="leftarrow"></div>
      </div>
    </div>
    <!-- <div clœœass="desc-container" id="typologie-container"></div> -->
  </div>
</template>

<script lang="ts">
import { Prop, Vue } from "vue-property-decorator";
import Component from "vue-class-component";

@Component({
  name: "TypeCard",
})
class TypeCard extends Vue {
  @Prop() dataprop: any[];

  mounted() {
    console.log("Mounted typecard", this.dataprop);
    console.log(this.countTypologieNodes(this.dataprop));
    this.displayTypologies(this.countTypologieNodes(this.dataprop));
  }
  countTypologieNodes(data) {
    const result = {};

    function traverse(node) {
      // Check if node has a typologie
      if (node.typologie) {
        if (!result[node.typologie]) {
          result[node.typologie] = 0;
        }
        // Increment the node count for this typologie
        result[node.typologie] += 1;
      }

      // Recursively traverse child nodes
      if (Array.isArray(node.nodes)) {
        node.nodes.forEach((childNode) => traverse(childNode));
      }
    }

    // Traverse the root data array
    data.forEach((rootNode) => traverse(rootNode));

    return result;
  }
  displayTypologies(typologieCounts) {
    const container = document.getElementById("typologie-container");
    // container.innerHTML = "";

    for (const [typologie, count] of Object.entries(typologieCounts)) {
      const typologieBox = document.createElement("div");
      typologieBox.className = "typologie-box";
      typologieBox.innerHTML = `
          <h2>${count}</h2>
          <p>${typologie}</p>
        `;
      // container.appendChild(typologieBox);
    }
  }
}

export { TypeCard };
export default TypeCard;
</script>


<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 13 15 !important;
}
.title-container {
  width: 100%;
  height: 30%;
  // background-color: green;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.stat-title {
  font-family: Roboto, sans-serif !important;
  // font-family: Charlevoix Pro !important;
  font-weight: 500;
  // letter-spacing: 0.0125em !important;
  font-size: 1rem !important;
}
.leftarrow {
  width: 12px;
  height: 12px;
  background-image: url("../../viewer/assets/right-arrow.png");
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 50%;
  z-index: 3;
  // margin-left: 18px;
}

.app-button {
  font-family: Roboto, sans-serif !important;
  font-weight: 500;
  color: white;
  font-size: 0.9rem;
  width: 80%;
  overflow: hidden;
  // background: red;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  padding: 10 0px;
  margin-left: -7px;
  padding-left: 15px !important;
}
.app-button:hover {
  color: #14202c;
}

.desc-container {
  width: 100%;
  height: 70%;
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
  overflow: hidden;
  // background-color: yellow;
  position: relative;
}
.all-eq-num {
  display: flex;
  flex-direction: row;
  // justify-content: start;
  justify-content: start;
  align-items: end;
  width: 100%;
  height: 50%;
  // background-color: blue;
}
.desc-container {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  // padding: 20px;
  box-sizing: border-box;
}
.typologie-box {
  display: inline-block;
  width: 25%;
  box-sizing: border-box;
  text-align: center;
  // padding: 10px;
  // margin: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  // background-color: #f9f9f9;
}
.typologie-box h2 {
  margin: 0;
  font-size: 0.9rem !important;
}
.typologie-box p {
  margin: 5px 0 0 0;
  font-size: 0.9rem !important;
  color: #555;
}
</style>
