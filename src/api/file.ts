import axios from 'axios'

const instance = axios.create(
    {
        baseURL: "/api/file",
        timeout:10000,
    }
)

export const upload= () =>{
    return instance.post('/upload')
}

