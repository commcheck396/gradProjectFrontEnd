<script lang="ts" setup>
import { ref } from 'vue'
const drawer = ref(false)
import { Plus } from '@element-plus/icons-vue'
import { CircleCloseFilled, CirclePlusFilled, RemoveFilled, DeleteFilled, InfoFilled, CaretBottom, CaretTop, Flag, WarningFilled, Search, AddLocation, SemiSelect, UploadFilled, SuccessFilled } from '@element-plus/icons-vue'
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

import { ElMessage } from 'element-plus';

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
        ElMessage.success("发布成功");
        clearTicket();
        getAllGroups();
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

</script>



<template>
    <el-button type="primary" style="margin-left: 16px"
        @click="drawer = true; console.log(ticketModel.value.priority);">
        open
    </el-button>

    <el-drawer v-model="drawer" title="新建表单" :with-header="true" size="90%" direction="btt">
        <!-- <div style="display: flex; justify-content: center;">
            <el-progress :percentage="percentage" :color="colors" style="width: 40%;"></el-progress>
        </div> -->
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


<style>
/* 抽屉样式 */
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