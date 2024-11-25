
<template>
  <div class="marker" :style="{ 'left': this.offset + 'px' }">
    <div class="line" :style="{ 'height': height + 'px' }"></div>
  </div>
</template>

<script>
export default {
  name: 'TodayMarker',
  props: ['height', 'offset'],
  mounted() {
  }
}
</script>

<style scoped>
.marker {
  position: absolute;
  top: -30px;
  height: 30px;
  width: 30px;
  min-height: 100%;
}
.dot {
  position: absolute;
  top: 25px;
  left: 10px;
  height: 7px;
  width: 7px;
  border-radius: 10px;
  background: #FF3A3A;
  z-index: 400;
}
.line {
  position: absolute;
  top: 25px;
  left: 13px;
  width: 1px;
  background: #FF3A3A;
  z-index: 100;
  min-height: 100%;
}
</style>

