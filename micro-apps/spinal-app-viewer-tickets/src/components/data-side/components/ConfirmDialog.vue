<template>
    <v-dialog v-model="internalValue" width="500px" class="confirm-dialog">
        <v-card>
            <div :style="{ height: '5px', width: '100%', backgroundColor: typeColor }"></div>
            <div class="d-flex flex-row align-center" style="justify-content: space-between; padding: 20px 10px;">
                <div class="dialog-image" :class="dialogImageClass"></div>

                <div class="d-flex flex-column" style="width: 420px">
                    <v-card-title class="headtitle">{{ headline }}</v-card-title>
                    <v-card-text class="dialog-text" v-html="text"></v-card-text>
                </div>

            </div>
            <v-divider style="margin: 5px 0px;"></v-divider>

            <v-card-actions style="width: 100%; justify-content: end;">
                <!-- <v-spacer /> -->
                <v-btn class="secondary-btn" color="grey" text @click="cancel">Annuler</v-btn>
                <v-btn class="primary-btn" text @click="confirm"
                    :style="{ backgroundColor: typeColor, color: '#fff' }">{{ confirmLabel }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: "ConfirmDialog",
    props: {
        value: Boolean,
        headline: String,
        text: String,
        confirmLabel: {
            type: String,
            default: "Confirmer"
        },
        type: {
            type: String,
            default: "ticket" // or "modify", "attention"
        }
    },
    emits: ["input", "confirm", "cancel"],
    computed: {
        internalValue: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit("input", val);
            }
        },
        dialogImageClass() {
            switch (this.type) {
                case "modify":
                    return "modify";
                case "attention":
                    return "attention";
                default:
                    return "ticketnew";
            }
        },
        typeColor() {
            switch (this.type) {
                case "modify":
                    return "#FBC02D"; // Yellow
                case "attention":
                    return "#D32F2F"; // Red
                default:
                    return "#1976D2"; // Blue
            }
        }
    },
    methods: {
        confirm() {
            this.$emit("confirm");
            this.internalValue = false;
        },
        cancel() {
            this.$emit("cancel");
            this.internalValue = false;
        },

    },
    mounted() {
        console.log("Dialog type:", this.type);
    }
};
</script>
<style scoped>
.headtitle {
    font-size: 1.3rem !important;
    font-weight: bold !important;
    color: #14202c;
    padding: 0 !important;
    margin: 0 !important;
}

.dialog-text {
    font-size: 13px;
    color: #14202c;
    text-align: justify;
    padding: 0 !important;
    margin: 0 !important;
}

.dialog-image {
    width: 50px;
    height: 50px;
    /* background-image: url(../assets/ticketnew.svg); */
    background-position: center;
    background-size: 70%;
    border-radius: 50%;
    margin-right: 10px;
}

.ticketnew {
    background-image: url(../assets/ticketnew.svg);
}

.modify {
    background-image: url(../assets/modify.svg);
}

.attention {
    background-image: url(../assets/care.svg);
}

.v-card-title {
    font-weight: bold;
    font-size: 18px;
}

.v-card-text {
    font-size: 16px;
    color: #555;
}

.v-btn {
    text-transform: none;
}

.v-btn[color="grey"] {
    color: #14202c;
}

.v-btn[color="red darken-1"] {
    color: #fff;
}

.v-dialog__content {
    pointer-events: none;
    /* z-index: 6; */
    justify-content: center;
    align-items: start !important;
    width: 100%;
    height: 100%;
    transition: all .2s cubic-bezier(.25, .8, .25, 1), z-index 1ms;
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
}

.primary-btn {
    background-color: #14202c;
    color: #fff !important;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    text-transform: none;
    width: 150px;
}

.secondary-btn {
    background-color: #f5f5f5;
    color: #14202c !important;
    border-radius: 4px;
    border: #14202c 2px solid;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    text-transform: none;
    width: 150px;
}

.confirm-btn {
    position: relative;
    overflow: hidden;
    z-index: 0;
}

.confirm-btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    background-color: rgba(255, 0, 0, 0.15);
    /* Light red overlay for example */
    z-index: -1;
    transition: width 0.4s ease;
}

.confirm-btn:hover::before {
    width: 100%;
}
</style>