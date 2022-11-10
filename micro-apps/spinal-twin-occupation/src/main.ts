import Vue from 'vue'
import App from './App.vue'
import store from './store'
import Vuetify from "vuetify"
import vuetify from './plugins/vuetify'
import 'vuetify/dist/vuetify.min.css'
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