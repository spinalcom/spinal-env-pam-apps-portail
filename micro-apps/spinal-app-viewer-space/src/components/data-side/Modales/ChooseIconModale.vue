<template>
    <SimpleModale modaleTitle="Choisissez une icon" v-bind="$attrs" v-on="$listeners">
        <template #body>
            <v-card elevation="0">
                <v-row class="mt-6 pa-16 scroll-list" no-gutters>
                    <v-autocomplete data-cy="chooseIconModaleAutocomplete" v-model="icon" item-text="k" item-value="k" :items="arrayIcon" label="Standard">
                        <template #item="{ item }">
                            <v-row data-cy="chooseIconModaleRow">
                                <v-col cols="3">
                                    <v-icon> {{ item.v }}</v-icon>
                                </v-col>
                                <v-col cols="9">
                                    <div class="d-flex flex-row justify-end">{{ item.k }}</div>
                                </v-col>
                            </v-row>
                        </template>
                    </v-autocomplete>
                </v-row>
            </v-card>
        </template>
    </SimpleModale>
</template>

<script lang="ts">
// Components
import SimpleModale from './SimpleModale.vue'
// import {
//     VAutocomplete,
//     VCard,
//     VIcon,
//     VRow,
//     VCol
// } from 'vuetify/lib'

// Icon
import * as mdiIconsArray from "@mdi/js"


export default {
    components: {
        SimpleModale,
        // VAutocomplete,
        // VCard,
        // VCol,
        // VRow,
        // VIcon,
    },
    data() {
        return {
            arrayIcon: [],
            icon: "",
        }
    },
    expose: ['icon'],
    mounted() {
        this.arrayIcon = Object.entries(mdiIconsArray)?.filter(([k, v]): any => k.startsWith('mdi'))
        this.arrayIcon = this.arrayIcon?.map(([k, v]): any => {
            return { k: k, v: v }
        })
        // console.log("Array icon = ", this.arrayIcon);
    },
}
</script>

<style lang="scss"></style>