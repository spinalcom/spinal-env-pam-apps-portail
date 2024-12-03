
<template>
  <div class="side-bar" ref="sideBar">
    <div v-for="(ticket, index) in ticketList" :key="ticket.name + index" class="ticket">
      <Status :status="ticket.status"/>
      <span class="ellipsis">
        {{ ticket.name }}
      </span>
    </div>
  </div>
</template>

<script>
import Status from './Status.vue';
export default {
  name: 'SideBar',
  props: ['ticketList'],
  components: {
    Status
  },
  data: () => ({
    sideBarWidth: 0,
  }),
  mounted() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        this.sideBarWidth = entry.contentRect.width;
        this.$emit('resizedSideBar', this.sideBarWidth);
      }
    });

    this.resizeObserver.observe(this.$refs.sideBar);

  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
}
</script>

<style scoped>
.side-bar {
  position: sticky;
  top: 0;
  left: 0;
  background: white;
  height: 100%;
  width: 300px;
  z-index: 101;
  border-right: 1px solid #E2E2E2;
}

.ticket {
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #14202C;
  letter-spacing: 1.1px;
  padding: 0 10px;
  height: 30px;
  width: 100%;
  font-size: 12px;
  border-bottom: 1px solid #E2E2E2;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.ellipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>

