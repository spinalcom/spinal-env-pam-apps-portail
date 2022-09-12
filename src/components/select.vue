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
  <div class="headerSelect">
    <v-select class="selectBar"
              v-model="selected"
              prepend-icon="mdi-chevron-down"
              append-icon=""
              height="100%"
              color="#fff"
              :items="data"
              label="Espace"
              dense></v-select>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    this.default = {
      name: "Patrimoine",
      id: "patrimoine",
    };
    return {
      data: [this.default],
      selected: this.default.id,
    };
  },
  // mounted() {
  //   this.selected = this.default.id;
  // },
  methods: {
    selectedChanged(val) {
      console.log(val);
    },
  },
  computed: {
    ...mapState("appDataStore", ["bos"]),
  },
  watch: {
    selected() {
      this.$emit("selected", this.selected);
    },
    bos() {
      this.data = [this.default, ...this.bos].map(({ name, id }) => ({
        text: name,
        value: id,
      }));
    },
  },
};
</script>

<style lang="scss">
.headerSelect {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background: #14202c;
  padding: 10px;
  .selectBar {
    height: 100%;
    display: flex;
    align-items: center;
    color: white;
  }
}
</style>

<style>
.theme--light.v-text-field > .v-input__control > .v-input__slot:before {
  border: none !important;
}

.v-text-field > .v-input__control > .v-input__slot:after {
  border: none !important;
}

.headerSelect .selectBar .v-input__control {
  height: 100%;
}

.headerSelect .v-text-field .v-label {
  text-transform: uppercase;
  color: #7c8389 !important;
  font-size: 1em;
}

.headerSelect .selectBar .v-input__append-outer .v-icon,
.v-input__prepend-outer .v-icon {
  color: #fff !important;
  font-size: 2.5em !important;
}

.headerSelect .selectBar .v-select__selection {
  color: white;
  font-size: 1.5em;
}
</style>
