<template>
    <div class="value_div">
        <div class="icon">
            <v-icon x-large>{{ icon }}</v-icon>
        </div>
        <div class="detail">
            <div class="caption grey--text">{{ title }}</div>
            <div class="subtitle-1 font-weight-bold">{{ value }}</div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        icon: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        value: {
            type: [String, Number],
            required: true
        }
    }
}
</script>

<style scoped>
.value_div {
    display: flex;
}

.value_div .icon {
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.value_div .detail {
    flex: 1;
}
</style>