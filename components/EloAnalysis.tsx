import React from 'react';
import { TeamStat, FullTimeResultProbs } from '../types';
import { formatPercentage, formatDecimalOdds } from '../utils/formatters';

interface EloAnalysisProps {
  homeTeam: TeamStat | undefined;
  awayTeam: TeamStat | undefined;
  eloResults: FullTimeResultProbs | null;
  displayAsPercentage: boolean;
}

const ResultCard: React.FC<{ title: string; value: string; colorClass: string }> = ({ title, value, colorClass }) => (
  <div className={`p-4 rounded-lg shadow-lg flex flex-col items-center justify-center text-center bg-gray-700 bg-opacity-40 border ${colorClass} border-opacity-50`}>
    <span className="text-sm font-medium text-gray-300">{title}</span>
    <span className="text-2xl font-bold text-white mt-1">{value}</span>
  </div>
);


export const EloAnalysis: React.FC<EloAnalysisProps> = ({ homeTeam, awayTeam, eloResults, displayAsPercentage }) => {
  if (!homeTeam || !awayTeam || !eloResults) {
    return null;
  }
  
  const formatValue = (prob: number) => displayAsPercentage ? formatPercentage(prob) : formatDecimalOdds(prob);

  return (
    <div className="mt-8 p-6 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
      <h3 className="text-xl font-semibold text-center text-purple-300 mb-2">Elo Derecelendirme Analizi</h3>
      <p className="text-xs text-gray-400 text-center mb-4">
        Takımların göreceli gücüne dayalı olasılıklar.
      </p>
      
      <div className="flex justify-around items-center mb-6 text-center">
        <div>
          <p className="text-sm text-gray-400">{homeTeam.name}</p>
          <p className="text-2xl font-bold text-purple-300">{homeTeam.elo || 'N/A'}</p>
        </div>
        <p className="text-lg text-gray-500">vs</p>
        <div>
          <p className="text-sm text-gray-400">{awayTeam.name}</p>
          <p className="text-2xl font-bold text-purple-300">{awayTeam.elo || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ResultCard 
            title="Ev Sahibi Kazanır" 
            value={formatValue(eloResults.homeWinProb)} 
            colorClass="border-green-500"
        />
        <ResultCard 
            title="Beraberlik" 
            value={formatValue(eloResults.drawProb)} 
            colorClass="border-yellow-500"
        />
        <ResultCard 
            title="Deplasman Kazanır" 
            value={formatValue(eloResults.awayWinProb)} 
            colorClass="border-red-500"
        />
      </div>
       <p className="text-xs text-gray-500 text-center mt-4">
        Ev sahibi avantajı (+65 Elo) hesaplamalara dahil edilmiştir.
      </p>
    </div>
  );
};
