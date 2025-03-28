<template>
  <div>
    <!-- Chip pour la sélection personnalisée -->
    <v-chip
      class="time-chip"
      @click="openCustomDialog"
    >
    Sélectionner une période
    </v-chip>
    
    <!-- Dialog pour sélection personnalisée -->
    <v-dialog v-model="showCustomDialog" max-width="400px" class="custom-dialog">
        <v-card>
        <v-card-title class="headline">Personnaliser la plage horaire</v-card-title>
        <v-card-text>
          <div class="custom-time-section">
            <v-menu ref="startMenu" v-model="startMenu" :close-on-content-click="false" offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="tempStartTime"
                  label="Heure de début"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-time-picker v-model="tempStartTime" format="24hr" @click:minute="startMenu = false" />
            </v-menu>
  
            <v-menu ref="endMenu" v-model="endMenu" :close-on-content-click="false" offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="tempEndTime"
                  label="Heure de fin"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-time-picker v-model="tempEndTime" format="24hr" @click:minute="endMenu = false" />
            </v-menu>
          </div>
        </v-card-text>
  
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="cancelCustomTime">Annuler</v-btn>
                  <v-btn class="custom-btn" @click="validateCustomTime" :disabled="!isValidTimeRange">Appliquer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
  export default {
    name: "TimeFilter",
  
    data: () => ({
      showCustomDialog: false,
      localStartTime: "00:00",
      localEndTime: "23:59",
      tempStartTime: "00:00",
      tempEndTime: "23:59",
      startMenu: false,
      endMenu: false,
    }),
  
    computed: {
      isValidTimeRange() {
        return this.tempStartTime < this.tempEndTime;
      },
    },
  
    methods: {
      openCustomDialog() {
        this.tempStartTime = this.localStartTime;
        this.tempEndTime = this.localEndTime;
        this.showCustomDialog = true;
      },
  
      validateCustomTime() {
        if (this.isValidTimeRange) {
          this.localStartTime = this.tempStartTime;
          this.localEndTime = this.tempEndTime;
          this.showCustomDialog = false;
          this.$emit("time-change", {
            startTime: this.localStartTime,
            endTime: this.localEndTime,
          });
        }
      },
  
      cancelCustomTime() {
        this.showCustomDialog = false;
      },
    },
  };
  </script>
  
  <style scoped>
  .time-chip {
    margin-left: 100px;
    transition: all 0.3s ease;
    background-color: var(--v-primary-base);
    color: white;
    cursor: pointer;
  }
  
  .custom-time-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .v-text-field {
    width: 100%;
  }
  .custom-btn {
  background-color: #2749cf !important; 
  color: white !important;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.custom-btn:hover {
  background-color: #2749cf !important; 
}

.custom-btn:disabled {
  background-color: #2749cf !important; 
  opacity: 0.6; 
  cursor: not-allowed;
}
.custom-dialog .v-card {
  background-color: #f0f8ff; /* Couleur de fond personnalisée (bleu clair) */
  color: #000; /* Couleur du texte */
  border-radius: 12px; /* Coins arrondis */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Ombre */
}

/* Style pour le titre du dialogue */
.custom-dialog .v-card-title {
  background-color: #2749cf; /* Vert */
  color: white; /* Texte blanc */
  font-weight: bold;
  text-align: center;
}

/* Style pour le texte du dialogue */
.custom-dialog .v-card-text {
  background-color: #ffffff; /* Blanc */
  color: #333; /* Texte gris foncé */
  padding: 16px;
  border-radius: 8px;
}

/* Style pour les actions (boutons) */
.custom-dialog .v-card-actions {
  background-color: #f9f9f9; /* Gris clair */
  padding: 8px 16px;
}
  </style>