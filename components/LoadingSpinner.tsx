import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "AI is thinking..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-500 font-medium animate-pulse">{message}</p>
    </div>
  );
};
