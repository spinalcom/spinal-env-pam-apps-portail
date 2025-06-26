<template class="spinal-scrollbar">
    <div>
        <v-card class="table-container spinal-scrollbar">

            <v-simple-table>
                <thead>
                    <tr>
                        <th style="width: 13%;">
                            <div class="d-flex flex-row"
                                style="justify-content: start; align-items: center; background-color: #F6F7F9;"
                                @click="changeSort('priority')">
                                <div class="prio-header">Priorité</div>
                                <div>#ID</div>
                                <div class="sort-icon" :class="{
                                    'sort-icon-asc': sortKey === 'priority' && sortOrder === 'asc',
                                    'sort-icon-desc': sortKey === 'priority' && sortOrder === 'desc',
                                    'sort-icon-default': sortKey !== 'priority'
                                }"></div>
                            </div>
                        </th>
                        <th style="width: 16%;" @click="changeSort('lastModifDate')">
                            <div style="width: 100%; display: flex; flex-direction: row;align-items: center;">
                                <div>Créé / Modifié le</div>
                                <div class="sort-icon" :class="{
                                    'sort-icon-asc': sortKey === 'lastModifDate' && sortOrder === 'asc',
                                    'sort-icon-desc': sortKey === 'lastModifDate' && sortOrder === 'desc',
                                    'sort-icon-default': sortKey !== 'lastModifDate'
                                }"></div>
                            </div>
                        </th>
                        <th style="width: 36%;" @click="changeSort('name')">
                            <div style="width: 100%; display: flex; flex-direction: row;">
                                <div>Libellé</div>
                                <div class="sort-icon" :class="{
                                    'sort-icon-asc': sortKey === 'name' && sortOrder === 'asc',
                                    'sort-icon-desc': sortKey === 'name' && sortOrder === 'desc',
                                    'sort-icon-default': sortKey !== 'name'
                                }"></div>
                            </div>
                        </th>

                        <th style="width: 22%;" @click="changeSort('step.name')">
                            <div style="width: 100%; display: flex; flex-direction: row;">
                                <div>Étape</div>
                                <div class="sort-icon" :class="{
                                    'sort-icon-asc': sortKey === 'step.name' && sortOrder === 'asc',
                                    'sort-icon-desc': sortKey === 'step.name' && sortOrder === 'desc',
                                    'sort-icon-default': sortKey !== 'step.name'
                                }"></div>
                            </div>
                        </th>
                        <th style="width: 13%; text-align: center;">Actions</th>
                    </tr>
                </thead>

                <tbody class="ticket-table-body">
                    <tr v-for="(ticket, index) in sortedData" :data-id="ticket.dynamicId" :key="index"
                        @click="handleClickOfLocate(ticket)" :class="{
                            'selected-ticket-item': selectedTicket && ticket.dynamicId === selectedTicket.dynamicId,
                            'first-selected': selectedIds.length > 0 && ticket.dynamicId === firstVisibleSelectedId,
                            'last-selected': selectedIds.length > 0 && ticket.dynamicId === lastVisibleSelectedId,
                            'is-single-selected': selectedIds.length === 1 && ticket.dynamicId === selectedIds[0],
                            'middle-selected': selectedIds.length > 2 &&
                                ticket.dynamicId !== firstVisibleSelectedId &&
                                ticket.dynamicId !== lastVisibleSelectedId &&
                                selectedIds.includes(ticket.dynamicId)
                        }">

                        <td style="width: 13%;">
                            <div class="d-flex flex-row row-style">
                                <div class="priority-indicator"
                                    :style="{ background: getPriorityColor(ticket.priority) }">
                                </div>
                                <div :style="{ fontWeight: ticket.step.order === 0 ? 'bold' : 'normal' }">
                                    #{{ ticket.gmaoId }}</div>
                            </div>
                        </td>
                        <td style="width: 16%;">{{ formatDate(ticket.lastModifDate) }}</td>
                        <!-- <td style="width: 16%;">
                            {{ ticket.log_list && ticket.log_list.length > 1
                                ? formatDate(ticket.log_list[ticket.log_list.length - 1].date)
                                : formatDate(ticket.creationDate) }}
                        </td> -->
                        <td style="width: 36%;">
                            <div class="d-flex flex-row ">
                                <div v-if="ticket.elementSelected.type === 'geographicRoom'"
                                    :style="{ background: getPriorityColor(ticket.priority) }"
                                    style="margin-right:5px; width: 12px;height: 12px;border-radius: 50%;align-items: center;justify-content: center;"
                                    class="d-flex flex-row">
                                    <div style="background-color: #fff; width: 8px;height: 8px;border-radius: 50%;">
                                    </div>
                                </div>
                                <div v-else-if="ticket.elementSelected.type === 'geographicFloor'"
                                    :style="{ background: getPriorityColor(ticket.priority) }"
                                    style="margin-right:5px; width: 12px;height: 12px;align-items: center;justify-content: center;"
                                    class="d-flex flex-row">
                                    <div style="background-color: #fff; width: 8px;height: 8px;"></div>
                                </div>
                                <div v-else-if="ticket.elementSelected.type === 'geographicBuilding'"
                                    :style="{ background: getPriorityColor(ticket.priority) }"
                                    style="margin-right:5px; width: 12px;height: 12px;align-items: center;justify-content: center;"
                                    class="pentagon-border-table">
                                    <div style="background-color: #fff; width: 8px;height: 8px;"
                                        class="pentagon-himself-table"></div>
                                </div>
                                <div v-else class="triangle-outer"
                                    :style="{ background: getPriorityColor(ticket.priority) }">
                                    <div class="triangle-inner"></div>
                                </div>
                                <div class="ticket-name-data" style="margin-bottom: 3px;"
                                    :style="{ fontWeight: ticket.step.order === 0 ? 'bold' : 'normal' }">
                                    {{ ticket.name.length > 25 ? ticket.name.substring(0, 25) + '...' :
                                        ticket.name }}</div>
                            </div>
                            <div class="process-type-data">{{ ticket.process.name }}</div>
                        </td>
                        <td style="width: 22%;">
                            <div class="d-flex flex-row justify-content-start status-indicator"
                                :style="{ background: `${ticket.step.color}20` }">
                                <div class="status-indicator-point" :style="{ background: ticket.step.color }"></div>
                                <span>
                                    {{ ticket.step.name.length > 15 ? ticket.step.name.substring(0, 15) + '...' :
                                        ticket.step.name }}
                                </span>
                            </div>
                        </td>
                        <td style="width: 13%;">
                            <div class="d-flex flex-row" style="justify-content: space-around;align-items: center;">
                                <div @click="handleClickOfDetails(ticket)" class="action-button">
                                    <div class="action-icon"></div>
                                    <!-- <div cla1ss="action-text">Details</div> -->
                                    <!-- <div v-if="config !== 'Admin'" cla1ss="action-text">Details</div> -->
                                </div>
                                <div @click="isolateElement(ticket)" class="action-button"
                                    title="Centrer la vue sur l’élément associé">
                                    <div class="more-action-icon"></div>
                                </div>
                            </div>
                        </td>

                    </tr>
                </tbody>
            </v-simple-table>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Vue, Prop, Watch } from "vue-property-decorator";
import Component from "vue-class-component";
import { EventBus } from '../../SpaceSelector/eventBus';

@Component({
    name: "TicketTable",
})
class TicketTable extends Vue {
    @Prop({ required: true }) data!: Array<any>;
    @Prop({ required: false }) config!: any;
    @Prop({ required: false }) isGroup!: boolean;

    localData: Array<any> = [];


    sortKey: string = ""; // Column being sorted
    sortOrder: "asc" | "desc" = "asc"; // Sorting order
    isSearchActive: boolean = false; // Search state
    searchQuery: string = ""; // Search query
    selectedTicket: any = null;
    selectedIds: Array<number> = [];

    // showArchiveDialog: boolean = false;
    ticketToArchive: any = null;


    // Maps priority to color
    getPriorityColor(priority: number): string {
        const colors = ["red", "orange", "green"];
        return colors[priority] || "gray";
    }

    get filteredData() {
        const searchQueryLower = this.searchQuery.toLowerCase();
        return this.localData.filter((ticket) =>
            ticket.name.toLowerCase().includes(searchQueryLower)
        );
    }

    activateSearch() {
        this.isSearchActive = true;
    }

    resetSearch() {
        this.isSearchActive = false;
        this.searchQuery = "";
    }
    handleSearch() {
        // Filter logic is handled by the computed property
    }

    // Formats the creation date
    formatDate(timestamp: number | string): string {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "—"; // fallback for invalid dates

        const currentYear = new Date().getFullYear();
        const options: Intl.DateTimeFormatOptions = {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };

        if (date.getFullYear() !== currentYear) {
            options.year = "numeric";
        }

        return date.toLocaleDateString("fr-FR", options);
    }
    get sortedData() {
        if (!this.sortKey) return this.localData;

        return [...this.localData].sort((a, b) => {
            const valueA = this.getNestedValue(a, this.sortKey);
            const valueB = this.getNestedValue(b, this.sortKey);

            if (valueA < valueB) return this.sortOrder === "asc" ? -1 : 1;
            if (valueA > valueB) return this.sortOrder === "asc" ? 1 : -1;
            return 0;
        });
    }


    // Change the sorting key and order
    changeSort(key: string) {
        if (this.sortKey === key) {
            this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
        } else {
            this.sortKey = key;
            this.sortOrder = "asc";
        }
    }

    // Helper method for nested properties
    getNestedValue(object: any, key: string): any {
        return key.split('.').reduce((o, k) => (o || {})[k], object);
    }

    moveTicketsToTop(ticketsToMove: Array<any>) {
        this.resetTickets();
        this.selectedIds = [];
        this.selectedIds = ticketsToMove.map(ticket => ticket.dynamicId);

        // Separate the tickets to move from the rest
        const selectedTickets = this.localData.filter(ticket => this.selectedIds.includes(ticket.dynamicId));
        const remainingTickets = this.localData.filter(ticket => !this.selectedIds.includes(ticket.dynamicId));


        // Update localData with selected tickets on top
        this.localData = [...selectedTickets, ...remainingTickets];

        // Mark all selected tickets
        this.selectedTicket = null;  // Clear any existing selection
        this.selectedTicket = selectedTickets[0];  // Select the first ticket
        selectedTickets.forEach(ticket => {
            this.$set(ticket, 'isSelected', true);
        });
        EventBus.$emit("call-card", selectedTickets[0]);
    }
    resetTickets() {
        // this.localData = [...this.data]; // Reset localData to the original prop value

        // Clear the selected tickets
        this.selectedTicket = null;
        this.selectedIds = [];
        this.localData.forEach(ticket => {
            this.$set(ticket, 'isSelected', false);
        });
    }

    nextCardTable(ticket: any) {
        const currentIndex = this.localData.findIndex(t => t.dynamicId === ticket.dynamicId);
        if (currentIndex !== -1 && currentIndex < this.localData.length - 1) {
            this.setSelectedTicket(this.localData[currentIndex]);
        }
    }

    prevCardTable(ticket: any) {
        const currentIndex = this.localData.findIndex(t => t.dynamicId === ticket.dynamicId);
        if (currentIndex > 0) {
            this.setSelectedTicket(this.localData[currentIndex]);
        }
    }

    // Helper function to set the selected ticket
    setSelectedTicket(ticket: any) {
        // this.localData.forEach(t => {
        //     this.$set(t, 'isSelected', false);
        // });

        this.selectedTicket = ticket;
        // this.$set(ticket, 'isSelected', true);

        // Emit event if needed
        // this.$emit("locate", ticket);
    }



    get firstVisibleSelectedId() {
        const first = this.localData.find(ticket => this.selectedIds.includes(ticket.dynamicId));
        return first ? first.dynamicId : null;
    }

    get lastVisibleSelectedId() {
        const reversed = [...this.localData].reverse();
        const last = reversed.find(ticket => this.selectedIds.includes(ticket.dynamicId));
        return last ? last.dynamicId : null;
    }

    mounted() {
        const ala = this.data.filter(ticket => ticket.elementSelected.type === 'geographicFloor');
        console.log("Filtered TicketTable mounted", ala);
        EventBus.$on("move-tickets-top", this.moveTicketsToTop);
        EventBus.$on("move-tickets-to-selected", this.moveTicketsToSelectedTicket);
        EventBus.$on("reset-tickets", this.resetTickets);
        EventBus.$on("next-card-table", this.nextCardTable);
        EventBus.$on("prev-card-table", this.prevCardTable);
        this.localData = [...this.data];
    }
    beforeDestroy() {
        EventBus.$off("move-tickets-top", this.moveTicketsToTop);
        EventBus.$off("move-tickets-to-selected", this.moveTicketsToSelectedTicket);
        EventBus.$on("reset-tickets", this.resetTickets);
        EventBus.$off("next-card-table", this.nextCardTable);
        EventBus.$off("prev-card-table", this.prevCardTable);

    }

    handleClickOfDetails(ticket: any) {
        this.$emit("display", ticket);
    }
    async isolateElement(ticket: any) {
        if (!ticket || !ticket.elementSelected || !ticket.elementSelected.dynamicId) return;
        try {
            await this.$store.dispatch("FIT_TO_VIEW_ITEMS", {
                dynamicId: ticket.elementSelected.dynamicId
            });
        } catch (error) {
            console.error("Erreur lors du centrage de l’élément :", error);
        }
    }

    // moveTicketsToSelectedTicket(ticketsToMove: Array<any>) {
    //     this.resetTickets();
    //     this.selectedIds = [];
    //     this.selectedIds = ticketsToMove.map(ticket => ticket.dynamicId);

    // }
    moveTicketsToSelectedTicket(ticketsToMove: Array<any>) {

        if (!this.selectedTicket) return;
        if (this.selectedIds.includes(this.selectedTicket.dynamicId)) {
            this.nextCardTable(this.selectedTicket);
            // this.$emit("locate", ticket);
            return;
        }

        const selectedTicketId = this.selectedTicket.dynamicId;
        const moveIds = ticketsToMove.map(t => t.dynamicId);

        // Clear all selections
        this.localData.forEach(ticket => {
            this.$set(ticket, 'isSelected', false);
        });

        // Find index of the selected ticket
        const selectedIndex = this.localData.findIndex(t => t.dynamicId === selectedTicketId);
        if (selectedIndex === -1) return;

        // Remove ticketsToMove from current localData
        const remainingTickets = this.localData.filter(t => !moveIds.includes(t.dynamicId));

        // Mark ticketsToMove as selected
        // Mark ticketsToMove as selected
        const movedTickets = ticketsToMove.map(t => {
            let lastModifDate = t.lastModifDate;

            // Recalculate if missing or invalid
            if (!lastModifDate || isNaN(new Date(lastModifDate).getTime())) {
                if (t.log_list && t.log_list.length > 1) {
                    lastModifDate = t.log_list[t.log_list.length - 1].date;
                } else {
                    lastModifDate = t.creationDate;
                }
            }

            return {
                ...t,
                isSelected: true,
                lastModifDate: lastModifDate, // Make sure it's a number
            };
        });

        // Insert movedTickets just after selectedTicket
        const newData = [
            ...remainingTickets.slice(0, selectedIndex),
            ...movedTickets,
            ...remainingTickets.slice(selectedIndex),
        ]

        // Update state
        this.localData = newData;
        this.selectedIds = moveIds;

        // Emit or handle anything else if needed
    }

    handleClickOfLocate(ticket: any) {
        if (this.selectedIds.includes(ticket.dynamicId)) {
            this.nextCardTable(ticket);
            this.$emit("locate", ticket);
            return;
        }
        this.localData.forEach(ticket => {
            this.$set(ticket, 'isSelected', false);
        });
        this.selectedTicket = ticket;
        if (ticket.elementSelected.type === 'geographicFloor' || ticket.elementSelected.type === 'geographicBuilding') {
            // if (!this.isGroup) {
            //     this.selectedIds = [ticket.dynamicId];
            // }
            console.log("TicketTable handleClickOfLocate", ticket);
        }
        // if (!this.selectedIds.includes(ticket.dynamicId)) {
        //     this.selectedIds = [ticket.dynamicId];
        // }
        this.$emit("locate", ticket);
    }
    @Watch('data', { immediate: true, deep: true })
    onDataChange(newData) {
        // Preserve selected state
        const selectedIds = new Set(this.localData.filter(t => t.isSelected).map(t => t.dynamicId));

        // Merge new data while keeping selections
        let updatedData = newData.map(ticket => ({
            ...ticket,
            isSelected: selectedIds.has(ticket.dynamicId),
        }));

        // Move selected tickets to the top
        this.localData = [
            ...updatedData.filter(ticket => ticket.isSelected),
            ...updatedData.filter(ticket => !ticket.isSelected),
        ];
        // this.localData = this.localData.map(existingTicket => {
        //     const newTicket = newData.find(t => t.dynamicId === existingTicket.dynamicId);
        //     return newTicket ? { ...newTicket, isSelected: selectedIds.has(newTicket.dynamicId) } : existingTicket;
        // });

        // // Append any new tickets that were not already in localData
        // const newTickets = newData.filter(ticket => !this.localData.some(t => t.dynamicId === ticket.dynamicId));
        // this.localData = [...this.localData, ...newTickets];
    }
    @Watch('selectedTicket', { immediate: true })
    onSelectedTicketChange(newTicket) {
        this.$nextTick(() => {
            // First remove all `.is-single` classes
            const allSelected = Array.from(this.$el.querySelectorAll('.selectedTicket-class'));
            console.log("allSelected", allSelected);
            allSelected.forEach(el => el.classList.remove('is-single'));

            // Then, if there's exactly one selected, mark it
            if (allSelected.length === 1) {
                allSelected[0].classList.add('is-single');

            }

            // Keep your scroll logic
            if (newTicket) {
                const selectedRow = this.$el.querySelector(
                    `tr[data-id="${newTicket.dynamicId}"]`
                );
                if (selectedRow) {
                    selectedRow.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }
        });
    }


}

export { TicketTable };
export default TicketTable;
</script>


<style scoped>
.table-container {
    overflow-y: auto;
    overflow-x: hidden;
}

.sort-icon {
    background-color: white;
    width: 10px;
    height: 10px;
    margin-left: 5px;
    margin-top: 2px;
    cursor: pointer;
    transition: transform 0.3s;
    background-size: 250%;
    background-repeat: no-repeat;
    background-position: center;
}

.sort-icon-asc {
    background-image: url(../assets/sort-active.svg);
    transform: rotate(90deg);
    font-weight: bold;
}

.sort-icon-desc {
    background-image: url(../assets/sort-active.svg);
    transform: rotate(270deg);
    font-weight: bold;
}

.sort-icon-default {
    background-image: url(../assets/sort.svg);
    transform: rotate(-90deg);
    font-weight: normal;
}

.prio-header {
    margin-right: 5px;
    padding: 5px;
    background-color: rgba(232, 65, 65, 0.19);
    color: rgb(232, 65, 65);
    height: 23px;
    border-radius: 5px;
}

.priority-indicator {
    border-radius: 3px;
    width: 9px;
    height: 24px;
    margin-right: 5px;
    display: inline-block;
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

.icon-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.search-input {
    width: 100%;
    border: 1px solid #ddd;
    padding: 5px;
    border-radius: 4px;
    font-size: 12px;
}

.search-icon {
    width: 15px;
    height: 15px;
    background-image: url(../assets/seach.svg);
    background-size: cover;
    cursor: pointer;
}

.close-icon {
    width: 15px;
    height: 15px;

    /* background-image: url(../assets/close.svg); */
    /* background-image: url("../assets/close.svg"); */
    background-size: cover;
    cursor: pointer;
    margin-left: 5px;
}

.row-style {
    align-items: center;
}

td,
th {
    font: normal normal normal 11px/13px Charlevoix Pro;
    border-bottom: 0 !important;
    border: 0.5px solid #0000001f !important;
    padding: 10px 10px !important;
    font-size: 11px !important;
}

th {
    background-color: #F6F7F9;
}

.process-type-data {
    color: #14202c65;
    opacity: 1;
    font-size: 10px;
}

.ticket-name-data {
    font-size: 13px;
    color: #14202c;
}

.action-icon {
    margin-right: 2px;
    width: 15px;
    height: 15px;
    color: #14202c;
    background-image: url("../assets/eye.svg");
    background-size: 70%;
    background-position: center;
    background-repeat: no-repeat;
}

.more-action-icon {
    margin-right: 2px;
    width: 15px;
    height: 15px;
    color: #14202c;
    background-image: url(../assets/expand.svg);
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;
}

.action-text {
    font-size: 12px;
    color: #fff;
}

.action-button {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    /* width: 80%; */
    padding: 5px;
    border-radius: 5px;
    background-color: #14202c;
    color: #f4f4f4;
    font-size: 10px;
    font-weight: 500;
    transition: all 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* .spinal-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #14202c transparent;
    overflow: hidden !important;
} */

.spinal-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background: #14202c15 !important;
}

.spinal-scrollbar::-webkit-scrollbar-thumb {
    -webkit-border-radius: 5px;
    border-radius: 5px;
    background: #14202c !important;
}

.spinal-scrollbar::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
    -webkit-border-radius: 5px;
    border-radius: 5px;
}

.pentagon-border-table {
    clip-path: polygon(50% 0%, 100% 35%, 85% 100%, 15% 100%, 0% 35%);
    display: flex;
    justify-content: center;
    align-items: center;
}

.pentagon-himself-table {
    clip-path: polygon(50% 0%, 100% 35%, 85% 100%, 15% 100%, 0% 35%);
    margin-top: 0.5px;
}

.first-selected {
    box-shadow:
        inset 0 1px 0 0 #3390ff,
        inset 1px 0 0 0 #3390ff,
        inset -1px 0 0 0 #3390ff !important;
}

.last-selected[data-v-d18163] {
    box-shadow:
        inset 0 -1px 0 0 #3390ff,
        /* bottom */
        inset 1px 0 0 0 #3390ff,
        /* left */
        inset -1px 0 0 0 #3390ff !important;
    /* right */
}

.middle-selected[data-v-d18163] {
    box-shadow:
        inset 1px 0 0 0 #3390ff,
        inset -1px 0 0 0 #3390ff !important;
}

.is-single-selected[data-v-d18163] {
    box-shadow:
        inset 0 1px 0 0 #3390ff,
        /* top */
        inset 0 -1px 0 0 #3390ff,
        /* bottom */
        inset 1px 0 0 0 #3390ff,
        /* left */
        inset -1px 0 0 0 #3390ff !important;

    /* right */
}

.selected-ticket-item {
    /* background-color: rgba(0, 0, 255, 0.1); */
    background-color: #3390ff41;
    /* Light blue with low opacity */
}


.triangle-outer {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    width: 12px;
    height: 11px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 5px;
}

.triangle-inner {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    width: 7px;
    height: 7px;
    background-color: #fff;
    margin-top: 1px;
}

.custom-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(20, 32, 44, 0.6);
    /* dark overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.custom-modal {
    color: #14202c;
    background-color: #fff;
    border-radius: 8px;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    width: 470px;
    height: 250px;
    padding: 20px;
    display: flex;
    box-shadow: 0 8px 16px #0003;
}

.custom-modal-header h3 {
    margin: 10px 0;
    font-size: 20px;
    display: flex;
    align-items: start;
    justify-content: start;
}

.custom-modal-body {
    font-size: 16px;
    line-height: 1.7;
}

.archive-btn-cancel {
    height: 40px;
    width: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: #14202c solid 2px;
    border-radius: 5px;
    cursor: pointer;
}

.archive-btn-confirm {
    height: 40px;
    width: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #14202c;
    border-radius: 5px;
    cursor: pointer;
    color: white;
}

@media (max-width: 1500px) {
    .ticket-table-body {
        font-size: 10px !important;
    }
}
</style>
