<template>
  <div style="width: 100%">
    <div class="MCTITLE">
      <p class="MCTEXT">BILAN PAR MOIS</p>
    </div>
    <div class="MONTHSTRIPE">
      <div v-for="i in 12" :key="i" class="MONTHRECT"><span class="MONTHLEGEND">A</span></div>
    </div>
    <p class="CALMAX LP">Le mois où le bâtiment a le plus consommé est <b>janvier.</b></p>
  </div>
</template>

<style scoped>


.MONTHSTRIPE {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 0 10px 7.6%;
  gap: 10px;
  width: 100%;
  height: 50px;
}

.MONTHRECT {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  gap: 10px;

  width: 7.6%;
  height: 30px;

  background: #D9D9D9;
  border-radius: 5px;
}

.MONTHLEGEND {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 100%;
  /* or 20px */

  letter-spacing: 1.1px;
  color: #FFFFFF;
}
</style>