<template>
  <v-dialog v-model="showDialog" persistent v-bind="$attrs">
    <div class="content" data-cy="simpleModale">
      <transition name="fade">
        <v-alert type="error" v-if="errorMessage.length > 0">
          {{ errorMessage }}
        </v-alert>
      </transition>
      <v-card
        class="d-flex flex-column justify-space-between pa-4"
        min-height="50vh"
      >
        <v-card-title class="d-flex justify-start">
          <span class="text-h5 font-weight-bold text-uppercase">{{
            modaleTitle
          }}</span>
        </v-card-title>

        <div class="slot-body">
          <slot name="body"></slot>
        </div>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            data-cy="simpleModaleCloseBtn"
            color="primary"
            outlined
            text
            @click="onClickButton('Close')"
            >Fermer</v-btn
          >
          <v-btn
            data-cy="simpleModaleSubmitBtn"
            color="primary"
            @click="onClickButton('Save')"
          >
            {{ validateButtonText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script lang="ts">
// Vuetify
// import { VAlert } from "vuetify/lib";
// import { VDialog } from "vuetify/lib";
// import { VCard } from "vuetify/lib";
// import { VBtn } from "vuetify/lib";
// import { VCardActions } from "vuetify/lib";
// import { VSpacer } from "vuetify/lib";
// import { VCardTitle } from "vuetify/lib";

export default {
  components: {
    // VBtn,
    // VCard,
    // VCardActions,
    // VDialog,
    // VSpacer,
    // VCardTitle,
    // VAlert,
  },
  props: {
    errorMessage: {
      type: String,
      required: false,
      default: (): string => {
        return "";
      },
    },
    showDialog: {
      type: Boolean,
      required: false,
      default: (): boolean => {
        return false;
      },
    },
    modaleTitle: {
      type: String,
      required: false,
      default: (): string => {
        return "";
      },
      validator: (value: string): boolean => {
        return /^.{0,60}$/.test(value);
      },
    },
    validateButtonText: {
      type: String,
      required: false,
      default: (): string => {
        return "Valider";
      },
    },
  },
  methods: {
    onClickButton(buttonType: string) {
      if (buttonType === "Close") {
        this.onClickButtonClose();
      } else if (buttonType === "Save") {
        this.onClickButtonSave();
      }
    },
    onClickButtonClose() {
      this.$emit("close");
    },
    onClickButtonSave() {
      this.$emit("save");
    },
  },
};
</script>
<style lang="scss">
.content {
  overflow-x: hidden;
}
</style>
