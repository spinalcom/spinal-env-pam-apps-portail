
<template>
  <div class="menu">
    <span class="menu-text" @click="toggleMenu">{{ formattedDate }}</span>
    <v-date-picker
      v-if="isActive"
      v-model="date"
      class="date-picker"
      first-day-of-week="1"
      color="#14202C"
      no-title
      locale="fr"
    ></v-date-picker>
    <div
      v-if="isActive"
      @click="toggleMenu"
      class="menu-overlay"
    ></div>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'Menu',
  props: ['text'],
  data: () => ({
    isActive: false,
    date: moment().format('YYYY-MM-DD'),
  }),
  computed: {
    formattedDate() {
      if (!this.date) return '';
      return moment(this.date).format('DD/MM/YYYY');
    },
  },
  mounted() {
    if (this.text && moment(this.text, 'DD/MM/YYYY', true).isValid()) {
      this.date = moment(this.text, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
  },
  methods: {
    toggleMenu() {
      this.isActive = !this.isActive;
    },
  },
  watch: {
    date() {
      this.$emit('input', this.date);
    },
  },
};
</script>

<style>
.menu {
  height: 30px;
  width: 160px;
  max-width: 160px;
}
.menu-text {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 100%;
  width: 100%;
}
.date-picker {
  position: absolute !important;
  top: 40px !important;
  left: -110px;
  width: fit-content !important;
  max-width: fit-content !important;
  border-radius: 10px !important;
  border: 1px solid #848484;
  box-shadow: -5px 3px 20px 1px #d9d9d933, -1px 16px 20px 13px #e7e7e724, 4px -6px 20px 2px #8989891f !important;
  z-index: 99;
}
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 98;
}
.v-date-picker-header__value button {
  font-weight: 400 !important;
}
</style>

