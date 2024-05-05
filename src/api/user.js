import request from '@/utils/request.js'
export const userRegisterService = (registerData)=>{
    const params = new URLSearchParams();
    for(let key in registerData){
        params.append(key, registerData[key]);
    }
    return request.post('/user/register', params)
}

export const userLoginService = (loginData)=>{
    const params = new URLSearchParams();
    for(let key in loginData){
        params.append(key, loginData[key]);
    }
    return request.post('/user/login', params)
}

export const getNameById = (id) => {
    return request.get(`/user/getNameById?userId=${id}`)
}

export const getAdminNamesByGroupId = async (groupId) => {
    // return await request.get(`/category/listGroupAdmins?groupId=${groupId}`);
    try {
        const responseData = await request.get(`/category/listGroupAdmins?groupId=${groupId}`);
        if (responseData.data === undefined) {
            return responseData;
        } else {
            var adminNames = responseData.data.map(item => item.username);
            return adminNames;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getAdminIdByGroupId = async (groupId) => {
    // return await request.get(`/category/listGroupAdmins?groupId=${groupId}`);
    try {
        const responseData = await request.get(`/category/listGroupAdminsId?groupId=${groupId}`);
        if (responseData.data === undefined) {
            return responseData;
        } else {
            return responseData.data;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}


export const getWatcherNamesByTicketId = async (ticketId) => {
    try {
        const responseData = await request.get(`/ticket/getWatchers?ticketId=${ticketId}`);
        if (responseData.data === undefined) {
            return responseData;
        } else {
            var watchers = responseData.data;
            for (let i = 0; i < watchers.length; i++) {
                watchers[i] = (await getNameById(watchers[i])).data;
            }
            return watchers;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const isUserInGroup = async (groupId) => {
    try {
        const responseData = await request.get(`/user/isUserInGroup?groupId=${groupId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export const isGroupEditable = async (groupId) => {
    try {
        const responseData = await request.get(`/user/canUserEditGroup?groupId=${groupId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const isGroupDeletable = async (groupId) => {
    try {
        const responseData = await request.get(`/user/canUserDeleteGroup?groupId=${groupId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const isGroupViewable = async (groupId) => {
    try {
        const responseData = await request.get(`/user/canUserViewGroup?groupId=${groupId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getAllNames = async () => {
    try {
        const responseData = await request.get(`/user/allUserNames`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getWatcherIdByTicketId = async (ticketId) => {
    try {
        const responseData = await request.get(`/ticket/getWatchersId?ticketId=${ticketId}`);
        if (responseData.data === undefined) {
            return responseData;
        } else {
            return responseData.data;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const inGroups = async () => {
    try {
        const responseData = await request.get(`/user/groupsIin`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const inGroupsInfo = async () => {
    try {
        const responseData = await request.get(`/user/groupsInfoIin`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const userInfoService = ()=>{
    return request.get('/user/userInfo')
}

export const updateUserInfoService = (data)=>{
    // const params = new URLSearchParams();
    // for(let key in data){
    //     params.append(key, data[key]);
    // }
    return request.put('/user/update', data)
}

export const checkUsernameService = (username)=>{
    return request.get(`/user/getUserByName?username=${username}`)
}

export const checkEmailService = (email)=>{
    return request.get(`/user/getUserByEmail?email=${email}`)
}

export const UserAvatarUpdateService = (data)=>{
    const params = new URLSearchParams();
    params.append('avatarUrl', data);
    return request.patch('/user/updateAvatar', params)
}

export const sendCodeService = (email) =>{
    return request.get(`/email/sendCode?addr=${email}`);
}

export const verifyCodeService = async (email, code) =>{
    let result = await request.get(`/email/verifyCode?addr=${email}&code=${code}`);
    return result.code;
}

export const forgetPasswordGetUserByNameService = async (name) =>{
    let result = await request.get(`/email/getUserByName?name=${name}`)
    return result
}

export const resetPasswordService = async (password, id) => {
    let result = await request.patch(`/email/resetPassword?password=${password}&id=${id}`);
    return result;
}

export const resetEmailService = async (email) => {
    let result = await request.post(`/user/updateUserEmail?email=${email}`)
    return result
}

export const isTicketEditable = async (ticketId) =>{
    let result = await request.get(`/user/canUserEditTicket?ticketId=${ticketId}`)
    return result.data
}

export const generateCloneCodeService = async() =>{
    let result = await request.get(`/user/generateUserCloneCode`)
    return result.data;
}

export const cloneUserService = async (cloneCode) =>{
    let result = await request.post(`/user/cloneUser?cloneCode=${cloneCode}`)
    return result
}