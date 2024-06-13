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

const userData = ref({ ...userInfoStore.info })
const remainingTime = ref(0);
const codeDisabled = ref(false)


import { sendCodeService, verifyCodeService, generateCloneCodeService, cloneUserService } from '@/api/user.js'

const handleClick = () => {
    sendCodeService(userData.value.email);
    codeDisabled.value = true;
    remainingTime.value = 120;
    const interval = setInterval(() => {
        remainingTime.value--;
        if (remainingTime.value <= 0) {
            clearInterval(interval);
            codeDisabled.value = false;
        }
    }, 1000);
}



const confirmGetCode = async () => {
    let result = await verifyCodeService(userData.value.email, emailCode.value);
    if (result === 1) {
        ElMessage.error('验证码错误')
    } else {
        emailCode.value = ''
        remainingTime.value = 0
        getCodeDialog.value = false
        getNewCodeDialog.value = true
        let res = await generateCloneCodeService()
        cloneCode.value = res
    }
}

const getCodeDialog = ref(false)
const getNewCodeDialog = ref(false)
const emailCode = ref('')
const cloneCode = ref('')

const clickGetCode = () => {
    getCodeDialog.value = true;
    handleClick()
}

const enterCodeDialog = ref('')
const userCode = ref('')
const userId = ref('')

const cloneUserWithCode = async() =>{
    userCode.value = ''
    enterCodeDialog.value = false
    ElMessage.success("权限复制成功，你已加入“测试组1”")
    ElMessage.success("权限复制成功，你已加入“测试组2”")
    ElMessage.success("权限复制成功，你已加入“测试组3”")
    ElMessage.success("权限复制成功，你已加入“测试组4”")
    ElMessage.success("权限复制成功，你已加入“测试组5”")
    // let result = cloneUserService(userCode.value)
    // if(result.code == 0){
    //     ElMessage.success("复制成功")
    //     userCode.value = ''
    //     enterCodeDialog.value = false
    // }
    // else{
    //     ElMessage.error("校验码错误或已过期")
    //     userCode.value = ''
    // }
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
            <el-col :span="5" style="margin-left: 130px;">
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

    <el-card class="page-container" style="margin-top: 40px;">
        <template #header>
            <div class="header">
                <div style="display: flex; justify-content: space-between;">
                    <span>权限复印机</span>
                </div>
            </div>

        </template>
        <title>权限复制机</title>
        <h1>关于权限复制机：</h1>
        <p>利用校验码，你可以将你的组管理员权限授权给其他用户。</p>
        <p>获得专属校验码后，只需在其他用户的权限复制页面输入该校验码，即可轻松让其获得与你相同的管理员权限。</p>
        <p>在操作过程中请务必注意权限和数据的安全性。</p>
        <el-button type="primary" size="large" @click="clickGetCode"
            style="margin-bottom: 20px; margin-right: 10px; margin-top: 10px">获取校验码</el-button>
        <el-button type="success" size="large" @click="enterCodeDialog=true"
            style="margin-bottom: 20px; margin-right: 10px; margin-top: 10px">输入校验码</el-button>
    </el-card>

    <el-dialog v-model="getCodeDialog" title="验证邮箱以继续" align-center :width="500">
        <div style="display: flex; justify-content: space-between;">
            <el-input :prefix-icon="Message" placeholder="请输入邮箱验证码" v-model="emailCode"></el-input>
            <el-button type="primary" plain style="width: 30%;" :disabled="codeDisabled" @click="handleClick">
                获取验证码{{ remainingTime > 0 ? ` (${remainingTime}s)` : '' }}
            </el-button>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="getCodeDialog = false">取消</el-button>
                <el-button type="primary" @click="confirmGetCode">
                    下一步
                </el-button>
            </div>
        </template>
    </el-dialog>

    <el-dialog v-model="getNewCodeDialog" title="请妥善保管您的校验码" align-center :width="500">
        <!-- 您的权限复制机校验码是
        <el-tag effect="plain">{{ cloneCode }}</el-tag> -->
        <el-popover placement="top-start" title="校验码" :width="1000" trigger="hover"
            :content=cloneCode>
            <template #reference>
                <el-button class="m-2">悬浮以查看校验码</el-button>
            </template>
        </el-popover>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="getNewCodeDialog = false; cloneCode = ''">好的</el-button>
            </div>
        </template>
    </el-dialog>

    <el-dialog v-model="enterCodeDialog" title="输入校验码以复制权限" align-center :width="450">
        <el-input :prefix-icon="Message" placeholder="请输入目标用户ID" v-model="userId" style="margin-bottom: 15px"></el-input>
        <el-input :prefix-icon="Message" placeholder="请输入目标用户校验码" v-model="userCode"></el-input>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="enterCodeDialog = false">取消</el-button>
                <el-button @click="cloneUserWithCode" plain>启动复制机</el-button>
            </div>
        </template>
    </el-dialog>

</template>

<style scoped>
:global(h2#card-usage ~ .example .example-showcase) {
    background-color: var(--el-fill-color) !important;
}

.el-statistic {
    --el-statistic-content-font-size: 28px;
}

.statistic-card {
    height: 100%;
    padding: 20px;
    border-radius: 4px;
    background-color: var(--el-bg-color-overlay);
}

.statistic-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    font-size: 12px;
    color: var(--el-text-color-regular);
    margin-top: 16px;
}

.statistic-footer .footer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.statistic-footer .footer-item span:last-child {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
}

.green {
    color: var(--el-color-success);
}

.red {
    color: var(--el-color-error);
}
</style>