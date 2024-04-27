<script setup lang="ts">
import { Edit, Delete } from "@element-plus/icons-vue";
import { ref, onMounted, nextTick, computed } from "vue";
import { useRouter } from 'vue-router'
const router = useRouter()
const allTickets = ref([]);
import { ElLoading, namespaceContextKey } from 'element-plus'

import { ElMessage } from "element-plus";
import { CircleCloseFilled, CirclePlusFilled, RemoveFilled, DeleteFilled, InfoFilled, CaretBottom, CaretTop, Flag, WarningFilled, Search, AddLocation, SemiSelect, UploadFilled, SuccessFilled, Check, Close } from '@element-plus/icons-vue'
import { getAllGroups, getAllGroupNames } from "@/api/group.js";

import { getCategoryTicketsService, getStatusByTicketId, getTicketById, getAllTicketsService, getTicketIdIWatchingService, watchTicketService, unwatchTicketService, getAllTicketTitle } from "@/api/ticket.js";

import { getAllRequestForCurrentUser, approveRequest, rejectRequest } from '@/api/message.js'

const requestList = ref([])
const requestNum = ref(0)

import { getNameById, getAllNames } from "@/api/user.js";

let allNames = ref({})
const getNames = async () => {
    let idNames = await getAllNames()
    allNames.value = idNames;
}

let allGroupNames = ref({})

const getAllGroups = async () => {
    allGroupNames.value = await getAllGroupNames();
}

// let allTicketTitles = ref({})
// const getTicketTitles = async () => {
//     let idTitles = await getAllTicketTitle();
//     allTicketTitles.value = idTitles;
//     console.log(allTicketTitles.value);
// }


const getRequestList = async () => {
    const allGroupLoading = ElLoading.service({
        lock: true,
        text: '请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    await getNames()
    await getAllGroups()
    requestList.value = await getAllRequestForCurrentUser();
    requestNum.value = requestList.value.length;
    allGroupLoading.close();

}

getRequestList();


const search = ref('')
const filterTableData = computed(() =>
    requestList.value.filter(
        (data) =>
            !search.value ||
            data.id.toLowerCase().includes(search.value.toLowerCase()) ||
            (data.message && data.message.toLowerCase().includes(search.value.toLowerCase()))
    )
)

const getCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const currentDate = getCurrentTime();

const handleApprove = async (id) => {
    const res = await approveRequest(id);
    if (res == 0) {
        ElMessage.success("操作成功");
        getRequestList();
    } else {
        ElMessage.error("操作失败");
    }
}

const dialogVisible = ref(false);

const messageModel = ref({
    reason: "",
});

const rules = {
    reason: [{ required: true, message: "请输入驳回理由", trigger: "blur" }],
};

const currentMessageId = ref(0);

const handleReject = async () => {
    const res = await rejectRequest(currentMessageId.value, messageModel.value.reason);
    if (res == 0) {
        ElMessage.success("操作成功");
        getRequestList();
    } else {
        ElMessage.error("操作失败");
    }
    dialogVisible.value = false;
    messageModel.value.reason = "";
}

const redirectToTicket = (id) => {
    router.push('/ticket/detail/' + id)
}



</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>所有申请</span>
                <div class="extra">
                    <el-input v-model="search" size="large" style="text-align: right; width: 240px; margin-right: 40px;"
                        :prefix-icon="Search" placeholder="输入以查询工单" />
                </div>
            </div>
        </template>
        <el-table :data="filterTableData" stripe table-layout="auto" @row-click=""
            :default-sort="{ prop: 'id', order: 'ascending' }">
            <el-table-column fixed label="序号" width="80" prop="id" sortable> </el-table-column>
            <el-table-column label="申请者" prop="sender" style="width: 200">
                <template #default="scope">
                    <el-popover effect="light" trigger="hover" placement="top" width="auto">
                        <template #default>
                            <div>
                                拥有者名称: {{ allNames[scope.row.sender] }} <br />
                                拥有者ID: {{ scope.row.sender }}
                            </div>
                        </template>
                        <template #reference>
                            <el-tag effect="light" round>{{ allNames[scope.row.sender] }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="申请类别" prop="type" sortable>
                <template #default="scope">
                    <el-tag effect="info" round v-if="scope.row.type == 1">申请加入组</el-tag>
                    <el-tag effect="info" round v-else-if="scope.row.type == 2">申请组管理员</el-tag>
                    <el-tag effect="info" round v-else-if="scope.row.type == 3">工单审批提示</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="目标" prop="type" sortable>
                <template #default="scope">
                    <div v-if="scope.row.type == 1">
                        <el-popover effect="light" trigger="hover" placement="top" width="auto">
                            <template #default>
                                <div>
                                    申请加入组: {{ allGroupNames[scope.row.receiver] }} <br />
                                    组ID: {{ scope.row.receiver }}
                                </div>
                            </template>
                            <template #reference>
                                <el-tag effect="light" round> 加入组 {{ allGroupNames[scope.row.receiver] }}</el-tag>
                            </template>
                        </el-popover>
                    </div>
                    <div v-else-if="scope.row.type == 2">
                        <el-popover effect="light" trigger="hover" placement="top" width="auto">
                            <template #default>
                                <div>
                                    申请组 {{ allGroupNames[scope.row.receiver] }} 管理员 <br />
                                    组ID: {{ scope.row.receiver }}
                                </div>
                            </template>
                            <template #reference>
                                <el-tag effect="light" round> 组 {{ allGroupNames[scope.row.receiver] }} 管理员</el-tag>
                            </template>
                        </el-popover>
                    </div>
                    <el-tag effect="info" round v-else-if="scope.row.type == 3">工单审批提示</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="状态" prop="state" sortable>
                <template #default="scope">
                    <el-tag effect="success" round v-if="scope.row.status == 1">已通过</el-tag>
                    <el-tag effect="danger" round v-else-if="scope.row.status == 2">已驳回</el-tag>
                    <el-tag effect="primary" round v-else-if="scope.row.status == 0">进行中</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="申请时间" prop="createdTime" sortable>
                <template #default="scope">
                    {{ scope.row.createdTime }}
                </template>
            </el-table-column>
            <el-table-column label="更新时间" prop="updatedTime" sortable>
                <template #default="scope">
                    {{ scope.row.updatedTime }}
                </template>
            </el-table-column>
            <el-table-column label="更新于" prop="sender" style="width: 200">
                <template #default="scope">
                    <el-popover effect="light" trigger="hover" placement="top" width="auto">
                        <template #default>
                            <div>
                                最后编辑者名称: {{ allNames[scope.row.lastEditedBy] }} <br />
                                最后编辑者ID: {{ scope.row.lastEditedBy }}
                            </div>
                        </template>
                        <template #reference>
                            <el-tag effect="light" round>{{ allNames[scope.row.lastEditedBy] }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="消息" prop="message">
                <template #default="scope">
                    {{ scope.row.message }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
                <template #default="scope">
                    <div v-if="scope.row.type != 3">
                        <el-popconfirm title="你确认通过这条申请吗?" confirm-button-text="是" cancel-button-text="取消"
                            :icon="InfoFilled" icon-color="green" @confirm="handleApprove(scope.row.id)">
                            <template #reference>
                                <el-button :icon="Check" circle plain type="success" @click.stop
                                    :disabled="scope.row.status != 0"></el-button>
                            </template>
                        </el-popconfirm>
                        <el-button :icon="Close" circle plain type="danger"
                            @click="dialogVisible = true; currentMessageId = scope.row.id"
                            :disabled="scope.row.status != 0"></el-button>
                    </div>
                    <div v-else>
                        <el-button type="primary" size="mini" @click="redirectToTicket(scope.row.target)"
                            :disabled="scope.row.status != 0" plain>查看工单</el-button>
                    </div>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        <div style="margin-top: 10px">
        </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="请输入驳回意见" width="50%">
        <el-form :model="messageModel" :rules="rules" label-width="100px" style="padding-right: 30px; margin: 30px">
            <el-form-item label="驳回意见" prop="categoryName">
                <el-input v-model="messageModel.reason" minlength="1" maxlength="10"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false; messageModel.reason=''">取消</el-button>
                <el-button type="primary" @click="handleReject">
                    确认
                </el-button>
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

    .el-table {
        max-height: 100%;
    }
}

.avatar-uploader {
    :deep() {
        .avatar {
            width: 178px;
            height: 178px;
            display: block;
        }

        .el-upload {
            border: 1px dashed var(--el-border-color);
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);
        }

        .el-upload:hover {
            border-color: var(--el-color-primary);
        }

        .el-icon.avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            text-align: center;
        }
    }
}

.editor {
    width: 100%;

}
</style>
