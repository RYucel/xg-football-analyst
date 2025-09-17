
import React from 'react';
import { TabProps } from '../../types';

export const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  const baseClasses = "whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 rounded-t-md";
  const activeClasses = "border-purple-500 text-purple-400";
  const inactiveClasses = "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      role="tab"
      aria-selected={isActive}
    >
      {label}
    </button>
  );
};
