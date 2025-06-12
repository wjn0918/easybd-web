export interface DBConfig {
    dbType: 'pgsql' | 'mysql';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }
  
  export interface ConnectionResponse {
    success: boolean;
    tables: string[];
    message?: string;
  }

  export interface ExportTableStructureParams {
    dbType: 'pgsql' | 'mysql';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    tables: string[];
  }