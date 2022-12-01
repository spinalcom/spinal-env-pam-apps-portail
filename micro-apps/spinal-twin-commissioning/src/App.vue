<template>
  <v-app>
    <MicroApp/>
  </v-app>
</template>

<script>
// import NewComponent from './components/NewComponent.vue';
import MicroApp from './components/Commissioning.vue';

export default {
  name: 'App',

  components: {
    //NewComponent,
    MicroApp
},

  data: () => ({
    windowWidth: window.innerWidth,
    //
  }),
  mounted() {
  window.onresize = () => {
    this.windowWidth = window.innerWidth
  }
  },
};
</script>

<style>
html {

  font-family: 'charlevoixpro' !important;
}

@font-face{font-family:'charlevoix';src:url('./assets/font/CharlevoixPro-Regular.woff2') format('woff2'),url('./assets/font/CharlevoixPro-Regular.woff') format('woff'),url('./assets/font/CharlevoixPro-Regular.ttf') format('truetype');font-weight:normal;font-style:normal}
</style>
