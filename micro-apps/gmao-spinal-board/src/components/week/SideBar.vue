
<template>
  <div class="side-bar" ref="sideBar"
    :style="[
    { width: sidebarWidth + 'px !important'},
    ]">
    <div class="sidebar-resize"
      :style="[
      { 'cursor': isResizing ? 'ew-resize !important' : 'normal'},
      { 'border-right': isResizing ? '2px solid grey' : '1px solid #E2E2E2'},
      ]"
      @mousedown="startresize">
    </div>
    <div
      v-for="(ticket, index) in ticketList"
      :key="ticket.name + index"
      :style="[
        { 'font-size': fontSize.medium + 'px' },
        { height: taskHeight + 'px' },
      ]"
      class="ticket">
      <!-- STATUS COMPONENT -->
      <Status 
        :fontSize="fontSize"
        :status="ticket.status"
        />
      <span class="ellipsis">
        {{ ticket.name }}
      </span>
      <div
        v-if="fallingIn(ticket.startDate)"
        :style="[
          { height: (taskHeight - 5) + 'px' },
        ]"
        class="goto-ticket"
        @click="bringDay(ticket, fallingIn(ticket.startDate))">
        <v-icon 
          :style="[{ 'font-size': fontSize.medium + 'px' }]"
          class="goto-icon icon">
          {{ fallingIn(ticket.startDate) }}
        </v-icon>
      </div>
    </div>
  </div>
</template>

<script>
import { throttle } from 'lodash';
import moment from 'moment';
moment.locale('fr');
import Status from './Status.vue';
export default {
  name: 'SideBar',
  props: [
    'ticketList',
    'viewPortEdges',
    'dayWidth',
    'taskHeight',
    'fontSize',
  ],
  components: {
    Status
  },
  data: () => ({
    sidebarWidth: 300,
    endOfResizeWidth: 300,
    startX: 0,
    isResizing: false,
  }),
  mounted() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const contentRect = entry.contentRect.width;
        this.$emit('resizedSideBar', this.sidebarWidth);
      }
    });

    this.resizeObserver.observe(this.$refs.sideBar);
  },
  methods:{
    startresize: throttle( function (event) {
      this.startX = event.clientX;
      this.isResizing = true;
      window.addEventListener('mousemove', this.resizeSidebar);
      window.addEventListener('mouseup', this.stopResize);
    }, 10),
    resizeSidebar(event) {
      this.sidebarWidth = this.endOfResizeWidth + event.clientX - this.startX;
      if (this.sidebarWidth <= 42) {
        this.sidebarWidth = 42;
      }
    },
    stopResize(event) {
      this.endOfResizeWidth = this.sidebarWidth;
      this.isResizing = false;
      window.removeEventListener('mousemove', this.resizeSidebar);
      window.removeEventListener('mouseup', this.stopResize);
    },
    bringDay(ticket, positionIconName) {
      const position = positionIconName.split('-')[2]; 
      this.$emit('bringDay', { ...ticket, position });
    },
    goToTicket(ticket) {
      this.$emit('goto', ticket);
    },
    fallingIn(date) {
      if (moment(date).isAfter(this.viewPortEdges.end)) {
        return 'mdi-arrow-right';
      }
      else if (moment(date).isBefore(this.viewPortEdges.start)) {
        return 'mdi-arrow-left';
      }
      return null;
    },
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
  min-width: 42px;
  z-index: 101;
  transition: left .3s ease-in-out, height .3s ease-in-out, font-size .3s ease-in-out;
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
  width: 100%;
  border-bottom: 1px solid #E2E2E2;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: width 0.1s ease-in-out, height 0.3s ease-in-out, font-size 0.3s ease-in-out;
}
.ellipsis {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.goto-ticket {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  right: -25px;
  width: 20px;
  min-height: 6px;
  border: 1px solid #E2E2E2;
  border-radius: 3px;
  background: white;
  cursor: pointer;
  transition: width 0.3s ease-in-out, height 0.3s ease-in-out, font-size 0.3s ease-in-out;
}
.sidebar-resize {
  cursor: ew-resize;
  position: absolute;
  right: 0;
  height: 100%;
  width: 2px;
  z-index: 110;
  transition: all .1s;
}
.sidebar-resize:hover {
  border-right: 2px solid grey !important;
  width: 5px;
}

.goto-icon {
}
</style>

