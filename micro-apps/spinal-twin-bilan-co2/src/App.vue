<template>
  <v-app>
    <v-main>
      <MicroApp/>
    </v-main>
  </v-app>
</template>

<script>
import MicroApp from './components/MicroApp';

export default {
  name: 'App',

  components: {
    MicroApp,
  },

  data: () => ({
    //
  }),
};
</script>

<style>
html {
  overflow-y: hidden !important;
  font-family: 'charlevoix' !important;
}
body {
  font-family: 'charlevoix' !important;
}
@font-face{
  font-family:'charlevoix';
  src:url('./assets/font/CharlevoixPro-Regular.woff2') format('woff2'),
  url('./assets/font/CharlevoixPro-Regular.woff') format('woff'),
  url('./assets/font/CharlevoixPro-Regular.ttf') format('truetype');
  font-weight:normal;
  font-style:normal
}

</style>
