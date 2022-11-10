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
  <div class="formContainer">
    <v-form class="form"
            ref="form"
            lazy-validation
            @submit.prevent="submit">
      <v-text-field label="Name"
                    v-model.trim="building.name"
                    :rules="[requiredValidation]"
                    outlined></v-text-field>

      <v-text-field label="Alias"
                    v-model.trim="building.aliasName"
                    outlined></v-text-field>

      <!-- @change="addressChanged" -->

      <places ref="places"
              class="addressInput"
              v-model="building.address"
              :rules="[requiredValidation]"
              placeholder="Address">
      </places>

      <v-text-field label="BOS Url"
                    :rules="[requiredValidation]"
                    v-model.trim="building.urlBos"
                    outlined></v-text-field>

      <v-text-field label="API Url"
                    :rules="[requiredValidation]"
                    v-model.trim="building.apiUrl"
                    outlined></v-text-field>

      <v-text-field label="API client_id"
                    v-model.trim="building.clientId"
                    outlined></v-text-field>

      <v-text-field label="API client_secret"
                    v-model.trim="building.clientSecret"
                    outlined></v-text-field>

      <v-textarea outlined
                  v-model.trim="building.description"
                  name="input-7-2"
                  label="Description"></v-textarea>

      <v-row align="center"
             justify="end">
        <v-btn class="formButton"
               color="error"
               @click="cancel"> cancel </v-btn>
        <v-btn class="formButton"
               type="submit"
               color="primary"> save </v-btn>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import Places from "vue-places";

export default {
  name: "addPatrimoineForm",
  components: {
    // Multiselect,
    Places,
  },
  props: {
    edit: { required: false },
    buildingToEdit: { required: false },
  },
  data() {
    return {
      formIsvalid: false,
      building: {
        name: "",
        aliasName: "",
        urlBos: "",
        apiUrl: "",
        clientId: "",
        clientSecret: "",
        address: "",
        // concerned_user: "",
        description: "",
        picture_base64: "",
        location: {},
      },
    };
  },
  mounted() {
    if (this.edit && this.buildingToEdit) {
      this.building = this.buildingToEdit;
    }
    this.$refs["places"].placesAutocomplete.on("locate", this.locateOnMap);
  },
  methods: {
    addressChanged(val) {
      this.building.address = val.value;
      this.building.location = {
        region: val.administrative,
        city: val.city,
        country: val.country,
        countryCode: val.countryCode,
        postcodes: val.postcodes,
        latlng: val.latlng,
        street: val.name,
        departement: val.county,
      };
    },

    submit() {
      if (this.$refs.form.validate()) {
        this.$emit("submit", {
          create: !this.edit,
          data: Object.assign({}, this.building),
        });
      }

      //   this.resetBuilding();
    },

    cancel() {
      this.$emit("cancel");
      this.resetBuilding();
    },

    resetBuilding() {
      this.building = {
        name: "",
        aliasName: "",
        urlBos: "",
        apiUrl: "",
        clientId: "",
        clientSecret: "",
        address: "Paris, Île de France, France",
        // concerned_user: "",
        description: "",
        picture_base64: "",
        location: {},
      };
    },

    locateOnMap(res) {
      this.$emit("geoLocate");
    },
  },
  computed: {
    requiredValidation: () => (name) => !!name.trim() || "Can not be empty",
  },
};
</script>

<style scoped>
.formContainer {
  width: 100%;
  height: 100%;
  background: #fff;
}

.formContainer .form {
  width: 98%;
  height: 99%;
  border-radius: 15px;
  padding: 5px;
}

.formContainer .form .addressInput {
  height: 56px;
  margin-bottom: 20px;
  border: 1px solid grey;
}

.formContainer .form .formButton {
  width: 100px;
  margin: 5px 10px;
}
</style>

<style>
.formContainer .form .algolia-places .ap-input-icon {
  bottom: 20px !important;
}
</style>