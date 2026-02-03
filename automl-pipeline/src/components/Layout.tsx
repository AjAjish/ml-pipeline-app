import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Upload, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Home,
  Database,
  Cpu,
  Download,
  HelpCircle,
  Bell,
  User,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dataset', href: '/dataset', icon: Database },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleResultsNavigation = () => {
    const sessionId = localStorage.getItem('automl_session_id');
    const fileId = localStorage.getItem('automl_file_id');

    if (sessionId) {
      // User has trained a model, go to results
      navigate(`/results/${sessionId}`);
    } else if (fileId) {
      // User has uploaded dataset but not trained, go to dashboard
      toast.info('Please train your model first');
      navigate('/dashboard');
    } else {
      // No data uploaded, go to home
      toast.info('Please upload a dataset first');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Animated Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="glass-effect border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <button
                  type="button"
                  className="lg:hidden -ml-2 mr-2 p-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30" />
                    <Brain className="relative h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      AutoML Pro
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</p>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => cn(
                      "group relative px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2 inline-block" />
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                  </NavLink>
                ))}
                {/* Results Button */}
                <button
                  onClick={handleResultsNavigation}
                  className="group relative px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <TrendingUp className="h-4 w-4 mr-2 inline-block" />
                  Results
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </button>
              </nav>

              {/* Right side */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:block">
                  <HelpCircle className="h-5 w-5" />
                </button>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium hidden md:inline">Guest</span>
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
      >
        <div className="glass-effect h-full border-r p-4 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-500" />
              <h2 className="text-lg font-bold">AutoML Pro</h2>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="space-y-2 flex-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
            {/* Results Button in Mobile */}
            <button
              onClick={() => {
                handleResultsNavigation();
                setSidebarOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Results</span>
            </button>
          </nav>
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-effect border-t mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-bold">AutoML Pro</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Professional AutoML Platform © {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="/docs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Documentation</a>
              <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">API</a>
              <a href="https://github.com/AjAjish/ml-pipeline-app" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">GitHub</a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}