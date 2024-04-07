<script setup>
import {
    Management,
    Promotion,
    UserFilled,
    User,
    Crop,
    EditPen,
    SwitchButton,
    CaretBottom
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'
</script>

<template>
    <el-container class="layout-container">
        <!-- 左侧菜单 -->
        <el-aside width="200px">
            <div class="el-aside__logo"></div>
            <el-menu active-text-color="#ffd04b" background-color="#232323" text-color="#fff" router>
                <el-menu-item index="/dashboard">
                    <el-icon>
                        <Management />
                    </el-icon>
                    <span>Dashboard</span>
                </el-menu-item>
                <el-sub-menu index="group">
                    <template #title>
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        <span>组</span>
                    </template>
                    <el-menu-item index="/group/all">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>所有组</span>
                    </el-menu-item>
                    <el-menu-item index="/group/ijoined">
                        <el-icon>
                            <Crop />
                        </el-icon>
                        <span>我加入的组</span>
                    </el-menu-item>
                    <el-menu-item index="/group/iadmin">
                        <el-icon>
                            <EditPen />
                        </el-icon>
                        <span>我管理的组</span>
                    </el-menu-item>
                    <el-menu-item index="/group/iown">
                        <el-icon>
                            <EditPen />
                        </el-icon>
                        <span>我创建的组</span>
                    </el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="tickets">
                    <template #title>
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        <span>工单</span>
                    </template>
                    <el-menu-item index="/ticket/assignedtome">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>待审批工单</span>
                    </el-menu-item>
                    <el-menu-item index="/ticket/icreated">
                        <el-icon>
                            <Crop />
                        </el-icon>
                        <span>我创建的工单</span>
                    </el-menu-item>
                    <el-menu-item index="/ticket/iwatch">
                        <el-icon>
                            <EditPen />
                        </el-icon>
                        <span>我关注的工单</span>
                    </el-menu-item>
                    <el-menu-item index="/ticket/all/assignedtome">
                        <el-icon>
                            <EditPen />
                        </el-icon>
                        <span>我审批的工单</span>
                    </el-menu-item>
                    <el-menu-item index="/ticket/all">
                        <el-icon>
                            <EditPen />
                        </el-icon>
                        <span>所有工单</span>
                    </el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="manage">
                    <template #title>
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        <span>管理</span>
                    </template>
                    <el-menu-item index="/manage/rootadminapproval">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>根管理员申请</span>
                    </el-menu-item>
                    <el-menu-item index="/manage/groupadminapproval">
                        <el-icon>
                            <Crop />
                        </el-icon>
                        <span>组管理员申请</span>
                    </el-menu-item>
                    <el-menu-item index="/manage/grouptransferapproval">
                        <el-icon>
                            <EditPen />
                        </el-icon>
                        <span>组转让申请</span>
                    </el-menu-item>
                    <el-menu-item index="/manage/groupmemberapproval">
                        <el-icon>
                            <EditPen />
                        </el-icon>
                        <span>加入组申请</span>
                    </el-menu-item>
                </el-sub-menu>
                <el-menu-item>
                    <el-icon>
                        <Management />
                    </el-icon>
                    <span>消息</span>
                </el-menu-item>
                <el-menu-item index="/user/info">
                    <el-icon>
                        <Management />
                    </el-icon>
                    <span>个人中心</span>
                </el-menu-item>
                <el-menu-item>
                    <el-icon>
                        <Management />
                    </el-icon>
                    <span>注销</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <!-- 右侧主区域 -->
        <el-container>
            <!-- 头部区域 -->
            <el-header>
                <div>usnm：<strong>cmck</strong></div>
                <el-dropdown placement="bottom-end">
                    <span class="el-dropdown__box">
                        <el-avatar :src="avatar" />
                        <el-icon>
                            <CaretBottom />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="profile" :icon="User">基本资料</el-dropdown-item>
                            <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
                            <el-dropdown-item command="password" :icon="EditPen">重置密码</el-dropdown-item>
                            <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <!-- 中间区域 -->
            <el-main>
                <!-- <div style="width: 1290px; height: 570px;border: 1px solid red;">
                    内容展示区
                </div> -->
                <router-view></router-view>
            </el-main>
            <!-- 底部区域 -->
            <el-footer>footer</el-footer>
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