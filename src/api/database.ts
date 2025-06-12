import type { ConnectionResponse, DBConfig, ExportTableStructureParams } from '@/types/database'
import axios from 'axios'

const instance = axios.create(
    {
        baseURL: "/api/database",
        timeout: 10000,
    }
)


export const testConnect = (config: DBConfig) => {
    return instance.post<ConnectionResponse>('/test-connection', config)
}

export const exportTableStructure = (params: ExportTableStructureParams) => {
    return instance.post('/export-table-structure', params,{
        responseType: 'blob'
      });
  };