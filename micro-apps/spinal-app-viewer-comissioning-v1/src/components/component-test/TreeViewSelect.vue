<template>

<div>
        <div title="Sélection de la catégory d'attribut / attribut"
        style="width: 100%; display: flex; margin-top: 10px; position: relative;">
        <div
            style="margin-left: 2px; z-index: 10; position: absolute; width: calc(100% - 90px); border-radius: 5px; background-color: rgb(255, 255, 255);">
            <div class="mouse" @click="showattribut = !showattribut" style="">
            <v-icon v-if="!showattribut" color="black" style="font-size: 2em">mdi-chevron-down</v-icon>
            <v-icon v-else color="black" style="font-size: 2em">mdi-chevron-up</v-icon>
            <div v-if="!keyselected[0]">Selectionner des attributs.</div>
            <div style="padding-top: 5px; width: 100%; display: flex; flex-direction: row; gap: 4px; overflow-y: auto !important;">
                <v-chip style="margin: 2px " v-for="(element, index) in keyselected" :key="index" :class="{
                'blue-background': element.parentName === element.childName,
                'red-background': element.parentName !== element.childName
                }">
                 {{ element.parentName }}({{ element.name }})
                <div
                    style="top: -5px;right:-5px;position: absolute;background-color: white;border-radius: 20px;height: 15px;width: 15px;display: flex;justify-content: center;align-items: center;border: 1px solid #14202c; color: #14202c;">
                    <v-icon style="margin-top: 1px;" size="13px"
                    @click.stop="deleteAttrSelected(element)">mdi-close</v-icon>
                </div>
                </v-chip>
            </div>
            </div>

            <div>
            <v-treeview class="my-custom-treeview animate" v-if="showattribut"
                style="width: 100%;padding-left: 20px;user-select: none;" v-model="selectedKeys" selectable
                item-disabled="locked" :items="treeviewItems"></v-treeview>
            </div>
        </div>
        <div @click.stop="importAttr = !importAttr"
            style="cursor: pointer;  position: absolute; right: 0;  border-radius: 5px;  margin-left: 10px;">
            <v-icon title="import" color="black"
            style="font-size: 2em;border: 1px solid black;border-radius: 5px;padding: 10px;">mdi-file-upload</v-icon>
        </div>
        </div>
</div>

</template>



<script lang="ts">
import { IDynamicHeader } from '../../interfaces/IDynamicHeader';
import { MutationTypes } from '../../services/store/appDataStore/mutations';


export default {
    name: 'TreeViewSelect',
    

    data() {
        return {
            showattribut: false,
            selectedKeys: [] as any,
            keyselected: [] as any,
            importAttr: false,
        };
    },


    mounted() {
      console.log('mounted', this.$store.state.appDataStore);
    },

    methods: {
        deleteAttrSelected(element) {
          console.log('deleteAttrSelected', element);
            // this.keyselected = this.keyselected.filter((item) => item.name !== element.name);
            this.selectedKeys = this.selectedKeys.filter((item) => item !== element.id);
            this.keyselected = this.keyselected.filter((item) => item.id !== element.id);
            const findedHeader = this.dynamicHeader.find((header) => header.text === element.name);
            if(findedHeader) {
                this.$store.commit(MutationTypes.DELETE_DYNAMIC_HEADER, {
                    text: findedHeader.text,
                    value: findedHeader.value,
                    sortable: findedHeader.sortable,
                    id: findedHeader.id,
                    parentName: findedHeader.parentName,
                })
            }
            
        },
        replaceEscape(str: string) {
            return str.replace(" ", "_");
        }
    },



    watch: {
          selectedKeys: {
            handler(newVal) {
              console.log('selectedKeys', newVal);
                this.keyselected = [];
                newVal.forEach((element) => {
                  const childreen = this.treeviewItems.map((item) => item.children).flat();
                  const item = childreen.find((child) => child.id === element);
                
                    if (item) {
                        this.keyselected.push(item);
                    }
                });
                this.keyselected.forEach((element) => {

                  const findedHeader = this.dynamicHeader.find((header) => header.text === element.name);


                  if(!findedHeader) {
                    this.$store.commit(MutationTypes.ADD_DYNAMIC_HEADER, {
                       text: element.name,
                      value: this.replaceEscape(element.name),
                      sortable: true,
                      id: element.id,
                      parentName: element.parentName,
                    })
                  }

                })
                console.log('dynamic Header: ', this.dynamicHeader);
                
            },
            deep: true,
            immediate: true,

        
        },
    },

    computed: {
        treeviewItems() {
            const items = this.$store.state.appDataStore.data.map((item) => item.attributes);
            console.log('items', items[0]);
            return items[0].map(item => {
                return {
                    name : item.name,
                    id: item.dynamicId,
                    locked: false,
                    children: item.attributs.map((child) => {
                        return {
                            name: child.label,
                            id: child.dynamicId,
                            locked: false,
                            parentName: item.name,
                            childName: child.name,
                        };
                    }),

                }
            })
            
        },

        dynamicHeader() {
            return this.$store.state.appDataStore.dynamicHeader as IDynamicHeader[];
        },
    },

};
</script>


<style scoped>
.mouse {
  width: 96%;
  height: 50px;
  background-color: rgb(255, 255, 255);
  border-radius: 5px;
  border: 1px solid rgb(0, 0, 0);
  padding-left: 20px;
  font-size: 17px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: 0.5s;
  color: rgb(47, 47, 47);
}
.blue-background {
  background-color: #14202c !important;
  color: white !important;
}

.red-background {
  background-color: rgb(255, 255, 255) !important;
  color: #14202c !important;
  border: 1px solid #14202c !important;
}

.scrollable-table-container {
  overflow-x: auto;

}

.vignette_color {
  font-size: 2em;
  border: 1px solid black;
  border-radius: 5px;
  padding: 3px;
  padding-left: 12px;
  padding-right: 12px;
  cursor: pointer;
  transition: 0.5s;

}


.vignette_color {
  font-size: 2em;
  border: 1px solid black;
  border-radius: 5px;
  padding: 3px;
  padding-left: 12px;
  padding-right: 12px;
  cursor: pointer;
  transition: 0.5s;

}

.blur-background {
  background-color: rgba(0, 0, 0, 0.528);
  top: 0;
  left: 0;
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 99999;
  content: '';
}



.animate {
  -webkit-animation: scale-in-ver-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  animation: scale-in-ver-top 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}

@-webkit-keyframes scale-in-ver-top {
  0% {
    -webkit-transform: scaleY(0);
    transform: scaleY(0);
    -webkit-transform-origin: 100% 0%;
    transform-origin: 100% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
    -webkit-transform-origin: 100% 0%;
    transform-origin: 100% 0%;
    opacity: 1;
  }
}

@keyframes scale-in-ver-top {
  0% {
    -webkit-transform: scaleY(0);
    transform: scaleY(0);
    -webkit-transform-origin: 100% 0%;
    transform-origin: 100% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scaleY(1);
    transform: scaleY(1);
    -webkit-transform-origin: 100% 0%;
    transform-origin: 100% 0%;
    opacity: 1;
  }
}

</style>