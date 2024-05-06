<template>
    <div class="button-wrapper">
        <div class="buttons">
            <v-btn @click="expandLeft()" color="primary" fab small>
                <v-icon dark medium>{{ iconLeft }}</v-icon>
            </v-btn>
            <v-btn class="mt-2" @click="schrinkRight()" color="primary" fab small>
                <v-icon dark medium>{{ iconRight }}</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script lang="ts">
import { ExpansionMode } from '@/interfaces';

// Vuetify
import {
    VBtn,
    VIcon,
} from 'vuetify/lib';


export default {
    components: {
        VBtn,
        VIcon
    },
    props: {
        iconLeft: {
            type: String,
            default: function () {
                return "mdi-arrow-left-bold"
            },
            required: false
        },
        iconRight: {
            type: String,
            default: function () {
                return "mdi-arrow-right-bold"
            },
            required: false
        },
        defaultExpansion: {
            type: String,
            default: function () {
                return 'one-tier'
            },
            required: false
        }
    },
    data() {
        const currentExpansion: ExpansionMode = 'one-tier';
        return {
            currentExpansion
        }
    },
    mounted() {
        this.currentExpansion = this.defaultExpansion;
    },
    methods: {
        expandLeft() {
            this.defaultExpansion;
            switch (this.currentExpansion) {
                case 'zero':
                    this.currentExpansion = 'one-tier';
                    this.$emit('updateExpansion', this.currentExpansion);
                    break;
                case 'one-tier':
                    this.currentExpansion = 'half';
                    this.$emit('updateExpansion', this.currentExpansion);
                    break;
                case 'half':
                    this.currentExpansion = 'full';
                    this.$emit('updateExpansion', this.currentExpansion);
                    break;
                case 'full':
                    break;
                default:
            }
        },
        schrinkRight() {
            switch (this.currentExpansion) {
                case 'zero':
                    break;
                case 'one-tier':
                    this.currentExpansion = 'zero';
                    this.$emit('updateExpansion', this.currentExpansion);
                    break;
                case 'half':
                    this.currentExpansion = 'one-tier';
                    this.$emit('updateExpansion', this.currentExpansion);
                    break;
                case 'full':
                    this.currentExpansion = 'half';
                    this.$emit('updateExpansion', this.currentExpansion);
                    break;
                default:
            }
        },
    }
}
</script>


<style scoped lang="scss">
.button-wrapper {
    height: 15vh;

    .buttons {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }
}
</style>