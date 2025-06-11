import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ExcelUploader from "../components/cs";
import DndKitTestPage from "@/components/cs2"
import ExcelConverter from "@/components/excel"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/excel-to-json" element={<ExcelUploader />} />
      <Route path="/cs2" element={<DndKitTestPage />} />
      <Route path="/excel-converter" element={<ExcelConverter />} />
    </Routes>
  );
}
