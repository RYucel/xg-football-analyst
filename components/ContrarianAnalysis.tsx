import React, { useMemo } from 'react';
import { TeamStat } from '../types';
import { ContrarianService, ContrarianAnalysisResult } from '../services/contrarianService';

interface ContrarianAnalysisProps {
  homeTeam: TeamStat | undefined;
  awayTeam: TeamStat | undefined;
}

const contrarianService = new ContrarianService();

const RatingCard: React.FC<{ title: string; value: number; }> = ({ title, value }) => {
    const colorClass = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-yellow-400';
    return (
        <div className="bg-gray-700 bg-opacity-40 p-4 rounded-lg shadow-lg text-center">
            <h4 className="text-sm font-medium text-gray-300 mb-1">{title}</h4>
            <p className={`text-2xl font-bold ${colorClass}`}>{value.toFixed(2)}</p>
        </div>
    );
};

const SignalDisplay: React.FC<{ result: ContrarianAnalysisResult }> = ({ result }) => {
    const bgColor = result.signalStrength === 'strong' ? 'bg-green-800 bg-opacity-70 border-green-600'
                    : result.signalStrength === 'weak' ? 'bg-yellow-800 bg-opacity-50 border-yellow-600'
                    : 'bg-gray-700 bg-opacity-40 border-gray-600';

    return (
         <div className={`mt-6 p-4 rounded-lg shadow-inner text-center border ${bgColor}`}>
            <h4 className="text-lg font-semibold text-purple-300">Sistem Sinyali</h4>
            <p className="text-md text-gray-100 mt-1">{result.signal}</p>
        </div>
    );
};


export const ContrarianAnalysis: React.FC<ContrarianAnalysisProps> = ({ homeTeam, awayTeam }) => {
  const analysisResult = useMemo(() => {
    if (homeTeam && awayTeam) {
      return contrarianService.getAnalysis(homeTeam, awayTeam);
    }
    return null;
  }, [homeTeam, awayTeam]);

  if (!analysisResult) {
    return <div className="text-center p-4 text-gray-500">Aykırı bahis analizi için lütfen her iki takımı da seçin.</div>;
  }

  return (
    <div className="mt-4 p-6 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-xl">
      <h3 className="text-xl font-semibold text-center text-purple-300 mb-2">Aykırı Bahis Stratejisi Analizi</h3>
      <p className="text-xs text-gray-400 text-center mb-4">
        Bu analiz, 'Sıcak El Yanılgısı'na karşı bahis yaparak piyasa önyargılarından faydalanmayı hedefler.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RatingCard title={`${homeTeam?.name} Form Reytingi`} value={analysisResult.homeTeamRating} />
        <RatingCard title="Maç Reytingi" value={analysisResult.matchRating} />
        <RatingCard title={`${awayTeam?.name} Form Reytingi`} value={analysisResult.awayTeamRating} />
      </div>

      <SignalDisplay result={analysisResult} />

    </div>
  );
};