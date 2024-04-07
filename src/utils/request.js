import axios from 'axios';
const baseURL = '/api';
// const baseURL = 'http://localhost:8080';
const instance = axios.create({baseURL})
import { ElMessage } from 'element-plus'
import { useTokenStore } from '@/stores/token';
import { useRouter } from 'vue-router';
const router = useRouter();
// import router from '@/router';

instance.interceptors.request.use(
    (config)=>{
        const tokenStore = useTokenStore();
        if(tokenStore.token){
            config.headers.Authorization = tokenStore.token;
        }
        return config;
    },
    (err)=>{
        return Promise.reject(err);
    }
)


instance.interceptors.response.use(
    result=>{
        if(result.data.code === 0){
            return result.data;
        }
        else{
            ElMessage.error(result.data.message?result.data.message:'未知错误');
            return Promise.reject(result.data);
        }
    },
    err=>{
        if(err.response.status === 401){
            // redirect to login page without using router
            // window.location.href = '/login';
            // ElMessage.error('pls login first');

            // ElMessage.error('pls login first');
            // setTimeout(() => {
            //     window.location.href = '/login';
            // }, 3000); 

            window.location.href = `/login?message=${encodeURIComponent('pls login first')}`;

        }
        else{
            ElMessage.error(result.data.message?result.data.message:'未知错误');
        }
        ElMessage.error(result.data.message?result.data.message:'未知错误');
        return Promise.reject(err);
    }
)

export default instance;