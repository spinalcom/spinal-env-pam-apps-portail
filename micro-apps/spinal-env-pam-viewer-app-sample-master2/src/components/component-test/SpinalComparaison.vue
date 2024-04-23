<template>
    <div>
        <div @click.stop
            style="background-color: white;width: 65%;height: 71%;left: 50%;top:50%;position: absolute;transform: translate(-50%,-50%); overflow: hidden;">
            <div
                style="background-color: rgb(228, 228, 228);width: 100%;height: 50px;padding: 10px;font-size: 25px; color: #14202c;font-weight: bold;padding-bottom: 50px;">
                Import des données
            </div>

            <div
                style="width: 100%;height: 40px;display: flex;flex-direction: row;justify-self: center;align-self: center;margin-bottom: 16px;">
                <!-- <v-checkbox v-model="checked" label="Comparer avec la totalités des attributs du tableau "></v-checkbox> -->
                <label style="margin-top: 16px;" class="custom-file-upload">
                    <input type="file" @change="handleFileUpload" style="display: none;" />
                    <span
                        style="border: 1px solid black; padding: 8px ;border-radius: 4px; color: white;background: #14202c;font-weight: bold;"
                        id="file-chosen">Choisir un fichier </span>
                    <v-icon color="green" v-if="fileIsLoaded">mdi-check</v-icon>
                    <span v-if="fileIsLoaded" style="margin-left: 5px;color: green;">fichier importé avec succés</span>
                </label>
            </div>

            <div style="padding-left: 10px;padding-right: 10px;">
                <DataTable :height="'52vh'" :items="filteredContexts" :headers="headers" :contexts="filteredContexts"
                    :selections="selections" @item-selected="selectDataView($event.item)"
                    @filter="filtercolumn($event)" />
            </div>

            <!-- 
             <div style="overflow-y: auto;max-height: 45vh;" v-if="dataTab.length > 0">

                <table style="border-top:1px solid black ;margin-left: 10px;margin-right: 10px;"
                    class="elevation-1 tableau ">
                    <thead>
                        <tr>
                            <th style="position: sticky; top: 0; background-color: white;">ID Statique</th>
                            <th style="position: sticky; top: 0; background-color: white;" class="header">Nom</th>
                            <th style="position: sticky; top: 0; background-color: white;">Attributs modifiés</th>
                            <th style="position: sticky; top: 0; background-color: white;">Voir</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in dataTab" :key="item.staticId">
                            <td>{{ item.staticId }}</td>
                            <td>{{ item.name }}</td>
                            <td><span v-for="(value, key) in item.differences" :key="key">{{ key }} , </span></td>
                            <td>
                                <div @click="showelementedited(item.differences)"
                                    style="padding:18px ;display: flex;justify-content: center;align-items: center;">...
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div style="z-index: 99; background-color: red;"></div>
                
            </div>  -->
            <button v-if="fileIsLoaded" @click="uploadData()"
                style="border: 1px solid black; background-color: #14202c ;color: white;padding: 8px; position: absolute; right:10px;bottom: 10px; border-radius: 4px;font-weight: bold;">Valider
                l'import</button>

        </div>

    </div>

</template>
<script>
import SpinalExcelManager from 'spinal-env-viewer-plugin-excel-manager-service'
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import DataTable from './SpinalDataTable';

export default {
    components: {
        DataTable
    },
    props: ['contexts'],
    data: () => ({
        dataflattenedDifferences: [],
        showElementModofication: false,
        formattedList: [],
        fileIsLoaded: false,
        checked: false,
        tableData: [],
        difference_data: [],
        dataTab: [],
        headers: [
            { text: 'ID Statique', value: 'staticId' },
            { text: 'Nom', value: 'name' },
            { text: 'Attributs modifiés', value: 'differences' },
            // { text: 'Voir', value: '' },
        ],
        selections: []
    }),

    computed: {
        filteredContexts() {
            if (this.dataTab) {
                return this.dataTab
            }
        },
    },

    methods: {

        async handleFileUpload(event) {
            const file = event.target.files[0];
            this.$emit('extractData');
            if (file) {
                this.fileIsLoaded = true;
                const loaded = (await SpinalExcelManager.convertExcelToJson(file))['sheet 1'];
                if (this.checked != true) {
                    this.tableData = this.contexts[0].data?.map(item => {
                        const dataForRow = {
                            dynamicId: item.dynamicId,
                            staticId: item.staticId,
                            Nom: item.name,
                        };

                        item?.categoryAttributes.forEach(category => {
                            category.attributs.forEach(attr => {
                                const attrKey = `${attr.label}/${category.name}`;
                                dataForRow[attrKey] = attr.value;
                            });
                        });

                        return dataForRow;
                    });
                    this.$store.commit(MutationTypes.SET_DLDATA, this.tableData);
                }

                const dldata = this.$store.state.appDataStore.dlData
                this.dataTab = this.findDifferencesByStaticId(loaded, dldata);
                // console.warn(this.dataTab);
                // console.log(this.dataflattenedDifferences , 'sasasasas');
            }
        },


        findDifferencesByStaticId(array1, array2) {
            let differences = [];
            array1.forEach(a1 => {
                const a2 = array2.find(a2 => a2.staticId === a1.staticId);
                if (a2) {
                    let diff = {};
                    let keys = new Set([...Object.keys(a1), ...Object.keys(a2)]);
                    keys.forEach(key => {
                        const normalizeValue = (value) => {
                            const normalized = value?.result ?? value;
                            return (normalized === undefined || normalized === null || normalized === "") ? "" : String(normalized);
                        };

                        const word1 = normalizeValue(a1[key]);
                        const word2 = normalizeValue(a2[key]);

                        if (word1 !== word2 && key != 'dynamicId') {
                            diff[key] = { from: word2, to: word1 };
                        }
                    });

                    if (Object.keys(diff).length > 0) {
                        differences.push({ staticId: a1.staticId, name: a1.Nom, dynamicId: a2.dynamicId, differences: diff });
                    }
                }

            });
            return differences;
        },

        formatData(dataList) {
            const formattedData = dataList.map(item => {
                const formattedItem = { dynamicId: item.dynamicId, categories: [] };
                const categoriesMap = {};

                for (const [key, value] of Object.entries(item.differences)) {
                    const [attributeLabel, categoryName] = key.split('/');

                    if (!categoriesMap[categoryName]) {
                        categoriesMap[categoryName] = {
                            categoryName,
                            attributes: []
                        };
                    }

                    categoriesMap[categoryName].attributes.push({
                        attributeLabel,
                        attributeNewValue: value.to
                    });
                }

                for (const category of Object.values(categoriesMap)) {
                    formattedItem.categories.push(category);
                }

                return formattedItem;
            });
            this.formattedList = formattedData;
        },

        uploadData() {
            this.$store.dispatch('UPDATE_MULTIPLE_ATTRIBUTES', {
                buildingId: localStorage.getItem("idBuilding"),
                formattedData: this.formattedList
            }).then(() => {
                this.$emit('updateSuccess');
            }).catch(error => {
                console.error('Erreur lors de la mise à jour:', error);
            });
        },

        showelementedited(el) {
            this.showElementModofication = !this.showElementModofication
        }
    },

    watch: {
        dataTab(newVal, oldVal) {
            this.formatData(newVal)
            // this.dataflattenedDifferences = newVal
        },
    }
}


</script>
<style scoped>
.tableau {
    overflow: scroll;
    max-height: 200px;

}


.custom-file-upload {
    display: inline-block;
    cursor: pointer;
}

.custom-file-upload button {
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
}

.custom-file-upload #file-chosen {
    margin-left: 10px;
    font-family: Arial, sans-serif;
}
</style>