<template>
  <div>
    <v-card
      v-ripple
      class="main-button"
      :class="{'enter-button': hover}"
      @mouseover="hover = true"
      @mouseleave="hover = false"
      style="height: 52px; width: 52px; border-radius: 10px !important; background-color: #14202c;"
      elevation="8"
    >
      <v-card
        v-ripple
        class="first-nested"
        :class="{'inside': hover}"
        style="height: 32px; width: 32px; border-radius: 10px !important; border: 1px solid #bfbfbf; background-color: #14202c; position: absolute; top: 10px; left: 10px;"
        elevation="8"
      >
      <v-icon 
        :class="{'inside': hover}"
        style="color: #bfbfbf; padding: 3px">mdi-file-download</v-icon>
      </v-card>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    hover: false
  })
}
</script>

<style scoped>
.enter-button {
  cursor: pointer;
}
.inside {
  color: #fff !important;
}
</style>