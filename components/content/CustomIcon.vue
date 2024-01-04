<script setup>
defineProps({
    name:{
        type: String,
        default: ""
    },
    size:{
        type: String,
        default: "18px"
    }
}
)
</script>

<template>
    <Icon :name=name :size=size></Icon>
</template>