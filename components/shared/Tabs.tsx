
import React from 'react';
import { TabsProps } from '../../types';

export const Tabs: React.FC<TabsProps> = ({ children }) => {
  return (
    <div className="border-b border-gray-700">
      <nav className="-mb-px flex space-x-2 sm:space-x-4 overflow-x-auto pb-1" aria-label="Tabs">
        {children}
      </nav>
    </div>
  );
};
