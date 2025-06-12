import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ExcelUploader from "../components/cs";
import ExcelConverter from "@/components/excel"
import DatabaseTool from "../components/databaseTools";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cs" element={<ExcelUploader />} />
      <Route path="/database-converter" element={<DatabaseTool />} />
      <Route path="/excel-converter" element={<ExcelConverter />} />
    </Routes>
  );
}
