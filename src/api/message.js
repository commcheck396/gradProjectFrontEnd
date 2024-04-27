import request from '@/utils/request'
import {useTokenStore} from '@/stores/token.js'

export const getAllRequestForCurrentUser = async () => {
    let result = await request.get('/request/getAllRequestForCurrentUser')
    return result.data
}

export const getAllRequestByCurrentUser = async () => {
    let result = await request.get('/request/getAllRequestByCurrentUser')
    return result.data
}

export const approveRequest = async (requestId) => {
    let result = await request.post(`/request/approveRequest?messageId=${requestId}`)
    return result.code
}

export const rejectRequest = async (requestId, msg) => {
    let result = await request.post(`/request/rejectRequest?messageId=${requestId}&reason=${msg}`)
    return result.code
}

export const createJoinGroupRequest = async(groupId) => {
    let result = await request.post(`/request/joinGroupRequest?groupId=${groupId}`)
    return result.code;
}

export const createGroupAdminRequest = async(groupId) => {
    let result = await request.post(`/request/groupAdminRequest?groupId=${groupId}`)
    return result.code;
}

export const createTicketReminder = async (ticketId) => {
    let result = await request.post(`/request/remindTicketAssignee?ticketId=${ticketId}`)
    return result.code
}

export const approveTicketRequest = async (ticketId) => {
    let result = await request.post(`/request/approveTicketRequest?ticketId=${ticketId}`)
    return result.code
}

export const rejectTicketRequest = async (ticketId, msg) => {
    let result = await request.post(`/request/rejectTicketRequest?ticketId=${ticketId}&msg=${msg}`)
    return result.code
}

export const getAllRequestOfCurrentUser = async () => {
    let result = await request.get('/request/getAllRequestOfCurrentUser')
    return result.data
}