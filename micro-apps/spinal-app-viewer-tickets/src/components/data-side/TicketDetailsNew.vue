<template>
    <div>
        <!--Dialog background-->
        <div v-show="value" class="dialog-background" @click="closePopUp"></div>

        <!--Dialog box to display the details of the tcket-->
        <v-card v-if="value && detailedTicket" elevation="24" v-show="value"
            :class="['dialog-box', { 'editing-mode': isEditing }]">
            <div @click="closePopUp()" class="details-card-close">
                X
            </div>
            <v-card-title style="height: 35px;justify-content: space-between;padding: 0px!important;"
                class="bold px-4 d-flex flex-row align-items-center">
                <div class="overflow-hidden d-flex" style="width: 20%;flex-direction: row;line-height: 1.2;">
                    <div class="details-card-ticket-id">Ticket n°: <b>{{ detailedTicket.dynamicId }}</b></div>
                </div>
                <div class="d-flex flex-row" style="width: 50%;height: 100%; justify-content: space-around;">
                    <div class="step-holder">
                        <div class="d-flex flex-row align-items-center" :class="{ 'editable': isEditing }"
                            @click="isStepDropdownOpen = !isStepDropdownOpen; isPriorityDropdownOpen = false"
                            style="cursor: pointer;position: relative;">
                            <div class="status-indicator d-flex flex-row"
                                style="justify-content: space-around; padding: 0px 5px;"
                                :style="{ background: `${detailedTicket.step.color}20` }">
                                <div class="status-indicator-point" :style="{ background: detailedTicket.step.color }">
                                </div>
                                <span>
                                    {{ detailedTicket.step.name.length > 25 ? detailedTicket.step.name.substring(0, 25)
                                        + '...' : detailedTicket.step.name }}
                                </span>
                            </div>
                            <div v-if="isEditing" class="dropdown-icon" :class="{ 'rotate-open': isStepDropdownOpen }"
                                title="Cliquez pour ouvrir le dropdown"
                                style="right: -20px; top: -2px;background-color: #14202c; ">
                            </div>
                        </div>
                        <div v-if="isStepDropdownOpen && isEditing" class="step-dropdown">
                            <div v-for="step in steps.filter(s => s.name !== detailedTicket.step.name && !archivedStepNames.includes(s.name))"
                                :key="step.name" class="status-indicator d-flex flex-row"
                                style="cursor: pointer; padding: 5px;"
                                :style="{ background: `${step.color}20`, marginTop: '6px', borderRadius: '4px' }"
                                :class="{ 'selected-step': selectedStepName === step.name }"
                                @click="selectStepFromDropdown(step.name)">
                                <div class="status-indicator-point" :style="{ background: step.color }"
                                    style="margin-right: 5px;"></div>
                                <span>
                                    {{ step.name.length > 25 ? step.name.substring(0, 25) + '...' : step.name }}
                                </span>
                            </div>
                        </div>

                    </div>
                    <!-- <div :class="['details-card-ticket-prio', priorityClass]" :style="priorityStyle">
                        {{ priorityLabel }}
                    </div> -->
                    <div class="step-holder" style="position: relative;">
                        <div
                            @click="isEditing ? isPriorityDropdownOpen = !isPriorityDropdownOpen : null; isStepDropdownOpen = false">
                            <div class="details-card-ticket-prio" :class="[priorityClass, { 'editable': isEditing }]"
                                :style="priorityStyle" style="cursor: pointer;">
                                <!-- {{selectedPriority !== null ? allPriorities.find(p => p.value ===
                                    selectedPriority).label :
                                    priorityLabel}} -->
                                {{ priorityLabel }}
                            </div>
                            <div v-if="isEditing" class="dropdown-icon"
                                :class="{ 'rotate-open': isPriorityDropdownOpen }"
                                title="Cliquez pour ouvrir le dropdown"
                                style="right: -18px;top: 0px; background-color: #14202c; ">
                            </div>
                        </div>
                        <!-- Dropdown -->
                        <div v-if="isEditing && isPriorityDropdownOpen" class="step-dropdown"
                            style="width: 200px; top: 20px;">
                            <div v-for="prio in availablePriorities" :key="prio.value"
                                @click="selectPriorityFromDropdown(prio.value)" class="status-indicator d-flex flex-row"
                                :class="{ 'selected-priority': selectedPriority === prio.value }"
                                style="cursor: pointer; padding: 5px;"
                                :style="{ backgroundColor: prio.color + '20', marginTop: '6px', borderRadius: '4px' }">
                                <div class="status-indicator-point" :style="{ background: prio.color }"></div>
                                <span>{{ prio.label }}</span>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="details-card-ticket-date"
                    style="display: flex; flex-direction: column; align-items: flex-end; width: 21%;font-size: 0.75rem;line-height: 1;">
                    <template v-if="isSameDate">
                        <span>Créé le: <b>{{ dispDateCreation }}</b></span>
                    </template>
                    <template v-else>
                        <div style="margin-top: 0px; line-height: 1.3;">
                            <span>Créé le: <b>{{ dispDateCreation }}</b></span><br>
                            <span
                                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">
                                Modifié le: <b>{{ dispDateModif }}</b>
                            </span>
                        </div>

                    </template>
                </div>
            </v-card-title>

            <v-divider style="margin: 10px 0px ;position: relative;"
                :style="{ backgroundColor: isEditing ? '#FFC107' : '' }">

            </v-divider>
            <div v-if="isEditing" class="modification-warning">
                Modification</div>
            <div class="first-step-container" style="">
                <div class="first-step-title">
                    <!-- <p><b>Création</b> ticket</p> -->
                    <div style="width: 60%;position: relative;">
                        <input type="text" :disabled="!isEditing" v-model="editedName" placeholder="Non défini"
                            :class="{ 'editable': isEditing }"
                            style="width: 40%!important;font-size: 12px; margin-bottom: 16px; outline: none;color: #fff;" />
                        <div v-if="isEditing" class="edit-icon-b" title="Cliquez sur le texte pour modifier"
                            style="top: 4px; left: calc(40% - 20px); background-color: #fff;">
                        </div>
                    </div>
                    <!-- <p>{{ dispDateCreation }}</p> -->
                    <p>Par: <b style="color: #fff;">{{ detailedTicket.userName || "Système" }}</b>
                    </p>
                </div>
                <div class="first-step-desc" style="position: relative;">
                    <!-- Ticket signalé pour {{ this.detailedTicket.process.name }} dans {{
                        this.detailedTicket.elementSelected.name }}. En attente
                    de
                    prise en
                    charge par l'équipe de maintenance. -->
                    <textarea :disabled="!isEditing" v-model="editedDescription" placeholder="Non défini"
                        :class="{ 'editable': isEditing }"
                        style="width: 100%; height: auto; font-size: 12px; resize: none; overflow: auto; text-align: left; line-height: 1.5;border-color: #14202c!important"></textarea>
                    <div v-if="isEditing" class="edit-icon" title="Cliquez sur le texte pour modifier"
                        style="right: 15px;top: 2px; background-color: #14202c; ">
                    </div>
                </div>
                <!-- <div style="margin-bottom: 0px!important;position:absolute;right: 0;font-size: 11px;">
                    <p>Par: <b style="color: #14202c;">{{ detailedTicket.userName || "Système" }}</b>
                    </p>
                </div> -->
            </div>
            <v-card-text
                :style="{ height: isEditing ? 'calc(100% - 190px)' : 'calc(100% - 180px)', padding: '0px!important', justifyContent: 'space-between' }"
                class="overflow-y-auto overflow-x-hidden fulldetails-card">
                <div :style="{ width: isEditing ? '49% !important' : '' }"
                    class="d-flex flex-column steps-container-wrapper">
                    <div :class="['custom-scroll', { 'custom-scroll-bg': isEditing }]"
                        style="width: 100%;overflow: auto;max-height: 80%;min-height: 65%;">

                        <div v-for="timeLineItem in TimeLine"
                            :key="timeLineItem.step.staticId + '-' + timeLineItem.date" class="step-container"
                            :ref="timeLineItem.step.staticId + '-' + timeLineItem.date" style="padding-right: 4px;">
                            <div v-for="n in 3" :key="`refused-step-${n}`"
                                v-if="refusedStepNames.includes(timeLineItem.step.name)" :style="{
                                    height: '5px',
                                    width: '2px',
                                    background: (timeLineItem.type !== 'next' && timeLineItem.type !== 'other') ? '#142020' : '#ccc',
                                    marginLeft: '10px',
                                    marginBottom: '3px'
                                }" :class="getStepLineClass(timeLineItem.step)"></div>

                            <div v-if="!archivedStepNames.includes(timeLineItem.step.name)" :style="{
                                height: '25px',
                                width: '2px',
                                background: (timeLineItem.type !== 'next' && timeLineItem.type !== 'other') ? '#142020' : '#ccc',
                                marginLeft: '10px'
                            }" :class="getStepLineClass(timeLineItem.step)"></div>



                            <div class="step-holder" v-if="!archivedStepNames.includes(timeLineItem.step.name)"
                                :style="{ opacity: (timeLineItem.type === 'next') || (timeLineItem.type == 'other') ? 0.3 : 1 }">
                                <div :class="getStepCircleClass(timeLineItem)">
                                    <span v-if="refusedStepNames.includes(timeLineItem.step.name)">✘</span>
                                    <!-- <span v-else-if="archivedStepNames.includes(timeLineItem.step.name)">✘</span> -->
                                    <span v-else>✔</span>
                                </div>
                                <div class="d-flex flex-row"
                                    style="justify-content: space-between;align-items: center;  width: 98%;margin-left: 5px;">
                                    <div class=" d-flex flex-row" style="align-items: center;">

                                        <div class="d-flex flex-row justify-content-start status-indicator"
                                            :style="{ background: `${timeLineItem.step.color}20` }">
                                            <div class="status-indicator-point"
                                                :style="{ background: timeLineItem.step.color }">
                                            </div>
                                            <span>
                                                {{ timeLineItem.step.name.length > maxStepNameLength ?
                                                    timeLineItem.step.name.substring(0, maxStepNameLength) + '...' :
                                                    timeLineItem.step.name }}
                                            </span>

                                        </div>
                                    </div>
                                    <div style="display: flex;flex-direction: column;align-items: end;">
                                        <div class="step-date-text">{{ getLogDate(timeLineItem) }}</div>
                                        <!-- <div class="step-date-text">{{ formatAdaptiveDate(timeLineItem.date) }}</div> -->
                                        <div class="step-message-count"
                                            style="position: absolute; font-size: 11px; color: #14202c; margin-top: 20px; cursor: pointer; display: flex; align-items: center; gap: 5px;"
                                            @click="timeLineItem.annotations.length === 0 ? null : toggleStepMessages(timeLineItem.step.staticId + '-' + timeLineItem.date)">
                                            <span>{{ timeLineItem.annotations.length }} message(s)</span>
                                            <span v-if="timeLineItem.annotations.length !== 0" :style="{
                                                display: 'inline-block',
                                                transition: 'transform 0.3s ease',
                                                transform: openedSteps.includes(timeLineItem.step.name) ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }">▼</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="!openedSteps.includes(timeLineItem.step.staticId + '-' + timeLineItem.date) && (timeLineItem.annotations && timeLineItem.annotations.length > 0)"
                                class="step-annotations"
                                style=" margin-top: 15px;display: flex; flex-direction: row;align-items: stretch; ">
                                <div :style="{
                                    height: `${timeLineItem.annotations.length * 60 + 10}px`,
                                    width: '2px',
                                    background: '#142020', marginLeft: '10px', marginRight: '10px'
                                }"></div>
                                <div class="d-flex flex-column"
                                    style="width: 100%;margin-left: 5px;align-items: stretch;">
                                    <div v-for="(annotation, i) in timeLineItem.annotations" :key="annotation.date"
                                        style="width: 100%;font-size: 11px; border: 1px solid #14202c; border-radius: 5px; padding: 6px; margin-bottom: 5px;">
                                        <strong>{{ annotation.userName || 'Non défini' }}</strong> – {{
                                            formatDate(annotation.date)
                                        }}<br />
                                        {{ annotation.message }}
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                    <div v-if="isEditing && selectedStepName != '' && selectedStepName != null"
                        style="width: 100%;text-align: end;">
                        <p v-if="isEditing && selectedStepName != '' && selectedStepName != null" style="font-size: 10px;margin-bottom: 0px;
                    text-align: end;">
                            Le ticket sera déplacé de l'étape "<b>{{ detailedTicket.step.name }}</b>" à l'étape
                            "<b>{{
                                selectedStepName }}</b>".
                        </p>
                    </div>
                    <v-divider style="margin-top: 10px ;">
                    </v-divider>
                    <div class="mb-1" style="width: 100%;margin-top: 8px;">
                        <div style="position: relative; width: 100%;">
                            <textarea v-model="newNote" placeholder="Écrire un commentaire..."
                                style="width: 100%;height: 40px; font-size: 12px; padding: 5px 50px 5px 5px; resize: none; border: 2px solid #14202c; border-radius: 5px;">
                </textarea>
                            <div @click="$refs.fileInput.click()" class="btn-join"
                                style="position: absolute; right: 30px; top: 5px; bottom: 5px; cursor: pointer; font-size: 12px;">
                            </div>
                            <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
                            <div @click="addNote(newNote)" class="btn-send"
                                style="position: absolute; right: 5px; top: 5px; bottom: 5px; cursor: pointer; font-size: 12px;">
                            </div>

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
                <v-divider v-if="!isSmallScreen" vertical style="margin: 0px ;margin-left: 6px;margin-right: 10px;"
                    class="hide-devider" :style="{ backgroundColor: isEditing ? '#FFC107' : '' }">
                </v-divider>
                <div class="restofdetails-container-wrapper">

                    <div class="mb-1">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Element</span>
                            <div class="details-icon space">
                            </div>
                        </div>
                        <div class="details-input" :class="isEditing ? 'not-editable' : ''"
                            @click="onClickNavigate(detailedTicket.elementSelected.dynamicId, detailedTicket.elementSelected.name)"
                            style="width: 100%; font-size: 12px; padding: 4px 8px; color: grey; display: flex; align-items: center; cursor: pointer;">
                            <span style="color: rgb(101, 100, 179);line-height: 1;">

                                {{ formattedLocation.length > 90 ? formattedLocation.substring(0, 90) + '...' :
                                formattedLocation }}

                            </span>
                        </div>

                    </div>

                    <v-divider style="margin-bottom: 5px;margin-top: 10px;margin-left: 0;margin-right: 0;"></v-divider>
                    <div class="mb-1">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Workflow</span>
                            <div class="details-icon workflow">
                            </div>
                        </div>
                        <div class="details-input" :class="isEditing ? 'not-editable' : ''"
                            style="font-size: 12px; letter-spacing: -0.5px; line-height: 1.2;">
                            {{ detailedTicket.workflowName }}
                        </div>

                    </div>
                    <div class="mb-1">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Process</span>
                            <div class="details-icon process">
                            </div>
                        </div>
                        <div class="details-input" :class="isEditing ? 'not-editable' : ''"
                            style="font-size: 12px; letter-spacing: -0.5px; line-height: 1.2;">
                            {{ detailedTicket.process.name }}
                        </div>
                    </div>
                    <div v-if="detailedTicket.elementSelected.attributes && detailedTicket.elementSelected.attributes.length > 0"
                        style="width: 100%;">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Attributs</span>
                            <div class="details-icon attachement">
                            </div>
                        </div>
                        <div class="d-flex flex-column" style="width: 100%;
                                                        border: 2px solid #14202c;
                                                        border-radius: 5px;
                                                        padding: 5px;
                                                        padding-bottom: 0px;
                                                        background-color: transparent;">
                            <div v-for="(attribute, index) in detailedTicket.elementSelected.attributes" :key="index"
                                style="display: flex;
                                justify-content: space-between;
                                align-items: center;
                                background-color: #f5f5f5;
                                border-radius: 5px;
                                margin-bottom: 5px;
                                padding: 1px 5px;
                                font-size: 12px;">
                                <span style="color: #14202c;">{{ attribute.label }}</span>
                                <span style="color: #14202c; font-weight: bold;" :title="attribute.value">
                                    {{ attribute.value.length > 25 ? attribute.value.substring(0, 22) + '...' :
                                        attribute.value }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style="width: 100%; height: 200px;">
                        <!-- <div v-if="detailedTicket.file_list.length > 0" class="mt-4">
                            <div class="font-weight-bold my-3 downloadable">PIÈCES JOINTES</div>
                            <img v-for="(image, i) in images" :key="i" :src="image.src" class="pa-3 downloadable"
                                style="max-width: 100%; height: auto" />
                        </div> -->
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span v-if="hasAttachments"
                                style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Pièces
                                jointes</span>
                            <div class="details-icon attachement">
                            </div>
                        </div>
                        <carousel-component v-if="hasAttachments || imagesReady" :key="carouselKey"
                            style="width: 100%;height: 100%;" :image_list="images"></carousel-component>
                    </div>

                </div>


            </v-card-text>
            <v-divider style="margin: 10px 0px ;" :style="{ backgroundColor: isEditing ? '#FFC107' : '' }"></v-divider>
            <v-card-actions style="height: 35px;width: 100%; padding: 0px!important;">
                <div class="button-row" style="width: 100%;">
                    <!-- Left button -->
                    <!-- <button style="width: 25%;" class="btn btn-delete" @click="deleteTicket">Refuser</button> -->

                    <div style="width: 10px;height: 5px;background-color: transparent;opacity: 0;"></div>
                    <!-- Step selection control -->

                    <!-- Right buttons -->
                    <div class="btn-group" style="width: 40%;">
                        <button class="btn btn-archive" style="width: 50%;" v-if="!isEditing"
                            @click="handleArchiveTicket(detailedTicket)">Archiver</button>
                        <button class="btn btn-annuler" style="width: 50%;" v-else @click="cancelEdit">Annuler</button>

                        <button style="width: 50%;" class="btn btn-edit" @click="toggleEdit">
                            {{ isEditing ? 'Sauvegarder' : 'Modifier' }}
                        </button>
                    </div>
                </div>

                <!-- <v-btn class="hide" text color="red" @click="downloadPDF">
                    Imprimer le ticket
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="closePopUp" color="blue darken-4" text class="bold">
                    FERMER
                </v-btn> -->
            </v-card-actions>
        </v-card>
        <!-- <v-dialog class="archive-dialog" v-model="showArchiveDialog" max-width="500px">
            <v-card>
                <v-card-title class="headline">Confirmer l'archivage</v-card-title>
                <v-card-text>
                    Êtes-vous sûr de vouloir archiver le ticket :
                    <strong v-if="ticketToArchive">#{{ ticketToArchive.dynamicId }}</strong>
                    <span v-if="ticketToArchive"> - "{{ ticketToArchive.name }}"</span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancelArchive">Annuler</v-btn>
                    <v-btn color="red darken-1" text @click="confirmArchive">Archiver</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog> -->
        <confirm-dialog :value="showArchiveDialog" @input="showArchiveDialog = $event" :type="'attention'"
            @cancel="cancelArchive" @confirm="confirmArchive" :headline="'Confirmer l\'archivage'" :text="archiveText"
            :confirmLabel="'Archiver'" />
        <confirm-dialog :value="showConfirmDialog" @input="showConfirmDialog = $event" :type="'modify'"
            :headline="'Confirmer les modifications'" :text="generateModificationText()" :confirmLabel="'Confirmer'"
            @cancel="showConfirmDialog = false" @confirm="confirmAndSaveChanges" />

        <div v-if="showSuccessAnimation" class="success-animation">
            ✔️ <!-- replace with green Nike SVG or animated check if needed -->
        </div>
        <!-- <div v-show="value" class="dialog-background" @click="closePopUpAndDropdowns"></div> -->


    </div>
</template>

<script>

import axios from "axios";
import { displayDate } from "../date";
import html2canvas from "html2canvas";
import CarouselComponent from "./CarouselComponent.vue";
import { config } from "process";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import { generateTimeline } from "../../utils/ticketDetailsUtils";
import ConfirmDialog from "./components/ConfirmDialog.vue";

export default {
    components: { CarouselComponent, ConfirmDialog },

    props: {
        value: {
            type: Boolean,
            default: false,
        },

        detailedTicket: {
            type: Object,
            required: true,
        },
        steps: {
            type: Array,
            required: true,
        },

        baseURL: {
            type: String,
            required: true,
        },
        config: {
            type: Object,
            required: true,
        },

        token: {
            type: String,
            required: false,
        },
    },

    data: () => ({
        images_loaded: false,
        carouselKey: 0,
        images: undefined,
        showPDF: false,
        PDFparts: [],
        loader_size: 100,
        isEditing: false,
        workflows: ["Workflow 1", "Workflow 2", "Workflow 3"],
        processes: ["Process 1", "Process 2", "Process 3"],
        imagesReady: false,
        selectedWorkflow: "",
        selectedProcess: "",
        selectedStep: "",
        selectedStepName: "",
        selectedPriority: null,
        newNote: "",
        editedName: "",
        editedDescription: "",
        enrichedAnnotations: [],
        TimeLine: [],
        openedSteps: [],
        showArchiveDialog: boolean = false,
        ticketToArchive: null,
        showArchiveDialog: false,
        isStepDropdownOpen: false,
        isPriorityDropdownOpen: false,
        uploadedFiles: [],
        showConfirmDialog: false,
        showSuccessAnimation: false,
        maxStepNameLength: 25,
        useShortDate: false,
        isSmallScreen: window.innerWidth <= 1000,
        confirmChanges: {
            name: "",
            description: "",
            stepChanged: false,
            note: "",
            files: [],
        },
    }),

    computed: {
        dispDateCreation() {
            return displayDate(this.detailedTicket.creationDate);
        },
        dispDateModif() {
            return this.detailedTicket.log_list.length > 0
                ? displayDate([...this.detailedTicket.log_list].reverse()[0]?.date)
                : this.dispDateCreation;
        },
        isSameDate() {
            return this.dispDateCreation === this.dispDateModif;
        },
        hasAttachments() {
            return this.images_loaded && this.images && this.images.length > 0;
        },

        archiveText() {
            const id = this.ticketToArchive?.dynamicId || '';
            const name = this.ticketToArchive?.name || '';
            return `Êtes-vous sûr de vouloir archiver le ticket numéro : <strong>#${id}</strong> avec le nom "${name}"`;
        },
        logsHeaders() {
            return [
                { text: "Évenement", value: "event" },
                { text: "Date", value: "date", sort: (a, b) => this.compareDate(a, b) },
            ];
        },
        logsValues() {
            return this.detailedTicket.log_list.map((l) => ({
                event: l.event,
                date: displayDate(l.date),
            }));
        },
        annotationsHeaders() {
            return [
                { text: "Déclarant", value: "userName" },
                { text: "Date", value: "date", sort: (a, b) => this.compareDate(a, b) },
                { text: "Message", value: "message", width: "70%" },
            ];
        },
        annotationsValues() {
            return this.detailedTicket.annotation_list.map((a) => ({
                userName: a.userName || "Non défini",
                date: displayDate(a.date),
                message: a.message,
            }));
        },
        isDownloadable() {
            const requiredLength = document.querySelectorAll(".downloadable").length;
            const currentLength = this.PDFparts.length;
            return requiredLength > 0 && currentLength === requiredLength;
        },
        url() {
            let url = this.baseURL;
            if (!url.endsWith("/")) url += "/";
            return url;
        },
        priorityLabel() {
            const labels = ['Priorité Élevé', 'Priorité Moyenne', 'Priorité Faible'];
            return labels[this.detailedTicket.priority] || 'Priorité Inconnue';
        },
        priorityClass() {
            return {
                'low-priority': this.detailedTicket.priority === 2,
                'medium-priority': this.detailedTicket.priority === 1,
                'high-priority': this.detailedTicket.priority === 0,
            };
        },
        priorityStyle() {
            const colors = ['#FF000020', '#FFA50020', '#00800020'];
            return {
                backgroundColor: `${colors[this.detailedTicket.priority]}`,
            };
        },
        allPriorities() {
            return [
                { value: 0, label: 'Priorité Élevé', color: '#FF0000' },
                { value: 1, label: 'Priorité Moyenne', color: '#FFA500' },
                { value: 2, label: 'Priorité Faible', color: '#008000' }
            ];
        },
        availablePriorities() {
            return this.allPriorities.filter(p => p.value !== this.detailedTicket.priority);
        },
        refusedStepNames() {
            // return false;
            return this.config?.steps?.refused.flat() || [];
        },
        archivedStepNames() {
            // return false;
            return this.config?.steps?.archived.flat() || [];
        },
        formattedLocation() {
            const el = this.detailedTicket.elementSelected;
            const building = this.detailedTicket.buildingName || (el?.position?.building?.name ?? "");
            const floor = el?.position?.floor?.name ?? "";
            const room = el?.position?.room?.name ?? "";
            const elementName = el?.name ?? "";

            switch (el?.type) {
                case "BIMObject":
                    return [building, floor, room, elementName].filter(Boolean).join("/");
                case "geographicRoom":
                    return [building, floor, elementName].filter(Boolean).join("/");
                case "geographicFloor":
                    return [building, elementName].filter(Boolean).join("/");
                case "geographicBuilding":
                    return [elementName].filter(Boolean).join("/");
                default:
                    return elementName;
            }
        }
    },

    methods: {
        updateMaxStepNameLength() {
            this.maxStepNameLength = window.innerWidth < 1600 ? 18 : 25;
        },
        updateDateDisplayMode() {
            this.useShortDate = window.innerWidth < 1500;
        },
        updateScreenSize() {
            this.isSmallScreen = window.innerWidth <= 1000;
        },
        changeRoute(id, name) {
            const route = {
                'dynamicId': id,
                'name': name
            }
            this.$emit("changeRoute", route);
        },
        generateModificationText() {
            let text = '';
            if (!this.confirmChanges) return "Aucune modification détectée.";
            if (this.confirmChanges.name && this.confirmChanges.name !== this.detailedTicket.name) {
                text += `➤ Nom changé vers : <strong>${this.confirmChanges.name}</strong><br>`;
            }
            if (this.confirmChanges.description && this.confirmChanges.description !== this.detailedTicket.description) {
                text += `➤ Description changée vers : <strong>${this.confirmChanges.description}</strong><br>`;
            }

            if (this.confirmChanges.stepChanged) {
                text += `➤ Étape changée vers : <strong>${this.selectedStepName}</strong><br>`;
            }

            if (this.confirmChanges.priorityChanged) {
                const label = this.allPriorities.find(p => p.value === this.confirmChanges.newPriority)?.label || '';
                text += `➤ Priorité changée vers : <strong>${label}</strong><br>`;
            }

            if (this.confirmChanges.note) {
                text += `➤ Note : <i>"${this.confirmChanges.note}"</i><br>`;
            }

            if (this.confirmChanges.files.length) {
                text += `➤ ${this.confirmChanges.files.length} fichier(s) joint(s) :<ul>`;
                for (const file of this.confirmChanges.files) {
                    text += `<li>${file.name}</li>`;
                }
                text += `</ul>`;
            }

            return text || "Aucune modification détectée.";
        },
        selectStepFromDropdown(stepName) {
            this.selectedStepName = stepName;
            this.isStepDropdownOpen = false;
        },
        selectPriorityFromDropdown(priorityorder) {
            this.selectedPriority = priorityorder;
            this.isPriorityDropdownOpen = false;
        },
        closePopUpAndDropdowns() {
            this.closePopUp();
            this.resetChanges();
            this.isStepDropdownOpen = false;
            this.isPriorityDropdownOpen = false;
        },
        onClickNavigate(id, name) {
            let buildingId = localStorage.getItem("idBuilding");
            let app = this.config.application.find(app => app.name.toLowerCase() === "description");
            if (app) {
                app = app.id;
            } else {
                console.error("Application with name 'description' not found.");
            }
            const query = {
                app: app,
                buildingId: buildingId,
                spaceSelectedId: id,
                name: name
            };
            // window.parent.routerFontion.customPush(window.parent.router.path, query);
            const searchParams = new URLSearchParams(query).toString();

            // Build the full URL (adjust window.parent.router.path if needed)
            const fullPath = `${location.origin}#/app?${searchParams}`;

            // Open in new tab
            window.open(fullPath, '_blank');
        },
        getStepLineClass(step) {
            const isRefused = this.refusedStepNames.includes(step.name);
            if (isRefused) return 'step-line red refused';
            const isArchived = this.archivedStepNames.includes(step.name);
            if (isArchived) return 'step-line grey refused';
            return '';
        },
        getStepCircleClass(step) {
            // const isRefused = this.refusedStepNames.includes(step.name);
            // if (isRefused) return 'step-circle red refused';
            if (step.type === 'next') return 'step-circle grey';
            if (step.type === 'other') return 'step-circle grey';
            else return 'step-circle green done';
            if ((step.order < this.detailedTicket.step.order) && (step.order >= 0)) return 'step-circle green done';
            if (step.order === this.detailedTicket.step.order) return 'step-circle green current';
            return 'step-circle grey';
        },
        closePopUp() {
            this.isEditing = false;
            this.resetChanges();
            this.$emit("input", false);
        },
        generateOpenedStepsKeys() {
            return this.TimeLine
                .filter(item => item.annotations.length > 0)
                .map(item => item.step.staticId + '-' + item.date);
        },
        toggleStepMessages(itemKey) {
            const index = this.openedSteps.indexOf(itemKey);
            if (index === -1) {
                this.openedSteps.push(itemKey);
            } else {
                this.openedSteps.splice(index, 1);
            }
        },
        scrollToLastVisibleStep() {
            this.$nextTick(() => {
                // Filter visible steps by type
                const activeSteps = this.TimeLine.filter(item =>
                    item.type !== 'next' && item.type !== 'other' &&
                    !this.archivedStepNames.includes(item.step.name)
                );

                if (activeSteps.length === 0) return;

                const lastStep = activeSteps[activeSteps.length - 1];
                const refName = lastStep.step.staticId + '-' + lastStep.date;

                const stepElement = this.$refs[refName];

                if (stepElement && stepElement[0]) {
                    const el = stepElement[0]; // Vue ref array due to v-for
                    const container = this.$el.querySelector('.custom-scroll');

                    if (container && el) {
                        const containerRect = container.getBoundingClientRect();
                        const elRect = el.getBoundingClientRect();
                        const offset = el.offsetTop - container.offsetTop - (container.clientHeight / 2) + (el.clientHeight / 2);

                        container.scrollTo({
                            top: offset,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        },

        getFromStep(logEvent) {
            const match = logEvent.match(/from (.+?) to/);
            return match ? match[1].trim() : null;
        },
        getToStep(logEvent) {
            const match = logEvent.match(/(?:from|to) (.+?) to (.+)/);
            return match ? match[2].trim() : null;
        },
        getStepDate(stepName) {
            const currentStepOrder = this.detailedTicket.step.order;
            const step = this.steps.find(s => s.name === stepName);

            if (!step) return "Inconnu";

            // Special case for step with order 0: return date of first log
            if (step.order === 0) {
                const firstLog = this.detailedTicket.log_list[0];
                if (firstLog) return this.formatDate(firstLog.date);
                return "Fait";
            }

            // Try to find a log matching the step
            const log = this.detailedTicket.log_list.find(log => {
                const toStep = this.getToStep(log.event);
                return toStep === stepName;
            });

            if (log) {
                return this.formatDate(log.date);
            } else if (step.order < 0) {
                return "--:--";
            } else if (step.order < currentStepOrder) {
                return "Fait";
            } else {
                return "À venir";
            }
        },
        getLogDate(log) {

            if ((log.type !== "next") && (log.type !== "other")) return this.formatAdaptiveDate(log.date);
            else if (log.type === "next") {
                return "À venir";
            } else if (log.type === "other") {
                return "--:--";
            }
            if (!step) return "Inconnu";
        },
        formatDate(timestamp) {
            const dateObj = new Date(timestamp);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        },
        formatAdaptiveDate(timestamp) {
            const dateObj = new Date(timestamp);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');

            if (this.useShortDate) {
                return `${day}/${month} ${hours}:${minutes}`;
            } else {
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            }
        },



        downloadPDF() {
            this.showPDF = true;
            setTimeout(() => {
                const docs = document.querySelectorAll(".downloadable");
                this.showPDF = !this.showPDF;
                for (const el of docs)
                    html2canvas(el).then((canvas) => {
                        const b64 = canvas.toDataURL();
                        this.PDFparts.push(
                            `<div><img style="margin-bottom: 12px; max-width: 100%; height: auto" src="${b64}" /></div>`
                        );
                    });
            }, 10);
        },
        handleArchiveTicket(ticket) {
            this.ticketToArchive = ticket;
            this.showArchiveDialog = true;
        },
        cancelArchive() {
            this.showArchiveDialog = false;
            this.ticketToArchive = null;
        },

        async confirmArchive() {
            let buildingId = localStorage.getItem("idBuilding");

            const res = await this.$store.dispatch("ARCHIVE_TICKET", {
                buildingId, ticketId: this.ticketToArchive.dynamicId, data: {
                    workflowDynamicId: this.ticketToArchive.workflowId,
                    processDynamicId: this.ticketToArchive.process.dynamicId
                }
            });

            if (res) {
            } else {
                console.error('Failed to archive ticket:', this.ticketToArchive);
            }
            this.showArchiveDialog = false;
            this.ticketToArchive = null;
        },

        async getFileAsync(nodeId) {
            const result = await axios.post(
                `${this.url}${nodeId}/download_file`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                    responseType: "blob",
                }
            );
            return window.URL.createObjectURL(result.data);
        },
        deleteTicket() {
            // alert("Ticket supprimé !");
            // Add logic to handle ticket deletion
        },
        archiveTicket() {
            // alert("Ticket archivé !");
            // Add logic to handle ticket archiving
        },
        cancelEdit() {
            this.isEditing = false;
            this.resetChanges();
        },
        async toggleEdit() {
            if (!this.isEditing) {
                this.isEditing = true;
                return;
            }
            this.confirmChanges = {
                name: this.editedName,
                description: this.editedDescription,
                stepChanged: this.selectedStepName && this.selectedStepName !== this.detailedTicket.step.name,
                note: this.newNote,
                files: [...this.uploadedFiles],
                priorityChanged: this.selectedPriority !== null && this.selectedPriority !== this.detailedTicket.priority,
                newPriority: this.selectedPriority
            };

            this.showConfirmDialog = true;
        },
        async confirmAndSaveChanges() {
            this.showConfirmDialog = false;
            const buildingId = localStorage.getItem("idBuilding");

            // Start saving...
            await this.modifyTicket(
                this.editedName,
                this.editedDescription,
                this.detailedTicket.priority
            );

            if (this.selectedStepName && this.selectedStepName !== this.detailedTicket.step.name) {
                await this.goToStep(this.selectedStepName);
            }

            if (this.newNote && this.newNote.trim() !== "") {
                await this.addNote(this.newNote);
            }
            if (this.selectedPriority !== null && this.selectedPriority !== this.detailedTicket.priority) {
                await this.modifyTicket(
                    this.detailedTicket.name,
                    this.detailedTicket.description,
                    this.selectedPriority !== null ? this.selectedPriority : this.detailedTicket.priority
                );
            }

            for (const file of this.uploadedFiles) {
                const formData = new FormData();
                formData.append("file", file);
                await this.$store.dispatch("ADD_DOC", {
                    buildingId,
                    ticketId: this.detailedTicket.dynamicId,
                    data: formData,
                });
            }

            this.resetChanges();

            // Success animation
            this.showSuccessAnimation = true;

            setTimeout(() => {
                this.showSuccessAnimation = false;
                this.isEditing = false;
                this.$emit("reloadRequested");
                this.$emit("input", false); // Close popup
            }, 2000);
        },
        countMessagesForStep(stepName) {
            return this.enrichedAnnotations.filter(a => a.stepName === stepName).length;
        },

        async addNote(note) {
            const buildingId = localStorage.getItem("idBuilding");

            if (!note || note.trim() === "") {
                return;
            }

            // 1. Add the note
            const res = await this.$store.dispatch("ADD_NOTE", {
                buildingId,
                ticketId: this.detailedTicket.dynamicId,
                data: { note }
            });

            if (res) {
                console.log("Note added successfully.");
            } else {
                console.error("Failed to add note.");
                return;
            }

            // 2. Upload attached files (if any)
            for (const file of this.uploadedFiles) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await this.$store.dispatch("ADD_DOC", {
                    buildingId,
                    ticketId: this.detailedTicket.dynamicId,
                    data: formData,
                });

                if (uploadRes) {
                    console.log(`File ${file.name} uploaded successfully.`);
                } else {
                    console.error(`Failed to upload file: ${file.name}`);
                }
            }

            // 3. Clear inputs
            this.newNote = "";
            this.uploadedFiles = [];
            this.$emit("reloadRequested");
        },

        handleFileUpload(event) {
            const files = Array.from(event.target.files);
            for (const file of files) {
                if (!this.uploadedFiles.find(f => f.name === file.name)) {
                    this.uploadedFiles.push(file);
                }
            }
            // Reset input to allow uploading same file again
            this.$refs.fileInput.value = '';
        },
        removeFile(index) {
            this.uploadedFiles.splice(index, 1);
        },
        resetChanges() {
            this.selectedStepName = "";
            this.selectedPriority = null;
            this.newNote = "";
            this.uploadedFiles = [];
            this.isStepDropdownOpen = false;
            this.isPriorityDropdownOpen = false;
            this.editedName = this.detailedTicket.name || "";
            this.editedDescription = this.detailedTicket.description || "";
        },

        async modifyTicket(name, description, priority) {
            let buildingId = localStorage.getItem("idBuilding");
            if (!name && !description && !priority) {
                return;
            }
            const res = await this.$store.dispatch("MODIFY_TICKET", {
                buildingId,
                ticketId: this.detailedTicket.dynamicId,
                data: {
                    name: name,
                    description: description,
                    priority: priority,
                }
            });

            if (res) {
                console.log("Updated successfully.");
            } else {
                console.error("Failed to update.");
            }
        },

        async goToStep(selectedStepName) {

            let buildingId = localStorage.getItem("idBuilding");
            const targetStep = this.steps.find(s => s.name === selectedStepName);

            if (!targetStep) {
                return;
            }
            const res = await this.$store.dispatch("MOVE_TO_STEP_TICKET", {
                buildingId,
                ticketId: this.detailedTicket.dynamicId,
                data: {
                    workflowDynamicId: this.detailedTicket.workflowId,
                    toStepName: targetStep.name,
                }
            });
            if (res) {
                console.log(`Successfully moved to step: ${targetStep.name || 'Unknown'}`);
            } else {
                console.error(`Failed to move ticket: ${this.detailedTicket.name}`);
                return;
            }
        },


        matchAnnotationsToSteps(annotations, logs, steps) {
            const stepMap = Object.fromEntries(steps.map(step => [step.name, step]));

            // Ensure logs are sorted ascending by date
            const sortedLogs = [...logs].sort((a, b) => a.date - b.date);

            return annotations.map(annotation => {
                const { date, message, type, userName } = annotation;

                // Find the last log before or at the annotation date
                let matchedLog = sortedLogs[0];
                for (const log of sortedLogs) {
                    if (log.date <= date) {
                        matchedLog = log;
                    } else {
                        break;
                    }
                }

                let stepName = "Inconnu";
                let stepOrder = -1;

                if (matchedLog.event === "created") {
                    // Special case
                    const stepZero = steps.find(s => s.order === 0);
                    stepName = stepZero?.name || "Créé";
                    stepOrder = 0;
                } else {
                    const toStep = this.getToStep(matchedLog.event);
                    if (toStep && stepMap[toStep]) {
                        stepName = toStep;
                        stepOrder = stepMap[toStep].order;
                    }
                }

                return {
                    date,
                    message,
                    type,
                    userName,
                    stepName,
                    stepOrder
                };
            });
        }

    },

    async mounted() {
        if (this.detailedTicket) {
            this.editedName = this.detailedTicket.name || "";
            this.editedDescription = this.detailedTicket.description || "";
        }
        this.enrichedAnnotations = this.matchAnnotationsToSteps(
            this.detailedTicket.annotation_list,
            this.detailedTicket.log_list,
            this.steps
        );
        this.TimeLine = generateTimeline(this.steps, this.detailedTicket.log_list, this.detailedTicket.annotation_list);
        this.updateMaxStepNameLength();
        window.addEventListener('resize', this.updateMaxStepNameLength);
        this.updateDateDisplayMode();
        window.addEventListener('resize', this.updateDateDisplayMode);
        window.addEventListener("resize", this.updateScreenSize);
        this.updateScreenSize();

        // this.openedSteps = this.generateOpenedStepsKeys();


        const { loader } = this.$refs;
        const size =
            loader.clientWidth < loader.clientHeight
                ? loader.clientWidth
                : loader.clientHeight;
        this.loader_size = size * 0.4;

        window.onresize = () => {
            const size =
                loader.clientWidth < loader.clientHeight
                    ? loader.clientWidth
                    : loader.clientHeight;
            this.loader_size = size * 0.4;
        };

        if (this.detailedTicket)
            this.images = (
                await Promise.all(
                    this.detailedTicket.file_list.map(async (file) => {
                        try {
                            const img = await this.getFileAsync(file.dynamicId);
                            return { name: file.Name, src: img };
                        } catch {
                            return undefined;
                        }
                    })
                )
            ).filter((i) => i);
        this.images_loaded = true;
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.updateMaxStepNameLength);
        window.removeEventListener('resize', this.updateDateDisplayMode);
        window.removeEventListener("resize", this.updateScreenSize);
    },

    watch: {

        async isDownloadable(v) {
            if (v) {
                const mywindow = window.open("", "PRINT", "height=600,width=900");
                mywindow.document.write(
                    `<html><head><title> ${this.detailedTicket.name} </title>`
                );
                mywindow.document.write("</head><body >");
                for (const part of this.PDFparts) {
                    mywindow.document.writeln(part);
                }
                await mywindow.document.writeln("</body></html>");

                mywindow.document.close();
                mywindow.focus();
                mywindow.print();
                mywindow.close();
                this.PDFparts = [];
            }
        },
        async value(v) {
            if (v) {

                this.enrichedAnnotations = this.matchAnnotationsToSteps(
                    this.detailedTicket.annotation_list,
                    this.detailedTicket.log_list,
                    this.steps
                );
                this.TimeLine = generateTimeline(this.steps, this.detailedTicket.log_list, this.detailedTicket.annotation_list,);
                this.scrollToLastVisibleStep();
                this.editedName = this.detailedTicket.name || "";
                this.editedDescription = this.detailedTicket.description || "";

                this.images_loaded = false;
                this.images = (
                    await Promise.all(
                        this.detailedTicket.file_list.map(async (file) => {
                            try {
                                const img = await this.getFileAsync(file.dynamicId);
                                return { name: file.Name, src: img };
                            } catch {
                                return undefined;
                            }
                        })
                    )
                ).filter((i) => i);
                this.images_loaded = true;
                this.imagesReady = !this.imagesReady;
                this.carouselKey += 1;
            }
        },
        detailedTicket: {
            handler(newTicket) {
                if (this.value && newTicket) {
                    this.enrichedAnnotations = this.matchAnnotationsToSteps(
                        newTicket.annotation_list,
                        newTicket.log_list,
                        this.steps
                    );
                    this.TimeLine = generateTimeline(this.steps, this.detailedTicket.log_list, this.detailedTicket.annotation_list,);
                }
            },
            immediate: true
        },
    },
};
</script>

<style scoped>
.dialog-background {
    position: fixed;
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.3);

}

.dialog-box {
    transition: all 0.7s ease;
    max-width: 200%;
    width: 94%;
    height: calc(100% - 80px);
    position: absolute;
    top: 30px;
    left: 3%;
    padding: 10px;
}

.dialog-box.editing-mode {
    max-width: 200%;
    width: 200%;
    left: -120%;
    padding: 10px;
}

.flexdisplay {
    display: flex !important;
    flex-direction: row !important;
    /* background-color: red; */
}

.infograph {
    width: 49%;
    margin: 5px;
}

input {
    transition: all 0.3s ease-in-out;
}

/* Styles when in editable mode */
div.editable {
    border: 2px solid #14202c;
    border-radius: 5px;
    font-weight: bold;
}

.not-editable {
    cursor: not-allowed !important;
    background-color: #14202c50 !important;
    opacity: 0.5;
    font-weight: bold;
}

.edit-icon {
    background-image: url(./assets/edit.svg);
    background-position: center;
    background-size: 70%;
    padding: 5px;
    border-radius: 5px;
    width: 20px;
    height: 20px;
    position: absolute;
}

.dropdown-icon {
    position: absolute;
    padding: 5px;
    border-radius: 5px;
    width: 20px;
    height: 20px;
    background-color: #14202c;
}

.dropdown-icon::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background-image: url(./assets/arrow.svg);
    background-size: 120%;
    background-repeat: no-repeat;
    background-position: center;
    transform: rotate(270deg);
    transition: transform 0.3s ease-in-out;
}

.dropdown-icon.rotate-open::before {
    transform: rotate(90deg);
}



.edit-icon-b {
    background-image: url(./assets/edit-b.svg);
    background-position: center;
    background-size: 70%;
    padding: 5px;
    border-radius: 5px;
    width: 20px;
    height: 20px;
    position: absolute;
}

input.editable {
    border: 2px solid #fff;
    background-color: #fff;
    color: #14202c !important;
    padding: 4px;
    margin-top: 4px;
    border-radius: 4px;
    width: 50% !important;
}

textarea.editable {
    color: #14202c;
    border: 2px solid #1E88E5;
    border-radius: 3px;
    margin-top: 2px;
    width: 99% !important;
    padding-left: 5px;
}

.details-card-ticket-id {
    font-size: 13px;
    /* font-weight: bold; */
    color: #14202c;
    margin-right: 10px;
}

.details-card-ticket-prio {
    background-color: #f0f0f0;
    padding: 0px 5px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: bold;
}

.low-priority {
    color: #008000;
}

.medium-priority {
    color: #FFA500;
}

.high-priority {
    color: #FF0000;
}

.details-card-ticket-date {
    font-size: 13px;
    /* font-weight: bold; */
    color: #14202c;
    text-align: right
}


/* Buttons */
.button-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px;
}

.btn-group {
    gap: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.btn {
    padding: 12px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 13px;
    font-weight: bold;
}

.btn-send {
    height: 30px;
    width: 30px;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url(./assets/send.svg);
    transform: rotate(0deg);
    transition: transform 0.2s ease-in-out;
}

.btn-send:hover {
    transform: rotate(-45deg);
    transition: transform 0.2s ease-in-out;
}

.btn-join {
    height: 30px;
    width: 30px;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url(./assets/attach.svg);
    transform: rotate(0deg);
    transition: transform 0.2s ease-in-out;
}

.btn-join:hover {
    transform: rotate(-45deg);
    transition: transform 0.2s ease-in-out;
}

@keyframes flyPath {
    0% {
        transform: translate(0, 0) rotate(0deg);
    }

    25% {
        transform: translate(-20px, -20px) rotate(-45deg);
    }

    50% {
        transform: translate(50px, -50px) rotate(-90deg);
    }

    75% {
        transform: translate(100px, -20px) rotate(-135deg);
    }

    100% {
        transform: translate(150px, 0) rotate(-180deg);
    }
}

.btn-send:active {
    animation: flyPath 5s ease-in-out forwards;
}

.btn-delete {
    background-color: #ffcccc;
    color: #ff0000;
}

.btn-delete:hover {
    background-color: #ff9999;
}

.btn-edit {
    background-color: #14202c !important;
    color: #fff !important;
}

.btn-edit:hover {
    background-color: #333 !important;
}

.btn-archive {
    background-color: #f2f2f2;
    color: #14202c;
    border: 2px solid #14202c;
}

.btn-annuler {
    background-color: #f2f2f2;
    color: #14202c;
    border: 2px solid #14202c;
}

.btn-group .btn {
    background-color: #f2f2f2;
    color: #000;
}

.btn-group .btn:hover {
    background-color: #e0e0e0;
}

.first-step-container {
    border: 1px solid #14202c;
    border-radius: 4px;
    position: relative;
}

.first-step-title {
    color: #fff;
    background-color: #14202c;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    padding: 5px;
    padding-top: 16px;
    display: flex;
    font-size: 12px;
}

.first-step-desc {
    padding-left: 5px;
    font-size: 11px;
    /* line-height: 1.5; */
    text-align: justify;
}

.step-date-text {
    color: #14202c;
    font-size: 12px;
    font-weight: 600;
}

.details-input {
    border-bottom: 2px solid #14202c;
    margin-top: 3px;
    height: 36px;
    /* box-shadow: 0 2px 4px #0000004d; */
    cursor: pointer;
    border-radius: 0 0 8px 0px;
    align-items: center;
    padding-left: 10px;
    display: flex;
    color: #14202c;
    background-color: #D9D9D930;
}

.details-icon {
    height: 15px;
    width: 15px;
    background-size: 85%;
    background-repeat: no-repeat;
    background-position: center;
}

.details-icon.titre {
    background-image: url(./assets/form-title.svg);
    background-size: 70%;
}

.details-icon.description {
    background-image: url(./assets/form-desc.svg);
}

.details-icon.declarant {
    /* background-image: url(./assets/form-declarant.svg); */
    background-image: url(./assets/form-account.svg);
}

.details-icon.workflow {
    background-image: url(./assets/form-workflow.svg);
    background-size: 100%;
}

.details-icon.process {
    background-image: url(./assets/form-domain.svg);
}

.details-icon.space {
    background-image: url(./assets/form-localisation.svg);
}

.step-holder {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    position: relative;
}

.step-circle {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    color: white;
}

.step-circle.green {
    background: #142020 !important;
}

.step-circle.grey {
    background: #ccc;
}

.step-circle.done span {
    display: block;
}

.step-circle.current span {
    /* display: none; */
}


.status-indicator {
    padding: 5px;
    border-radius: 5px;
    color: #14202c;
    font-size: 11px;
    align-items: center;
}

.status-indicator-point {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
}

.status-indicator-point2 {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 5px;
    margin-bottom: 12px;
}

.step-circle.red {
    background: #FF0000;
}

.modification-warning {
    background-color: rgb(255, 193, 7);
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    top: 36px;
    height: 20px;
    padding: 2px 20px;
    border-radius: 4px 4px 0px 0px;
}

.custom-scroll-bg {
    opacity: 0.6;
    background-color: rgba(20, 32, 44, 0.2);
}

.custom-scroll {
    scrollbar-width: thin;
    position: relative;
    /* For Firefox */
    scrollbar-color: #14202c transparent;
    /* For Firefox */
}

.custom-scroll::-webkit-scrollbar {
    width: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: #14202c;
    border-radius: 8px;
    border: 2px solid transparent;
    /* Optional: adds space around thumb */
    background-clip: content-box;
    /* Optional: keeps border effect visible */
}

.hide-divider {
    display: block !important;
}

.fulldetails-card {
    display: flex;
    flex-direction: row;
    overflow: hidden !important;
}

.steps-container-wrapper {
    width: 51%;
}

.restofdetails-container-wrapper {
    width: 49%;
}

.details-card-close {
    padding: inherit;
    cursor: pointer;
    z-index: 9;
    color: #fff;
    background-color: #14202c;
    border-radius: 25px !important;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    font-weight: bold;
    display: flex;
    position: absolute;
    right: -10px;
    top: -10px;
    padding: 5px !important;
}

.step-dropdown {
    z-index: 999;
    background-color: #fff;
    border: 2px solid #14202c;
    border-radius: 4px;
    width: 250px;
    max-height: 300px;
    padding: 5px;
    position: absolute;
    overflow-y: auto;
    top: 50%;
    margin-top: 15px;
    box-shadow: 0 2px 8px #00000026;
}

.step-dropdown .status-indicator {
    transition: border 0.2s ease-in-out;
    border: 1px solid transparent;
}

.step-dropdown .status-indicator:hover {
    border: 1px solid #14202c;
}

.selected-priority {
    border: 2px solid #14202c;
}

.step-dropdown .status-indicator.selected-priority {
    border: 2px solid #14202c !important;
}

.step-dropdown .status-indicator.selected-step {
    border: 2px solid #14202c !important;
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

.success-animation {
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 64px;
    color: green;
    z-index: 9999;
    animation: pop-scale 0.5s ease-in-out;
}

@keyframes pop-scale {
    0% {
        transform: translate(-50%, -50%) scale(0.2);
        opacity: 0;
    }

    60% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 1;
    }

    100% {
        transform: translate(-50%, -50%) scale(1);
    }
}




@media (max-width: 1600px) {
    .step-date-text {
        font-size: 10px;
        font-weight: 600;
    }

    .status-indicator {
        font-size: 10px;
    }

    .status-indicator-point {
        width: 8px;
        height: 8px;
    }
}

@media (max-width: 1000px) {
    .fulldetails-card {
        display: flex;
        flex-direction: column;
        overflow: hidden !important;
    }

    .steps-container-wrapper {
        width: 98%;
        max-height: 350px;
    }

    .restofdetails-container-wrapper {
        width: 98%;
    }

    .btn-group {
        width: 70% !important;
    }
}

@media (max-width: 900px) {
    /* .hide {
        display: none !important;
        visibility: hidden !important;
    }

    .hide-divider {
        display: none !important;
        visibility: hidden !important;
    }

    .fulldetails-card {
        display: flex;
        flex-direction: column;
        overflow: scroll !important;
    }

    .steps-container-wrapper {
        width: 100%;
    }

    .restofdetails-container-wrapper {
        width: 100%;
    } */
}



@media (max-width: 900px) {

    .flexdisplay {
        display: flex !important;
        flex-direction: column !important;
        /* background-color: red; */
    }

    .infograph {
        width: 100%;
        margin: 0px;
        margin-top: 15px;
    }
}

.small-label .v-label {
    font-size: 11px !important;
}
</style>