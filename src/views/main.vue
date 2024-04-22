<script setup>
import {
    Management,
    Promotion,
    UserFilled,
    User,
    Crop,
    EditPen,
    SwitchButton,
    CaretBottom,
    TrendCharts,
    List,
    Grid,
    BellFilled,
    HelpFilled,
    RemoveFilled,
    Tickets,
    Monitor,
    Help
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'

import { userInfoService } from '@/api/user.js'
import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore();
const getUserInfo = async () => {
    let result = await userInfoService();
    userInfoStore.setInfo(result.data);
}
getUserInfo()

import { useRouter } from 'vue-router';
const router = useRouter();

import { ElMessageBox, ElMessage } from 'element-plus';
import { useTokenStore } from '@/stores/token';
const tokenStore = useTokenStore();


const handleCommand = (command) => {
    if (command === 'logout') {
        ElMessageBox.confirm(
            '确定要注销登录吗？',
            '提示',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
            .then(() => {
                ElMessage({
                    type: 'success',
                    message: '注销成功',
                })
                tokenStore.removeToken();
                userInfoStore.removeInfo();
                router.push('/login');
            })
            .catch(() => {
                ElMessage({
                    type: 'info',
                    message: '取消注销操作',
                })
            })

    } else {
        router.push(`/user/${command}`);
    }
}

</script>

<template>
    <el-container class="layout-container">
        <!-- 左侧菜单 -->
        <el-aside width="200px">
            <div class="el-aside__logo"></div>
            <el-menu active-text-color="#ffd04b" background-color="#232323" text-color="#fff" router>
                <el-menu-item index="/dashboard">
                    <el-icon>
                        <TrendCharts />
                    </el-icon>
                    <span>Dashboard</span>
                </el-menu-item>
                <el-sub-menu index="group">
                    <template #title>
                        <el-icon>
                            <HelpFilled />
                        </el-icon>
                        <span>组</span>
                    </template>
                    <el-menu-item index="/group/all">
                        <el-icon>
                            <Help />
                        </el-icon>
                        <span>所有组</span>
                    </el-menu-item>
                    <el-menu-item index="/group/ijoined">
                        <el-icon>
                            <Help />
                        </el-icon>
                        <span>我加入的组</span>
                    </el-menu-item>
                    <el-menu-item index="/group/iadmin">
                        <el-icon>
                            <Help />
                        </el-icon>
                        <span>我管理的组</span>
                    </el-menu-item>
                    <el-menu-item index="/group/iown">
                        <el-icon>
                            <Help />
                        </el-icon>
                        <span>我创建的组</span>
                    </el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="tickets">
                    <template #title>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>工单</span>
                    </template>
                    <el-menu-item index="/ticket/assignedtome">
                        <el-icon>
                            <Tickets />
                        </el-icon>
                        <span>待审批工单</span>
                    </el-menu-item>
                    <el-menu-item index="/ticket/icreated">
                        <el-icon>
                            <Tickets />
                        </el-icon>
                        <span>我创建的工单</span>
                    </el-menu-item>
                    <el-menu-item index="/ticket/iwatch">
                        <el-icon>
                            <Tickets />
                        </el-icon>
                        <span>我关注的工单</span>
                    </el-menu-item>
                    <el-menu-item index="/ticket/all/assignedtome">
                        <el-icon>
                            <Tickets />
                        </el-icon>
                        <span>我审批的工单</span>
                    </el-menu-item>
                    <el-menu-item index="/ticket/all">
                        <el-icon>
                            <Tickets />
                        </el-icon>
                        <span>所有工单</span>
                    </el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="manage">
                    <template #title>
                        <el-icon>
                            <Management />
                        </el-icon>
                        <span>管理</span>
                    </template>
                    <el-menu-item index="/manage/myapplication">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>我的申请</span>
                    </el-menu-item>
                    <el-menu-item index="/manage/myapproval">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>我的审批</span>
                    </el-menu-item>
                    <!-- <el-menu-item index="/manage/grouptransferapproval">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>组转让申请</span>
                    </el-menu-item>
                    <el-menu-item index="/manage/groupmemberapproval">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>加入组申请</span>
                    </el-menu-item> -->
                </el-sub-menu>
                <el-menu-item index="/notification">
                    <el-icon>
                        <BellFilled />
                    </el-icon>
                    <span>消息</span>
                </el-menu-item>
                <el-menu-item index="/user/info">
                    <el-icon>
                        <UserFilled />
                    </el-icon>
                    <span>个人中心</span>
                </el-menu-item>
                <el-menu-item>
                    <el-icon>
                        <RemoveFilled />
                    </el-icon>
                    <span>注销</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <!-- 右侧主区域 -->
        <el-container>
            <!-- 头部区域 -->
            <el-header>
                <div style="display: flex; justify-content: flex-start;">
                    <div>当前用户: <strong>{{ userInfoStore.info.username }}</strong></div>
                    <el-tag type="info" style="margin-left: 30px;" effect="dark">ID: {{ userInfoStore.info.id
                        }}</el-tag>
                </div>
                <div style="display: flex; justify-content: flex-start;">
                    <el-badge :value="1" is-dot class="item">
                        <el-button type="info" :icon="BellFilled" circle size="large" @click="router.push('/notification')" />
                    </el-badge>
                    <el-dropdown placement="bottom-end" @command="handleCommand" style="margin-left: 30px;">
                        <span class="el-dropdown__box">
                            <el-avatar :src="userInfoStore.info.avatar ? userInfoStore.info.avatar : avatar" />
                            <el-icon>
                                <CaretBottom />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="info" :icon="User">个人信息</el-dropdown-item>
                                <el-dropdown-item command="resetEmail" :icon="Crop">修改邮箱</el-dropdown-item>
                                <el-dropdown-item command="resetPassword" :icon="EditPen">重置密码</el-dropdown-item>
                                <el-dropdown-item command="logout" :icon="SwitchButton">注销</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>
            <!-- 中间区域 -->
            <el-main>
                <!-- <div style="width: 1290px; height: 570px;border: 1px solid red;">
                    内容展示区
                </div> -->
                <router-view></router-view>
            </el-main>
            <!-- 底部区域
            <el-footer>footer</el-footer> -->
        </el-container>
    </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
    height: 100vh;

    .el-aside {
        background-color: #232323;

        &__logo {
            height: 120px;
            background: url('@/assets/logo.png') no-repeat center / 120px auto;
        }

        .el-menu {
            border-right: none;
        }
    }

    .el-header {
        background-color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .el-dropdown__box {
            display: flex;
            align-items: center;

            .el-icon {
                color: #999;
                margin-left: 10px;
            }

            &:active,
            &:focus {
                outline: none;
            }
        }
    }

    .el-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #666;
    }
}
</style>