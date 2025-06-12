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