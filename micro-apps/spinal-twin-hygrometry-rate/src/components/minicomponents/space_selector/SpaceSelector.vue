<template>
<div>
  <div class="glass" v-show="dropDown" @click="dropDown = false;"></div>
  <v-card elevation="8" color="#14202C" class="strech" :class="{drop: dropDown}" width="100%" style="border-radius: 10px !important;color: #bfbfbf" >
    <div @click="dropDown = !dropDown" id="selected" style="border-radius: 0px;height: 50px; background-color: #14202C;">
    <v-progress-circular
    v-if="selection==''"
    style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-size: 24px;"
      indeterminate
      color="white"
    ></v-progress-circular>
      <p v-else style="font-weight: 400; padding: 6px; font-size: 24px;overflow: hidden; text-overflow: ellipsis;white-space: nowrap;">{{selection}}
        <v-icon style="color: #bfbfbf; float: left; padding: 6px; font-size: 30px;" class="rotate-disabled" :class="{'rotate-enabled': dropDown}">mdi-chevron-down</v-icon>
      </p>
    </div>

    <div class="card-list" :class="{'fade-in': dropDown}" >
      <div @click="expand = !expand" style="margin-left: 10px; margin-right: 10px; height: 50px; background-color: #14202C; border: 1px solid #bfbfbf; border-radius: 6px;">
        <div class="d-flex flex-row" style="cursor: pointer; padding: 12px; margin-bottom: 0px;">
          <div class="color-square" style="margin-left : 0px; margin-top: 4px;" :style="{'background-color': privateRootElement.color}" @click="logFunction();"></div>
          <div style="width: 100%; cursor: pointer; padding-left: 12px; margin-bottom: 0px;"   @click="select(privateRootElement); selection = privateRootElement.name">
            {{privateRootElement.name}}
          </div> 
          <v-btn 
            elevation="8" 
            fab 
            icon 
            raised 
            text 
            tile 
            style="color: #bfbfbf; float: right; margin-top: -12px; margin-right: -11px; border-radius: 6px;"
            @click="root=!root;"  
            :disabled="rootButton"
          >
          <expand-load-collapse :rootButton="rootButton" :root="root"></expand-load-collapse>
          </v-btn>
        </div>
      </div>


      <transition-group name="fade" tag="div" v-bind:css="true" v-on:enter="enter" v-on:leave="leave">
        <div v-for="(item) in buildingStructure" :key="item.dynamicId" >
          <div class="first-nested-level card-hover fade" :style="{'margin-bottom': checkLast(item), 'margin-left': ''+((item.level-1)*20+30)+'px'}">
          <!-- <div style="height: 100%; width: 100%; position: relative; background-color: green;" @click="select(item); selection = item.name"></div> -->
            <div class="first-nested-level-angle"></div>
            <div class="first-nested-level-angle-extend" v-show="item.isFirst==undefined"></div>
            <div class="parent-link" v-for="depth in item.level-1" :key="depth" v-show="canDraw(item, depth)" :style="{'margin-left': '-'+(depth*20+11)+'px'}"></div>
            <div class="color-square" :style="{'background-color': item.color}" @click="logFunction();"></div>
            <div class="d-flex flex-row" style="cursor: pointer; padding: 12px; margin-bottom: 0px;">

          <div style="width: 100%; cursor: pointer; padding-left: 12px; margin-bottom: 0px;"   @click="select(item); selection = item.parentLink.join(' - ')">
            {{item.name}}
          </div> 
              <v-btn 
                elevation="0" 
                fab 
                icon
                raised 
                text 
                tile 
                style="color: #bfbfbf; position: absolute; right: 25px; margin-top: -12px; margin-right: -13px; border-radius: 6px;"
                @click="expandCollapse(item)"
                v-show="item.level != maxDepth"
              >

              <!--@click="selectElement(''+index); navigation(item); $emit('nav', item)"-->
              <expand-load-collapse :rootButton="item.loading" :root="item.isOpen"></expand-load-collapse>
              </v-btn>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </v-card>
</div>
</template>

<script>
import Velocity from "velocity-animate";
import { getRooms, getEquipments } from "../../../functions/getBuilding";
import ExpandLoadCollapse from "./ExpandLoadCollapse.vue";
export default ({
  components: {
    ExpandLoadCollapse
  },
  props: {
    onopen: {
      
    },
    rootElement: {
      type: Object,
      required: true,
    },
    maxDepth: {
      type: Number,
      required: true,
    }
  },
  data: () => ({
    selection: '',
    privateRootElement: {},
    rootButton: false,
    root: false,
    buildingName: 'BATIMENT A',
    buildingStructure: [],
    active: [],   
    flag: true,               
    expand: true,
    dropDown: false,
  }),
  methods: {
    select(item) {
      this.$emit('select', item);
    },
    expandCollapse(item) {
      const nextDepth = item.level + 1;
      const doCall = function(a){
        if(a.length>0){
          a[0]['isFirst'] = true;
          a[a.length-1]['isLast'] = true;
          a[a.length-1]['isLastInGroup'] = true;
          const newForbidden = item.doNotDraw.map(x => x+1)
          if(item.isLast && item.isLast==true)
            newForbidden.unshift(1)
          a = a.map(obj => {
            obj['level'] = nextDepth;
            obj['isOpen'] = false;
            obj['doNotDraw'] = newForbidden;
            obj['loading'] = false;
            obj['parentLink'] = item.parentLink.concat(obj.name);
            return obj;
          })
        }
        return a;
      }
      let index = this.buildingStructure.indexOf(item);
      this.buildingStructure[index].isLastInGroup=false;
      if(!item.isOpen) {
        this.buildingStructure[index].loading = true;
        this.onopen(item).then(r => {
          this.buildingStructure.splice(index+1, 0, ...doCall(r))
          this.rootButton = false;
        })
        .then(() => this.buildingStructure[index].loading = false);
      }
      else {
        const elementByLevel = (i) => i.level <= item.level;
        const removeBlock = this.buildingStructure.slice(index+1, this.buildingStructure.length).findIndex(elementByLevel);
        
        switch (removeBlock) {
          case 0:
            break;
          case -1:
            this.buildingStructure.splice(index+1, this.buildingStructure.length);
            break;
          default:
            this.buildingStructure.splice(index+1, removeBlock);
            break;
        }
      }
      this.buildingStructure[index].isOpen = !this.buildingStructure[index].isOpen;
    },
    mtd(s) {
      if(s.level == 0){
        if(this.buildingStructure.length>0){
          this.buildingStructure = []
          this.rootButton = false;
        return ;
        }
      }
      const doCall = function(a){
        if(a.length>0){
          a[0]['isFirst'] = true;
          a[a.length-1]['isLast'] = true;
          a[a.length-1]['isLastInGroup'] = true;
          const newForbidden = s.doNotDraw.map(x => x+1)
          if(s.isLast && s.isLast==true)
            newForbidden.unshift(1)
          a = a.map(obj => {
            obj.doNotDraw = newForbidden;
            return obj;
          })
        }
        return a;
      }
        // console.log(s)
      this.onopen(s).then(r => {
        this.buildingStructure.splice(1, 0, ...doCall(r))
        this.rootButton = false;
      });
    },
    navigation(element) {
      if(element.level == 0){
        this.root = !this.root;
        return ;
      }
      let index = this.buildingStructure.indexOf(element);
      this.buildingStructure[index].isLastInGroup=false;
      if(!element.isOpen) {
        this.buildingStructure[index].loading = true;
        const doCall = function(a){
          if(a.length>0){
            a[0]['isFirst'] = true;
            a[a.length-1]['isLast'] = true;
            a[a.length-1]['isLastInGroup'] = true;
            const newForbidden = element.doNotDraw.map(x => x+1)
            if(element.isLast && element.isLast==true)
              newForbidden.unshift(1)
              a = a.map(obj => {
                obj['doNotDraw'] = newForbidden;
                return obj;
            })
          }
          return a;
        }
        switch (element.level){
          case 1:
            getRooms(element.name).then(r => this.buildingStructure.splice(index+1, 0, ...doCall(r))).then(() => this.buildingStructure[index].loading = false);
            break;
          case 2:
            getEquipments(element.name).then(r => this.buildingStructure.splice(index+1, 0, ...doCall(r))).then(() => this.buildingStructure[index].loading = false);
            break;
          default:
            break
        }

      }
      else {
        const elementByLevel = (e) => e.level <= element.level;
        const removeBlock = this.buildingStructure.slice(index+1, this.buildingStructure.length).findIndex(elementByLevel);

        switch (removeBlock) {
          case 0:
            break;
          case -1:
            this.buildingStructure.splice(index+1, this.buildingStructure.length);
            break;
          default:
            this.buildingStructure.splice(index+1, removeBlock);
            break;
        }
      }
      this.buildingStructure[index].isOpen = !this.buildingStructure[index].isOpen;
    },
    canDraw(element, depth) {
      if(element.doNotDraw.includes(depth)) return false;
      return true;
    },
    checkLast(first) {
      if(first.isLastInGroup!=undefined && first.isLastInGroup==true) return '6px';
      const maxLength = this.buildingStructure.length;
      const indexOfElement = this.buildingStructure.indexOf(first);
      if(indexOfElement < maxLength-1 && this.buildingStructure[this.buildingStructure.indexOf(first)+1].level < first.level) return '6px';
      return '0px';
    },
    reset() {
      document.getElementById('selected').scrollIntoView();
    },
    selectElement(index) {
      if(this.active.includes(index))
        this.active = this.active.filter(e => e !== index);
      else
        this.active.push(index)
    },
    enter: function (el, done) {
        Velocity(
          el, 'fadeIn',
          { complete: done, duration: 200 }
        )
    },
    leave: function (el, done) {
        Velocity(
          el, 'fadeOut',
          { complete: done, duration: 200 }
        )
    }
  },
  mounted() {
    this.selection = this.rootElement.name
    this.privateRootElement = this.rootElement;
    this.privateRootElement['level'] = 0;
    this.privateRootElement['isOpen'] = false;
    this.privateRootElement['doNotDraw'] = [];
    this.privateRootElement['loading'] = false;
    this.privateRootElement['parentLink'] = [this.rootElement.name];
  },
  watch: {
    rootElement(v1) {
      this.selection = v1.name;
      this.privateRootElement = this.rootElement;
      this.privateRootElement['level'] = 0;
      this.privateRootElement['isOpen'] = false;
      this.privateRootElement['doNotDraw'] = [];
      this.privateRootElement['loading'] = false;
      this.privateRootElement['parentLink'] = [this.rootElement.name];
    },
    dropDown(v1) {
      if (v1 == false) this.reset();
    },
    root(v1) {
      if(v1) {
        this.rootButton = true;
        const nextDepth = this.privateRootElement.level + 1;

        this.onopen(this.privateRootElement).then(r => {
          if(r.length>0){
            r[0]['isFirst'] = true;
            r[r.length-1]['isLast'] = true;
            for(let i = 0; i< r.length; i++){
            r[i]['parentLink'] = [];
            r[i].parentLink.push(this.privateRootElement.name);
            r[i].parentLink.push(r[i].name);
            }
            r = r.map(obj => {
              obj['level'] = nextDepth;
              obj['isOpen'] = false;
              obj['doNotDraw'] = [];
              obj['loading'] = false;
              return obj;
            })
            this.buildingStructure.splice(0, 0, ...r);
            this.rootButton = false
          }
          this.rootButton = false;
        });


      }
      else this.buildingStructure = [];
    },
    // responseArray: function(newV, ondV) {

    // },
  }
})
</script>

<style scoped>

.smooth-load-start-enter-active, .smooth-load-start-leave-active {
  transition: all .5s;
}

.smooth-load-start-enter, .smooth-load-start-leave-to {
  opacity: 0;
}

.smooth-load-end-enter-active, .smooth-load-end-leave-active {
  transition: all .5s;
}

.smooth-load-end-enter, .smooth-load-end-leave-to {
  opacity: 0;
}

.fade-move {
  transition: transform .2s;
}

.fade-leave-active {
  position: absolute;
  width: 100%;
}

.strech {
  z-index: 1000;
  width: 500px !important;
  min-width: 500px;
  height: 50px;
  transition: height 0.3s ease-out;
  float: right;
  overflow: hidden;
}

.card-list {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.fade-in {
  opacity: 1;
  transition: opacity 0.3s ease-in;
}
.drop {
  padding-bottom: 12px;
  overflow-y: auto;
  height: calc(100vh - 24px);
  transition: height 0.3s ease-in;
}

.rotate-enabled {
  transform: rotate(-180deg);
  transition: transform 0.30s ease-in;;
}

.color-square {
  margin-top: 16px;
  margin-left: 8px;
  border-radius: 2px;
  display: inline-block;
  position: absolute;
  height: 16px;
  width: 6px;
}

.first-nested-level {
  /* margin-left: 30px; */
  margin-right: 10px;
  height: 50px;
  background-color: #14202C;
  border: 1px solid #bfbfbf;
  border-radius: 6px;
  /* border-top: none; */
  margin-top: -1px;
  }

.first-nested-level-angle {
  margin-left: -11px;
  height: 24px;
  background-color: transparent;
  border: 1px solid #5c5c5c;
  border-radius: 6px;
  margin-top: 0;
  width: 10px;
  border-right: none;
  border-top: none;
  position: absolute;
  border-bottom-right-radius: 0;
  border-top-left-radius: 0;
}

.first-nested-level-angle-extend {
  margin-left: -11px;
  height: 50px;
  background-color: transparent;
  border: 1px solid #777777;
  border-radius: 6px;
  margin-top: -30px;
  width: 10px;
  border-right: none;
  border-bottom: none;
  border-top: none;
  position: absolute;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: 0;
}

.parent-link {
  height: 65px;
  background-color: transparent;
  border: 1px solid #777777;
  border-radius: 6px;
  margin-top: -30px;
  width: 10px;
  border-right: none;
  border-bottom: none;
  border-top: none;
  position: absolute;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-top-left-radius: 0;
}

.card-hover:hover {
  background-color: #444;
}

::v-deep .v-btn--fab.v-size--default{
  height: 48px;
  width: 50px;
}

::v-deep .v-application p{
  margin-bottom: 0px !important;
}

::-webkit-scrollbar {
  width: 4px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #ffffff80; 
  border-radius: 10px;
  border-top-left-radius: 0px !important;
  border-bottom-left-radius: 0px !important;
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: #133b6a; 
  border-radius: 10px;
  border-top-left-radius: 0px !important;
  border-bottom-left-radius: 0px !important;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #386395; 
  border-top-left-radius: 0px !important;
  border-bottom-left-radius: 0px !important;
}

.glass{
  color: #bfbfbf;
  position: fixed;
  top: 0px;
  width: 100%;
  left: 0px;
  height: 100vh;
  background-color: #fff;
  z-index: 999;
  background: rgba(215, 215, 215, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
}
</style>

<style>
html {
  scroll-behavior: smooth;
  overflow: auto;
}
</style>