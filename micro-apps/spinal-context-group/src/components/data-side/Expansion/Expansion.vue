<template>
  <div class="button-wrapper">
    <div class="buttons">
      <button @click="actionBottomButton()" class="buttons-expand mt-8" color="primary" fab small>
        <v-icon v-if="currentExpansion === 'one-tier'">mdi-chevron-left
        </v-icon>
        <v-icon v-else-if="currentExpansion === 'zero'">mdi-chevron-left</v-icon>
        <v-icon v-else="currentExpansion === 'full'">mdi-chevron-double-right</v-icon>
      </button>
      <button @click="actionTopButton()" class="buttons-expand" fab small>
        <v-icon v-if="currentExpansion === 'one-tier'">mdi-chevron-right
        </v-icon>
        <v-icon v-else-if="currentExpansion === 'zero'">mdi-chevron-double-left</v-icon>
        <v-icon v-else="currentExpansion === 'full'">mdi-chevron-right</v-icon>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { ExpansionMode } from "@/interfaces";

// Vuetify
//import { VBtn, VIcon } from "vuetify/lib";

export default {
  components: {
    //VBtn,
    //VIcon,
  },
  props: {
    // iconLeft: {
    //   type: String,
    //   default: function () {
    //     return "mdi-arrow-left-bold";
    //   },
    //   required: false,
    // },
    // iconRight: {
    //   type: String,
    //   default: function () {
    //     return "mdi-arrow-right-bold";
    //   },
    //   required: false,
    // },
    defaultExpansion: {
      type: String,
      default: function () {
        return "one-tier";
      },
      required: false,
    },
  },
  data() {
    const currentExpansion: ExpansionMode = "one-tier";
    return {
      currentExpansion,
    };
  },
  mounted() {
    this.currentExpansion = this.defaultExpansion;
  },
  methods: {
    actionTopButton() {
      this.defaultExpansion;
      switch (this.currentExpansion) {
        case "zero":
          this.currentExpansion = "full";
          this.$emit("updateExpansion", this.currentExpansion);
          break;
        case "one-tier":
          this.currentExpansion = "zero";
          this.$emit("updateExpansion", this.currentExpansion);
          break;
        case "full":
          this.currentExpansion = "one-tier";
          this.$emit("updateExpansion", this.currentExpansion);
          break;
        default:
      }
    },
    actionBottomButton() {
      switch (this.currentExpansion) {
        case "zero":
          this.currentExpansion = "one-tier";
          this.$emit("updateExpansion", this.currentExpansion);
          break;
        case "one-tier":
          this.currentExpansion = "full";
          this.$emit("updateExpansion", this.currentExpansion);
          break;
        case "full":
          this.currentExpansion = "zero";
          this.$emit("updateExpansion", this.currentExpansion);
          break;
        default:
      }
    },
    resetToZero() {
      this.currentExpansion = "zero";
      this.$emit("updateExpansion", this.currentExpansion);
    }
  },
};
</script>

<style scoped lang="scss">
.button-wrapper {
  height: 15vh;
  .buttons {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }
}

.upper-expand-button {
  position: absolute;
  top: 47.5%;
  left: -20px;
  background-color: white;
  border-radius: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 5px;
  border-left: 2px solid gainsboro;
}

.lower-expand-button {
  position: absolute;
  top: 52.5%;
  background-color: white;
  border-radius: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 5px;
  border-left: 2px solid gainsboro;
}


.buttons-expand {

  background-color: white;
  border-radius: 10px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 5px;
  border-left: 2px solid gainsboro;
}
</style>
