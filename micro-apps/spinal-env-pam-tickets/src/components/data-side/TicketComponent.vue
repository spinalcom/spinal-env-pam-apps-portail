<!--
Copyright 2023 SpinalCom - www.spinalcom.com

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
  <!-- <div>{{ data.name }}</div> -->
  <v-card class="bar-bloc-left rounded-lg" elevation="2">
    <div style="display: flex" class="px-3 py-2">
      <div class="flex-col">
        <div style="width: 150px">
          <div
            class="bar-title-section mb-1 d-flex flex-row flex-shrink-1 align-center justify-start"
          >
            <div
              class="colored-square mr-1"
              :style="{
                background: color[data.priority] + ' no-repeat padding-box',
              }"
            ></div>
            <span>{{ "#" + data.gmaoId }}</span>
          </div>
          <div class="mb-4 bar-title-nom">
            {{
              new Date(data.creationDate).toLocaleDateString("fr-FR", {
                timeZone: "UTC",
              })
            }}
          </div>
        </div>
        <div
          class="icon-bloc d-flex flex-row justify-space-around align-center"
        >
          <v-btn @click="$emit('display', data)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn
            dark
            :disabled="!data.elementSelected"
            @click="$emit('locate', data)"
          >
            <v-icon>mdi-map-marker</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="pl-3" style="width: calc(100% - 150px); height: 25px">
        <div style="width: 100%" class="d-flex flex-row justify-space-between">
          <div class="bar-title-section mb-1" style="width: calc(50% - 4px)">
            <span
              style="
                text-overflow: ellipsis;
                white-space: nowrap;
                display: block;
              "
            >
              {{ data.elementSelected.name }}
            </span>
          </div>
          <div
            style="
              width: calc(50% - 4px);
              text-overflow: ellipsis;
              text-align: end;
              white-space: nowrap;
              display: block;
            "
          >
            {{ data.step.name }}
            <v-icon v-if="data.file_list.length" style="color: green"
              >mdi-paperclip</v-icon
            >
          </div>
        </div>
        <div class="mb-4 bar-title-nom">{{ data.name }}</div>
        <div style="">
          <div class="flex-col">
            {{ data.process.name }}
            <div class="text-description">
              {{ data.description }}
            </div>
            <!-- <div class="text-description">Le texte de description 2 ++</div> -->
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import Component from "vue-class-component";

@Component({
  components: {},
  filters: {},
})
class TicketComponent extends Vue {
  // @State data!: any[];

  @Prop() data: any;
  color = ["red", "yellow", "green"];

  async mounted() {}

  /**
   * Watch
   */
}

export { TicketComponent };
export default TicketComponent;
</script>
<style lang="scss">
.bar-bloc-left {
  margin: 10px;
}
.status-label {
  position: absolute;
  top: 0px;
  right: 10px;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.text-description {
  color: gray;
  font-size: 15px;
}

.icon-bloc {
  background-color: rgba(244, 244, 244, 0.875);
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  border: 1px solid rgb(186, 186, 186);
}

.bar-title-section {
  letter-spacing: 0.6px;
  color: #435567;
  font-size: 12px;
  font-family: Arial, Helvetica, sans-serif;
  letter-spacing: 0.5px;
}

.bar-title-nom {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: 1.1px;
  font-size: 24px;
  // font-size: 15px;
  font-weight: 100;

  color: #14202c;
}

.bar-sub-title {
  color: #949da6;
  font: normal normal normal 11px/13px Charlevoix Pro;
  margin-bottom: 10px;
}

.colored-square {
  width: 6px;
  height: 15px;
  border-radius: 2px;
}
</style>
