import { createRouter, createWebHistory } from 'vue-router'

import LoginVue from '@/views/login.vue'
import Main from '@/views/main.vue'
import Welcome from '@/views/welcome.vue'
import AllGroups from '@/views/group/AllGroups.vue'
import GroupsIAdmin from '@/views/group/GroupsIAdmin.vue'
import GroupsIJoined from '@/views/group/GroupsIJoined.vue'
import GroupsIOwn from '@/views/group/GroupsIOwn.vue'
import TicketAssignedToMe from '@/views/ticket/TicketAssignedToMe.vue'
import TicketICreated from '@/views/ticket/TicketICreated.vue'
import TicketIWatch from '@/views/ticket/TicketIWatch.vue'
import AllTicketAssignedToMe from '@/views/ticket/AllTicketAssignedToMe.vue'
import AllTicketInGroup from '@/views/ticket/AllTicketInGroup.vue'
import AllTicket from '@/views/ticket/AllTicket.vue'
import AllUserInGroup from '@/views/user/AllUserInGroup.vue'
import TicketCategory from '@/views/ticket/TicketCategory.vue'
import TicketManage from '@/views/ticket/TicketManage.vue'
import UserAvatar from '@/views/user/UserAvatar.vue'
import UserInfo from '@/views/user/UserInfo.vue'
import UserResetPassword from '@/views/user/UserResetPassword.vue'
import GroupAdminApproval from '@/views/manage/GroupAdminApproval.vue'
import GroupMemberApproval from '@/views/manage/GroupMemberApproval.vue'
import RootAdminApproval from '@/views/manage/RootAdminApproval.vue'
import TicketTransferApproval from '@/views/manage/TicketTransferApproval.vue'
import GroupTransferApproval from '@/views/manage/GroupTransferApproval.vue'
import Dashboard from '@/views/Dashboard.vue'
import AddGroup from '@/views/manage/AddGroup.vue'

const routes = [
    { path: '/login', component: LoginVue },
    {
        path: '/main', component: Main, redirect:"/dashboard", children: [
            { path: '/ticket/category', component: TicketCategory },
            { path: '/ticket/manage', component: TicketManage },
            { path: '/user/info', component: UserInfo },
            { path: '/user/avatar', component: UserAvatar },
            { path: '/user/resetPassword', component: UserResetPassword },
            { path: '/group/all', component: AllGroups },
            { path: '/group/iadmin', component: GroupsIAdmin },
            { path: '/group/iown', component: GroupsIOwn },
            { path: '/group/ijoined', component: GroupsIJoined },
            { path: '/ticket/assignedtome', component: TicketAssignedToMe },
            { path: '/ticket/icreated', component: TicketICreated },
            { path: '/ticket/iwatch', component: TicketIWatch },
            { path: '/ticket/all/assignedtome', component: AllTicketAssignedToMe },
            { path: '/ticket/all/ingroup', component: AllTicketInGroup },
            { path: '/user/all/ingroup', component: AllUserInGroup },
            { path: '/ticket/all', component: AllTicket },
            { path: '/manage/groupadminapproval', component: GroupAdminApproval },
            { path: '/manage/groupmemberapproval', component: GroupMemberApproval },
            { path: '/manage/rootadminapproval', component: RootAdminApproval },
            { path: '/manage/tickettransferapproval', component: TicketTransferApproval },
            { path: '/manage/grouptransferapproval', component: GroupTransferApproval },
            { path: '/dashboard', component: Dashboard },
            { path: '/manage/addgroup', component: AddGroup },
        ]
    },
    { path: '/welcome', component: Welcome },
    { path: '/', redirect: '/welcome' },
    
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

export default router