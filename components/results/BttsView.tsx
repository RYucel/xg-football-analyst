
import React from 'react';
import { BttsProbs } from '../../types';
import { formatPercentage, formatDecimalOdds } from '../../utils/formatters';

interface BttsViewProps {
  data: BttsProbs;
  displayAsPercentage: boolean;
}

export const BttsView: React.FC<BttsViewProps> = ({ data, displayAsPercentage }) => {
  const formatValue = (prob: number) => displayAsPercentage ? formatPercentage(prob) : formatDecimalOdds(prob);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center text-purple-300 mb-4">Karşılıklı Gol Var/Yok (KG Var/Yok)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-750 bg-opacity-50 p-6 rounded-lg shadow text-center border border-green-700">
          <h4 className="text-lg font-medium text-green-400 mb-1">KG Var - Evet</h4>
          <p className="text-2xl font-bold text-gray-100">{formatValue(data.yesProb)}</p>
        </div>
        <div className="bg-gray-750 bg-opacity-50 p-6 rounded-lg shadow text-center border border-red-700">
          <h4 className="text-lg font-medium text-red-400 mb-1">KG Yok - Hayır</h4>
          <p className="text-2xl font-bold text-gray-100">{formatValue(data.noProb)}</p>
        </div>
      </div>
    </div>
  );
};
