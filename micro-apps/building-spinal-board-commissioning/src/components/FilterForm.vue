<template>


 <div class="filter-form">
   <div>
        <v-btn depressed small color="primary"  @click="showFilter = true">
        <v-icon left>{{ iconFilter }}</v-icon>    
           <span style="font-size: 14px; font-weight: 500; text-transform: lowercase; font-family: 'Charlevoix', sans-serif;">
               {{ buttonName }}
           </span>
        </v-btn>
   </div>
     
     <div
        v-if="showFilter"
     class="filter-content"
     >
     <div
     class="filter-header"
     >
     <h3>Filtre sur {{ columnSelected }}</h3>
    </div>
    
    <div class="filter-body">
        <div class="filter-column">
            <span class="label-column">
                Sélectionner une colonne
            </span>
            <ul>
                <li class="column" v-for="(col, index) in column" :key="index" @click="showForm(col)" :style="{ backgroundColor: columnSelected === col.text ? '#f0f0f0' : '#ffffff', boxShadow: columnSelected === col.text ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none', transform: columnSelected === col.text ? 'scale(1.02)' : 'scale(1)' }">
                    <span>
                        {{ col.text }}
                    </span>
                    <div>
                        <div v-if="columnSelected === col.text" class="selected-column"></div>
                        <v-icon>mdi-chevron-right</v-icon>
                    </div>
                </li>
            </ul>
        </div>
        <div
          v-if="showFilterValue"
        class="filter-value"
        >
        <section v-if="isText" style="width: 100%;">
                <span>
                    Filtrer par valeur de la colonne <strong>{{ columnSelected }}</strong>
                </span>
        <div
                class="filter-value-input"
        >
          <v-text-field
           style="width: 100%"
            label="Entrer une valeur"
            placeholder="ex: ^[a-zA-Z0-9]+$)"
            v-model="filterValue"
            outlined
            dense
          ></v-text-field>
        </div>
          <div
                class="color-section"
          >
          <ul class="filter-regex-list">
            <li  class="label" v-for="(item, index) in filterRegex" :key="index">
                <span>
                    {{  item.name }}
                </span>
                <div style="width: 20px; height: 20px; border-radius: 5px; position: relative;" :style="{ backgroundColor: item.color }" @click.stop="ShowBoxcolor(item)">

                </div>
                <div class="box-color" v-if="item.showBoxColor">
                        <v-icon style="position: absolute; top: -10px; right: -4px; z-index: 1000; background-color: #ffffff; border-radius: 50%; border: 1px solid #14202C;
                            padding: 2px; cursor: pointer; font-size: 14px; color: #14202C;" @click="item.showBoxColor = false">mdi-close</v-icon>
                    <div class="body">
                        <v-color-picker
                        v-model="item.color"
                        mode="hexa"
                        />
                    </div>
                </div>
            </li>
          </ul>


          </div>

        </section>
        
        <span 
        v-if="isNumber"
        >
            Filtrer par nombre
        </span>
        </div>
    </div>
    
    <div class="filter-footer">
        <v-btn depressed small color="#e1e3e1" @click="showFilter = false;  showFilterValue = false">Fermer</v-btn>
        <v-btn depressed small color="#14202C" @click="SaveFilter" style="color: #ffffff;">Appliquer</v-btn>
    </div>
</div>

</div>
</template>





<script lang="ts">
import { MutationTypes } from '../services/store/appDataStore/mutations';


 export default {
    name: 'FilterForm',
    props: {
        buttonName: {
            type: String,
            default: 'Configurer un filtre'
        },
        iconFilter: {
            type: String,
            default: 'mdi-filter'
        },
        column: {
            type: Array as () => any[],
            required: true
        },
    },

    data() {
        return {
            columnSelected: null,
            showFilter: false,
            showFilterValue: false,
            isNumber: false,
            isText: false,
            filterValue: '',
            filterData: [],
            filterRegex: [
                {
                    name: 'correspond',
                    data: [] as any[],
                    color: '#2eff38',
                    showBoxColor: false,
                    percent: 0,
                    isActive: false,

                },
                {
                    name: 'ne correspond pas',
                    data: [],
                    color: '#ff0f73',
                    showBoxColor: false,
                    percent: 0,
                    isActive: false,
                },
                
                {
                    name: 'doublon',
                    data: [],
                    color: '#7b03ab',
                    showBoxColor: false,
                    percent: 0,
                    isActive: false,
                },
                {
                    name: 'non défini',
                    data: [],
                    color: '#ab0322',
                    showBoxColor: false,
                    percent: 0,
                    isActive: false,
                }
            ]
        }
    },

    methods: {

         isValueNumber(value: any): boolean {
            // Vérifie si c'est un vrai nombre ou une chaîne convertible
            return typeof value === 'number' || (!isNaN(Number(value)) && value !== '');
        },

        isValueText(value: any): boolean {
            // Ce n'est pas un nombre valide
            return !this.isValueNumber(value);
        },
        showForm(column) {
            const name = column.value;
            const items = this.$store.state.appDataStore.filterDataConfig.data;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const key = Object.keys(item).find(key => key == name);
                if (key) {
                    this.isNumber = this.isValueNumber(item[key]);
                    this.isText = this.isValueText(item[key]);
                    this.columnSelected = column.text;
                    this.showFilterValue = true;
                    break;
                }
            }

            
        },

        ShowBoxcolor(item: {
            name: string;
            data: any[];
            color: string;
            showBoxColor: boolean;
            mode?: string[];

        }) {
            item.showBoxColor = !item.showBoxColor;
        },

        SaveFilter() {
            this.showFilter = false;
            const valueRegex = {
                column: this.columnSelected,
                regex: this.filterValue,
            }
         this.$store.commit(MutationTypes.SET_VALUE_REGEX, valueRegex);
        //  this.$store.commit(MutationTypes.SET_CONFIG_LABEL, this.filterRegex);

         this.filterData = this.$store.state.appDataStore.filterDataConfig.data
         const saveData = this.filterDataWithRegex(this.filterData, this.filterValue);

         this.$store.commit(MutationTypes.SET_CONFIG_LABEL, saveData);
         this.$store.commit(MutationTypes.SET_STRIPE_DATA, saveData);
        },

filterDataWithRegex(data: any[], regex: string) {
    const columnName = this.column.find(col => col.text === this.columnSelected)?.value || this.$store.state.appDataStore.ValueRegex.column;
    if (!columnName) {
        
        return [];
    }

    this.filterRegex.forEach(grp => grp.data = []);
 
    const regexPattern = regex ? new RegExp(regex, 'i') : this.$store.state.appDataStore.ValueRegex.regex;
    const seen = new Map<string, any[]>(); 
    for (const item of data) {
        const value = item[columnName];

        if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'non défini') {
            this.filterRegex.find(grp => grp.name === 'non défini')?.data.push(item);
            continue;
        }

        const strValue = String(value);

        if (regexPattern.test(strValue)) {
            if (!seen.has(strValue)) {
                seen.set(strValue, []);
            }
            seen.get(strValue)!.push(item);
        } else {
            this.filterRegex.find(grp => grp.name === 'ne correspond pas')?.data.push(item);
        }
    }

    // Classification finale : correspond ou doublon
    for (const [value, items] of seen.entries()) {
        if (items.length > 1) {
            this.filterRegex.find(grp => grp.name === 'doublon')?.data.push(...items);
        } else {
            this.filterRegex.find(grp => grp.name === 'correspond')?.data.push(...items);
        }
    }

    // Mise à jour des pourcentages
    const totalItems = data.length;
    this.filterRegex.forEach(grp => {
        grp.percent = totalItems > 0 ? parseFloat(((grp.data.length / totalItems) * 100).toFixed(2)) : 0;
    });
    
    return this.filterRegex;
}


    },

    computed: {
        selectedZone() {
            return this.$store.state.appDataStore.zoneSelected;
        },
        filterDataConfig() {
            return this.$store.state.appDataStore.filterDataConfig.data;
        },
        spaceSelected() {
            return this.$store.state.appDataStore.zoneSelected;
        },
    },
    
    watch: {
        
        spaceSelected: {
            handler(newData) {
                const dataConfig = this.$store.state.appDataStore.data.data;
                const regex = this.$store.state.appDataStore.ValueRegex.regex;
                
            },
            immediate: true
        },

        filterDataConfig: {
            handler(newData) {
                this.SaveFilter();
            }
        }
    }
    
 }

</script>


<style  scoped>

.filter-form {
    width: max-content;
    height: max-content;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    user-select: none;
}



.filter-content {
    width: max-content;
    height: 500px;
    display: flex;
    position: absolute;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    background-color: transparent;
    border-radius: 8px;
    padding: 20px;
    gap: 20px;
    z-index: 1000;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    right: -10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color:#ffffff;
}

.filter-body {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: calc(100% - 100px);
    justify-content: space-between;
    gap: 4px;
}
.filter-column {
    width: 500px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    background-color: #ffffff;
    border-radius: 5px;
}
.filter-column .label-column {
    position: absolute;
    top: -12px;
    left: 10px;
    font-weight: bold;
    font-size: 16px;
    color: #ffffff;
    text-transform: lowercase;
    padding: 2px;
    background-color: #14202C;
    border-radius: 5px;
    outline: 4px solid #ffffff;
}
.filter-column > span::first-letter {
    text-transform: uppercase;
    font-weight: bold;
    font-family: 'Charlevoix', sans-serif;
    font-size: 16px;
    color: #ffffff;
    font-weight: 600;
    font-family: 'Charlevoix', sans-serif;
}
.filter-column ul {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0;
    margin: 0;
    padding: 20px    ;
}

.filter-column  .column {
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    border: 1px solid #14202C;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    transition: all 0.2s ease;
    font-family: 'Charlevoix', sans-serif;
    font-weight: 600;
    font-size: 16px;
    align-items: center;
    text-transform: capitalize;
}
.filter-column .column div {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.selected-column {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #14202C;
    margin-right: 10px;
    border: 2px solid #ffffff;
    outline: 4px solid #14202C;
}

.filter-column li:hover {
    background-color: #f0f0f0;
    font-family: 'Charlevoix', sans-serif;
    font-weight: 700;
}

.filter-value {
    width: 500px;
    min-height: 200px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    background-color: #ffffff;
    transition: all 1s linear;
    border-radius: 5px;

}
.filter-value-input {
    width: 100%;
    display: flex;
    align-items: center;
    margin-top: 20px;
}
.color-section {
    width: 100%;
}
.filter-regex-list {
   width: 100%;
   display: flex;
    flex-direction: row ;
    flex-wrap: wrap;
    gap: 10px;
    align-items: start;


}
.filter-regex-list  > .label {
    width: max-content;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 7px;
    border: 1px solid #14202C;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 700;
    padding: 5px;
    text-transform: lowercase;
    position: relative;
}
.filter-regex-list  > .label span {
    width: max-content;
}

.box-color {
    width: 270px;
    height: 270px;
    position: absolute;
    top: 20px;
    left: 90%;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    padding: 4px;
    background-color: #ffffff;
    backdrop-filter: blur(5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #14202C;
}



.box-color .body {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
   overflow: hidden;
   overflow-y: auto;
   padding: 5px;
}
.box-color .v-color-picker {
    width: 100%;
    height: 100%;
    border-radius: 5px;
}
.filter-footer {
    width: 100%;
    display: flex;
   justify-content: flex-end;
    gap: 10px;
}
.filter-footer v-btn {
    width: max-content;
    height: max-content;
    font-size: 14px;
    font-weight: 600;
    text-transform: lowercase;
    font-family: 'Charlevoix', sans-serif;
}


</style>