import type { SheetInfo } from '../types/sheet'
import type { ExcelInfo, JsonInfo } from '@/types/excel'
import type { TableInfo } from '@/types/table'

import instance from './axiosInstance'

export const getSheetInfo = () => {
    return instance.get<SheetInfo>('/excel/sheetInfo')
}

export const getSheetTables = (excelInfo: ExcelInfo) => {
    return instance.post<TableInfo>('/excel/tables', excelInfo)
}

export const getColInfo = (excelInfo: ExcelInfo) => {
    return instance.post<SheetInfo>('/excel/cols', excelInfo)
}


export const parseExcelFile = (filePath: string) => {
    return instance.post<SheetInfo>('/excel/parse', {
        filePath
    })
}

export const excelConvert = (excelInfo: ExcelInfo, outputType: string) => {
    return instance.post('/excel/convert', excelInfo, {
      params: {
        output_type: outputType,
      },
    });
  };


  export const convert2Excel = (jsonInfo: JsonInfo) => {
    return instance.post('/excel/convert2excel', jsonInfo,{
        responseType: 'blob'
      });
  };
