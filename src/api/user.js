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