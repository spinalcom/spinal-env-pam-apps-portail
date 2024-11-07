<template>
    <div>
        <v-select class="selectCategory"  :items="controls_point" outlined @change="change_endpoint" v-model="localControlValue" item-value="" item-text="title" style="cursor: pointer;">
        </v-select>
    </div>
  </template>





<script lang="ts">
import { ConfigInterface } from '@/Interfaces/ConfigInterface.js';
import config from '../config.js'

export default {
    name: 'SelectCategory',
    props: {
        controls_point: {
            type: Array,
            required: true
        },
        control_value: {
            type: Object,
            required: false
        }
     
    },

    computed: {
        computedControlValue: {
            get() {
                return this.control_value;
            },
            set(newValue: ConfigInterface) {
                this.change_endpoint(newValue);
            }
        }
    },
    data() {
        return {
                localControlValue: this.control_value,
        }
    },

   methods:{
  
    change_endpoint(newValue: ConfigInterface){
        // console.log('change_endpoint', newValue)
        this.$emit('change_endpoint', newValue)
   }
  
},
    
}
</script>

<style scoped>
    .selectCategory {
        max-width: 500px;
        
        border-radius: 20px;
    }
    .option {
        color: black;
        font-size: 16px;
    }
</style>
