<template>
  <div @click="onClick" class="sprite_container">
    <div
      :class="{
        sprite_color:
          data.data.parent !== null && data.data.parent !== undefined,
        sprite_color2:
          data.data.parent === null || data.data.parent === undefined,
      }"
      :style="{ backgroundImage: `url(${dataImageUrl})`, ...dynamicStyle }"
    ></div>
    <!-- :style="{ background: data.color, ...dynamicStyle }" -->
    <!-- :style="{ backgroundImage: `url(${dataImageUrl})` }" -->
    <!-- <div class="sprite_value_unit" :style="dynamicStyle">
      {{ data.data.parent }}
    </div> -->
    <!-- <div class="sprite_value_unit" :style="dynamicStyle">
      {{ data.dynamicId }}
    </div> -->
  </div>
</template> 

<script>
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";
import { EventBus } from "./EventBus";

export default {
  props: {
    data: {},
  },
  filters: {
    round(value) {
      try {
        if (typeof value === "string" && value.length === 0) return "";
        var num = Number(value);
        var rounded = num.toFixed(2);
        return Number(rounded);
      } catch (error) {
        console.error("error", error);
        return "";
      }
    },
  },
  data: () => ({
    fav: true,
    menu: false,
    message: false,
    hints: true,
    dynamicStyle: {
      border: "3px solid #F9F9F9",
      boxShadow: "none",
    },
    dataImageUrl: "",
  }),

  async mounted() {
    // console.log("mounted Sprite componenet", this.data);
    const typologie = this.data.data.typologie || "default";
    this.dataImageUrl = await this.getImageUrl(typologie);
  },
  methods: {
    async getImageUrl(typologie) {
      const imageMapping = {
        Luminaire: require("../viewer/assets/Luminaire.png"),
        Automate: require("../viewer/assets/Automate.png"),
        Multisensor: require("../viewer/assets/Multisensor.png"),
      };
      // console.log("typo00", typologie);

      const defaultImagePath = require("../viewer/assets/Luminaire.png");

      // Check if the typology exists in the mapping
      if (imageMapping.hasOwnProperty(typologie)) {
        return imageMapping[typologie];
      }

      // If not found in mapping, return default
      console.warn(
        `Image not found for typology ${typologie}, using default image.`
      );
      return defaultImagePath;
    },
    onClick() {
      const emitterHandler = EmitterViewerHandler.getInstance();
      emitterHandler.emit(VIEWER_SPRITE_CLICK, { node: this.data });
      // console.log("????????????????????????????? not", this.dynamicStyle);
      EventBus.$emit("toggle-children", this.data.dynamicId);
    },
    _isSelected() {
      // console.log(this.data.name);
      this.dynamicStyle = {
        border: "3px solid #F9F9F9",
        boxShadow: "0px 0px 10px 2px #00A2FF",
      };
    },
    _isNotSelected() {
      this.dynamicStyle = {
        border: "3px solid #F9F9F9",
        boxShadow: "none",
      };
    },
  },
};
</script>

  <style scoped>
.sprite_container {
  width: "fit-content";
  height: "fit-content";
  background: none;
  box-shadow: none;
  color: transparent;
  /* border-radius: 100%; */
  display: flex;
  flex-direction: row;
  align-items: center;
  z-index: 99999;
}
.sprite_color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  /* border: 3px solid #F9F9F9; */
  /* border: 3px solid; */
  z-index: 2;
  /* background: #0a1045; */

  background: #fff;
  background-size: contain;
}
/* .sprite_color:hover {
  width: 22px;
  height: 22px;
} */
.sprite_color2 {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  z-index: 2;
  background: #fff;
  /* background-image: url("../viewer/assets/Automate.png"); */
  background-size: contain;
}
/* .sprite_color2:hover {
  width: 26px;
  height: 26px;
} */
.sprite_value_unit {
  /* border: 2px solid #F9F9F9; */
  /* border: 2px solid;  */
  border-radius: 100px;
  color: #14202c;
  margin-left: -15px;
  padding-left: 15px;
  padding-right: 5px;
  padding-bottom: 1px;
  height: 15px;
  font-size: 14px;
  background: #f9f9f9;
  z-index: 1;
}
/* 
  .sprite_container:hover {
    cursor: pointer;
  } */
</style>