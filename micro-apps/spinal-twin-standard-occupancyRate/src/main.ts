import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import moment from 'moment';
import 'moment/locale/fr';
import { store } from './services/store/indexx'; 

moment.locale('fr');

Vue.config.productionTip = false;

new Vue({
  vuetify,
  store, 
  render: h => h(App),
}).$mount('#app');