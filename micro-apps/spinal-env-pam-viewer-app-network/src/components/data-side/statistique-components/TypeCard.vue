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
        <div class="app-button">Description</div>
        <div class="leftarrow"></div>
      </div>
    </div>
    <div class="desc-container-wrapper">
      <div class="desc-container-typologie">
        <div
          v-for="(count, typologie) in typologieCounts"
          :key="typologie"
          class="typologie-item"
        >
          <div
            class="typo-img"
            :style="{ backgroundImage: `url(${getImageUrl(typologie)})` }"
          ></div>
          <div style="margin-right: 5px">{{ count }}</div>
          <div>{{ typologie }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue } from "vue-property-decorator";
import Component from "vue-class-component";

@Component({
  name: "TypeCard",
})
class TypeCard extends Vue {
  @Prop() dataprop!: any[];
  typologieCounts: { [key: string]: number } = {};

  mounted() {
    this.typologieCounts = this.countTypologieNodes(this.dataprop);
    console.log(this.dataprop);
  }

  getImageUrl(typologie: string): string {
    const imageMapping: { [key: string]: string } = {
      Luminaire: require("../../viewer/assets/Luminaire.png"),
      Automate: require("../../viewer/assets/Automate.png"),
      Multicapteurs: require("../../viewer/assets/Multicapteurs.png"),
      Climatiseur: require("../../viewer/assets/Climatiseur.png"),
    };

    const defaultImagePath = require("../../viewer/assets/default.png");

    // Check if the typology exists in the mapping
    if (imageMapping.hasOwnProperty(typologie)) {
      return imageMapping[typologie];
    }

    // If not found in mapping, return default
    console.warn(
      `Image not found for typology ${typologie}, using default image.`
    );
    return defaultImagePath;
  }

  countTypologieNodes(data: any[]): { [key: string]: number } {
    const result: { [key: string]: number } = {};

    function traverse(node: any) {
      if (node.typologie) {
        if (!result[node.typologie]) {
          result[node.typologie] = 0;
        }
        result[node.typologie] += 1;
      }

      if (Array.isArray(node.nodes)) {
        node.nodes.forEach((childNode) => traverse(childNode));
      }
    }

    data.forEach((rootNode) => traverse(rootNode));

    // Sort the entries by count (descending) and then alphabetically
    const sortedEntries = Object.entries(result).sort(
      ([typologieA, countA], [typologieB, countB]) => {
        if (countA === countB) {
          return typologieA.localeCompare(typologieB);
        }
        return countB - countA;
      }
    );

    // Convert sorted entries back to an object
    const sortedResult: { [key: string]: number } = {};
    for (const [typologie, count] of sortedEntries) {
      sortedResult[typologie] = count;
    }

    return sortedResult;
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
  padding: 13px 15px !important;
}

.title-container {
  width: 100%;
  height: 30%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.stat-title {
  font-family: Roboto, sans-serif !important;
  font-weight: 500;
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
}

.app-button {
  font-family: Roboto, sans-serif !important;
  font-weight: 500;
  color: white;
  font-size: 0.9rem;
  width: 80%;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
  padding: 10px 0px;
  margin-left: -7px;
  padding-left: 15px !important;
}

.app-button:hover {
  color: #14202c;
}

.desc-container-wrapper {
  width: 100%;
  height: 70%;
  overflow-y: auto;
}

.desc-container-typologie {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  // grid-auto-rows: minmax(100px, auto);
  column-gap: 10px;
  width: 95%;
}
.typo-img {
  // background-color: red;
  background-size: cover;
  background-repeat: no-repeat;
  height: 15px;
  width: 15px;
  margin-right: 8px;
}

.typologie-item {
  color: black;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  border-left: 1px solid transparent;
  position: relative;
}

.typologie-item:not(:nth-child(2n))::after {
  content: "";
  position: absolute;
  top: 1px;
  right: 10px; /* Note: Added 'px' for the 'right' property */
  width: 2px;
  height: 100%;
  background-color: #14202c;
}
</style>