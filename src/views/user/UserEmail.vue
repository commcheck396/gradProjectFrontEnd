<script lang="ts" setup>

import { ElCard, ElInput, ElMessage } from 'element-plus';
import { User, Lock, More, Message } from '@element-plus/icons-vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router'
const router = useRouter()

import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore();

const userData = ref({ ...userInfoStore.info })
const hiddenEmail = ref('')
hiddenEmail.value = hideEmail(userData.value.email);


const username = ref('')
const password = ref('')
const rePassword = ref('')
const code = ref('')
const newEmail = ref('')

const codeSent = ref(true)

const codeCorrect = ref(false)

const remainingTime = ref(0);
const codeDisabled = ref(false)

import { sendCodeService, verifyCodeService, forgetPasswordGetUserByNameService, resetPasswordService, updateUserInfoService, resetEmailService } from '@/api/user.js'

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

handleClick()

const handleClickForNewEmail = () => {
    if (newEmail.value === '') {
        ElMessage.error('邮箱不能为空')
        return;
    }
    else if(!isEmail(newEmail.value)){
        ElMessage.error('请输入正确的邮箱地址')
        return;
    }
    sendCodeService(newEmail.value);
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

function hideEmail(email) {
    const [localPart, domain] = email.split('@');
    if (localPart.length < 5) {
        return email;
    }
    const visibleStart = localPart.slice(0, 2);
    const visibleEnd = localPart.slice(-2);
    const stars = '*'.repeat(localPart.length - 4);
    console.log(`${visibleStart}${stars}${visibleEnd}@${domain}`);
    console.log(email);
    return `${visibleStart}${stars}${visibleEnd}@${domain}`;
}




const verifyCode = async () => {
    let result = await verifyCodeService(userData.value.email, code.value);
    if (result === 1) {
        ElMessage.error('验证码错误')
    } else {
        code.value = ''
        remainingTime.value = 0
        codeSent.value = false;
        codeCorrect.value = true;
    }
}

const verifyCodeForNewEmail = async () => {
    let result = await verifyCodeService(newEmail.value, code.value);
    if (result === 1) {
        ElMessage.error('验证码错误')
    } else {
        modifyEmail()
        code.value = ''
        remainingTime.value = 0
        codeSent.value = false;
        codeCorrect.value = true;
    }
}

const isEmail = (email) => {
    const reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    return reg.test(email);
}



const modifyEmail = async () => {
    let result = await resetEmailService(newEmail.value);
    if (result.code === 1) {
        ElMessage.error(result.data)
    }
    else {
        ElMessage.success('邮箱修改成功')
        router.push('/user/dsbd')
    }
}



</script>

<template>


    <div style="display: flex; justify-content: center; align-items: center; height: 70%; background-color: #f0f0f0;">
        <el-card style="width: 40%;">
            <template #header>
                <div class="card-header">
                    <span v-if="codeSent">验证您的旧邮箱以继续，验证码已发送至{{ hiddenEmail }}</span>
                    <span v-else-if="codeCorrect">重置邮箱</span>
                </div>
            </template>
            <div v-if="codeSent" style="display: flex; justify-content: space-between;">
                <el-input v-if="codeSent" v-model="code" :prefix-icon="More" placeholder="请输入验证码"></el-input>
                <el-button type="primary" :disabled="codeDisabled" @click="handleClick" plain>发送验证码{{ remainingTime > 0
                        ?
                        `
                    (${remainingTime}s)` : '' }}</el-button>
            </div>
            <div v-if="codeCorrect">
                <!-- <el-input v-model="password" :prefix-icon="Lock" placeholder="请输入新密码" style="margin-bottom: 15px;" type="password" show-password></el-input>
                <el-input v-model="rePassword" :prefix-icon="Lock" placeholder="请再次输入新密码" type="password" show-password></el-input> -->
                <el-input v-model="newEmail" :prefix-icon="More" placeholder="请输入您的新邮箱"
                    style="margin-bottom: 15px;"></el-input>
                <div style="display: flex; justify-content: space-between;">
                    <el-input :prefix-icon="Message" placeholder="请输入邮箱验证码" v-model="code"></el-input>
                    <el-button type="primary" plain style="width: 30%;" :disabled="codeDisabled" @click="handleClickForNewEmail">
                        获取验证码{{ remainingTime > 0 ? ` (${remainingTime}s)` : '' }}
                    </el-button>
                </div>
            </div>
            <template #footer>
                <div v-if="codeSent">
                    <el-button type="primary" @click="verifyCode">下一步</el-button>
                </div>
                <div v-else-if="codeCorrect">
                    <el-button type="primary" @click="verifyCodeForNewEmail">完成</el-button>
                </div>
            </template>
        </el-card>
    </div>
</template>