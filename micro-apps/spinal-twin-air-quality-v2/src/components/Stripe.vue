<template>
    <div class="long-stripe">
        <div class="stripe-el">
            <div class="square g"></div>
            <span class="big-number">7</span>
            <div class="ver-text">
                <span>Niveau Correct</span>
                <span>33%</span>
            </div>
        </div>
        <div class="stripe-el">
            <div class="square y"></div>
            <span class="big-number">7</span>
            <div class="ver-text">
                <span>Niveau Correct</span>
                <span>33%</span>
            </div>
        </div>
        <div class="stripe-el">
            <div class="square o"></div>
            <span class="big-number">7</span>
            <div class="ver-text">
                <span>Niveau Correct</span>
                <span>33%</span>
            </div>
        </div>
        <div class="stripe-el">
            <div class="square r"></div>
            <span class="big-number">7</span>
            <div class="ver-text">
                <span>Niveau Correct</span>
                <span>33%</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.long-stripe {
  font-family: "Charlevoix Pro";
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 90px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0px 3px 10px #49545C29 !important;
}
.stripe-el {
  display: flex;
  align-items: center;
  gap: 10px;
}
.square {
    width: 30px;
    height: 30px;
    border-radius: 5px;
    background: lightgray;
}
.big-number {
    font-size: 36px;
}
.ver-text {
    display: flex;
    flex-direction: column;
    font-size: 14px;
}

.g {
    background: #11EDA9;
}

.y {
    background: #FFE600;
}

.o {
    background: #FFA400;
}

.r {
    background: #FF000B;
}
</style>