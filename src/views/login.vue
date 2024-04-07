<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {useRouter} from 'vue-router'
import {useTokenStore} from '@/stores/token.js'

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
    rePassword: ''
})

const validateUsername = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('Please input the username'))
    } else {
        // length between 5 and 16
        if (value.length < 5 || value.length > 16) {
            callback(new Error('The length of the username should be between 5 and 16'))
        }
        callback()
    }
}
const validatePass = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('Please input the password'))
    } else if (value.length < 5 || value.length > 16) {
        callback(new Error('The length of the password should be between 5 and 16'))
    } else {
        callback()
    }

}
const validatePass2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('Please input the password again'))
    } else if (value !== userData.value.password) {
        callback(new Error("Two inputs don't match!"))
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
const register = async() => {
    let result = await userRegisterService(userData.value)
    ElMessage.success(result.message)
}
const login = async() => {
    let result = await userLoginService(userData.value)
    ElMessage.success(result.message)
    tokenStore.setToken(result.data)
    router.push('/main')
}
const clear = () => {
    userData.value.username = ''
    userData.value.password = ''
    userData.value.rePassword = ''
}

</script>

<template>

    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <el-tabs v-model='activeName' :tab-position="tabPosition" @tab-change="handleTabClick">
                <el-tab-pane label="Login" name="Login"></el-tab-pane>
                <el-tab-pane label="Register" name="Register"></el-tab-pane>
                <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :model="userData" :rules="rules">
                    <el-form-item prop="username">
                        <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="userData.username"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input :prefix-icon="Lock" type="password" placeholder="rules"
                            v-model="userData.password"></el-input>
                    </el-form-item>
                    <el-form-item prop="rePassword">
                        <el-input :prefix-icon="Lock" type="password" placeholder="confirm your pswd"
                            v-model="userData.rePassword"></el-input>
                    </el-form-item>
                    <!-- 注册按钮 -->
                    <el-form-item>
                        <el-button class="button" type="primary" auto-insert-space @click="register">
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
                            <el-link type="primary" :underline="false">忘记密码？</el-link>
                        </div>
                    </el-form-item>
                    <!-- 登录按钮 -->
                    <el-form-item>
                        <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
                    </el-form-item>
                </el-form>
            </el-tabs>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
    height: 100vh;
    background-color: #ffffff;

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