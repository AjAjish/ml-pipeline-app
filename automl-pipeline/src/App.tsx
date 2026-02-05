// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/theme-provider';
import { ApiProvider } from './contexts/ApiContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import DataSet from './pages/DataSet';
import Results from './pages/Results';
import Documentation from './pages/Documentation';
import Algorithm from './pages/Algorithm';
import NotFound from './pages/NotFound';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="automl-theme">
      <ApiProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
              <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
              <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
            </div>
            
            <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px]" />
            
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="dataset" element={<DataSet />} />
                <Route path="results/:sessionId" element={<Results />} />
                <Route path="docs" element={<Documentation />} />
                <Route path="algorithms" element={<Algorithm />} />
                <Route path="404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'glass-card',
                duration: 4000,
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
            
            <ThemeToggle />
          </div>
        </Router>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;
