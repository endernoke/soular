// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Calculator from './components/Calculator';
import Social from './components/Social';
import ChatBot from './components/ChatBot';
import Profile from './components/Profile';

function App() {
  const { currentUser } = useAuth();
  
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-200 dark:bg-gray-800">
        {currentUser && <Navbar />}
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                currentUser ? <Home /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/login" 
              element={
                !currentUser ? <Login /> : <Navigate to="/" />
              } 
            />
            <Route 
              path="/signup" 
              element={
                !currentUser ? <Signup /> : <Navigate to="/" />
              } 
            />
            <Route 
              path="/calculator" 
              element={
                currentUser ? <Calculator /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/social" 
              element={
                currentUser ? <Social /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/chat" 
              element={
                currentUser ? <ChatBot /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                currentUser ? <Profile /> : <Navigate to="/login" />
              } 
            />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
