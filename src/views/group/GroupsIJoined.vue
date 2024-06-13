<script setup lang="ts">
import { Edit, Delete } from "@element-plus/icons-vue";
import { ref, onMounted, nextTick, computed } from "vue";
import { useRouter } from 'vue-router'
const router = useRouter()
const categorys = ref([]);
import { ElLoading, namespaceContextKey } from 'element-plus'

import { ElMessage } from "element-plus";
import { CircleCloseFilled, CirclePlusFilled, RemoveFilled, DeleteFilled, InfoFilled, CaretBottom, CaretTop, Flag, WarningFilled, Search, AddLocation, SemiSelect } from '@element-plus/icons-vue'
import { getAllGroups } from "@/api/group.js";



const allGroups = async () => {
  const allGroupLoading = ElLoading.service({
    lock: true,
    text: '请稍候...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let res = await getAllGroups();
  categorys.value = res.data;
  await getNames()
  await IinGroups()
  await getAdminNames();
  await checkClickable();
  allGroupLoading.close();
};

allGroups();

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

const rules = {
  categoryName: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  categoryDetail: [{ required: false, message: "请输入分类详情", trigger: "blur" }],
};

import { addGroup } from "@/api/group.js";

const addCategory = async () => {
  let result = await addGroup(categoryModel.value);
  console.log("adding...");
  ElMessage.success("创建成功");
  allGroups();
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
  for (const category of categorys.value) {
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
  allGroups();
  dialogVisible.value = false;
};

// const deleteGroup = async (row) => {
//   let result = await deleteCategoryService(row.id);
//   ElMessage.success("删除成功");
//   allGroups();
// };

const members = ref([]);
const tickets = ref([]);

const getMembers = async (row) => {
  let result = await getCategoryMembersService(row.id);
  // console.log(result);
  members.value = result;
};

import { getCategoryTicketsService, getStatusByTicketId, getTicketById, getAllTicketByGroupsService } from "@/api/ticket.js";

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
  currentPage.value = 1;
  pageSize.value = 5;
  allTicketsNum.value = 0;
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
    currentClickRow.value.categoryOwnerId = row.ownerId;
    currentClickRow.value.categoryAdmin = adminNames.value[row.id];
    currentClickRow.value.categoryMember = members.value;
    groupinfoLoading.close();

    if (currentClickRow.value.viewable) {
      await allTicketsInit(currentClickRow.value.categoryId)
      // await getTickets(row);
      currentClickRow.value.categoryTickets = tickets.value;
      // await getWatcherNames();
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

let buttonClickable = ref({});

const checkClickable = async () => {
  for (const category of categorys.value) {
    if (allUserGroups.value.includes(category.id)) {
      buttonClickable.value[category.id] = true;
    } else {
      buttonClickable.value[category.id] = false;
    }
  }
}

import { createJoinGroupRequest, createGroupAdminRequest } from "@/api/message.js";

const requestJoiningGroup = async (id) => {
  const result = await isUserInGroup(id);
  if (result) {
    ElMessage.error("你已经在这个组中");
  } else {
    await createJoinGroupRequest(id);
    ElMessage.success("申请成功");
  }
}

const requestGroupAdmin = async (id) => {
  await createGroupAdminRequest(id);
  ElMessage.success("申请成功");
}

import { exitGroupService, deleteGroupService } from '@/api/group.js'

const exitGroup = async (id) => {
  let code = await exitGroupService(id);
  if (code) {
    ElMessage.error("退出失败")
  }
  else {
    ElMessage.success("退出成功")
  }
}

const deleteGroup = async (id) => {
  if (tickets.value.length > 0) {
    ElMessage.error("删除组前，须清空组中所有工单")
  }
  else {
    let code = await deleteGroupService(id);
    if (code) {
      ElMessage.error("删除失败")
    }
    else {
      ElMessage.success("删除成功")
      window.location.reload();
    }
  }
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
  categorys.value.filter(
    (data) =>
      !search.value ||
      data.categoryName.toLowerCase().includes(search.value.toLowerCase()) ||
      (data.categoryDetail && data.categoryDetail.toLowerCase().includes(search.value.toLowerCase()))
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

const pageSize = ref(5);
const currentPage = ref(1);
const allTicketsNum = ref(0);
const allTIckets = ref([]);

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  allTicket(currentClickRow.value.categoryId);
  console.log(`${currentPage} items per page`)
}
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  allTicket(currentClickRow.value.categoryId);
  console.log(`current page: ${val}`)
}

const allTicket = async (groupId) => {
  const ticketTarget = document.querySelector('.ticket-container');
  const ticketLoading = ElLoading.service({
    target: ticketTarget,
    lock: false,
    fullscreen: false,
    text: '请稍候...',
    background: 'rgba(122, 122, 122, 0.3)',
  });
  let res = await getAllTicketByGroupsService(currentPage.value, pageSize.value, groupId);
  tickets.value = res.items;
  allTicketsNum.value = res.total;
  await getWatcherNames();
  ticketLoading.close();
}

const allTicketsInit = async (groupId) => {
  currentPage.value = 1;
  pageSize.value = 5;
  let res = await getAllTicketByGroupsService(currentPage.value, pageSize.value, groupId);
  tickets.value = res.items;
  allTicketsNum.value = res.total;
  await getWatcherNames();
};

</script>
<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>项目组</span>
        <div class="extra">
          <el-input v-model="search" size="large" style="text-align: right; width: 240px; margin-right: 40px;"
            :prefix-icon="Search" placeholder="输入以查询组" />
          <el-button type="primary" @click="
            dialogVisible = true;
          title = '添加组';">添加组</el-button>
        </div>
      </div>
    </template>
    <el-table :data="filterTableData" stripe table-layout="auto" @row-click="clickRow"
      :default-sort="{ prop: 'id', order: 'ascending' }">
      <el-table-column fixed label="序号" width="100" prop="id" sortable> </el-table-column>
      <el-table-column label="组名称" prop="categoryName" sortable></el-table-column>
      <el-table-column label="组详情" prop="categoryDetail"></el-table-column>
      <el-table-column label="组所有者" prop="ownerId" style="width: 200">
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
      <el-table-column label="组管理员" prop="groupAdmin">
        <template #default="scope">
          <el-popover effect="light" trigger="hover" placement="top" width="auto">
            <template #default>
              <div v-if="adminNames[scope.row.id]">{{ adminNames[scope.row.id].join(', ') }}</div>
            </template>
            <template #reference>
              <div v-if="adminNames[scope.row.id]">
                <el-tag v-for="(tag, index) in adminNames[scope.row.id].slice(1, 3)" :key="index" effect="light" round
                  type="success" style="margin-right: 4px;">
                  {{ tag }}
                </el-tag>
                <template v-if="adminNames[scope.row.id].length > 3">
                  <el-tag effect="light" round type="success" style="margin-right: 4px;"> ... </el-tag>
                </template>
              </div>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdTime" sortable></el-table-column>
      <el-table-column label="最后修改时间" prop="updatedTime" sortable></el-table-column>
      <el-table-column label="" width="150">
        <template #default="{ row }">
          <!-- <el-button :icon="Edit" circle plain type="primary" @click.stop="showDialog(row)"></el-button>
          <el-popconfirm title="你确认删除此分组吗?" confirm-button-text="Yes" cancel-button-text="No" :icon="InfoFilled"
            icon-color="red" @confirm="deleteGroup(row)">
            <template #reference>
              <el-button :icon="Delete" circle plain type="danger" @click.stop></el-button>
            </template>
          </el-popconfirm> -->

          <el-popconfirm title="确定申请加入此项目组吗?" confirm-button-text="是" cancel-button-text="否" :icon="InfoFilled"
            icon-color="green" @confirm="requestJoiningGroup(row.id)">
            <template #reference>
              <el-tooltip content="你已经在这个组中" v-if="buttonClickable[row.id]">
                <el-button :icon="AddLocation" circle plain type="success" @click.stop disabled></el-button>
              </el-tooltip>
              <el-button :icon="AddLocation" circle plain type="success" @click.stop v-else></el-button>
            </template>
          </el-popconfirm>


        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>
    <el-drawer v-model="drawerVisible" :show-close="false" :direction="direction" size="70%" class="drawer">
      <template #header="{ close, titleId, titleClass }">
        <h4 :id="titleId" :class="titleClass">组详情</h4>
        <el-tooltip content="你已经在这个组中" v-if="buttonClickable[currentClickRow.categoryId]">
          <el-button type="primary" @click="requestJoiningGroup(currentClickRow.categoryId)" disabled
            :loading="buttonLoading">
            <el-icon class="el-icon--left">
              <CirclePlusFilled />
            </el-icon>
            申请加入
          </el-button>
        </el-tooltip>
        <el-button type="primary" @click="requestJoiningGroup(currentClickRow.categoryId)" v-else
          :loading="buttonLoading">
          <el-icon class="el-icon--left">
            <CirclePlusFilled />
          </el-icon>
          申请加入
        </el-button>
        <el-tooltip content="你不在当前组中" v-if="!buttonClickable[currentClickRow.categoryId]">
          <el-button type="primary" @click="requestGroupAdmin(currentClickRow.categoryId)" disabled
            :loading="buttonLoading">
            <el-icon class="el-icon--left">
              <CirclePlusFilled />
            </el-icon>
            申请管理员权限
          </el-button>
        </el-tooltip>
        <el-tooltip content="你已经拥有管理员权限" v-else-if="currentClickRow.editable">
          <el-button type="primary" @click="requestGroupAdmin(currentClickRow.categoryId)" disabled
            :loading="buttonLoading">
            <el-icon class="el-icon--left">
              <CirclePlusFilled />
            </el-icon>
            申请管理员权限
          </el-button>
        </el-tooltip>
        <el-button type="primary" @click="requestGroupAdmin(currentClickRow.categoryId)" v-else
          :loading="buttonLoading">
          <el-icon class="el-icon--left">
            <CirclePlusFilled />
          </el-icon>
          申请管理员权限
        </el-button>
        <el-tooltip content="你不在当前组中" v-if="!buttonClickable[currentClickRow.categoryId]">
          <el-button type="warning" @click="requestJoiningGroup(currentClickRow.categoryId)" disabled
            :loading="buttonLoading">
            <el-icon class="el-icon--left">
              <RemoveFilled />
            </el-icon>
            退出组
          </el-button>
        </el-tooltip>
        <el-tooltip content="组所有者无法退出组" v-else-if="currentClickRow.deletable">
          <el-button type="warning" @click="exitGroup(currentClickRow.categoryId)" disabled :loading="buttonLoading">
            <el-icon class="el-icon--left">
              <RemoveFilled />
            </el-icon>
            退出组
          </el-button>
        </el-tooltip>
        <el-button type="warning" @click="exitGroup(currentClickRow.categoryId)" v-else :loading="buttonLoading">
          <el-icon class="el-icon--left">
            <RemoveFilled />
          </el-icon>
          退出组
        </el-button>
        <el-tooltip content="你没有权限删除组" v-if="!currentClickRow.deletable">
          <el-button type="danger" @click="deleteGroup(currentClickRow.categoryId)" disabled
            :loading="buttonLoading">
            <el-icon class="el-icon--left">
              <DeleteFilled />
            </el-icon>
            删除组
          </el-button>
        </el-tooltip>
        <el-button type="danger" @click="deleteGroup(currentClickRow.categoryId)" v-else
          :loading="buttonLoading">
          <el-icon class="el-icon--left">
            <DeleteFilled />
          </el-icon>
          删除组
        </el-button>
        <el-tooltip content="你没有权限编辑组信息" v-if="!currentClickRow.editable">
          <el-button color="#626aef" @click="showDialogDetail(currentClickRow)" disabled :loading="buttonLoading">
            <el-icon class="el-icon--left">
              <InfoFilled />
            </el-icon>
            编辑组
          </el-button>
        </el-tooltip>
        <el-button color="#626aef" @click="showDialogDetail(currentClickRow)" v-else :loading="buttonLoading">
          <el-icon class="el-icon--left">
            <InfoFilled />
          </el-icon>
          编辑组
        </el-button>
        <el-button type="danger" @click="close">
          <el-icon class="el-icon--left">
            <CircleCloseFilled />
          </el-icon>
          关闭
        </el-button>
      </template>


      <el-descriptions v-if="currentClickRow" :title="currentClickRow.categoryName" direction="vertical" :column="4"
        size="large" border class="group-info">
        <!-- <el-descriptions-item label="组名称">{{ currentClickRow.categoryName }}</el-descriptions-item> -->
        <el-descriptions-item label="组所有者">
          <template #default="scope">
            <el-popover effect="light" trigger="hover" placement="top" width="auto">
              <template #default>
                <div>
                  拥有者名称: {{ currentClickRow.categoryOwner }} <br />
                  拥有者ID: {{ currentClickRow.categoryOwnerId }}
                </div>
              </template>
              <template #reference>
                <el-tag effect="light" round style="margin-right: 4px;">{{ currentClickRow.categoryOwner }}</el-tag>
              </template>
            </el-popover>
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="组管理员" :span="2">
          <div v-if="currentClickRow">
            <el-tag v-for="(tag, index) in currentClickRow.categoryAdmin" :key="index" effect="plain" round
              type="primary" style="margin-right: 4px;">
              {{ tag }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="组成员">
          <div v-if="currentClickRow">
            <el-tag v-for="(tag, index) in currentClickRow.categoryMember" :key="index" effect="light" round type="info"
              style="margin-right: 4px;">
              {{ tag }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="组简介">{{ currentClickRow.categoryDetail }}
        </el-descriptions-item>
      </el-descriptions>
      <br />

      <el-card class="ticket-container">
        <template #header>
          <div class="card-header">
            <span>包含工单</span>
          </div>
        </template>
        <div v-if="currentClickRow.viewable">
          <el-table :data="tickets" stripe style="width: 100%" @row-click="clickTicketRow">
            <el-table-column prop="id" label="ID" sortable />
            <el-table-column prop="title" label="主题" />
            <el-table-column prop="ownerId" label="创建者">
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
            <el-table-column prop="assigneeId" label="当前审批人">
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
            <el-table-column prop="assigneeId" label="正在关注">
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
                    </div>
                  </template>
                </el-popover>
              </template>
            </el-table-column>
            <el-table-column label="状态" prop="state" sortable>
              <template #default="scope">
                <el-tag effect="danger" round v-if="scope.row.state == 1">已结束</el-tag>
                <el-tag effect="success" round v-if="scope.row.state == 2">已通过</el-tag>
                <el-tag effect="warning" round v-else-if="currentDate > scope.row.dueTime">已逾期</el-tag>
                <el-tag effect="primary" round v-else-if="scope.row.state == 0">进行中</el-tag>
              </template>
            </el-table-column>
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
            <el-table-column label="创建时间" prop="createdTime" sortable></el-table-column>
            <el-table-column label="修改时间" prop="updatedTime" sortable></el-table-column>
            <el-table-column label="截止时间" prop="dueTime" sortable></el-table-column>
          </el-table>

        </div>
        <el-empty description="加入组以查看组内工单..." v-else>
          <el-button type="primary" @click="requestJoiningGroup(currentClickRow.categoryId)">
            <el-icon class="el-icon--left">
              <CirclePlusFilled />
            </el-icon>
            申请加入
          </el-button>
        </el-empty>
        <template #footer>
          <!-- 可查看{{ currentClickRow.categoryTickets.length }}个工单 -->
          <div style="margin-top: 10px">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
              layout="total, prev, pager, next, jumper, sizes" :total="allTicketsNum" @size-change="handleSizeChange"
              @current-change="handleCurrentChange">
              <span slot="total">哈哈</span>
            </el-pagination>
          </div>

        </template>
      </el-card>

    </el-drawer>
  </el-card>

  <el-dialog v-model="dialogVisible" :title="title" width="30%">
    <el-form :model="categoryModel" :rules="rules" label-width="100px" style="padding-right: 30px">
      <el-form-item label="组名称" prop="categoryName">
        <el-input v-model="categoryModel.categoryName" minlength="1" maxlength="10"></el-input>
      </el-form-item>
      <el-form-item label="组详情" prop="categoryDetail">
        <el-input v-model="categoryModel.categoryDetail" minlength="1" maxlength="15"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="title == '添加组' ? addCategory() : updateCategory()">
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
</style>
