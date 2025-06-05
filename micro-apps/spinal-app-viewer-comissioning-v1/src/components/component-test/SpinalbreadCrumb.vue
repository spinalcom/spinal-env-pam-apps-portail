<template>
  <div>
    <nav class="breadcrumbs">
      <a
        title="Revenir à la selection de contextes"
        href="#selected_ctx"
        @click.stop="goBackToContextSelection"
        class="breadcrumbs__item"
        ><</a>
      <a
        title="Revenir à la selection de catégories"
        href="#selected_ctx"
        @click.stop="goBackToContext"
        class="breadcrumbs__item"
        >{{
        getContextName
        }}</a
      >
      <a
        title="Revenir à la selection de groupes"
        href="#selected_cat"
        @click.stop="goBackToCategory"
        class="breadcrumbs__item"
        v-if="$store.state.appDataStore.user_selected.cat"
        >{{ $store.state.appDataStore.user_selected.cat.name }}</a
      >
      <a
        title="Revenir à la selection d'équipements"
        href="#selected_grp"
        @click.stop="goBackToGroup"
        class="breadcrumbs__item"
        v-if="$store.state.appDataStore.user_selected.grp"
        >{{ $store.state.appDataStore.user_selected.grp.name }}</a
      >
      <a v-if="selected_item" href="#selected_item" class="breadcrumbs__item">
        {{ selected_item }}
      </a>
    </nav>

  
  </div>
</template>
<script>
import { ActionTypes } from '../../interfaces/vuexStoreTypes';
import { MutationTypes } from '../../services/store/appDataStore/mutations';

export default {
  props: ['ctx_list', 'cat_list', 'grp_list', 'selected_item'],
  data: () => ({
    selected_ctx: '',
    selected_grp: '',
    selected_cat: '',
    showSelection: false,
  }),

  mounted() {

  },

  computed:{
    selectedZone(){
      return this.$store.state.appDataStore.zoneSelected;
    },
    getContextName() {

      return this.$store.state.appDataStore.user_selected.ctx 
        ? this.$store.state.appDataStore.user_selected.ctx.name
        : 'Selectionnez un contexte';
    },
    getGroupName() {
      return this.$store.state.appDataStore.user_selected.grp
        ? this.$store.state.appDataStore.user_selected.grp.name
        : 'Selectionnez un groupe';
    }
  },


  methods: {
    deselectItem() {
      // this.emitValue('item', '');
      this.$emit('deselectItem')
    },
    validate() {
      //this.emitValue('grp', this.selected_grp);
      this.showSelection = false;
    },

    async goBackToContextSelection(){
        console.log('goBackToContextSelection', this.$store.state.appDataStore.user_selected.ctx);
    },

   async goBackToContext() {
      const payload = {
        key: 'cat',
        value: null,
      }
      const payload2 = {
        key: 'grp',
        value: null,
      }
      this.$store.commit(MutationTypes.SET_USER_SELECTED, payload);
      this.$store.commit(MutationTypes.SET_USER_SELECTED, payload2);
      await this.getContextList();

    },
    async goBackToCategory() {
 
      console.log('goBackToCategory', this.$store.state.appDataStore.user_selected.cat);
      const payload = {
        key: 'grp',
        value: null,
      }
      this.$store.commit(MutationTypes.SET_USER_SELECTED, payload);
      await this.getCategoriesList();
      
    },
    async goBackToGroup() {
      const payload = {
        key: 'grp',
        value: null,
      }
      this.$store.commit(MutationTypes.SET_USER_SELECTED, payload);
      await this.getGroupsList();

      this.deselectItem();
    },

    async getContextList() {
      let dispatchObject = {
      buildingId: localStorage.getItem("idBuilding"),
      patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id
    };
    dispatchObject.forceUpdate = true;
    const result = await this.$store.dispatch(ActionTypes.GET_EQUIPMENTS_GROUP, dispatchObject);
    this.$store.commit(MutationTypes.SET_USER_SELECTION, result);
    this.$store.commit(MutationTypes.SET_SHOW_FORM, true)
    this.$store.commit(MutationTypes.SET_TYPE_LIST, 'ctx');
    this.$store.commit(MutationTypes.SET_TITLE_LIST, "Liste des contextes");
    },

   async getCategoriesList() {
    this.$store.commit(MutationTypes.SET_TITLE_LIST, "Liste des catégories");  

    this.typeList = "cat";
    console.log('Item selected:', this.selectedItem);
    const dispatchObject = {
    buildingId: localStorage.getItem("idBuilding"),
    patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
    contextDynId: this.$store.state.appDataStore.user_selected.ctx.dynamicId,
    };
    dispatchObject.forceUpdate = true;
     const data = await this.$store.dispatch(ActionTypes.GET_CATEGORY_LIST, dispatchObject);
      console.log('contextList', data);
  this.$store.commit(MutationTypes.SET_USER_SELECTION, data);
  this.$store.commit(MutationTypes.SET_TYPE_LIST, 'cat');
  // Afficher la liste des catégories
  this.$store.commit(MutationTypes.SET_SHOW_FORM, true);
  
},

async getGroupsList() {
      this.$store.commit(MutationTypes.SET_TITLE_LIST, "Liste des groupes");
      this.typeList = "grp";
      const dispatchObject = {
        buildingId: localStorage.getItem("idBuilding"),
        patrimoineId: JSON.parse(localStorage.getItem("patrimoine")).id,
        contextDynId: this.$store.state.appDataStore.user_selected.ctx.dynamicId,
        categoryDynId: this.$store.state.appDataStore.user_selected.cat.dynamicId,
      }
      dispatchObject.forceUpdate = true;
      const data = await this.$store.dispatch(ActionTypes.GET_GROUP_LIST, dispatchObject);
      console.log('contextList', this.contextList);
      this.$store.commit(MutationTypes.SET_USER_SELECTION, data);
      this.$store.commit(MutationTypes.SET_TYPE_LIST, 'grp');
      this.$store.commit(MutationTypes.SET_SHOW_FORM, true);

    },
    
    
    emitValue(listType, value) {
      if (listType == 'ctx' || listType == 'cat') {
        this.selected_grp = '';
      }
      if (listType == 'ctx') {
        this.selected_cat = '';
      }
      console.log('emitValue', listType, this.grp_list);
      this.$emit('itemSelected', { listType, value });
    },
  },

    watch: {
      selectedZone(newVal, oldVal) {
        this.goBackToCategory();
      }
    }
  }


</script>
<style scoped>
.breadcrumbs {
  border: 1px solid #cbd2d9;
  border-radius: 0.3rem;
  display: inline-flex;
  overflow: hidden;
}

.breadcrumbs__item {
  min-height: 75px;
  min-width: 128px;
  background: #fff;
  color: #333;
  outline: none;
  padding: 0.75em 0.75em 0.75em 1.25em;
  position: relative;
  text-decoration: none;
  transition: background 0.2s linear;
  justify-content: center;
  display: flex;
  align-items: center;
}

.breadcrumbs__item_chips {
  background: #fff;
  color: #333;
  outline: none;
  padding: 0.75em 0.75em 0.75em 1.25em;
  position: relative;
  text-decoration: none;
  transition: background 0.2s linear;
}

.breadcrumbs__item:hover:after,
.breadcrumbs__item:hover {
  background: #edf1f5;
}

/* .breadcrumbs__item:focus:after,
.breadcrumbs__item:focus,
.breadcrumbs__item.is-active:focus {
  background: #323f4a;
  color: #fff;
} */

.breadcrumbs__item:after,
.breadcrumbs__item:before {
  background: white;
  bottom: 0;
  clip-path: polygon(50% 50%, -50% -50%, 0 100%);
  content: '';
  left: 100%;
  position: absolute;
  top: 0;
  transition: background 0.2s linear;
  width: 1em;
  z-index: 1;
}

.breadcrumbs__item:before {
  background: #cbd2d9;
  margin-left: 1px;
}

.breadcrumbs__item:last-child {
}

.breadcrumbs__item:first-child {
  max-width: 10px;
  min-width: 10px;
  padding: 0.75em 0.75em 0.75em 0.75em;
  background-color: rgb(252, 114, 114);
}
.breadcrumbs__item:first-child:after {
  background-color: rgb(252, 114, 114);
}


.breadcrumbs__item.is-active {
  background: #edf1f5;
}

.choose_li {
  margin: 5px;
  padding: 5px;
  cursor: pointer;
}

.choose_li:hover {
  background-color: rgb(229, 229, 229);
  border-radius: 5px;
}
.selected {
  background-color: #e9e9e98f;
  border-radius: 5px;
  border: 1px solid #14202c;
}
</style>
