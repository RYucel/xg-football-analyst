
import React, { useMemo } from 'react';
import { CorrectScoreProbs } from '../../types';
import { formatPercentage, formatDecimalOdds } from '../../utils/formatters';

interface CorrectScoreMatrixViewProps {
  data: CorrectScoreProbs[][]; // Expects a 5x5 matrix (0-4 goals for home/away)
  displayAsPercentage: boolean;
}

export const CorrectScoreMatrixView: React.FC<CorrectScoreMatrixViewProps> = ({ data, displayAsPercentage }) => {
  const formatValue = (prob: number) => displayAsPercentage ? formatPercentage(prob) : formatDecimalOdds(prob);

  const highestProbScore = useMemo(() => {
    let maxProb = -1;
    let score = { home: -1, away: -1 };
    data.forEach((row, homeGoals) => {
      row.forEach((cell, awayGoals) => {
        if (cell.prob > maxProb) {
          maxProb = cell.prob;
          score = { home: homeGoals, away: awayGoals };
        }
      });
    });
    return score;
  }, [data]);

  const getCellBgColor = (prob: number, isHighest: boolean): string => {
    if (isHighest) return 'bg-purple-600 bg-opacity-70';
    if (prob > 0.1) return 'bg-green-600 bg-opacity-40';
    if (prob > 0.05) return 'bg-yellow-600 bg-opacity-40';
    if (prob > 0.01) return 'bg-orange-600 bg-opacity-40';
    return 'bg-gray-750 bg-opacity-50';
  };
  
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-400">Kesin skor verisi mevcut değil.</p>;
  }

  const numHomeScores = data.length; 
  const numAwayScores = data[0] ? data[0].length : 0; 

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center text-purple-300 mb-6">Kesin Skor Tahminleri</h3>
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-700">
        <table className="min-w-full w-full table-fixed">
          <caption className="text-sm text-gray-400 p-2 bg-gray-750 bg-opacity-30">
            Ev Sahibi Golleri (Satırlar) vs Deplasman Golleri (Sütunlar)
          </caption>
          <thead className="bg-gray-750 bg-opacity-70">
            <tr>
              <th className="p-2 sm:p-3 w-12 sm:w-16 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">EV \ DEP</th>
              {Array.from({ length: numAwayScores }).map((_, awayIdx) => (
                <th key={`away-header-${awayIdx}`} className="p-2 sm:p-3 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                  {awayIdx}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {Array.from({ length: numHomeScores }).map((_, homeIdx) => (
              <tr key={`home-row-${homeIdx}`} className="divide-x divide-gray-700 hover:bg-gray-700 transition-colors">
                <td className="p-2 sm:p-3 text-center font-medium text-purple-300 bg-gray-750 bg-opacity-70">{homeIdx}</td>
                {Array.from({ length: numAwayScores }).map((_, awayIdx) => {
                  const scoreData = data[homeIdx]?.[awayIdx];
                  if (!scoreData) return <td key={`cell-${homeIdx}-${awayIdx}`} className="p-2 sm:p-3 text-center text-xs text-gray-400">-</td>;
                  
                  const isHighest = homeIdx === highestProbScore.home && awayIdx === highestProbScore.away;
                  const cellBg = getCellBgColor(scoreData.prob, isHighest);
                  
                  return (
                    <td 
                      key={`cell-${homeIdx}-${awayIdx}`} 
                      className={`p-2 sm:p-3 text-center text-xs sm:text-sm transition-all duration-150 ${cellBg} ${isHighest ? 'ring-2 ring-purple-400' : ''}`}
                      title={`Olasılık: ${formatPercentage(scoreData.prob)}, Oran: ${formatDecimalOdds(scoreData.prob)}`}
                    >
                      <span className={`font-semibold ${isHighest ? 'text-white' : 'text-gray-200'}`}>
                        {formatValue(scoreData.prob)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {highestProbScore.home !== -1 && (
         <p className="text-center text-sm text-gray-300 mt-4">
            En yüksek olasılıklı skor: 
            <span className="font-bold text-purple-400"> {highestProbScore.home} - {highestProbScore.away} </span>
            ({formatValue(data[highestProbScore.home][highestProbScore.away].prob)})
        </p>
      )}
    </div>
  );
};
