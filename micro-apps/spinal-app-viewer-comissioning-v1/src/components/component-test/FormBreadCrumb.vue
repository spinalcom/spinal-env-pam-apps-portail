<template>
    <div class="dialog-form">
        <div
        class="list-name center"
        >
          <h3>
              {{ title }}
          </h3>  
    </div>
        <div
        style="width: 100%;"
        >
            <ul class="list-item"  v-for="(item, index) in items"
                     :key="index" >

                <li class="list-item-name" @click="handleItemClick(item)">
                    <span >
                        {{ item.name }}
                    </span>
                </li>
            </ul>
            
    </div>
        <div
            class="v-action"
        ></div>
    </div>

</template>

<script lang="ts">
import { MutationTypes } from '../../services/store/appDataStore/mutations';

export default {
    name: 'FormBreadCrumb',
    props: {
        title: {
            type: String,
            required: true,
        },
        items :  {
            type: [] as any,
            default: () => [],
        },
        typeList : {
            type: String,
            required: true,
        }
    },

    mounted() 
     {
        
    },


     methods: {
        handleItemClick(item: any) {
            console.log('item clicked', item);
            this.$emit('item-selected', {
                type: this.typeList,
                item: item,
                typeItem: item.type,
            });
        }
     }
}



</script>




<style>

    .dialog-form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: max-content;
        padding-bottom: 20px;
        background-color: #f3f2f289;
        border-radius: 5px;
    }

    .list-name {
        width: 100%;
        height: 2.125rem;
        background-color: #f0f0f0;
        margin-bottom: 10px;
        padding: 15px;
        display: flex;
        justify-content: start;
        align-items: center;
        font-size: 1rem;
        font-weight: bold;
        font-family: Charlevoix Pro !important;
        color: #14202C;
    }
    .list-item {
        width: 100%;
        height: calc(100% - 3.125rem);
        display: flex;
        flex-direction: column;
        justify-content: start !important;
        align-items: flex-start !important;
        gap: 15px;
    }
    .list-item-name {
        width: 100%;
        height: 2.125rem;
        padding: 15px;
        padding-left: 20px;
        display: flex;
        justify-content: start;
        align-items: center;
        font-size: 1rem;
        font-weight: 500;
        font-family: Charlevoix Pro !important;
        color: #14202C;
        border-bottom: 0.5px solid #14202c33;
        cursor: pointer;
        position: relative;
    }
    .list-item-name:hover {
        background-color: #f0f0f0;
        font-size: 1.02rem;
        font-weight: 600;
        transition: all 0.5ms ease-in-out;
    }
    .list-item-name:hover::after {
        content: '';
        width: 2px;
        height: 100%;
        background-color: #14202C;
        position: absolute;
        left: 0;
    }
    .list-item-name:hover::before {
        content: '';
        width: 15px;
        height: 15px;
        background-color: transparent;
        position: absolute;
        right: 20px;
        border-top: 2px solid #14202C;
        border-right: 2px solid #14202C;
        transform: rotate(45deg);
    }
   

</style>