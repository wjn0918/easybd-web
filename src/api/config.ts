// import type { ConfigModel } from '@/types/config'
import type { ConfigModel } from '@/types/config';
import instance from './axiosInstance'




export const getAllConfigs = () => {
  return instance.get('/config/select');
};
export const getAllConfigsByType = (confType: string) => {
  return instance.get(`/config/select/${confType}`);
};
export const saveConfig = (conf: ConfigModel) => {
  return instance.post('/config/create', conf);
};

export const deleteConfig = (id: string) => {
  return instance.delete(`/config/${id}`);
};

export const updateConfig = (conf: ConfigModel) => {
  return instance.post(`/config/update/${conf.id}`, conf);
};