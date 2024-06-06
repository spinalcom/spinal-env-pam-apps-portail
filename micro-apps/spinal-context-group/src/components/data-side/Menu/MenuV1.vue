<template>

    <div class="menu-wrapper">
        <div class="arrow-left"></div>
        <div class="menu">
            <div class="cell">
                <div class="icon" @click="clickFirstCell">
                    <v-icon color="primary">{{ firstCell.icon }}</v-icon>
                </div>
                <div class="text">
                    {{ firstCell.title }}
                </div>
            </div>
            <div class="cell-main">
                <div class="icon" @click="clickMainCell">
                    <v-icon color="secondary">{{ mainCell.icon }}</v-icon>
                </div>
            </div>
            <div class="cell">
                <div class="icon" @click="clickSecondCell">
                    <v-icon color="primary">{{ secondCell.icon }}</v-icon>
                </div>
                <div class="text">
                    {{ secondCell.title }}
                </div>
            </div>
            <div class="arrow-right"></div>
        </div> 
    </div>

</template>

<script lang="ts">

// * Vuetify
//import { VIcon } from 'vuetify/lib'

export default {
    components: {
        //VIcon
    },
    props: {
        mainCell: {
            type: Object,
            default: () => {
                return {
                    title: "",
                    icon: "mdi-home"
                }
            },
            required: false,
            validator: (obj: Object) => {
                return Object.hasOwn(obj, "title") && Object.hasOwn(obj, "icon");
            }
        },
        firstCell: {
            type: Object,
            default: () => {
                return {
                    title: "Groupe Manager",
                    icon: "mdi-format-list-bulleted-type"
                }
            },
            required: false,
            validator: (obj: Object) => {
                return Object.hasOwn(obj, "title") && Object.hasOwn(obj, "icon");
            }
        },
        secondCell: {
            type: Object,
            default: () => {
                return {
                    title: "Nomenclature",
                    icon: "mdi-format-list-bulleted"
                }
            },
            required: false,
            validator: (obj: Object) => {
                return Object.hasOwn(obj, "title") && Object.hasOwn(obj, "icon");
            }
        }
    },
    methods: {
        clickFirstCell() {
            this.$emit('clickFirstCell');
        },
        clickSecondCell() {
            this.$emit('clickSecondCell');
        },
        clickMainCell() {
            this.$emit('clickMainCell');
        }
    }
}
</script>


<style lang="scss" scoped>
.menu-wrapper {
    // Increase this value in order to scale the components
    --global-font-size: 15px;

    --cell-max-height: 4em;
    --cell-max-width: 8em;

    --cell-main-height: 4em;
    --cell-main-width: 4em;

    --cell-z-index: 60;
    --component-z-index: 59;

    --menu-padding-x: 0.4em;
    --menu-padding-y: 1em;

    border-radius: 0.6em;
    background-color: white;
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
        0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 1px 5px 0 rgba(0, 0, 0, 0.12);
    padding: var(--menu-padding-x) var(--menu-padding-y);
    width: fit-content;
    position: relative;
    z-index: var(--component-z-index);

    // Increase this value for responsivness
    font-size: var(--global-font-size);

    .v-icon {
        font-size: 2em !important;
    }

    .menu {
        height: min-content;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        height: var(--cell-max-height);
        max-height: var(--cell-max-height);


        .cell {
            height: inherit;
            max-height: inherit;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 2fr 1fr;
            grid-column-gap: 0;
            grid-row-gap: 0;
            width: var(--cell-max-width);
            max-width: var(--cell-max-width);
            background-color: transparent;
            cursor: pointer;
            z-index: var(--cell-z-index);


            .icon {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                width: 100%;
                transition: transform background 400ms ease;
                transform: scale(1.2);

                &:hover {
                    transform: scale(1.3);

                    &::after {
                        content: '';
                        position: absolute;
                        background: rgba(128, 128, 128, 0.438);
                    }
                }

                &:active,
                &:focus {
                    transform: scale(1.1);
                }
            }

            .text {
                display: flex;
                align-items: flex-start;
                justify-content: center;
                height: 100%;
                width: 100%;
                font-size: 0.9em;
                font-weight: 600;
                font-family: 'Charlevoix';
            }
        }
    }

    .cell-main {
        display: flex;
        margin: 0 1em;
        justify-content: center;
        align-items: center;
        width: var(--cell-main-width);
        height: var(--cell-main-height);
        background: black;
        transform: translateY(-2.5em) rotate(45deg);
        border-radius: 0.7em;
        transition: transform 200ms ease;
        cursor: pointer;

        z-index: var(--cell-z-index);

        &:hover {
            transform: translateY(-2.5em) rotate(45deg) scale(1.1);
        }

        &:active,
        &:focus {
            transform: translateY(-2.5em) rotate(45deg) scale(0.9);
        }

        .icon {
            transform: rotate(-45deg);
        }
    }
}
</style>