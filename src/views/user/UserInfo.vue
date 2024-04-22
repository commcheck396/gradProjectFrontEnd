<script setup>
import { ref } from 'vue'
import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore();
import { ElMessage } from 'element-plus'

const userInfo = ref({ ...userInfoStore.info })

import { useTokenStore } from '@/stores/token';
const tokenStore = useTokenStore();

import avatar from '@/assets/default.png'
import uploading from '@/assets/uploading.png'
const uploadRef = ref()

const imgUrl = ref(userInfoStore.info.avatar)

const rules = {
    nickname: [
        { required: false, message: '请输入个性签名', trigger: 'blur' },
        {
            pattern: /^\S{2,100}$/,
            message: '个性签名必须是2-100位的非空字符串',
            trigger: 'blur'
        }
    ],
    email: [
        { required: false, message: '请输入用户邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ]
}


import { updateUserInfoService, UserAvatarUpdateService } from '@/api/user.js'
const updateUserInfo = async () => {
    let result = await updateUserInfoService(userInfo.value)
    if (result.code === 0) {
        ElMessage.success("个人信息修改成功")
        userInfoStore.setInfo(userInfo.value)
        console.log(userInfoStore.info);
    } else {
        ElMessage.error("修改失败")
    }
    if (avatarFlag.value) {
        let result = await UserAvatarUpdateService(imgUrl.value)
        if (result.code === 0) {
            ElMessage.success("头像修改成功")
            userInfoStore.setInfo({ ...userInfoStore.info, avatar: imgUrl.value })
        } else {
            ElMessage.error("头像修改失败")
        }
    }
}

let avatarFlag = ref(false)

const uploadSuccess = (response) => {
    imgUrl.value = response.data;
    avatarFlag.value = true;
    commitDisabled.value = false;
    ElMessage.success('头像上传成功')
}

let commitDisabled = ref(false)

const beforeUploadAvatar = (file) => {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isJPG && !isPNG) {
        ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
    }
    if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!')
    }
    commitDisabled.value = (isJPG || isPNG) && isLt2M ? true : false
    return (isJPG || isPNG) && isLt2M
}

</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <div style="display: flex; justify-content: space-between;">
                    <span>基本资料</span>
                    <el-button type="primary" @click="updateUserInfo" :disabled="commitDisabled"
                        size="large">提交修改</el-button>
                </div>
            </div>

        </template>
        <el-row>
            <el-col :span="10">
                <el-form :model="userInfo" :rules="rules" label-width="100px" size="large">
                    <el-form-item label="ID">
                        <el-tag size="large" style="margin-left: 5px;">{{ userInfo.id }}</el-tag>
                    </el-form-item>
                    <el-form-item label="用户名称" prop="username">
                        <el-tag size="large" style="margin-left: 5px;">{{ userInfo.username }}</el-tag>
                    </el-form-item>
                    <el-form-item label="用户邮箱" prop="email">
                        <el-tag size="large" style="margin-left: 5px;">{{ userInfo.email }}</el-tag>
                    </el-form-item>
                    <el-form-item label="个性签名" prop="nickname">
                        <el-input v-model="userInfo.nickname" maxlength="100" show-word-limit type="textarea" />
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="7" style="margin-left: 130px;">
                <el-upload ref="uploadRef" class="avatar-uploader" :show-file-list="false" :auto-upload="true"
                    action="/api/upload" name="file" :headers="{
                        'Authorization': tokenStore.token
                    }" :on-success="uploadSuccess" :before-upload="beforeUploadAvatar">
                    <el-avatar v-if="commitDisabled" shape="square" :size="200" :fit="fit" :src="uploading" />
                    <el-avatar v-else-if="imgUrl" shape="square" :size="200" :fit="fit" :src="imgUrl" />
                    <el-avatar v-else shape="square" :size="200" :fit="fit" :src="avatar" />
                </el-upload>
                <br />
                <el-button type="success" :icon="Plus" size="small"
                    @click="uploadRef.$el.querySelector('input').click()" :disabled="commitDisabled"
                    style="width: 200px;">
                    <div v-if="commitDisabled">头像上传中</div>
                    <div v-else>修改头像</div>
                </el-button>
                <!-- <el-button type="success" :icon="Upload" size="large">
                    上传头像
                </el-button> -->
            </el-col>
        </el-row>
    </el-card>
</template>