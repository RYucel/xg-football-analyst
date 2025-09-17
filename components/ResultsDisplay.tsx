
import React, { useState } from 'react';
import { CalculationResults, ActiveTab } from '../types';
import { Tabs } from './shared/Tabs';
import { Tab } from './shared/Tab';
import { FullTimeResultView } from './results/FullTimeResultView';
import { OverUnderView } from './results/OverUnderView';
import { CleanSheetView } from './results/CleanSheetView';
import { BttsView } from './results/BttsView';
import { CorrectScoreMatrixView } from './results/CorrectScoreMatrixView';

interface ResultsDisplayProps {
  results: CalculationResults;
  displayAsPercentage: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, displayAsPercentage }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.FULL_TIME);

  return (
    <div className="mt-8 p-6 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-center mb-6 text-purple-300">Maç Tahminleri</h2>
      <Tabs>
        {Object.values(ActiveTab).map((tabLabel) => (
          <Tab
            key={tabLabel}
            label={tabLabel}
            isActive={activeTab === tabLabel}
            onClick={() => setActiveTab(tabLabel)}
          />
        ))}
      </Tabs>
      <div className="mt-6">
        {activeTab === ActiveTab.FULL_TIME && (
          <FullTimeResultView data={results.fullTimeResult} displayAsPercentage={displayAsPercentage} />
        )}
        {activeTab === ActiveTab.OVER_UNDER && (
          <OverUnderView data={results.overUnder} displayAsPercentage={displayAsPercentage} />
        )}
        {activeTab === ActiveTab.CORRECT_SCORE && (
          <CorrectScoreMatrixView data={results.correctScores} displayAsPercentage={displayAsPercentage} />
        )}
        {activeTab === ActiveTab.BTTS && (
          <BttsView data={results.btts} displayAsPercentage={displayAsPercentage} />
        )}
        {activeTab === ActiveTab.CLEAN_SHEET && (
          <CleanSheetView data={results.cleanSheet} displayAsPercentage={displayAsPercentage} />
        )}
      </div>
    </div>
  );
};
