<script setup lang="ts">
import { Edit, Delete } from "@element-plus/icons-vue";
import { ref, onMounted, nextTick, computed } from "vue";
import { useRouter } from 'vue-router'
const router = useRouter()
const allTickets = ref([]);
import { ElLoading, namespaceContextKey } from 'element-plus'

import { ElMessage } from "element-plus";
import { CircleCloseFilled, CirclePlusFilled, RemoveFilled, DeleteFilled, InfoFilled, CaretBottom, CaretTop, Flag, WarningFilled, Search, AddLocation, SemiSelect, UploadFilled, SuccessFilled  } from '@element-plus/icons-vue'
import { getAllGroups } from "@/api/group.js";

import { getCategoryTicketsService, getStatusByTicketId, getTicketById, getAllTicketsService, getTicketIdIWatchingService, watchTicketService, unwatchTicketService } from "@/api/ticket.js";

const drawer = ref(false)

const ticketModel = ref({
    title: '',
    belongsTo: '',
    attachment: '',
    description: '',
    state: '',
    assigneeId: '',
    dueTime: '',
    priority: '-1'
})

const rules = {
    title: [
        { required: true, message: '请输入标题', trigger: 'blur' },
    ],
    belongsTo: [
        { required: true, message: '请选择所属组', trigger: 'blur' },
    ],
    assigneeId: [
        { required: true, message: '请选择审批用户', trigger: 'blur' },
    ],
    dueTime: [
        { required: true, message: '请选择截止时间', trigger: 'blur' },
    ],
    priority: [
        { required: true, message: '请选择优先级', trigger: 'blur' },
    ],
    description: [
        { required: true, message: '请输入描述', trigger: 'blur' },
    ],
}

const priorityArray = ref([])

const linkedTicketsId = ref([])

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import { useTokenStore } from '@/stores/token';
const tokenStore = useTokenStore();

import { addTicketService } from '@/api/ticket.js'

import { inGroupsInfo } from '@/api/user.js'

let categorys = ref([]);

const getAllGroups = async () => {
    categorys.value = await inGroupsInfo();
}

const currentClickGroup = ref('')

const updateCurrentClick = async (value) => {
    ticketModel.value.assigneeId = '';
    userLoading.value = true;
    currentClickGroup.value = value;
    userDisabled.value = true;
    ticketDisabled.value = true;
    await getGroupUsers(currentClickGroup.value);
    await getTicketsInGroup(currentClickGroup.value);
    userDisabled.value = false;
    ticketDisabled.value = false;
    userLoading.value = false;
}

import { getCategoryMembersInfoService } from '@/api/group.js'

let groupUsers = ref([]);

const getGroupUsers = async (groupId) => {
    groupUsers.value = await getCategoryMembersInfoService(groupId);
}

getAllGroups();

const clearTicket = () => {
    ticketModel.value.title = '';
    ticketModel.value.belongsTo = '';
    ticketModel.value.attachment = '';
    ticketModel.value.description = '';
    ticketModel.value.state = '';
    ticketModel.value.assigneeId = '';
    ticketModel.value.dueTime = '';
    ticketModel.value.priority = '-1';
    watchersID.value = [];
    priorityArray.value = [];
    linkedTicketsId.value = [];
    drawer.value = false;
    fileList.value = [];
    userDisabled.value = true;
    ticketDisabled.value = true;
    percentage.value = 0;
    clearQuillContent();
}

import { createTicketReminder } from "@/api/message";
// @ts-ignore
const addTicket = async () => {
    let attachmentStr = attachmentList.value.join(",");
    ticketModel.value.attachment = attachmentStr;
    let result = await addTicketService(ticketModel.value);
    if (result.code !== 0) {
        result.value = false
    }
    ticketModel.value.id = result.data;
    const flag = ref(true)
    if (watchersID.value.length !== 0) {
        let watcherResult = await addWatchers(ticketModel.value.id, watchersID.value);
        if (watcherResult.code !== 0) {
            result.value = false
        }
    }
    if (linkedTicketsId.value.length !== 0) {
        let linkResult = await linkTickets(ticketModel.value.id, linkedTicketsId.value);
        if (linkResult.code !== 0) {
            result.value = false
        }
    }
    if (flag) {
        await createTicketReminder(ticketModel.value.id)
        ElMessage.success("发布成功，已提示审批人尽快审核");
        clearTicket();
        getAllGroups();
        allTicket();
    } else {
        ElMessage.error("发布失败")
    }
}

const attachmentList = ref([]);

const uploadSuccess = (response) => {
    if (response.code === 1) {
        ElMessage.error(response.message)
    }
    else {
        attachmentList.value.push(response.data)
        ElMessage.success('上传成功');
    }
    console.log(attachmentList.value);
    submitDisabled.value = false;
}

let userLoading = ref('false')
let userDisabled = ref('true')
let ticketDisabled = ref('true')

const priorities = [
    {
        id: 0,
        label: 'P0 紧急',
    },
    {
        id: 1,
        label: 'P1 重要',
    },
    {
        id: 2,
        label: 'P2 高',
    },
    {
        id: 3,
        label: 'P3 中',
    },
    {
        id: 4,
        label: 'P4 低',
    },
]



const priorityChange = () => {
    ticketModel.value.priority = priorityArray.value[0]
    // console.log(priorityArray.value[0]);
    // console.log(ticketModel.value.priority);
}

let allTicketsInGroup = ref([]);

import { getTicketsInGroupService, linkTicketsService, addWatcherService } from '@/api/ticket.js'

const getTicketsInGroup = async (groupId) => {
    let result = await getTicketsInGroupService(groupId);
    allTicketsInGroup.value = result;
    console.log(result);
}

const linkTickets = async (ticketId, tickets) => {
    let result = await linkTicketsService(ticketId, tickets);
    if (result.code === 0) {
    } else {
        ElMessage.error("关联失败")
    }
    return result;
}

const addWatchers = async (ticketId, watcherId) => {
    let result = await addWatcherService(ticketId, watcherId);
    if (result.code === 0) {
    } else {
        ElMessage.error("添加关注者失败")
    }
    return result;
}

let watchersID = ref([]);

const dateTimeChange = () => {
    console.log(ticketModel.value.dueTime)
}

const removeAttachment = (uploadFile, uploadFiles) => {
    if (uploadFile.response) {
        let newUploadedFileRemoved = uploadFile.response.data;
        attachmentList.value = attachmentList.value.filter(item => item !== newUploadedFileRemoved);
    }
    else {
        let fileRemoved = uploadFile.url;
        attachmentList.value = attachmentList.value.filter(item => item !== fileRemoved);
    }
    console.log(uploadFile)
    console.log(attachmentList.value);
}

const submitDisabled = ref(false)

const beforeUploadAttachment = (file) => {

    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isLt2M) {
        ElMessage.error('上传附件大小不能超过 1MB!');
    }
    else {
        submitDisabled.value = true;
    }
    return isLt2M;
}

const fileList = ref([]);

const defaultValue = ref('hahe');


const myQuillEditor = ref(null);

const clearQuillContent = () => {
    if (myQuillEditor.value) {
        console.log(myQuillEditor.value);
        myQuillEditor.value.setText('');
    }
    else {
        console.log('Noooooooooooo!');
        myQuillEditor.value.setText('');

    }
};

const colors = [
    { color: '#f56c6c', percentage: 20 },
    { color: '#e6a23c', percentage: 40 },
    { color: '#5cb87a', percentage: 60 },
    { color: '#1989fa', percentage: 80 },
    { color: '#6f7ad3', percentage: 100 },
]

const percentage = ref(0)

const pageSize = ref(15);
const currentPage = ref(1);
const allTicketsNum = ref(0);

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    currentPage.value = 1;
    allTicket();
    console.log(`${currentPage} items per page`)
}
const handleCurrentChange = (val: number) => {
    currentPage.value = val;
    allTicket();
    console.log(`current page: ${val}`)
}

const allTicket = async () => {
    const allGroupLoading = ElLoading.service({
        lock: true,
        text: '请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    let res = await getAllTicketsService(currentPage.value, pageSize.value);
    allTickets.value = res.items;
    allTicketsNum.value = res.total;
    allGroupLoading.close();
}

const allTicketsInit = async () => {
    const allGroupLoading = ElLoading.service({
        lock: true,
        text: '请稍候...',
        background: 'rgba(0, 0, 0, 0.7)',
    })
    currentPage.value = 1;
    pageSize.value = 15;
    let res = await getAllTicketsService(currentPage.value, pageSize.value);
    allTickets.value = res.items;
    allTicketsNum.value = res.total;
    await getTicketIdIWatching()
    checkClickable()
    await getNames()
    allGroupLoading.close();
};

allTicketsInit();

const dialogVisible = ref(false);

const categoryModel = ref({
    categoryName: "",
    categoryDetail: "",
});

const cleanCategoryModel = () => {
    categoryModel.value = {
        categoryName: "",
        categoryDetail: "",
    };
};

import { addGroup } from "@/api/group.js";

const addCategory = async () => {
    let result = await addGroup(categoryModel.value);
    console.log("adding...");
    ElMessage.success("创建成功");
    allTicketsInit();
    dialogVisible.value = false;
    cleanCategoryModel();
};

import { getNameById, getAllNames } from "@/api/user.js";

const getName = async (id) => {
    let res = await getNameById(id);
    return res.data;
};

let allNames = ref({})
const getNames = async () => {
    let idNames = await getAllNames()
    allNames.value = idNames;
}


let adminNames = ref({});

import { getAdminIdByGroupId } from "@/api/user.js";

const getAdminNames = async () => {
    for (const category of allTickets.value) {
        const ids = await getAdminIdByGroupId(category.id);
        const name = ref([]);
        for (const id of ids) {
            name.value.push(allNames.value[id]);
        }
        adminNames.value[category.id] = name;
    }
};

let watcherNames = ref({});

import { getWatcherIdByTicketId } from "@/api/user.js";

const getWatcherNames = async () => {
    for (const ticket of tickets.value) {
        const ids = await getWatcherIdByTicketId(ticket.id);
        console.log(ids);
        const name = ref([]);
        if (ids) {
            for (const id of ids) {
                name.value.push(allNames.value[id]);
            }
        }
        watcherNames.value[ticket.id] = name;
    }
};

let ticketStatus = ref({});
let ticketPriority = ref({});

const getTicketStatus = async () => {
    for (const ticket of tickets.value) {
        const status = await getStatusByTicketId(ticket.id);
        ticketStatus.value[ticket.id] = status;
        console.log(status)
    }
}

const title = ref("");

const showDialog = (row) => {
    dialogVisible.value = true;
    title.value = "编辑";
    categoryModel.value.categoryName = row.categoryName;
    categoryModel.value.categoryDetail = row.categoryDetail;
    categoryModel.value.id = row.id;
};

const showDialogDetail = (row) => {
    dialogVisible.value = true;
    title.value = "编辑";
    categoryModel.value.categoryName = row.categoryName;
    categoryModel.value.categoryDetail = row.categoryDetail;
    categoryModel.value.id = row.categoryId;
};

import { updateCategoryService, deleteCategoryService, getCategoryMembersService } from "@/api/group.js";

const updateCategory = async () => {
    let result = await updateCategoryService(categoryModel.value);
    console.log("updating...");
    ElMessage.success("更新成功");
    allTicketsInit();
    dialogVisible.value = false;
};

const deleteGroup = async (row) => {
    let result = await deleteCategoryService(row.id);
    ElMessage.success("删除成功");
    allTicketsInit();
};

const members = ref([]);
const tickets = ref([]);

const getMembers = async (row) => {
    let result = await getCategoryMembersService(row.id);
    // console.log(result);
    members.value = result;
};


const getTickets = async (row) => {
    let result = await getCategoryTicketsService(row.id);
    // console.log(result);
    tickets.value = result;
};

const currentClickRow = ref({
    categoryName: "",
    categoryId: "",
    categoryDetail: "",
    categoryOwner: "",
    categoryOwnerId: "",
    categoryAdmin: [],
    categoryMember: [],
    categoryTickets: [],
    ticketOwnerNames: {},
    editable: false,
    deletable: false,
    quitable: false,
    viewable: false,
});

const buttonLoading = ref(true)

const clickRow = async (row) => {
    clearCurrentClickRow();
    drawerVisible.value = true
    nextTick(async () => {
        // const drawerTarget = document.querySelector('.drawer');
        // const drawerLoading = ElLoading.service({
        //   target: drawerTarget,
        //   lock: false,
        //   fullscreen: false,
        //   background: 'rgba(122, 122, 122, 0.3)',
        // });
        await IinGroups()
        buttonLoading.value = true;
        currentClickRow.value.editable = await checkEditable(row.id);
        currentClickRow.value.deletable = await checkDeletable(row.id);
        currentClickRow.value.quitable = buttonClickable.value[row.id];
        currentClickRow.value.viewable = await checkViewable(row.id);
        buttonLoading.value = false;
        // drawerLoading.close();

        const groupinfoTarget = document.querySelector('.group-info');
        const groupinfoLoading = ElLoading.service({
            target: groupinfoTarget,
            lock: false,
            fullscreen: false,
            text: '请稍候...',
            background: 'rgba(122, 122, 122, 0.3)',
        });

        const ticketTarget = document.querySelector('.ticket-container');
        const ticketLoading = ElLoading.service({
            target: ticketTarget,
            lock: false,
            fullscreen: false,
            text: '请稍候...',
            background: 'rgba(122, 122, 122, 0.3)',
        });

        currentClickRow.value.categoryName = row.categoryName;
        currentClickRow.value.categoryDetail = row.categoryDetail;
        currentClickRow.value.categoryId = row.id;
        await getMembers(row);
        currentClickRow.value.categoryOwner = allNames.value[row.ownerId];
        console.log(currentClickRow.value.categoryOwner);
        currentClickRow.value.categoryOwnerId = row.ownerId;
        currentClickRow.value.categoryAdmin = adminNames.value[row.id];
        currentClickRow.value.categoryMember = members.value;
        groupinfoLoading.close();

        if (currentClickRow.value.viewable) {
            await getTickets(row);
            currentClickRow.value.categoryTickets = tickets.value;
            await getWatcherNames()
        }

        ticketLoading.close();
    });

}

const getTicketInfo = async () => {
    for (const ticket of tickets.value) {
        const ticketInfo = await getTicketById(ticket.id);
        console.log(ticketInfo);
        ticketStatus.value[ticket.id] = ticketInfo.state;
        ticketPriority.value[ticket.id] = ticketInfo.priority;
    }
}

import { isUserInGroup, isGroupEditable, isGroupDeletable, isGroupViewable, inGroups } from "@/api/user.js";

const checkEditable = async (id) => {
    const result = ref(false);
    result.value = await isGroupEditable(id);
    return result;
}

const checkDeletable = async (id) => {
    const result = ref(false);
    result.value = await isGroupDeletable(id);
    return result;
}

const checkViewable = async (id) => {
    const result = ref(false);
    result.value = await isGroupViewable(id);
    return result;
}

const clickTicketRow = async (row) => {
    ElMessage.success("点")
    let ticketId = row.id
    console.log(ticketId);
    // jump to ticket detail page
    router.push('/ticket/detail/' + ticketId)
}


const drawerVisible = ref(false);
const direction = ref('rtl')



const inGroup = async (row) => {
    const result = ref(false);
    result.value = await isUserInGroup(row.id);
    // console.log(result.value);
    return result;
}

let allUserGroups = ref([])

const IinGroups = async () => {
    allUserGroups.value = await inGroups()
    // console.log(allUserGroups.value)
}

const ticketIdIWatching = ref([]);

const getTicketIdIWatching = async () => {
    const result = await getTicketIdIWatchingService();
    ticketIdIWatching.value = result;
    console.log(ticketIdIWatching.value);
}

let buttonClickable = ref({});

const checkClickable = async () => {
    for (const ticket of allTickets.value) {
        if (ticketIdIWatching.value.includes(ticket.id)) {
            buttonClickable.value[ticket.id] = true;
        } else {
            buttonClickable.value[ticket.id] = false;
        }
    }
}

const watchThisTicket = async (id) => {
    watchTicketService(id);
    ElMessage.success("关注成功")
    ticketIdIWatching.value.push(id);
    buttonClickable.value[id] = true;
}

const unwatchThisTicket = async (id) => {
    unwatchTicketService(id);
    ElMessage.success("取消关注成功")
    ticketIdIWatching.value = ticketIdIWatching.value.filter((item) => item !== id);
    buttonClickable.value[id] = false;
}

const clearCurrentClickRow = () => {
    currentClickRow.value = {
        categoryName: "",
        categoryId: "",
        categoryDetail: "",
        categoryOwner: "",
        categoryOwnerId: "",
        categoryAdmin: [],
        categoryMember: [],
        categoryTickets: [],
        editable: false,
        deletable: false,
        quitable: false,
        viewable: false,
    };
}

const search = ref('')
const filterTableData = computed(() =>
    allTickets.value.filter(
        (data) =>
            !search.value ||
            data.title.toLowerCase().includes(search.value.toLowerCase()) ||
            (data.description && data.description.toLowerCase().includes(search.value.toLowerCase()))
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

</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>所有可见工单</span>
                <div class="extra">
                    <el-input v-model="search" size="large" style="text-align: right; width: 240px; margin-right: 40px;"
                        :prefix-icon="Search" placeholder="输入以查询工单" />
                    <el-button type="primary" @click="drawer = true;">添加工单</el-button>
                </div>
            </div>
        </template>
        <el-table :data="filterTableData" stripe table-layout="auto" @row-click="clickTicketRow"
            :default-sort="{ prop: 'id', order: 'ascending' }">
            <el-table-column fixed label="序号" width="100" prop="id" sortable> </el-table-column>
            <el-table-column label="名称" prop="title" sortable></el-table-column>
            <el-table-column label="优先级" prop="priority" sortable>
                <template #default="scope">
                    <el-text size="small" style="color: #FF0000;" v-if="scope.row.priority == 0"><el-icon>
                            <WarningFilled />
                        </el-icon>P0 紧急</el-text>
                    <el-text size="small" style="color: #FF7615;" v-else-if="scope.row.priority == 1"><el-icon>
                            <Flag />
                        </el-icon>P1 重要</el-text>
                    <el-text size="small" style="color: #FC9210;" v-else-if="scope.row.priority == 2"><el-icon>
                            <CaretTop />
                        </el-icon>P2 高</el-text>
                    <el-text size="small" style="color: #0CAEFF;" v-else-if="scope.row.priority == 3"><el-icon>
                            <RemoveFilled />
                        </el-icon>P3 中</el-text>
                    <el-text size="small" style="color: #5A6169;" v-else-if="scope.row.priority == 4"><el-icon>
                            <CaretBottom />
                        </el-icon>P4 低</el-text>
                    <el-text size="small" style="color: #848484;" v-else-if="scope.row.priority == 5">P5 未定级</el-text>
                </template>
            </el-table-column>
            <el-table-column label="状态" prop="state" sortable>
                <template #default="scope">
                    <el-tag effect="danger" round v-if="scope.row.state == 1">已结束</el-tag>
                    <el-tag effect="success" round v-if="scope.row.state == 2">已通过</el-tag>
                    <el-tag effect="warning" round v-else-if="currentDate > scope.row.dueTime">已逾期</el-tag>
                    <el-tag effect="primary" round v-else-if="scope.row.state == 0">进行中</el-tag>
                    <!-- <el-tag effect="success" round v-if="ticketStatus[scope.row.id] == 0">进行中</el-tag>
              <el-tag effect="danger" round v-else-if="ticketStatus[scope.row.id] == 1">已结束</el-tag> -->
                </template>
            </el-table-column>
            <!-- <el-table-column label="描述" prop="description"></el-table-column> -->
            <el-table-column label="所有者" prop="ownerId" style="width: 200">
                <template #default="scope">
                    <el-popover effect="light" trigger="hover" placement="top" width="auto">
                        <template #default>
                            <div>
                                拥有者名称: {{ allNames[scope.row.ownerId] }} <br />
                                拥有者ID: {{ scope.row.ownerId }}
                            </div>
                        </template>
                        <template #reference>
                            <el-tag effect="light" round>{{ allNames[scope.row.ownerId] }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="审批者" prop="assigneeId" style="width: 200">
                <template #default="scope">
                    <el-popover effect="light" trigger="hover" placement="top" width="auto">
                        <template #default>
                            <div>
                                审批者名称: {{ allNames[scope.row.assigneeId] }} <br />
                                审批者ID: {{ scope.row.assigneeId }}
                            </div>
                        </template>
                        <template #reference>
                            <el-tag effect="light" round type="info">{{ allNames[scope.row.assigneeId] }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="最后编辑者" prop="lastEditedBy" style="width: 200">
                <template #default="scope">
                    <el-popover effect="light" trigger="hover" placement="top" width="auto">
                        <template #default>
                            <div>
                                最后编辑者名称: {{ allNames[scope.row.lastEditedBy] }} <br />
                                最后编辑者ID: {{ scope.row.lastEditedBy }}
                            </div>
                        </template>
                        <template #reference>
                            <el-tag effect="light" round type="info">{{ allNames[scope.row.lastEditedBy] }}</el-tag>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" prop="createdTime" sortable></el-table-column>
            <el-table-column label="最后修改时间" prop="updatedTime" sortable></el-table-column>
            <el-table-column label="截至时间" prop="dueTime" sortable></el-table-column>
            <el-table-column label="" width="70">
                <template #default="{ row }">
                    <!-- <el-button :icon="Edit" circle plain type="primary" @click.stop="showDialog(row)"></el-button>
                    <el-popconfirm title="你确认删除此分工单吗?" confirm-button-text="Yes" cancel-button-text="No"
                        :icon="InfoFilled" icon-color="red" @confirm="deleteGroup(row)">
                        <template #reference>
                            <el-button :icon="Delete" circle plain type="danger" @click.stop></el-button>
                        </template>
        </el-popconfirm> -->
                    <div style="display: flex; justify-content: space-between;">
                        <el-popconfirm title="确定关注此工单吗?" confirm-button-text="是" cancel-button-text="否"
                            :icon="InfoFilled" icon-color="green" @confirm="watchThisTicket(row.id)">
                            <template #reference>
                                <el-tooltip content="你已经关注了此工单" v-if="buttonClickable[row.id]">
                                    <el-button :icon="AddLocation" circle plain type="success" @click.stop
                                        disabled></el-button>
                                </el-tooltip>
                                <el-button :icon="AddLocation" circle plain type="success" @click.stop
                                    v-else></el-button>
                            </template>
                        </el-popconfirm>
                        <el-popconfirm title="确定取消关注此工单吗?" confirm-button-text="是" cancel-button-text="否"
                            :icon="InfoFilled" icon-color="red" @confirm="unwatchThisTicket(row.id)">
                            <template #reference>
                                <el-tooltip content="你尚未关注此工单" v-if="!buttonClickable[row.id]">
                                    <el-button :icon="AddLocation" circle plain type="danger" @click.stop
                                        disabled></el-button>
                                </el-tooltip>
                                <el-button :icon="AddLocation" circle plain type="danger" @click.stop
                                    v-else></el-button>
                            </template>
                        </el-popconfirm>
                    </div>
                </template>
            </el-table-column>
            <template #empty>
                <el-empty description="没有数据" />
            </template>
        </el-table>
        <div style="margin-top: 10px">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                :page-sizes="[15, 30, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="allTicketsNum"
                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
    </el-card>

    <el-drawer v-model="drawer" title="新建表单" :with-header="true" size="90%" direction="btt">
        <el-form :model="ticketModel" :rules="rules" label-width="100px"
            style="margin-left: 150px;margin-right: 150px; margin-top: 50px;">
            <div style="display: flex; justify-content: space-between;">
                <el-form-item label="标题" style="width: 75%;" prop="title">
                    <el-input v-model="ticketModel.title" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="优先级" style="width: 23%;" prop="priority">
                    <el-select placeholder="请选择" v-model="priorityArray" @change="priorityChange" multiple
                        multiple-limit=1>
                        <el-option v-for="c in priorities" :key="c.id" :label="c.label" :value="c.id">
                            <template v-slot:default>
                                <span v-if="c.id == 0" style="color: #FF0000;">
                                    <el-icon>
                                        <WarningFilled />
                                    </el-icon>
                                    P0 紧急
                                </span>
                                <span v-else-if="c.id == 1" style="color: #FF7615;">
                                    <el-icon>
                                        <Flag />
                                    </el-icon>
                                    P1 重要
                                </span>
                                <span v-else-if="c.id == 2" style="color: #FC9210;">
                                    <el-icon>
                                        <CaretTop />
                                    </el-icon>
                                    P2 高
                                </span>
                                <span v-else-if="c.id == 3" style="color: #0CAEFF;">
                                    <el-icon>
                                        <RemoveFilled />
                                    </el-icon>
                                    P3 中
                                </span>
                                <span v-else-if="c.id == 4" style="color: #5A6169;">
                                    <el-icon>
                                        <CaretBottom />
                                    </el-icon>
                                    P4 低
                                </span>
                            </template>
                        </el-option>
                        <template #tag>
                            <span v-if="priorityArray == '0'" style="color: #FF0000;">
                                <el-icon style="margin-left: 17px">
                                    <WarningFilled />
                                </el-icon>
                                P0 紧急
                            </span>
                            <span v-else-if="priorityArray == 1" style="color: #FF7615;">
                                <el-icon style="margin-left: 17px">
                                    <Flag />
                                </el-icon>
                                P1 重要
                            </span>
                            <span v-else-if="priorityArray == 2" style="color: #FC9210;">
                                <el-icon style="margin-left: 17px">
                                    <CaretTop />
                                </el-icon>
                                P2 高
                            </span>
                            <span v-else-if="priorityArray == 3" style="color: #0CAEFF;">
                                <el-icon style="margin-left: 17px">
                                    <RemoveFilled />
                                </el-icon>
                                P3 中
                            </span>
                            <span v-else-if="priorityArray == 4" style="color: #5A6169;">
                                <el-icon style="margin-left: 17px">
                                    <CaretBottom />
                                </el-icon>
                                P4 低
                            </span>
                        </template>
                    </el-select>
                </el-form-item>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <el-form-item label="所属组" style="width: 33%;" prop="belongsTo">
                    <el-select placeholder="请选择" v-model="ticketModel.belongsTo" filterable
                        @change="updateCurrentClick">
                        <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
                            <span style="float: left">{{ c.categoryName }}</span>
                            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">Group
                                ID: {{ c.id }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="审批用户" style="width: 33%;" prop="assigneeId">
                    <el-select placeholder="请选择" v-model="ticketModel.assigneeId" filterable :disabled="userDisabled">
                        <el-option v-for="c in groupUsers" :key="c.id" :label="c.username" :value="c.id">
                            <span style="float: left">{{ c.username }}</span>
                            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">
                                User ID: {{ c.id }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="截止时间" style="width: 23%;" prop="dueTime">
                    <el-date-picker v-model="ticketModel.dueTime" type="datetime" placeholder="选择截止时间"
                        format="YYYY/MM/DD hh:mm:ss" value-format="YYYY-MM-DD hh:mm:ss" @change="dateTimeChange" />
                </el-form-item>

            </div>
            <div style="display: flex; justify-content: space-between;">
                <el-form-item label="关联工单" style="width: 48%;">
                    <el-select placeholder="请选择" v-model="linkedTicketsId" filterable :disabled="ticketDisabled"
                        multiple>
                        <el-option v-for="c in allTicketsInGroup" :key="c.id" :label="c.title" :value="c.id">
                            <span style="float: left">{{ c.title }}</span>
                            <span v-if="c.priority == 0" style="color: #FF0000;">
                                <el-icon style="margin-left: 17px">
                                    <WarningFilled />
                                </el-icon>
                                P0 紧急
                            </span>
                            <span v-else-if="c.priority == 1" style="color: #FF7615;">
                                <el-icon style="margin-left: 17px">
                                    <Flag />
                                </el-icon>
                                P1 重要
                            </span>
                            <span v-else-if="c.priority == 2" style="color: #FC9210;">
                                <el-icon style="margin-left: 17px">
                                    <CaretTop />
                                </el-icon>
                                P2 高
                            </span>
                            <span v-else-if="c.priority == 3" style="color: #0CAEFF;">
                                <el-icon style="margin-left: 17px">
                                    <RemoveFilled />
                                </el-icon>
                                P3 中
                            </span>
                            <span v-else-if="c.priority == 4" style="color: #5A6169;">
                                <el-icon style="margin-left: 17px">
                                    <CaretBottom />
                                </el-icon>
                                P4 低
                            </span>
                            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">Ticket
                                ID: {{ c.id
                                }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="关注用户" style="width: 48%;">
                    <el-select placeholder="请选择" v-model="watchersID" filterable :disabled="userDisabled" multiple>
                        <el-option v-for="c in groupUsers" :key="c.id" :label="c.username" :value="c.id">
                            <span style="float: left">{{ c.username }}</span>
                            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">
                                User ID: {{ c.id }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
            </div>
            <el-form-item label="附件上传">
                <el-upload v-model:file-list="fileList" class="avatar-uploader" :auto-upload="true"
                    :show-file-list="true" action="/api/upload" name="file"
                    :headers="{ 'Authorization': tokenStore.token }" :on-success="uploadSuccess" drag="true"
                    style="width: 35%" :before-upload="beforeUploadAttachment" :on-remove="removeAttachment">

                    <div v-if="ticketModel.attachment">
                        <el-icon class="el-icon--upload">
                            <SuccessFilled />
                        </el-icon>
                        <div class="el-upload__text">
                            继续上传
                        </div>
                    </div>
                    <div v-else>
                        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                            拖拽至此或<em>选择文件</em>
                        </div>
                    </div>
                </el-upload>
            </el-form-item>
            <el-form-item label="描述" prop="description">
                <div class="editor">
                    <quill-editor ref="myQuillEditor" theme="snow" v-model:content="ticketModel.description"
                        :value="defaultValue" contentType="html" style="min-height: 300px;">
                    </quill-editor>
                </div>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="addTicket" :disabled="submitDisabled">发布</el-button>
                <el-button type="info" @click="clearTicket">取消</el-button>
            </el-form-item>
        </el-form>
    </el-drawer>

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
