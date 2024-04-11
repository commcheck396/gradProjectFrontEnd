import request from '@/utils/request'
import {useTokenStore} from '@/stores/token.js'
export const getAllGroups = () => {
    // const tokenStore = useTokenStore()
    // return request.get('/category/all', {headers: {Authorization: tokenStore.token}})
    return request.get('/category/all')
}

export const addGroup = (data) => {
    return request.post('/category', data)
}

export const updateCategoryService = (categoryData) => {
    return request.put('/category', categoryData);
}

export const deleteCategoryService = (categoryId) => {
    return request.delete(`/category?id=${categoryId}`);
}

export const getCategoryMembersService = async (categoryId) => {
    try {
        const responseData = await request.get(`/category/listUsers?groupId=${categoryId}`);
        if (responseData.data === undefined) {
            return responseData;
        } else {
            var memberNames = responseData.data.map(item => item.username);
            return memberNames;
            // return responseData;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getCategoryMembersIdService = async (categoryId) => {
    try {
        const responseData = await request.get(`/category/listUsersId?groupId=${categoryId}`);
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

export const getCategoryMembersInfoService = async (categoryId) => {
    try {
        const responseData = await request.get(`/category/listUsers?groupId=${categoryId}`);
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