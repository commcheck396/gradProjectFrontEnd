<script setup>
import { Edit, Delete } from "@element-plus/icons-vue";
import { ref, onMounted, nextTick, computed } from "vue";
import { useRouter } from 'vue-router'
const router = useRouter()
const categorys = ref([]);
import { ElLoading } from 'element-plus'

import { ElMessage } from "element-plus";
import { CircleCloseFilled, CirclePlusFilled, RemoveFilled, DeleteFilled, InfoFilled, CaretBottom, CaretTop, Flag, WarningFilled } from '@element-plus/icons-vue'
import { getAllGroups } from "@/api/group.js";



const allGroups = async () => {
  const allGroupLoading = ElLoading.service({
    lock: true,
    text: '请稍候...',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let res = await getAllGroups();
  categorys.value = res.data;
  // console.log(categorys.value);
  await getOwnerNames();
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
  ElMessage.success("创建成功");
  allGroups();
  dialogVisible.value = false;
  cleanCategoryModel();
};

import { getNameById } from "@/api/user.js";

const getName = async (id) => {
  let res = await getNameById(id);
  return res.data;
};

let ownerNames = ref({});

const getOwnerNames = async () => {
  for (const category of categorys.value) {
    if (ownerNames.value[category.ownerId]) {
      continue;
    }
    const name = await getName(category.ownerId);
    ownerNames.value[category.ownerId] = name;
  }
};

const getTicketOwnerNames = async () => {
  for (const ticket of tickets.value) {
    if (ownerNames.value[ticket.ownerId]) {
      continue;
    }
    const name = await getName(ticket.ownerId);
    ownerNames.value[ticket.ownerId] = name;
  }
};

const getTicketAssigneeNames = async () => {
  for (const ticket of tickets.value) {
    if (ownerNames.value[ticket.assigneeId]) {
      continue;
    }
    const name = await getName(ticket.ownerId);
    ownerNames.value[ticket.assigneeId] = name;
  }
};

// const getNames = async (users) =>{
//   for 
// }

let adminNames = ref({});

import { getAdminNamesByGroupId } from "@/api/user.js";

const getAdminNames = async () => {
  for (const category of categorys.value) {
    const name = await getAdminNamesByGroupId(category.id);
    adminNames.value[category.id] = name;
  }
};

let watcherNames = ref({});

import { getWatcherNamesByTicketId } from "@/api/user.js";

const getWatcherNames = async () => {
  for (const ticket of tickets.value) {
    const name = await getWatcherNamesByTicketId(ticket.id);
    watcherNames.value[ticket.id] = name;
    // console.log(name);
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
  ElMessage.success("更新成功");
  allGroups();
  dialogVisible.value = false;
};

const deleteGroup = async (row) => {
  let result = await deleteCategoryService(row.id);
  ElMessage.success("删除成功");
  allGroups();
};

const members = ref([]);
const tickets = ref([]);

const getMembers = async (row) => {
  let result = await getCategoryMembersService(row.id);
  // console.log(result);
  members.value = result;
};

import { getCategoryTicketsService, getStatusByTicketId, getTicketById } from "@/api/ticket.js";

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

const clickRow = async (row) => {
  clearCurrentClickRow();
  drawerVisible.value = true
  nextTick(async () => {
    const drawerTarget = document.querySelector('.drawer');
    const drawerLoading = ElLoading.service({
      target: drawerTarget,
      lock: false,
      fullscreen: false,
      background: 'rgba(122, 122, 122, 0.3)',
    });
    currentClickRow.value.editable = await checkEditable(row.id);
    currentClickRow.value.deletable = await checkDeletable(row.id);
    currentClickRow.value.quitable = await inGroup(row);
    currentClickRow.value.viewable = await checkViewable(row.id);
    drawerLoading.close();

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
    currentClickRow.value.categoryOwner = ownerNames.value[row.ownerId];
    console.log(currentClickRow.value.categoryOwner);
    currentClickRow.value.categoryOwnerId = row.ownerId;
    currentClickRow.value.categoryAdmin = adminNames.value[row.id];
    currentClickRow.value.categoryMember = members.value;
    groupinfoLoading.close();

    await getTickets(row);
    currentClickRow.value.categoryTickets = tickets.value;
    await getTicketInfo()
    await getTicketOwnerNames()
    await getTicketAssigneeNames()
    await getWatcherNames()
    // await getTicketStatus()

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

import { isUserInGroup, isGroupEditable, isGroupDeletable, isGroupViewable } from "@/api/user.js";

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
}


const drawerVisible = ref(false);
const direction = ref('rtl')



const inGroup = async (row) => {
  const result = ref(false);
  result.value = await isUserInGroup(row.id);
  // console.log(result.value);
  return result;
}

let buttonClickable = ref({});

const checkClickable = async () => {
  for (const category of categorys.value) {
    buttonClickable.value[category.id] = await inGroup(category);
  }
}

const requestJoiningGroup = async (id) => {
  const result = await isUserInGroup(id);
  if (result) {
    ElMessage.error("你已经在这个组中");
  } else {
    ElMessage.success("申请成功");
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
    ticketOwnerNames: {},
    editable: false,
    deletable: false,
    quitable: false,
    viewable: false,
  };
}

</script>
<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>项目组</span>
        <div class="extra">
          <el-button type="primary" @click="
            dialogVisible = true;
          title = '添加组';
          ">添加组</el-button>
        </div>
      </div>
    </template>
    <el-table :data="categorys" stripe style="width: 100%" @row-click="clickRow">
      <el-table-column fixed label="序号" width="100" type="index"> </el-table-column>
      <el-table-column label="组名称" prop="categoryName"></el-table-column>
      <el-table-column label="组详情" prop="categoryDetail"></el-table-column>
      <el-table-column label="组所有者" prop="ownerId">
        <template #default="scope">
          <el-popover effect="light" trigger="hover" placement="top" width="auto">
            <template #default>
              <div>
                拥有者名称: {{ ownerNames[scope.row.ownerId] }} <br />
                拥有者ID: {{ scope.row.ownerId }}
              </div>
            </template>
            <template #reference>
              <el-tag effect="light" round>{{ ownerNames[scope.row.ownerId] }}</el-tag>
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
                  type="success">
                  {{ tag }}
                </el-tag>
                <template v-if="adminNames[scope.row.id].length > 3">
                  <el-tag effect="light" round type="success"> ... </el-tag>
                </template>
              </div>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createdTime"></el-table-column>
      <el-table-column label="最后修改时间" prop="updatedTime"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary" @click.stop="showDialog(row)"></el-button>
          <el-popconfirm title="Are you sure to delete this?" confirm-button-text="Yes" cancel-button-text="No"
            :icon="InfoFilled" icon-color="red" @confirm="deleteGroup(row)">
            <template #reference>
              <el-button :icon="Delete" circle plain type="danger" @click.stop></el-button>
            </template>
          </el-popconfirm>

          <el-popconfirm title="Are you sure to delete this?" confirm-button-text="Yes" cancel-button-text="No"
            :icon="InfoFilled" icon-color="green" @confirm="requestJoiningGroup(row.id)">
            <template #reference>
              <el-tooltip content="你已经在这个组中" v-if="buttonClickable[row.id]">
                <el-button :icon="Delete" circle plain type="danger" @click.stop disabled></el-button>
              </el-tooltip>
              <el-button :icon="Delete" circle plain type="danger" @click.stop v-else></el-button>
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
          <el-button type="primary" @click="requestJoiningGroup(currentClickRow.categoryId)" disabled>
            <el-icon class="el-icon--left">
              <CirclePlusFilled />
            </el-icon>
            申请加入
          </el-button>
        </el-tooltip>
        <el-button type="primary" @click="requestJoiningGroup(currentClickRow.categoryId)" v-else>
          <el-icon class="el-icon--left">
            <CirclePlusFilled />
          </el-icon>
          申请加入
        </el-button>
        <el-tooltip content="你不在当前组中" v-if="!buttonClickable[currentClickRow.categoryId]">
          <el-button type="warning" @click="requestJoiningGroup(currentClickRow.categoryId)" disabled>
            <el-icon class="el-icon--left">
              <RemoveFilled />
            </el-icon>
            退出组
          </el-button>
        </el-tooltip>
        <el-tooltip content="组所有者无法退出组" v-else-if="currentClickRow.deletable">
          <el-button type="warning" @click="requestJoiningGroup(currentClickRow.categoryId)" disabled>
            <el-icon class="el-icon--left">
              <RemoveFilled />
            </el-icon>
            退出组
          </el-button>
        </el-tooltip>
        <el-button type="warning" @click="requestJoiningGroup(currentClickRow.categoryId)" v-else>
          <el-icon class="el-icon--left">
            <RemoveFilled />
          </el-icon>
          退出组
        </el-button>
        <el-tooltip content="你已经在这个组中" v-if="!currentClickRow.deletable">
          <el-button type="danger" @click="requestJoiningGroup(currentClickRow.categoryId)" disabled>
            <el-icon class="el-icon--left">
              <DeleteFilled />
            </el-icon>
            删除组
          </el-button>
        </el-tooltip>
        <el-button type="danger" @click="requestJoiningGroup(currentClickRow.categoryId)" v-else>
          <el-icon class="el-icon--left">
            <DeleteFilled />
          </el-icon>
          删除组
        </el-button>
        <el-tooltip content="你已经在这个组中" v-if="!currentClickRow.deletable">
          <el-button color="#626aef" @click="requestJoiningGroup(currentClickRow.categoryId)" disabled>
            <el-icon class="el-icon--left">
              <InfoFilled />
            </el-icon>
            编辑组
          </el-button>
        </el-tooltip>
        <el-button color="#626aef" @click="requestJoiningGroup(currentClickRow.categoryId)" v-else>
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
                <el-tag effect="light" round>{{ currentClickRow.categoryOwner }}</el-tag>
              </template>
            </el-popover>
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="组管理员" :span="2">
          <div v-if="currentClickRow">
            <el-tag v-for="(tag, index) in currentClickRow.categoryAdmin" :key="index" effect="light" round
              type="success">
              {{ tag }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="组成员">
          <div v-if="currentClickRow">
            <el-tag v-for="(tag, index) in currentClickRow.categoryMember" :key="index" effect="light" round
              type="info">
              {{ tag }}
            </el-tag>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="组简介">{{ currentClickRow.categoryDetail }}
        </el-descriptions-item>
      </el-descriptions>
      <br />

      <el-card style="max-height: 100%;" class="ticket-container">
        <template #header>
          <div class="card-header">
            <span>包含工单</span>
          </div>
        </template>
        <el-table :data="currentClickRow.categoryTickets" stripe style="width: 100%" @row-click="clickTicketRow"
          v-if="currentClickRow.viewable">
          <el-table-column prop="id" label="ID" />
          <el-table-column prop="title" label="主题" />
          <el-table-column prop="ownerId" label="创建者">
            <template #default="scope">
              <el-popover effect="light" trigger="hover" placement="top" width="auto">
                <template #default>
                  <div>
                    创建者名称: {{ ownerNames[scope.row.ownerId] }} <br />
                    创建者ID: {{ scope.row.ownerId }}
                  </div>
                </template>
                <template #reference>
                  <el-tag effect="light" round>{{ ownerNames[scope.row.ownerId] }}</el-tag>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="assigneeId" label="当前审批人">
            <template #default="scope">
              <el-popover effect="light" trigger="hover" placement="top" width="auto">
                <template #default>
                  <div>
                    创建者名称: {{ ownerNames[scope.row.assigneeId] }} <br />
                    创建者ID: {{ scope.row.ownerId }}
                  </div>
                </template>
                <template #reference>
                  <el-tag effect="warning" round>{{ ownerNames[scope.row.assigneeId] }}</el-tag>
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
                      round type="info">
                      {{ tag }}
                    </el-tag>
                    <template v-if="watcherNames[scope.row.id].length > 3">
                      <el-tag effect="info" round type="success"> ... </el-tag>
                    </template>
                  </div>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="scope">
              <el-tag effect="success" round v-if="ticketStatus[scope.row.id]==0">进行中</el-tag>
              <el-tag effect="danger" round v-else-if="ticketStatus[scope.row.id]==1">已结束</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级">
            <template #default="scope">
              <el-text size="small" style="color: #FF0000;" v-if="ticketPriority[scope.row.id]==0"><el-icon><WarningFilled /></el-icon>P0 紧急</el-text>
              <el-text size="small" style="color: #FF7615;" v-else-if="ticketPriority[scope.row.id]==1"><el-icon><Flag /></el-icon>P1 重要</el-text>
              <el-text size="small" style="color: #FC9210;" v-else-if="ticketPriority[scope.row.id]==2"><el-icon><CaretTop /></el-icon>P2   高</el-text>
              <el-text size="small" style="color: #0CAEFF;" v-else-if="ticketPriority[scope.row.id]==3"><el-icon><RemoveFilled /></el-icon>P3   中</el-text>
              <el-text size="small" style="color: #5A6169;" v-else-if="ticketPriority[scope.row.id]==4"><el-icon><CaretBottom /></el-icon>P4   低</el-text>
            </template>
          </el-table-column>
        </el-table>
        <el-empty description="加入组以查看组内工单..." v-else>
          <el-button type="primary" @click="requestJoiningGroup(currentClickRow.categoryId)">
            <el-icon class="el-icon--left">
              <CirclePlusFilled />
            </el-icon>
            申请加入
          </el-button>
        </el-empty>
        <template #footer>共包含{{ currentClickRow.categoryTickets.length }}个工单</template>
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
