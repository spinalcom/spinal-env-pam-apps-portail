import Vue from 'vue'
import Vuex from 'vuex'
import { getBuildingAsyncV2, getControlEndpointsByNameAsync } from '../api-requests'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    buildingV2: null,
    currentFilter: ['SHOW ALL', 'daily'],
    cpList: <any[]>[],
    spaceFilter: 'SHOW ALL'
  },
  getters: {
    building: state => {
      return state.buildingV2;
    },
    cpList: state => {
      return state.cpList.find(element => element.name === "Qualité de l'air");
    },
    spaceFilter: state => {
      return state.spaceFilter;
    }
  },
  mutations: {
    SET_BUILDING(state, payload) {
      state.buildingV2 = payload;
    },
    SET_CONTROL_ENDPOINTS(state, payload) {
      state.cpList.push(payload);
    },
    SET_SPACE_FILTER(state, payload) {
      state.spaceFilter = payload;
    }
  },
  actions: {
    async initializeBuilding({ commit }) {
      if(!this.state.buildingV2){
        commit('SET_BUILDING', await getBuildingAsyncV2());
      }
    },

    async initControlEndpoints({ commit, dispatch, state }, cp) {
      dispatch('initializeBuilding')
          .then(async () => {
            if(state.cpList.length===0 || !state.cpList.find(element => element.name === cp)){
              commit('SET_CONTROL_ENDPOINTS', await getControlEndpointsByNameAsync(cp, state.buildingV2));
            }

          })
    },

    setSpaceFilter({commit}, spaceFilter) {
      commit('SET_SPACE_FILTER', spaceFilter)
    },

    downloadCSV: (param, data) => {
      // creation d'un tableau de string contenant les infos (et séparateurs)
      const entete = Object.keys(data.tab[0]);
      const tableur = [];
      entete.forEach((el) => tableur.push(el, ','));
      tableur.push('\n');
      data.tab.forEach((obj: any) => {
        entete.forEach((attr) => {
          tableur.push(obj[attr], ',');
        });
        tableur.push('\n');
      });

      // création d'une balise type <a></a> et définition des attribut
      const a = document.createElement('a');

      // Attribut:
      // lien vers un "fichier" créer dynamiquement
      a.href =
          'data:text/csv;charset=utf-8,' + encodeURIComponent(tableur.join(''));
      a.target = '_blank';
      // download indique que le lien est à télécharger. le nom une fois téléchargé est donné comme valeur
      // @ts-ignore
      a.download = `${param.state.buildingV2.name} ${data.measure}.csv`;
      // déclenche l'événement onClick sur le lien
      a.click();
    },
  },
  modules: {
  }
})
