<template>
  <div class="MC">
    <Diagnosis/>
    <TwoCardsVue/>
    <CalenderAndStripe/>
  </div>
</template> 

<script>
import Diagnosis from './nested/Diagnosis.vue';
import TwoCardsVue from './nested/TwoCards.vue';
import CalenderAndStripe from './nested/CalenderAndStripe.vue';
export default {
  components: {
    Diagnosis,
    TwoCardsVue,
    CalenderAndStripe
  }
}
</script>
<style scoped>
@import '../assets/css/styles.css';
</style>