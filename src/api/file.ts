import instance from "./axiosInstance"


export const upload= () =>{
    return instance.post('/file/upload')
}

