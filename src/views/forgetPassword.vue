<script lang="ts" setup>

import { ElCard, ElInput, ElMessage } from 'element-plus';
import { User, Lock, More } from '@element-plus/icons-vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router'
const router = useRouter()

const userData = ref({
    username: '',
    password: '',
    rePassword: '',
    email: ''
})

const username = ref('')
const password = ref('')
const rePassword = ref('')
const code = ref('')

const codeSent = ref(false)

const codeCorrect = ref(false)

const enterName = ref(true)
const remainingTime = ref(0);
const codeDisabled = ref(false)

import { sendCodeService, verifyCodeService, forgetPasswordGetUserByNameService, resetPasswordService } from '@/api/user.js'

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


const enterNameToSendCode = async () => {
    if (username.value === '') {
        ElMessage.error('用户名不能为空')
        return;
    }
    let result = await forgetPasswordGetUserByNameService(username.value);
    if (result.data === null) {
        ElMessage.error('用户不存在')
    } else {
        console.log(result.data);
        userData.value = result.data;
        console.log(userData.value);

        handleClick();
        codeSent.value = true;
        enterName.value = false;
    }
    hiddenEmail.value = hideEmail(userData.value.email);
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

const hiddenEmail = ref('')

const verifyCode = async () => {
    
    let result = await verifyCodeService(userData.value.email, code.value);
    if (result === 1) {
        ElMessage.error('验证码错误')
    } else {
        codeSent.value = false;
        codeCorrect.value = true;
    }
}

const modifyPassword = async () => {
    if (password.value !== rePassword.value) {
        ElMessage.error('两次密码不一致')
        return;
    }
    userData.value.password = password.value;
    let result = await resetPasswordService(password.value, userData.value.id);
    ElMessage.success('密码修改成功')
    router.push('/login')
}



</script>

<template>


    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f0f0;">
        <el-card style="width: 50%;">
            <template #header>
                <div class="card-header">
                    <span v-if="enterName">找回密码</span>
                    <span v-else-if="codeSent">验证码已发送至{{ hiddenEmail }}</span>
                    <span v-else-if="codeCorrect">重置密码</span>
                </div>
            </template>
            <el-input v-if="enterName" v-model="username" :prefix-icon="User" placeholder="请输入用户名"></el-input>
            <el-input v-if="codeSent" v-model="code" :prefix-icon="More" placeholder="请输入验证码"></el-input>
            <div v-if="codeCorrect">
                <el-input v-model="password" :prefix-icon="Lock" placeholder="请输入新密码" style="margin-bottom: 15px;" type="password" show-password></el-input>
                <el-input v-model="rePassword" :prefix-icon="Lock" placeholder="请再次输入新密码" type="password" show-password></el-input>
            </div>
            <template #footer>
                <div v-if="enterName">
                    <el-button v-if="enterName" type="primary" @click="enterNameToSendCode">下一步</el-button>
                </div>
                <div v-else-if="codeSent">
                    <el-button type="primary" :disabled="codeDisabled" @click="handleClick">发送验证码{{ remainingTime > 0 ? `
                        (${remainingTime}s)` : '' }}</el-button>
                    <el-button type="primary" @click="verifyCode">下一步</el-button>
                </div>
                <div v-else-if="codeCorrect">
                    <el-button type="primary" @click="modifyPassword">完成</el-button>
                </div>
            </template>
        </el-card>
    </div>
</template>