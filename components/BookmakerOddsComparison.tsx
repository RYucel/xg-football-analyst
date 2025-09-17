import React, { useState, useMemo } from 'react';
import { FullTimeResultProbs, TeamStat, LoggedBet } from '../types';
import { formatPercentage, formatDecimalOdds } from '../utils/formatters';

interface BookmakerOddsComparisonProps {
  appProbs: FullTimeResultProbs | null | undefined;
  displayAsPercentage: boolean;
  bankroll: string;
  setBankroll: (value: string) => void;
  onLogBet: (bet: Omit<LoggedBet, 'id' | 'date'>) => void;
  leagueName: string | undefined;
  homeTeam: TeamStat | undefined;
  awayTeam: TeamStat | undefined;
}

interface OddsInputState {
  home: string;
  draw: string;
  away: string;
}

interface KellyStake {
    full: number;
    half: number;
    quarter: number;
}
interface ComparisonDetails {
  appValue: string;
  bookmakerImpliedProb?: string;
  valueDiff?: number;
  valueColorClass: string;
  borderColorClass: string;
  message?: string;
  kellyStake?: KellyStake;
}

const calculateImpliedProbability = (decimalOdd: number | null): number | null => {
  if (decimalOdd && decimalOdd > 1) {
    return 1 / decimalOdd;
  }
  return null;
};

const calculateKellyStake = (appProb: number, bookmakerOdd: number): KellyStake | null => {
    if (appProb <= 0 || bookmakerOdd <= 1) return null;

    const bookieImpliedProb = 1 / bookmakerOdd;
    if (appProb <= bookieImpliedProb) return null;

    const p = appProb;
    const b = bookmakerOdd - 1;

    const fullKellyFraction = p - ((1 - p) / b);
    
    if (fullKellyFraction <= 0) return null;

    return {
        full: fullKellyFraction,
        half: fullKellyFraction / 2,
        quarter: fullKellyFraction / 4,
    };
};

const getComparisonDetails = (
  appProb: number,
  bookmakerOddStr: string,
  displayAsPercentage: boolean
): ComparisonDetails => {
  const appValue = displayAsPercentage ? formatPercentage(appProb) : formatDecimalOdds(appProb);
  const bookmakerOdd = parseFloat(bookmakerOddStr.replace(',', '.'));

  let bookmakerImpliedProbNum: number | null = null;
  let valueDiff: number | undefined = undefined;
  let bookmakerImpliedProb: string | undefined = undefined;
  let valueColorClass = 'text-gray-400';
  let borderColorClass = 'border-gray-600';
  let message: string | undefined = undefined;
  let kellyStake: KellyStake | undefined = undefined;


  if (!isNaN(bookmakerOdd) && bookmakerOdd > 1.0) {
    bookmakerImpliedProbNum = calculateImpliedProbability(bookmakerOdd);
    if (bookmakerImpliedProbNum !== null) {
      bookmakerImpliedProb = formatPercentage(bookmakerImpliedProbNum);
      valueDiff = appProb - bookmakerImpliedProbNum;
      
      const calculatedKelly = calculateKellyStake(appProb, bookmakerOdd);
      if(calculatedKelly) {
          kellyStake = calculatedKelly;
      }

      if (valueDiff > 0.03) {
        valueColorClass = 'text-green-400';
        borderColorClass = 'border-green-500 ring-1 ring-green-500/50';
        message = 'Yüksek Değer!';
      } else if (valueDiff > 0.005) { 
        valueColorClass = 'text-green-300';
        borderColorClass = 'border-green-400';
        message = 'Potansiyel Değer';
      } else if (valueDiff < -0.03) {
        valueColorClass = 'text-red-400';
        borderColorClass = 'border-red-500';
        message = 'Düşük Değer';
      } else if (valueDiff < -0.005) {
        valueColorClass = 'text-red-300';
        borderColorClass = 'border-red-400';
        message = 'Dikkatli Olun';
      } else {
        valueColorClass = 'text-yellow-400';
        borderColorClass = 'border-yellow-500';
        message = 'Nötr Değer';
      }
    }
  } else if (bookmakerOddStr.trim() !== '' && (isNaN(bookmakerOdd) || bookmakerOdd <= 1.0)) {
     message = "Geçersiz Oran (>1 olmalı)";
     borderColorClass = 'border-red-500';
  }

  return { appValue, bookmakerImpliedProb, valueDiff, valueColorClass, borderColorClass, message, kellyStake };
};


export const BookmakerOddsComparison: React.FC<BookmakerOddsComparisonProps> = ({ appProbs, displayAsPercentage, bankroll, setBankroll, onLogBet, leagueName, homeTeam, awayTeam }) => {
  const [bookmakerOdds, setBookmakerOdds] = useState<OddsInputState>({ home: '', draw: '', away: '' });

  const handleOddChange = (market: keyof OddsInputState, value: string) => {
    setBookmakerOdds(prev => ({ ...prev, [market]: value }));
  };
  
  const handleLogBetClick = (market: 'home' | 'draw' | 'away', details: ComparisonDetails, appProb: number) => {
    const odds = parseFloat(bookmakerOdds[market]);
    const bankrollNum = parseFloat(bankroll);
    
    if(!leagueName || !homeTeam || !awayTeam || isNaN(odds) || !details.kellyStake) return;

    const stake = bankrollNum * details.kellyStake.quarter; // Defaulting to Quarter Kelly

    onLogBet({
      leagueName,
      homeTeam: homeTeam.name,
      awayTeam: awayTeam.name,
      market: market === 'home' ? 'Ev Sahibi Kazanır' : market === 'draw' ? 'Beraberlik' : 'Deplasman Kazanır',
      stake,
      odds,
      appProb,
      status: 'pending',
      kellyRecommendation: details.kellyStake.quarter,
    });
  };

  const comparisonData = useMemo(() => {
    if (!appProbs) return null;
    return {
      home: getComparisonDetails(appProbs.homeWinProb, bookmakerOdds.home, displayAsPercentage),
      draw: getComparisonDetails(appProbs.drawProb, bookmakerOdds.draw, displayAsPercentage),
      away: getComparisonDetails(appProbs.awayWinProb, bookmakerOdds.away, displayAsPercentage),
    };
  }, [appProbs, bookmakerOdds, displayAsPercentage]);

  if (!appProbs) {
    return null;
  }

  const renderMarketCard = (
    marketKey: 'home' | 'draw' | 'away',
    title: string,
    details: ComparisonDetails | undefined,
    appProb: number
  ) => {
    if (!details) return null;
    const bankrollNum = parseFloat(bankroll);
    const hasValue = (details.valueDiff ?? 0) > 0;
    
    return (
      <div className={`p-4 rounded-lg shadow-lg flex flex-col text-center bg-gray-850 bg-opacity-80 border ${details.borderColorClass} transition-all duration-200`}>
        <label htmlFor={`bookie-${marketKey}`} className="text-sm font-medium text-gray-300 mb-2">{title}</label>
        <input
          type="number"
          id={`bookie-${marketKey}`}
          step="0.01"
          min="1.01"
          value={bookmakerOdds[marketKey]}
          onChange={(e) => handleOddChange(marketKey, e.target.value)}
          placeholder="Örn: 2.50"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-100 placeholder-gray-500 text-center text-xl font-bold mb-2"
        />
        {details.message && (
             <p className={`text-xs h-4 ${details.valueColorClass}`}>
                {details.message}
            </p>
        )}
        
        {details.valueDiff !== undefined && details.valueDiff > 0 && details.kellyStake && !isNaN(bankrollNum) && bankrollNum > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-left space-y-2">
                <h5 className="font-bold text-purple-300 text-center mb-2">Kelly Kriteri Bahis Önerisi</h5>
                <p className="flex justify-between"><span>Tam Kelly:</span> <span className="font-semibold text-white">{formatPercentage(details.kellyStake.full)} ({ (bankrollNum * details.kellyStake.full).toFixed(2) })</span></p>
                <p className="flex justify-between"><span>Yarım Kelly:</span> <span className="font-semibold text-gray-300">{formatPercentage(details.kellyStake.half)} ({ (bankrollNum * details.kellyStake.half).toFixed(2) })</span></p>
                <p className="flex justify-between"><span>Çeyrek Kelly:</span> <span className="font-semibold text-gray-400">{formatPercentage(details.kellyStake.quarter)} ({ (bankrollNum * details.kellyStake.quarter).toFixed(2) })</span></p>
                 <button onClick={() => handleLogBetClick(marketKey, details, appProb)} className="w-full mt-3 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                    Bahsi Kaydet (Çeyrek Kelly)
                </button>
            </div>
        )}
      </div>
    );
  };
  
  const impliedProbsNum = [
    calculateImpliedProbability(parseFloat(bookmakerOdds.home.replace(',', '.'))),
    calculateImpliedProbability(parseFloat(bookmakerOdds.draw.replace(',', '.'))),
    calculateImpliedProbability(parseFloat(bookmakerOdds.away.replace(',', '.')))
  ];
  const validImpliedProbs = impliedProbsNum.filter(p => p !== null) as number[];
  let bookmakerMargin: string | null = null;
  if (validImpliedProbs.length === 3) {
    const totalImpliedProb = validImpliedProbs.reduce((sum, p) => sum + p, 0);
    if (totalImpliedProb > 0) {
        const margin = (totalImpliedProb - 1);
        bookmakerMargin = formatPercentage(margin);
    }
  }

  return (
    <div className="mt-8 p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-xl border border-gray-700">
      <h3 className="text-xl font-semibold text-center text-purple-300 mb-2">Bahis Bürosu Oranları ile Değer Analizi</h3>
      <p className="text-xs text-gray-400 text-center mb-4">Girilen oranlara göre uygulamanın hesapladığı olasılıklarla karşılaştırın.</p>
      
      <div className="mb-4">
           <label htmlFor="bankroll" className="block mb-2 text-sm font-medium text-purple-300 text-center">
              Kasanız (Bahis Bütçeniz)
          </label>
          <input
              type="number"
              id="bankroll"
              value={bankroll}
              onChange={(e) => setBankroll(e.target.value)}
              placeholder="örn. 1000"
              className="w-full max-w-xs mx-auto p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-gray-100 placeholder-gray-500 text-center"
          />
           {bookmakerMargin && <p className="text-xs text-yellow-500 text-center mt-2">Bahis Bürosu Marjı: {bookmakerMargin}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {renderMarketCard('home', 'Ev Sahibi Kazanır', comparisonData?.home, appProbs.homeWinProb)}
        {renderMarketCard('draw', 'Beraberlik', comparisonData?.draw, appProbs.drawProb)}
        {renderMarketCard('away', 'Deplasman Kazanır', comparisonData?.away, appProbs.awayWinProb)}
      </div>
    </div>
  );
};