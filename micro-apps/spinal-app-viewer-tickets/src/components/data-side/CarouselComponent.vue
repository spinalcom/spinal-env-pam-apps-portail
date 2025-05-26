<template>
  <div v-if="image_list.length > 0" style="width: 100%; height: 100%;" class="d-flex flex-column">
    <!-- Image viewer -->
    <div class="d-flex flex-row flex-grow-1 justify-space-between"
      style="background-color: #14202c; background-size: contain; background-position: center center; cursor: zoom-in;"
      :style="{ 'background-image': 'url(' + image_list[c_index].src + ')' }" @click="dialog = true">
      <!-- Navigation buttons -->
      <div v-if="image_list.length > 1" class="d-flex align-center px-2">
        <v-btn style="color: white; width: 25px; height: 25px; background-color: #ffffff40" fab @click.stop="
          c_index = (c_index + image_list.length - 1) % image_list.length
          ">
          <v-icon large style="font-size: 25px !important; margin-left: -1px;">mdi-chevron-left</v-icon>
        </v-btn>
      </div>
      <div v-if="image_list.length > 1" class="d-flex align-center px-2">
        <v-btn style="color: white; width: 25px; height: 25px; background-color: #ffffff40" fab @click.stop="
          c_index = (c_index + 1) % image_list.length
          ">
          <v-icon large style="font-size: 25px !important;">mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Pagination indicators -->
    <div v-if="image_list.length > 1" class="d-flex justify-center flex-shrink-1"
      style="background-color: rgba(0, 0, 0, 0.6)">
      <div v-for="(img, i) in image_list" :key="i" class="d-flex align-center justify-center rounded-circle ma-1"
        style="width: 18px; height: 18px"
        :style="{ 'background-color': c_index === i ? 'rgba(255,255,255,0.3)' : 'transparent' }">
        <v-btn fab style="background-color: white; width: 10px; height: 10px" @click="c_index = i"></v-btn>
      </div>
    </div>

    <!-- Download -->
    <div class="d-flex justify-end flex-shrink-1">
      <div class="text-center">
        <a style="color: #14202c; font-size: 11px;" :href="image_list[c_index].src" target="_blank"
          :download="image_list[c_index].name">
          {{
            image_list[c_index].name.length > 20
              ? image_list[c_index].name.slice(0, 17) + '...' + image_list[c_index].name.slice(-3)
              : image_list[c_index].name
          }}
          <v-icon class="ml-1" style="color: #14202c; font-size: 15px;">mdi-tray-arrow-down</v-icon>
        </a>
      </div>
    </div>
    <!-- Lightbox Dialog -->
    <v-dialog v-model="dialog" max-width="80vw" max-height="80vh" persistent>
      <v-card style="background-color: black; padding: 0; position: relative;">
        <!-- Close Button -->
        <v-btn icon @click="dialog = false"
          style="position: absolute; top: 5px; right: 5px; z-index: 10; color: white;">
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <!-- Image Display -->
        <v-card-text class="d-flex justify-center align-center" style="height: 80vh; padding: 0; overflow: hidden;">
          <img :src="image_list[c_index].src" :alt="image_list[c_index].name"
            style="max-width: 100%; max-height: 100%; object-fit: contain;" />
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>

  <div v-else id="carousel-vide" style="width: 100%"></div>
</template>

<script>
export default {
  props: {
    image_list: {
      type: Array,
      default: () => [],
    },
  },
  data: () => ({
    c_index: 0,
    dialog: false,
  }),
};
</script>

<style scoped>
#carousel-vide {
  background-image: url("../assets/img/No-Image-Placeholder.png");
  background-color: #eee;
  background-size: contain;
  background-position: center center;
}
</style>