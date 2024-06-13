<script lang="ts" setup>
import {
  ArrowRight,
  CaretBottom,
  CaretTop,
  Warning,
} from '@element-plus/icons-vue'

import { Edit, Delete } from "@element-plus/icons-vue";
import { ref, onMounted, nextTick, computed } from "vue";
import { useRouter } from 'vue-router'
const router = useRouter()
const allTickets = ref([]);
import { ElLoading, namespaceContextKey } from 'element-plus'

import { ElMessage } from "element-plus";
import { CircleCloseFilled, CirclePlusFilled, RemoveFilled, DeleteFilled, InfoFilled, Flag, WarningFilled, Search, AddLocation, SemiSelect, UploadFilled, SuccessFilled, Check, Close } from '@element-plus/icons-vue'
import { getAllGroups, getAllGroupNames } from "@/api/group.js";

import { getCategoryTicketsService, getStatusByTicketId, getTicketById, getAllTicketsService, getTicketIdIWatchingService, watchTicketService, unwatchTicketService, getAllTicketTitle } from "@/api/ticket.js";

import { getAllRequestForCurrentUser, approveRequest, rejectRequest, getAllRequestOfCurrentUser } from '@/api/message.js'

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]

import { getNameById, getAllNames } from "@/api/user.js";

let allNames = ref({})
const getNames = async () => {
  let idNames = await getAllNames()
  allNames.value = idNames;
  console.log(allNames.value);

}

import { getAllTIcketsAssignedToMeService, getAllTicketsCreatedByMeService, getAllTicketsIWatchingService, getPassedTIcketsAssignedToMeService, getPassedTicketsCreatedByMeService, getPassedTicketsIWatchingService, getRejectedTIcketsAssignedToMeService, getRejectedTicketsCreatedByMeService, getRejectedTicketsIWatchingService } from "@/api/ticket.js";
import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore();

const clickTicketRow = async (row) => {
  ElMessage.success("点")
  let ticketId = row.id
  console.log(ticketId);
  // jump to ticket detail page
  router.push('/ticket/detail/' + ticketId)
}

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


const pageSizeAllTicketsAssignedToMe = ref(8);
const currentPageAllTicketsAssignedToMe = ref(1);
const allTicketsNumAllTicketsAssignedToMe = ref(0);
const passedNumTicketsAssignedToMe = ref(0);
let allTicketsAssignedToMe = ref([])
let getAllTicketAssignedToMeInit = async () => {
  const ticketTarget = document.querySelector('.getAllTicketAssignedToMe-container');
  const ticketLoading = ElLoading.service({
    target: ticketTarget,
    lock: false,
    fullscreen: false,
    text: '请稍候...',
    background: 'rgba(122, 122, 122, 0.3)',
  });
  let passRes = await getPassedTIcketsAssignedToMeService(userInfoStore.info.id, currentPageAllTicketsAssignedToMe.value, pageSizeAllTicketsAssignedToMe.value);
  let rejectRes = await getRejectedTIcketsAssignedToMeService(userInfoStore.info.id, currentPageAllTicketsAssignedToMe.value, pageSizeAllTicketsAssignedToMe.value);
  passedNumTicketsAssignedToMe.value = passRes.total + rejectRes.total;
  let res = await getAllTIcketsAssignedToMeService(userInfoStore.info.id, currentPageAllTicketsAssignedToMe.value, pageSizeAllTicketsAssignedToMe.value);
  allTicketsAssignedToMe.value = res.items;
  allTicketsNumAllTicketsAssignedToMe.value = res.total;
  ticketLoading.close()
}

let getAllTicketAssignedToMe = async () => {
  const ticketTarget = document.querySelector('.getAllTicketAssignedToMe-container');
  const ticketLoading = ElLoading.service({
    target: ticketTarget,
    lock: false,
    fullscreen: false,
    text: '请稍候...',
    background: 'rgba(122, 122, 122, 0.3)',
  });
  let res = await getAllTIcketsAssignedToMeService(userInfoStore.info.id, currentPageAllTicketsAssignedToMe.value, pageSizeAllTicketsAssignedToMe.value);
  allTicketsAssignedToMe.value = res.items;
  allTicketsNumAllTicketsAssignedToMe.value = res.total;
  ticketLoading.close()
}

const handleSizeChangeAllTicketsAssignedToMe = (val: number) => {
  pageSizeAllTicketsAssignedToMe.value = val;
  currentPageAllTicketsAssignedToMe.value = 1;
  getAllTicketAssignedToMe();
  console.log(`${currentPageAllTicketsAssignedToMe} items per page`)
}
const handleCurrentChangeAllTicketsAssignedToMe = (val: number) => {
  currentPageAllTicketsAssignedToMe.value = val;
  getAllTicketAssignedToMe();
  console.log(`current page: ${val}`)
}

const pageSizeAllTicketsCreatedByMe = ref(8);
const currentPageAllTicketsCreatedByMe = ref(1);
const allTicketsNumAllTicketsCreatedByMe = ref(0);
const passedNumAllTicketsCreatedByMe = ref(0);
let AllTicketsCreatedByMe = ref([])
let getAllTicketsCreatedByMeInit = async () => {
  const ticketTarget = document.querySelector('.getAllTicketCreatedByMe-container');
  const ticketLoading = ElLoading.service({
    target: ticketTarget,
    lock: false,
    fullscreen: false,
    text: '请稍候...',
    background: 'rgba(122, 122, 122, 0.3)',
  });
  let passRes = await getPassedTicketsCreatedByMeService(userInfoStore.info.id, currentPageAllTicketsCreatedByMe.value, pageSizeAllTicketsCreatedByMe.value);
  let rejectRes = await getRejectedTicketsCreatedByMeService(userInfoStore.info.id, currentPageAllTicketsCreatedByMe.value, pageSizeAllTicketsCreatedByMe.value);
  passedNumAllTicketsCreatedByMe.value = passRes.total + rejectRes.total;
  let res = await getAllTicketsCreatedByMeService(userInfoStore.info.id, currentPageAllTicketsCreatedByMe.value, pageSizeAllTicketsCreatedByMe.value);
  AllTicketsCreatedByMe.value = res.items;
  allTicketsNumAllTicketsCreatedByMe.value = res.total;
  ticketLoading.close()
}

let getAllTicketsCreatedByMe = async () => {
  const ticketTarget = document.querySelector('.getAllTicketCreatedByMe-container');
  const ticketLoading = ElLoading.service({
    target: ticketTarget,
    lock: false,
    fullscreen: false,
    text: '请稍候...',
    background: 'rgba(122, 122, 122, 0.3)',
  });
  let res = await getAllTicketsCreatedByMeService(userInfoStore.info.id, currentPageAllTicketsCreatedByMe.value, pageSizeAllTicketsCreatedByMe.value);
  AllTicketsCreatedByMe.value = res.items;
  allTicketsNumAllTicketsCreatedByMe.value = res.total;
  ticketLoading.close()
}

const handleSizeChangeAllTicketsCreatedByMe = (val: number) => {
  pageSizeAllTicketsCreatedByMe.value = val;
  currentPageAllTicketsCreatedByMe.value = 1;
  getAllTicketsCreatedByMe();
  console.log(`${currentPageAllTicketsCreatedByMe} items per page`)
}
const handleCurrentChangeAllTicketsCreatedByMe = (val: number) => {
  currentPageAllTicketsCreatedByMe.value = val;
  getAllTicketsCreatedByMe();
  console.log(`current page: ${val}`)
}


const pageSizeAllTicketsIWatching = ref(8);
const currentPageAllTicketsIWatching = ref(1);
const allTicketsNumAllTicketsIWatching = ref(0);
const allPassedNumAllTicketsIWatching = ref(0);
let AllTicketsIWatching = ref([])
let getAllTicketsIWatchingInit = async () => {
  const ticketTarget = document.querySelector('.getAllTicketIWatching-container');
  const ticketLoading = ElLoading.service({
    target: ticketTarget,
    lock: false,
    fullscreen: false,
    text: '请稍候...',
    background: 'rgba(122, 122, 122, 0.3)',
  });
  let passRes = await getPassedTicketsIWatchingService(userInfoStore.info.id, currentPageAllTicketsIWatching.value, pageSizeAllTicketsIWatching.value);
  let rejectRes = await getRejectedTicketsIWatchingService(userInfoStore.info.id, currentPageAllTicketsIWatching.value, pageSizeAllTicketsIWatching.value);
  allPassedNumAllTicketsIWatching.value = passRes.total + rejectRes.total;
  let res = await getAllTicketsIWatchingService(userInfoStore.info.id, currentPageAllTicketsIWatching.value, pageSizeAllTicketsIWatching.value);
  AllTicketsIWatching.value = res.items;
  allTicketsNumAllTicketsIWatching.value = res.total;
  ticketLoading.close()
}

let getAllTicketsIWatching = async () => {
  const ticketTarget = document.querySelector('.getAllTicketIWatching-container');
  const ticketLoading = ElLoading.service({
    target: ticketTarget,
    lock: false,
    fullscreen: false,
    text: '请稍候...',
    background: 'rgba(122, 122, 122, 0.3)',
  });
  let res = await getAllTicketsIWatchingService(userInfoStore.info.id, currentPageAllTicketsIWatching.value, pageSizeAllTicketsIWatching.value);
  AllTicketsIWatching.value = res.items;
  allTicketsNumAllTicketsIWatching.value = res.total;
  ticketLoading.close()
}

const handleSizeChangeAllTicketsIWatching = (val: number) => {
  pageSizeAllTicketsIWatching.value = val;
  currentPageAllTicketsIWatching.value = 1;
  getAllTicketsIWatching();
  console.log(`${currentPageAllTicketsIWatching} items per page`)
}
const handleCurrentChangeAllTicketsIWatching = (val: number) => {
  currentPageAllTicketsIWatching.value = val;
  getAllTicketsIWatching();
  console.log(`current page: ${val}`)
}


const init = async () => {
  await getNames()
  await getAllTicketAssignedToMeInit()
  await getAllTicketsCreatedByMeInit()
  await getAllTicketsIWatchingInit()
}

init()



</script>


<template>
  <el-row :gutter="30">
    <el-col :span="8">
      <div class="statistic-card">
        <el-statistic :value="allTicketsNumAllTicketsAssignedToMe">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              审批的工单
              <el-tooltip effect="dark" content="当前所有需要审批的工单" placement="top">
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
        <div class="statistic-footer">
          <div class="footer-item">
            <span>已审核完成工单</span>
            <span class="green">
              {{ passedNumTicketsAssignedToMe }}
              <el-icon>
                <CaretTop />
              </el-icon>
            </span>
          </div>
          <div class="footer-item">
            <el-icon :size="14">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :span="8">
      <div class="statistic-card">
        <el-statistic :value="allTicketsNumAllTicketsCreatedByMe">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              创建的工单
              <el-tooltip effect="dark" content="所有我创建的工单" placement="top">
                <el-icon style="margin-left: 4px" :size="12">
                  <Warning />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-statistic>
        <div class="statistic-footer">
          <div class="footer-item">
            <span>已经完成审批的工单</span>
            <span class="green">
              {{ passedNumAllTicketsCreatedByMe }}
              <el-icon>
                <CaretBottom />
              </el-icon>
            </span>
          </div>
          <div class="footer-item">
            <el-icon :size="14">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :span="8">
      <div class="statistic-card">
        <el-statistic :value="allTicketsNumAllTicketsIWatching" title="关注的工单">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              关注的工单
            </div>
          </template>
        </el-statistic>
        <div class="statistic-footer">
          <div class="footer-item">
            <span>已经完成审批的工单</span>
            <span class="green">
              {{ allPassedNumAllTicketsIWatching }}
              <el-icon>
                <CaretTop />
              </el-icon>
            </span>
          </div>
          <div class="footer-item">
            <el-icon :size="14">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :span="8">
      <el-table :data="allTicketsAssignedToMe" style="width: 100%" class="getAllTicketAssignedToMe-container"
        @row-click="clickTicketRow" stripe>
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
        <!-- <el-table-column prop="assigneeId" label="审批人">
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
            </el-table-column> -->
        <el-table-column label="状态" prop="state" sortable>
          <template #default="scope">
            <el-tag effect="danger" round v-if="scope.row.state == 1">已结束</el-tag>
            <el-tag effect="success" round v-else-if="scope.row.state == 2">已驳回</el-tag>
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
      </el-table>
      <div style="margin-top: 10px">
        <el-pagination v-model:current-page="currentPageAllTicketsAssignedToMe"
          v-model:page-size="pageSizeAllTicketsAssignedToMe" :page-sizes="[15, 30, 50, 100]" layout="pager"
          :total="allTicketsNumAllTicketsAssignedToMe" @size-change="handleSizeChangeAllTicketsAssignedToMe"
          @current-change="handleCurrentChangeAllTicketsAssignedToMe" />
      </div>
    </el-col>
    <el-col :span="8">
      <el-table :data="AllTicketsCreatedByMe" style="width: 100%" class="getAllTicketCreatedByMe-container"
        @row-click="clickTicketRow" stripe>
        <el-table-column prop="title" label="主题" />
        <!-- <el-table-column prop="ownerId" label="创建者">
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
            </el-table-column> -->
        <el-table-column prop="assigneeId" label="审批人">
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
        <el-table-column label="状态" prop="state" sortable>
          <template #default="scope">
            <el-tag effect="danger" round v-if="scope.row.state == 1">已结束</el-tag>
            <el-tag effect="success" round v-else-if="scope.row.state == 2">已驳回</el-tag>
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
      </el-table>
      <div style="margin-top: 10px">
        <el-pagination v-model:current-page="currentPageAllTicketsCreatedByMe"
          v-model:page-size="pageSizeAllTicketsCreatedByMe" :page-sizes="[15, 30, 50, 100]" layout="pager"
          :total="allTicketsNumAllTicketsCreatedByMe" @size-change="handleSizeChangeAllTicketsCreatedByMe"
          @current-change="handleCurrentChangeAllTicketsCreatedByMe" />
      </div>
    </el-col>
    <el-col :span="8">
      <el-table :data="AllTicketsIWatching" style="width: 100%" class="getAllTicketIWatching-container"
        @row-click="clickTicketRow" stripe>
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
        <el-table-column prop="assigneeId" label="审批人">
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
        <el-table-column label="状态" prop="state" sortable>
          <template #default="scope">
            <el-tag effect="danger" round v-if="scope.row.state == 1">已结束</el-tag>
            <el-tag effect="success" round v-else-if="scope.row.state == 2">已驳回</el-tag>
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
      </el-table>
      <div style="margin-top: 10px">
        <el-pagination v-model:current-page="currentPageAllTicketsIWatching"
          v-model:page-size="pageSizeAllTicketsIWatching" :page-sizes="[15, 30, 50, 100]" layout="pager"
          :total="allTicketsNumAllTicketsIWatching" @size-change="handleSizeChangeAllTicketsIWatching"
          @current-change="handleCurrentChangeAllTicketsIWatching" />
      </div>
    </el-col>
  </el-row>
</template>



<style scoped>
:global(h2#card-usage ~ .example .example-showcase) {
  background-color: var(--el-fill-color) !important;
}

.el-statistic {
  --el-statistic-content-font-size: 28px;
}

.statistic-card {
  height: 100%;
  padding: 20px;
  border-radius: 4px;
  background-color: var(--el-bg-color-overlay);
}

.statistic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 16px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistic-footer .footer-item span:last-child {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.green {
  color: var(--el-color-success);
}

.red {
  color: var(--el-color-error);
}

.container {
  display: flex;
  flex-wrap: wrap;
}

.table-row {
  display: flex;
  flex: 1 1 75%;
  /* 占用75%的宽度 */
  justify-content: space-between;
}

.table-column {
  display: flex;
  flex-direction: column;
  flex: 1 1 25%;
  /* 占用剩下的25%宽度 */
}

el-table {
  margin: 10px;
}
</style>