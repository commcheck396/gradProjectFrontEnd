<template>
    <el-select v-model="value" multiple placeholder="Select" style="width: 240px" multiple-limit=1>
        <el-option v-for="item in colors" :key="item.value" :label="item.label" :value="item.value">
            <div class="flex items-center">
                <el-tag :color="item.value" style="margin-right: 8px" size="small" />
                <span :style="{ color: item.value }">{{ item.label }}</span>
            </div>
        </el-option>
        <template #tag>
            <span v-if="value == '#E63415'" style="color: #FF7615;">
                <el-icon>
                    <Flag />
                </el-icon>
                P1
            </span>
        </template>

    </el-select>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const value = ref([])
const colors = [
    {
        value: '#E63415',
        label: 'red',
    },
    {
        value: '#FF6600',
        label: 'orange',
    },
    {
        value: '#FFDE0A',
        label: 'yellow',
    },
    {
        value: '#1EC79D',
        label: 'green',
    },
    {
        value: '#14CCCC',
        label: 'cyan',
    },
    {
        value: '#4167F0',
        label: 'blue',
    },
    {
        value: '#6222C9',
        label: 'purple',
    },
]
</script>

<style scoped></style>