import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { exportTableStructure, testConnect, convertToSQLite, syncToTargetDb } from '@/api/database';
import type { ConfigModel } from '@/types/config';
import { getAllConfigsByType } from '@/api/config';

type DbType = 'mysql' | 'pgsql';
type TargetDbType = 'clickhouse' | 'pgsql';

const getInitialConfig = () => {
  return {
    dbType: 'mysql' as DbType,
    config: {
      host: '',
      port: '',
      username: '',
      password: '',
      database: '',
    },
  };
};

const DatabaseTool = () => {
  const [connected, setConnected] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [regexFilter, setRegexFilter] = useState('');
  const [exporting, setExporting] = useState(false);
  const [converting, setConverting] = useState(false);

  const initial = getInitialConfig();
  const [dbType, setDbType] = useState<DbType>(initial.dbType);
  const [config, setConfig] = useState(initial.config);
  const [targetDbType, setTargetDbType] = useState<TargetDbType>('clickhouse');
  const [targetConfig, setTargetConfig] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    database: '',
  });
  const [syncing, setSyncing] = useState(false);

  const [configs, setConfigs] = useState<ConfigModel[]>([])
  const [selectedSourceConfigId, setSelectedSourceConfigId] = useState<string | null>(null)
  const [selectedTargetConfigId, setSelectedTargetConfigId] = useState<string | null>(null)


  // 加载配置项
  useEffect(() => {
    getAllConfigsByType("database")
      .then((res) => {
        setConfigs(res.data || [])
      })
      .catch(() => {
        setConfigs([])
      })
  }, [])

  useEffect(() => {
    getAllConfigsByType("database")
      .then((res) => {
        setConfigs(res.data || [])
      })
      .catch(() => {
        setConfigs([])
      })
  }, [config, dbType]);

  const handleTestConnection = async () => {
    setLoading(true);
    setConnected(false);
    setTables([]);

    try {
      const response = await testConnect({
        dbType,
        host: config.host,
        port: Number(config.port),
        username: config.username,
        password: config.password,
        database: config.database,
      });

      const data = response.data;

      if (data.success) {
        setConnected(true);
        setTables(data.tables);
        setSelectedTables([]); // ✅ 成功连接后清空已选表（更严谨）
      } else {
        alert('连接失败：' + data.message);
      }
    } catch (err: any) {
      console.error(err);
      alert('连接测试失败：' + (err?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTables = () => {
    if (!regexFilter.trim()) return tables;
    try {
      const regex = new RegExp(regexFilter, 'i');
      return tables.filter(table => regex.test(table));
    } catch {
      return tables; // 如果正则非法，显示全部
    }
  };

  return (
    <div className="flex max-w-6xl mx-auto mt-10 gap-6">
      <Card className="w-1/2 p-4 space-y-4">
        <CardContent className="space-y-4">
          <Select value={dbType} onValueChange={value => {
            setDbType(value as DbType);
            setSelectedTables([]); // ✅ 切换数据库类型时清空已选择的表
          }}>
            <SelectTrigger>
              <SelectValue placeholder="选择数据库类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pgsql">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={selectedSourceConfigId ?? ""}
              onChange={(e) => {
                const id = e.target.value
                setSelectedSourceConfigId(id)
                const selected = configs.find((c) => c.id === id)
                if (selected) {
                  const c = JSON.parse(selected.confContent)
                  setConfig({ ...config, ...c })
                  console.log(config)
                }
              }}
            >
              <option value="" disabled>
                请选择一个配置
              </option>
              {configs
                .filter(config => JSON.parse(config.confContent).dbtype === dbType)
                .map((config) => (
                  <option key={config.id} value={config.id}>
                    [{config.confType}] {config.confName}
                  </option>
                ))}
            </select>
          </div>

          <Button onClick={handleTestConnection} disabled={loading}>
            {loading ? '连接中...' : '连接数据库'}
          </Button>

          {connected && (
            <div>
              <h4 className="font-semibold mb-2">选择数据表</h4>

              <Input
                placeholder="输入正则表达式筛选表名（例如 ^user|order$）"
                value={regexFilter}
                onChange={(e) => setRegexFilter(e.target.value)}
                className="mb-2"
              />

              {/* 全选/取消全选 */}
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  checked={
                    getFilteredTables().length > 0 &&
                    getFilteredTables().every((table) => selectedTables.includes(table))
                  }
                  onCheckedChange={(checked) => {
                    const filtered = getFilteredTables();
                    if (checked) {
                      // 添加未包含的过滤项
                      const toAdd = filtered.filter((t) => !selectedTables.includes(t));
                      setSelectedTables((prev) => [...prev, ...toAdd]);
                    } else {
                      // 移除当前过滤项
                      setSelectedTables((prev) => prev.filter((t) => !filtered.includes(t)));
                    }
                  }}
                />
                <label>全选当前结果</label>
              </div>

              <div className="space-y-2 max-h-60 overflow-auto border rounded p-2">
                {getFilteredTables().map((table) => (
                  <div key={table} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedTables.includes(table)}
                      onCheckedChange={(checked) => {
                        setSelectedTables((prev) =>
                          checked ? [...prev, table] : prev.filter((t) => t !== table)
                        );
                      }}
                    />
                    <label>{table}</label>
                  </div>
                ))}
              </div>

              {/* 新增的导出按钮 */}
              {selectedTables.length > 0 && (
                <>
                  <Button
                    className="mt-4"
                    disabled={exporting}
                    onClick={async () => {
                      try {
                        setExporting(true);

                        const res = await exportTableStructure(
                          {
                            dbType,
                            host: config.host,
                            port: Number(config.port),
                            username: config.username,
                            password: config.password,
                            database: config.database,
                            tables: selectedTables,
                          }
                        );

                        const blob = new Blob([res.data], {
                          type: res.headers['content-type'] || 'application/octet-stream',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'converted.xlsx';
                        a.click();
                        URL.revokeObjectURL(url);

                        alert('导出成功，文件已下载');
                      } catch (error) {
                        alert('导出失败，请检查控制台');
                        console.error(error);
                      } finally {
                        setExporting(false);
                        setSelectedTables([]);
                      }
                    }}
                  >
                    {exporting ? `导出中` : '导出表结构'}
                  </Button>

                  <Button
                    className="mt-2"
                    disabled={converting}
                    variant="outline"
                    onClick={async () => {
                      try {
                        setConverting(true);

                        const res = await convertToSQLite({
                          dbType,
                          host: config.host,
                          port: Number(config.port),
                          username: config.username,
                          password: config.password,
                          database: config.database,
                          tables: selectedTables,
                        });

                        const blob = new Blob([res.data], {
                          type: res.headers['content-type'] || 'application/octet-stream',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'converted.sqlite';
                        a.click();
                        URL.revokeObjectURL(url);

                        alert('转换成功，SQLite 文件已下载');
                      } catch (error) {
                        console.error(error);
                        alert('转换失败，请查看控制台日志');
                      } finally {
                        setConverting(false);
                        setSelectedTables([]);
                      }
                    }}
                  >
                    {converting ? '转换中...' : '转为 SQLite'}
                  </Button>

                </>
              )}

            </div>
          )}

        </CardContent>
      </Card>
      <Card className="w-1/2 p-4 space-y-4">
        <CardContent>
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2">同步到其他数据库</h4>

            <Select value={targetDbType} onValueChange={value => setTargetDbType(value as TargetDbType)}>
              <SelectTrigger>
                <SelectValue placeholder="选择目标数据库" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clickhouse">ClickHouse</SelectItem>
                <SelectItem value="pgsql">PostgreSQL</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <select
                className="border rounded px-3 py-2 text-sm"
                value={selectedTargetConfigId ?? ""}
                onChange={(e) => {
                  const id = e.target.value
                  setSelectedTargetConfigId(id)
                  const selected = configs.find((c) => c.id === id)
                  if (selected) {
                    const c = JSON.parse(selected.confContent)
                    setTargetConfig({ ...targetConfig, ...c })
                  }
                }}
              >
                <option value="" disabled>
                  请选择一个配置
                </option>
                {configs
                  .filter(config => JSON.parse(config.confContent).dbtype === targetDbType)
                  .map((config) => (
                    <option key={config.id} value={config.id}>
                      [{config.confType}] {config.confName}
                    </option>
                  ))}
              </select>

            </div>

            <Button
              className="mt-4"
              disabled={syncing}
              variant="secondary"
              onClick={async () => {
                try {
                  setSyncing(true);
                  const res = await syncToTargetDb({
                    source: {
                      dbType,
                      host: config.host,
                      port: Number(config.port),
                      username: config.username,
                      password: config.password,
                      database: config.database,
                      tables: selectedTables,
                    },
                    target: {
                      dbType: targetDbType,
                      host: targetConfig.host,
                      port: Number(targetConfig.port),
                      username: targetConfig.username,
                      password: targetConfig.password,
                      database: targetConfig.database,
                    },
                  });

                  alert('同步完成：' + res.data.message);
                } catch (err: any) {
                  console.error(err);
                  alert('同步失败：' + (err?.message || '未知错误'));
                } finally {
                  setSyncing(false);
                }
              }}
            >
              {syncing ? '同步中...' : '同步到目标数据库'}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>

  );
};

export default DatabaseTool;
