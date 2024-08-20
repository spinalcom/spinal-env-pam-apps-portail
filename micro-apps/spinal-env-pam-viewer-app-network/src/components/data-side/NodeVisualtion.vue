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
    <div class="chart-title-container">
      <div>
        <h2>Représentation Visuelle du réseau</h2>
        <p>Noeuds du RDC</p>
      </div>
      <div class="toggle-container">
        <input
          type="checkbox"
          id="toggle-switch"
          class="toggle-switch"
          @change="changeDirection"
        />
        <label for="toggle-switch" class="toggle-label"></label>
      </div>
    </div>
    <div class="svg-container">
      <svg width="1000" height="1000"></svg>
    </div>
    <div
      class="full-view-button"
      @click="toggleFullView"
      :class="{
        'half-screen': isFullscreen,
        'full-screen': !isFullscreen,
      }"
    ></div>
    <div class="legend-container">
      <LegendVue :listItem="legendSpaceAssignation"></LegendVue>
    </div>
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
// import { Legend } from "./interfaces/ILegend";
import { Legend } from "../../interfaces/ILegend";
import LegendVue from "./Legend.vue";

interface TransformedNode {
  id: number;
  dynamicId: number;
  parentId: number | null;
  x: number;
  y: number;
  status: string;
  self_status?: string;
  name?: string;
  type?: string;
  children?: TransformedNode[];
  typologie?: string;
}

@Component({
  name: "NodeVisualization",
  components: {
    LegendVue,
  },
})
class NodeVisualization extends Vue {
  @Prop() dataprop: any[];
  Nodeto: any[] = [];
  displayedNodes: TransformedNode[] = [];
  expandedNodes: Set<number> = new Set(); // Track expanded nodes
  transformedNodesGeneric: TransformedNode[] = [];
  isVertical = false;

  lampImage = require("../viewer/assets/lamp.png");
  automateImage = require("../viewer/assets/Automate.png");
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
  legendSpaceAssignation: Legend[] = [
    {
      title: "Noeud Actif",
      color: "#325e4b",
      type: "Not-assigned",
    },
    {
      title: "Noeud Inactif",
      color: "#d7270c",
      type: "Assigned",
    },
    {
      title: "Noeud Inconnu",
      color: "#f49700",
      type: "AssignedToAnother",
    },
  ];

  dataImageUrl: string = "";

  imageMapping: { [key: string]: string } = {
    Luminaire: require("../viewer/assets/Luminaire.png"),
    Automate: require("../viewer/assets/Automate.png"),
    Multicapteurs: require("../viewer/assets/Multicapteurs.png"),
    Climatiseur: require("../viewer/assets/Climatiseur.png"),
    Default: require("../viewer/assets/default.png"),
  };
  isFullscreen: boolean = false;
  toggleFullView() {
    this.isFullscreen = !this.isFullscreen;
    this.$emit("toggle-full-view");
  }

  mounted() {
    this.Nodeto = this.$store.state.appDataStore.selectedEquipements;

    this.transformedNodesGeneric = this.transformData(this.dataprop);
    this.displayedNodes = this.getPrincipalNodes(this.transformedNodesGeneric);
    this.createChart(this.displayedNodes, this.isVertical);
    EventBus.$on("on-node-click", this.onNodeClickOut);
  }
  beforeDestroy() {
    EventBus.$off("on-node-click", this.onNodeClickOut);
  }

  changeDirection(event: Event) {
    this.isVertical = (event.target as HTMLInputElement).checked;
    if (this.isVertical) {
      this.transformedNodesGeneric = this.transformDataVertical(this.dataprop);
    } else {
      this.transformedNodesGeneric = this.transformData(this.dataprop);
    }
    this.displayedNodes = this.getPrincipalNodes(this.transformedNodesGeneric);
    this.createChart(this.displayedNodes, this.isVertical);
  }

  @Watch("isVertical")
  onSelectedDynamicIdChange(newVal: number) {
    console.log("isVertical", this.isVertical);
    this.createChart(this.displayedNodes, this.isVertical);
  }

  async createChart(transformDataent: TransformedNode[], isVertical) {
    const svg = d3.select(this.$refs.container).select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const parentColor = "#0a1045";
    const childColor = "#00c2d1";
    svg.selectAll("*").remove();
    const defs = svg.append("defs");

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

    const link = svg
      .append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("d", (d: any) => (isVertical ? linkPath2(d) : linkPath(d)))
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
      .attr("width", 160)
      .attr("height", 60)
      .attr("x", (d) => d.x - 80)
      .attr("y", (d) => d.y - 30)
      .style("overflow", "visible")
      .on("mouseover", (event, d) => {
        const nodeBoundingRect = event.currentTarget.getBoundingClientRect();
        const tooltipWidth = 150;
        const tooltipHeight = 60;

        let tooltipX =
          nodeBoundingRect.left +
          nodeBoundingRect.width / 2 -
          tooltipWidth / 2 +
          110;
        let tooltipY = nodeBoundingRect.top - tooltipHeight - 10;

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
        this.onNodeClick(d.id);

        d.fx = null;
        d.fy = null;
        simulation.nodes(transformDataent);
        simulation.alpha(1).restart();
      });

    const nodeDiv = node
      .append("xhtml:div")
      .style("width", "160px")
      .style("height", "60px")
      .style("display", "flex")
      .style("align-items", "center")
      .style("border-radius", "5px")
      .style("background-color", "white")
      .style("border", (d) => `2px solid ${getNodeBorderColor(d.status)}`)
      .style("box-shadow", (d) =>
        d.id === this.lastClickedNodeId ? "0px 0px 10px 1px blue" : "none"
      )
      .style("padding", "10px 3px");

    nodeDiv
      .append("div")
      .style("width", "20%")
      .style("height", "60%")
      .style(
        "background-image",
        (d) =>
          `url(${this.imageMapping[d.typologie] || this.imageMapping.Default})`
      )
      .style("background-size", "contain")
      .style("background-position", "center");

    const infoDiv = nodeDiv
      .append("div")
      .style("width", "70%")
      .style("padding", "5px");

    infoDiv
      .append("div")
      .style("font-size", "0.7rem")
      .style("line-height", "1.2")
      .text((d) =>
        d.name.length > 30 ? d.name.substring(0, 30) + "..." : d.name
      );

    infoDiv
      .append("div")
      .style("font-size", "0.6rem")
      .style("color", (d) => `${getNodeBorderColor(d.status)}`)
      .style("font-weight", "bold")
      .text((d) => d.status);

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
      link.attr("d", (d: any) => (isVertical ? linkPath2(d) : linkPath(d)));
      node.attr("x", (d) => d.x - 80).attr("y", (d) => d.y - 30);
    }

    adjustSvgSize(svg, node);

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

    function adjustSvgSize(svg, node) {
      const nodes = node.nodes();
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      nodes.forEach((n) => {
        const nodeX = +n.getAttribute("x");
        const nodeY = +n.getAttribute("y");
        const nodeWidth = 200; // Width of each node
        const nodeHeight = 60; // Height of each node

        // Adjust min and max based on node position and size
        if (nodeX < minX) minX = nodeX;
        if (nodeY < minY) minY = nodeY;
        if (nodeX + nodeWidth > maxX) maxX = nodeX + nodeWidth;
        if (nodeY + nodeHeight > maxY) maxY = nodeY + nodeHeight;

        // Check if node has expanded children (adjust maxY accordingly)
        const expandedChildrenHeight = 100; // Example height of expanded children
        // Adjust maxY if expandedChildrenHeight is greater than nodeHeight
        if (expandedChildrenHeight > nodeHeight) {
          if (nodeY + expandedChildrenHeight > maxY) {
            maxY = nodeY + expandedChildrenHeight;
          }
        }
      });

      const padding = 20;
      const width = maxX - minX + padding * 2 + 160;
      const height = maxY - minY + padding * 2 + 100;

      svg.attr("width", width).attr("height", height);
    }

    function linkPath(d: any) {
      const sourceX = d.source.x + 80; // Right edge of the parent node
      const sourceY = d.source.y;
      const targetX = d.target.x - 80; // Left edge of the child node
      const targetY = d.target.y;
      return `M${sourceX},${sourceY} C${sourceX + 50},${sourceY} ${
        targetX - 50
      },${targetY} ${targetX},${targetY}`;
    }

    function linkPath2(d: any) {
      console.log("vertical", isVertical);
      const sourceX = d.source.x; // Right edge of the parent node
      const sourceY = d.source.y + 25; // Bottom edge of the parent node
      const targetX = d.target.x; // Left edge of the child node
      const targetY = d.target.y - 25; // Top edge of the child node
      return `M${sourceX},${sourceY} C${sourceX},${sourceY + 70} ${targetX},${
        targetY - 70
      } ${targetX},${targetY}`;
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
        return "#f49700";
      }
      return "gray";
    }
  }

  transformData(
    nodes: Node[],
    parentId: number | null = null,
    x: number = 150,
    y: number = 80,
    depth: number = 0
  ): TransformedNode[] {
    const transformedNodes: TransformedNode[] = [];
    const yIncrement = 80;
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
          dynamicId: node.dynamicId,
          parentId: parentId,
          x: nodeX,
          y: nodeY,
          status: node.status,
          self_status: node.self_status,
          name: node.name,
          type: node.type,
          children: node.nodes,
          typologie: node.typologie,
        };

        transformedNodes.push(transformedNode);
        // console.log("transformedNode", transformedNode);
        if (node.nodes && node.nodes.length > 0) {
          // Calculate the starting y position for children to be centered around the parent node
          const childYStart =
            nodeY - ((node.nodes.length - 1) * yIncrement) / 2;
          addNodes(node.nodes, node.dynamicId, x + 200, childYStart, depth + 1);
        }
      });
    };

    addNodes(nodes, parentId, x, y, depth);
    this.adjustY(transformedNodes);

    return transformedNodes;
  }
  adjustY(nodes) {
    const idMap = {};
    nodes.forEach((node) => {
      idMap[node.id] = node;
    });

    nodes.forEach((node) => {
      if (node.y < 80) {
        let siblings = nodes
          .filter((n) => n.parentId === node.parentId)
          .sort((a, b) => a.y - b.y);
        let y = 80;
        siblings.forEach((sibling) => {
          sibling.y = y;
          y += 80;
        });
      }
    });
  }
  adjustX(nodes) {
    const idMap = {};
    nodes.forEach((node) => {
      idMap[node.id] = node;
    });

    nodes.forEach((node) => {
      if (node.x < 150) {
        let siblings = nodes
          .filter((n) => n.parentId === node.parentId)
          .sort((a, b) => a.x - b.x);
        let x = 150;
        siblings.forEach((sibling) => {
          sibling.x = x;
          x += 200;
        });
      }
    });
  }

  transformDataVertical(
    nodes: Node[],
    parentId: number | null = null,
    x: number = 150,
    y: number = 80,
    depth: number = 0
  ): TransformedNode[] {
    const transformedNodes: TransformedNode[] = [];
    const xIncrement = 200;
    const yIncrement = 50;

    // Helper function to recursively add nodes
    const addNodes = (
      nodes: Node[],
      parentId: number | null,
      x: number,
      y: number,
      depth: number
    ) => {
      nodes.forEach((node, index) => {
        const nodeX = x + index * xIncrement;
        const nodeY = y + depth * yIncrement;

        const transformedNode: TransformedNode = {
          id: node.dynamicId,
          dynamicId: node.dynamicId,
          parentId: parentId,
          x: nodeX,
          y: nodeY,
          status: node.status,
          self_status: node.self_status,
          name: node.name,
          type: node.type,
          children: node.nodes,
          typologie: node.typologie,
        };

        transformedNodes.push(transformedNode);

        if (node.nodes && node.nodes.length > 0) {
          // Calculate the starting x position for children to be centered around the parent node
          const childXStart =
            nodeX - ((node.nodes.length - 1) * xIncrement) / 2;
          addNodes(node.nodes, node.dynamicId, childXStart, y + 100, depth + 1);
        }
      });
    };

    addNodes(nodes, parentId, x, y, depth);
    this.adjustX(transformedNodes);
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

  findNodeAndParent(nodes, targetDynamicId) {
    // This function will traverse the nodes and return the node and its parent
    let parent = null;
    let targetNode = null;

    function traverse(currentNodes, parentNode) {
      for (const node of currentNodes) {
        if (node.dynamicId === targetDynamicId) {
          parent = parentNode;
          targetNode = node;
          return true;
        }
        if (node.nodes && traverse(node.nodes, node)) {
          return true;
        }
      }
      return false;
    }

    traverse(nodes, null);
    return { targetNode, parent };
  }

  getSiblings(nodes, targetDynamicId) {
    const { targetNode, parent } = this.findNodeAndParent(
      nodes,
      targetDynamicId
    );

    if (!targetNode || !parent) {
      // If the node or its parent is not found, return an empty array
      return [];
    }

    // Return all children of the parent except the target node
    return parent.nodes.filter((node) => node.dynamicId !== targetDynamicId);
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
    console.log("ooooooooooooooooooooooooooooooooooooooooooooooooooooooo");
    if (this.expandedNodes.has(node.id)) {
      //closing opened node
      this.collapseNodeAndDescendants(node.id);
      this.expandedNodes.delete(node.id);
      // EventBus.$emit("deselect-all", node.id);
      // EventBus.$emit("toggle-children", node.id);

      EventBus.$emit("table-node-click", node, 1);
      console.log("Node is already expanded, collapse it");
    } else {
      if (node.parentId !== null && !this.expandedNodes.has(node.parentId)) {
        //impossible case
        console.log("Parent node is not expanded, expand it first");
        this.displayedNodes = this.displayedNodes.filter(
          (n) => n.parentId !== node.id
        );
        this.expandedNodes.delete(node.id);
        // EventBus.$emit("deselect-all", node.id);
        // EventBus.$emit("toggle-children", node.id);
        EventBus.$emit("table-node-click", node, 1);
      } else if (node.parentId === null) {
        this.displayedNodes = this.getPrincipalNodes(
          this.transformedNodesGeneric
        );
        this.expandedNodes = new Set();

        const children = this.transformedNodesGeneric.filter(
          (n) => n.parentId === node.id
        );
        this.displayedNodes = [...this.displayedNodes, ...children];
        this.expandedNodes.add(node.id);
        // EventBus.$emit("deselect-all", node.id);
        // EventBus.$emit("toggle-children", node.id);
        console.log("Node is a principal node ---------oooooo---------", node);
        EventBus.$emit("table-node-click", node, 1);
      } else {
        // Node is not expanded, expand it
        console.log("Node is not a principal node ---------oooooo---------");
        if (!node.children || node.children.length == 0) {
          // EventBus.$emit("deselect-all", node.id);
          // EventBus.$emit("toggle-children", node.id);
          EventBus.$emit("table-node-click", node, 1);
        } else {
          const children = this.transformedNodesGeneric.filter(
            (n) => n.parentId === node.id
          );
          this.displayedNodes = [...this.displayedNodes, ...children];
          this.expandedNodes.add(node.id);
          // EventBus.$emit("deselect-all", node.id);
          // EventBus.$emit("toggle-children", node.id);
          EventBus.$emit("table-node-click", node, 1);
        }
      }
    }
    this.lastClickedNodeId = nodeId;
    this.createChart(this.displayedNodes, this.isVertical);
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

    this.createChart(this.displayedNodes, this.isVertical);
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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // background: linear-gradient(to bottom right, #fff, #e3e1eb);
  background-color: #eff4f5;
  // background-color: red;
  height: 100%;
  width: 100%;
  // overflow: auto;
}
.svg-container {
  width: 100%;
  height: 100%;
  display: flex;
  // overflow-y: scroll;
  padding-top: 10px;
  overflow: auto !important;
}
::-webkit-scrollbar {
  height: 8px; /* height of horizontal scrollbar ← You're missing this */
  width: 8px; /* width of vertical scrollbar */
  // border: 1px solid #d5d5d5;
}
svg {
  flex-shrink: 0;
}
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
.legend-container {
  // background-color: blue;
  // width: 250px;
  // height: 250px;
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 15;
  right: 15;
}

/***********************title */
.chart-title-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 96%;
}
.toggle-container {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 25px;
}

.toggle-switch {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-label:before {
  content: "";
  position: absolute;
  height: 21px;
  width: 21px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-switch:checked + .toggle-label {
  background-color: rgba(46, 45, 56, 1);
}

.toggle-switch:checked + .toggle-label:before {
  transform: translateX(25px);
}
.full-view-button {
  width: 20px;
  height: 20px;
  // background-image: url("./assets/fullscreen.svg");
  background-size: contain;
  background-repeat: no-repeat;
  cursor: pointer;
  position: absolute;
  left: 15px;
  bottom: 15px;
}
.full-view-button:hover {
  width: 24px;
  height: 24px;
  left: 13px;
  bottom: 13px;
}
.full-screen {
  background-image: url("./assets/fullscreen.svg");
}

.half-screen {
  background-image: url("./assets/halfscreen.svg");
}
</style>
