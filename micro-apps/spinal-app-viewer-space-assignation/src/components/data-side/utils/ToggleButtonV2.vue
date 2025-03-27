<template>
    <div class="con" ref="btn" @click="toggleButton()">
        <span class="text" ref="text">
            <v-icon :color="color1">{{ symbol }}</v-icon>
        </span>
    </div>
</template>

<script lang="ts">
import { onMounted, ref, Ref, toRefs } from 'vue';
import { defineProps } from 'vue';

export default {
    props: {
        color1: {
            type: String,
            required: false,
            default: () => {
                return 'black'
            }
        },
        symbol: {
            type: String,
            required: false,
            default: () => {
                return 'Op1'
            }
        },
    },
    setup(props) {
        let state: "1" | "2" = ref("1");
        const ball = ref(null);
        const btn = ref(null);
        const text = ref(null);
        const keyframesOptions = { duration: 300, fill: "both" };
        const optionsRotateLeft = {
            transform: ['rotate(0deg)', 'rotate(180deg)'],
            offset: [0, 1],
            color: [`${props.color1}`],
        }
        let animationIsDone = ref(true);

        const textKeyframes: KeyframeEffect | undefined = undefined;
        const textAnimation: Animation | undefined = undefined;

        return {
            optionsRotateLeft,
            ball,
            btn,
            keyframesOptions,
            props,
            animationIsDone,
            state,
            text,
            textKeyframes,
            textAnimation
        }
    },
    mounted() {
        this.initData();
    },
    methods: {
        initData() {
            this.initTextAnimation();
        },
        initTextAnimation() {
            this.textKeyframes = new KeyframeEffect(this.text, this.optionsRotateLeft, this.keyframesOptions);
            if (!this.textKeyframes) return;
            this.textAnimation = new Animation(this.textKeyframes, document.timeline);
            if (this.textAnimation) {
                this.textAnimation.addEventListener('finish', () => {
                    this.animationIsDone = true;
                    // this.state = this.state === "1" ? "2" : "1";
                    // this.$emit('toggled', this.state === '1' ? 'symbolLeft' : 'symbolRight');
                })
            }
        },
        toggleButton() {
            let playbackRate: number = this.state === '1' ? 1 : -1;
            if (!this.animationIsDone) return;
            this.state = this.state === "1" ? "2" : "1";
            this.$emit('toggled', this.state === '1' ? 'left' : 'right');
            this.animationIsDone = false;
            if (this.textAnimation) {
                this.textAnimation.playbackRate = playbackRate;
                this.textAnimation.play();
            }
        }
    }

};
</script>

<style lang="scss" scoped>
body {

    --color1: black;
    --color2: white;
}

.con {
    background: white;
    height: 2.4em;
    width: 2.4em;
    border-radius: 4em;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow: hidden;
    padding: 0.05em 0.1em;
    border: 0.15em solid black;
    cursor: pointer;

    .text {
        height: 100%;
        width: 100%;
        display: flex;
        font-size: 1em;
        color: white;
        justify-content: center;
        align-items: center;
        transform: all 0.5s ease;
        font-family: 'charlevoix';
    }
}
</style>
