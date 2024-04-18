<template>
    <div style="overflow-y: auto;max-height: 45vh;" v-if="dataflattenedDifferences.length > 0">

        <table style="border-top:1px solid black ;margin-left: 10px;margin-right: 10px;" class="elevation-1 tableau ">
            <thead>
                <tr>
                    <th style="position: sticky; top: 0; background-color: white;">ID Statique</th>
                    <th style="position: sticky; top: 0; background-color: white;" class="header">Nom</th>
                    <th style="position: sticky; top: 0; background-color: white;">Attributs modifiés</th>
                    <th style="position: sticky; top: 0; background-color: white;">Voir</th>
                    <!-- <th>De</th>
                <th>À</th> -->
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in dataflattenedDifferences" :key="item.staticId">
                    <td>{{ item.staticId }}</td>
                    <td>{{ item.name }}</td>
                    <td><span v-for="(value, key) in item.differences" :key="key">{{ key }} , </span></td>
                    <td>
                        <div @click="showelementedited(item.differences)"
                            style="padding:18px ;display: flex;justify-content: center;align-items: center;">...</div>
                    </td>
                </tr>
            </tbody>
        </table>
        <div style="z-index: 99; background-color: red;"></div>
        <button @click="uploadData()" style="background-color: #14202c ;color: white;">IMPORTERRRRRR</button>
    </div>
</template>
<script>
import { MutationTypes } from "../../services/store/appDataStore/mutations"
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
export default {
    props: ['dataTab'],
    data: () => ({
        dataflattenedDifferences: [],
        showElementModofication: false,
        formattedList: []

    }),

    methods: {
        // flattenedDifferences(tab) {
        //     let results = [];
        //     tab?.forEach((item) => {
        //         Object.entries(item.differences).forEach(([key, value]) => {
        //             results.push({
        //                 staticId: item.staticId,
        //                 name: item.name,
        //                 key: key,
        //                 from: value.from,
        //                 to: value.to,
        //             });
        //         });
        //     });
        //     console.log(results, 'Le result de flattened differences');

        //     return results;
        // },

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
            console.log(formattedData, 'aaaaa');
            this.formattedList = formattedData;
        },

        uploadData() {
            // this.formattedList
            // const formattedData = this.formattedList
            // const buildingId = localStorage.getItem("idBuilding");

            console.log('test');
            this.$store.dispatch('UPDATE_MULTIPLE_ATTRIBUTES', {
                buildingId: localStorage.getItem("idBuilding"),
                formattedData: this.formattedList
            }).then(() => {
                console.log('Attributs mis à jour avec succès.');
            }).catch(error => {
                console.error('Erreur lors de la mise à jour:', error);
            });
            console.log('finaltest');
        },

        showelementedited(el) {
            this.showElementModofication = !this.showElementModofication
            console.log(el);
        }
    },

    watch: {
        dataTab(newVal, oldVal) {
            console.log('laslalsalslalslaslaslaslals', newVal);
            this.formatData(newVal)
            this.dataflattenedDifferences = newVal
        },
    }
}


</script>
<style scoped>
.tableau {
    overflow: scroll;
    max-height: 200px;

}
</style>