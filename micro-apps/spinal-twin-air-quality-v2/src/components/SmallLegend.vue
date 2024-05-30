<template>
  <div class="d-flex flex-row legend" @click="emitEvent">
    <div class="rect align-self-center mr-2" :style="{'background-color': color}"></div>
    <div class="text align-self-center" :style="[{'font-size': size+'px !important'}, {'text-decoration': localValue ? 'none' : 'line-through'}]" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{text}}</div>
  </div>
</template>
<script>
export default {
  props: {
    color: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: false,
      default: 7,
    },
    value: {
      type: Boolean,
      required: true,
    }
  },
  data() {
    return {
      localValue: this.value,
    }
  },
  mounted() {},
  methods: {
    emitEvent() {
      this.localValue = !this.localValue;
      this.$emit('toggle', {name: this.text, value: this.localValue});
    },
  },
  watch: {
    value(v) {
      this.localValue = v;
    }
  }
}
</script>
<style scoped>

.legend {
  cursor: pointer;
}
.rect{
  height: 20px;
  width: 8px;
  border-radius: 20px;
  vertical-align: bottom;
}

.text {
  font-size: 13px;
  font-family: 'Charlevoix Pro';
  letter-spacing: 0.7px;
  color: #000000DE;
  opacity: 1;
}


</style>