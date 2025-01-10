<template>
  <div>
    <table style="width: 100%;">
      <tr>
        <td v-for="(n, index) in stripeNames" :key="n" class="col-header" style="min-width: 0px; max-width: 100%" :style="{width: percentage[index]+'% !important', display: stripeValues[index]==0? 'none': ''}">

        </td>
        <!-- <td class="col-header" :style="{width: und+'%'}">NOK</td>
        <td class="col-header" :style="{width: double+'%'}">incorrecte</td>
        <td class="col-header" :style="{width: double+'%'}">non remontées</td> -->
      </tr>
      <tr style="height: 44px;">
        <td v-for="(n, index) in stripeNames" :key="n" class="rounded" style="min-width: 0px; max-width: 100%" :style="{width: percentage[index]+'% !important', 'background-color': '#'+stripeColors[index], display: stripeValues[index]==0? 'none': ''}">
          
            <v-tooltip  bottom>
            <template  v-slot:activator="{ on, attrs }">
              <div style="height: 44px; width: 100%"
                v-bind="attrs"
                v-on="on"
              ></div>
            </template>
            <span>{{stripeNames[index]}}</span>
          </v-tooltip>
        </td>
        <!-- <td class="rounded" :style="{width: und+'%'}" style="background-color: #9830F2"></td>
        <td class="rounded" :style="{width: double+'%'}" style="background-color: #EF8BC5"></td>
        <td class="rounded" :style="{width: double+'%'}" style="background-color: #FF4242"></td> -->
      </tr>
    </table>
  </div>
</template>
<script>
export default {
  props: {
    stripeValues: {
      required: true
    },
    stripeNames: {
      required: true
    },
    stripeColors: {
      required: true
    }
  },
  data: () => ({
    named: 82,
    und: 4,
    double: 14,
    percentage: null,
  }),
  mounted() {
    const arraySum = this.stripeValues.reduce((x, y) => x+y);
    this.percentage = this.stripeValues.map((element) => parseInt((element * 100 / arraySum).toFixed(2)))
    console.log(this.percentage);
  }
}
</script>
<style scoped>
.col-header {
  font: normal normal normal 11px/13px Charlevoix !important;
  letter-spacing: 1.1px;
  color: #949DA6;
  opacity: 1;
}
</style>