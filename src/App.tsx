import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LoginPage } from "@/routes/LoginPage"
import { TodayPage } from "@/routes/TodayPage"
import { CustomersPage } from "@/routes/CustomersPage"
import { SettingsPage } from "@/routes/SettingsPage"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<TodayPage />} />
          <Route path="/today" element={<Navigate to="/" replace />} />
          <Route path="/reports/:reportId" element={<TodayPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
