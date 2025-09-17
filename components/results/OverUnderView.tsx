
import React from 'react';
import { OverUnderProbs } from '../../types';
import { formatPercentage, formatDecimalOdds } from '../../utils/formatters';

interface OverUnderViewProps {
  data: OverUnderProbs[];
  displayAsPercentage: boolean;
}

export const OverUnderView: React.FC<OverUnderViewProps> = ({ data, displayAsPercentage }) => {
  const formatValue = (prob: number) => displayAsPercentage ? formatPercentage(prob) : formatDecimalOdds(prob);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center text-purple-300 mb-6">Gol Alt/Üst</h3>
      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-750 bg-opacity-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                Eşik
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                Üst
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-purple-300 uppercase tracking-wider">
                Alt
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 bg-opacity-70 divide-y divide-gray-700">
            {data.map(({ threshold, overProb, underProb }) => (
              <tr key={threshold} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                  {threshold.toFixed(1)} Gol
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-400">
                  {formatValue(overProb)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-400">
                  {formatValue(underProb)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
