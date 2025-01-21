<template>
    <div class="container">
      <!-- h1Container Cubes -->
      <div class="h1Container">
        <div
          v-for="(cube, index) in cubes.h1"
          :key="'h1' + index"
          :class="'cube h1 w' + cube.w + ' l' + cube.l"
        >
          <div class="face top"></div>
          <div class="face left"></div>
          <div class="face right"></div>
        </div>
      </div>
  
      <!-- h2Container Cubes -->
      <div class="h2Container">
        <div
          v-for="(cube, index) in cubes.h2"
          :key="'h2' + index"
          :class="'cube h2 w' + cube.w + ' l' + cube.l"
        >
          <div class="face top"></div>
          <div class="face left"></div>
          <div class="face right"></div>
        </div>
      </div>
  
      <!-- h3Container Cubes -->
      <div class="h3Container">
        <div
          v-for="(cube, index) in cubes.h3"
          :key="'h3' + index"
          :class="'cube h3 w' + cube.w + ' l' + cube.l"
        >
          <div class="face top"></div>
          <div class="face left"></div>
          <div class="face right"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "SpinalLoader",
    data() {
      return {
        cubes: {
          h1: [
            { w: 1, l: 1 },
            { w: 1, l: 2 },
            { w: 1, l: 3 },
            { w: 2, l: 1 },
            { w: 2, l: 2 },
            { w: 2, l: 3 },
            { w: 3, l: 1 },
            { w: 3, l: 2 },
            { w: 3, l: 3 },
          ],
          h2: [
            { w: 1, l: 1 },
            { w: 1, l: 2 },
            { w: 1, l: 3 },
            { w: 2, l: 1 },
            { w: 2, l: 2 },
            { w: 2, l: 3 },
            { w: 3, l: 1 },
            { w: 3, l: 2 },
            { w: 3, l: 3 },
          ],
          h3: [
            { w: 1, l: 1 },
            { w: 1, l: 2 },
            { w: 1, l: 3 },
            { w: 2, l: 1 },
            { w: 2, l: 2 },
            { w: 2, l: 3 },
            { w: 3, l: 1 },
            { w: 3, l: 2 },
            { w: 3, l: 3 },
          ],
        },
      };
    },
  };
  </script>
  
  <style scoped lang="scss">
  $background: #222;
  $leftFace: #d53a33;
  $rightFace: #e79c10;
  $topFace: #14202c;
  $scale: 1;
  $duration: 3s;
  $timingFunction: ease;
  
  body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    background: $background;
  }
  
  .container {
    position: relative;
    height: 100px;
    width: 86px;
    transform: scale(#{$scale * 0.5});
  }
  
  .cube {
    position: absolute;
    width: 86px;
    height: 100px;
  }
  
  .right {
    background: $rightFace;
    transform: rotate(-30deg) skewX(-30deg) translate(49px, 65px) scaleY(0.86);
  }
  
  .left {
    background: $leftFace;
    transform: rotate(90deg) skewX(-30deg) scaleY(0.86) translate(25px, -50px);
  }
  
  .top {
    background: $topFace;
    transform: rotate(210deg) skew(-30deg) translate(-75px, -22px) scaleY(0.86);
    z-index: 2;
  }
  
  .face {
    height: 50px;
    width: 50px;
    position: absolute;
    transform-origin: 0 0;
  }
  
  @mixin slice($h, $w, $l) {
    .h#{$h}.w#{$w}.l#{$l} {
      z-index: (-#{$h});
      animation-name: h#{$h}w#{$w}l#{$l};
      animation-timing-function: $timingFunction;
      animation-duration: $duration;
      animation-iteration-count: infinite;
    }
    @keyframes h#{$h}w#{$w}l#{$l} {
      0% {
        transform: translate(
          ($w * -50% - 50%) + ($l * 50% + 50%),
          ($h * 50 - 200%) + ($w * 25% - 25%) + ($l * 25 + 25%)
        );
      }
      14% {
        transform: translate(
          ($w * -50% - 50%) + ($l * 100% - 50%),
          ($h * 50 - 200%) + ($w * 25% - 25%) + ($l * 50 - 25%)
        );
      }
      28% {
        transform: translate(
          ($w * -100% + 50%) + ($l * 100% - 50%),
          ($h * 50 - 200%) + ($w * 50% - 75%) + ($l * 50 - 25%)
        );
      }
      43% {
        transform: translate(
          ($w * -100% - 100%) + ($l * 100% + 100%),
          ($h * 100 - 400%) + ($w * 50% - 50%) + ($l * 50 + 50%)
        );
      }
      57% {
        transform: translate(
          ($w * -100% - 100%) + ($l * 50% + 200%),
          ($h * 100 - 400%) + ($w * 50% - 50%) + ($l * 25 + 100%)
        );
      }
      71% {
        transform: translate(
          ($w * -50% - 200%) + ($l * 50% + 200%),
          ($h * 100 - 375%) + ($w * 25% - 25%) + ($l * 25 + 100%)
        );
      }
      85% {
        transform: translate(
          ($w * -50% - 50%) + ($l * 50% + 50%),
          ($h * 50 - 200%) + ($w * 25% - 25%) + ($l * 25 + 25%)
        );
      }
      100% {
        transform: translate(
          ($w * -50% - 50%) + ($l * 50% + 50%),
          ($h * 50 - 200%) + ($w * 25% - 25%) + ($l * 25 + 25%)
        );
      }
    }
  }
  
  @include slice(1, 1, 1);
  @include slice(1, 1, 2);
  @include slice(1, 1, 3);
  @include slice(1, 2, 1);
  @include slice(1, 2, 2);
  @include slice(1, 2, 3);
  @include slice(1, 3, 1);
  @include slice(1, 3, 2);
  @include slice(1, 3, 3);
  @include slice(2, 1, 1);
  @include slice(2, 1, 2);
  @include slice(2, 1, 3);
  @include slice(2, 2, 1);
  @include slice(2, 2, 2);
  @include slice(2, 2, 3);
  @include slice(2, 3, 1);
  @include slice(2, 3, 2);
  @include slice(2, 3, 3);
  @include slice(3, 1, 1);
  @include slice(3, 1, 2);
  @include slice(3, 1, 3);
  @include slice(3, 2, 1);
  @include slice(3, 2, 2);
  @include slice(3, 2, 3);
  @include slice(3, 3, 1);
  @include slice(3, 3, 2);
  @include slice(3, 3, 3);
  </style>
  