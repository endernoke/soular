import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Calculator from './components/Calculator';
import Social from './components/Social';
import ChatBot from './components/ChatBot';
import Profile from './components/Profile';

function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-200 dark:bg-darkbg flex flex-col">
        <div className="bg-white dark:bg-darkbg flex flex-row items-center p-4 pb-2 sticky z-50 top-0 left-0 right-0">
          <h1 className="text-3xl font-bold text-center">🌱 Soular</h1> {/* add Logo later */}
          <div className="flex right-5 absolute">
            <button onClick={() => setActiveTab("profile")} className={`py-2 px-2`}>
              Profile {/* replace as profile image later */}
            </button>
          </div>
        </div>
        <div className="flex-1 md:overflow-y-auto">
          {activeTab === "home" && <Home />}
          {activeTab === "calculator" && <Calculator />}
          {activeTab === "social" && <Social />}
          {activeTab === "chat" && <ChatBot />}
          {activeTab === "profile" && <Profile />}
          {!currentUser && <Navigate to="/login" />}
        </div>
        <div className="bg-white dark:bg-darkcard shadow-md p-4 sticky z-50 bottom-0 left-0 right-0 flex justify-around">
          <button onClick={() => setActiveTab("home")} className={`py-2 px-2 ${activeTab === "home" ? "bg-primary text-white" : "text-gray-600 dark:text-gray-300"}`}>
            Home
          </button>
          <button onClick={() => setActiveTab("calculator")} className={`py-2 px-2 ${activeTab === "calculator" ? "bg-primary text-white" : "text-gray-600 dark:text-gray-300"}`}>
            Footprint
          </button>
          <button onClick={() => setActiveTab("social")} className={`py-2 px-2 ${activeTab === "social" ? "bg-primary text-white" : "text-gray-600 dark:text-gray-300"}`}>
            Social
          </button>
          <button onClick={() => setActiveTab("chat")} className={`py-2 px-2 ${activeTab === "chat" ? "bg-primary text-white" : "text-gray-600 dark:text-gray-300"}`}>
            EcoBot
          </button>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
