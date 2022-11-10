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
  <v-card class="creationContent">
    <div class="back">
      <v-btn rounded
             outlined
             color="#14202c"
             dark
             @click="cancel">
        <v-icon left>
          mdi-arrow-left-thin
        </v-icon>
        Retour
      </v-btn>
    </div>

    <v-form class="form"
            @submit.prevent="onSubmit">
      <div class="_title">{{title}}</div>

      <div class="content">
        <v-checkbox v-model="appInfo.hasViewer"
                    label="Cette application utilise de la 3D"></v-checkbox>

        <v-row>
          <v-col cols="4">
            <v-combobox :items="icons"
                        v-model="appInfo.icon"
                        label="Icone"
                        item-value="name"
                        item-text="name"
                        outlined>

              <template v-slot:item="{ item }">
                <v-icon style="margin-right: 10px;">{{'mdi-' + item.name}}
                </v-icon>

                {{item.name}}
              </template>

              <template v-slot:selection="{ item }">
                <v-icon style="margin-right: 10px;">{{'mdi-' + item.name}}
                </v-icon>

                <!-- {{item.name}} -->
              </template>

            </v-combobox>
          </v-col>
          <v-col cols="8">
            <v-text-field v-model="appInfo.name"
                          label="Nom de l'application"
                          outlined></v-text-field>
          </v-col>
        </v-row>

        <v-text-field v-model="appInfo.packageName"
                      label="Nom du package (dans le package.json)"
                      outlined></v-text-field>

        <v-combobox small-chips
                    deletable-chips
                    multiple
                    append-icon="none"
                    v-model="appInfo.tags"
                    label="Tags"
                    outlined></v-combobox>

        <v-row>
          <v-col cols="6">
            <v-text-field v-model="appInfo.categoryName"
                          label="Categorie de l'application"
                          outlined></v-text-field>
          </v-col>

          <v-col cols="6">
            <v-text-field v-model="appInfo.groupName"
                          label="Groupe de l'application"
                          outlined></v-text-field>
          </v-col>
        </v-row>

        <v-textarea v-model="appInfo.description"
                    outlined
                    name="input-7-4"
                    label="Description">
        </v-textarea>

        <div class="buttons">
          <v-btn class="button"
                 color="error"
                 @click="cancel">
            Annuler
          </v-btn>

          <v-btn class="button"
                 color="#14202c"
                 type="submit">
            <v-icon class="btnIcon">
              mdi-content-save-outline
            </v-icon>
            Enregister
          </v-btn>

        </div>

      </div>
    </v-form>
  </v-card>
</template>
  
  <script lang="ts">
import { IApp } from "@/types/interfaces";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import icons from "../store/icons";

@Component({})
class CreationComponent extends Vue {
  required = [(v: string) => !!v || "this input is required"];
  icons: { id: string; name: string }[] = icons;

  @Prop() title!: string;
  @Prop() edit!: boolean;
  @Prop() appSelected!: IApp;

  appInfo: IApp = {
    name: "",
    icon: "",
    description: "",
    tags: [],
    categoryName: "",
    groupName: "",
    hasViewer: false,
    packageName: "",
  };

  mounted() {
    if (this.edit) {
      this.appInfo = Object.assign({}, this.appSelected);
    }
  }

  onSubmit() {
    if (this.edit) {
      this.$emit("edit", Object.assign({}, this.appInfo));
      this.initAppInfo();
      return;
    }

    this.$emit("create", Object.assign({}, this.appInfo));
    this.initAppInfo();
  }

  cancel() {
    this.$emit("cancel");
    this.initAppInfo();
  }

  initAppInfo() {
    this.appInfo = {
      name: "",
      icon: "",
      description: "",
      tags: [],
      categoryName: "",
      groupName: "",
      hasViewer: false,
      packageName: "",
    };
  }

  @Watch("edit")
  watchEdit() {
    if (this.edit) {
      this.appInfo = Object.assign({}, this.appSelected);
      return;
    }

    this.initAppInfo();
  }
}

export default CreationComponent;
</script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style lang="scss">
$header-height: 80px;
$toolbar-height: 70px;

.creationContent {
  width: 98%;
  height: calc(100% - #{$header-height + 10px});
  margin: auto;
  margin-top: $header-height;
  background: #f8f9f9;
  border-radius: 10px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  // justify-content: center;

  .back {
    width: 100%;
    height: 40px;
    margin-bottom: 5px;
  }

  .form {
    width: 50%;
    height: calc(100% - 40px);
    padding: 10px;
    margin: auto;
    ._title {
      text-align: center;
      font-size: 2em;
      color: #214353;
    }

    .content {
      // height: calc(100% - #{$toolbar-height});
      margin: auto;

      .buttons {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        .button {
          color: #fff;
          margin-right: 5px;
          .btnIcon {
            margin-right: 5px;
          }
        }
      }
    }
  }
}
</style>
  