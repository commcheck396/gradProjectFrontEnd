<script setup>
import { User, Lock, Message, More } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/token.js'

const isRegister = ref(false)
const tabPosition = ref('top')
const activeName = ref('Login')
const router = useRouter()
const tokenStore = useTokenStore()


onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
        ElMessage.error(message);
    }
});


function handleTabClick(name) {
    if (name === 'Register') {
        isRegister.value = true
    } else {
        isRegister.value = false
    }
    // clear data
    clear()
}
const userData = ref({
    username: '',
    password: '',
    rePassword: '',
    email: ''
})

const validateUsername = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入用户名'))
    } else {
        // length between 5 and 16
        if (value.length < 2 || value.length > 16) {
            callback(new Error('用户名长度应在 2 到 16'))
        }
        callback()
    }
}
const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else if (value.length < 5 || value.length > 16) {
        callback(new Error('密码长度应在 5 到 16'))
    } else {
        callback()
    }

}
const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请重新输入密码'))
    } else if (value !== userData.value.password) {
        callback(new Error("密码不匹配!"))
    } else {
        callback()
    }
}

const rules = {
    username: [{ validator: validateUsername, trigger: 'blur' }],
    password: [{ validator: validatePass, trigger: 'blur' }],
    rePassword: [{ validator: validatePass2, trigger: 'blur' }],
}

import { userRegisterService, userLoginService } from '@/api/user';
const register = async () => {
    let result = await verifyCodeService(userData.value.email, emailCode.value);
    if (result === 1) {
        ElMessage.error('验证码错误')
    } else {
        result = await userRegisterService(userData.value)
        if (result.code === 1) {
            ElMessage.error('当前邮箱已被占用')
            return
        }
        ElMessage.success(result.message)
    }
}

const login = async () => {
    let result = await userLoginService(userData.value)
    ElMessage.success(result.message)
    tokenStore.setToken(result.data)
    router.push('/main')
}
const clear = () => {
    userData.value.username = ''
    userData.value.password = ''
    userData.value.rePassword = ''
    userData.value.email = ''
}
const codeDisabled = ref(false);
const remainingTime = ref(0);

import { sendCodeService, verifyCodeService } from '@/api/user.js'

const isEmail = (email) => {
    const reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    return reg.test(email);
}

const handleClick = () => {
    if (!isEmail(userData.value.email)) {
        ElMessage.error('请输入正确的邮箱地址');
        return;
    }
    sendCodeService(userData.value.email);
    if (codeDisabled.value) return;
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

const emailCode = ref('');

</script>

<template>

    <el-row class="login-page">
        <el-col :span="6" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <el-card>
                <el-tabs v-model='activeName' :tab-position="tabPosition" @tab-change="handleTabClick">
                    <el-tab-pane label="登录" name="Login"></el-tab-pane>
                    <el-tab-pane label="注册" name="Register"></el-tab-pane>
                    <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :model="userData"
                        :rules="rules">
                        <el-form-item prop="username">
                            <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="userData.username"></el-input>
                        </el-form-item>
                        <el-form-item prop="email">
                            <el-input :prefix-icon="Message" placeholder="请输入邮箱" v-model="userData.email"></el-input>
                        </el-form-item>
                        <div style="display: flex; justify-content: space-between;">
                            <el-form-item style="width: 65%;">
                                <el-input :prefix-icon="More" placeholder="请输入邮箱验证码" v-model="emailCode"></el-input>
                            </el-form-item>
                            <el-button type="primary" plain style="width: 30%;" :disabled="codeDisabled"
                                @click="handleClick">
                                获取验证码{{ remainingTime > 0 ? ` (${remainingTime}s)` : '' }}
                            </el-button>
                        </div>
                        <el-form-item prop="password">
                            <el-input :prefix-icon="Lock" type="password" placeholder="请输入你的密码"
                                v-model="userData.password"></el-input>
                        </el-form-item>
                        <el-form-item prop="rePassword">
                            <el-input :prefix-icon="Lock" type="password" placeholder="确认你的密码"
                                v-model="userData.rePassword"></el-input>
                        </el-form-item>
                        <!-- 注册按钮 -->
                        <el-form-item>
                            <el-button class="button" type="primary" auto-insert-space @click="register" plain round>
                                注册
                            </el-button>
                        </el-form-item>
                    </el-form>
                    <!-- 登录表单 -->
                    <el-form ref="form" size="large" autocomplete="off" v-else :model="userData" :rules="rules">
                        <el-form-item prop="username">
                            <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="userData.username"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码"
                                v-model="userData.password"></el-input>
                        </el-form-item>
                        <el-form-item class="flex">
                            <div class="flex">
                                <el-checkbox>记住我</el-checkbox>
                                <el-link type="primary" :underline="false"
                                    href="http://localhost:5173/forgetPassword">忘记密码？</el-link>
                            </div>
                        </el-form-item>
                        <!-- 登录按钮 -->
                        <el-form-item>
                            <el-button class="button" type="primary" auto-insert-space @click="login" plain
                                round>登录</el-button>
                        </el-form-item>
                    </el-form>
                </el-tabs>
            </el-card>

        </el-col>
    </el-row>

</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
    height: 100vh;
    background-color: #dddcdc;

    .bg {
        background: url('@/assets/logo2.svg') no-repeat 60% center / 240px auto,
            url('@/assets/logo2.svg') no-repeat center / cover;
        border-radius: 0 20px 20px 0;
    }

    .form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;

        .title {
            margin: 0 auto;
        }

        .button {
            width: 100%;
        }

        .flex {
            width: 100%;
            display: flex;
            justify-content: space-between;
        }

        .el-tabs {
            .el-tabs__item {
                font-size: 16px;
                color: blue;
                font-weight: bold;
            }
        }
    }

    .custom-tab {
        font-size: 16px;
        color: red;
        font-weight: bold;

    }



}
</style>