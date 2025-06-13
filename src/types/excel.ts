import type { DBType, SQLType } from "./sql";

export interface TransformStep {
  id: string;
  action: "filter" | "assign" | "rename" | "dropna";
  expr: string | object;
}

export interface ExcelInfo {
  filePath: string;
  sheetName: string| null;
  tableName: string | null;
  dataXConf: { readerType: string; writerType: string };
  sqlConf: {sqlType: SQLType; dbType: DBType} | null;
  transformSteps: TransformStep[];
  colMetadata: Array<{
    col: string;
    prefix: string;
    suffix: string;
  }>;
}

export interface JsonInfo {
  jsonData: string
} 