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

  <v-list-group v-if="item.children && item.children.length > 0"
                :sub-group="subContent">
    <template v-slot:activator>
      <v-list-item-content>
        <v-list-item-title>{{item.name || item.title}}</v-list-item-title>
      </v-list-item-content>
    </template>

    <group-component :item="item.children"
                     :subContent="true"></group-component>
  </v-list-group>

  <v-list-item v-else>
    <v-list-item-title>
      {{item.name || item.title}}
    </v-list-item-title>

    <v-list-item-icon v-if="item.icon">
      <v-icon v-text="item.icon"></v-icon>
    </v-list-item-icon>
  </v-list-item>

</template>

<script>
export default {
  name: "groupComponent",
  props: {
    data: {},
    subContent: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style>
</style>