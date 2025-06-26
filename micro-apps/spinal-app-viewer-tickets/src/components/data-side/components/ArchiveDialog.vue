<template>
    <div v-if="show" class="custom-modal-overlay">
        <div class="custom-modal">
            <div class="custom-modal-header">
                <h3>Confirmer l'archivage</h3>
            </div>
            <div class="custom-modal-body">
                Êtes-vous sûr de vouloir archiver le ticket :
                <strong v-if="ticket">#{{ ticket.gmaoId }}</strong>
                <span v-if="ticket"> - "{{ ticket.name }}"</span>
            </div>
            <div style="width: 100%;">
                <div class="d-flex flex-row" style="justify-content: space-around;">
                    <div class="archive-btn-cancel" @click="$emit('cancel')">Annuler</div>
                    <div class="archive-btn-confirm" @click="$emit('confirm')">archiver</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        show: {
            type: Boolean,
            required: true,
        },
        ticket: {
            type: Object,
            default: null,
        },
    },
};
</script>

<style scoped>
/* Add your styles here if needed */
</style>