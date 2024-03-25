<script lang="ts" setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref } from 'vue'
const isRegister = ref(false)
const tabPosition = ref('top')
const activeName = ref('Login')
function handleTabClick(name) {
    if (name === 'Register') {
        isRegister.value = true
    } else {
        isRegister.value = false
    }
    console.log(name)
}
const userData = ref({
    username: '',
    password: '',
    rePassword: ''
})

import { reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const ruleFormRef = ref<FormInstance>()

const checkAge = (rule: any, value: any, callback: any) => {
    if (!value) {
        return callback(new Error('Please input the age'))
    }
    setTimeout(() => {
        if (!Number.isInteger(value)) {
            callback(new Error('Please input digits'))
        } else {
            if (value < 18) {
                callback(new Error('Age must be greater than 18'))
            } else {
                callback()
            }
        }
    }, 1000)
}

const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the password'))
    } else {
        if (ruleForm.checkPass !== '') {
            if (!ruleFormRef.value) return
            ruleFormRef.value.validateField('checkPass', () => null)
        }
        callback()
    }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('Please input the password again'))
    } else if (value !== ruleForm.pass) {
        callback(new Error("Two inputs don't match!"))
    } else {
        callback()
    }
}

const ruleForm = reactive({
    pass: '',
    checkPass: '',
    age: '',
})

const rules = reactive<FormRules<typeof ruleForm>>({
    pass: [{ validator: validatePass, trigger: 'blur' }],
    checkPass: [{ validator: validatePass2, trigger: 'blur' }],
    age: [{ validator: checkAge, trigger: 'blur' }],
})

const submitForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            console.log('submit!')
        } else {
            console.log('error submit!')
            return false
        }
    })
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}

</script>

<template>

    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <el-tabs v-model='activeName' :tab-position="tabPosition" @tab-change="handleTabClick">
                <el-tab-pane label="Login" name="Login"></el-tab-pane>
                <el-tab-pane label="Register" name="Register"></el-tab-pane>
                <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon :rules="rules"
                    label-width="auto" class="demo-ruleForm" v-if="isRegister">
                    <el-form-item>
                        <el-input v-model="ruleForm.age" :prefix-icon="Lock" placeholder="请输入用户名" ></el-input>
                    </el-form-item>
                    <el-form-item label="Password" prop="pass">
                        <el-input v-model="ruleForm.pass" type="password" autocomplete="off"  placeholder="rules"/>
                    </el-form-item>
                    <el-form-item label="Confirm" prop="checkPass">
                        <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" placeholder="comfirm your pswd"/>
                    </el-form-item>
                    <!-- 注册按钮 -->
                    <el-form-item>
                        <el-button class="button" type="primary" auto-insert-space>
                            注册
                        </el-button>
                    </el-form-item>
                </el-form>
                <!-- 登录表单 -->
                <el-form ref="form" size="large" autocomplete="off" v-else>
                    <el-form-item>
                        <el-input :prefix-icon="User" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码"></el-input>
                    </el-form-item>
                    <el-form-item class="flex">
                        <div class="flex">
                            <el-checkbox>记住我</el-checkbox>
                            <el-link type="primary" :underline="false">忘记密码？</el-link>
                        </div>
                    </el-form-item>
                    <!-- 登录按钮 -->
                    <el-form-item>
                        <el-button class="button" type="primary" auto-insert-space>登录</el-button>
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