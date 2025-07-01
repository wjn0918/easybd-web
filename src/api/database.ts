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

  export async function syncToTargetDb(payload: {
    source: {  },
    target: {  }
  }) {
    return instance.post('/database/sync2target', payload)
    // 逻辑：
    // 1. 从源数据库导出数据
    // 2. 在目标数据库建表（如必要）
    // 3. 插入数据
  }