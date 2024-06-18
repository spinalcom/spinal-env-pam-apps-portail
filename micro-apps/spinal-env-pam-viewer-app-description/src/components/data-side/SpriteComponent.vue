<template>

  <div class="menu">
    <!-- <v-icon>mdi-chevron-left</v-icon> -->
    <div v-if="isopen" ref="container" class="container">
      <div @click="close()" style="justify-content: center;align-items: center;display: flex;background-color: white;cursor: pointer;border-radius: 25px;width: 20px; height: 20px;position: absolute;right: -8px;font-size: 13px;z-index: 9;top: 3px;font-weight: bold;border: 1px solid gray;color: #14202c;">X</div>
      <div class="card">
        <div class="top-section">
          <div class="border"></div>
          <div class="icons">
            <div :title="data.name" class="logo">
              {{ data.name }}
            </div>
            <div
              style="justify-content: center;align-items: center;display: flex;background-color: #14202c;cursor: pointer;width: 20px; height: 20px;position: absolute;right: 15px;font-size: 20px;transform: translateY(-4px);"
              @click="onClickNavigate()">
              &#x21AA;
            </div>
            
            <div class="social-media">
              <!-- {{ parseFloat(data.data.attributsList[0].attributs[4].value.toFixed(1)) }}m² -->
            </div>
          </div>
          <div style="display : flex ; flex-direction: column ; width: 100%;">
            <div style="width: 100%;">
              <div style="display: flex;margin-top: 10px">
                <div
                  style="border: 1px solid  #14202c;border-radius: 5px;color: orange; font-size: 11px;font-weight: bold;width: 50%;">
                  <div
                    style="display: flex;justify-content: center; align-items: center;color: white;background: #14202c">
                    PRÉSENCE</div>
                  <div
                    style="display: flex;justify-content: center; align-items: center;color: #14202c; font-size: 13px;background-color: white;border-bottom-left-radius: 5px;border-bottom-right-radius: 5px;">
                    <!-- {{ data.data.controlEndpoint[0].endpoints[0].value }} -->
                  </div>
                </div>
                <div
                  style="border: 1px solid  #14202c;border-radius: 5px;color: orange; font-size: 11px;font-weight: bold;width: 50%;margin-left:10px ">
                  <div
                    style="display: flex;justify-content: center; align-items: center;color: white;background: #14202c">
                    occupation</div>
                  <div
                    style="display: flex;justify-content: center; align-items: center;;color: #14202c;font-size: 13px;background-color: white;border-bottom-left-radius: 5px;border-bottom-right-radius: 5px;">
                    <!-- {{ parseFloat(data.data.controlEndpoint[0].endpoints[1].value.toFixed(1)) }}% -->
                  </div>
                </div>
                <!-- <div
                style="border: 1px solid green;border-radius: 5px;color:green ; padding : 2px; font-size: 11px;font-weight: bold;margin-left:10px ;width: 50%;">
                taux d'occupation : {{ parseFloat(data.data.controlEndpoint[0].endpoints[1].value.toFixed(1)) }}%</div> -->
              </div>
              <div style="display: flex;margin-top : 10px;margin-bottom: 10px">
                <div
                  style="border: 1px solid  #14202c;border-radius: 5px;color: orange; font-size: 11px;font-weight: bold;width: 50%;">
                  <div
                    style="display: flex;justify-content: center; align-items: center;color: white;background: #14202c">
                    TEMPERATURE</div>
                  <div
                    style="display: flex;justify-content: center; align-items: center;;color: #14202c;font-size: 13px;background-color: white;border-bottom-left-radius: 5px;border-bottom-right-radius: 5px;">
                    <!-- {{ data.data.controlEndpoint[1].endpoints[0].value }}C° -->
                  </div>
                </div>
                <div
                  style="border: 1px solid  #14202c;border-radius: 5px;color: orange; font-size: 11px;font-weight: bold;width: 50%;margin-left:10px ">
                  <div
                    style="display: flex;justify-content: center; align-items: center;color: white;background: #14202c">
                    AIR</div>
                  <div
                    style="display: flex;justify-content: center; align-items: center;;color: #14202c;font-size: 13px;background-color: white;border-bottom-left-radius: 5px;border-bottom-right-radius: 5px;">
                    xx</div>
                </div>

            

                <!-- <div
                style="border: 1px solid blue;border-radius: 5px;color: blue ; padding : 2px; font-size: 11px;font-weight: bold;width: 50%;">
                temperature : {{ data.data.controlEndpoint[1].endpoints[0].value }}C°</div>
              <div
                style="border: 1px solid yellow;border-radius: 5px;color : yellow ; padding : 2px; font-size: 11px;font-weight: bold;margin-left:10px; width: 50%;">
                CO2/QUALITÉ D'AIRE</div> -->
              </div>

            </div>
          </div>

        </div>
        <div
          style="display:flex;align-items: center; flex-direction: row;width: 100%;justify-content: space-around;transform: translate(0,10px);">
          <button
            style="background-color: #14202c ;color: white; width:50%; font-weight: bold;border-radius: 5px;font-size: 12px;width: 35%;"
            @click.stop="changeRoute('ticket')">
            Tickets
          </button>
          <button
            style="background-color: #14202c ;color: white;width:50%; font-weight: bold;border-radius: 5px;font-size: 12px;width: 35%;"
            @click.stop="changeRoute('insight')">
            Insight
          </button>
        </div>
        <div class="bottom-section">
          <span class="title">Contenu de la piece</span>
          <div class="row row1">
            <div
              style="border-right:1px solid  rgb(215, 215, 215);;border-top:1px solid  rgb(215, 215, 215); background-color: rgb(230, 230, 230);"
              class="item">
              <span class="big-text">XX</span>
              <span class="regular-text">luminaires</span>
            </div>
            <div
              style="border-right:1px solid  rgb(215, 215, 215);;border-top:1px solid rgb(215, 215, 215);background-color: rgb(230, 230, 230);"
              class="item">
              <span class="big-text">XX</span>
              <span class="regular-text">multicapteurs</span>
            </div>
            <div
              style="border-right:1px solid  rgb(215, 215, 215);;border-top:1px solid  rgb(215, 215, 215); ; background-color: rgb(230, 230, 230);"
              class="item">
              <span class="big-text">XX</span>
              <span class="regular-text">Ventilo-convecteur</span>
            </div>
          </div>
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
    isopen: true,
    showAttr: false,
    fav: true,
    menu: false,
    message: false,
    hints: true,
    dynamicStyle: {
      border: "3px solid #F9F9F9",
      boxShadow: "none",
      background: '#13A9E0'
    },
    isClicked: false,
  }),
  mounted() {
    // document.addEventListener("click", (evt) => {
    //   evt.stopPropagation();
    //   const flyoutEl = this.$refs.container;
    //   let targetEl = evt.target;
    //   console.warn(targetEl , 'la target');
    //   while (targetEl) {
    //     if (targetEl === flyoutEl) {
    //       console.warn('tototot');
    //       return;
    //     } else if (targetEl.classList && targetEl.classList.contains('sprite_container') && targetEl !== flyoutEl) {
    //       console.warn('tatata');
    //       this._isNotSelected();
    //       return;
    //     }
    //     console.warn('adadadad');
    //     targetEl = targetEl.parentNode;
    //   }
    // });
    // document.addEventListener("click", (evt) => {
    //   evt.stopImmediatePropagation(); // Cela empêche l'événement de se propager plus loin dans la phase de capture et de bouillonnement
    //   if (evt.target.tagName === 'CANVAS') {
    //     console.log("salut");
    //   }
    // }, true);

  },
  methods: {
    close() {
      this.isopen = false;
    },
    changeRoute(route) {
      const query = {}
      if (route == 'insight')
        query.app = "eyJuYW1lIjoiSW5zaWdodHMiLCJ0eXBlIjoiQnVpbGRpbmdBcHAiLCJpZCI6ImIwZTEtNzI3NS02YWNhLTE4ZjJlMjE1NmE4IiwiZGlyZWN0TW9kaWZpY2F0aW9uRGF0ZSI6MTcxNDQ2NTk0NzM4MCwiaW5kaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE0NDY1ODg3OTEyLCJpY29uIjoibWRpLWN1cnRhaW5zLWNsb3NlZCIsImRlc2NyaXB0aW9uIjoiSU5zaWdodHMiLCJ0YWdzIjpbIkluc2lnaHRzIl0sImNhdGVnb3J5TmFtZSI6IiIsImdyb3VwTmFtZSI6IiIsImhhc1ZpZXdlciI6ZmFsc2UsInBhY2thZ2VOYW1lIjoic3BpbmFsLWVudi1wYW0taW5zaWdodHMiLCJpc0V4dGVybmFsQXBwIjpmYWxzZSwibGluayI6IiIsInJlZmVyZW5jZXMiOnt9LCJwYXJlbnQiOnsicG9ydG9mb2xpb0lkIjoiMzdkZS0wMmI4LWUxOGItMTg1MDY0M2I2OGEiLCJidWlsZGluZ0lkIjoiNTkzMi02MDg2LTllMWEtMTg1MDY0Nzg0NjAifX0"
      else {
        query.app = "eyJuYW1lIjoic3BpbmFsLWVudi1wYW0tdGlja2V0cyIsInR5cGUiOiJCdWlsZGluZ0FwcCIsImlkIjoiZWI0ZC1hM2MxLWVmMTEtMThmMjBkZGM5YzciLCJkaXJlY3RNb2RpZmljYXRpb25EYXRlIjoxNzE0MjQzMzcyMzcxLCJpbmRpcmVjdE1vZGlmaWNhdGlvbkRhdGUiOjE3MTQyNDMzNTcxMjcsImljb24iOiJtZGktdGlja2V0LWFjY291bnQiLCJkZXNjcmlwdGlvbiI6IiIsInRhZ3MiOlsidGlja2V0Il0sImNhdGVnb3J5TmFtZSI6IiIsImdyb3VwTmFtZSI6IiIsImhhc1ZpZXdlciI6ZmFsc2UsInBhY2thZ2VOYW1lIjoic3BpbmFsLWVudi1wYW0tdGlja2V0cyIsImlzRXh0ZXJuYWxBcHAiOmZhbHNlLCJsaW5rIjoiIiwicmVmZXJlbmNlcyI6e30sInBhcmVudCI6eyJwb3J0b2ZvbGlvSWQiOiIzN2RlLTAyYjgtZTE4Yi0xODUwNjQzYjY4YSIsImJ1aWxkaW5nSWQiOiI1OTMyLTYwODYtOWUxYS0xODUwNjQ3ODQ2MCJ9fQ"
      }
      query.buildingId = this.data.buildingId
      query.spaceSelectedId = this.data.dynamicId
      query.name = this.data.name
      window.parent.routerFontion.customPush(window.parent.router.path, query);
    },
    extrairePrefixe(str) {
      const dernierSlashIndex = str.lastIndexOf('/');
      if (dernierSlashIndex !== -1) {
        return str.substring(0, dernierSlashIndex);
      }
      return str;
    },
    findValueByLabel() {
      for (const category of this.data.categoryAttributes) {
        for (const attribute of category.attributs) {
          if (attribute.label === this.extrairePrefixe(this.data.attr)) {
            return attribute.value;
          }
          else if (this.data.attr === "Nom") {
            return this.data.name
          }
        }
      }
      return undefined;
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

    onClickNavigate() {
      const emitterHandler = EmitterViewerHandler.getInstance();
      emitterHandler.emit(VIEWER_SPRITE_CLICK, { navigate: 'la page', node: this.data });
    },

    // onClick(ev) {
    //   ev.stopPropagation();
    //   ev.preventDefault();
    //   ev.stopImmediatePropagation();

    //   console.log(this, ev)
    //   this.isClicked = true;
    //   const emitterHandler = EmitterViewerHandler.getInstance();
    //   emitterHandler.emit(VIEWER_SPRITE_CLICK, { node: this.data });
    //   if (this.isClicked)
    //     this._isSelected();
    //   else {
    //     this._isNotSelected();
    //   }
    //   return false;
    // },

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

<style scoped>
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
  position: absolute;
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
  min-width: 310px;
  /* min-height: 300px; */
  height: auto;
  z-index: 99999 !important;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  color: black;
  font-size: 10px;
  overflow: visible;

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




/* .sprite_container {
  overflow: hidden;
  border-radius: 100%;
  z-index: 2 !important;
} */
.container {
  z-index: 9999;
  width: 250px;
  /* background-color: red; */

}

.new-class {
  width: 200px;
  height: 200px;
}

.sprite_color {
  background-color: #13A9E0;
  width: 13px;
  height: 13px;
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
  width: 360px;
}

/* .card {
  position: relative !important;

  border-radius: calc(var(--curve) * 1px);


} */

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
  background-color: rgb(211, 211, 211);
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
  border-bottom-left-radius: 15px;
  font-size: 11px;
}

.menu {
  position: absolute;
  overflow: visible
}

.card {
  border: 1px solid rgb(179, 179, 179);
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  width: 280px;
  border-bottom-left-radius: 12px !important;
  border-bottom-right-radius: 12px !important;
  border-top-right-radius: 12px !important;
  background: #f1f1f1;
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 5px;
  overflow: hidden;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 20px 0px;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative !important;
}

/* 
.card:hover {
  transform: scale(1.05);
} */

.card .top-section {
  height: 150px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  /* background: linear-gradient(45deg, #8d8d8d 0%, rgb(156, 156, 156) 100%); */
  position: relative;
}

.card .top-section .border {
  height: 51px;
  /* width: 70%; */
  background: #fff;
  border-bottom-right-radius: 10px;
  position: relative;
  transform: skew(-40deg);
  box-shadow: -2px -20px #fff;
  left: -67px;
  top: -5px;
}

.card .top-section .border::before {
  content: "";
  position: absolute;
  width: 15px;
  height: 15px;
  top: 0;
  right: -15px;
  background: rgba(255, 255, 255, 0);
  border-top-left-radius: 10px;
  box-shadow: -5px -5px 0 2px #ffffff;
}

.card .top-section::before {
  content: "";
  position: absolute;
  top: 30px;
  left: 0;
  background: rgba(255, 255, 255, 0);
  height: 15px;
  width: 15px;
  border-top-left-radius: 15px;
  box-shadow: -5px -5px 0 2px #ffffff;
}

.card .top-section .icons {
  position: absolute;
  top: 0;
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: space-between;
}

.card .top-section .icons .logo {
  height: 100%;
  aspect-ratio: 1;
  /* padding:  */
  white-space: nowrap;
  font-weight: 15px;
  color: #14202c;
  font-weight: bold;
  font-size: 15;
  margin-top: 6px;
  /* background-color: red; */
  text-overflow: ellipsis;
  overflow: hidden;
  width: 70%;
}

.card .top-section .icons .logo .top-section {
  height: 100%;
}

.card .top-section .icons .social-media {
  height: 100%;
  padding: 8px 0px;
  display: flex;
  gap: 7px;
  font-weight: bold;
  color: #14202c;
}

.card .top-section .icons .social-media .svg {
  height: 100%;
  fill: #1b233d;
}

.card .top-section .icons .social-media .svg:hover {
  fill: rgb(185, 185, 185);
}

.card .bottom-section {
  margin-top: 15px;
  padding: 10px 5px;
}

.card .bottom-section .title {
  display: block;
  font-size: 14px;
  font-weight: bolder;
  color: #14202c;
  text-align: center;
  letter-spacing: 2px;
}

.card .bottom-section .row {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.card .bottom-section .row .item {
  flex: 30%;
  text-align: center;
  padding: 5px;
  color: #14202c;
}

.card .bottom-section .row .item .big-text {
  font-size: 12px;
  display: block;
}

.card .bottom-section .row .item .regular-text {
  font-size: 9px;
}

.card .bottom-section .row .item:nth-child(2) {
  border-left: 1px solid rgba(255, 255, 255, 0.126);
  border-right: 1px solid rgba(255, 255, 255, 0.126);
}
</style>