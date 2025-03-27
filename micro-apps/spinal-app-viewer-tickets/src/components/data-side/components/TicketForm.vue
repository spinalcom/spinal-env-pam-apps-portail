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
                <select class="select-input-add-ticket" v-model="ticket.equipement"
                    :disabled="selectedZone.type === 'BIMOBJECT'">
                    <option value="">Sélectionner</option>
                    <option v-for="eq in equipements" :key="eq" :value="eq">{{ eq }}</option>
                </select>
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
                    <label class="form-input-title">Priorité</label>
                    <PrioritySlider v-model="ticket.priorite" @change="onPriorityChange" />
                </div>
            </div>
            <div class="form-group">
                <label class="form-input-title">Description</label>
                <textarea class="form-desc-input" v-model="ticket.description"
                    placeholder="Une description du ticket..."></textarea>
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
import PrioritySlider from "./PrioritySlider.vue";

@Component({
    components: {
        PrioritySlider,
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
        priorite: "",
    };
    etages = [];
    salles = ["SÉLECTIONNER UN ÉTAGE AVANT"];
    equipements = [];

    mounted() {
        console.log("TicketForm mounted", this.selectedZone, this.workflowlist, this.domainlist, this.building.name);
        this.prefillSelectedZone();
    }
    onPriorityChange(value: string) {
        console.log("🔺 Priority changed to:", value);
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
        console.log("getRooms", floorId);
        const rooms = await this.$store.dispatch(ActionTypes.GET_ROOMS, {
            buildingId: this.building.buildingId,
            patrimoineId: this.building.patrimoineId,
            floorId: floorId,
            id: floorId,
        });
        this.listofRooms = rooms;
        this.salles = rooms.map((room: any) => room.name);
        console.log("salles", this.salles);
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
            console.log("elementSelected", elementSelected);
            this.ticket.priorite = this.ticket.priorite === "faible" ? 2 : this.ticket.priorite === "moyenne" ? 1 : 0;
            const data = {
                workflow: workflowObj.name,
                process: domaineObj.name,
                nodeDynamicId: elementSelected,
                name: this.ticket.titre,
                priority: this.ticket.priorite || 2,
                description: this.ticket.description,
            };
            console.log("🔺 Ticket data:", data);
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
            priorite: "",
        };
        this.prefillSelectedZone();
    }
}


export { TicketForm };
export default TicketForm;
</script>

<style>
.ticket-form {
    /* max-width: 400px; */
    width: 100%;
    margin: auto;
    margin-top: 20px;
    height: 100%;
    /* padding: 20px; */
    /* background: #fff; */
    /* border-radius: 8px; */
    /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
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
    border-bottom: 3px solid #14202c;
    border-radius: 0 0 8px 0px;
    align-items: center;
    height: 40px;
    margin-top: 5px;
    padding-left: 10px;
    display: flex;
    box-shadow: 0 2px 4px #0000004d;
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
    border-bottom: 3px solid #14202c;
    height: 40px;
    box-shadow: 0 2px 4px #0000004d;
    cursor: pointer;
    border-radius: 0 0 8px 0px;
    align-items: center;
    padding-left: 10px;
    display: flex;
}

.form-title-input {
    border-bottom: 3px solid #14202c;
    margin-top: 5px;
    height: 40px;
    box-shadow: 0 2px 4px #0000004d;
    cursor: pointer;
    border-radius: 0 0 8px 0px;
    align-items: center;
    padding-left: 10px;
    display: flex;
}

.form-desc-input {
    border-bottom: 3px solid #14202c;
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
</style>