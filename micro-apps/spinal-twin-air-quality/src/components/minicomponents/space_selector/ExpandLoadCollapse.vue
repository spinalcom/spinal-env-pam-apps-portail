<template>
  <div>
    <transition name="smooth-load-start">
      <v-icon v-if="rootButton==false" class="rotate-disabled" :class="{'rotate-enabled': root}" style="position: absolute; right: 14px; top: -12px">mdi-chevron-down</v-icon>
    </transition>
    <transition name="smooth-load-end">
      <svg v-if="rootButton==true" version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="30px" height="30px" viewBox="0 0 50 50" style="position: absolute; right: 11px; top: -14px; enable-background:new 0 0 50 50;" xml:space="preserve">
        <path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
          <animateTransform attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="0 25 25"
            to="360 25 25"
            dur="0.6s"
            repeatCount="indefinite"/>
        </path>
      </svg>
    </transition>
  </div>
</template>

<script>
export default ({
  props: {
    rootButton: {
      type: Boolean,
      required: false,
    },
    root: {
      type: Boolean,
      required: false,
    },
  }
})
</script>
<style scoped>
.smooth-load-start-enter-active, .smooth-load-start-leave-active {
  transition: all .5s;
}

.smooth-load-start-enter, .smooth-load-start-leave-to {
  opacity: 0;
  transform: scale(0.4);
}

.smooth-load-end-enter-active, .smooth-load-end-leave-active {
  transition: all .5s;
}

.smooth-load-end-enter, .smooth-load-end-leave-to {
  opacity: 0;
  transform: scale(0.4);
}

.rotate-enabled {
  transform: rotate(-180deg);
  transition: transform 0.30s ease-in;;
}

svg path,
svg rect{
  fill: #bfbfbf;
}
</style>