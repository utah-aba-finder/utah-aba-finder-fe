import React, { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../Provider-login/AuthProvider";
import Dashboard from "./components/Dashboard";
import EditLocation from "./components/EditLocation";
import CreateLocation from "./components/CreateLocation";
import { AuthModal } from "./AuthModal";
import {
  Building2,
  PlusCircle,
  LogOut,
  Menu,
  X,
  BarChart,
} from "lucide-react";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { MockProviderData, ProviderAttributes } from "../Utility/Types";

interface ProviderEditProps {
  loggedInProvider: MockProviderData;
  clearProviderData: () => void;
  onUpdate: (updatedProvider: ProviderAttributes) => void;
}

const ProviderEdit: React.FC<ProviderEditProps> = ({
  loggedInProvider,
  clearProviderData,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [authModalOpen, setAuthModalOpen] = useState(true);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);
  const [currentProvider, setCurrentProvider] =
    useState<MockProviderData>(loggedInProvider);
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    setCurrentProvider(loggedInProvider);
  }, [loggedInProvider]);

  const refreshProviderData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://uta-aba-finder-be-97eec9f967d0.herokuapp.com/api/v1/providers/${loggedInProvider.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh provider data");
      }

      const refreshedData = await response.json();
      if (refreshedData.data?.[0]) {
        setCurrentProvider(refreshedData.data[0]);
        onUpdate(refreshedData.data[0].attributes);
      }
    } catch (error) {
      console.error("Error refreshing provider data:", error);
      toast.error("Failed to refresh provider data");
    } finally {
      setIsLoading(false);
    }
  }, [loggedInProvider.id, onUpdate]);

  const handleLogout = useCallback(() => {
    toast.dismiss("session-warning");
    toast.info("Logging out...", {
      toastId: "logging-out",
      position: "top-center",
      autoClose: 2000,
    });

    setTimeout(() => {
      logout();
      clearProviderData();
    }, 2000);
  }, [logout, clearProviderData]);

  useEffect(() => {
    const hideAuthModal = localStorage.getItem("hideAuthModal");
    if (hideAuthModal === "true") {
      setAuthModalOpen(false);
    }
  }, []);

  useEffect(() => {
    const tokenExpiry = sessionStorage.getItem("tokenExpiry");
    if (tokenExpiry) {
      const updateSessionTime = () => {
        const timeLeft = Math.max(
          0,
          Math.floor((parseInt(tokenExpiry) - Date.now()) / 1000)
        );
        setSessionTimeLeft(timeLeft);

        if (timeLeft <= 300 && timeLeft > 0) {
          toast.warn(
            `Your session will expire in ${timeLeft} seconds. Please save your work.`,
            {
              toastId: "session-warning",
              position: "top-center",
              autoClose: false,
            }
          );
        } else if (timeLeft === 0) {
          toast.error("Your session has expired. Please log in again.", {
            toastId: "session-expired",
            position: "top-center",
            autoClose: false,
          });
          handleLogout();
        }
      };

      const timer = setInterval(updateSessionTime, 1000);
      return () => clearInterval(timer);
    }
  }, [handleLogout]);

  const handleProviderUpdate = useCallback(
    async (updatedAttributes: ProviderAttributes) => {
      setCurrentProvider((prev) => ({
        ...prev,
        attributes: updatedAttributes,
      }));

      await refreshProviderData();

      toast.success("Provider information updated successfully!");
    },
    [refreshProviderData]
  );

  const handleShownModal = (hideModal: boolean) => {
    setAuthModalOpen(false);
    if (hideModal) {
      localStorage.setItem("hideAuthModal", "true");
    }
  };

  if (!currentProvider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No provider data available</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderSessionWarning = () => {
    if (sessionTimeLeft && sessionTimeLeft <= 300) {
      return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-yellow-700">
            Session expires in: {Math.floor(sessionTimeLeft / 60)}:
            {(sessionTimeLeft % 60).toString().padStart(2, "0")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <ToastContainer />
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          handleShownModal={handleShownModal}
        />
      )}

      {renderSessionWarning()}

      <div className="h-screen bg-gray-100 flex flex-col">
        <div className="flex min-h-screen overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`
              bg-white shadow-lg w-52 flex flex-col
              fixed md:static h-[calc(100vh-2rem)] my-4 rounded-lg mx-4
              transform transition-transform duration-300 ease-in-out
              ${isOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0 z-40
            `}
          >
            {/* Dashboard Header */}
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-[#4A6FA5] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ASL</span>
                  </div>
                  <span className="text-lg font-semibold">Provider Panel</span>
                </div>
                <button className="md:hidden" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-2">
              <ul className="space-y-1 px-2">
                <li>
                  <button
                    onClick={() => setSelectedTab("dashboard")}
                    className={`
                      w-full flex items-center hover:cursor-pointer space-x-3 px-3 py-2 rounded-lg
                      transition-colors duration-200
                      ${
                        selectedTab === "dashboard"
                          ? "bg-[#4A6FA5] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <BarChart className="w-4 h-4" />
                    <span className="text-sm">Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("edit")}
                    className={`
                      w-full flex items-center hover:cursor-pointer space-x-3 px-3 py-2 rounded-lg
                      transition-colors duration-200
                      ${
                        selectedTab === "edit"
                          ? "bg-[#4A6FA5] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Edit Details</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSelectedTab("create")}
                    className={`
                      w-full flex items-center hover:cursor-pointer space-x-3 px-3 py-2 rounded-lg
                      transition-colors duration-200
                      ${
                        selectedTab === "create"
                          ? "bg-[#4A6FA5] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="text-sm">Create Location</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-3 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-gray-700 hover:cursor-pointer hover:text-gray-900 w-full px-3 py-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Content Container */}
          <div className="flex-1 flex flex-col min-w-0 h-screen">
            {/* Floating Header */}
            <header className="sticky top-0 z-30 px-2">
              <div className="bg-white shadow-lg rounded-lg mx-2 mt-4 mb-2">
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <button
                        className="md:hidden p-1.5 hover:bg-gray-100 hover:cursor-pointerrounded-lg hover:cursor-pointer"
                        onClick={() => setIsOpen(true)}
                      >
                        <Menu className="w-5 h-5" />
                      </button>
                      <h1 className="text-lg font-semibold">
                        {selectedTab === "dashboard" && "Provider Dashboard"}
                        {selectedTab === "edit" && "Edit Location"}
                        {selectedTab === "create" && "Create New Location"}
                        {selectedTab === "billing" && "Billing Management"}
                      </h1>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {currentProvider.attributes.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Last updated:{" "}
                        {moment(currentProvider.attributes.updated_last).format(
                          "MM/DD/YYYY"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {selectedTab === "dashboard" && (
                <Dashboard provider={currentProvider} />
              )}
              {selectedTab === "edit" && (
                <EditLocation
                  provider={currentProvider}
                  onUpdate={handleProviderUpdate}
                />
              )}
              {selectedTab === "create" && (
                <CreateLocation
                  provider={currentProvider}
                  onLocationCreated={handleProviderUpdate}
                  setSelectedTab={setSelectedTab}
                />
              )}
              {selectedTab === "billing" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Billing Management
                    </h2>
                    <p className="text-gray-600">
                      Billing features coming soon...
                    </p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderEdit;
