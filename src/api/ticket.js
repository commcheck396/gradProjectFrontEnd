import request from '@/utils/request'

export const getCategoryTicketsService= async (categoryId) => {
    try {
        const responseData = await request.get(`/ticket/getTicketByGroup?groupId=${categoryId}`);
        return responseData.data;
        if (responseData.data === undefined) {
            return responseData;
        } else {
            return responseData;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getStatusByTicketId = async (ticketId) => {
    try {
        const responseData = await request.get(`/ticket/getStatusById?ticketId=${ticketId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getTicketById = async (ticketId) => {
    try {
        const responseData = await request.get(`/ticket/getTicketById?ticketId=${ticketId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}