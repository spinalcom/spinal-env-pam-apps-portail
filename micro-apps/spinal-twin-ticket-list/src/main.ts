import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import store from './store'
import Vuetify from "vuetify";
import vuetify from './plugins/vuetify'
import SpinalComponents from 'spinal-components'
import 'spinal-components/dist/spinal-components.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify)
Vue.use(SpinalComponents, {})
Vue.config.productionTip = false

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
