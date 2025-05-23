import React, { useState, useEffect, createContext } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import Results from "./pages/Results";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Settings from "./pages/Settings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { ScanProvider } from "./contexts/ScanContext";

// Create a query client
const queryClient = new QueryClient();

// Define user type
type User = {
  name: string;
  email: string;
  avatar?: string;
};

// Define auth context type
type AuthContextType = {
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  user: User | null;
  updateUser?: (userData: Partial<User>) => void;
};

// Create auth context with default values
export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  user: null
});

// App component
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Check login status on mount
  useEffect(() => {
    const loginState = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('user');
    
    if (loginState === 'true' && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
    
    // Mark auth as initialized
    setIsInitialized(true);
  }, []);

  // Login function that will be used across the app
  const login = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    // Dispatch an event so other components can react
    window.dispatchEvent(new Event('storage'));
  };

  // Logout function
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    // Dispatch an event so other components can react
    window.dispatchEvent(new Event('storage'));
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Dispatch an event so other components can react
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Don't render routes until auth state is initialized
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isLoggedIn, login, logout, user, updateUser }}>
        <ScanProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={
                  isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace state={{ from: '/dashboard' }} />
                } />
                <Route path="/scan" element={
                  isLoggedIn ? <Scan /> : <Navigate to="/login" replace state={{ from: '/scan' }} />
                } />
                <Route path="/results" element={
                  isLoggedIn ? <Results /> : <Navigate to="/login" replace state={{ from: '/results' }} />
                } />
                <Route path="/notifications" element={
                  isLoggedIn ? <Notifications /> : <Navigate to="/login" replace state={{ from: '/notifications' }} />
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/settings" element={
                  isLoggedIn ? <Settings /> : <Navigate to="/login" replace state={{ from: '/settings' }} />
                } />
                <Route path="/about" element={<About />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ScanProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
