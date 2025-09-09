
import React from 'react';

interface LoadingScreenProps {
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-semibold text-white">Generating Leads...</h2>
      <p className="text-gray-400 mt-2 transition-all duration-500">{message}</p>
    </div>
  );
};
