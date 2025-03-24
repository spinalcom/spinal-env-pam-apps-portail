<template>
  <v-dialog v-model="isDialogOpen" persistent max-width="65%"
    style="display: flex !important;gap: 20px !important; font-size: 12px !important; overflow: hidden; background: white !important;   border-radius: 20px !important;">
    <form @submit.prevent="createTicket" class="content">
      <div style="padding: 10px; align-items: center;" class="w-full flex justify-between border-bottom">
        <span class="headline">Creer un inventaire</span>
        <div style="display: flex; gap: 10px;">
          <button type="submit" class="save-btn">
            <v-icon style="color: white;">mdi-content-save</v-icon>
            Enregistrer</button>
          <button type="reset" class="cancel-btn" @click="closeDialog">Fermer</button>
        </div>

      </div>
      <v-card elevation="0"
        style="overflow-y: auto !important; width: 100% !important; height: 100%; padding-top: 10px;">
        <div class="w-full h-full overflow-hidden overflow-y-auto">
          <div style="width: 100%; padding: 20px;">
            <v-card-text style="min-height: 50px;">
              <div class="col">
                <v-row v-if="showalert"
                  style="width: 100%; display: flex; gap: 10px;  justify-content: center; align-items: center; ">
                  <v-icon style=" color:rgba(133, 27, 27, 0.757);">mdi-alert-circle-outline</v-icon>
                  <span class="text-alert">Veuillez remplir tous les champs</span>
                </v-row>
                <v-row class="flex justify-center items-center" style="padding: 10px">
                  <span style="text-align: center; font-weight: 800; font-size: 16px;">Type d'inventaire: </span>
                  <span :class="['cursor-pointer chip', { 'checked': item.checked }]" v-for="(item, index) in prioritie"
                    @click="checkPrioritie(index)">
                    <span class="icon-check" v-if="item.checked">&#10003;</span>
                    <span style="font-weight: 700; text-transform: capitalize;"> {{ item.name }}</span>
                    <span class="chip-point" v-if="!item.checked"></span>
                  </span>
                </v-row>
              </div>
              <p v-if="isValid" class="valid_formText">{{ valid_message }}</p>
            </v-card-text>
          </div>
          <div style="padding: 20px;" class="category-list">
            <div style="font-weight: bold;" v-if="categories.length > 0">Selectionez une categorie</div>
            <div @click="selectCategory(category.name)" v-for="category in categories" :key="category.dynamicId">
              <div :class="{ selected: selectedCategory === category.name }" class="category-item">
                <span class="material-icons">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </form>
  </v-dialog>
</template>

<script lang="ts">
import { get } from 'http';
import { ActionTypes } from '../interfaces/vuexStoreTypes';
import { WorkflowInterface } from '../interfaces/Workflow';
import getIcon from '../services/function/getIcon';


export default {
  name: 'form-ticket',
  props: {
    selectedZone: {
      type: Object,
      required: true,

    },
    value: {
      type: Boolean,
      default: false,
    },
    typedata: {
      type: String,
    },
    config: {
      type: Object,
    }
    ,
    selectedId: {
      type: Number,
    }
  },
  data() {
    return {
      showalert: false,
      workflowId: 0,
      processId: 0,
      ticketname: '',
      description: '',
      isDialogOpen: this.value,
      selectedCategory: null,
      prioritie: [
        {
          name: 'equipement',
          color: 'green',
          value: 0,
          checked: false,
        },
        {
          name: 'espace',
          color: 'orange',
          value: 1,
          checked: false,
        },
      ],
      workflowlist: [{}],
      process: [],
      files: Array(),
      priority: null,
      remove_animation: null,
      isValid: false,
      valid_message: '',
      categories: [],
      getIcon: getIcon,
      selectedCtx: null,
      selectedCat: null
    };

  },
  async mounted() {
    console.log('HIHIHIHI');
    
    if (this.typedata == "room") {
      this.prioritie = [
        {
          name: 'equipement',
          color: 'green',
          value: 0,
          checked: false,
        },
      ]
    }
    else {
      this.prioritie = [
        {
          name: 'equipement',
          color: 'green',
          value: 0,
          checked: false,
        },
        {
          name: 'espace',
          color: 'orange',
          value: 1,
          checked: false,
        },
      ]
    }
    // this.workflowlist = await this.getWorkFlowList();
  },
  watch: {
    value(newVal) {
      this.isDialogOpen = newVal;
    },
    isDialogOpen(newVal) {
      this.$emit('input', newVal);
    },
    remove_animation(newVal: number) {
      if (newVal != null) {
        setTimeout(() => {
          this.remove_animation = null;
        }, 500);
      }
    },
    prioritie: {
      handler(newVal) {
        this.Toto()
        this.selectedCategory = null
      },
      deep: true
    },
    typedata(newVal, oldVal) {
      if (newVal == "room") {
        this.prioritie = [
          {
            name: 'equipement',
            color: 'green',
            value: 0,
            checked: false,
          },
        ]
      }
      else {
        this.prioritie = [
          {
            name: 'equipement',
            color: 'green',
            value: 0,
            checked: false,
          },
          {
            name: 'espace',
            color: 'orange',
            value: 1,
            checked: false,
          },
        ]
      }
    }
  },
  methods: {
    selectCategory(name) {
      this.selectedCategory = name;
      this.selectedCat = name
      this.GetInventory();
    },

    closeDialog() {
      this.isDialogOpen = !this.isDialogOpen;
      this.$emit('close-dialog', this.isDialogOpen);
    },
    checkPrioritie(index) {

      this.prioritie = this.prioritie.map((item, i) => {
        if (i === index) {
          item.checked = !item.checked;
          this.priority = item.value;
        } else {
          item.checked = false;
        }
        return item;
      });
    },

    getSelectedName() {
      const selected = this.prioritie.find(item => item.checked);
      return selected ? selected.name : null;
    },


    Toto() {
      let typeofvalue = ''
      if (this.getSelectedName() == 'espace') {
        typeofvalue = 'Gestion des espaces'
      } else {
        typeofvalue = 'Gestion des équipements'
      }

      this.getContextList(typeofvalue)
    },

    async getContextList(typeofvalue) {
      const buildingId = localStorage.getItem("idBuilding");
      const contextList = await this.$store.dispatch(ActionTypes.GET_CONTEXT_LIST, { buildingId });
      const targetContext = contextList.find(ctx => ctx.name === typeofvalue);
      this.getCategories(targetContext.dynamicId)
      this.selectedCtx = targetContext.name

    }
    ,

    async getCategories(contextId) {
      const buildingId = localStorage.getItem("idBuilding");
      const resultCategory = await this.$store.dispatch(
        ActionTypes.GET_CONTEXT_CATEGORY_LIST,
        { buildingId, contextId }
      );
      this.categories = resultCategory
      console.log("Résultat des catégories pour :", this.typedata, resultCategory);

    },

    async GetInventory() {
      console.warn('je met ajour le truc');
      

      if (this.typedata == 'equipement')
        return
      else if (this.typedata == 'room') {
        const inventoryResponse = await this.$store.dispatch(ActionTypes.GET_ROOM_INVENTORY, {
          id: this.selectedId,
          body: { context: this.selectedCtx, category: this.selectedCat },
          includeArea: true,
          onlyDynamicId: false,
        });
        this.$emit('inventory-loaded', inventoryResponse); // <-- ici

      } else if (this.typedata == 'floor') {
        const inventoryResponse = await this.$store.dispatch(ActionTypes.GET_FLOOR_INVENTORY, {
          id: this.selectedId,
          body: { context: this.selectedCtx, category: this.selectedCat },
          onlyDynamicId: false,
        });
        this.$emit('inventory-loaded', inventoryResponse); // <-- ici
      } else {
        console.log('faire inventaira du building');

      }

    },




    resetForm() {
      // this.ticketname = '';
      // this.description = '';
      // this.workflowId = 0;
      // this.processId = 0;
      // this.files = [];
      // this.priority = null;
    },


    async createTicket(e) {
      // e.preventDefault();
      // const workflowname = this.workflowlist.find((item: WorkflowInterface) => item.dynamicId === this.workflowId);
      // const processname = this.process.find((item: WorkflowInterface) => item.dynamicId === this.processId);
      // const file = this.files;
      // if (workflowname && processname && this.ticketname && this.description && this.priority != null) {
      //   const data = {
      //     workflow: workflowname.name,
      //     process: processname.name,
      //     nodeDynamicId: this.selectedZone.dynamicId,
      //     name: this.ticketname,
      //     priority: this.priority,
      //     description: this.description,
      //   }

      //   const buildingId = localStorage.getItem("idBuilding");
      //   const res = await this.$store.dispatch(ActionTypes.ADD_TICKET, { buildingId, data, file });
      //   if (res) {
      //     this.resetForm();
      //     this.closeDialog();
      //     this.$emit('add-ticket', { message: 'ticket ajouté', status: 'success', context: 'ticket' });
      //   }
      //   else {
      //     this.$emit('add-ticket', { message: 'Erreur lors de l\'ajout du ticket', status: 'error', context: 'ticket' });
      //     this.showalert = false;
      //     this.closeDialog();
      //   }
      // } else {
      //   this.showalert = true;
      // }


    },


  },

};
</script>


<style>
.category-item.selected {
  background-color: #14202c;
  color: white;
  /* optionnel */
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid black;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.5s;
  padding: 5px;
  margin-top: 5px;
}

.category-item:hover {
  background-color: rgb(236, 236, 236);
}

.material-icons {
  font-size: 20px;
}
</style>

<style scoped src="../assets/formComp.css"></style>