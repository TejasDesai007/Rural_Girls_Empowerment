import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CareerPage from "@/pages/CareerPage";
import AddJob from "@/pages/AddJob";
import ApplyJob from "@/pages/ApplyJob";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<CareerPage />} />
      <Route path="/add-job" element={<AddJob />} />
      <Route path="/apply/:jobId" element={<ApplyJob />} />
    </Routes>
  </Router>
);

export default AppRoutes;
