<template>
  <div>
    <div class="stat-element px-4 py-1">
      <div class="square mr-3 ma-8" :class="squareColor" style="font-family: 'charlevoixpro'"></div>
      <div class="big-number" style="font-family: 'charlevoixpro'">
        {{ bigNumber }}
      </div>
      <div class="horizontal-split">
        <div class="big-caption" style="font-family: 'charlevoixpro'">{{ bigCaption }}</div>
        <div class="small-caption" style="font-family: 'charlevoixpro'">{{ smallCaption }}%</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
props: {
    squareColor: {
      type: String,
      required: true,
    },
    bigNumber: {
      type: Number,
      default: 0,
      required: true,
    },
    bigCaption: {
      type: String,
      required: true,
    },
    smallCaption: {
      type: String,
      default: '0',
    }
}
}
</script>

<style scoped>
.big-number {
  padding-right:0.5em;
  font-weight: 400;
  color: #374063;
  font-size: 36px;
  letter-spacing: 2px;
}
.stat-element {
  display: flex;
  align-items: center;
}
.square {
  height: 30px;
  width: 30px;
  background-color: #555;
  border-radius: 6px;
}
.horizontal-split {
  display: flex;
  flex-flow: column;
}
.big-caption {
  letter-spacing: 2px;
  font-size: 14px;
}
.small-caption {
  letter-spacing: 2px;
  font-size: 10px;
}
</style>