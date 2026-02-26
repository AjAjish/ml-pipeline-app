import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Package, Zap, Camera, Badge, Gauge, Zap as Lightning, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModelButtonProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  specs?: {
    speed: string;
    accuracy: string;
    size: string;
  };
  useCases?: string[];
  recommended?: boolean;
  onClick: () => void;
}

const ModelButton = ({ name, description, icon, specs, useCases, recommended, onClick }: ModelButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -6 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "relative w-full p-6 rounded-xl transition-all text-left overflow-hidden group",
      "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900",
      "border border-gray-200 dark:border-gray-700",
      "hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl dark:hover:shadow-blue-500/20",
      "shadow-md",
      recommended && "ring-2 ring-offset-2 ring-yellow-400 dark:ring-offset-gray-900 border-yellow-300 dark:border-yellow-500",
      recommended && "before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-yellow-300 before:via-orange-400 before:to-red-500 before:rounded-t-xl"
    )}
  >
    {/* Animated background glow on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300" />
    
    {recommended && (
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="absolute -top-2 -right-2 z-50"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="relative"
        >
          <motion.div 
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 rounded-full blur-lg opacity-70" 
          />
          <span className="relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 text-gray-900 text-sm font-black shadow-2xl border-2 border-white/60 whitespace-nowrap">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>
              <Badge className="h-5 w-5 fill-current flex-shrink-0" />
            </motion.div>
            <span>RECOMMENDED</span>
          </span>
        </motion.div>
      </motion.div>
    )}

    <div className="relative z-10">
      {/* Icon and Title */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-3 rounded-lg transition-all",
          recommended 
            ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg" 
            : "bg-gradient-to-br from-blue-400 to-purple-500"
        )}>
          <div className="text-white">{icon}</div>
        </div>
        {!recommended && (
          <span className="px-2 py-1 rounded text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
            Popular
          </span>
        )}
      </div>

      {/* Model Name */}
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{name}</h3>
      
      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{description}</p>

      {/* Specs Grid */}
      {specs && (
        <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Lightning className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Speed</span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{specs.speed}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gauge className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Accuracy</span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{specs.accuracy}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Cpu className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Size</span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{specs.size}</p>
          </div>
        </div>
      )}

      {/* Use Cases */}
      {useCases && (
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Best for:</p>
          <div className="flex flex-wrap gap-2">
            {useCases.map((useCase, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
          Select Model → <span className="text-lg">→</span>
        </p>
      </motion.div>
    </div>
  </motion.button>
);

interface FeatureBoxProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const FeatureBox = ({ title, icon, children }: FeatureBoxProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="glass-card backdrop-blur-md p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50"
  >
    <div className="flex items-center gap-3 mb-8">
      <motion.div 
        whileHover={{ rotate: 12, scale: 1.1 }}
        className="p-3 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg"
      >
        <div className="text-white">{icon}</div>
      </motion.div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
        {title}
      </h2>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

export default function DeepLearning() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    // Trigger visible feedback - in a real app, this would navigate to training
    setTimeout(() => setSelectedModel(null), 500);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Deep Learning Models (In Development)
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Select from pre-trained deep learning models or build your own custom solution with google colab integration. Perfect for image classification, object detection, and more.
            <br />
            <br />
            You can see all setup guiides on the google colab nootbook linked in the below model seletion optoons on our application. We are currently working on adding more models and features, so stay tuned for updates! 
          </p>
        </motion.div>

        {/* Image Classification */}
        <div className="mb-12">
          <FeatureBox
            title="Image Classification"
            icon={<Camera className="h-6 w-6" />}
          >
            <div className="grid md:grid-cols-3 gap-4">
              <ModelButton
                name="Custom Model"
                description="Train your own image classification model from scratch using your dataset with full control"
                icon={<Package className="h-6 w-6" />}
                specs={{
                  speed: "Variable",
                  accuracy: "Custom",
                  size: "Flexible"
                }}
                useCases={["Full Control", "Custom Data", "Unique Tasks"]}
                onClick={() => window.open('https://colab.research.google.com/drive/13yWToqQbXK2TnCiYnf4DqFvyXkbpPFvs?usp=sharing', '_blank')}
              />
              <ModelButton
                name="MobileNet v2"
                description="Lightweight, fast model optimized for mobile and edge devices with excellent balance"
                icon={<Zap className="h-6 w-6" />}
                specs={{
                  speed: "Very Fast",
                  accuracy: "93-95%",
                  size: "14 MB"
                }}
                useCases={["Mobile Apps", "Edge Devices", "Real-time"]}
                recommended
                onClick={() => window.open('https://colab.research.google.com/drive/1EaPDrcXV_VuWbWjl5tUiCF-MScNa_0cf?usp=sharing', '_blank')}
              />
              <ModelButton
                name="EfficientNet"
                description="High-efficiency model balancing accuracy and computational resources for production use"
                icon={<Brain className="h-6 w-6" />}
                specs={{
                  speed: "Fast",
                  accuracy: "96-98%",
                  size: "32 MB"
                }}
                useCases={["Production", "Accuracy Critical", "Balanced"]}
                onClick={() => window.open('https://colab.research.google.com/drive/1znlh6xGwNsuYeNVhejrhjNl9D_UHBTRv?usp=sharing', '_blank')}
              />
            </div>
          </FeatureBox>
        </div>

        {/* Object Detection */}
        <div className="mb-12">
          <FeatureBox
            title="Object Detection"
            icon={<Camera className="h-6 w-6" />}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-dashed border-gray-300 dark:border-gray-600 text-center"
            >
              <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Object Detection models coming soon
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                We're preparing YOLO, Faster R-CNN, and RetinaNet models for release
              </p>
            </motion.div>
          </FeatureBox>
        </div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mt-12"
        >
          <div className="glass-card p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>✓ Pre-trained models ready to use</li>
              <li>✓ Transfer learning support</li>
              <li>✓ Model explainability tools</li>
              <li>✓ Performance metrics</li>
            </ul>
          </div>
          <div className="glass-card p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Getting Started</h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>1. Select a model category</li>
              <li>2. Upload your dataset</li>
              <li>3. Configure training parameters</li>
              <li>4. Deploy and monitor results</li>
            </ol>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
