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
  <div ref="container" class="graph-container">
    <h2>Vue.js and D3 Line Chart</h2>
    <!-- <div class="tooltip">
      <p>Noeud Id</p>
      <p>Status</p>
      <p>Children:</p>
      <div id="tailShadow"></div>
      <div id="tail1"></div>
      <div id="tail2"></div>
    </div> -->

    <svg width="100%" height="900"></svg>
    <div
      v-if="tooltip"
      class="tooltip"
      :style="{
        top: tooltipPosition.top + 'px',
        left: tooltipPosition.left + 'px',
      }"
    >
      <p>{{ tooltip.name }}</p>
      <p>Noeud Id: {{ tooltip.id }}</p>
      <p>Status: {{ tooltip.status }}</p>
      <p>Children: {{ tooltip.children }}</p>
      <p>Self Status: {{ tooltip.selfstatus }}</p>
      <p>Type: {{ tooltip.type }}</p>
      <div id="tailShadow"></div>
      <div id="tail1"></div>
      <div id="tail2"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import Component from "vue-class-component";
import * as d3 from "d3";
import { EventBus } from "./EventBus";

interface TransformedNode {
  id: number;
  parentId: number | null;
  x: number;
  y: number;
  status: string;
  self_status?: string;
  name?: string;
  type?: string;
  children?: TransformedNode[];
}

@Component({
  name: "NodeVisualization",
})
class NodeVisualization extends Vue {
  @Prop() dataprop: any[];
  Nodeto: any[] = [];
  displayedNodes: TransformedNode[] = [];
  expandedNodes: Set<number> = new Set(); // Track expanded nodes
  transformedNodesGeneric: TransformedNode[] = [];

  lampImage = require("../viewer/assets/lamp.png");
  automateImage = require("../viewer/assets/automate.png");
  lastClickedNodeId: number | null = null;
  tooltip: {
    id: number;
    status: string;
    selfstatus: string;
    name: string;
    children: number;
    type: string;
  } | null = null; // Add tooltip state
  tooltipPosition = { top: 0, left: 0 };

  mounted() {
    this.Nodeto = this.$store.state.appDataStore.selectedEquipements;
    console.log("Mounted", this.dataprop);
    this.transformedNodesGeneric = this.transformData(this.dataprop);
    // console.log("Transformed data node to", this.transformedNodesGeneric);
    this.displayedNodes = this.getPrincipalNodes(this.transformedNodesGeneric);
    console.log("Displayed nodes", this.displayedNodes);
    this.createChart(this.displayedNodes);
    EventBus.$on("on-node-click", this.onNodeClickOut);
  }
  beforeDestroy() {
    EventBus.$off("on-node-click", this.onNodeClickOut);
  }

  createChart(transformDataent: TransformedNode[]) {
    // console.log("createChart", transformDataent);

    const svg = d3.select(this.$refs.container).select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const parentColor = "#0a1045";
    const childColor = "#00c2d1";

    svg.selectAll("*").remove();
    const defs = svg.append("defs");

    defs
      .append("pattern")
      .attr("id", "lamp-pattern")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 40) // Adjust size of the pattern
      .attr("height", 30)
      .attr("x", -15) // Center the pattern horizontally
      .attr("y", -15) // Center the pattern vertically
      .append("image")
      .attr("xlink:href", this.lampImage)
      .attr("width", 30) // Adjust size of the image
      .attr("height", 30);

    defs
      .append("pattern")
      .attr("id", "automate-pattern")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 50) // Adjust size of the pattern
      .attr("height", 50)
      .attr("x", -15) // Center the pattern horizontally
      .attr("y", -15) // Center the pattern vertically
      .append("image")
      .attr("xlink:href", this.automateImage)
      .attr("width", 30) // Adjust size of the image
      .attr("height", 30);

    svg
      .append("defs")
      .append("filter")
      .attr("id", "shadow")
      .append("feDropShadow")
      .attr("dx", 3)
      .attr("dy", 3)
      .attr("stdDeviation", 3)
      .attr("fill", "blue");

    const simulation = d3
      .forceSimulation(transformDataent || [])
      .force(
        "link",
        d3.forceLink().id((d: any) => d.id)
      )
      .force(
        "x",
        d3
          .forceX()
          .strength(0.1)
          .x((d: any) => d.x)
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(0.1)
          .y((d: any) => d.y)
      )
      .on("tick", ticked);

    const links = transformDataent
      .filter((d) => d.parentId !== null)
      .map((d) => ({
        source: transformDataent.find((p) => p.id === d.parentId),
        target: d,
      }));

    const linkGenerator = d3
      .linkHorizontal()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("d", (d: any) =>
        linkGenerator({ source: d.source, target: d.target })
      )
      .attr("stroke", (d: any) =>
        getLinkColor(d.source.status, d.target.status)
      )
      .attr("stroke-width", 2)
      .attr("fill", "none");

    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("foreignObject")
      .data(transformDataent)
      .enter()
      .append("foreignObject")
      .attr("width", 40)
      .attr("height", 40)
      .attr("x", (d) => d.x - 20)
      .attr("y", (d) => d.y - 20)
      .style("overflow", "visible")
      .on("mouseover", (event, d) => {
        const nodeBoundingRect = event.currentTarget.getBoundingClientRect();
        const tooltipWidth = 150;
        const tooltipHeight = 60;

        const tooltipX =
          nodeBoundingRect.left +
          nodeBoundingRect.width / 2 -
          tooltipWidth / 2 +
          80;
        const tooltipY = nodeBoundingRect.top - tooltipHeight;

        this.tooltip = {
          id: d.id,
          status: d.status,
          selfstatus: d.self_status,
          name: d.name,
          children: d.children != null ? d.children.length : 0,
          type: d.type,
        };
        this.tooltipPosition = { top: tooltipY, left: tooltipX };
      })
      .on("mouseout", () => {
        this.tooltip = null;
      })
      .on("click", (event, d) => {
        this.onNodeClick(d.id); // Call your custom node click handler

        // Update positions and restart simulation
        d.fx = null;
        d.fy = null;
        simulation.nodes(transformDataent);
        simulation.alpha(1).restart();
      })
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node
      .append("xhtml:div")
      .style("width", "40px")
      .style("height", "40px")
      .style("border-radius", "50%")
      .style("background-color", "white")
      .style("background-image", (d) =>
        d.parentId !== null
          ? `url(${this.lampImage})`
          : `url(${this.automateImage})`
      )
      .style("background-size", "70%")
      .style("background-position", "center")
      .style("background-repeat", "no-repeat")
      .style("border", (d) => `3px solid ${getNodeBorderColor(d.status)}`)
      .style("box-shadow", (d) =>
        d.id === this.lastClickedNodeId ? "0px 0px 10px 1px blue" : "none"
      );

    const label = svg
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(transformDataent)
      .enter()
      .append("text")
      .attr("dy", -10)
      .attr("dx", 10)
      .attr("fill", "grey")
      .text((d: any) => d.id);

    function ticked() {
      link.attr("d", (d: any) =>
        linkGenerator({ source: d.source, target: d.target })
      );
      node.attr("x", (d) => d.x - 20).attr("y", (d) => d.y - 20);
    }

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function getNodeBorderColor(status: string): string {
      switch (status) {
        case "active":
          return "#325e4b";
        case "inactive":
          return "#d7270c";
        case "unknown":
          return "#f49700";
        default:
          return "transparent";
      }
    }

    function getLinkColor(sourceStatus: string, targetStatus: string): string {
      if (targetStatus === "active") {
        return "#325e4b";
      }
      if (targetStatus === "inactive") {
        return "#d7270c";
      }
      if (sourceStatus === "unknown") {
        //|| targetStatus === "unknown"
        return "#f49700";
      }
      return "gray";
    }
  }

  transformData(
    nodes: Node[],
    parentId: number | null = null,
    x: number = 50,
    y: number = 200,
    depth: number = 0
  ): TransformedNode[] {
    const transformedNodes: TransformedNode[] = [];
    const yIncrement = 50;

    // Helper function to recursively add nodes
    const addNodes = (
      nodes: Node[],
      parentId: number | null,
      x: number,
      y: number,
      depth: number
    ) => {
      // console.log("addNodes: ", nodes, "parent", parentId, "XY", x, y, depth);
      nodes.forEach((node, index) => {
        const nodeY = y + index * yIncrement;

        const nodeX = x + depth * yIncrement;

        const transformedNode: TransformedNode = {
          id: node.dynamicId,
          parentId: parentId,
          x: nodeX,
          y: nodeY,
          status: node.status,
          self_status: node.self_status,
          name: node.name,
          type: node.type,
          children: node.nodes,
        };

        transformedNodes.push(transformedNode);
        // console.log("transformedNode", transformedNode);
        if (node.nodes && node.nodes.length > 0) {
          // Calculate the starting y position for children to be centered around the parent node
          const childYStart =
            nodeY - ((node.nodes.length - 1) * yIncrement) / 2;
          addNodes(node.nodes, node.dynamicId, x + 100, childYStart, depth + 1);
        }
      });
    };

    addNodes(nodes, parentId, x, y, depth);

    return transformedNodes;
  }

  getPrincipalNodes(transformedData: TransformedNode[]): TransformedNode[] {
    // console.log("Transformed data getPrincipale", transformedData);
    const returneddata = transformedData.filter(
      (node) => node.parentId === null
    );
    // console.log("Returned data", returneddata);
    return returneddata;
    // return transformedData.filter((node) => node.parentId === null);
  }

  //get node by node id
  getNodeById(id: number): TransformedNode | undefined {
    return this.transformedNodesGeneric.find((node) => node.id === id);
  }

  onNodeClick(nodeId: number) {
    const node = this.getNodeById(nodeId);

    if (!node) {
      console.error(`Node with ID ${nodeId} not found.`);
      return;
    }

    // console.log("Transformed data", this.transformedNodesGeneric, "Node", node);

    if (this.lastClickedNodeId !== null) {
      d3.select(`[data-node-id='${this.lastClickedNodeId}']`).classed(
        "node-shadow",
        false
      );
      // console.log(
      //   "Node clicked",
      //   node.id,
      //   "last clicked",
      //   this.lastClickedNodeId
      // );
    }
    this.lastClickedNodeId = node.id;
    d3.select(`[data-node-id='${node.id}']`).classed("node-shadow", true);
    // console.log(
    //   "Node clicked",
    //   node.id,
    //   "last clicked",
    //   this.lastClickedNodeId
    // );

    if (this.expandedNodes.has(node.id)) {
      //closing opened node
      this.collapseNodeAndDescendants(node.id);
      this.expandedNodes.delete(node.id);
      EventBus.$emit("toggle-children", node.id);
      // console.log("Node is already expanded, collapse it");
    } else {
      if (node.parentId !== null && !this.expandedNodes.has(node.parentId)) {
        //impossible case
        console.log("Parent node is not expanded, expand it first");
        this.displayedNodes = this.displayedNodes.filter(
          (n) => n.parentId !== node.id
        );
        this.expandedNodes.delete(node.id);
        EventBus.$emit("toggle-children", node.id);
      } else if (node.parentId === null) {
        //principal nodes
        this.displayedNodes = this.getPrincipalNodes(
          this.transformedNodesGeneric
        );
        this.expandedNodes = new Set();

        const children = this.transformedNodesGeneric.filter(
          (n) => n.parentId === node.id
        );
        // console.log("Children", children);
        this.displayedNodes = [...this.displayedNodes, ...children];
        this.expandedNodes.add(node.id);
        EventBus.$emit("toggle-children", node.id);
        // }
      } else {
        // Node is not expanded, expand it
        if (!node.children || node.children.length == 0) {
          // console.log("Node has no children");
          EventBus.$emit("toggle-children", node.id);
        } else {
          const children = this.transformedNodesGeneric.filter(
            (n) => n.parentId === node.id
          );
          // console.log("Children", children);
          this.displayedNodes = [...this.displayedNodes, ...children];
          this.expandedNodes.add(node.id);
          EventBus.$emit("toggle-children", node.id);
        }
      }
    }
    this.lastClickedNodeId = nodeId;
    this.createChart(this.displayedNodes);
  }
  onNodeClickOut(nodeId: number) {
    // console.log("node by id", this.getNodeById(nodeId));

    const node = this.getNodeById(nodeId);

    if (!node) {
      console.error(`Node with ID ${nodeId} not found.`);
      return;
    }
    if (this.lastClickedNodeId !== null) {
      d3.select(`[data-node-id='${this.lastClickedNodeId}']`).classed(
        "node-shadow",
        false
      );
      // console.log(
      //   "Node clicked",
      //   node.id,
      //   "last clicked",
      //   this.lastClickedNodeId
      // );
    }
    this.lastClickedNodeId = node.id;
    d3.select(`[data-node-id='${node.id}']`).classed("node-shadow", true);
    // console.log("Transformed data", this.transformedNodesGeneric, "Node", node);
    if (this.expandedNodes.has(node.id)) {
      // Node is already expanded, collapse it
      // this.displayedNodes = this.displayedNodes.filter(
      //   (n) => n.parentId !== node.id
      // );
      this.collapseNodeAndDescendants(node.id);
      this.expandedNodes.delete(node.id);
    } else {
      if (node.parentId !== null && !this.expandedNodes.has(node.parentId)) {
        console.log(
          "Node is not a principal node",
          node.parentId,
          "lkdqlk",
          this.expandedNodes
        );
        console.log("Parent node is not expanded, expand it first");
        this.displayedNodes = this.displayedNodes.filter(
          (n) => n.parentId !== node.id
        );
        this.expandedNodes.delete(node.id);
      } else if (node.parentId === null) {
        this.displayedNodes = this.getPrincipalNodes(
          this.transformedNodesGeneric
        );
        this.expandedNodes = new Set();

        // this.expandedNodes.add(node.id);
        const children = this.transformedNodesGeneric.filter(
          (n) => n.parentId === node.id
        );
        console.log("Children", children);
        this.displayedNodes = [...this.displayedNodes, ...children];
        this.expandedNodes.add(node.id);
      } else {
        const children = this.transformedNodesGeneric.filter(
          (n) => n.parentId === node.id
        );
        console.log("Children", children);
        this.displayedNodes = [...this.displayedNodes, ...children];
        this.expandedNodes.add(node.id);
      }
    }

    this.createChart(this.displayedNodes);
  }
  collapseNodeAndDescendants(nodeId: number) {
    const children = this.transformedNodesGeneric.filter(
      (n) => n.parentId === nodeId
    );

    children.forEach((child) => {
      if (this.expandedNodes.has(child.id)) {
        this.collapseNodeAndDescendants(child.id);
      }
    });

    this.displayedNodes = this.displayedNodes.filter(
      (n) => n.parentId !== nodeId
    );
    this.expandedNodes.delete(nodeId);
  }
}

export { NodeVisualization };
export default NodeVisualization;
</script>


<style lang="scss">
.graph-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // background: linear-gradient(to bottom right, #fff, #e3e1eb);
  background-color: #eff4f5;
}

// .tooltip {
//   position: absolute;
//   background-color: rgba(255, 255, 255, 0.9);
//   border: 1px solid #ccc;
//   padding: 10px;
//   z-index: 9999;
// }
.tooltip {
  position: absolute;
  background-color: rgba(46, 45, 56, 1);
  border: 2px solid rgba(46, 45, 56, 1);
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  z-index: 9999; /* Ensure it appears above other elements */
  color: white;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
}
.tooltip:before {
  content: "";
  width: 0px;
  height: 0px;
  position: absolute;
  border-left: 8px solid transparent;
  border-right: 8px solid rgba(46, 45, 56, 1);
  border-top: 8px solid rgba(46, 45, 56, 1);
  border-bottom: 8px solid transparent;
  left: -9px;
  top: -2px;
}
.tooltip p {
  margin-bottom: 3 !important;
  border-bottom: 0.3px solid #fff;
  line-height: 1.2;
  // padding-bottom: -10px;
}
</style>
