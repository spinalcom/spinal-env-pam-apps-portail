<!--
Copyright 2022 SpinalCom - www.spinalcom.com

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
  <v-list v-if="data.length > 0"
          class="sidebarlist">
    <template v-for="(item,index) in data">
      <v-list-group :key="item.id"
                    v-if="item.children && item.children.length > 0"
                    :sub-group="subContent">
        <template v-slot:activator>
          <v-list-item-icon v-if="item.icon">
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-title>{{item.name || item.title}}</v-list-item-title>
        </template>

        <list-component :data="item.children"
                        :subContent="true"></list-component>
      </v-list-group>

      <v-list-item v-else
                   :key="index">
        <v-list-item-title>
          {{item.name || item.title}}
        </v-list-item-title>

        <v-list-item-icon v-if="item.icon">
          <v-icon v-text="item.icon"></v-icon>
        </v-list-item-icon>
      </v-list-item>
    </template>
  </v-list>
</template>

<script lang="ts">
import { IList } from "../../interfaces/IList";

export default {
  name: "listComponent",
  props: {
    data: {
      default: (): IList[] => [],
    },
    subContent: { type: Boolean, default: false },
  },
};
</script>

<style scoped>
.sidebarlist {
  background: transparent !important;
  color: white;
}
</style>

<style>
.sidebarlist .v-list-item {
  /* border: 1px solid white; */
  color: white !important;
  margin: 0 5px;
}

.sidebarlist .v-list-item i {
  color: white !important;
}
</style>