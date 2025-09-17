
import React from 'react';
import { FullTimeResultProbs } from '../../types';
import { formatPercentage, formatDecimalOdds } from '../../utils/formatters';

interface FullTimeResultViewProps {
  data: FullTimeResultProbs;
  displayAsPercentage: boolean;
}

const ResultCard: React.FC<{ title: string; value: string; colorClass: string; probability: number }> = ({ title, value, colorClass, probability }) => (
  <div className={`p-4 rounded-lg shadow-lg flex flex-col items-center justify-center text-center ${colorClass} bg-opacity-20 border ${colorClass} border-opacity-40`}>
    <span className="text-sm font-medium text-gray-300">{title}</span>
    <span className="text-2xl font-bold text-white mt-1">{value}</span>
    {probability < 0.0001 && probability > 0 && <span className="text-xs text-gray-400 mt-1">(Çok Düşük Olasılık)</span>}
  </div>
);

export const FullTimeResultView: React.FC<FullTimeResultViewProps> = ({ data, displayAsPercentage }) => {
  const formatValue = (prob: number) => displayAsPercentage ? formatPercentage(prob) : formatDecimalOdds(prob);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center text-purple-300 mb-4">Maç Sonucu</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ResultCard 
            title="Ev Sahibi Kazanır" 
            value={formatValue(data.homeWinProb)} 
            colorClass="border-green-500 text-green-400"
            probability={data.homeWinProb}
        />
        <ResultCard 
            title="Beraberlik" 
            value={formatValue(data.drawProb)} 
            colorClass="border-yellow-500 text-yellow-400"
            probability={data.drawProb}
        />
        <ResultCard 
            title="Deplasman Kazanır" 
            value={formatValue(data.awayWinProb)} 
            colorClass="border-red-500 text-red-400"
            probability={data.awayWinProb}
        />
      </div>
    </div>
  );
};
