<template>
  <div class="TWOCF">
    <div class="CARD">
      <p class="BIGT">10%</p>
      <p class="DESCT">de réduction d'impact carbone entre 2021 et 2022</p>
    </div>
    <div class="CARD">
      <p class="BIGT">2 tonnes</p>
      <p class="DESCT">de CO2 évitées entre 2021 et 2022</p>
    </div>
  </div>
</template>

<style scoped>
.TWOCF {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;

  width: 100%;
  height: 54px;

  border-radius: 10px;
}

.CARD {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  gap: 10px;
  width: 100% !important;
  height: 54px;

  background: #F9F9F9;
  border: 1px solid #F7F7F7;
  box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.25);
  border-radius: 10px;
}

.BIGT {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 400;
  font-size: 30px;
  line-height: 40px;
  margin-bottom: 0 !important;
  letter-spacing: 1.1px;
  color: #14202C;
}

.DESCT {
  font-family: 'charlevoix';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  letter-spacing: 1.1px;
  flex-grow: 1;
  color: #949DA6;
  margin-bottom: 0 !important;
}
</style>