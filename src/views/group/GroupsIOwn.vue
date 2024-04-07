<script setup>
import {
    Edit,
    Delete
} from '@element-plus/icons-vue'
import { ref } from 'vue'

const categorys = ref([])

import { ElMessage } from 'element-plus';

import {getAllGroups} from '@/api/group.js'
const allGroups = async () => {
    let res = await getAllGroups()
    console.log(res)
    categorys.value = res.data
}

allGroups()

const dialogVisible = ref(false)

const categoryModel = ref({
    categoryName: '',
    categoryDetail: ''
})

const rules = {
    categoryName: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
    ],
    categoryDetail: [
        { required: false, message: '请输入分类详情', trigger: 'blur' },
    ]
}

import {addGroup} from '@/api/group.js' 

const addCategory = async() => {
    console.log(categoryModel.value)
    let result = await addGroup(categoryModel.value)
    ElMessage.success("创建成功")
    allGroups()
    dialogVisible.value = false
}


</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>文章分类</span>
                <div class="extra">
                    <el-button type="primary" @click="dialogVisible = true">添加组</el-button>
                </div>
            </div>
        </template>
        <el-table :data="categorys" style="width: 100%">
            <el-table-column label="序号" width="100" type="index"> </el-table-column>
            <el-table-column label="分类名称" prop="categoryName"></el-table-column>
            <el-table-column label="分类别名" prop="categoryDetail"></el-table-column>
            <el-table-column label="操作" width="100">
                <template #default="{ row }">
                    <el-button :icon="Edit" circle plain type="primary" ></el-button>
                    <el-button :icon="Delete" circle plain type="danger"></el-button>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" title="添加组" width="30%">
    <el-form :model="categoryModel" :rules="rules" label-width="100px" style="padding-right: 30px">
        <el-form-item label="分类名称" prop="categoryName">
            <el-input v-model="categoryModel.categoryName" minlength="1" maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="分类别名" prop="categoryDetail">
            <el-input v-model="categoryModel.categoryDetail" minlength="1" maxlength="15"></el-input>
        </el-form-item>
    </el-form>
    <template #footer>
        <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="addCategory"> 确认 </el-button>
        </span>
    </template>
</el-dialog>
</template>

<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    box-sizing: border-box;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}
</style>