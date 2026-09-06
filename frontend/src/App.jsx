import React, { useState, useEffect } from "react";

import Navbar from "./components/layout/Navbar";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboardPage from "./pages/CustomerDashboardPage";
import DashboardPage from "./pages/DashboardPage";
import BeekeepersPage from "./pages/BeekeepersPage";
import HivesPage from "./pages/HivesPage";
import IoTPage from "./pages/IoTPage";
import AIHealthPage from "./pages/AIHealthPage";
import ProductivityPage from "./pages/ProductivityPage";
import HoneyQualityPage from "./pages/HoneyQualityPage";
import HoneyTraceabilityPage from "./pages/HoneyTraceabilityPage";
import QRVerificationPage from "./pages/QRVerificationPage";

import Footer from "./components/layout/Footer";

import { api } from "./services/api";

export default function App() {

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        return JSON.parse(savedUser);
      }

      return null;
    } catch (error) {
      return null;
    }
  });

  const [authPage, setAuthPage] = useState("login");

  // ============================================================
  // APPLICATION STATE
  // ============================================================

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBeekeeperId, setSelectedBeekeeperId] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // ============================================================
  // QR VERIFICATION
  // ============================================================

  const verificationToken = window.location.pathname.startsWith("/verify/")
    ? window.location.pathname.split("/verify/")[1]
    : null;

  // ============================================================
  // HEALTH CHECK
  // ============================================================

  useEffect(() => {

    if (!currentUser) {
      return;
    }

    const checkHealth = async () => {

      try {

        const data = await api.getHealth();

        setHealthStatus(data);

      } catch (error) {

        setHealthStatus({
          status: "offline",
          database: "disconnected",
        });

      }

    };

    checkHealth();

    const interval = setInterval(checkHealth, 10000);

    return () => clearInterval(interval);

  }, [currentUser]);

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = (user) => {

    setCurrentUser(user);
    setActiveTab("overview");
    setAuthPage("login");

  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {

    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user");

    setCurrentUser(null);
    setAuthPage("login");
    setActiveTab("overview");

  };

  // ============================================================
  // REGISTRATION COMPLETE
  // ============================================================

  const handleRegistered = () => {

    setAuthPage("login");

  };

  // ============================================================
  // NAVIGATION TO HIVES
  // ============================================================

  const handleNavigateToHives = (beekeeperId) => {

    setSelectedBeekeeperId(beekeeperId);
    setActiveTab("hives");

  };

  // ============================================================
  // QR VERIFICATION
  // ============================================================

  /*
   * QR verification remains publicly accessible.
   *
   * Customers can scan a honey QR code without logging in.
   */

  if (verificationToken) {

    return (
      <QRVerificationPage
        token={verificationToken}
      />
    );

  }

  // ============================================================
  // AUTHENTICATION SCREENS
  // ============================================================

  if (!currentUser) {

    if (authPage === "register") {

      return (
        <RegisterPage
          onRegistered={handleRegistered}
          onGoToLogin={() => setAuthPage("login")}
        />
      );

    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onGoToRegister={() => setAuthPage("register")}
      />
    );

  }

  // ============================================================
  // MAIN APPLICATION
  // ============================================================

  return (
    <div className="min-h-screen bg-[#f7f1df] text-slate-900">

      {/* LEFT SIDEBAR */}

      <Navbar
        healthStatus={healthStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* MAIN APPLICATION AREA */}

      <div className="ml-0 lg:ml-[270px] min-h-screen flex flex-col">

        <main className="flex-grow">

          {/* DASHBOARD */}

          {activeTab === "overview" &&
  (currentUser?.role === "customer" ? (
    <CustomerDashboardPage
      setActiveTab={setActiveTab}
    />
  ) : (
    <DashboardPage />
  ))}

          {/* BEEKEEPERS */}

          {activeTab === "beekeepers" && (
            <BeekeepersPage
              onNavigateToHives={handleNavigateToHives}
            />
          )}

          {/* HIVES */}

          {activeTab === "hives" && (
            <HivesPage
              initialBeekeeperId={selectedBeekeeperId}
            />
          )}

          {/* IOT */}

          {activeTab === "iot" && (
            <IoTPage />
          )}

          {/* AI HEALTH */}

          {activeTab === "ai-health" && (
            <AIHealthPage />
          )}

          {/* AI PRODUCTIVITY */}

          {activeTab === "productivity" && (
            <ProductivityPage />
          )}

          {/* HONEY QUALITY */}

          {activeTab === "honey-quality" && (
            <HoneyQualityPage />
          )}

          {/* TRACEABILITY */}

          {activeTab === "traceability" && (
            <HoneyTraceabilityPage />
          )}

        </main>

        {/* FOOTER */}

        <Footer />

      </div>

    </div>
  );
}