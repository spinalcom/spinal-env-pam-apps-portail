<template>
    <div class="con" ref="btn" @click="toggleButton()">
        <div class="ball" ref="ball">
            <span class="text" ref="text">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon v-if="state === '1'" v-bind="attrs" v-on="on">{{ symbolLeft }}</v-icon>
                        <v-icon v-else v-bind="attrs" v-on="on">{{ symbolRight }}</v-icon>
                    </template>
                    <span v-if="state === '1'">{{ tooltipLeft }}</span>
                    <span v-else>{{ tooltipRight }}</span>
                </v-tooltip>
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { onMounted, ref, Ref, toRefs } from 'vue';
import { defineProps } from 'vue';
import { VIcon } from 'vuetify/lib'
import { VTooltip } from 'vuetify/lib';

export default {
    components: {
        VIcon,
        VTooltip
    },
    props: {
        color1: {
            type: String,
            required: false,
            default: () => {
                return 'black'
            }
        },
        color2: {
            type: String,
            required: false,
            default: () => {
                return 'white'
            }
        },
        symbolLeft: {
            type: String,
            required: false,
            default: () => {
                return 'Op1'
            }
        },
        symbolRight: {
            type: String,
            required: false,
            default: () => {
                return 'Op2'
            }
        },
        tooltipLeft: {
            type: String,
            required: false,
            default: () => {
                return 'Left'
            }
        },
        tooltipRight: {
            type: String,
            required: false,
            default: () => {
                return 'Right'
            }
        }
    },
    setup(props) {
        let state: "1" | "2" = ref("1");
        const ball = ref(null);
        const btn = ref(null);
        const text = ref(null);
        const keyframesOptions = { duration: 300, fill: "both" };
        const optionsbgTransition = {
            background: [`${props.color1}`, `${props.color1}`],
            border: [`0.2em solid ${props.color1}`, `0.2em solid ${props.color1}`],
            offset: [0, 1]
        }
        const optionsSlideLeft = {
            background: [`${props.color2}`, `${props.color2}`],
            transform: ['translateX(0)', 'translateX(1.5em)'],
            border: [`0.2em solid ${props.color2}`, `0.2em solid ${props.color2}`],
            offset: [0, 1]
        }
        const optionsRotateLeft = {
            content: [props.symbolLeft, '', '', props.symbolRight],
            transform: ['rotate(0deg)', 'rotate(90deg)', 'rotate(-90deg)', 'rotate(0deg)'],
            opacity: [100, 0, 0, 100],
            offset: [0, 0.5, 0.51, 1],
            color: [`${props.color1}`, ``, ``, `${props.color1}`],
        }
        let animationIsDone = ref(true);

        const ballTransitionKeyframes: KeyframeEffect | undefined = undefined;
        const ballAnimation: Animation | undefined = undefined;
        const bgTransitionKeyframes: KeyframeEffect | undefined = undefined;
        const bgAnimation: Animation | undefined = undefined;
        const textKeyframes: KeyframeEffect | undefined = undefined;
        const textAnimation: Animation | undefined = undefined;

        return {
            ballAnimation,
            ballTransitionKeyframes,
            bgAnimation,
            bgTransitionKeyframes,
            optionsbgTransition,
            optionsRotateLeft,
            ball,
            btn,
            keyframesOptions,
            props,
            animationIsDone,
            optionsSlideLeft,
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
            this.initBgAnimation();
            this.initBallAnimation();
            this.initTextAnimation();
        },
        initBgAnimation() {
            this.bgTransitionKeyframes = new KeyframeEffect(this.btn, this.optionsbgTransition, this.keyframesOptions);
            if (!this.bgTransitionKeyframes) return;
            this.bgAnimation = new Animation(this.bgTransitionKeyframes, document.timeline);
            if (this.btn && this.ball && this.text) {
                this.btn.style.background = this.props.color1;
                this.ball.style.background = this.props.color2;
                this.text.style.color = this.props.color1;
            }
            if (this.bgAnimation) {
                this.bgAnimation.addEventListener('finish', () => {
                    this.animationIsDone = true;
                    // this.state = this.state === "1" ? "2" : "1";
                    // this.$emit('toggled', this.state === '1' ? 'symbolLeft' : 'symbolRight');
                })
            }
        },
        initBallAnimation() {
            this.ballTransitionKeyframes = new KeyframeEffect(this.ball, this.optionsSlideLeft, this.keyframesOptions);
            if (!this.ballTransitionKeyframes) return;
            this.ballAnimation = new Animation(this.ballTransitionKeyframes, document.timeline);
        },
        initTextAnimation() {
            this.textKeyframes = new KeyframeEffect(this.text, this.optionsRotateLeft, this.keyframesOptions);
            if (!this.textKeyframes) return;
            this.textAnimation = new Animation(this.textKeyframes, document.timeline);
        },
        toggleButton() {
            let playbackRate: number = this.state === '1' ? 1 : -1;
            if (!this.animationIsDone) return;
            this.state = this.state === "1" ? "2" : "1";
            this.$emit('toggled', this.state === '1' ? 'symbolLeft' : 'symbolRight');
            this.animationIsDone = false;
            if (this.bgAnimation && this.ballAnimation && this.textKeyframes) {
                this.bgAnimation.playbackRate = playbackRate;
                this.ballAnimation.playbackRate = playbackRate;
                this.textAnimation.playbackRate = playbackRate;
                this.bgAnimation.play();
                this.ballAnimation.play();
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
    background: grey;
    height: 2.4em;
    width: 4em;
    border-radius: 4em;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow: hidden;
    padding: 0.05em 0.1em;
    border: 0.2em solid black;
    cursor: pointer;

    .ball {
        background: gray;
        height: 1.9em;
        width: 1.9em;
        border-radius: 3em;
        display: flex;
        justify-content: center;
        align-items: center;

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
}
</style>
