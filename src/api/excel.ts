import axios from 'axios'
import type { SheetInfo } from '../types/sheet'
import type { ExcelInfo, JsonInfo } from '@/types/excel'
import type { TableInfo } from '@/types/table'

const instance = axios.create(
    {
        baseURL: "/api/excel",
        timeout: 10000,
    }
)

export const getSheetInfo = () => {
    return instance.get<SheetInfo>('/sheetInfo')
}

export const getSheetTables = (excelInfo: ExcelInfo) => {
    return instance.post<TableInfo>('/tables', excelInfo)
}

export const getColInfo = (excelInfo: ExcelInfo) => {
    return instance.post<SheetInfo>('/cols', excelInfo)
}


export const parseExcelFile = (filePath: string) => {
    return instance.post<SheetInfo>('/parse', {
        filePath
    })
}

export const excelConvert = (excelInfo: ExcelInfo, outputType: string) => {
    return instance.post('/convert', excelInfo, {
      params: {
        output_type: outputType,
      },
    });
  };


  export const convert2Excel = (jsonInfo: JsonInfo) => {
    return instance.post('/convert2excel', jsonInfo,{
        responseType: 'blob'
      });
  };
