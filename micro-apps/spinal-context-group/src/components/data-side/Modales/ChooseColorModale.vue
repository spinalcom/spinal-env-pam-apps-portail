<template>
    <SimpleModale  modaleTitle="Choisissez une couleur" v-bind="$attrs" v-on="$listeners">
        <template #body>
            <v-card class='d-flex flex-row justify-center' elevation="0">
                    <v-color-picker data-cy="chooseColorModalePicker" v-model="color" class="ma-2" dot-size="30"></v-color-picker>
            </v-card>
        </template>
    </SimpleModale>

</template>

<script lang="ts">
// Components
import SimpleModale from './SimpleModale.vue';
// import {
// 	VCard,
// 	VColorPicker,
// } from 'vuetify/lib';

export default {
	components: {
		SimpleModale,
		// VCard,
		// VColorPicker,
	},
	data() {
		return {
			color: '',
		};
	},
	expose: ['color'],
};
</script>
