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
      <p class="stat-title">Status Overview</p>

      <div class="stat-num">
        <div class="app-button">Tickets</div>
        <div class="leftarrow"></div>
      </div>
    </div>
    <div class="desc-container">
      <div class="echele">
        <div class="non-active-num">
          <div class="text-border">{{ this.statusCounts.inactive }}</div>
          <p style="font-size: 0.9rem">inactive</p>
        </div>
        <div class="all-eq-num">
          <p class="num-title">{{ this.totalNodes }}</p>
          <p class="unit">total</p>
        </div>
      </div>
      <div class="chart">
        <div class="chart-legend">
          <div class="stat1-label">{{ this.statusCounts.active }} Active</div>
          <div class="stat2-label">{{ this.statusCounts.unknown }}</div>
          <div class="stat3-label">
            {{ this.statusCounts.inactive }}
          </div>
        </div>
        <div class="chart-container">
          <div class="stat1"></div>
          <div class="stat2"></div>
          <div class="stat3"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue } from "vue-property-decorator";
import Component from "vue-class-component";

@Component({
  name: "StatCard",
})
class StatCard extends Vue {
  @Prop() dataprop: any[];

  totalNodes: number = 0;
  statusCounts: { active: number; inactive: number; unknown: number } = {
    active: 0,
    inactive: 0,
    unknown: 0,
  };
  mounted() {
    console.log("Mounted", this.dataprop);
    const { totalNodes, statusCounts } = this.countNodesAndStatus(
      this.dataprop
    );
    this.totalNodes = totalNodes;
    this.statusCounts = statusCounts;

    // Calculate percentages
    const activePercentage = (statusCounts.active / totalNodes) * 100;
    const inactivePercentage = (statusCounts.inactive / totalNodes) * 100;
    const unknownPercentage = (statusCounts.unknown / totalNodes) * 100;

    // Set inline styles for dynamic widths
    this.$nextTick(() => {
      this.setDynamicWidths(
        activePercentage,
        inactivePercentage,
        unknownPercentage
      );
    });

    console.log("Total Nodes:", totalNodes);
    console.log("Status Counts:", statusCounts);
  }
  countNodesAndStatus(data) {
    let totalNodes = 0;
    let statusCounts = {
      active: 0,
      inactive: 0,
      unknown: 0,
    };

    function countNodes(node) {
      totalNodes++;
      if (node.self_status) {
        statusCounts[node.self_status]++;
      }

      if (node.nodes && node.nodes.length > 0) {
        node.nodes.forEach((childNode) => {
          countNodes(childNode);
        });
      }
    }

    data.forEach((item) => {
      countNodes(item);
    });

    return { totalNodes, statusCounts };
  }
  setDynamicWidths(activePct, inactivePct, unknownPct) {
    // Set CSS variables for dynamic widths
    this.$el.style.setProperty("--final-width-stat1", `${activePct}%`);
    this.$el.style.setProperty("--final-width-stat2", `${unknownPct}%`);
    this.$el.style.setProperty("--final-width-stat3", `${inactivePct}%`);
  }
}

export { StatCard };
export default StatCard;
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
  // background: linear-gradient(to bottom right, #fff, #e3e1eb);
  // background-color: red;
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
  margin-right: 5px !important;
}
.num-title {
  font-family: Roboto, sans-serif !important;
  font-family: Charlevoix Pro !important;
  font-weight: 600;
  // letter-spacing: 0.0125em !important;
  font-size: 2rem !important;
  padding: 0 !important;
  margin: 0 !important;
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
.stat-num {
  font-family: Roboto, sans-serif !important;
  font-weight: 400;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: #14202c;
  width: 25%;
  height: 100%;
  font-size: 0.9rem !important;
  color: white;
  border-radius: 6px;
  padding: 0 !important; /* Correct padding value */
  margin: 0 !important;
  position: relative; /* Needed for the pseudo-element */
  overflow: hidden; /* Hide the overflowing part of the pseudo-element */
  transition: color 0.5s; /* Smooth transition for font color */
}

.stat-num::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  transform: translateX(-100%);
  transition: transform 0.5s; /* Smooth transition for background color */
  z-index: 0; /* Ensure the pseudo-element is below the text */
}

.stat-num:hover::before {
  transform: translateX(-20);
}

.stat-num:hover {
  color: #14202c; /* Change the font color to the old background color */
  z-index: 2; /* Ensure the text is above the pseudo-element */
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
.unit {
  font-weight: 500;
  font-size: 0.8rem !important;
  color: #14202c;
  margin-left: 5px !important;
}
.non-active-num {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  width: 100%;
  // height: 30%;
  color: #d7270c;
  // background-color: pink;
}
.text-border {
  font-family: Roboto, sans-serif !important;
  // font-family: Charlevoix Pro !important;
  font-weight: 500;
  height: 100%;
  color: #d7270c;
  // letter-spacing: 0.0125em !important;
  font-size: 0.8rem !important;
  // border: #d7270c 5px solid;
  background: #ffe3eb;
  padding: 3px 5px;
  border-radius: 3px;
  line-height: 0.8 !important;
  text-align: center;
  margin-right: 5px;
}
.chart-container {
  // left: 30%;
  width: 100%;
  height: 10px;
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: start;
  overflow: hidden;
  background-color: #e4e4e4;
  position: relative;
  border-radius: 10px;
}
.chart-legend {
  // left: 30%;
  width: 100%;
  height: 15px;
  margin: 0;
  font-size: 0.7rem;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: start;
  overflow: hidden;
  // background-color: #e4e4e4;
  position: relative;
  border-radius: 10px;
}
.chart {
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: start;
  // background-color: blue;
}
.echele {
  width: 25%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: start;
  // background-color: blue;
}
p {
  margin: 0 !important;
  padding: 0 !important;
  line-height: 0.8 !important;
}

.stat1,
.stat2,
.stat3 {
  height: 10px;
  animation: grow 0.7s ease-in-out forwards;
}

.stat1 {
  width: 0; /* Start with width 0 */
  background-color: #325e4b;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  animation-delay: 0s; /* Delay for the start of the animation */
}

.stat2 {
  width: 0; /* Start with width 0 */
  background-color: #f49700;
  animation-delay: 0.7s; /* Delay for the start of the animation */
}

.stat3 {
  width: 0; /* Start with width 0 */
  background-color: #d7270c;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  animation-delay: 1.4s; /* Delay for the start of the animation */
}
.stat1-label,
.stat2-label,
.stat3-label {
  animation: grow 0.7s ease-in-out forwards;
  // transform: rotate(55deg);
}

.stat1-label {
  width: 0;
  animation-delay: 0s;
  color: transparent;
}

.stat2-label {
  width: 0;
  animation-delay: 0.7s;

  color: transparent;
}

.stat3-label {
  width: 0;

  color: transparent;
  animation-delay: 1.4s;
}

@keyframes grow {
  0% {
    width: 0;
  }
  100% {
    width: var(--final-width); /* Final width will be set using inline styles */
    color: #14202c;
  }
}

/* Set the final widths for each stat */
.stat1 {
  --final-width: 40%;
}

.stat2 {
  --final-width: 35%;
}

.stat3 {
  --final-width: 25%;
}
.stat1 {
  --final-width: var(--final-width-stat1, 0%);
  // width: var(--final-width);
  // animation-delay: 0s;
}

.stat2 {
  --final-width: var(--final-width-stat2, 0%);
  // width: var(--final-width);
}

.stat3 {
  --final-width: var(--final-width-stat3, 0%);
  // width: var(--final-width);
}
.stat1-label {
  --final-width: var(--final-width-stat1, 0%);
  // width: var(--final-width);
}

.stat2-label {
  --final-width: var(--final-width-stat2, 0%);
  // width: var(--final-width);
}

.stat3-label {
  --final-width: var(--final-width-stat3, 0%);
  // width: var(--final-width);
}
</style>
