<template>
    <v-container class="dialog" ref="dialog">
        <h3 class="subtitle-1 centered" style="padding: 10px">Filtre : expression régulier</h3>
    <v-select
          v-model="columnName"
          :items="columns"
            item-text="text"
            item-value="text"
          label="Selectionner une colonne"
          outlined
        >
    </v-select>

    <v-text-field
            v-model="regex_expression"
            label="Regex"
            placeholder="Enter votre regex"
            outlined
            style="font-size: 12px !important;"
          ></v-text-field>
        


          <v-row class="d-flex justify-center ga-4" >
              <button
              style="cursor: pointer;border-radius: 5px;display: flex;justify-content: center;align-items: center;background-color: white;border: 1px solid #14202c;position: relative;width: 100px;height: 40px;color: #14202c;margin: 10px;"
              @click="closeForm"
              >
                  Annuler
              </button>
            <button
                
            style="cursor: pointer;border-radius: 5px;display: flex;justify-content: center;align-items: center;background-color: #14202c;position: relative;width: 100px;height: 40px;;color: white;margin: 10px;"
            @click="handleSubmit"   
                :disabled="!columnName"
            >
                Valider
            </button>
          </v-row>

          
        

    </v-container>


</template>

<script>
import { MutationTypes } from '../../services/store/appDataStore/mutations';

    

    export default {
        name: 'FormToChangeColumn',
        props: {
            columns : {
                type:  Array,
                default: () => [],
                
            },
            regex: {
                type: String,
                default: '',
            }
        },
        methods: {
            handleSubmit() {
                console.log('Selected column:', this.columnName);
                const columnData = {
                    column: this.columnName,
                    expression: this.regex_expression,
                };
                this.$store.commit(MutationTypes.SET_REGEX_FILTER, columnData);
                this.$emit('close');
                const regex_exp = this.$store.state.appDataStore.regex_filter;
                console.log('Regex expression:', regex_exp);
            },



            closeForm() {
                this.$emit('close');
            },
        },
        data() {
            return {
                columnName: '',
                regex_expression: '',
                showdialog: this.dialog,
            };
        },

    mounted() {
        this.showdialog = this.dialog;
        console.log(this.columns);
    },
        watch: {
            dialog(newVal) {
                this.showdialog = newVal;
                console.log('Dialog prop changed:', newVal);
            },
            showdialog(newVal) {
                this.$emit('update:dialog', newVal);
            },
        },
    

}

</script>


<style scoped>

    .dialog {
        width: 400px; 
        height: 300px;
         position: absolute;
          top: 50px;
           left: 20px; 
           background-color: #ffff; 
        z-index: 99999 !important;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
    }

    .text-small {
        font-size: 12px !important;
    }


    .v-select .v-select__selection--comma  {
        font-size: 0.8rem !important;
     }

</style>