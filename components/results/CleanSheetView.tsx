
import React from 'react';
import { CleanSheetProbs } from '../../types';
import { formatPercentage, formatDecimalOdds } from '../../utils/formatters';

interface CleanSheetViewProps {
  data: CleanSheetProbs;
  displayAsPercentage: boolean;
}

const CleanSheetItem: React.FC<{ team: string; yesProb: number; noProb: number; displayAsPercentage: boolean }> = ({ team, yesProb, noProb, displayAsPercentage }) => {
  const formatValue = (prob: number) => displayAsPercentage ? formatPercentage(prob) : formatDecimalOdds(prob);
  return (
    <div className="bg-gray-750 bg-opacity-50 p-4 rounded-lg shadow border border-gray-700">
      <h4 className="text-md font-semibold text-purple-300 mb-2">{team} Kalesini Gole Kapatır mı?</h4>
      <div className="flex justify-around">
        <div className="text-center">
          <span className="text-sm text-green-400 block">Evet</span>
          <span className="text-lg font-bold text-gray-100">{formatValue(yesProb)}</span>
        </div>
        <div className="text-center">
          <span className="text-sm text-red-400 block">Hayır</span>
          <span className="text-lg font-bold text-gray-100">{formatValue(noProb)}</span>
        </div>
      </div>
    </div>
  );
}


export const CleanSheetView: React.FC<CleanSheetViewProps> = ({ data, displayAsPercentage }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center text-purple-300 mb-4">Kalesini Gole Kapatma Olasılıkları</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CleanSheetItem 
            team="Ev Sahibi Takım" 
            yesProb={data.homeCleanSheetProb} 
            noProb={1 - data.homeCleanSheetProb}
            displayAsPercentage={displayAsPercentage} 
        />
        <CleanSheetItem 
            team="Deplasman Takımı" 
            yesProb={data.awayCleanSheetProb}
            noProb={1 - data.awayCleanSheetProb} 
            displayAsPercentage={displayAsPercentage}
        />
      </div>
    </div>
  );
};
