<template>
  <div class="selector-container">
    <div v-for="(profile, index) in profiles" :key="index" class="profile-item" @click="selectProfile(profile, index)">
      {{ profile }}
    </div>
    <div class="selected-background" :style="{ transform: `translateX(${selectedIndex * 160}px)` }"></div>
  </div>
</template>

<script>
export default {
  name: "ProfileSelector",
  props: {
    profiles: {
      type: Array,
      default: () => ["Regrouper les tickets", "Dégrouper les tickets"],
    },
  },
  data() {
    return {
      selectedIndex: 0,
    };
  },
  methods: {
    selectProfile(profile, index) {
      this.selectedIndex = index;
      this.$emit("profileSelected", index === 0); // `true` for "Regrouper", `false` for "Dégrouper"
    },
  },
};
</script>


<style scoped>
.selector-container {
  width: 320px;
  height: 38px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  background-color: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.profile-item {
  width: 140px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  z-index: 2;
}

.selected-background {
  width: 150px;
  height: 28px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  position: absolute;
  top: 5;
  left: 5px;
  transition: transform 0.3s ease;
  z-index: 1;
}
</style>