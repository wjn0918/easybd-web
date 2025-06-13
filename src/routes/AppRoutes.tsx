import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ExcelUploader from "../components/cs";
import ExcelConverter from "@/components/excel"
import DatabaseTool from "../components/databaseTools";

import ConfigListPage from "@/pages/ConfigListPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cs" element={<ExcelUploader />} />
      <Route path="/database-converter" element={<DatabaseTool />} />
      <Route path="/excel-converter" element={<ExcelConverter />} />
      <Route path="/tools/config" element={<ConfigListPage />} />
    </Routes>
  );
}
