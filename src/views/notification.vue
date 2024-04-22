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

import { getAllRequestForCurrentUser, approveRequest, rejectRequest, getAllRequestOfCurrentUser } from '@/api/message.js'

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
    requestList.value = await getAllRequestOfCurrentUser();
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

const clickRow = async (row) => {
    if(row.type == 3) {
        redirectToTicket(row.target);
    }
    else if(row.status == 0 || row.status == 2) {
        router.push('/group/all')
    }
    else if(row.type == 1) {
        router.push('/group/ijoined')
    }
    else if(row.type == 2) {
        router.push('/group/iadmin')
    }
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
        <el-table :data="filterTableData" stripe table-layout="auto" @row-click="clickRow"
            :default-sort="{ prop: 'updatedTime', order: 'decending' }">
            <el-table-column label="发件人" prop="sender" style="width: 200">
                <template #default="scope">
                    <el-popover effect="light" trigger="hover" placement="top" width="auto">
                        <template #default>
                            <div>
                                名称: {{ allNames[scope.row.lastEditedBy] }} <br />
                                ID: {{ scope.row.lastEditedBy }}
                            </div>
                        </template>
                        <template #reference>
                            <el-tag effect="light" round>{{ allNames[scope.row.lastEditedBy] }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="消息类别" prop="type" sortable>
                <template #default="scope">
                    <el-tag effect="info" round v-if="scope.row.type == 1">申请加入组</el-tag>
                    <el-tag effect="info" round v-else-if="scope.row.type == 2">申请组管理员</el-tag>
                    <el-tag effect="info" round v-else-if="scope.row.type == 3">工单审批提示</el-tag>
                    <el-tag effect="info" round v-else>其他</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="状态" prop="state" sortable>
                <template #default="scope">
                    <el-tag effect="success" round v-if="scope.row.status == 1">已通过</el-tag>
                    <el-tag effect="danger" round v-else-if="scope.row.status == 2">已驳回</el-tag>
                    <el-tag effect="primary" round v-else-if="scope.row.status == 0">进行中</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="消息" prop="message" width="1000">
                <template #default="scope">
                    {{ scope.row.message }}
                </template>
            </el-table-column>
            <el-table-column label="发送时间" prop="updatedTime" sortable>
                <template #default="scope">
                    {{ scope.row.updatedTime }}
                </template>
            </el-table-column>
        </el-table>

        <div style="margin-top: 10px">
        </div>
    </el-card>

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
