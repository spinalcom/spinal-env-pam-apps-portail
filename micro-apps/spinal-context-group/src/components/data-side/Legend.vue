<template>
	<div class="list-wrapper" :class="classesLegend">
		<div class="list">
			<div class="item" v-for="( item, i ) in listItem" :key="i">
				<div class="color" :style="{ background: item.color }"></div>
				<div class="title">{{ item.title }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { type Legend } from '../../interfaces';

export default {
	props: {
		listItem: {
			type: Array<Legend>,
			required: false,
			default() {
				return [];
			},
			validator(arr: any) {
				for (const cell of arr) {
					if (!cell.hasOwnProperty('title') || !cell.hasOwnProperty('color')) {
						return false;
					}
				}
				return true;
			}
		},
	},
	setup(props) {
		const toggledLegend = ref(true);

		return { props, toggledLegend };
	},
	methods: {
		toggleLegend() {
			this.toggledLegend = !this.toggledLegend;
		}
	},
	computed: {
		classesLegend() {
			return this.toggledLegend ? 'slide-down-anim' : 'slide-up-anim'
		}
	}
};

</script>

<style lang="scss" scoped>
.list-wrapper {
	// Increase this value in order to scale the components
	--global-font-size: 15px;

	--height-legend-list: 15em;
	--height-legend-action-bar: 2em;

	z-index: 59;
	position: relative;
	height: fit-content;
	width: fit-content;
	box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
		0 2px 2px 0 rgba(0, 0, 0, 0.14),
		0 1px 5px 0 rgba(0, 0, 0, 0.12);
	border-radius: 0.5em;
	font-size: var(--global-font-size);
}

.list {
	background: rgba(255, 255, 255, 0.452);
	border-radius: 0.5em;
	padding: 1.5em 1.5em 1.5em 1.5em;
	overflow: hidden;
	height: 100%;
	width: 100%;
	box-shadow: 0px 10px 8px -5px rgba(0, 0, 0, 0.1);
	display: flex;
	justify-content: space-around;
	flex-direction: column;
	flex-wrap: wrap;


	.item {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		height: 1.5em;
		overflow-x: hidden;
		overflow-y: hidden;
		margin-bottom: 0.8em;
		cursor: pointer;

		.color {
			border-radius: 0.2em;
			border: 0.1em solid rgb(0, 0, 0);
			width: 2.5em !important;
			height: 40%;
			box-shadow: 0px 10px 8px -5px rgba(0, 0, 0, 0.1);
		}

		.title {
			margin-left: 1.7em;
			text-align: start;
			// text-transform: uppercase;
			font-size: 0.8em !important;
			font-family: 'charlevoix' !important;
			color: rgb(158, 158, 158);
			font-weight: 600;
		}

		&:last-child {
			margin-bottom: 0;
		}
	}
}


@keyframes slide-down {
	0% {
		height: var(--height-legend-list) !important;
	}

	100% {
		height: var(--height-legend-action-bar) !important;
	}
}

@keyframes slide-up-keyframes {
	from {
		height: var(--height-legend-action-bar) !important;
	}

	100% {
		height: var(--height-legend-list) !important;
	}
}

.slide-down-anim {
	animation: slide-down 1s both !important;
}

.slide-up-anim {
	animation: slide-up-keyframes 1s both !important;
}
</style>
