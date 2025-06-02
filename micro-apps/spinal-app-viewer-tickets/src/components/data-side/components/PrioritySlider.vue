<template>
    <div class="priority-slider">
        <div class="slider-track" :style="trackStyle">
            <div class="slider-handle" :style="handleStyle" @mousedown="startDrag" @touchstart="startDrag"></div>
        </div>
        <div class="priority-labels">
            <span :class="{ active: selectedIndex === 0 }">Faible</span>
            <span :class="{ active: selectedIndex === 1 }">Moyenne</span>
            <span :class="{ active: selectedIndex === 2 }">Élevée</span>
        </div>
    </div>
</template>

<script>
export default {
    name: "PrioritySlider",
    data() {
        return {
            dragging: false,
            sliderLeft: 0,
            sliderWidth: 0,
            handleX: 0,
            priorities: ["Faible", "Moyenne", "Élevée"],
            colors: ["#008000", "#FFA500", "#D8151B"],
            selectedIndex: 0,
            dragOffset: 0,
        };
    },
    computed: {
        handleStyle() {
            const handleWidth = 30; // same as in CSS
            const left = `${this.handleX - handleWidth / 2}px`;
            const bgColor = this.colors[this.selectedIndex];
            return {
                left,
                backgroundColor: bgColor,
                border: this.dragging ? "none" : "2px solid white",
            };
        },
        trackStyle() {
            const percent = (this.handleX / this.sliderWidth) * 100;

            if (percent <= 50) {
                // Between Faible and Moyenne
                return {
                    background: `linear-gradient(to right, #008000 0%, #FFA500 ${percent}%, #d3d3d3 ${percent}%)`
                };
            } else {
                // Between Moyenne and Élevée
                return {
                    background: `linear-gradient(to right, #008000 0%, #FFA500 50%, #D8151B ${percent}%, #d3d3d3 ${percent}%)`
                };
            }
        }


    },
    mounted() {
        const track = this.$el.querySelector(".slider-track");
        this.sliderLeft = track.offsetLeft;
        this.sliderWidth = track.offsetWidth;
        this.setHandlePosition(0);
        window.addEventListener("mouseup", this.stopDrag);
        window.addEventListener("mousemove", this.onDrag);
        window.addEventListener("touchend", this.stopDrag);
        window.addEventListener("touchmove", this.onDrag);
    },
    beforeDestroy() {
        window.removeEventListener("mouseup", this.stopDrag);
        window.removeEventListener("mousemove", this.onDrag);
        window.removeEventListener("touchend", this.stopDrag);
        window.removeEventListener("touchmove", this.onDrag);
    },
    methods: {
        startDrag(event) {
            this.dragging = true;

            const clientX = event.touches ? event.touches[0].clientX : event.clientX;
            const handleEl = this.$el.querySelector(".slider-handle");
            const handleRect = handleEl.getBoundingClientRect();

            this.dragOffset = clientX - handleRect.left;
        },

        onDrag(event) {
            if (!this.dragging) return;

            const clientX = event.touches ? event.touches[0].clientX : event.clientX;
            const trackEl = this.$el.querySelector(".slider-track");
            const trackRect = trackEl.getBoundingClientRect();

            let relativeX = clientX - trackRect.left - this.dragOffset;
            const maxPos = this.sliderWidth;
            const clamped = Math.max(0, Math.min(relativeX, maxPos));

            this.handleX = clamped;

            const segmentWidth = this.sliderWidth / 2;
            this.selectedIndex =
                clamped < segmentWidth / 2
                    ? 0
                    : clamped < segmentWidth * 1.5
                        ? 1
                        : 2;
        },

        stopDrag() {
            if (!this.dragging) return;
            this.dragging = false;

            const segmentWidth = this.sliderWidth / 2;
            const snapIndex =
                this.handleX < segmentWidth / 2
                    ? 0
                    : this.handleX < segmentWidth * 1.5
                        ? 1
                        : 2;

            this.setHandlePosition(snapIndex);
        },

        setHandlePosition(index) {
            this.selectedIndex = index;
            const segment = this.sliderWidth / 2;
            this.handleX = segment * index;
        },
    },
    watch: {
        selectedIndex(newVal) {
            const value = this.priorities[newVal];
            this.$emit('input', value); // v-model compatibility
            this.$emit('change', value); // optional: use if you prefer @change
        }
    }
};
</script>

<style scoped>
.priority-slider {
    width: 100%;
    padding: 10px 10px;
}

.slider-track {
    width: 100%;
    height: 20px;
    background-color: #d3d3d3;
    border-radius: 10px;
    position: relative;
    margin-bottom: 15px;
    transition: background 0.3s ease;
}

.slider-handle {
    width: 24px;
    height: 25px;
    border-radius: 50%;
    position: absolute;
    top: -2.5px;
    cursor: grab;
    transition: background-color 0.2s ease;
}

.priority-labels {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    color: #1e1e1e;
}

.priority-labels span {
    width: 33.3%;
    text-align: center;
    font-size: 14px;
    opacity: 0.5;
    transition: opacity 0.2s ease;
}

.priority-labels span.active {
    opacity: 1;
}
</style>