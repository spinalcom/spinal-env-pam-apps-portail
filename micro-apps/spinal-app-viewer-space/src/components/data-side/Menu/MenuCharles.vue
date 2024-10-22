<template>
    <div class="menu-wrapper">
      <div class="arrow-left"></div>
      <div class="menu">
        <div class="cell">
          
          <div class="icon" @click="clickFirstCell">
            <v-icon color="primary">{{ firstCell.icon }}</v-icon>
          </div>
          <div class="text">
            {{ firstCell.title }}
          </div>
        </div>
        <div class="cell-main" @click="toggleCheckbox">
          <div class="icon" >
                  <v-icon color="secondary">{{ mainCell.icon }}</v-icon>
          </div>
          <div class="wrapper">
            <input class="hidden-trigger" id="toogle" type="checkbox" v-model="isChecked" />
            
            <div class="subs">
              <button class="sub-circle">
                <input
                  class="hidden-sub-trigger"
                  id="sub1"
                  type="radio"
                  name="sub-circle"
                  value="1"
                />
                <label for="sub1"></label>
              </button>
              <button class="sub-circle">
                <input
                  class="hidden-sub-trigger"
                  id="sub2"
                  type="radio"
                  name="sub-circle"
                  value="1"
                />
                <label for="sub2"></label>
              </button>
              <button class="sub-circle">
                <input
                  class="hidden-sub-trigger"
                  id="sub3"
                  type="radio"
                  name="sub-circle"
                  value="1"
                />
                <label for="sub3"></label>
              </button>
              <button class="sub-circle">
                <input
                  class="hidden-sub-trigger"
                  id="sub4"
                  type="radio"
                  name="sub-circle"
                  value="1"
                />
                <label for="sub4"></label>
              </button>
              <button class="sub-circle">
                <input
                  class="hidden-sub-trigger"
                  id="sub5"
                  type="radio"
                  name="sub-circle"
                  value="1"
                />
                <label for="sub5"></label>
              </button>
              <button class="sub-circle">
                <input
                  class="hidden-sub-trigger"
                  id="sub6"
                  type="radio"
                  name="sub-circle"
                  value="1"
                />
                <label for="sub6"></label>
              </button>
              <button class="sub-circle">
                <input
                  class="hidden-sub-trigger"
                  id="sub7"
                  type="radio"
                  name="sub-circle"
                  value="1"
                />
                <label for="sub7"></label>
              </button>
              <button class="sub-circle">
                <input
                  class="hidden-sub-trigger"
                  id="sub8"
                  type="radio"
                  name="sub-circle"
                  value="1"
                />
                <label for="sub8"></label>
              </button>
            </div>
          </div>
        </div>
        <div class="cell">
          <div class="icon" @click="clickSecondCell">
            <v-icon color="primary">{{ secondCell.icon }}</v-icon>
          </div>
          <div class="text">
            {{ secondCell.title }}
          </div>
        </div>
        <div class="arrow-right"></div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  // * Vuetify
  //import { VIcon } from 'vuetify/lib'
  
  export default {
    components: {
      //VIcon
    },
    props: {
      mainCell: {
        type: Object,
        default: () => {
          return {
            title: '',
            icon: 'mdi-cog-outline',
          };
        },
        required: false,
        validator: (obj: Object) => {
          return Object.hasOwn(obj, 'title') && Object.hasOwn(obj, 'icon');
        },
      },
      firstCell: {
        type: Object,
        default: () => {
          return {
            title: 'Groupe Manager',
            icon: 'mdi-format-list-bulleted-type',
          };
        },
        required: false,
        validator: (obj: Object) => {
          return Object.hasOwn(obj, 'title') && Object.hasOwn(obj, 'icon');
        },
      },
      secondCell: {
        type: Object,
        default: () => {
          return {
            title: 'Nomenclature',
            icon: 'mdi-format-list-bulleted',
          };
        },
        required: false,
        validator: (obj: Object) => {
          return Object.hasOwn(obj, 'title') && Object.hasOwn(obj, 'icon');
        },
      },
    },
      data() {
          return {
          isChecked: false,
          };
      },
    methods: {
      clickFirstCell() {
        this.$emit('clickFirstCell');
      },
      clickSecondCell() {
        this.$emit('clickSecondCell');
      },
      clickMainCell() {
        this.$emit('clickMainCell');
      },
      toggleCheckbox() {
        this.isChecked = !this.isChecked;
      },
    },
  };
  </script>
  
  <style scoped>
  footer .demo {
    position: absolute;
    bottom: 10px;
    width: 500px;
    margin: 0 auto;
  }
  
  footer .demo a {
    text-align: center;
    color: #000;
    text-decoration: none;
    font-weight: 100;
    border-bottom: 1px solid #000;
  }
  
  .wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
  }
  
  .circle {
    display: block;
    position: relative;
    padding: 0;
    z-index: 98;
    margin: 0 auto;
    -webkit-box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.3);
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    height: 60px;
    width: 60px;
    background-color: #3f51b5;
    transition: 0.2s;
    text-align: center;
  }
  
  .circle:active {
    transform: scale(0.9);
    box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.3);
  }
  
  .circle:hover {
    cursor: pointer;
    background-color: #606fc7;
    box-shadow: 0 8px 15px 0 rgba(0, 0, 0, 0.3);
  }
  
  .circle .svg {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: -15px;
    margin-top: -15px;
    width: 30px;
    height: 30px;
    transition: 0.5s;
    transform: rotate(180deg);
  }
  
  .sub-circle {
    z-index: 0;
    position: absolute;
    height: 40px;
    width: 40px;
    overflow: hidden;
    border-radius: 50%;
    transition: 0.3s;
    transform: scale(0.5);
    opacity: 0;
    padding: 0;
    margin: 0;
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.3);
    border: none;
  }
  
  .sub-circle label {
    background-color: #f50057;
    display: block;
    color: white;
    width: 100%;
    height: 100%;
    line-height: 40px;
    transition: 0.5s;
  }
  
  .sub-circle label:hover {
    cursor: pointer;
    background-color: #606fc7;
  }
  
  .subs {
    left: -20px;
    top: -50px;
    width: 40px;
    height: 40px;
    text-align: center;
    z-index: 0;
    margin: 0 auto;
    position: relative;
  }
  
  .hidden-sub-trigger {
    display: none;
  }
  
  .hidden-sub-trigger:checked ~ label {
    background-color: #606fc7;
  }
  
  .hidden-trigger {
    display: none;
  }
  
  .hidden-trigger:checked ~ .circle {
    transform: scale(0.9);
    cursor: pointer;
    background-color: #606fc7;
    box-shadow: 0 8px 15px 0 rgba(0, 0, 0, 0.1);
  }
  
  .hidden-trigger:checked ~ .circle .svg {
    transform: rotate(45deg);
  }
  
  .hidden-trigger:checked ~ .subs button:nth-of-type(1) {
    transform: translate(0px, -100px) scale(1);
    opacity: 1;
    transition: 0.1s;
  }
  
  .hidden-trigger:checked ~ .subs button:nth-of-type(2) {
    transform: translate(75px, -75px) scale(1);
    opacity: 1;
    transition: 0.2s;
  }
  
  .hidden-trigger:checked ~ .subs button:nth-of-type(3) {
    transform: translate(100px, 0px) scale(1);
    opacity: 1;
    transition: 0.3s;
  }
  
  .hidden-trigger:checked ~ .subs button:nth-of-type(4) {
    transform: translate(75px, 75px) scale(1);
    opacity: 1;
    transition: 0.4s;
  }
  
  .hidden-trigger:checked ~ .subs button:nth-of-type(5) {
    transform: translate(0px, 100px) scale(1);
    opacity: 1;
    transition: 0.5s;
  }
  
  .hidden-trigger:checked ~ .subs button:nth-of-type(6) {
    transform: translate(-75px, 75px) scale(1);
    opacity: 1;
    transition: 0.6s;
  }
  
  .hidden-trigger:checked ~ .subs button:nth-of-type(7) {
    transform: translate(-100px, 0px) scale(1);
    opacity: 1;
    transition: 0.7s;
  }
  
  .hidden-trigger:checked ~ .subs button:nth-of-type(8) {
    transform: translate(-75px, -75px) scale(1);
    opacity: 1;
    transition: 0.8s;
  }
  </style>
  <style lang="scss" scoped>
  .menu-wrapper {
    // Increase this value in order to scale the components
    --global-font-size: 15px;
  
    --cell-max-height: 4em;
    --cell-max-width: 8em;
  
    --cell-main-height: 4em;
    --cell-main-width: 4em;
  
    --cell-z-index: 60;
    --component-z-index: 59;
  
    --menu-padding-x: 0.4em;
    --menu-padding-y: 1em;
  
    border-radius: 0.6em;
    background-color: white;
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 1px 5px 0 rgba(0, 0, 0, 0.12);
    padding: var(--menu-padding-x) var(--menu-padding-y);
    width: fit-content;
    position: relative;
    z-index: var(--component-z-index);
  
    // Increase this value for responsivness
    font-size: var(--global-font-size);
  
    .v-icon {
      font-size: 2em !important;
    }
  
    .menu {
      height: min-content;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      height: var(--cell-max-height);
      max-height: var(--cell-max-height);
  
      .cell {
        height: inherit;
        max-height: inherit;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 2fr 1fr;
        grid-column-gap: 0;
        grid-row-gap: 0;
        width: var(--cell-max-width);
        max-width: var(--cell-max-width);
        background-color: transparent;
        cursor: pointer;
        z-index: var(--cell-z-index);
  
        .icon {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
          transition: transform background 400ms ease;
          transform: scale(1.2);
  
          &:hover {
            transform: scale(1.3);
  
            &::after {
              content: '';
              position: absolute;
              background: rgba(128, 128, 128, 0.438);
            }
          }
  
          &:active,
          &:focus {
            transform: scale(1.1);
          }
        }
  
        .text {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          height: 100%;
          width: 100%;
          font-size: 0.9em;
          font-weight: 600;
          font-family: 'Charlevoix';
        }
      }
    }
  
    .cell-main {
      display: flex;
      margin: 0 1em;
      justify-content: center;
      align-items: center;
      width: var(--cell-main-width);
      height: var(--cell-main-height);
      background: black;
      transform: translateY(-2.5em) rotate(45deg);
      border-radius: 0.7em;
      transition: transform 200ms ease;
      cursor: pointer;
  
      z-index: var(--cell-z-index);
  
      &:hover {
        transform: translateY(-2.5em) rotate(45deg) scale(1.1);
      }
  
      &:active,
      &:focus {
        transform: translateY(-2.5em) rotate(45deg) scale(0.9);
      }
  
      .icon {
        transform: rotate(-45deg);
      }
    }
  }
  </style>
  