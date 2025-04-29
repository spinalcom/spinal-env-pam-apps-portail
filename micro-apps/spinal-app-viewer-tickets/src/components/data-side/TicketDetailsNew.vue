<template>
    <div>
        <!--Dialog background-->
        <div v-show="value" class="dialog-background" @click="closePopUp"></div>

        <!--Dialog box to display the details of the tcket-->
        <v-card v-if="detailedTicket" elevation="24" v-show="value"
            :class="['dialog-box', { 'editing-mode': isEditing }]">
            <div @click="closePopUp()" class="details-card-close">
                X
            </div>
            <v-card-title style="height: 35px; overflow: hidden;justify-content: space-between;padding: 0px!important;"
                class="bold px-4 d-flex flex-row align-items-center">
                <div class="overflow-hidden d-flex" style="min-width: 150px;flex-direction: row;">
                    <!-- {{ detailedTicket.name || "Nom" }} -->
                    <div class="details-card-ticket-id">Ticket n°: <b>{{ detailedTicket.dynamicId }}</b></div>
                    <div :class="['details-card-ticket-prio', priorityClass]" :style="priorityStyle">
                        {{ priorityLabel }}
                    </div>
                </div>
                <div class="details-card-ticket-date" style="min-width: 200px;">
                    <template v-if="isSameDate">
                        Créé le: <b>{{ dispDateCreation }}</b>
                    </template>
                    <template v-else>
                        Créé le: <b>{{ dispDateCreation }}</b>
                        | Modifié le: <b>{{ dispDateModif }}</b>
                    </template>
                </div>
                <!-- <div class="flex-grow-1 text-right overflow-hidden" style="min-width: 150px;">
                    Priorité: {{ detailedTicket.priority }}
                </div> -->
            </v-card-title>


            <v-divider style="margin: 10px 0px ;position: relative;"
                :style="{ backgroundColor: isEditing ? '#FFC107' : '' }">

            </v-divider>
            <div v-if="isEditing" class="modification-warning">
                Modification</div>
            <div class="first-step-container" style="">
                <div class="first-step-title">
                    <!-- <p><b>Création</b> ticket</p> -->
                    <input type="text" :disabled="!isEditing" v-model="detailedTicket.name" placeholder="Non défini"
                        :class="{ 'editable': isEditing }"
                        style="width:60%;font-size: 12px;    margin-bottom: 16px;color: #fff;" />
                    <!-- <p>{{ dispDateCreation }}</p> -->
                    <p>Par: <b style="color: #fff;">{{ detailedTicket.userName || "Système" }}</b>
                    </p>
                </div>
                <div class="first-step-desc">
                    <!-- Ticket signalé pour {{ this.detailedTicket.process.name }} dans {{
                        this.detailedTicket.elementSelected.name }}. En attente
                    de
                    prise en
                    charge par l'équipe de maintenance. -->
                    <textarea :disabled="!isEditing" v-model="detailedTicket.description" placeholder="Non défini"
                        :class="{ 'editable': isEditing }"
                        style="width: 100%; height: auto; font-size: 12px; resize: none; overflow: auto; text-align: left; line-height: 1.5;"></textarea>

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
                    <div class="custom-scroll" style="width: 100%;overflow: auto;max-height: 85%;min-height: 65%;">


                        <!-- <div v-for="step in steps" :key="step.id" class="step-container">
                            <div v-for="n in 3" :key="`refused-step-${n}`" v-if="refusedStepNames.includes(step.name)"
                                :style="{
                                    height: '5px',
                                    width: '2px',
                                    background: step.order <= detailedTicket.step.order ? '#142020' : '#ccc',
                                    marginLeft: '10px',
                                    marginBottom: '3px'
                                }" :class="getStepLineClass(step)">
                            </div>
                            <div :style="{
                                height: '25px',
                                width: '2px',
                                background: step.order <= detailedTicket.step.order ? '#142020' : '#ccc',
                                marginLeft: '10px'
                            }" :class="getStepLineClass(step)">
                            </div>

                            <div v-if="step.name === detailedTicket.step.name" class="first-step-container"
                                style="border-color: #142020;">
                                <div class="first-step-title" style="background-color: #142020;">
                                    <div class="d-flex flex-row"
                                        style="align-items: center;margin: 0!important;padding: 0!important;">
                                        <div class="status-indicator-point2" :style="{ background: step.color }">
                                        </div>
                                        <p>{{ step.name }}</p>
                                    </div>
                                    <p class="step-date-text" style="color: #fff!important;">{{ getStepDate(step.name)
                                    }}
                                    </p>

                                </div>
                                <div class="first-step-desc">
                                    <div v-if="enrichedAnnotations.filter(a => a.stepName === step.name).length > 0">
                                        <div v-for="(annotation, index) in enrichedAnnotations.filter(a => a.stepName === step.name)"
                                            :key="annotation.date"
                                            v-if="index === enrichedAnnotations.filter(a => a.stepName === step.name).length - 1">
                                            <strong>{{ annotation.userName || 'Non défini' }}</strong> – {{
                                                formatDate(annotation.date)
                                            }}<br />
                                            {{ annotation.message }}
                                        </div>
                                    </div>
                                    <div v-else>
                                        <em>Aucune annotation disponible</em>
                                    </div>
                                </div>
                            </div>
                            <div class="step-holder">
                                <div :class="getStepCircleClass(step)">
                                    <span v-if="refusedStepNames.includes(step.name)">✘</span>
                                    <span v-else-if="archivedStepNames.includes(step.name)">✘</span>
                                    <span v-else>✔</span>
                                </div>
                                <div class="d-flex flex-row"
                                    style="justify-content: space-between;align-items: center;  width: 98%;margin-left: 5px;">
                                    <div class=" d-flex flex-row" style="align-items: center;">

                                        <div class="d-flex flex-row justify-content-start status-indicator"
                                            :style="{ background: `${step.color}20` }">
                                            <div class="status-indicator-point" :style="{ background: step.color }">
                                            </div>
                                            <span>
                                                {{ step.name.length > 25 ? step.name.substring(0, 25) + '...'
                                                    :
                                                    step.name }}
                                            </span>
                                        </div>
                                    </div>
                                    <div style="display: flex;flex-direction: column;align-items: end;">
                                        <div class="step-date-text">{{ getStepDate(step.name) }}</div>
                                        <div class="step-message-count"
                                            style="position: absolute; font-size: 11px; color: #14202c; margin-top: 20px; cursor: pointer; display: flex; align-items: center; gap: 5px;"
                                            @click="toggleStepMessages(step.name)">
                                            <span>{{ countMessagesForStep(step.name) }} message(s)</span>
                                            <span v-if="countMessagesForStep(step.name) !== 0" :style="{
                                                display: 'inline-block',
                                                transition: 'transform 0.3s ease',
                                                transform: openedSteps.includes(step.name) ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }">▼</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="openedSteps.includes(step.name)" class="step-annotations"
                                style="margin-left: 25px; margin-top: 15px;">
                                <div v-for="(annotation, i) in enrichedAnnotations.filter(a => a.stepName === step.name)"
                                    :key="i"
                                    style="font-size: 11px; border: 1px solid #14202c; border-radius: 5px; padding: 6px; margin-bottom: 5px;">
                                    <strong>{{ annotation.userName || 'Non défini' }}</strong> – {{
                                        formatDate(annotation.date) }}<br />
                                    {{ annotation.message }}
                                </div>
                            </div>

                        </div> -->
                        <div v-for="timeLineItem in TimeLine"
                            :key="timeLineItem.step.staticId + '-' + timeLineItem.date" class="step-container"
                            style="padding-right: 4px;">
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
                                                {{ timeLineItem.step.name.length > 25 ?
                                                    timeLineItem.step.name.substring(0, 25) +
                                                    '...'
                                                    :
                                                    timeLineItem.step.name }}
                                            </span>
                                        </div>
                                    </div>
                                    <div style="display: flex;flex-direction: column;align-items: end;">
                                        <div class="step-date-text">{{ getLogDate(timeLineItem) }}</div>
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

                    <v-divider style="margin-top: 10px ;">
                    </v-divider>
                    <div v-if="isEditing" class="mb-1" style="width: 100%;height: 10%;">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start; align-items: center;">
                            <span
                                style="font-size: 0.75rem; color: #14202c; margin-right: 3px;margin-top: 5px;">Sélectionner
                                une
                                l'étape</span>
                            <div class="details-icon process"></div>
                        </div>

                        <!-- Dropdown for step selection -->
                        <v-select v-model="selectedStepName" :items="steps.map(s => s.name)" dense outlined
                            label="Sélectionner une étape" class="small-label"
                            style="width: 100%; font-size: 11px; margin-top: 1px;"></v-select>

                    </div>
                    <p v-if="isEditing && selectedStepName != '' && selectedStepName != null" style="font-size: 10px;
    margin-top: 2px;
    text-align: end;">
                        Le ticket sera déplacé de l'étape "<b>{{ detailedTicket.step.name }}</b>" à l'étape "<b>{{
                            selectedStepName }}</b>".
                    </p>
                </div>
                <v-divider vertical style="margin: 0px ;margin-left: 6px;margin-right: 10px;" class="hide-devider"
                    :style="{ backgroundColor: isEditing ? '#FFC107' : '' }">
                </v-divider>
                <div class="restofdetails-container-wrapper">
                    <!-- <div class="mb-1">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Titre</span>
                            <div class="details-icon titre">
                            </div>
                        </div>
                        <input class="details-input" type="text" :disabled="!isEditing" v-model="detailedTicket.name"
                            placeholder="Non défini" :class="{ 'editable': isEditing }"
                            style="width: 100%; font-size: 12px;padding: 4px 8px;" />
                    </div> -->
                    <div class="mb-1">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Element</span>
                            <div class="details-icon space">
                            </div>
                        </div>
                        <div class="details-input"
                            @click="onClickNavigate(detailedTicket.elementSelected.dynamicId, detailedTicket.elementSelected.name)"
                            style="width: 100%; font-size: 12px; padding: 4px 8px; color: grey; display: flex; align-items: center; cursor: pointer;">
                            <span style="color: rgb(101, 100, 179);">
                                {{ formattedLocation }}
                            </span>
                        </div>

                        <!-- <div class="details-input"
                            @click="onClickNavigate(detailedTicket.elementSelected.dynamicId, detailedTicket.elementSelected.name)"
                            style="width: 100%; font-size: 12px; padding: 4px 8px; color: grey; display: flex; align-items: center; cursor: pointer;">
                            <span style="color: rgb(101, 100, 179);">
                                {{ detailedTicket.buildingName }}
                            </span>
                            <template v-if="detailedTicket.elementSelected.position.floor">
                                /
                                <span
                                    v-if="detailedTicket.elementSelected.position.floor.name != detailedTicket.elementSelected.name"
                                    style="color: rgb(101, 100, 179);">
                                    {{ detailedTicket.elementSelected.position.floor.name }}
                                </span>
                                /
                                <span style=" color: rgb(101, 100, 179);">
                                    {{ detailedTicket.elementSelected.name }}
                                </span>
                            </template>
                        </div> -->
                    </div>
                    <!-- <div class="mb-1" style="width: 100%;">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Description</span>
                            <div class="details-icon description">
                            </div>
                        </div>
                        <textarea class="details-input" :disabled="!isEditing" v-model="detailedTicket.description"
                            placeholder="Non défini" :class="{ 'editable': isEditing }"
                            style="width: 100%; height: 80px; font-size: 12px; padding: 5px; resize: none; overflow: auto; text-align: left; line-height: 1.5;"></textarea>

                    </div> -->
                    <!-- <div class="mb-1">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Declarant</span>
                            <div class="details-icon declarant">
                            </div>
                        </div>
                        <div class="details-input" style="font-size: 12px; letter-spacing: -0.5px; line-height: 1.2;">
                            {{ detailedTicket.userName || "Système" }}
                        </div>
                    </div> -->
                    <v-divider style="margin: 10px 0px ;"></v-divider>
                    <div class="mb-1">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Workflow</span>
                            <div class="details-icon workflow">
                            </div>
                        </div>
                        <div class="details-input" style="font-size: 12px; letter-spacing: -0.5px; line-height: 1.2;">
                            {{ detailedTicket.workflowName }}
                        </div>
                        <!-- <v-select class="details-input" v-model="selectedWorkflow" :items="workflows"
                            label="Select Workflow" outlined dense :disabled="!isEditing"
                            style="font-size: 12px; color: grey;">
                        </v-select> -->
                    </div>
                    <div class="mb-1">
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Process</span>
                            <div class="details-icon process">
                            </div>
                        </div>
                        <div class="details-input" style="font-size: 12px; letter-spacing: -0.5px; line-height: 1.2;">
                            {{ detailedTicket.process.name }}
                        </div>
                        <!-- <v-select class="details-input" v-model="selectedProcess" :items="processes"
                            label="Select Process" outlined dense :disabled="!isEditing"
                            style="font-size: 12px;">
                        </v-select> -->
                    </div>
                    <div style="width: 100%; height: 200px;">
                        <!-- <div v-if="detailedTicket.file_list.length > 0" class="mt-4">
                            <div class="font-weight-bold my-3 downloadable">PIÈCES JOINTES</div>
                            <img v-for="(image, i) in images" :key="i" :src="image.src" class="pa-3 downloadable"
                                style="max-width: 100%; height: auto" />
                        </div> -->
                        <div class="d-flex flex-row align-items-center"
                            style="justify-content: start;align-items: center;">
                            <span v-if="detailedTicket.file_list && detailedTicket.file_list.length > 0"
                                style="font-size: 0.75rem;color: #14202c; margin-right: 3px;">Piéces jointes</span>
                            <div class="details-icon attachement">
                            </div>
                        </div>
                        <carousel-component
                            v-if="images_loaded && detailedTicket.file_list && detailedTicket.file_list.length > 0"
                            style="width: 100%;height: 100%;" :image_list="images"></carousel-component>
                    </div>
                </div>


            </v-card-text>
            <v-divider style="margin: 10px 0px ;" :style="{ backgroundColor: isEditing ? '#FFC107' : '' }"></v-divider>
            <v-card-actions style="height: 35px;width: 100%; padding: 0px!important;">
                <div class="button-row" style="width: 100%;">
                    <!-- Left button -->
                    <!-- <button style="width: 25%;" class="btn btn-delete" @click="deleteTicket">Refuser</button> -->
                    <div v-if="isEditing" class="mb-1" style="width: 49%;">
                        <!-- <div class="d-flex flex-row align-items-center"
                            style="justify-content: start; align-items: center;">
                            <span style="font-size: 0.75rem; color: #14202c; margin-right: 3px;">Ajouter une
                                note</span>
                            <div class="details-icon process"></div>
                        </div> -->

                        <!-- Text input for adding a note -->
                        <!-- <textarea v-model="newNote" placeholder="Écrire un commentaire..."
                            style="width: 100%; font-size: 12px; padding: 5px; resize: none; border: 1px solid #14202c; border-radius: 2px;border-style: dashed;"></textarea> -->
                        <div style="position: relative; width: 100%;">

                            <!-- Textarea -->
                            <textarea v-model="newNote" placeholder="Écrire un commentaire..."
                                style="width: 100%; font-size: 12px; padding: 5px 50px 5px 5px; resize: none; border: 1px solid #14202c; border-radius: 2px; border-style: dashed;">
                </textarea>
                            <!-- "Send" Button positioned inside -->
                            <div @click="addNote(newNote)" class="btn-send"
                                style="position: absolute; right: 5px; top: 5px; bottom: 5px; cursor: pointer; font-size: 12px;">
                            </div>
                        </div>

                    </div>
                    <div v-else style="width: 10px;height: 5px;background-color: transparent;opacity: 0;"></div>
                    <!-- Step selection control -->

                    <!-- Right buttons -->
                    <div class="btn-group" style="width: 40%;">
                        <button class="btn btn-archive" style="width: 50%;" v-if="!isEditing"
                            @click="archiveTicket">Archiver</button>
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

export default {
    components: { CarouselComponent },

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
        images: undefined,
        showPDF: false,
        PDFparts: [],
        loader_size: 100,
        isEditing: false,
        workflows: ["Workflow 1", "Workflow 2", "Workflow 3"],
        processes: ["Process 1", "Process 2", "Process 3"],

        selectedWorkflow: "",
        selectedProcess: "",
        selectedStep: "",
        selectedStepName: "",
        newNote: "",
        enrichedAnnotations: [],
        TimeLine: [],
        openedSteps: [],
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
        changeRoute(id, name) {
            const route = {
                'dynamicId': id,
                'name': name
            }
            this.$emit("changeRoute", route);
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
        // getToStep(logEvent) {
        //     const match = logEvent.match(/(?:from|to) (.+?) to (.+)/);
        //     return match ? match[2].trim() : null;
        // },

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

            if ((log.type !== "next") && (log.type !== "other")) return this.formatDate(log.date);
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
        },
        toggleEdit() {
            this.isEditing = !this.isEditing;
            if (this.isEditing) {
                // alert("Modification activée !");

            } else {

                this.modifyTicket(this.detailedTicket.name, this.detailedTicket.description, this.detailedTicket.priority);
                this.goToStep(this.selectedStepName).then(() => {
                    this.addNote(this.newNote).then(() => {
                        this.newNote = "";
                    });
                });
                if ((!this.newNote || this.newNote.trim() === "") &&
                    (this.selectedStepName === this.detailedTicket.step.name || !this.selectedStepName) &&
                    (this.detailedTicket.name === this.$props.detailedTicket.name) &&
                    (this.detailedTicket.description === this.$props.detailedTicket.description) &&
                    (this.detailedTicket.priority === this.$props.detailedTicket.priority)) {

                } else {
                    alert("Modification enregistrée !");
                    if (!(this.selectedStepName === this.detailedTicket.step.name || !this.selectedStepName)) {
                        this.$emit("reloadRequested");
                    }
                }

            }
        },
        countMessagesForStep(stepName) {
            return this.enrichedAnnotations.filter(a => a.stepName === stepName).length;
        },

        async addNote(note) {
            let buildingId = localStorage.getItem("idBuilding");
            if (!note || note.trim() === "") {
                return;
            }
            const res = await this.$store.dispatch("ADD_NOTE", {
                buildingId,
                ticketId: this.detailedTicket.dynamicId,
                data: {
                    note: note,
                }
            });
            this.newNote = "";
            if (res) {
                console.log("Note added successfully.");
            } else {
                console.error("Failed to add note.");
            }
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
        // console.log("mounted", this.detailedTicket, this.config);
        this.enrichedAnnotations = this.matchAnnotationsToSteps(
            this.detailedTicket.annotation_list,
            this.detailedTicket.log_list,
            this.steps
        );
        this.TimeLine = generateTimeline(this.steps, this.detailedTicket.log_list, this.detailedTicket.annotation_list);
        // this.openedSteps = this.generateOpenedStepsKeys();

        // console.log("timeline", this.TimeLine);
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
input.editable {
    border: 2px solid #fff;
    padding: 4px;
    margin-top: 4px;
    border-radius: 4px;
    width: 50% !important;
}

textarea.editable {
    color: #14202c;
    border: 2px solid #14202c;
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
    top: 38px;
    height: 20px;
    padding: 2px 20px;
    border-radius: 4px 4px 0px 0px;
}

.custom-scroll {
    scrollbar-width: thin;
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

@media (max-width: 1700px) {
    .step-date-text[data-v-3ac51c] {
        font-size: 11px;
        font-weight: 600;
    }

    .status-indicator[data-v-3ac51c] {
        font-size: 10px;
    }

    .status-indicator-point[data-v-3ac51c] {
        width: 8px;
        height: 8px;
    }

}

@media (max-width: 900px) {
    .hide {
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
    }
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