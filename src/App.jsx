import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }  from "./contexts/AuthContext";
import ProtectedRoute    from "./components/shared/ProtectedRoute";
import TrainerDashboard  from "./components/portal/TrainerDashboard";
import AddClient         from "./components/clients/AddClient";
import Messaging         from "./components/messaging/Messaging";
import OnboardingFlow    from "./components/onboarding/OnboardingFlow";
import NutritionLog      from "./components/nutrition/NutritionLog";
import ProgressPhotos    from "./components/photos/ProgressPhotos";
import Calendar          from "./components/calendar/Calendar";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"           element={<Navigate to="/trainer/dashboard" replace />} />
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/calendar"   element={<Calendar />} />

          {/* Trainer portal — manages its own Supabase auth session internally */}
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />

          {/* Trainer standalone pages — protected via AuthContext */}
          <Route path="/trainer/clients"
            element={<ProtectedRoute role="trainer"><AddClient /></ProtectedRoute>} />
          <Route path="/trainer/messages"
            element={<ProtectedRoute role="trainer"><Messaging role="trainer" /></ProtectedRoute>} />

          {/* Client pages — protected via AuthContext */}
          <Route path="/client/nutrition"
            element={<ProtectedRoute role="client"><NutritionLog /></ProtectedRoute>} />
          <Route path="/client/photos"
            element={<ProtectedRoute role="client"><ProgressPhotos /></ProtectedRoute>} />
          <Route path="/client/messages"
            element={<ProtectedRoute role="client"><Messaging role="client" /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
