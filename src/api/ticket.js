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

export const addTicketService = async(ticketData) =>{
    return request.post('/ticket/addTicket', ticketData);
}

export const getTicketsInGroupService = async (groupId) => {
    try {
        const responseData = await request.get(`/ticket/getTicketByGroup?groupId=${groupId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const linkTicketsService = async (ticketId, ticketIds) => {
    return request.post(`/ticket/addLinks?ticketId=${ticketId}&ticketIds=${ticketIds}`);
}

export const addWatcherService = async (ticketId, userId) => {
    return request.post(`/ticket/addWatchers?ticketId=${ticketId}&userIds=${userId}`);
}

export const deleteAllLinksService = async (ticketId) => {
    return request.delete(`/ticket/removeAllLinks?ticketId=${ticketId}`);
}

export const deleteAllWatchersService = async (ticketId) => {
    return request.delete(`/ticket/removeAllWatchers?ticketId=${ticketId}`);
}

export const updateTicketService = async (ticketData) => {
    return request.post('/ticket/updateTicket', ticketData);
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

export const getLinkedTicketIdByTicketId = async (ticketId) => {
    try {
        const responseData = await request.get(`/ticket/getLinkedTicketIds?ticketId=${ticketId}`);
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

export const getAllTicketsService = async (pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export const getAllTicketByGroupsService = async (pageNum, pageSize, belongsTo) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&belongsTo=${belongsTo}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getTicketIdIWatchingService = async () =>{
    try {
        const responseData = await request.get(`/ticket/getTicketIdIWatching`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const watchTicketService = async (ticketId) => {
    return request.post(`/ticket/watchTicket?ticketId=${ticketId}`);
}
export const unwatchTicketService = async (ticketId) => {
    return request.post(`/ticket/unwatchTicket?ticketId=${ticketId}`);
}

export const approveTicketService = async (ticketId) => {
    return request.post(`/ticket/modifyState?ticketId=${ticketId}&state=2`)
}

export const rejectTicketService = async (ticketId) => {
    return request.post(`/ticket/modifyState?ticketId=${ticketId}&state=1`)
}

export const modifyAssigneeService = async (ticketId, userId) => {
    return request.post(`/ticket/modifyAssignee?ticketId=${ticketId}&assigneeId=${userId}`)
}

export const getAllTIcketsAssignedToMeService = async (userId, pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&assigneeId=${userId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export const getAllTicketsCreatedByMeService = async (userId, pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&ownerId=${userId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getAllTicketsIWatchingService = async (userId, pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&watcherId=${userId}`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export const getPassedTIcketsAssignedToMeService = async (userId, pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&assigneeId=${userId}&state=2`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getRejectedTIcketsAssignedToMeService = async (userId, pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&assigneeId=${userId}&state=1`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}


export const getPassedTicketsCreatedByMeService = async (userId, pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&ownerId=${userId}&state=2`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getRejectedTicketsCreatedByMeService = async (userId, pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&ownerId=${userId}&state=1`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const getPassedTicketsIWatchingService = async (userId, pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&watcherId=${userId}&state=2`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// export const getRejectedTicketsIWatchingService = async (userId, pageNum, pageSize) => {
//     try {
//         const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&watcherId=${userId}&state=1`);
//         return responseData.data;
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }

export const getRejectedTicketsIWatchingService = async (userId, pageNum, pageSize) => {
    try {
        const responseData = await request.get(`/ticket?pageNum=${pageNum}&pageSize=${pageSize}&watcherId=${userId}&state=1`);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const deleteTicketService = async (ticketId) => {
    let result = await request.delete(`/ticket/deleteTicket?ticketId=${ticketId}`)
    return result.code;
}

export const getTicketRoute = async (ticketId) => {
    let result = await request.get(`/ticket/getTicketRoute?ticketId=${ticketId}`)
    return result.data;
}


// export const getAllTicketTitle = async () => {
//     try {
//         const responseData = await request.get('/ticket/all');
//         if (responseData.data === undefined) {
//             return responseData;
//         } else {
//             var ticketNames = responseData.data.map(item => item.title);
//             return ticketNames;
//         }
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }
