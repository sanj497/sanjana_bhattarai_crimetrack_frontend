import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import CrimeReportingHome from "../Pages/Home";
import ReportCrime from "../Pages/CrimeReport/report.jsx";

import Dashboard from "./Components/Dashboard/dashboard.jsx";
import AdminReport from "./Components/Dashboard/adminreport.jsx";
import AdminRoute from "./Components/AdminRoute.jsx";
import PoliceDashboard from "./Components/Policedashboard/Policereport.jsx";
import NewBoard from "../Pages/police/Dashui.jsx";
import Policereport from "./Components/Policedashboard/Policereport.jsx";
import Notifications from "../Pages/notification/notification.jsx";
import CitizenDashboard from "../Pages/Citizendashboard/citizen.jsx";
import SendFeedback from "../Pages/Feedback/SendFeedback.jsx";
import AdminFeedback from "../Pages/Feedback/admingetfeed.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<CrimeReportingHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/report" element={<ReportCrime />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bar" element={<NewBoard />} />
        <Route path="/notifications" element={<Notifications />} />
                < Route path="/citizen" element={<CitizenDashboard />} />
                <Route path="/feedback" element={<SendFeedback />} />




        < Route path="/complain" element={<Policereport />} />



        {/* Admin-only route */}
        <Route
          path="/adReport"
          element={
            <AdminRoute>
              <AdminReport />
            </AdminRoute>
          }
        />
        <Route path="/admin/feedback" element={<AdminFeedback />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
