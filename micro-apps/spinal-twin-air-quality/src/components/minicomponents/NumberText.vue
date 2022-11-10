<template>
  <div class="d-flex flex-row">
    <div class="value" :style="{'font-size': fontSize(size), color: color}" style="height: 100%; margin: auto; width: 33%">{{value}}</div>
    <div class="d-flex flex-column flex-grow-1 text">
      <div>{{mainText}}</div>
      <div>{{secondaryText}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      required: true
    },
    mainText: {
      type: String,
      required: true
    },
    secondaryText: {
      type: String,
      required: false
    },
    color: {
      type: String,
      required: false,
      default: '#14202C'
    },
    size: {
      type: String,
      required: false,
      default: 'normal'
    }
  },
  methods: {
    fontSize(size) {
      switch(size) {
        case 'large':
          return '30px';
        case 'normal':
          return '20px';
        case 'small':
          return '18px';
        default:
          return '30px';
      }
    }
  }
}
</script>


<style scoped>
.value {
  text-align: right;
  font-family: Charlevoix;
  letter-spacing: 1.5px;
  opacity: 1;
}

.text {
  padding-left: 12px;
  margin: auto;
  font: normal normal normal 11px/13px Charlevoix;
  letter-spacing: 1.1px;
  color: #949DA6;
  opacity: 1;
}
</style>