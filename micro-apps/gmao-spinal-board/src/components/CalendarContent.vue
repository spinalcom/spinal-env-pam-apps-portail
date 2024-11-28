
<template>
  <!--
  -->
  <div class="content-plan"
    :style="{ 'height': taskList.length * 30  + 'px' }">
    <TodayMarker :height="markerHeight" :offset="markerOffset"/>
    <SideBar class="side-bar" :taskList="taskList" @resizedSideBar="resizedSideBar"/>
    <Task
      v-for="(task, index) in  taskList" :key="task.name + index" class="task"
        :style="[{ 'top': index * 30 + 'px'}, ]"
      :level="index" :task="task" :start="start"/>
    <div v-for="(offset, index) in weekLines" :key="index" :style="[{ 'left': offset + 'px' }, { 'height': markerHeight - 5 + 'px' }]" class="week-separator-long "></div>
  </div>
</template>

<script>
import SideBar from './SideBar';
import TodayMarker from './TodayMarker';
import Task from './Task';
import moment from 'moment';
moment.locale('fr');
export default {
  name: 'CalendarContent',
  props: ['separator', 'start', 'end'],
  components: {
    Task,
    SideBar, 
    TodayMarker,
  },
  data: () => ({
    taskList: [
      {
        name: 'Fuite d\'eau au robinet du lavabo des toilettes hommes au 3ème étage',
        startDate: new Date('2024-11-15').getTime(),
        endDate: new Date('2024-12-02').getTime(),
        status: 'inProgress'
      },
      {
        name: 'Engorgement des canalisations dans la cuisine du restaurant',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-20').getTime(),
        status: 'pending'
      },
      {
        name: 'Interrupteur défectueux dans le couloir du 2ème étage',
        startDate: new Date('2024-11-14').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'done'
      },
      {
        name: 'Éclairage défaillant dans le parking souterrain',
        startDate: new Date('2024-11-17').getTime(),
        endDate: new Date('2024-11-21').getTime(),
        status: 'pending'
      },
      {
        name: 'Radiateur qui ne chauffe pas dans le bureau 204',
        startDate: new Date('2024-11-15').getTime(),
        endDate: new Date('2024-11-19').getTime(),
        status: 'inProgress'
      },
      {
        name: 'Thermostat déréglé dans la salle de réunion',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-18').getTime(),
        status: 'pending'
      },
      {
        name: 'Vitres sales dans le hall d\'entrée',
        startDate: new Date('2024-11-17').getTime(),
        endDate: new Date('2024-11-19').getTime(),
        status: 'pending'
      },
      {
        name: 'Moquette tachée dans l\'ascenseur',
        startDate: new Date('2024-11-15').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'done'
      },
      {
        name: 'Tonte de la pelouse du jardin',
        startDate: new Date('2024-11-04').getTime(),
        endDate: new Date('2024-11-09').getTime(),
        status: 'pending'
      },
      {
        name: 'Taille des haies autour du bâtiment',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-19').getTime(),
        status: 'inProgress'
      },
      {
        name: 'Vérification des extincteurs',
        startDate: new Date('2024-11-14').getTime(),
        endDate: new Date('2024-11-16').getTime(),
        status: 'done'
      },
      {
        name: 'Test du système d\'alarme incendie',
        startDate: new Date('2024-11-18').getTime(),
        endDate: new Date('2024-11-20').getTime(),
        status: 'pending'
      },
      {
        name: 'Contrôle des prises électriques',
        startDate: new Date('2024-11-15').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'inProgress'
      },
      {
        name: 'Inspection des tableaux électriques',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-19').getTime(),
        status: 'pending'
      },
      {
        name: 'Peindre les murs du couloir du 1er étage',
        startDate: new Date('2024-11-17').getTime(),
        endDate: new Date('2024-11-21').getTime(),
        status: 'pending'
      },
      {
        name: 'Rénover la peinture de la façade',
        startDate: new Date('2024-11-15').getTime(),
        endDate: new Date('2024-11-22').getTime(),
        status: 'inProgress'
      },
      {
        name: 'Remplacer la porte d\'entrée du bâtiment',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-20').getTime(),
        status: 'pending'
      },
      {
        name: 'Réparer les fenêtres du 3ème étage',
        startDate: new Date('2024-11-14').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'done'
      },
      {
        name: 'Remplacer la porte d\'entrée du bâtiment',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-20').getTime(),
        status: 'pending'
      },
      {
        name: 'Réparer les fenêtres du 3ème étage',
        startDate: new Date('2024-11-14').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'done'
      },
      {
        name: 'Remplacer la porte d\'entrée du bâtiment',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-20').getTime(),
        status: 'pending'
      },
      {
        name: 'Réparer les fenêtres du 3ème étage',
        startDate: new Date('2024-11-14').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'done'
      },
      {
        name: 'Remplacer la porte d\'entrée du bâtiment',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-20').getTime(),
        status: 'pending'
      },
      {
        name: 'Réparer les fenêtres du 3ème étage',
        startDate: new Date('2024-11-14').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'done'
      },
      {
        name: 'Réparer les fenêtres du 3ème étage',
        startDate: new Date('2024-11-14').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'done'
      },
      {
        name: '333333333333333333333333',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-20').getTime(),
        status: 'pending'
      },
      {
        name: '22222222222222222222',
        startDate: new Date('2024-11-14').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'done'
      },
      {
        name: '111111111111',
        startDate: new Date('2024-11-16').getTime(),
        endDate: new Date('2024-11-20').getTime(),
        status: 'pending'
      },
      {
        name: '000000000000000',
        startDate: new Date('2024-11-14').getTime(),
        endDate: new Date('2024-11-17').getTime(),
        status: 'done'
      }
    ],
  }),
  computed: {
    weekLines() {
      const mondayLines = [];
      const diff = this.end.diff(this.start, 'days');
      for (let i = 8 - this.start.day(); i <= diff; i += 7) {
        mondayLines.push(i * 30);
      }
      return mondayLines;
    },
    markerHeight() {
      return this.taskList.length * 30 + 5;
    },
    markerOffset() {
     return moment().diff(this.start, 'days') * 30 + 3;
    },
  },
  mounted() {
    this.$emit('planHeight', (this.taskList.length) * 30.8);
  },
  methods: {
    resizedSideBar(event) {
      this.$emit('resizedSideBar', event);
    }
  },
}
</script>

<style scoped>
.content-plan {
  position: sticky;
  color: #888888;
  top: 0px;
  left: 0;
  min-height: 100%;
  width: calc(100%);
  z-index: 101;
}

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

.task {
  position: absolute;
  z-index: 80;
}

.week-separator-long {
  position: absolute;
  top: 0;
  min-height: 100%;
  width: 1px;
  border-left: 1px solid #E2E2E2;
  z-index: 79;
}
</style>

