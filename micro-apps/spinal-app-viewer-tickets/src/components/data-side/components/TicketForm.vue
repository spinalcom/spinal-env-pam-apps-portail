<template>
    <div class="ticket-form">
        <h4 style="margin-bottom: 2px;">Élément sélectionné</h4>
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
                    <div class="dropdown-icon"></div>
                </div>
            </div>
            <div class="form-group">
                <div class="form-input-title-container">
                    <div class="form-icon-container equipement"></div>
                    <label class="form-input-title">Équipement</label>
                </div>
                <!-- <div v-if="selectedObj?.[0]?.type === 'BIMObject'" class="form-value locked">{{ ticket.equipement }}
                </div> -->

                <div class="select-wrapper" :class="{ open: dropdownStates.equipement }">
                    <select class="select-input-add-ticket" v-model="ticket.equipement"
                        @focus="dropdownStates.equipement = true" @blur="dropdownStates.equipement = false">
                        <option value="">Sélectionner</option>
                        <option v-for="eq in equipements" :key="eq" :value="eq">{{ eq }}</option>
                    </select>
                    <!-- <div class="dropdown-icon"></div> -->
                </div>
                <!-- <select class="select-input-add-ticket" v-model="ticket.equipement"
                    :disabled="selectedZone.type === 'BIMOBJECT'">
                    <option value="">Sélectionner</option>
                    <option v-for="eq in equipements" :key="eq" :value="eq">{{ eq }}</option>
                </select> -->
            </div>
        </div>
        <h4 style="margin-bottom: 2px;margin-top: 10px;">Détails de la demande</h4>
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
            </div>
        </div>
        <div class="d-flex flex-row justify-space-between">
            <div style="width: 47%;">
                <div class="form-group" style="width: 100%;">
                    <label class="form-input-title">Titre de ticket</label>
                    <input class="form-title-input" type="text" v-model="ticket.titre"
                        placeholder="Ex: Problème de câblage..." />
                </div>

                <div class="form-group" style="width: 100%;">
                    <label class="form-input-title">Description</label>
                    <textarea class="form-desc-input" v-model="ticket.description"
                        placeholder="Une description du ticket..."></textarea>
                </div>
            </div>
            <div style="width: 47%;">
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
                            <div class="d-flex flex-row align-center" style="margin-left: 6px;">
                                <div class="priority-indicator"
                                    :style="{ background: getPriorityColor(priority.value) }">
                                </div>
                                <div class="prio-filtre-text" style="margin-left: 5px;">{{ priority.label }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group" style="width: 100%;">
                    <label class="form-input-title">Attachement</label>
                    <div style="width: 120px;
                                margin-top: 10px;
                                font-weight: bold;
                                height: 40px;
                                background-color: rgb(20, 32, 44);
                                color: white;
                                justify-content: center;
                                align-items: center;" class="d-flex flex-row">Joindre</div>
                    <!-- <input class="form-title-input" type="text" 
                        placeholder="Ex: Problème de câblage..." /> -->
                </div>
            </div>

        </div>
        <!-- <button @click="createTicket">Ajouter Ticket</button> -->
        <div @click="createTicket" class="add-button">Ajouter Ticket</div>
    </div>
</template>

<script lang="ts">
import { Vue, Prop, Watch } from "vue-property-decorator";
import Component from "vue-class-component";
import { ActionTypes } from "../../../interfaces/vuexStoreTypes";

@Component({
    components: {
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

    mounted() {
        this.prefillSelectedZone();
        console.log("selected obj", this.selectedObj)
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
        console.log('selectedObj changed in TicketForm:', newVal, oldVal);
        // You can update local data or trigger methods here if needed
        if (!newVal || newVal.length === 0) return;

        const obj = newVal[0];
        const type = obj.type;

        if (type === 'BIMObject') {
            console.log('BIMObject selected:', obj);
            this.equipements = [obj.name];
            // Set equipement to object name
            this.ticket.equipement = obj.name;

            // Find associated room in groupParents
            const room = obj.groupParents?.find((gp: any) => gp.type === 'geographicRoom');
            if (room) {
                this.ticket.salle = room.name;
                console.log('Room found:', room);
            }
            console.log('etages:', this.etages);
            console.log('salles:', this.salles);
            // const position = await this.$store.dispatch(ActionTypes.EQUIPEMENT_GET_POSITION, {
            // id: obj.dynamicId,
            // });
            // console.log('position:', position);

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


    async createTicket() {
        const workflowObj = this.workflowlist.find((wf: any) => wf.name === this.ticket.workflow);
        const domaineObj = this.domainlist.find((dom: any) => dom.name === this.ticket.domaine);

        if (workflowObj && domaineObj && this.ticket.titre && this.ticket.description && this.ticket.priorite) {
            let elementSelected = 0;
            if (this.ticket.salle !== "") {
                elementSelected = this.listofRooms.find((room: any) => room.name === this.ticket.salle)?.dynamicId || 0;
            } else if (this.ticket.etage !== "") {
                elementSelected = this.listofFloors.find((floor: any) => floor.name === this.ticket.etage)?.dynamicId || 0;
            } else {
                elementSelected = this.building.buildingId;
            }
            this.ticket.priorite = this.ticket.priorite === "faible" ? 2 : this.ticket.priorite === "moyenne" ? 1 : 0;
            const data = {
                workflow: workflowObj.name,
                process: domaineObj.name,
                nodeDynamicId: elementSelected,
                name: this.ticket.titre,
                priority: this.ticket.priorite || 2,
                description: this.ticket.description,
            };
            const buildingId = localStorage.getItem("idBuilding");
            const res = await this.$store.dispatch("ADD_TICKET", { buildingId, data });

            if (res) {
                this.resetForm();
                this.$emit("add-ticket", { message: "Ticket ajouté", status: "success", context: "ticket" });
            } else {
                this.$emit("add-ticket", { message: "Erreur lors de l'ajout du ticket", status: "error", context: "ticket" });
            }
        } else {
            alert("Merci de remplir tous les champs obligatoires.");
        }
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
    font-size: 16px !important;
}

.form-icon-container {
    height: 30px;
    margin-right: 5px;
    background-color: #fff;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
}

.form-icon-container.building {
    background-image: url(../assets/form-building.svg);
    width: 25px;
}

.form-icon-container.floor {
    background-image: url(../assets/form-floor.svg);
    width: 25px;
}

.form-icon-container.room {
    background-image: url(../assets/form-room.svg);
    width: 28px;
}

.form-icon-container.equipement {
    background-image: url(../assets/form-eq.svg);
    width: 20px;
}

.form-icon-container.workflow {
    background-image: url(../assets/form-workflow.svg);
    width: 25px;
}

.form-icon-container.domain {
    background-image: url(../assets/form-domain.svg);
    width: 25px;
}

label {
    display: block;
}

.form-value.locked {
    color: #14202c78;
    background-color: #14202c03;
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
    right: 20px;
    border-radius: 5px;
    position: absolute;
    bottom: 20px;
    color: #fff;
    background-color: #14202c;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 45px;
    display: flex;
    cursor: pointer;
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
</style>