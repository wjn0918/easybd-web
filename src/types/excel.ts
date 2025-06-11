export interface TransformStep {
    action: "filter" | "assign" | "rename" | "dropna";
    expr: string | object;
  }
  
  export interface ExcelInfo {
    filePath: string;
    sheetName: string;
    transformSteps: TransformStep[];
    colMetadata: Array<{
        col: string;
        prefix: string;
        suffix: string;
      }>;
  }