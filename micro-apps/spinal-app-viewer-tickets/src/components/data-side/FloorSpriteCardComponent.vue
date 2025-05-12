<template>
  <div v-if="isOpen" class="floor-sprite-card-container">
    <div @click="close" class="sprite-card-close">X</div>
    <div class="floor-card-card">
      <div class="header">
        <div style="width: 70%;display: flex;flex-direction: column; align-items: start;">
          <p style="font-size: 15px;font-weight: bold;margin-bottom: 1px;margin-top: 3px;">{{ data.floorName }}</p>
          <p class="ticket-total">Total De Ticket : {{ totalTickets }}</p>
        </div>
        <div @click="changeSpaceSelectorValue" class="select-btn"></div>
      </div>

      <div class="ticket-info">
        <div class="ticket-item">
          <div class="floor-count-holder">
            <span class="ticket-count">{{ data.countFloorTickets }}</span>
          </div>
          <p style="font-size: 12px;">Tickets sur l’étage</p>
          <!-- <div class="icon">⬛</div> -->
        </div>
        <div class="divider"></div>
        <div class="ticket-item">
          <div class="floor-count-holder" style="border-radius: 50%;">
            <span class="ticket-count" style="margin-top: 1px;">{{ data.countRoomTickets }}</span>
          </div>
          <p style="font-size: 12px;">Tickets sur salles</p>
        </div>
        <div class="divider"></div>
        <div class="ticket-item">

          <div class="outer-triangle">
            <div class="inside-triangle">
              <span class="ticket-count" style="margin-top: 2px;">{{ data.countObjectTickets }}</span>
            </div>
          </div>

          <p style="font-size: 12px;">Tickets d’équipements</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from "../SpaceSelector/eventBus";
export default {

  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isOpen: true,
    };
  },
  mounted() {
  },
  computed: {

    totalTickets() {
      return (
        (this.data.countFloorTickets || 0) +
        (this.data.countRoomTickets || 0) +
        (this.data.countObjectTickets || 0)
      );
    },
  },
  methods: {
    close() {
      this.isOpen = false;
    },
    changeSpaceSelectorValue() {
      EventBus.$emit("change-space-selecor-value", this.data);
    },
  },
};
</script>

<style scoped>
.floor-sprite-card-container {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 280px;
  height: 180px;
  color: #14202c;
  padding: 10px;
  /* top: 90px; */
  /* left: 50%; */
}

.sprite-card-close {
  position: absolute;
  top: -8px;
  right: -10px;
  background-color: #14202c;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.floor-card-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 30%;
}


.ticket-total {
  color: gray;
  font-size: 14px;
  margin-bottom: 0 !important;
}

.select-btn {
  background-color: #14202c;
  color: white;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-image: url('./assets/open-new-white.svg');
  background-size: 90%;
  background-repeat: no-repeat;
  background-position: center;
}

.select-btn:hover {
  width: 22px;
  height: 22px;
  margin-top: -1px;
  margin-left: -1px;
}

.ticket-info {
  flex-direction: row;
  justify-content: space-between;
  height: 65%;
  display: flex;
  align-items: center;
}

.ticket-item {
  text-align: center;
  flex: 1;
  overflow: hidden;
  padding: 0px 5px;
}

.ticket-count {
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
}

.icon {
  font-size: 18px;
  margin-top: 4px;
}

.divider {
  width: 3px;
  background-color: #14202c;
  height: 80%;
}

.floor-count-holder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  font-weight: bold;
  border: 5px solid #14202c;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
}

.outer-triangle {
  background: rgb(20, 32, 44);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  width: 30px;
  height: 30px;
  border: 5px solid #14202c;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
}

.inside-triangle {
  border: 2px solid white;
  color: #14202c;
  text-align: center;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  background: #fff;
  width: 26px;
  height: 24px;
  margin-top: 1px;
  padding-top: 5px;
}
</style>
