<template>
      <div
        v-if="dialog"
        class="dialog"
      >
        <form ref="form"   @submit.prevent="updateEndpoint">
            <div class="title">
                <h3>Modification</h3>
                <v-icon class="close" @click.stop="close()">mdi-close</v-icon>
            </div>
                <div class="edit_singleEndpoint" v-if="endpoint.name">
                    <label  :for="endpoint.endpoint.dynamicId">
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                        <span style="display: flex;">
                               <div class="color" :style="{ background: endpoint.color }"></div>
                               {{ endpoint.name }}
                           </span>
                        </div>
                        <span class="end_name">
                            {{ endpoint.endpoint.name}}
                        </span>
                        <input
                        :name="endpoint.endpoint.dynamicId"
                        :id="endpoint.endpoint.dynamicId"
                        v-model="endpoint.endpoint.value"
                        type="text"
                        placeholder="Enter endpoint"
                        />
                    </label>
                </div>
            <div class="content-form" v-if="endPointList.length > 0">
                <div class="grid" >
                    <label class="item" v-for="(item, idx) in endPointList" :for="item.endpoint.dynamicId">
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <span style="display: flex;">
                               <div class="color" :style="{ background: item.color }"></div>
                               {{ item.name }}
                           </span>
                        </div>
                        <span class="end_name">
                            {{ item.endpoint.name}}
                        </span>
                        <input
                        :name="item.endpoint.dynamicId"
                        :id="item.endpoint.dynamicId"
                        v-model="item.endpoint.value"
                        type="text"
                        placeholder="Enter endpoint"
                        />
                    </label>    
                </div>

            </div>
            <div class="action">
                <v-btn 
                depressed
                color="#d1d5db"                
                class="ma-2" @click="close()">Annuler</v-btn>
              <v-btn 
                dense
              class="ma-2" 
              color="#14202C"
              type="submit"
               style="color: #fff; font-weight: 600; font-size: 16px;">Confirmer</v-btn>
            </div>
        </form>
      </div>
  </template>

<script lang="ts">
import { ActionTypes } from '../interfaces/vuexStoreTypes';

    export default  {
        name: "EditEndpoint",
        props : {
            _dialog: {
                type: Boolean,
                default: true
            },
            item: {
                type: Object,
                default: () => {},
            } ,
            
        },
        data () {
      return {
        dialog: this._dialog,
        isGroup: false,
        endPointList: [] as any,
        endpoint: {} as any,
      }
    },

    watch : {
        _dialog : function (val) {
            this.dialog = val;
            this.loadData();
        }
    },
    methods: {
        loadData () {
            this.checkIfGroup(this.item);
            if(this.isGroup) {
                let endpointList : any[]  = [];
                this.item.children.forEach((child: any) => {
                    const endpointChild = 
                        {
                            name: child.name,
                            color: child.color,
                            endpoint: child.endpoint
                        }
                    endpointList.push(endpointChild);
                });
                this.endPointList = endpointList;
            } else {
                const endpointValue = 
                {
                    color: this.item.color,
                    name : this.item.name,
                    endpoint: this.item.endpoint
                }
                this.endpoint = endpointValue;


            }
       
        },

        close (){
            this.dialog = false;
            this.endPointList = [];
            this.endpoint = {};
            this.$emit('close');
        },
        checkIfGroup(item: any) {
            const type = item.type;
            type.includes('Group') ? this.isGroup = true : this.isGroup = false;
        },
        
        updateEndpoint() {
            const buildingId = localStorage.getItem('idBuilding');
            const formElement = this.$refs.form as HTMLFormElement; 
            const formData = new FormData(formElement);
            this.$store.dispatch(ActionTypes.UPDATE_ENDPOINT, {buildingId, formData}).then((res) => {
                if(res.status === 200) {
                    console.log('updated: ', res);
                    this.$emit('update',  {
                        status: 'success',
                        statusCode: 200,
                        text: 'Synchronisation...',
                        data: res.data
                    });
                    this.close();
                }
            }).catch((error) => {
                console.log('error: ', error);
                // handle error
                this.$emit('update',  {
                    status: 'error',
                    statusCode: 500,
                    text: 'Erreur lors de la synchronisation',
                    data: error
                });
            });
            // for (const [key, value] of formData.entries()) {
            //     console.log(`value: ${key}: ${value}`);
            // }
    }
    },
    mounted() {
    }
    }
</script>

<style scoped>
.dialog{

    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    transition: all 0.5s;
    opacity: 1;
    visibility: visible;
    transform: scale(1);
}
 
 form {
    width: 60%;
    min-height: 200px;
    max-height: calc(100% - 20%);
    background-color: #ffffff;
    border-radius: 10px;
    border: 1px solid #14202C;
    position: relative;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
 }
form .title {       
    width: 100%;
    padding: 20px;
    background-color: #d3d3d3e6;
    color: #14202C;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-radius: 5px;
    font-size: 20px;
}
.close {
    position: absolute !important;
    top: -2px;
    right: -10px;
    background-color: #14202C;
    color: #fff !important;
    cursor: pointer;
    width: 20px !important;
    height: 20px !important;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    padding: 10px;
    border: 1px solid #ffffff;
}

.grid {
 
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}
.item {
    background: #dcdcdc75;
    backdrop-filter: blur(30px);
    color: #14202C;
    padding: 10px;
    text-align: start;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
}
 span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #14202C;
}

 input {
    width: 100%;
    height: 30px;
    border: 1px solid #14202C;
    border-radius: 5px;
    font-size: 0.875rem;
    padding: 5px;
    margin-top: 5px;
    font-weight: bold;
}
.end_name {
    font-weight: 500 !important;
    color: #14202C;
}
.action {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px;
}

.content-form  {
    width: 100%;
    min-height: 200px;
    height: 85%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    overflow: hidden !important;
    overflow-y: auto !important;
}
.content-form::-webkit-scrollbar {
    width: 7px;
}
.content-form::-webkit-scrollbar-thumb {
    background-color: #b2b2b2b7;
    border: 1px solid #14202C;
    border-radius: 5px;
}
.content-form::-webkit-scrollbar-track {
    background-color: #dcdcdccf;
    border-radius: 5px;
    padding: 10px;
}
.color {
  width: 7px;
  height: 20px;
  margin-right: 4px;
  border-radius: 3px;
}
.edit_singleEndpoint {
    width: 100%;
    min-height: 40px;
    padding-inline: 30px;
}
</style>
