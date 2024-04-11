import { defineStore } from "pinia";
import {ref} from 'vue'


const useUserInfoStore = defineStore('userInfo', () => {
    const info = ref({});
    const setInfo = (data) => {
        info.value = data;
    }
    const removeInfo = () => {
        info.value = {};
    }
    return {
        info,
        setInfo,
        removeInfo
    }
},
{
    persist: true
})


export default useUserInfoStore;