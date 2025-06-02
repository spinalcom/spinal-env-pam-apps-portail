<template>
    <div class="ticket-form">
        <h4 style="margin-bottom: 2px;" class="rebrique">Élément sélectionné</h4>
        <div style="width: 100%; height: 1px;background-color: #DCE0E5;margin-bottom: 10px;"></div>
        <div class="d-flex flex-row justify-space-between">
            <div class="form-group">
                <div class="form-input-title-container">
                    <div class="form-icon-container building"></div>
                    <label class="form-input-title">Bâtiment</label>
                </div>
                <div class="form-value locked">{{ building.name }}</div>
            </div>
            <div class="form-group">
                <div class="form-input-title-container">
                    <div class="form-icon-container floor"></div>
                    <label class="form-input-title">Étage</label>
                </div>
                <div v-if="selectedZone.type === 'geographicFloor'" class="form-value locked">{{ selectedZone.name }}
                </div>
                <div v-else-if="selectedZone.type === 'geographicRoom'" class="form-value locked">{{ pickedFloor }}
                </div>
                <div v-else class="select-wrapper" :class="{ open: dropdownStates.etage }">
                    <select class="select-input-add-ticket" v-model="ticket.etage" @focus="dropdownStates.etage = true"
                        @blur="dropdownStates.etage = false" :disabled="selectedZone.type === 'geographicFloor'">
                        <option value="">Sélectionner</option>
                        <option v-for="et in etages" :key="et" :value="et">{{ et }}</option>
                    </select>
                    <div class="dropdown-icon"></div>
                </div>
            </div>
        </div>
        <div class="d-flex flex-row justify-space-between">
            <div class="form-group">
                <div class="form-input-title-container">
                    <div class="form-icon-container room"></div>
                    <label class="form-input-title">Salle</label>
                </div>
                <div v-if="selectedZone.type === 'geographicRoom'" class="form-value locked">{{ selectedZone.name }}
                </div>
                <div v-else class="select-wrapper" :class="{ open: dropdownStates.salle }">
                    <select class="select-input-add-ticket" v-model="ticket.salle" @focus="dropdownStates.salle = true"
                        @blur="dropdownStates.salle = false" :disabled="selectedZone.type === 'geographicRoom'">
                        <option value="">Sélectionner</option>
                        <option v-for="salle in salles" :key="salle" :value="salle">{{ salle }}</option>
                    </select>
                    <!-- <div v-if="ticket.salle && listofRooms.find(r => r.name === ticket.salle)"
                        title="Centrer la vue sur la salle sélectionnée" class="zoom-in-icon"
                        @click="isolateElement(ticket.salle)">
                    </div> -->
                    <div class="dropdown-icon"></div>
                </div>
            </div>
            <div class="form-group">
                <div class="form-input-title-container">
                    <div class="form-icon-container equipement"></div>
                    <label class="form-input-title">Équipement</label>
                </div>
                <div class="form-value locked"
                    title="Vous devez sélectionner depuis la 3D l’équipement sur lequel vous voulez déclarer un ticket.">
                    {{ ticket.equipement || 'Aucun équipement sélectionné' }}
                    <div title="Cliquez pour désélectionner l'équipement" class="zoom-in-icon"
                        @click="deselectEquipement">
                    </div>
                    <div class="info-icon"
                        title="Vous devez sélectionner depuis la 3D l’équipement sur lequel vous voulez déclarer un ticket.">
                    </div>
                </div>

            </div>

        </div>
        <h4 style="margin-bottom: 2px;margin-top: 10px;" class="rebrique">Détails de la demande</h4>
        <div style="width: 100%; height: 1px;background-color: #DCE0E5;margin-bottom: 10px;"></div>
        <div class="d-flex flex-row justify-space-between">
            <div class="form-group">
                <div class="form-input-title-container">
                    <div class="form-icon-container workflow"></div>
                    <label class="form-input-title">Workflow</label>
                </div>
                <div class="select-wrapper" :class="{ open: dropdownStates.workflow }">
                    <select class="select-input-add-ticket" v-model="ticket.workflow"
                        @focus="dropdownStates.workflow = true" @blur="dropdownStates.workflow = false">
                        <option value="">Sélectionner</option>
                        <option v-for="wf in workflowlist" :key="wf.dynamicId" :value="wf.name">{{ wf.name }}</option>
                    </select>
                    <div class="dropdown-icon"></div>
                </div>
                <div class="error-message" v-if="errors.workflow">{{ errors.workflow }}</div>
            </div>
            <div class="form-group">
                <div class="form-input-title-container">
                    <div class="form-icon-container domain"></div>
                    <label class="form-input-title">Domaine</label>
                </div>
                <div class="select-wrapper" :class="{ open: dropdownStates.domain }">
                    <select class="select-input-add-ticket" v-model="ticket.domaine"
                        @focus="dropdownStates.domain = true" @blur="dropdownStates.domain = false">
                        <option value="">Sélectionner</option>
                        <option v-for="dom in domainlist" :key="dom.dynamicId" :value="dom.name">{{ dom.name }}</option>
                    </select>
                    <div class="dropdown-icon"></div>
                </div>
                <div class="error-message" v-if="errors.domaine">{{ errors.domaine }}</div>
            </div>
        </div>
        <div class="d-flex flex-row justify-space-between">
            <div class="half-input">
                <div class="form-group" style="width: 100%;">
                    <label class="form-input-title">Titre de ticket</label>
                    <input class="form-title-input" type="text" v-model="ticket.titre"
                        placeholder="Ex: Problème de câblage..." />
                    <div class="error-message" v-if="errors.titre">{{ errors.titre }}</div>

                </div>

                <div class="form-group" style="width: 100%;">
                    <label class="form-input-title">Description</label>
                    <textarea class="form-desc-input" v-model="ticket.description"
                        placeholder="Une description du ticket..."></textarea>
                    <div class="error-message" v-if="errors.description">{{ errors.description }}</div>

                </div>
            </div>
            <div class="half-input">
                <div class="form-group" style="width: 100%;">
                    <label class="form-input-title">Priorité</label>
                    <div
                        style="width: 100%; height: 50px; display: flex; flex-direction: row; justify-content: space-between;">
                        <div v-for="priority in priorities" :key="priority.value" class="custom-radio-wrapper"
                            @click="ticket.priorite = priority.value">
                            <div class="custom-radio-box" :class="{ selected: ticket.priorite === priority.value }"
                                style="border-color: #14202c;">
                                <span v-if="ticket.priorite === priority.value" class="checkmark">✔</span>
                            </div>
                            <div style="margin-left: 6px;display: flex;flex-direction: row;align-items: center;">
                                <div class="priority-indicator"
                                    :style="{ background: getPriorityColor(priority.value) }">
                                </div>
                                <div class="prio-filtre-text" style="margin-left: 5px;">{{ priority.label }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="error-message" v-if="errors.priorite">{{ errors.priorite }}</div>
                </div>
                <div class="form-group" style="width: 100%;">
                    <label class="form-input-title">Attachement</label>
                    <div class="d-flex flex-row attach-button" @click="$refs.fileInput.click()">Joindre
                    </div>
                    <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" multiple />

                </div>
                <div v-if="uploadedFiles.length" class="file-preview-list">
                    <div v-for="(file, index) in uploadedFiles" :key="file.name" class="file-preview-item">
                        <span class="file-icon">📎</span>
                        <span class="file-name" :title="file.name">{{ file.name }}</span>
                        <span class="remove-file" @click="removeFile(index)">✖</span>
                    </div>
                </div>

            </div>

        </div>
        <confirm-dialog :value="showConfirmDialog" @input="showConfirmDialog = $event" :type="'ticket'"
            :headline="'Confirmer la création du ticket'" :text="confirmText" :confirmLabel="'Créer'"
            @cancel="showConfirmDialog = false" @confirm="confirmAndCreateTicket" />

        <!-- <button @click="createTicket">Ajouter Ticket</button> -->

        <div @click="" class="annuler-button d-non">Annuler</div>
        <div @click="createTicket" class="add-button d-non">Ajouter Ticket</div>

        <div class="buttons-phone">
            <div @click="" class="annuler-button">Annuler</div>
            <div @click="createTicket" class="add-button">Ajouter Ticket</div>

        </div>
        <div v-if="showSuccess" class="success-banner">
            Création du ticket réussie
            <div class="success-progress"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Prop, Watch } from "vue-property-decorator";
import Component from "vue-class-component";
import { ActionTypes } from "../../../interfaces/vuexStoreTypes";
import ConfirmDialog from "./ConfirmDialog.vue";

@Component({
    components: {
        ConfirmDialog
    },
    name: "TicketForm",
})
class TicketForm extends Vue {
    @Prop({ required: false, default: () => [] }) data!: Array<any>;
    @Prop({ required: false }) config!: any;
    @Prop({ required: true }) selectedZone!: any;
    @Prop({ required: true }) workflowlist!: any;
    @Prop({ required: true }) domainlist!: any;
    @Prop({ required: true }) building: any;
    @Prop({ required: true }) priorities: any;
    @Prop({ required: false }) selectedObj!: any;
    listofFloors: any = [];
    listofRooms: any = [];
    pickedFloor: any = "";
    pickedRoom: any = "";
    showSuccess: boolean = false;
    showConfirmDialog: boolean = false;
    confirmText: string = "";

    // isDropdownOpen: boolean = false;
    dropdownStates: { [key: string]: boolean } = {
        etage: false,
        salle: false,
        workflow: false,
        domain: false,
    };


    ticket: any = {
        batiment: "",
        etage: "",
        salle: "",
        equipement: "",
        workflow: "",
        domaine: "",
        titre: "",
        description: "",
        priorite: 2,
    };
    etages = [];
    salles = ["SÉLECTIONNER UN ÉTAGE AVANT"];
    equipements: Array<any> = [];
    uploadedFiles: File[] = [];
    errors: {
        workflow: string,
        domaine: string,
        titre: string,
        description: string,
        priorite: string,
    } = {
            workflow: "",
            domaine: "",
            titre: "",
            description: "",
            priorite: "",
        };


    mounted() {
        console.log("mounted from ticket form", this.domainlist);
        this.prefillSelectedZone();
    }
    onPriorityChange(value: string) {
    }
    getPriorityColor(priority: number) {
        switch (priority) {
            case 0:
                return "red";
            case 1:
                return "orange";
            case 2:
                return "green";
            default:
                return "gray";
        }
    }
    handleFileUpload(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files) {
            const files = Array.from(target.files);
            for (const file of files) {
                if (!this.uploadedFiles.find(f => f.name === file.name)) {
                    this.uploadedFiles.push(file);
                }
            }
            (this.$refs.fileInput as HTMLInputElement).value = ""; // Reset input
        }
    }
    removeFile(index: number) {
        this.uploadedFiles.splice(index, 1);
    }
    generateTicketCreationText(): string {
        let message = "";
        message += `➤ Workflow : <b>${this.ticket.workflow}</b><br>`;
        message += `➤ Domaine : <b>${this.ticket.domaine}</b><br>`;
        message += `➤ Titre : <b>${this.ticket.titre}</b><br>`;
        message += `➤ Description : <i>"${this.ticket.description}"</i><br>`;
        message += `➤ Priorité : <b>${this.priorities.find(p => p.value === this.ticket.priorite)?.label}</b><br>`;

        if (this.uploadedFiles.length) {
            message += `➤ ${this.uploadedFiles.length} fichier(s) joint(s)<ul>`;
            for (const file of this.uploadedFiles) {
                message += `<li>${file.name}</li>`;
            }
            message += "</ul>";
        }

        return message;
    }


    async prefillSelectedZone() {
        const zone = this.selectedZone;
        if (zone.type === "building") {
            this.ticket.batiment = zone.name;
            const floors = await this.$store.dispatch(ActionTypes.GET_FLOORS, {
                buildingId: this.building.buildingId,
                patrimoineId: this.building.patrimoineId,
            });
            this.listofFloors = floors;
            this.etages = floors.map((floor: any) => floor.name);

        }
        else if (zone.type === "geographicFloor") {
            this.ticket.etage = zone.name;
            this.getRooms(zone.dynamicId);
        }
        else if (zone.type === "geographicRoom") {
            this.ticket.salle = zone.name;
            const floors = await this.$store.dispatch(ActionTypes.GET_FLOORS, {
                buildingId: this.building.buildingId,
                patrimoineId: this.building.patrimoineId,
            });
            this.listofFloors = floors;
            const floor = this.listofFloors.find((f: any) => f.dynamicId === zone.floorId);
            if (floor) {
                this.pickedFloor = floor.name;
            }
        }
        else if (zone.type === "BIMOBJECT") this.ticket.equipement = zone.name;
    }

    async getRooms(floorId: string) {
        const rooms = await this.$store.dispatch(ActionTypes.GET_ROOMS, {
            buildingId: this.building.buildingId,
            patrimoineId: this.building.patrimoineId,
            floorId: floorId,
            id: floorId,
        });
        this.listofRooms = rooms;
        this.salles = rooms.map((room: any) => room.name);
    }

    @Watch("ticket.etage")
    async onEtageChange() {
        if (this.ticket.etage) {
            const floor = this.listofFloors.find((f: any) => f.name === this.ticket.etage);
            if (floor) {
                this.getRooms(floor.dynamicId);
            }
        }
    }
    @Watch('selectedObj', { immediate: true, deep: true })
    async onSelectedObjChange(newVal: any, oldVal: any) {
        // You can update local data or trigger methods here if needed
        if (!newVal || newVal.length === 0) return;

        const obj = newVal[0];
        const type = obj.type;

        if (type === 'BIMObject') {
            this.equipements = [obj.name];
            // Set equipement to object name
            this.ticket.equipement = obj.name;

            // Find associated room in groupParents
            const room = obj.groupParents?.find((gp: any) => gp.type === 'geographicRoom');
            if (room) {
                this.ticket.salle = room.name;
            }
            // const position = await this.$store.dispatch(ActionTypes.EQUIPEMENT_GET_POSITION, {
            // id: obj.dynamicId,
            // });

        } else if (type === 'geographicRoom') {
            // Set salle to the current room name
            this.ticket.salle = obj.name;

            this.ticket.equipement = null;
            this.equipements = [];

            // Find floor from groupParents
            const floor = obj.groupParents?.find((gp: any) => gp.type === 'geographicFloor');
            if (floor) {
                this.ticket.etage = floor.name;
                this.pickedFloor = floor.name; // for UI
            }
        } else {
            // Optional: Reset or handle unexpected types
            this.ticket.equipement = "";
            this.ticket.salle = "";
            this.ticket.etage = "";
        }
    }

    async isolateElement(salleName: string) {
        console.log("isolateElement", salleName);
        if (!salleName) return;

        const room = this.listofRooms.find((room: any) => room.name === salleName);
        if (room && room.dynamicId) {
            await this.$store.dispatch(ActionTypes.FIT_TO_VIEW_ITEMS, { dynamicId: room.dynamicId });
        }
    }
    deselectEquipement() {
        this.ticket.equipement = "";
    }

    async createTicket() {
        if (!this.validateForm()) return;

        this.confirmText = this.generateTicketCreationText();
        this.showConfirmDialog = true;
    }
    async confirmAndCreateTicket() {
        this.showConfirmDialog = false;

        // Existing logic here
        const workflowObj = this.workflowlist.find((wf: any) => wf.name === this.ticket.workflow);
        const domaineObj = this.domainlist.find((dom: any) => dom.name === this.ticket.domaine);

        // (same as in your original createTicket)
        const buildingId = localStorage.getItem("idBuilding");
        const data = {
            workflow: workflowObj.name,
            process: domaineObj.name,
            nodeDynamicId: this.resolveSelectedNodeId(),
            name: this.ticket.titre,
            priority: this.ticket.priorite || 2,
            description: this.ticket.description,
        };

        const res = await this.$store.dispatch("ADD_TICKET", { buildingId, data, file: this.uploadedFiles });

        if (res) {
            this.resetForm();
            this.showSuccess = true;
            setTimeout(() => this.showSuccess = false, 3000);
            this.$emit("add-ticket", { message: "Ticket ajouté", status: "success", context: "ticket" });
        } else {
            this.$emit("add-ticket", { message: "Erreur lors de l'ajout du ticket", status: "error", context: "ticket" });
        }
    }
    resolveSelectedNodeId() {
        if (this.ticket.salle !== "") {
            return this.listofRooms.find((room: any) => room.name === this.ticket.salle)?.dynamicId || 0;
        } else if (this.ticket.etage !== "") {
            return this.listofFloors.find((floor: any) => floor.name === this.ticket.etage)?.dynamicId || 0;
        } else {
            return this.building.buildingId;
        }
    }


    // async createTicket() {
    //     if (!this.validateForm()) return;
    //     const workflowObj = this.workflowlist.find((wf: any) => wf.name === this.ticket.workflow);
    //     const domaineObj = this.domainlist.find((dom: any) => dom.name === this.ticket.domaine);

    //     if (
    //         workflowObj &&
    //         domaineObj &&
    //         this.ticket.titre &&
    //         this.ticket.description &&
    //         typeof this.ticket.priorite === 'number'
    //     ) {
    //         let elementSelected = 0;
    //         if (this.ticket.salle !== "") {
    //             elementSelected = this.listofRooms.find((room: any) => room.name === this.ticket.salle)?.dynamicId || 0;
    //         } else if (this.ticket.etage !== "") {
    //             elementSelected = this.listofFloors.find((floor: any) => floor.name === this.ticket.etage)?.dynamicId || 0;
    //         } else {
    //             elementSelected = this.building.buildingId;
    //         }
    //         const data = {
    //             workflow: workflowObj.name,
    //             process: domaineObj.name,
    //             nodeDynamicId: elementSelected,
    //             name: this.ticket.titre,
    //             priority: this.ticket.priorite || 2,
    //             description: this.ticket.description,
    //         };
    //         const buildingId = localStorage.getItem("idBuilding");
    //         const res = await this.$store.dispatch("ADD_TICKET", { buildingId, data, file: this.uploadedFiles, });

    //         if (res) {
    //             this.resetForm();
    //             this.showSuccess = true;
    //             setTimeout(() => {
    //                 this.showSuccess = false;
    //             }, 3000);
    //             this.$emit("add-ticket", { message: "Ticket ajouté", status: "success", context: "ticket" });
    //         } else {
    //             this.$emit("add-ticket", { message: "Erreur lors de l'ajout du ticket", status: "error", context: "ticket" });
    //         }
    //     } else {
    //         alert("Merci de remplir tous les champs obligatoires.");
    //     }
    // }
    validateForm() {
        this.errors = {
            workflow: "",
            domaine: "",
            titre: "",
            description: "",
            priorite: "",
        };

        let isValid = true;

        if (!this.ticket.workflow) {
            this.errors.workflow = "Ce champ est requis.";
            isValid = false;
        }
        if (!this.ticket.domaine) {
            this.errors.domaine = "Ce champ est requis.";
            isValid = false;
        }
        if (!this.ticket.titre) {
            this.errors.titre = "Ce champ est requis.";
            isValid = false;
        }
        if (!this.ticket.description) {
            this.errors.description = "Ce champ est requis.";
            isValid = false;
        }
        if (this.ticket.priorite === null || this.ticket.priorite === undefined) {
            this.errors.priorite = "Ce champ est requis.";
            isValid = false;
        }


        return isValid;
    }


    resetForm() {
        this.ticket = {
            batiment: "",
            etage: "",
            salle: "",
            equipement: "",
            workflow: "",
            domaine: "",
            titre: "",
            description: "",
            priorite: 2,
        };
        this.uploadedFiles = [];
        this.prefillSelectedZone();
    }
}


export { TicketForm };
export default TicketForm;
</script>

<style scoped>
.ticket-form {
    /* max-width: 400px; */
    width: 100%;
    margin: auto;
    margin-top: 20px;
    height: 100%;
    overflow: scroll;
    position: relative;
}

.form-group {
    margin-bottom: 15px;
    width: 47%;
}

.form-input-title-container {
    display: flex;
    flex-direction: row;
    width: 50%;
    height: 30px;
    align-items: center;
    justify-content: start;
}

.form-input-title {
    font-weight: normal;
    font-size: 14px !important;
}

.form-icon-container {
    height: 26px;
    margin-right: 5px;
    background-color: #fff;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
}

.form-icon-container.building {
    background-image: url(../assets/form-building.svg);
    width: 22px;
}

.form-icon-container.floor {
    background-image: url(../assets/form-floor.svg);
    width: 22px;
}

.form-icon-container.room {
    background-image: url(../assets/form-room.svg);
    width: 25px;
}

.form-icon-container.equipement {
    background-image: url(../assets/form-eq.svg);
    width: 17px;
}

.form-icon-container.workflow {
    background-image: url(../assets/form-workflow.svg);
    width: 22px;
}

.form-icon-container.domain {
    background-image: url(../assets/form-domain.svg);
    width: 22px;
}

label {
    display: block;
}

.form-value.locked {
    color: #14202c78;
    background-color: #14202c20;
    border-bottom: 2px solid #14202c;
    border-radius: 0 0 8px 0px;
    align-items: center;
    height: 40px;
    margin-top: 5px;
    padding-left: 10px;
    display: flex;
    box-shadow: 0 2px 4px #00000030;
    cursor: not-allowed;
}

.select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.half-input {
    width: 47%;
}

.select-wrapper .dropdown-icon {
    position: absolute;
    background-image: url(../assets/sort.svg);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    right: 8px;
    width: 30px;
    height: 30px;
    transform: rotate(-90deg);
    transition: transform 0.3s ease;
    pointer-events: none;
}

.select-wrapper.open .dropdown-icon {
    transform: rotate(90deg);
}

.zoom-in-icon {
    position: absolute;
    background-image: url(../assets/remove.svg);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    right: 55px;
    width: 22px;
    height: 22px;
    transition: transform 0.3s ease;
    pointer-events: auto;
}

.zoom-in-icon:hover {
    right: 54px;
    width: 24px;
    height: 24px;
    cursor: pointer !important;
}

.info-icon {
    position: absolute;
    background-image: url(../assets/info.svg);
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    right: 30px;
    width: 22px;
    height: 22px;
    pointer-events: auto;
}

.info-icon:hover {
    right: 29px;
    width: 24px;
    height: 24px;
}

.select-input-add-ticket {
    border-bottom: 2px solid #14202c;
    height: 40px;
    box-shadow: 0 2px 4px #00000030;
    cursor: pointer;
    border-radius: 0 0 8px 0px;
    align-items: center;
    padding-left: 10px;
    display: flex;
}

.form-title-input {
    border-bottom: 2px solid #14202c;
    margin-top: 5px;
    height: 40px;
    box-shadow: 0 2px 4px #00000030;
    cursor: pointer;
    border-radius: 0 0 8px 0px;
    align-items: center;
    padding-left: 10px;
    display: flex;
}

.form-desc-input {
    border-bottom: 2px solid #14202c;
    margin-top: 5px;
    height: 120px;
    box-shadow: 0 2px 4px #0000004d;
    cursor: pointer;
    border-radius: 0 0 8px 0px;
    /* align-items: center; */
    padding-left: 10px;
    padding-top: 10px;
    display: flex;
}


input,
select,
textarea {
    width: 100%;
    /* padding: 8px; */
    margin-top: 5px;
    /* border: 1px solid #ccc; */
    /* border-radius: 4px; */
}

.priority-options {
    display: flex;
    gap: 10px;
}

button {
    width: 100%;
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    position: fixed;
    bottom: 20px;
    /* left: 50%; */
    /* transform: translateX(-50%); */
    /* z-index: 999; */
}

button:hover {
    background: #0056b3;
}

.add-button {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 150px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    background-color: #14202c;
    color: #fff;
    cursor: pointer;
    overflow: hidden;
    z-index: 1;
    transition: color 0.3s ease;
}

.add-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    background-color: #1a2a3c;
    /* darker or slightly different than original */
    z-index: -1;
    transition: width 0.4s ease;
}

.add-button:hover::before {
    width: 100%;
}

.buttons-phone {
    display: none !important;
}

.annuler-button {
    right: 180px;
    border-radius: 5px;
    position: absolute;
    bottom: 20px;
    color: #14202c;
    border: 2px solid #14202c;
    background-color: #fff;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 45px;
    display: flex;
    cursor: pointer;
}

.annuler-button:hover {
    background-color: #f0f0f0;
}

.annuler-button:active {
    background-color: #e0e0e0;
}

.annuler-button:focus {
    outline: none;
}

.custom-radio-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.custom-radio-box {
    width: 18px;
    height: 18px;
    border: 2px solid #ccc;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease, background-color 0.2s ease;
    background-color: white;
}

.custom-radio-box.selected {
    background-color: #14202c;
    border-color: #14202c;
}

.checkmark {
    color: white;
    font-size: 14px;
    line-height: 1;
}

.attach-button {
    position: relative;
    overflow: hidden;
    z-index: 1;
    width: 120px;
    margin-top: 10px;
    font-weight: bold;
    height: 40px;
    background-color: rgb(20, 32, 44);
    color: white;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    display: flex;
    transition: color 0.3s ease;
}

.attach-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.2);
    /* or another effect */
    z-index: -1;
    transition: width 0.4s ease;
}

.attach-button:hover::before {
    width: 100%;
}


.file-preview-list {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 5px;
    background-color: #f7f7f7;
    border: 1px dashed #ccc;
    border-radius: 5px;
}

.file-preview-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-radius: 3px;
    padding: 3px 8px;
    font-size: 12px;
    color: #14202c;
    border: 1px solid #ddd;
}

.file-icon {
    margin-right: 6px;
}

.file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.remove-file {
    cursor: pointer;
    color: red;
    font-weight: bold;
    margin-left: 8px;
}

.remove-file:hover {
    /* color: #ff0000; */
    font-size: 15px;
}

.error-message {
    color: red;
    font-size: 13px;
    margin-top: 4px;
}

.success-banner {
    color: #14202c;
    backdrop-filter: blur(2px);
    background-color: #14202c50;
    border-radius: 5px;
    justify-content: center;
    align-items: center;
    width: 300px;
    height: 40px;
    font-size: 13px;
    font-weight: bold;
    display: flex;
    position: absolute;
    bottom: 80px;
    right: 120%;
    box-shadow: 0 2px 4px #0003;
    overflow: hidden;
}

.success-progress {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 3px;
    background-color: #14202c;
    animation: progressFill 2.5s linear forwards;
    width: 100%;
    border-radius: 0 0 5px 5px;
}

@keyframes progressFill {
    from {
        width: 100%;
    }

    to {
        width: 0%;
    }
}


@media (max-width: 1500px) {
    .form-group {
        margin-bottom: 7px;
    }

    .select-input-add-ticket {
        height: 35px;
        font-size: 13px !important;
    }

    .form-desc-input {
        height: 100px;
        font-size: 13px !important;
    }

    .form-value.locked {
        height: 35px;
        font-size: 13px !important;
    }

    .attach-button {
        width: 80px;
        height: 30px;
        margin-top: 7px;
        font-size: 12px;
    }

    .add-button {
        width: 90px;
        height: 38px;
        font-size: 12px;
    }

    .annuler-button {
        width: 90px;
        height: 38px;
        font-size: 12px;
        right: 120px;
    }

    .form-input-title {
        font-size: 12px !important;
    }

    .rebrique {
        font-size: 13px;
    }
}

@media (max-width: 1000px) {
    .d-flex.flex-row {
        flex-direction: column !important;
        margin-bottom: 10px;
        /* override row */
    }

    .form-group {
        width: 100% !important;
        /* make form groups take full width */
        margin-bottom: 15px;
        /* add spacing between stacked elements */
    }

    .form-group:last-child {
        margin-bottom: 0;
    }

    .add-button {
        width: 90px;
        height: 38px;
        font-size: 12px;
        position: relative;

    }

    .buttons-phone {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        position: relative !important;
    }

    .d-non {
        display: none !important;
    }

    .annuler-button {
        width: 90px;
        height: 38px;
        font-size: 12px;
        right: -140px;
        position: relative;
    }

    .half-input {
        width: 100%;
        margin-top: 10px;
    }

    .info-icon {
        right: 10px !important;
    }

    .zoom-in-icon {
        right: 35px !important;
    }
}
</style>