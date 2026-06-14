import React, { useState, useEffect } from 'react';
import Parse from 'parse/dist/parse.min.js';
import PricingDashboard from './dashboard';
import AuthModal from './AuthModal';

// Securely reference environment variables for Vercel & local protection
const PARSE_APPLICATION_ID = import.meta.env.VITE_PARSE_APPLICATION_ID; 
const PARSE_HOST_URL = "https://parseapi.back4app.com/";
const PARSE_JAVASCRIPT_KEY = import.meta.env.VITE_PARSE_JAVASCRIPT_KEY;

// Initialize connection using environmental abstraction layers
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if a valid user session is already saved in local storage on boot
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const user = Parse.User.current();
        if (user) {
          // Optional: Verify session is still valid with Back4App
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        Parse.User.logOut(); // Clear bad stale session tokens
      } finally {
        setIsInitializing(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLoginSuccess = () => {
    setCurrentUser(Parse.User.current());
  };

  const handleLogout = async () => {
    try {
      await Parse.User.logOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setCurrentUser(null);
    }
  };

  // Prevent UI flickering while checking local storage on refresh
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 tracking-wider font-medium uppercase">Securing Core Pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!currentUser ? (
        <AuthModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <PricingDashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}