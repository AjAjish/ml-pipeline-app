import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft, Search } from 'lucide-react';
import { cn } from '../lib/utils';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Animated 404 */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center justify-center space-x-2 mb-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <h1 className="text-9xl font-bold gradient-text">404</h1>
              </div>
              <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
          </div>

          {/* Search Suggestions */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Quick Navigation</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Home', description: 'Upload datasets', icon: Home, path: '/' },
                { label: 'Dashboard', description: 'Configure training', icon: Home, path: '/dashboard' },
                { label: 'Sample Datasets', description: 'Try with sample data', icon: Home, path: '/' },
                { label: 'Documentation', description: 'Learn how to use', icon: Home, path: '#' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="group p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all text-left"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {item.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className={cn(
                "group flex items-center justify-center space-x-2 px-6 py-3",
                "border-2 border-gray-300 dark:border-gray-700 rounded-xl",
                "font-semibold hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20",
                "transition-all"
              )}
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={() => navigate('/')}
              className={cn(
                "group flex items-center justify-center space-x-2 px-6 py-3",
                "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl",
                "font-semibold hover:shadow-2xl hover:shadow-blue-500/30",
                "transition-all"
              )}
            >
              <Home className="h-5 w-5" />
              <span>Return to Home</span>
            </button>
          </div>

          {/* Error Details (for debugging) */}
          {import.meta.env.DEV && (
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <details className="text-left">
                <summary className="cursor-pointer font-medium">Debug Information</summary>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>Current URL: {window.location.href}</p>
                  <p>Pathname: {window.location.pathname}</p>
                  <p>Search: {window.location.search}</p>
                  <p>Hash: {window.location.hash}</p>
                </div>
              </details>
            </div>
          )}
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-8 opacity-10">
          <div className="h-32 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl" />
        </div>
        <div className="absolute top-8 right-8 opacity-10">
          <div className="h-40 w-40 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;