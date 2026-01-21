import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./components/Home";
import { ScheduleCalendar } from "./components/ScheduleCalendar";
import { Instructors } from "./components/Instructors";
import { Fichas } from "./components/Fichas";
import { Programs } from "./components/Programs";
import { Competencies } from "./components/Competencies";
import { Environments } from "./components/Environments";
import { Results } from "./components/Results";
import { Users } from "./components/Users";
import { Footer } from "./components/Footer";
import { Horarios } from "./components/Horarios";

function AppContent() {
  const [activeView, setActiveView] = useState("home");
  const [navigationData, setNavigationData] = useState<any>(null);
  const { isAuthenticated } = useAuth();

  const handleNavigation = (view: string, data?: any) => {
    setActiveView(view);
    setNavigationData(data);
  };

  const renderView = () => {
    switch (activeView) {
      case "home":
        return <Home onNavigate={handleNavigation} />;
      case "calendar":
      case "horarios":
        return <Horarios navigationData={navigationData} />;
      case "instructors":
        return <Instructors onNavigate={handleNavigation} />;
      case "fichas":
        return <Fichas onNavigate={handleNavigation} />;
      case "programs":
        return <Programs />;
      case "competencies":
        return <Competencies />;
      case "environments":
        return <Environments />;
      case "results":
        return <Results />;
      case "users":
        return <Users />;
      default:
        return <Home onNavigate={handleNavigation} />;
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-auto">
          {renderView()}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}