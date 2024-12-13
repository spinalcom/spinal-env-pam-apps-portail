<template >
          <button 
    class="button-add" @click="$emit('open-dialog')">
        <v-icon class="icon">{{ icon }}</v-icon>
            <div class="text-button">
                <span class="title-button">{{ name }}</span>
            </div>
        </button>


</template>

<script lang="ts">

export default {
        name: 'add-btn',
        props : {
            name: {
                type: String,
                required: true
            },
            icon : {
                type: String,
                required: true
            }
        }
    }

</script>

<style>
    .icon {
        width: 28px !important;
        height: 28px !important;
        background-color: white !important;
        color: #14202C !important;
        border-radius: 6px !important;
        padding: 10px !important;
    }
 
  
</style>