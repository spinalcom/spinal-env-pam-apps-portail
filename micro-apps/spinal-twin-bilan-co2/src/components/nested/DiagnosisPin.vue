<template>
  <div class="MP" :style="{'left': pinPosition}" ref="pin">
    <div class="SNACKBAR" :class="colorCalc(objectif)">
      <div class="LEGEND">{{legendCalc(objectif)}}</div>
      <div class="PINTEXT">{{text}}</div>
      <div class="PINTEXT"><b>{{objectif}}</b></div>
    </div>
    <div class="PINLINE" :class="position>= 50?'PINLINELEFT':'PINLINERIGHT'"></div>
    <div class="PINDOT"  :class="position >= 50?'PINDOTLEFT':'PINDOTRIGHT'"></div>
  </div>
</template>

<script>
export default {
  props: ['objectif', 'current', 'text'],
  computed: {
    position() {
      return ((this.objectif * 100 / 280)<=100 ? this.objectif * 100 / 280 : 100);
    },
    pinPosition() {
      let percentage = (this.objectif * 100 / 280)<=100 ? this.objectif * 100 / 280 : 100;
      if (percentage<50) {
        percentage = 100 - percentage;
        return `calc(${percentage}% - 191px)`;
      }
      else {
        percentage = 100 - percentage;
        return `calc(${percentage}% - 11px)`;
      }
    }
  },
  data: () => ({
    
  }),
  methods: {
    colorCalc (val) {
      if(val == -1) return 'E';
      else if (val < 40) return 'G3';
      else if (val < 80) return 'G2';
      else if (val < 120) return 'G1';
      else if (val < 160) return 'Y';
      else if (val < 200) return 'O2';
      else if (val < 240) return 'O1';
      else return 'R';
    },
    legendCalc(val) {
      if(val == -1) return '';
      else if (val < 40) return 'A';
      else if (val < 80) return 'B';
      else if (val < 120) return 'C';
      else if (val < 160) return 'D';
      else if (val < 200) return 'E';
      else if (val < 240) return 'F';
      else return 'G';
    }
  },
  mounted() {
    
  }
}
</script>
<style scoped>
.MP {
  display: flex;
  flex-direction: column;
  padding: 0;
  position: absolute;
  top: -66px;
  border-radius: 10px;
  width: 200px !important;
}

.SNACKBAR {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  gap: 10px;

  width: 100%;
  height: 28px;
  color: white;
  border-radius: 5px;
}

.PINLINE {
  position: absolute;
  top: 28px;
  height: 41px;
}

.PINLINELEFT {
  border-left: 1px solid #14202C;
  margin-left: 10px;
}

.PINLINERIGHT {
  border-right: 1px solid #14202C;
  width: calc(100% - 10px);
  margin-right: 10px;
}

.PINDOT {
  position: absolute;
  top: 69px;
  height: 5px;
  width: 5px;
  border-radius: 10px;
  background: #14202C;
}

.PINDOTLEFT {
  margin-left: 8px;
}

.PINDOTRIGHT {
  right: 0;
  margin-right: 8px;
}

.LEGEND {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 700;
  font-size: 16px;
  line-height: 27px;
  letter-spacing: 1.1px;
  color: #F9F9F9;
}

.PINTEXT {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 1.1px;
  color: #F9F9F9;
}
</style>