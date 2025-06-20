import type { ConnectionResponse, DBConfig, ExportTableStructureParams } from '@/types/database'
import instance from './axiosInstance';


export const testConnect = (config: DBConfig) => {
    return instance.post<ConnectionResponse>('/database/test-connection', config)
}

export const exportTableStructure = (params: ExportTableStructureParams) => {
    return instance.post('/database/export-table-structure', params,{
        responseType: 'blob'
      });
  };

  export const convertToSQLite = async (params: ExportTableStructureParams) => {
    return instance.post('/database/convert-to-sqlite', params, {
      responseType: 'blob',
    });
  };