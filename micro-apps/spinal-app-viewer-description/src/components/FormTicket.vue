<template>
    <v-dialog v-model="isDialogOpen" persistent max-width="65%" style="display: flex !important;gap: 20px !important; font-size: 12px !important; overflow: hidden; background: white !important;   border-radius: 20px !important;">
      <form @submit.prevent="createTicket"  class="content">
        <div style="padding: 10px;" class="w-full flex justify-between border-bottom">
              <span class="headline">Ajouter un ticket</span>
              <div style="display: flex; gap: 10px;">
                <button type="submit" class="save-btn">
                    <v-icon style="color: white;">mdi-content-save</v-icon>
                  Enregistrer</button>
                  <button type="reset" class="cancel-btn" @click="closeDialog">Fermer</button>
              </div>
            
            </div>
        <v-card elevation="0" style="overflow-y: auto !important; width: 100% !important; height: 100%; padding-top: 10px;">
         
        <div class="w-full h-full overflow-hidden overflow-y-auto" >
  
          <div style="width: 100%;  padding: 20px;">
            <v-row class="row">
  
              <v-select
              class="w-1/3 small-select"
              
              v-model="workflowId"
              :items="workflowlist"
              item-text="name"
              item-value="dynamicId"
              @change="getProcessList(workflowId)"
              outlined
              label="Séléctionner un workflow" >
              
            </v-select>
            <v-select
            v-model="processId"
            class="w-1/3 small-select"
            :items="process"
            item-text="name"
            item-value="dynamicId"
            outlined
            label="Séléctionner un process" >
            
          </v-select>
            </v-row>
    
          <v-card-title>
            <span class="headline"></span>
          </v-card-title>
  
          <v-card-text style="min-height: 200px;">
            <div class="col">
              <v-text-field label="Nom du ticket" v-model="ticketname" outlined></v-text-field>
              <v-textarea label="Description" v-model="description" outlined></v-textarea>
              <v-row v-if="showalert">
                  <v-icon  style=" color: red;">mdi-alert-circle-outline</v-icon>
                  <span class="text-alert">Veuillez remplir tous les champs</span>
              </v-row>
              <v-row class="flex justify-center items-center" style="padding: 10px">
                  <span style="text-align: center; font-weight: 800; font-size: 16px;">Priorité: </span>
                  <span 
                  :class="['cursor-pointer chip', {'checked': item.checked}]"
                  color=""
                v-for="(item , index) in prioritie"
                  @click="checkPrioritie(index)"
                >
                <span class="icon-check" v-if="item.checked">&#10003;</span>
                <span style="font-weight: 700; text-transform: capitalize;"> {{ item.name }}</span>
                <span class="chip-point" v-if="!item.checked"></span>
              </span>
              </v-row>
                <div class="upload-img" style="margin-top: 10px;" >
                  <v-icon>mdi-file-multiple</v-icon>
                  <span>cliquer ou déposer un fichier</span>
                    <input type="file" name="images" id="" multiple @change="uploadsFile">
                </div>
              </div>
              <v-col class="flex justify-center items-center" v-if="files.length != 0" v-for="(image, index) in files">
                <v-row class="file"
                  >
                  <div class="flex flex-col justify-start items-center w-1/2" >
                      <div style="width: 100%;height: max-content; display: flex; align-items: center; gap: 10px;">
                      <v-icon >{{ iconFile(image.type) }}</v-icon>
                      <span style="font-size: 16px !important;">{{ image.name }}</span>
                      </div>
                    <div style="width: 100%;">
                      <span style="margin-left: 45px; font-size: 17px; text-align: left;">{{ filesSize(image.size) }}</span>
                    </div>
                  </div>
                  <v-icon style="width: max-content; height: max-content; border-radius: 50%;" class="pointer" @click="removeFile(index)">
                           mdi-close
              </v-icon>
                </v-row>
              </v-col>
             
              
            </v-card-text>
  
          </div>
  
        </div>
      </v-card>
    </form>
    </v-dialog>
  </template>
  
  <script lang="ts">
import { ActionTypes } from '../interfaces/vuexStoreTypes';
import { WorkflowInterface } from '../interfaces/Workflow';


  export default {
    name: 'form-ticket',
    props: {
      selectedZone: {
        type:  Object,
        required: true,

      },
      value: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        showalert: false,
        workflowId : 0,
        processId : 0,
        ticketname: '',
        description: '',
        isDialogOpen: this.value,
        prioritie : [ 
          {
            name: 'low',
            color: 'green',
            value: 0,
            checked: false,
          },
          {
            name: 'medium',
            color: 'orange',
            value: 1,
            checked: false,
          },
          {
            name: 'high',
            color: 'red',
            value: 2,
            checked: false,
          },
        ],
        workflowlist: [{}],
        process: [],
        files : Array(),
        priority: null,
      };

    },
  async mounted(){
      this.workflowlist = await this.getWorkFlowList();
    },
    watch: {
      value(newVal) {
        this.isDialogOpen = newVal;
      },
      isDialogOpen(newVal) {
        this.$emit('input', newVal);
      },
    },
    methods: {
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
      async getWorkFlowList () {
    const buildingId = localStorage.getItem("idBuilding");
    const res = await this.$store.dispatch(ActionTypes.GET_WORKFLOW_LIST, { buildingId });
    const workflow = await Promise.all(res);
    return workflow;
  },
    async getProcessList (workflowId: Number) { 
      const buildingId = localStorage.getItem("idBuilding");
      const res = await this.$store.dispatch(ActionTypes.GET_PROCESS_WORKFLOW, { buildingId, workflowId});
      this.process = res.children;
    },
   async uploadsFile(e: any) {
  
    for (let i = 0; i < e.target.files.length; i++) {
      this.files.push(e.target.files[i]);
    }

    },
 
    resetForm() {
      this.ticketname = '';
      this.description = '';
      this.workflowId = 0;
      this.processId = 0;
      this.files = [];
      this.priority = null;
    },
    removeFile(index: number) {
      this.files.splice(index, 1);
    },
    filesSize(size: number){
      if (size < 1024) {
          return size + 'octets';
      }
      else if(size < (1024 * 1024)){
        return (size / 1024).toFixed(2) + 'Ko';
      }
      else {
        return (size / (1024 * 1024)).toFixed(2) + 'Mo';
      }

    },
    async createTicket(e) {
      e.preventDefault(); 
      const workflowname = this.workflowlist.find((item: WorkflowInterface) => item.dynamicId === this.workflowId);
      const processname = this.process.find((item: WorkflowInterface) => item.dynamicId === this.processId);
      const file = this.files;
      if (workflowname &&  processname && this.ticketname && this.description && this.priority != null) {
        const data = {
        workflow: workflowname.name,
        process: processname.name,
        nodeDynamicId: this.selectedZone.dynamicId,
        name: this.ticketname,
        priority : this.priority,
        description: this.description,
      }

      const buildingId = localStorage.getItem("idBuilding");
      const res = await this.$store.dispatch(ActionTypes.ADD_TICKET, { buildingId, data, file});
      console.log(res);
      if(res) {
        this.resetForm();
        this.closeDialog();
        this.$emit('add-ticket', {message: 'ticket ajouté', status: 'success', context: 'ticket' });
      }
      else {
        this.$emit('add-ticket', {message: 'Erreur lors de l\'ajout du ticket', status: 'error', context: 'ticket' });
        this.showalert = false;
        this.closeDialog();
      }
      } else {
        this.showalert = true;
      }
     
      
    },
    iconFile(type: string) {
      switch (type) {
        case 'image/pdf':
          return 'mdi-file-pdf-box';
        case 'image/doc':
          return 'mdi-file-word-box';
        case 'image/docx':
          return 'mdi-file-word-box';
        case 'image/xls':
          return 'mdi-file-excel-box';
        case 'image/xlsx':
          return 'mdi-file-excel-box';
        case 'image/ppt':
          return 'mdi-file-powerpoint-box';
        case 'image/pptx':
          return 'mdi-file-powerpoint-box';
        case 'image/jpg':
          return 'mdi-file-jpg-box';
        case 'image/jpeg':
          return 'mdi-file-jpg-box';
        case 'image/png':
          return 'mdi-file-png-box';
        default:
          return 'mdi-file';
      }
    }
  }
  };
  </script>
  
  <style scoped>
     .content {
        width: 100%;
        height: calc(100vh - 200px);
        background-color: #fff;
        border-radius: 24px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        position: relative;
        overflow: hidden;
        
    }
  .small-select {
  font-size: 5px;
}


.small-select .v-select__control {
  height: 36px; /* Ajuste la hauteur du champ de sélection */
}

.small-select .v-select__selections {
  font-size: 12px; /* Assure que les sélections de texte sont petites aussi */
}
.v-select__selection--comma  {
  font-size: 12px !important;
}
    .row {
      display: flex !important;
      gap: 20px;
    }
    .border {
      border: 1px solid #14202C;
    }
    .w-1\/3 {
      width: 50% !important;
    }
    .w-full {
      width: 100% !important;
    }
    .overflow-hidden{
      overflow: hidden;
    }
    .overflow-y-auto {
      overflow-y: auto;
    }
    .h-full {
      height: 100% !important;
    }
    .w-1\/3 {
      width: 33.333333% !important;
    }
    .h-1\/3 {
      height: 33.333333% !important;
    }
    .col {
      display: flex !important;
      flex-direction: column !important;
      gap: 5px
    }
      .py-7 {
        padding-block: 1.75rem; 
      }
      .upload-img {
        width: calc(100% - 200px);
        min-height: 100px;
        height: 100px;
        border: 1px dashed #14202C;
        border-radius: 16px;
        padding: 20px;
        position: relative;
        margin: auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 10px;
        font-size: 16px;
        align-items: center;
      }
      .upload-img input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }
      .pointer {
        cursor: pointer;
      }
      .flex {
        display: flex;
      }
      .flex-col {
        flex-direction: column;
      }
      .flex-row {
        flex-direction: row;
      }
      .justify-between {
        justify-content: space-between;
      }
      .justify-around {
        justify-content: space-around;
      }
      .justify-start {
        justify-content: flex-start;
      }
      .items-center {
        align-items: center;
      }
      .items-between {
        align-items: space-between;
      }
      .items-start {
        align-items: flex-start;
      }
      .cursor-pointer {
        cursor: pointer;
      }
      .text-lg {
        font-size: 10px !important;
      }
      .v-select {
          font-size: 14px  !important;
          overflow: hidden;
      }
      .file {
        width: calc(100% - 200px);
        height: max-content;
        border: 1px solid #14202C;
        border-radius: 20px;
        padding: 10px;
        overflow: hidden;
        display: flex;
      }
      .progress-bar {
        width: calc(100% - 40px);
        height: 4px;
        border-radius: 10px;
        background-color: rgb(196, 191, 191);
      }
      .fill {
        width: 50%;
        height: 100%;
        background-color: #16233077;
        border-radius: 10px;
      }
      .v-dialog:not(.v-dialog--fullscreen) {
        height: 45% !important;
        background-color: white !important;
      }
      .save-btn {
        width: max-content;
        height: max-content;
        padding: 14px;
        background-color: #14202C;
        border-radius: 16px;
        color: #fff !important;
        font-weight: 700;
      }
      .border-bottom {
        border-bottom: 1px solid rgba(226, 232, 240, 0.788) ;
      }
      .cancel-btn {
        width: max-content;
        height: max-content;
        padding: 16px;
        border-radius: 16px;
        background-color: rgb(226 232 240);
        font-weight: 700;
      }
      .text-alert {
        color: rgba(228, 11, 11, 0.801);
        font-size: 12px;
        font-weight: 700;
      }
      .chip{
        width: 120px;
        height: 30px;
        border-radius: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        font-weight: 700;
        text-transform: capitalize;
        position: relative;
        cursor: pointer;
        user-select: none;
        border: 1px solid #14202C;
        background-color: white;
      }
      .chip-point {
        width: 15px;
        height: 15px;
        border-radius: 50%;
        border: 1px solid #14202C;
        background-color: white;
        position: absolute;
        content: '';
        right: 5px;
      }
      .chip:hover {
        background-color: #14202c5d;
        color: white;
      }
      .icon-check {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #14202C !important;
        display: flex;
        justify-content: center;
        border: 4px solid white;
        align-items: center;
        padding: 10px;
        color: white !important;
        font-size: 20px;
        position: absolute;
        top: -8px;
        right: -4px;
        animation: check-animation 4ms ease-in-out;
      }
      .checked {
        background-color: #14202C;
        color: white;
      }

      @keyframes check-animation {
        0% {

          transform: scale(1.2) translate(0, -10px);
        }
        100% {
          transform: scale(1) translate(0, 0);
        }
      }
  </style>
  