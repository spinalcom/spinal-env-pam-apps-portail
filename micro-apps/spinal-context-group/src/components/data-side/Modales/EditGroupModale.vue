m <template>
    <v-container>
        <SimpleModale modaleTitle="Gestion des regroupements d'espace" :show-dialog="showModal" width="80%" persistent
            :error-message="errorMessage" v-on:save="close" v-on:close="close" v-show="!dialogColor && !dialogIcon">
            <template v-slot:body>
                <div class="d-flex flex-row justify-space-around py-2">
                    <div class="w-30 d-flex flex-row justify-space-around " v-for="(item, i) in  groupsToDisplay"
                        :key="i">
                        <transition appear-active-class="appear-custom" :appear-to-class="animationsClass[i]" appear>
                            <ListV1 :extraMenuContent="extraMenuContents[i]" :items="item" :title="titleCards[i]"
                                :tooltipsAddButton="tooltipAddButton[i]" :typeGroup="i"
                                v-on:create:entity="preRequirement" :is-loading="isLoading[i]"
                                v-on:select:entity="selectItem" v-on:delete:entity="deleteItem"
                                v-on:update:entity="preRequirement" :selectedItemsGlobal="selectedItems"
                                @extraMenuClick="extraMenuClick">
                            </ListV1>
                        </transition>
                    </div>
                </div>
            </template>
        </SimpleModale>
        <ChooseColorModale :showDialog="dialogColor" width="fit-content" ref="colorModale" @save="postRequirement"
            @close="postRequirement">
        </ChooseColorModale>
        <ChooseIconModale :showDialog="dialogIcon" width="fit-content" ref="colorIcon" @save="postRequirement"
            @close="postRequirement">
        </ChooseIconModale>
    </v-container>
</template>

<script lang="ts">
// Controllers
import { GroupCgcWithChildrenController } from '../../../controllers'

// Components
import ListV1 from '../ListV1.vue'
import SimpleModale from './SimpleModale.vue'
import ChooseIconModale from './ChooseIconModale.vue';
import ChooseColorModale from './ChooseColorModale.vue'

// Enum
import { EAPIVerb, EGroupType } from '../../../controllers'

// Factory
import { GroupItemFactory } from '../../../interfaces/GroupWithChildren';

// Interfaces
import { IGroupItem } from '../../../controllers/';

// Services
import { GroupContextApi } from '../../../services';
import { SpinalAPI } from '../../../services';

// Vuetify
import { VContainer } from 'vuetify/lib';
import { VListItemIcon } from 'vuetify/lib'

// Icon
import 'material-design-icons-iconfont';

export default {
    components: {
        ListV1,
        SimpleModale,
        ChooseColorModale,
        ChooseIconModale,
        VContainer,
        VListItemIcon
    },
    props: {
        showModal: {
            type: Boolean,
            required: false,
            default: () => {
                return false
            }
        }
    },
    data() {
        let APIGrpContext: GroupContextApi | undefined = undefined;
        let animationsClass: string[] = ["animated fadeInLeft0", "animated fadeInLeft1", "animated fadeInLeft2"]
        let errorMessage: string = "";
        let grpCGCWithChildrenController: GroupCgcWithChildrenController | undefined = undefined;
        const GRP_NUMBER: number = 3;
        const groupsToDisplay: IGroupItem[][] = Array(GRP_NUMBER).fill([])
        let isLoading: Array<boolean> = Array(GRP_NUMBER).fill(false);
        let infoTmp: Partial<IGroupItem> | undefined = { title: "", icon: "", color: "", type: EGroupType.GRP_NONE, verb: EAPIVerb.API_CREATION };
        let itemTmp: IGroupItem | undefined = undefined;
        let selectedItems: Array<IGroupItem | undefined> = Array(GRP_NUMBER).fill(undefined)
        let spinalAPI: SpinalAPI | undefined = undefined;
        const titleCards: string[] = ["Contexte", "Catégorie", "Groupe"];
        let tooltipAddButton: string[] = ['Ajouter un groupe de contexte', "Ajouter un groupe de catégories", "Ajouter un groupe de groupes"]
        let extraMenuContents: { title: string, icon: string, globalIndex: number }[][] = [[], [{ title: 'Assignation des espaces', icon: 'mdi-ruler-square', globalIndex: 1 }], [{ title: 'Nomenclature', icon: 'mdi-typewriter', globalIndex: 2 }]]

        try {
            spinalAPI = SpinalAPI.getInstance(process.env.SPINAL_API_URL)
            APIGrpContext = new GroupContextApi(spinalAPI)
            grpCGCWithChildrenController = new GroupCgcWithChildrenController(APIGrpContext, GRP_NUMBER)
        } catch {
            console.error('[Error]: Internal error !')
        }

        return {
            animationsClass,
            delayErrorDisplay: 10,
            dialogIcon: false,
            dialogColor: false,
            extraMenuContents,
            errorMessage,
            groupsToDisplay,
            grpCGCWithChildrenController,
            infoTmp,
            isLoading,
            itemTmp,
            selectedItems,
            spinalAPI, // !! [Bug] If a user take a direct shortcut to this page without visiting some page before this can crash
            titleCards,
            tooltipAddButton,
        }
    },
    mounted() {
        try {
            this.isLoading = [...this.isLoading] // Trigger reactivity
            this.loadData();
        } catch {
            this.isLoading[EGroupType.GRP_CONTEXT] = false;
            console.error("Error in mounted function")
        }
    },
    methods: {
        addNewItem() {
            try {
                if (this.infoTmp.type === undefined) {
                    throw new Error('Des informations sont manquantes');
                }
                this.grpCGCWithChildrenController?.addNewItem(GroupItemFactory.build({ ...this.infoTmp })).then(() => {
                    this.groupsToDisplay = this.grpCGCWithChildrenController?.reloadGroupToDisplay() ?? [[], [], []]
                }).catch((e: any) => {
                    this.printError(e);
                })
            } catch (e: any) {
                this.printError(e)
            }
        },
        close() {
            this.$emit('close')
        },
        deleteItem(item: IGroupItem | undefined) {
            if (!item) return
            try {
                this.grpCGCWithChildrenController?.deleteItem(item).then(() => {
                    this.groupsToDisplay = this.grpCGCWithChildrenController?.reloadGroupToDisplay() ?? [[], [], []]
                }).catch((e: any) => {
                    this.printError(e)
                })
            } catch (e) {
                this.printError(e)
            }
        },
        extraMenuClick(item, index, globalIndex) {
            if (index === 0 && globalIndex === 1) {
                console.log("Assignation des espaces ...", item);
                this.$emit('activateSpaceAssignation', item);
            } else if (index === 0 && globalIndex === 2) {
                console.log("Nomenclature ...", item);
                this.$emit('activateNomenclatureModale', item);
            }
        },
        postRequirement() {
            if (this.dialogColor) this.infoTmp.color = this.$refs?.colorModale?.color as any ?? "";
            if (this.dialogIcon) this.infoTmp.icon = this.$refs?.colorIcon?.icon ?? "";
            this.toggleDialogModale('color', false);
            this.toggleDialogModale('icon', false);

            console.log("InfoTmp = ", this.infoTmp);
            switch (this.infoTmp.verb) {
                case EAPIVerb.API_CREATION:
                    this.addNewItem()
                    break;
                case EAPIVerb.API_UPDATE:
                    this.updateItem(this.itemTmp)
                    break;
                case EAPIVerb.API_DELETION:
                    this.deleteItem(this.itemTmp)
                    break;
                default:
                    throw new Error('Une erreur est survenue !');
                    break;
            }
        },
        preRequirement(title: string, type?: number, verb?: EAPIVerb, item?: IGroupItem) {
            this.infoTmp.title = title
            this.infoTmp.type = type
            this.infoTmp.verb = verb

            if (item) {
                this.itemTmp = { ...item }
                // this.itemTmp.info = { ...this.infoTmp }
            }
            switch (type) {
                case EGroupType.GRP_CATEGORY:
                    this.toggleDialogModale('icon', true);
                    break;
                case EGroupType.GRP_GROUP:
                    this.toggleDialogModale('color', true);
                    break;
                case EGroupType.GRP_CONTEXT:
                    if (verb === EAPIVerb.API_CREATION) {
                        this.addNewItem();
                    } else if (verb === EAPIVerb.API_UPDATE) {
                        this.updateItem(this.itemTmp);
                    }
                    break;
                default:
                    throw new Error('Une erreur est survenue')
                    break;
            }
        },
        loadData() {
            this.isLoading[EGroupType.GRP_CONTEXT] = true;
            this.grpCGCWithChildrenController?.loadData().then(() => {
                this.isLoading[EGroupType.GRP_CONTEXT] = false;
                this.groupsToDisplay = this.grpCGCWithChildrenController?.reloadGroupToDisplay() ?? [[], [], []]
            }).catch((e: any) => {
                console.error("Error in mounted function")
                this.isLoading[EGroupType.GRP_CONTEXT] = false;
                console.error(e);
            })
        },
        printError(e: any) {
            this.errorMessage = String(e).replaceAll('Error:', '');
            setTimeout(() => {
                this.errorMessage = ''
            }, this.delayErrorDisplay * 1000)
        },
        selectItem(item: IGroupItem | null | undefined): void {
            if (!item) return
            this.grpCGCWithChildrenController?.selectItem(item)
            this.groupsToDisplay = this.grpCGCWithChildrenController?.reloadGroupToDisplay() ?? [[], [], []]
            this.selectedItems = this.grpCGCWithChildrenController?.getSelected() ?? [undefined, undefined, undefined]
        },
        toggleDialogModale(dialog: 'icon' | 'color', value: boolean) {
            switch (dialog) {
                case 'icon':
                    this.dialogIcon = value
                    break
                case 'color':
                    this.dialogColor = value
                    break;
                default:
                    throw new Error("Une erreur interne est survenue") // TODO A changer plus tard
                    break;
            }
        },
        updateItem(item: IGroupItem | undefined) {
            if (!item) return
            try {
                this.grpCGCWithChildrenController?.editItem(this.infoTmp, item).then(() => {
                    this.groupsToDisplay = this.grpCGCWithChildrenController?.reloadGroupToDisplay() ?? [[], [], []]
                }).catch((e) => {
                    this.errorMessage = String(e);
                    this.printError(e)
                })
            } catch (e) {
                this.errorMessage = String(e);
                this.printError(e)
            }
        },
    },
}

</script>

<style lang="scss">
.h-60 {
    height: 60% !important;
}

.w-30 {
    width: 33.3% !important;
}

.appear-custom {
    opacity: 0;
    animation-fill-mode: forwards;
}

.fadeInLeft0 {
    animation: fadeInLeft 0.3s 0s;
}

.fadeInLeft1 {
    animation: fadeInLeft 0.3s 0.2s;
}

.fadeInLeft2 {
    animation: fadeInLeft 0.3s 0.4s;
}
</style>