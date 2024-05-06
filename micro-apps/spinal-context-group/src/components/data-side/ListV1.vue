<template>
    <v-card data-cy="listV1" class="rounded-xl" elevation="2" width="90%" max-width="90%" color="secondary">
        <v-card-title>{{ title }}</v-card-title>
        <v-text-field data-cy="listV1SearchBar" filled label="Rechercher" single-line hide-details="true" height="30px"
            v-model="searchModel" :loading="isLoading">
            <template #prepend-inner>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on">
                            mdi-magnify
                        </v-icon>
                    </template>
                    <span>Rechercher</span>
                </v-tooltip>
            </template>
            <template #append>
                <div class="d-flex align-center" height="100%">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon data-cy="listV1AddButton" v-bind="attrs" v-on="on"
                                :disabled="(typeGroup > 0 && (selectedItemsGlobal[typeGroup - 1] === undefined))"
                                @click="createEntity" color="primary">
                                mdi-plus-circle
                            </v-icon>
                        </template>
                        <span> {{ tooltipsAddButton }}</span>
                    </v-tooltip>
                </div>
            </template>
        </v-text-field>
        <v-list dense height="40vh">
            <div class="helper" v-if="itemsFiltered.length === 0 && searchModel.length === 0">
                Il n'y a pas de données disponibles
            </div>
            <div class="helper" v-if="itemsFiltered.length === 0 && searchModel.length !== 0">
                Votre recherche ne correspond à aucun élément
            </div>
            <v-list-item-group v-model="selectedItem" color="primary">
                <transition-group name="list" tag="ul">
                    <v-list-item v-for="( item, i ) in  itemsFiltered " :key="i" @click="selectEntity(item)">
                        <v-list-item-content>
                            <v-list-item-title v-text="item.title" data-cy="listV1ItemTitle"></v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-menu offset-x transition="slide-x-transition">
                                <template #activator="{ on: menu, attrs }">
                                    <v-tooltip top>
                                        <template v-slot:activator="{ on: tooltip }">
                                            <v-btn icon v-on="{ ...tooltip, ...menu }" v-bind="attrs"
                                                data-cy="listV1ItemMenuButton">
                                                <v-icon small>
                                                    {{ mdiDotsVertical }}
                                                </v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Menu</span>
                                    </v-tooltip>
                                </template>
                                <v-list>
                                    <v-list-item @click="openCloseUpdateModale(true, item)">
                                        <v-list-item-icon> <v-icon>mdi-pencil</v-icon></v-list-item-icon>
                                        <v-list-item-title>Modifier</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="openCloseDeleteModale(true, item)"
                                        data-cy="listV1ItemMenuButtonDelete">
                                        <v-list-item-icon> <v-icon>mdi-delete</v-icon></v-list-item-icon>
                                        <v-list-item-title>Supprimer</v-list-item-title>
                                    </v-list-item>
                                    <div class="d-print-block" v-for="(cell, index) in extraMenuContent"
                                        :key="cell.title">
                                        <v-list-item @click="extraMenuClick(item, index, cell.globalIndex)"
                                            data-cy='listV1ItemMenuButtonExtra'>
                                            <v-list-item-icon> <v-icon>{{ cell.icon }}</v-icon></v-list-item-icon>
                                            <v-list-item-title>{{ cell.title }}</v-list-item-title>
                                        </v-list-item>
                                    </div>
                                </v-list>
                            </v-menu>
                        </v-list-item-action>
                    </v-list-item>
                </transition-group>
                <v-dialog v-model="dialogDelete" width="40vw">
                    <div data-cy="listV1DialogDelete">
                        <v-card>
                            <v-card-title class="text-h5">Êtes-vous certain de vouloir supprimer ce groupe : "{{
            itemToUpdate.title }}" ?
                            </v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text
                                    @click="openCloseDeleteModale(false, itemToUpdate)">Fermer</v-btn>
                                <v-btn color="primary" @click="deleteEntity(itemToUpdate)"
                                    data-cy="listV1DialogDeleteConfirmation">Oui</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </div>
                </v-dialog>
                <v-dialog v-model="dialogUpdate" width="40vw">
                    <v-card>
                        <v-card-title class="text-h5">Modification du groupe : "{{
            itemToUpdate.title }}"
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-text-field v-model="newTitle" label="Nouveau nom"></v-text-field>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text
                                @click="openCloseUpdateModale(false, itemToUpdate)">Fermer</v-btn>
                            <v-btn color="primary" @click="updateEntity(itemToUpdate, newTitle)">Sauvegarder</v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

            </v-list-item-group>
        </v-list>
    </v-card>
</template>
<script lang="ts">
// Interfaces
import { EAPIVerb } from '../../services/GroupeWithChildren';
import { IItemV1 } from '../../interfaces';

// Vuetify
import {
    VBtn,
    VCard,
    VCardActions,
    VCardTitle,
    VDialog,
    VIcon,
    VList,
    VListItem,
    VListItemTitle,
    VListItemAction,
    VListItemContent,
    VListItemGroup,
    VListItemIcon,
    VMenu,
    VSpacer,
    VTextField,
    VTooltip,
} from 'vuetify/lib';

import { TransitionGroup } from 'vue';
import { mdiDotsVertical } from '@mdi/js';


// Other

export default {
    components: {
        mdiDotsVertical,
        VBtn,
        VCard,
        VCardActions,
        VCardTitle,
        VDialog,
        VIcon,
        VList,
        VListItem,
        VListItemTitle,
        VListItemContent,
        VListItemAction,
        VListItemIcon,
        VListItemGroup,
        VMenu,
        VSpacer,
        VTextField,
        VTooltip,
    },
    props: {
        isLoading: {
            type: Boolean,
            required: false,
            default: function (): boolean {
                return false
            },
            validator: function () {
                return true
            }
        },
        extraMenuContent: {
            type: Array<Object>,
            required: false,
            default: () => {
                return []
            },
            validator: function (lst: Array<any>) {
                for (const cell of lst) {
                    if (!Object.hasOwn(cell, 'title') && !Object.hasOwn(cell, 'icon') && !Object.hasOwn(cell, 'globalIndex')) {
                        return false;
                    }
                }
                return true;
            }
        },
        items: {
            type: Array<IItemV1 | any>,
            required: true,
            default: function (): Array<IItemV1> {
                return []
            },
            validator: function (arr: Array<IItemV1 | any>) {
                let wrongFormat = false;

                for (const cell of arr) {
                    if (!cell.hasOwnProperty('id')) wrongFormat = true;
                    if (!cell.hasOwnProperty('title')) wrongFormat = true;
                    if (wrongFormat) return false
                }
                return true
            }
        },
        title: {
            type: String,
            required: true,
            default: function (): string {
                return ""
            },
            validator: function (str: string) {
                return str.length < 40
            }
        },
        typeGroup: {
            type: Number,
            required: true,
            default: function (): number {
                return 0
            },
            validator: function (value: number) {
                return value >= 0;
            }
        },
        tooltipsAddButton: {
            type: String,
            required: false,
            default: function (): string {
                return "Ajouter un groupe"
            },
            validator: function () {
                return true
            }
        },
        selectedItemsGlobal: {
            type: Array<IItemV1 | undefined>,
            required: false,
            default: function (): Array<any> {
                return [undefined, undefined, undefined]
            },
            validator: function (): boolean {
                return true;
            }
        },
    },
    data: function () {
        const itemToUpdate: IItemV1 = { title: 'qwqw', id: 12121, display: true };
        return {
            dialogDelete: false,
            dialogUpdate: false,
            searchModel: "" as string,
            selectedItem: undefined,
            headers: [
                {
                    text: 'Title',
                    align: 'start',
                    sortable: true,
                    value: 'title',
                    width: '95%'
                },
                { text: 'Actions', value: 'actions', sortable: false, width: '5%', align: 'end' },
            ],
            itemToUpdate,
            newTitle: "",
            idToModify: "",
            mdiDotsVertical
        }
    },
    computed: {
        itemsFiltered: function () {
            const onlyDisplayable: IItemV1[] = this.items.filter((el: IItemV1) => el.display)
            return onlyDisplayable.filter((el: IItemV1) => el.title.startsWith(this.searchModel))
        },
    },
    mounted() {
    },
    methods: {
        extraMenuClick(item: IItemV1, index: number, globalIndex: number) {
            this.$emit('extraMenuClick', item, index, globalIndex)

        },
        //Item action
        createEntity() {
            this.$emit("create:entity", this.searchModel, this.typeGroup, EAPIVerb.API_CREATION);
            this.searchModel = ''
        },
        openCloseDeleteModale(value: boolean, item: IItemV1) {
            this.itemToUpdate = item
            this.dialogDelete = value
        },
        openCloseUpdateModale(value: boolean, item: IItemV1) { // Repetitions
            this.itemToUpdate = item
            this.dialogUpdate = value
            this.newTitle = ""
        },
        deleteEntity(item: IItemV1 | any) {
            this.openCloseDeleteModale(false, item)
            if (!item) {
                return
            } else {
                this.$emit("delete:entity", item);
            }
        },
        selectEntity(item: IItemV1 | any) {
            this.$emit("select:entity", item);
        },
        updateEntity(item: IItemV1 | any, str: string) {
            if (!item) {
                return
            } else {
                this.$emit("update:entity", str, this.typeGroup, EAPIVerb.API_UPDATE, item);
                this.openCloseUpdateModale(false, item)
            }
        }
    },
    // watch: {
    //     selectedItem(val) {
    //         if (!this.selectedItem) this.selectedItem = 0
    //     }
    // }
}

</script>

<style lang="scss" scoped>
.v-icon {
    cursor: pointer;
    transition: all 0.2s;

    &:active {
        transform: scale(1.4);
    }
}

h5 {
    margin-top: 1.5em;
    text-align: center;
    font-weight: 100;
    font-style: italic;
}

.text-wrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0;
    margin: auto 0;
    height: 100%;
    width: 100%;
}

.v-list {
    overflow-y: auto;
}

ul {
    padding-left: 0 !important;
}

.list-enter-active,
.list-leave-active {
    transition: all 80ms;
}

.list-enter,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.helper {
    width: 100%;
    height: 100%;
    transform: translateY(-20px);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #acacac;
    text-align: center;
    padding: 0 20px;
}

.text-h5 {
    text-align: center;
    display: block;
    width: 100%;
}

.scroll-list {
    overflow-y: auto;
    height: 400px;
}
</style>