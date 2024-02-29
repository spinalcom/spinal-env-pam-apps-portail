<template>
  <div class="sprite_container" @click.stop="onClick">
    <div
      class="sprite_color"
      :style="{ background: data.color, ...dynamicStyle }"
    ></div>
    <div class="sprite_value_unit" :style="dynamicStyle">
      {{ roundedValue }}
    </div>
  </div>
</template>
<script>
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";
import { store } from "../../services/store";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";

export default {
  name: "SpriteComponent",
  props: {
    data: {},
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
  }),
  computed: {
    roundedValue() {
      const value = Number(this.data.displayValue);
      return value || value === 0
        ? `${Number(value.toFixed(2))} ${this.data.unit}`
        : "";
    },
  },
  mounted() {},
  methods: {
    onClick() {
      const emitterHandler = EmitterViewerHandler.getInstance();
      emitterHandler.emit(VIEWER_SPRITE_CLICK, { node: this.data });
      store.dispatch(ActionTypes.SELECT_SPRITES, [this.data.dynamicId]);
      const el = document.querySelector(".dataContainer");
      el.dispatchEvent(
        new CustomEvent("onSpriteClick", { detail: { ...this.data } })
      );
    },
    _isSelected() {
      this.dynamicStyle = {
        border: "3px solid #00A2FF",
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
  width: 20px;
  height: 20px;
  border-radius: 100%;
  /* border: 3px solid #F9F9F9; */
  /* border: 3px solid; */
  z-index: 2;
}
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
