<template>
  <div @click="onClick" ref="container" class="sprite_container">
    <div class="sprite_color" :style="{ background: data.color, ...dynamicStyle }"></div>
    <div  v-if="data.attr"  style="border-radius: 10px;top: 4px;left: 23px;text-overflow: ellipsis;max-width: 130px;white-space: nowrap;overflow: hidden;position: absolute;border-radius: 2px !important;min-width: 20px;height: 20px;background-color: rgb(255, 255, 255);color: black;"  :title="findValueByLabel()">{{this.findValueByLabel()}}</div>
    <div class="card-menu" v-if="isClicked">
      <ul class="cards">
        <div style="z-index:99 ;" href="" class="card">
          <div style="display: flex;flex-direction: column;padding-right: 5px;" class="mt-4 ml-4">
            <span @click.stop="onClose"
              style=";font-size:15px; color: rgb(0, 0, 0);position: absolute;right: 15px;top:12px; font-weight:bold;">X</span>
            <span style="font-size:13px; color: rgb(114, 114, 114);">{{ data.type }}</span>
            <span style="font-size: 16px; margin-top: 5px;font-weight: bold;">{{ data.name }}</span>
          </div>
          <div v-if="!showAttr" @click="showAttr = !showAttr"
            style="color: rgb(47, 129, 14);width: 84px;position: absolute;left: 66%; bottom: 10px;border:1px solid rgb(72, 187, 27) ; padding-left : 5px ; border-radius : 4px ; cursor : pointer">
            Voir les attributs</div>
          <div v-else @click="showAttr = !showAttr"
            style="color: rgb(129, 14, 14);width: 105px;position: absolute;left: 59%; bottom: 10px;border:1px solid rgb(187, 27, 27) ; padding-left : 5px ; border-radius : 4px ; cursor : pointer">
            Masquer les attributs</div>
          <div @click="showAttr = !showAttr" class="card__overlay">
            <!-- <div class="card__header">
              <div class="card__header-text">
                <h3 v-if="!showAttr" class="card__title">Afficher Les Attributs</h3>
                <h3 v-if="showAttr" class="card__title">Masquer Les Attributs</h3>
                <span class="card__status">Bulding ID : {{ data.buildingId }}</span>
              </div>
            </div> -->
          </div>
        </div>
      </ul>
      <div @click="showAttr = !showAttr" v-if="showAttr"
        style="font-weight: bol d;border: 1px solid rgb(255, 255, 255);color blue ; font-size: 16px;justify-content: center;align-items: center;display: flex;z-index: 99;width: 30px;height: 30px;border-radius: 30px;background-color: rgb(246, 246, 246);position: relative;top: 53%;left: 100%;transform: translate(-50%,-50%);">
        ></div>
    </div>
    <div class="dropleft" v-if="showAttr"
      style="color: black;width: 300px;background-color: rgb(255, 255, 255);left: 340px;top: -80px;position: absolute;border-radius: 10px;padding-left: 7px;padding-right: 7px;padding-bottom: 7px;">
      <div v-for="category in data.categoryAttributes" :key="category.dynamicId" class="category">
        <h3
          style="background-color: rgb(220, 220, 220);border-top-right-radius: 3px;border-top-left-radius: 3px;padding-left: 3px;">
          {{ category.name }}</h3>
        <div v-for="attribute in category.attributs" :key="attribute.date" class="attribute">
          <strong style="font-size: 14px;">{{ attribute.label }}:</strong> {{ attribute.value }}
        </div>
      </div>
    </div>
  </div>
</template> 
<script>

import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";

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
        console.error(error);
        return "";
      }
    },
  },
  data: () => ({
    showAttr: false,
    fav: true,
    menu: false,
    message: false,
    hints: true,
    dynamicStyle: {
      border: "3px solid #F9F9F9",
      boxShadow: "none",
    },
    isClicked: false,
  }),
  mounted() {
    document.addEventListener("click", (evt) => {
      const flyoutEl = this.$refs.container;
      let targetEl = evt.target;
      while (targetEl) {
        if (targetEl === flyoutEl) {
          return;
        } else if (targetEl.classList && targetEl.classList.contains('sprite_container') && targetEl !== flyoutEl) {
          this._isNotSelected();
          return;
        }
        targetEl = targetEl.parentNode;
      }
    });

  },
  methods: {
    findValueByLabel() {
      console.log("toto", this.data.categoryAttributes , this.data.attr);
      for (const category of this.data.categoryAttributes) {
        for (const attribute of category.attributs) {
          if (attribute.label === this.data.attr) {
            console.log(attribute.value);
            return attribute.value;
          }
          else if (this.data.attr === "Nom") {
            return this.data.name
          }
        }
      }
      return undefined;
    },

wayne() {
      console.log(this.data);
    },

    shouldDisplayAttribute(attr) {
      // Liste des labels à exclure
      const excludedLabels = ['name', 'XYZ center'];
      return !excludedLabels.includes(attr.label);
    },
    onClose() {
      this.isClicked = false;
      this.showAttr = false;
      this._isNotSelected();
    },

    onClick() {
      this.isClicked = true;
      const emitterHandler = EmitterViewerHandler.getInstance();
      emitterHandler.emit(VIEWER_SPRITE_CLICK, { node: this.data });
      if (this.isClicked)
        this._isSelected();
      else {
        this._isNotSelected();
      }
    },
    _isSelected() {
      this.data.color = 'cyan'
      this.isClicked = true;
      const enfant = this.$refs.container;
      if (enfant && enfant.parentElement) {
        enfant.parentElement.style.zIndex = '99';
      }

      this.dynamicStyle = {
        border: "3px solid #00A2FF",
        boxShadow: "0px 0px 10px 2px #00A2FF",
      };
    },
    _isNotSelected() {
      this.showAttr = false;
      this.data.color = 'blue'
      this.isClicked = false;
      const enfant = this.$refs.container;
      if (enfant && enfant.parentElement) {
        enfant.parentElement.style.zIndex = '1';
      }

      this.dynamicStyle = {
        border: "3px solid #F9F9F9",
        boxShadow: "none",
      };
    },
  },
};

</script>
  
<style lang="scss" >
.category {
  background-color: rgb(245, 245, 245);
  margin-top: 8px;
  overflow: hidden;
  border-radius: 3px;
  border: 1px solid rgb(220, 220, 220);

}

.attribute {
  font-size: 10px;
  margin-left: 10px;
}

.dropleft {
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  left: 200px;
  -webkit-animation: scale-in-hor-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  animation: scale-in-hor-left 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}

@-webkit-keyframes scale-in-hor-left {
  0% {
    -webkit-transform: scaleX(0);
    transform: scaleX(0);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scaleX(1);
    transform: scaleX(1);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }
}

@keyframes scale-in-hor-left {
  0% {
    -webkit-transform: scaleX(0);
    transform: scaleX(0);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scaleX(1);
    transform: scaleX(1);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }
}

.card-menu {
  left: 50%;
  top: 50%;
  border-bottom-left-radius: 12px !important;
  border-bottom-right-radius: 12px !important;
  border-top-right-radius: 12px !important;
  position: absolute;
  background-color: white;
  width: 310px;
  height: 104px;
  -webkit-animation: scale-in-tl 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  animation: scale-in-tl 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  z-index: 99999 !important;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  color: black;
  font-size: 10px;
}

@-webkit-keyframes scale-in-tl {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }
}

@keyframes scale-in-tl {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }
}



// .card {
//   width: 300px;
//   height: 300px;
//   overflow: hidden;
//   z-index: 99999;
// }

.sprite_container {
  overflow: hidden;
  border-radius: 100%;
  z-index: 2 !important;
}

.new-class {
  width: 200px;
  height: 200px;
}

.sprite_color {
  background-color: red;
  width: 20px;
  height: 20px;
  border-radius: 100%;
  z-index: 0 !important;

}

.sprite_value_unit {
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


.cards {
  padding-left: 0 !important;
}

.card {
  position: relative;
  display: block;
  height: 100%;
  border-radius: calc(var(--curve) * 1px);
  overflow: hidden;
  text-decoration: none;

}

.card__image {
  width: 100%;
  height: auto;
}

.card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  border-radius: calc(var(--curve) * 1px);
  background-color: var(--surface-color);
  transform: translateY(100%);
  transition: .2s ease-in-out;

}

.card__header {
  position: relative;
  left: 0px;
  display: flex;
  align-items: center;
  gap: 2em;
  padding: 2em;
  border-radius: calc(var(--curve) * 1px) 0 0 0;
  background-color: var(--surface-color);
  transform: translateY(-100%);
  transition: .2s ease-in-out;
  background-color: rgb(244, 244, 244);
  border-top-left-radius: 10px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  cursor: pointer;
}

.card__header:hover {
  background-color: rgb(230, 230, 230);
}

.card__arc {
  width: 80px;
  height: 80px;
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 1;

}

.card__arc path {
  fill: var(--surface-color);
  d: path("M 40 80 c 22 0 40 -22 40 -40 v 40 Z");
}

// .card:hover .card__header {
//   transform: translateY(0);
// }

.card__thumb {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.card__title {
  font-size: 1.5em;
  margin: 0 0 .3em;
  color: #000000;
}

.card__tagline {
  display: block;
  margin: 1em 0;
  font-family: "MockFlowFont";
  font-size: .8em;
  color: #D7BDCA;
}

.card__status {
  font-size: .9em;
  color: #616161;
}

.card__description {
  padding: 0 2em 2em;
  margin: 0;
  color: #000000;
  font-family: "MockFlowFont";
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  // background-color: rgb(138, 29, 29);
  border-bottom-left-radius: 15px;
  font-size: 11px;
  // background-color: rgb(244, 244, 244);
}
</style>