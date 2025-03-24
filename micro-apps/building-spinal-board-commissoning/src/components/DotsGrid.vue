<template>
    <div class="dots-grid">
        <div
        v-for="(dot, index) in dotsList"
        :key="index"
        class="dot"
        >
        
    </div>
    </div>
</template>

<script lang="ts">
import { dot } from 'node:test/reporters';

export default {
    name: "DotsGrid",
    props: {
        dotsList: {
            type: Array,
            required: true,
        }
    },
    data() {
        return {
            dotData: this.dotsList,
        }
    },


     mounted() {
        console.log('dotsData', this.dotData);    
    },



    watch: {
        dotsList: {
            handler: function (value) {
               this.dotData = value;
            },
            deep: true,
        },
    },


    methods : {
        getColors(value: any) {
            if(typeof value === 'string') {

            }
            else if(typeof value === 'number') {

            }
            else if(typeof value === 'boolean') {

            }
        }
    }
}

</script>