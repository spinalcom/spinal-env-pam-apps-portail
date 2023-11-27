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
  <div class="_container">
    <div class="header creationHeader">
      <v-btn outlined
             color="#ffffff"
             @click="cancelCreation">
        <v-icon left> mdi-arrow-left </v-icon>
        BACK
      </v-btn>

      <div class="text-h5">
        {{ isEdit ? "Edit Building" : "Add Building" }}
      </div>
      <div class="text-h5"></div>
    </div>
    <div class="content">
      <add-patrimoine-form :edit="isEdit"
                           :buildingToEdit="buildingToEdit"
                           @geoLocate="geoLocate"
                           @cancel="cancelCreation"
                           @submit="addbuildingToPatrimoine">
      </add-patrimoine-form>
    </div>
  </div>
</template>

<script>
import AddPatrimoineForm from "../old/addBuildingForm.vue";

export default {
  name: "addBuilding",
  components: {
    AddPatrimoineForm,
  },
  props: ["isEdit", "buildingToEdit"],
  data() {
    return {
      data: null,
    };
  },
  mounted() {
    if (this.isEdit) this.data = this.buildingToEdit;
  },
  methods: {
    geoLocate() {
      this.$emit("geoLocate");
    },
    cancelCreation() {
      this.$emit("cancel");
    },
    addbuildingToPatrimoine(data) {
      this.$emit("submit", data);
    },
  },
  watch: {
    buildingToEdit() {
      this.data = this.buildingToEdit;
    },
  },
};
</script>

<style scoped>
._container {
  width: 98%;
  height: calc(100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

._container .header {
  width: 97%;
  height: 70px;
  background: #14202c;
  padding: 0 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  margin-top: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

._container .content {
  width: 97%;
  height: calc(100% - 90px);
  background: #f1f5f5;
  border-radius: 10px;
  overflow: auto;
}
</style>