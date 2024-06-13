<script setup>
import { Edit, Delete } from "@element-plus/icons-vue";
import { ref, onMounted, nextTick, computed, watch } from "vue";
import { useRouter } from 'vue-router'
const router = useRouter()
import { ElLoading, namespaceContextKey, ElMessageBox } from 'element-plus'

import { ElMessage } from "element-plus";
import { CircleCloseFilled, CirclePlusFilled, RemoveFilled, DeleteFilled, InfoFilled, CaretBottom, CaretTop, Flag, WarningFilled, Search, AddLocation, SemiSelect, UploadFilled, SuccessFilled, Link, ArrowDown } from '@element-plus/icons-vue'


import { getNameById, getAllNames } from "@/api/user.js";
import { isUserInGroup, isGroupEditable, isGroupDeletable, isGroupViewable, inGroups, isTicketEditable } from "@/api/user.js";

let allNames = ref({})
const getNames = async () => {
  let idNames = await getAllNames()
  allNames.value = idNames;
}


const currentTicketId = ref(null);

const getTicketId = async () => {
  const allGroupLoading = ElLoading.service({
    lock: true,
    text: '请稍候...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  currentTicketId.value = router.currentRoute.value.params.id;
  await getNames();
  await IinGroups();
  await getTicketInfo();
  allGroupLoading.close();
}

getTicketId();

let allUserGroups = ref([])

const IinGroups = async () => {
  allUserGroups.value = await inGroups()
}

let buttonClickable = ref({});


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

import { getCategoryTicketsService, getStatusByTicketId, getTicketById, getWatcherIdByTicketId, getLinkedTicketIdByTicketId, watchTicketService, unwatchTicketService, getTicketRoute } from "@/api/ticket.js";

const currentTicketInfo = ref({});
const ticketBelongsTo = ref(null);

const isWatching = ref(false);

const linkedTickets = ref([]);

const route = ref([]);

const getTicketInfo = async () => {
  currentTicketInfo.value = await getTicketById(currentTicketId.value);
  ticketBelongsTo.value = currentTicketInfo.value.belongsTo;
  if (allUserGroups.value.includes(currentTicketInfo.value.belongsTo)) {
    viewable.value = true;
  } else {
    viewable.value = false;
  }
  if (viewable.value) {
    editable.value = await isTicketEditable(currentTicketId.value)
    editable.value = editable.value && (currentTicketInfo.value.state == 0)
    const ids = await getWatcherIdByTicketId(currentTicketId.value);
    watchersID.value = ids;
    if (ids.includes(userInfoStore.info.id)) {
      isWatching.value = true;
    }
    else {
      isWatching.value = false;
    }
    const linkedIds = await getLinkedTicketIdByTicketId(currentTicketId.value);
    linkedTicketsId.value = linkedIds;
    updateCurrentClick(currentTicketInfo.value.belongsTo);
    route.value = await getTicketRoute(currentTicketId.value)
    console.log(route.value);
  }
  ticketModel.value = currentTicketInfo.value;
  ticketModel.value.id = currentTicketId.value;
  priorityArray.value = [];
  priorityArray.value.push(currentTicketInfo.value.priority);
  if (currentTicketInfo.value.attachment) {
    const list = currentTicketInfo.value.attachment.split(",");
    attachmentList.value = list;
    list.forEach((item) => {
      fileList.value.push({
        name: item.split("~")[1],
        url: item
      });
    });
  }

}

const viewable = ref(false);
const editable = ref(false);


const requestJoiningGroup = async (id) => {
  const result = await isUserInGroup(id);
  if (result) {
    ElMessage.error("你已经在这个组中");
  } else {
    ElMessage.success("申请成功");
  }
}

const ticketModel = ref({
  id: '',
  title: '',
  belongsTo: '',
  attachment: '',
  description: '',
  state: '',
  assigneeId: '',
  dueTime: '',
  priority: ''
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

import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore();

import { addTicketService } from '@/api/ticket.js'

import { inGroupsInfo } from '@/api/user.js'

let categorys = ref([]);

const getAllGroups = async () => {
  categorys.value = await inGroupsInfo();
}

const currentClickGroup = ref('')

const updateCurrentClick = async (value) => {
  currentClickGroup.value = value;
  userDisabled.value = true;
  ticketDisabled.value = true;
  await getGroupUsers(currentClickGroup.value);
  await getTicketsInGroup(currentClickGroup.value);
  userDisabled.value = false;
  ticketDisabled.value = false;
}

import { getCategoryMembersInfoService } from '@/api/group.js'

let groupUsers = ref([]);

const getGroupUsers = async (groupId) => {
  groupUsers.value = await getCategoryMembersInfoService(groupId);
}


const drawer = ref(false);

const clearTicket = () => {
  ticketModel.value.title = '';
  ticketModel.value.belongsTo = '';
  ticketModel.value.attachment = '';
  ticketModel.value.description = '';
  ticketModel.value.state = '';
  ticketModel.value.assigneeId = '';
  ticketModel.value.dueTime = '';
  ticketModel.value.priority = '';
  watchersID.value = [];
  priorityArray.value = [];
  linkedTicketsId.value = [];
  drawer.value = false;
  fileList.value = [];
  clearQuillContent();
  getTicketInfo();
}
// @ts-ignore
const addTicket = async () => {
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
    ElMessage.success("发布成功");
    clearTicket();
    getAllGroups();
  } else {
    ElMessage.error("发布失败")
  }
}

import { deleteAllLinksService, deleteAllWatchersService, updateTicketService } from '@/api/ticket.js'

const updateTicket = async () => {
  let attachmentStr = attachmentList.value.join(",");
  ticketModel.value.attachment = attachmentStr;
  let result = await updateTicketService(ticketModel.value);
  if (result.code !== 0) {
    result.value = false
  }
  await deleteAllLinksService(currentTicketId.value);
  await deleteAllWatchersService(currentTicketId.value);
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
    ElMessage.success("发布成功");
    clearTicket();
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
  linkedTickets.value = allTicketsInGroup.value.filter(ticket => linkedTicketsId.value.includes(ticket.id));
  console.log(linkedTickets.value);
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


const handleChange = (uploadFile, uploadFiles) => {
  // fileList.value = fileList.value.slice(-3)
  // console.log(uploadFile, uploadFiles);
  // console.log(fileList.value);
}

const colors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]

const percentage = ref(10)

let watcherNames = ref({});

const getWatcherNames = async () => {
  const ids = await getWatcherIdByTicketId(currentTicketId);
  const name = ref([]);
  console.log(ids);
  if (ids) {
    for (const id of ids) {
      name.value.push(allNames.value[id]);
    }
  }
  watcherNames.value[currentTicketId] = name;
};

const clickTicketRow = async (row) => {
  let ticketId = row.id
  router.push('/ticket/detail/' + ticketId)
  // window.location.reload();
}

watch(() => router.currentRoute.value.params.id, (newId, oldId) => {
  getTicketId();
})

const watchThisTicket = async (id) => {
  watchTicketService(id);
  ElMessage.success("关注成功")
  isWatching.value = true;
  watchersID.value.push(userInfoStore.info.id)
}

const unwatchThisTicket = async (id) => {
  unwatchTicketService(id);
  ElMessage.success("取消关注成功")
  isWatching.value = false;
  watchersID.value = watchersID.value.filter((item) => item !== userInfoStore.info.id);
}

import { approveTicketService, rejectTicketService, modifyAssigneeService } from "@/api/ticket.js"
import { approveTicketRequest, createTicketReminder, rejectTicketRequest, closeRequestService } from "@/api/message.js"

const approveWorkOrder = async () => {
  await approveTicketService(currentTicketId.value)
  await approveTicketRequest(currentTicketId.value)
  ElMessage.success("已批准此工单")
  await getTicketInfo()
}

const transferApproval = async () => {
  await modifyAssigneeService(currentTicketId.value, newAssignee.value)
  await closeRequestService(currentTicketId.value)
  await createTicketReminder(currentTicketId.value)
  dialogVisible.value = false;
  ElMessage.info("审批权已转让，已提示新审批人审批此工单")
  await getTicketInfo()
}

const rejectTicket = async (msg) => {
  await rejectTicketService(currentTicketId.value)
  await rejectTicketRequest(currentTicketId.value, msg)
  await getTicketInfo()
}

const dialogVisible = ref(false)

const openApprove = () => {
  ElMessageBox.confirm(
    '批准此工单后工单内容将作为冻结凭证，无法再次编辑。',
    '确认批准此工单吗？',
    {
      confirmButtonText: '确认',
      cancelButtonText: '我再想想',
      type: 'info',
    }
  )
    .then(() => {
      approveWorkOrder()
    })
    .catch(() => {
    })
}

const openTransfer = () => {
  ElMessageBox.confirm(
    '流转此工单后审批人将变更，你将失去此工单审批权限，无法批准或驳回此工单。',
    '确认流转此工单吗？',
    {
      confirmButtonText: '确认',
      cancelButtonText: '我再想想',
      type: 'info',
    }
  )
    .then(() => {
      transferApproval()
    })
    .catch(() => {
    })
}


const openReject = () => {
  ElMessageBox.prompt('驳回此工单后工单内容将作为冻结凭证，无法再次编辑。', '请输入驳回理由', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(({ value }) => {
      rejectTicket(value)
      ElMessage({
        type: 'success',
        message: `已驳回此工单，理由为 ${value}`,
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: 'Input canceled',
      })
    })
}

const newAssignee = ref('')

import { deleteTicketService } from '@/api/ticket.js'

const deleteTicket = async (ticketId) => {
  let result = await deleteTicketService(ticketId)
  if (result == 0) {
    ElMessage.success("删除成功")
    router.back()
  }
  else {
    ElMessage.error("删除失败")
  }
}

const visible = ref(false)

const color = ref(['#909399', '#67C23A', '#F56C6C', '#0bbd87'])

</script>
<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>工单详情</span>
        <div class="extra">
          <el-dropdown style="margin-right: 13px;">
            <el-button type="primary" :disabled="!editable || currentTicketInfo.assigneeId != userInfoStore.info.id">
              审批工单<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :disabled="!editable || currentTicketInfo.assigneeId != userInfoStore.info.id" @click="openApprove">批准此工单</el-dropdown-item>
                <el-dropdown-item :disabled="!editable || currentTicketInfo.assigneeId != userInfoStore.info.id" @click="dialogVisible = true">流转此工单</el-dropdown-item>
                <el-dropdown-item :disabled="!editable || currentTicketInfo.assigneeId != userInfoStore.info.id" @click="openReject">驳回此工单</el-dropdown-item>
                <!-- <el-dropdown-item :disabled="!editable" @click="action4">Action 4</el-dropdown-item>
                <el-dropdown-item :disabled="!editable" @click="action5">Action 5</el-dropdown-item> -->
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" plain @click="visible = true">工单流转记录</el-button>
          <el-button type="success" plain @click="watchThisTicket(currentTicketInfo.id)" :disabled="isWatching"
            v-if="!isWatching">关注工单</el-button>
          <el-button type="danger" plain @click="unwatchThisTicket(currentTicketInfo.id)" :disabled="!isWatching"
            v-if="isWatching">取消关注</el-button>
          <el-button type="primary" @click="drawer = true;" :disabled="!editable">修改工单</el-button>
          <el-popconfirm title="你确认删除此工单吗?" confirm-button-text="Yes" cancel-button-text="No" :icon="InfoFilled"
            icon-color="red" @confirm="deleteTicket(currentTicketInfo.id)">
            <template #reference>
              <el-button type="danger" :disabled="!editable">删除工单</el-button>
            </template>
          </el-popconfirm>

        </div>
      </div>
    </template>
    <el-empty description="加入组以查看此工单..." v-if="viewable !== true">
      <el-button type="primary" @click="requestJoiningGroup(ticketBelongsTo)">
        <el-icon class="el-icon--left">
          <CirclePlusFilled />
        </el-icon>
        申请加入
      </el-button>
    </el-empty>
    <el-descriptions class="margin-top" column="6" size="large" border v-else-if="currentTicketInfo"
      style="margin-top: 20px; margin-left: 50px; margin-right: 50px;">
      <el-descriptions-item span="6">
        <template #label>
          <div class="cell-item" style="min-width: 50px">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            标题
          </div>
        </template>
        {{ currentTicketInfo.title }}
      </el-descriptions-item>
      <el-descriptions-item span="2">
        <template #label>
          <div class="cell-item" style="min-width: 50px">
            <el-icon :style="iconStyle">
              <iphone />
            </el-icon>
            优先级
          </div>
        </template>
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
      </el-descriptions-item>
      <el-descriptions-item span="2">
        <template #label>
          <div class="cell-item" style="width: 100px">
            <el-icon :style="iconStyle">
              <location />
            </el-icon>
            当前审批者
          </div>
        </template>
        <template #default="scope">
          <el-popover effect="light" trigger="hover" placement="top" width="auto">
            <template #default>
              <div>
                审批人名称: {{ allNames[currentTicketInfo.assigneeId] }} <br />
                审批人ID: {{ currentTicketInfo.assigneeId }}
              </div>
            </template>
            <template #reference>
              <el-tag effect="plain" round>{{ allNames[currentTicketInfo.assigneeId] }}</el-tag>
            </template>
          </el-popover>
        </template>
      </el-descriptions-item>
      <el-descriptions-item span="2">
        <template #label>
          <div class="cell-item" style="width: 150px">
            <el-icon :style="iconStyle">
              <tickets />
            </el-icon>
            创建者
          </div>
        </template>
        <template #default="scope">
          <el-popover effect="light" trigger="hover" placement="top" width="auto">
            <template #default>
              <div>
                审批人名称: {{ allNames[currentTicketInfo.ownerId] }} <br />
                审批人ID: {{ currentTicketInfo.ownerId }}
              </div>
            </template>
            <template #reference>
              <el-tag effect="plain" round>{{ allNames[currentTicketInfo.ownerId] }}</el-tag>
            </template>
          </el-popover>
        </template>
      </el-descriptions-item>
      <el-descriptions-item span="2">
        <template #label>
          <div class="cell-item" style="min-width: 100px">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            创建时间
          </div>
        </template>
        {{ currentTicketInfo.createdTime }}
      </el-descriptions-item>
      <el-descriptions-item span="2">
        <template #label>
          <div class="cell-item" style="min-width: 100px">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            最后修改时间
          </div>
        </template>
        {{ currentTicketInfo.updatedTime }}
      </el-descriptions-item>
      <el-descriptions-item span="2">
        <template #label>
          <div class="cell-item" style="min-width: 100px">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            截止时间
          </div>
        </template>
        {{ currentTicketInfo.dueTime }}
      </el-descriptions-item>
      <el-descriptions-item span="1">
        <template #label>
          <div class="cell-item" style="min-width: 100px">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            最后修改由
          </div>
        </template>
        <template #default="scope">
          <el-popover effect="light" trigger="hover" placement="top" width="auto">
            <template #default>
              <div>
                审批人名称: {{ allNames[currentTicketInfo.lastEditedBy] }} <br />
                审批人ID: {{ currentTicketInfo.lastEditedBy }}
              </div>
            </template>
            <template #reference>
              <el-tag effect="plain" round type="info">{{ allNames[currentTicketInfo.lastEditedBy] }}</el-tag>
            </template>
          </el-popover>
        </template>

      </el-descriptions-item>
      <el-descriptions-item span="1">
        <template #label>
          <div class="cell-item" style="min-width: 100px">
            <el-icon :style="iconStyle">
              <user />
            </el-icon>
            状态
          </div>
        </template>
        <el-tag effect="danger" round v-if="currentTicketInfo.state == 1">已驳回</el-tag>
        <el-tag effect="success" round v-if="currentTicketInfo.state == 2">已通过</el-tag>
        <el-tag effect="warning" round v-else-if="currentDate > currentTicketInfo.dueTime">已逾期</el-tag>
        <el-tag effect="primary" round v-else-if="currentTicketInfo.state == 0">进行中</el-tag>
      </el-descriptions-item>

      <el-descriptions-item span="4">
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <office-building />
            </el-icon>
            关注者
          </div>
        </template>
        <div v-if="watchersID">
          <el-tag v-for="(tag, index) in watchersID" :key="index" effect="light" round type="info"
            style="margin-right: 4px;">
            {{ allNames[tag] }}
          </el-tag>
        </div>
      </el-descriptions-item>
      <!-- <el-descriptions-item span="6">
        <template #label>
          <div class="cell-item">
            <el-icon :style="iconStyle">
              <office-building />
            </el-icon>
            关联工单
          </div>
        </template>
        <div v-if="linkedTickets">
          <el-tag v-for="(tag, index) in linkedTickets" :key="index" effect="light" round type="info"
            style="margin-right: 4px;">
            标题：{{ tag.title }} &nbsp; &nbsp; &nbsp; 创建者: {{ allNames[tag.ownerId] }} &nbsp; &nbsp; &nbsp;  审批者: {{ allNames[tag.assigneeId] }}  &nbsp; &nbsp; &nbsp;  
            <span v-if="tag.priority == 0" style="color: #FF0000;">
              <el-icon>
                <WarningFilled />
              </el-icon>
              P0 紧急
            </span>
            <span v-else-if="tag.priority == 1" style="color: #FF7615;">
              <el-icon>
                <Flag />
              </el-icon>
              P1 重要
            </span>
            <span v-else-if="tag.priority == 2" style="color: #FC9210;">
              <el-icon>
                <CaretTop />
              </el-icon>
              P2 高
            </span>
            <span v-else-if="tag.priority == 3" style="color: #0CAEFF;">
              <el-icon>
                <RemoveFilled />
              </el-icon>
              P3 中
            </span>
            <span v-else-if="tag.priority == 4" style="color: #5A6169;">
              <el-icon>
                <CaretBottom />
              </el-icon>
              P4 低
            </span>
          </el-tag>
        </div>
      </el-descriptions-item> -->
    </el-descriptions>


    <div class="demo-collapse">
      <el-collapse style="margin-top: 20px;  margin-left: 50px; margin-right: 50px;">
        <el-collapse-item name="1">
          <template #title>
            关联表单
          </template>
          <el-table :data="linkedTickets" stripe style="width: 100%" @row-click="clickTicketRow">
            <el-table-column prop="id" label="ID" width="80" sortable />
            <el-table-column prop="title" label="标题" width="180" />
            <el-table-column prop="ownerId" label="创建者" width="120">
              <template #default="scope">
                <el-popover effect="light" trigger="hover" placement="top" width="auto">
                  <template #default>
                    <div>
                      创建者名称: {{ allNames[scope.row.ownerId] }} <br />
                      创建者ID: {{ scope.row.ownerId }}
                    </div>
                  </template>
                  <template #reference>
                    <el-tag effect="light" round>{{ allNames[scope.row.ownerId] }}</el-tag>
                  </template>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column prop="assigneeId" label="当前审批人" width="120">
              <template #default="scope">
                <el-popover effect="light" trigger="hover" placement="top" width="auto">
                  <template #default>
                    <div>
                      审批人名称: {{ allNames[scope.row.assigneeId] }} <br />
                      审批人ID: {{ scope.row.assigneeId }}
                    </div>
                  </template>
                  <template #reference>
                    <el-tag effect="plain" round>{{ allNames[scope.row.assigneeId] }}</el-tag>
                  </template>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="state" sortable width="120">
              <template #default="scope">
                <el-tag effect="danger" round v-if="scope.row.state == 1">已驳回</el-tag>
                <el-tag effect="success" round v-if="scope.row.state == 2">已通过</el-tag>
                <el-tag effect="warning" round v-else-if="currentDate > scope.row.dueTime">已逾期</el-tag>
                <el-tag effect="primary" round v-else-if="scope.row.state == 0">进行中</el-tag>
                <!-- <el-tag effect="success" round v-if="ticketStatus[scope.row.id] == 0">进行中</el-tag>
              <el-tag effect="danger" round v-else-if="ticketStatus[scope.row.id] == 1">已驳回</el-tag> -->
              </template>
            </el-table-column>
            <el-table-column label="优先级" prop="priority" sortable width="100">
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
            <el-table-column label="创建时间" prop="createdTime" sortable width="150"></el-table-column>
            <el-table-column label="修改时间" prop="updatedTime" sortable width="150"></el-table-column>
            <el-table-column label="截止时间" prop="dueTime" sortable width="150"></el-table-column>
            <el-table-column prop="assigneeId" label="正在关注" width="300">
              <template #default="scope">
                <el-popover effect="light" trigger="hover" placement="top" width="auto">
                  <template #default>
                    <div v-if="watcherNames[scope.row.id]">{{ watcherNames[scope.row.id].join(', ') }}</div>
                  </template>
                  <template #reference>
                    <div v-if="watcherNames[scope.row.id]">
                      <el-tag v-for="(tag, index) in watcherNames[scope.row.id].slice(1, 3)" :key="index" effect="light"
                        round type="info" style="margin-right: 4px;">
                        {{ tag }}
                      </el-tag>
                      <template v-if="watcherNames[scope.row.id].length > 3">
                        <el-tag effect="info" round type="success" style="margin-right: 4px;"> ... </el-tag>
                      </template>
                      <template v-if="watcherNames[scope.row.id].length = 0">
                        无
                      </template>
                    </div>
                  </template>
                </el-popover>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item title="附件" name="2">
          <el-tag v-for="(tag, index) in attachmentList" :key="index" effect="primary" round style="margin-right: 4px;">
            <a :href="tag" download>{{ tag.split("~")[1] }} <br /> </a>
          </el-tag>
          <div v-if="attachmentList.length == 0" style="margin-left: 20px;">无</div>
          <!-- <el-tag effect="primary" round style="margin-right: 4px;"> <a href="http://example.com/file.pdf" download>点击下载文件</a> </el-tag> -->
        </el-collapse-item>
      </el-collapse>
    </div>

    <el-card style="margin-top: 10px;  margin-left: 50px; margin-right: 50px; min-height: 350px;" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>工单描述</span>
        </div>
      </template>
      <div v-html="currentTicketInfo.description" style="margin-left: 10px; margin-right: 10px;"></div>
    </el-card>




  </el-card>

  <el-drawer v-model="drawer" title="新建表单" :with-header="true" size="90%" direction="btt">
    <!-- 添加文章表单 -->
    <el-form :model="ticketModel" :rules="rules" label-width="100px"
      style="margin-left: 150px;margin-right: 150px; margin-top: 50px;">
      <div style="display: flex; justify-content: space-between;">
        <el-form-item label="标题" style="width: 75%;" prop="title">
          <el-input v-model="ticketModel.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="优先级" style="width: 23%;" prop="priority">
          <el-select placeholder="请选择" v-model="priorityArray" @change="priorityChange" multiple multiple-limit=1>
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
          <el-select placeholder="请选择" v-model="ticketModel.belongsTo" filterable disabled>
            <!-- <el-option v-for="c in categorys" :key="c.id" :label="c.categoryName" :value="c.id">
              <span style="float: left">{{ c.categoryName }}</span>
              <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">Group
                ID: {{ c.id }}</span>
            </el-option> -->
          </el-select>
        </el-form-item>
        <el-form-item label="审批用户" style="width: 33%;" prop="assigneeId">
          <el-select placeholder="请选择" v-model="ticketModel.assigneeId" filterable disabled>
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
          <el-select placeholder="请选择" v-model="linkedTicketsId" filterable :disabled="ticketDisabled" multiple>
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
        <el-upload v-model:file-list="fileList" class="avatar-uploader" :auto-upload="true" :show-file-list="true"
          action="/api/upload" name="file" :headers="{ 'Authorization': tokenStore.token }" :on-success="uploadSuccess"
          drag="true" style="width: 35%" :before-upload="beforeUploadAttachment" :on-remove="removeAttachment">

          <div v-if="attachmentList.length > 0">
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
          <quill-editor ref="myQuillEditor" theme="snow" v-model:content="ticketModel.description" :value="defaultValue"
            contentType="html" style="min-height: 300px;">
          </quill-editor>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="updateTicket" :disabled="submitDisabled">发布</el-button>
        <el-button type="info" @click="clearTicket">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>

  <el-dialog v-model="dialogVisible" title="请选择审批权转让用户" width="30%">
    <el-select placeholder="请选择" v-model="newAssignee" filterable :disabled="userDisabled">
      <el-option v-for="c in groupUsers" :key="c.id" :label="c.username" :value="c.id">
        <span style="float: left">{{ c.username }}</span>
        <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">
          User ID: {{ c.id }}</span>
      </el-option>
    </el-select>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false; newAssignee = ''">取消</el-button>
        <el-button type="primary" @click="openTransfer">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>

  <el-drawer v-model="visible" :show-close="false">
    <template #header="{ close, titleId, titleClass }">
      <h4 :id="titleId" :class="titleClass">工单流转记录</h4>
      <el-button type="danger" @click="close">
        <el-icon class="el-icon--left">
          <CircleCloseFilled />
        </el-icon>
        关闭
      </el-button>
    </template>
    <div>
      <el-timeline style="max-width: 600px">
        <el-timeline-item :key="route[0].id" :timestamp="route[0].createdTime" placement="top" :color="color[0]">
          <el-card shadow="hover">
            <h4>用户 {{ allNames[route[0].sender] }} 创建了工单</h4>
            <p>工单在 {{ route[0].updatedTime }} 由 {{ allNames[route[0].sender] }} 分配给 {{ allNames[route[0].receiver] }}</p>
          </el-card>
        </el-timeline-item>
        <!-- <div v-for="(item, index) in route">
          <el-timeline-item v-if="item.status == 1 && index != route.length-1" :key="item.id" :timestamp="item.updatedTime" placement="top">
            <el-card shadow="hover">
            <h4>用户 {{ allNames[item.lastEditedBy] }} 审批通过了工单</h4>
            <p>工单在 {{ item.updatedTime }} 由 {{ allNames[item.receiver] }} 流转给 {{ allNames[route[index+1].receiver] }}</p>
          </el-card>
          </el-timeline-item>
            <el-timeline-item v-else-if="item.status == 2" :key="item.id + '-rejected'" :timestamp="item.updatedTime" placement="top">
            <el-card shadow="hover">
            <h4>用户 {{ allNames[item.lastEditedBy] }} 驳回了工单</h4>
          </el-card>
          </el-timeline-item>
            <el-timeline-item v-else-if="item.status == 1" :key="item.id + '-approved'" :timestamp="item.updatedTime" placement="top">
            <el-card shadow="hover">
            <h4>用户 {{ allNames[item.lastEditedBy] }} 审批通过了工单</h4>
          </el-card>
          </el-timeline-item>
            <el-timeline-item v-else-if="item.status == 0" :key="item.id + '-pending'" :timestamp="item.updatedTime" placement="top">
            <el-card shadow="hover">
            <h4>用户 {{ allNames[item.lastEditedBy] }} 正在审批工单...</h4>
          </el-card>
          </el-timeline-item>
        </div> -->
        <el-timeline-item v-for="(item, index) in route" :key="item.id"
          :timestamp="item.updatedTime" placement="top" :color="color[item.status]">
          <el-card v-if="item.status == 1 && index != route.length-1" shadow="hover">
            <h4>用户 {{ allNames[item.lastEditedBy] }} 审批通过了工单</h4>
            <p>工单在 {{ item.updatedTime }} 由 {{ allNames[item.receiver] }} 流转给 {{ allNames[route[index+1].receiver] }}</p>
          </el-card>
          <el-card v-else-if="item.status == 2" shadow="hover">
            <h4>用户 {{ allNames[item.receiver] }} 驳回了工单</h4>
          </el-card>
          <el-card v-else-if="item.status == 1" shadow="hover">
            <h4>用户 {{ allNames[item.receiver] }} 审批通过了工单</h4>
          </el-card>
          <el-card v-else-if="item.status == 0" shadow="hover">
            <h4>用户 {{ allNames[item.receiver] }} 正在审批工单...</h4>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
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
</style>
