
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { PoissonService } from './services/poissonService';
import { EloService } from './services/eloService';
import { AppTitle } from './components/shared/AppTitle';
import { Footer } from './components/shared/Footer';
import { TeamSelector } from './components/TeamSelector';
import { BookmakerOddsComparison } from './components/BookmakerOddsComparison';
import { GeminiAnalysis } from './components/GeminiAnalysis';
import { AdminPanel } from './components/AdminPanel';
import { EnhancedBetTracker } from './components/EnhancedBetTracker';
import { MarginCalculator } from './components/MarginCalculator';
import { ArbitrageCalculator } from './components/ArbitrageCalculator';
import { generateMatchAnalysis } from './services/geminiService';
import { superLigTeamData } from './data/superLigData';
import { premierLeagueData } from './data/premierLeagueData';
import { laLigaData } from './data/laLigaData';
import { serieATeamData } from './data/serieAData';
import { bundesligaData } from './data/bundesligaData';
import { LeagueData, LeagueConfig, TeamStat, FullTimeResultProbs, ActiveMainTab, LoggedBet, ActiveAnalysisTab, ActiveToolTab, CalculationResults, CSVTeamData } from './types';
import { EloAnalysis } from './components/EloAnalysis';
import { ContrarianAnalysis } from './components/ContrarianAnalysis';


const initialAllLeagueData: LeagueData = {
  superLig: { 
    key: 'superLig', 
    name: 'Türkiye Süper Ligi', 
    data: superLigTeamData, 
    imageUrl: 'https://cdn.footystats.org/img/competitions/turkey-super-lig.png' 
  },
  premierLeague: { 
    key: 'premierLeague', 
    name: 'İngiltere Premier Ligi', 
    data: premierLeagueData, 
    imageUrl: 'https://cdn.footystats.org/img/competitions/england-premier-league.png' 
  },
  laLiga: {
    key: 'laLiga',
    name: 'İspanya La Liga',
    data: laLigaData,
    imageUrl: 'https://cdn.footystats.org/img/competitions/spain-la-liga.png'
  },
  serieA: {
    key: 'serieA',
    name: 'İtalya Serie A',
    data: serieATeamData,
    imageUrl: 'https://cdn.footystats.org/img/competitions/italy-serie-a.png'
  },
  bundesliga: {
    key: 'bundesliga',
    name: 'Almanya Bundesliga',
    data: bundesligaData,
    imageUrl: 'https://cdn.footystats.org/img/competitions/germany-bundesliga.png'
  }
};

type ValueBetModel = 'xg' | 'elo';

const App: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<ActiveMainTab>('analysis');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<ActiveAnalysisTab>('xg');
  const [activeToolTab, setActiveToolTab] = useState<ActiveToolTab>('margin');

  // xG Calculator State
  const [homeXGStr, setHomeXGStr] = useState<string>('');
  const [awayXGStr, setAwayXGStr] = useState<string>('');
  const [displayAsPercentage, setDisplayAsPercentage] = useState<boolean>(false);
  const [xgResults, setXgResults] = useState<CalculationResults | null>(null);
  const [isXgLoading, setIsXgLoading] = useState<boolean>(false);
  const [xgError, setXgError] = useState<string | null>(null);

  // Elo Calculator State
  const [eloResults, setEloResults] = useState<FullTimeResultProbs | null>(null);
  
  // State for League and Team Selector
  const [allLeagueData, setAllLeagueData] = useState<LeagueData>(initialAllLeagueData);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('allLeagueData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Only use stored data if it has all required leagues, otherwise use fresh data
        if (parsedData.superLig && parsedData.premierLeague && parsedData.laLiga && parsedData.serieA && parsedData.bundesliga) {
          // Merge stored data with fresh data to ensure we have latest updates
          setAllLeagueData({
            superLig: { ...initialAllLeagueData.superLig, ...parsedData.superLig, data: initialAllLeagueData.superLig.data },
            premierLeague: { ...initialAllLeagueData.premierLeague, ...parsedData.premierLeague, data: initialAllLeagueData.premierLeague.data },
            laLiga: { ...initialAllLeagueData.laLiga, ...parsedData.laLiga, data: initialAllLeagueData.laLiga.data },
            serieA: { ...initialAllLeagueData.serieA, ...parsedData.serieA, data: initialAllLeagueData.serieA.data },
            bundesliga: { ...initialAllLeagueData.bundesliga, ...parsedData.bundesliga, data: initialAllLeagueData.bundesliga.data }
          });
        }
      }
    } catch (error) {
      console.error("Error parsing league data from localStorage", error);
    }
  }, []);
  
  const [currentLeagueKey, setCurrentLeagueKey] = useState<string>('superLig');
  const [selectedHomeTeamName, setSelectedHomeTeamName] = useState<string | null>(null);
  const [selectedAwayTeamName, setSelectedAwayTeamName] = useState<string | null>(null);
  
  // State for Bookmaker Odds and Kelly Criterion
  const [bankroll, setBankroll] = useState<string>('1000');
  const [valueBetModel, setValueBetModel] = useState<ValueBetModel>('xg');


  // State for Gemini Analysis
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // State for Admin Panel
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // State for Bet Tracker
  const [loggedBets, setLoggedBets] = useState<LoggedBet[]>(() => {
      try {
          const storedBets = localStorage.getItem('loggedBets');
          return storedBets ? JSON.parse(storedBets) : [];
      } catch (e) {
          console.error("Error loading bets from localStorage", e);
          return [];
      }
  });

  useEffect(() => {
    try {
      localStorage.setItem('loggedBets', JSON.stringify(loggedBets));
    } catch(e) {
      console.error("Error saving bets to localStorage", e);
    }
  }, [loggedBets]);

  const handleLogBet = useCallback((betDetails: Omit<LoggedBet, 'id' | 'date'>) => {
    const newBet: LoggedBet = {
      ...betDetails,
      id: new Date().toISOString() + Math.random(),
      date: new Date().toLocaleDateString('tr-TR'),
    };
    setLoggedBets(prev => [newBet, ...prev]);
  }, []);

  const handleUpdateBet = (id: string, closingOdds: number) => {
    setLoggedBets(prev => prev.map(bet => {
      if (bet.id === id) {
        const clv = (bet.odds / closingOdds) - 1;
        return { ...bet, closingOdds, clv };
      }
      return bet;
    }));
  };

  const handleDeleteBet = (id: string) => {
      setLoggedBets(prev => prev.filter(bet => bet.id !== id));
  };

  const handleClearBets = () => {
      if(window.confirm("Tüm kayıtlı bahisleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
        setLoggedBets([]);
      }
  };

  const handleAddBet = useCallback((betData: Omit<LoggedBet, 'id' | 'date'>) => {
    const newBet: LoggedBet = {
      ...betData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('tr-TR')
    };
    setLoggedBets(prev => [newBet, ...prev]);
  }, []);

  const handleDataImport = useCallback((leagueKey: string, csvData: CSVTeamData[]) => {
    const convertedData: TeamStat[] = csvData.map(item => ({
      rank: item.rank,
      name: item.name,
      mp: item.mp,
      xG: item.xG,
      xGA: item.xGA,
      xGD: item.xGD,
      elo: item.elo
    }));
    
    setAllLeagueData(prevData => ({
      ...prevData,
      [leagueKey]: {
        ...prevData[leagueKey],
        data: convertedData
      }
    }));
    
    if (leagueKey === currentLeagueKey) {
      setSelectedHomeTeamName(null);
      setSelectedAwayTeamName(null);
      setXgResults(null);
      setEloResults(null);
    }
  }, [currentLeagueKey]);


  const poissonService = useMemo(() => new PoissonService(), []);
  const eloService = useMemo(() => new EloService(), []);


  const currentLeagueTeams = useMemo(() => {
    return allLeagueData[currentLeagueKey]?.data || [];
  }, [currentLeagueKey, allLeagueData]);

  // Persist league data changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('allLeagueData', JSON.stringify(allLeagueData));
    } catch (error) {
      console.error("Error saving league data to localStorage", error);
    }
  }, [allLeagueData]);

  useEffect(() => {
    setSelectedHomeTeamName(null);
    setSelectedAwayTeamName(null);
    setXgResults(null); 
    setEloResults(null);
    setAnalysisResult(null); 
    setAnalysisError(null);
  }, [currentLeagueKey]);
  
  useEffect(() => {
    setAnalysisResult(null);
    setAnalysisError(null);
  }, [selectedHomeTeamName, selectedAwayTeamName]);


  useEffect(() => {
    const homeTeamData = currentLeagueTeams.find(team => team.name === selectedHomeTeamName);
    const awayTeamData = currentLeagueTeams.find(team => team.name === selectedAwayTeamName);

    // xG calculation
    if (homeTeamData && awayTeamData) {
        const matchupHomeXG = (homeTeamData.xG + awayTeamData.xGA) / 2;
        const matchupAwayXG = (awayTeamData.xG + homeTeamData.xGA) / 2;
        setHomeXGStr(matchupHomeXG.toFixed(2));
        setAwayXGStr(matchupAwayXG.toFixed(2));
    } else {
        setHomeXGStr('');
        setAwayXGStr('');
    }

    // Elo calculation
    if (homeTeamData?.elo && awayTeamData?.elo) {
      const eloProbs = eloService.calculateEloProbabilities(homeTeamData.elo, awayTeamData.elo);
      setEloResults(eloProbs);
    } else {
      setEloResults(null);
    }
  }, [selectedHomeTeamName, selectedAwayTeamName, currentLeagueTeams, eloService]);


  const handleCalculateXG = useCallback(() => {
    setXgError(null);
    const homeXG = parseFloat(homeXGStr.replace(',', '.'));
    const awayXG = parseFloat(awayXGStr.replace(',', '.'));

    if (isNaN(homeXG) || isNaN(awayXG) || homeXG < 0 || awayXG < 0) {
      setXgError('Lütfen geçerli, negatif olmayan Beklenen Gol (xG) değerleri girin.');
      setXgResults(null);
      return;
    }
    if (homeXG > 10 || awayXG > 10) {
      setXgError('Beklenen Gol değerleri çok yüksek görünüyor. Sonuçlar alışılmadık olabilir.');
    }

    setIsXgLoading(true);
    setTimeout(() => { 
      try {
        const calculatedResults = poissonService.calculateAllProbabilities(homeXG, awayXG);
        setXgResults(calculatedResults);
        const homeTeamData = currentLeagueTeams.find(t => t.name === selectedHomeTeamName);
        const awayTeamData = currentLeagueTeams.find(t => t.name === selectedAwayTeamName);
        if (homeTeamData?.elo && awayTeamData?.elo) {
          setEloResults(eloService.calculateEloProbabilities(homeTeamData.elo, awayTeamData.elo));
        }
      } catch (e) {
        if (e instanceof Error) {
          setXgError(`Hesaplama hatası: ${e.message}`);
        } else {
          setXgError('xG hesaplanırken bilinmeyen bir hata oluştu.');
        }
        setXgResults(null);
      } finally {
        setIsXgLoading(false);
      }
    }, 250); 
  }, [homeXGStr, awayXGStr, poissonService, eloService, currentLeagueTeams, selectedHomeTeamName, selectedAwayTeamName]);
  
  const handleLeagueSelect = (leagueKey: string) => {
    setCurrentLeagueKey(leagueKey);
  };
  
  const handleLeagueDataUpdate = useCallback((leagueKey: string, newData: TeamStat[]) => {
    setAllLeagueData(prevData => {
      const updatedLeague = {
        ...prevData[leagueKey],
        data: newData,
      };
      return {
        ...prevData,
        [leagueKey]: updatedLeague,
      };
    });
    if(leagueKey === currentLeagueKey){
      setSelectedHomeTeamName(null);
      setSelectedAwayTeamName(null);
      setXgResults(null);
      setEloResults(null);
    }
  }, [currentLeagueKey]);

  const handleGetAnalysis = useCallback(async () => {
    if (!selectedHomeTeamName || !selectedAwayTeamName) {
        setAnalysisError("Lütfen analiz için iki takım seçin.");
        return;
    }
    setAnalysisError(null);
    setAnalysisResult(null);
    setIsAnalysisLoading(true);
    try {
        const result = await generateMatchAnalysis(selectedHomeTeamName, selectedAwayTeamName);
        setAnalysisResult(result);
    } catch (e) {
        if (e instanceof Error) {
            setAnalysisError(e.message);
        } else {
            setAnalysisError("AI analizi sırasında bilinmeyen bir hata oluştu.");
        }
    } finally {
        setIsAnalysisLoading(false);
    }
  }, [selectedHomeTeamName, selectedAwayTeamName]);

  const selectedHomeTeam = useMemo(() => currentLeagueTeams.find(t => t.name === selectedHomeTeamName), [currentLeagueTeams, selectedHomeTeamName]);
  const selectedAwayTeam = useMemo(() => currentLeagueTeams.find(t => t.name === selectedAwayTeamName), [currentLeagueTeams, selectedAwayTeamName]);
  
  const probsForValueBet = valueBetModel === 'xg' ? xgResults?.fullTimeResult : eloResults;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl bg-gray-800 bg-opacity-80 backdrop-blur-md shadow-2xl rounded-xl p-6 md:p-8 space-y-8">
        <AppTitle />

        <div className="border-b border-gray-700 flex justify-center space-x-4">
             <button onClick={() => setActiveMainTab('analysis')} className={`py-2 px-4 text-sm font-medium transition-colors ${activeMainTab === 'analysis' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}>Maç Analizi</button>
             <button onClick={() => setActiveMainTab('bets')} className={`py-2 px-4 text-sm font-medium transition-colors ${activeMainTab === 'bets' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}>Bahislerim</button>
             <button onClick={() => setActiveMainTab('tools')} className={`py-2 px-4 text-sm font-medium transition-colors ${activeMainTab === 'tools' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}>Araçlar</button>
        </div>


        {activeMainTab === 'analysis' && (
          <>
            <div className="p-6 bg-gray-850 bg-opacity-70 rounded-lg shadow-md border border-gray-700">
                <label className="block mb-3 text-sm font-medium text-purple-300 text-center">
                    Lig Seçin
                </label>
                <div className="flex justify-center items-center space-x-3 sm:space-x-4">
                    {Object.values(allLeagueData).map((league: LeagueConfig) => (
                    <div
                        key={league.key}
                        onClick={() => handleLeagueSelect(league.key)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLeagueSelect(league.key);}}
                        role="button"
                        tabIndex={0}
                        aria-pressed={currentLeagueKey === league.key}
                        aria-label={`Seç: ${league.name}`}
                        className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75
                                    ${currentLeagueKey === league.key ? 'ring-2 ring-purple-400 shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                    >
                        <img 
                        src={league.imageUrl} 
                        alt={`${league.name} Logosu`} 
                        className="h-10 w-10 sm:h-14 sm:w-14 object-contain"
                        />
                        <p className={`text-xs text-center mt-1 ${currentLeagueKey === league.key ? 'text-purple-300 font-semibold' : 'text-gray-400'}`}>
                        {league.name.split(' ')[0]}
                        </p>
                    </div>
                    ))}
                </div>
            </div>
            
            <TeamSelector
              teams={currentLeagueTeams}
              selectedHomeTeamName={selectedHomeTeamName}
              setSelectedHomeTeamName={setSelectedHomeTeamName}
              selectedAwayTeamName={selectedAwayTeamName}
              setSelectedAwayTeamName={setSelectedAwayTeamName}
              leagueName={allLeagueData[currentLeagueKey]?.name || ""}
            />

            <InputForm
              homeXG={homeXGStr}
              setHomeXG={setHomeXGStr}
              awayXG={awayXGStr}
              setAwayXG={setAwayXGStr}
              displayAsPercentage={displayAsPercentage}
              setDisplayAsPercentage={setDisplayAsPercentage}
              onCalculate={handleCalculateXG}
              isLoading={isXgLoading}
            />

            {xgError && (
              <div className="mt-4 p-3 bg-red-700 bg-opacity-50 text-red-100 border border-red-500 rounded-md text-center">
                {xgError}
              </div>
            )}
             
            <div className="mt-4 border-b border-gray-700 flex justify-center space-x-2">
                <button onClick={() => setActiveAnalysisTab('xg')} className={`py-2 px-3 text-xs sm:text-sm font-medium transition-colors ${activeAnalysisTab === 'xg' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}>xG (Poisson)</button>
                <button onClick={() => setActiveAnalysisTab('elo')} className={`py-2 px-3 text-xs sm:text-sm font-medium transition-colors ${activeAnalysisTab === 'elo' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}>Elo Analizi</button>
                <button onClick={() => setActiveAnalysisTab('contrarian')} className={`py-2 px-3 text-xs sm:text-sm font-medium transition-colors ${activeAnalysisTab === 'contrarian' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}>Aykırı Strateji</button>
            </div>


            {isXgLoading && (
              <div className="mt-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
                <p className="ml-3 text-lg text-purple-300">Analizler Hesaplanıyor...</p>
              </div>
            )}

            {!isXgLoading && (
              <>
                {activeAnalysisTab === 'xg' && xgResults && <ResultsDisplay results={xgResults} displayAsPercentage={displayAsPercentage} />}
                {activeAnalysisTab === 'elo' && eloResults && <EloAnalysis homeTeam={selectedHomeTeam} awayTeam={selectedAwayTeam} eloResults={eloResults} displayAsPercentage={displayAsPercentage} />}
                {activeAnalysisTab === 'contrarian' && <ContrarianAnalysis homeTeam={selectedHomeTeam} awayTeam={selectedAwayTeam} />}
              </>
            )}
            
            
            { (xgResults || eloResults) && !isXgLoading && (
                <>
                <div className="mt-4 p-4 bg-gray-850 bg-opacity-70 rounded-lg shadow-md border border-gray-700">
                    <label className="block text-center mb-3 text-sm font-medium text-purple-300">Değerli Bahis Analizi için Model Seçimi</label>
                    <div className="flex justify-center rounded-md shadow-sm" role="group">
                      <button
                        type="button"
                        onClick={() => setValueBetModel('xg')}
                        className={`px-4 py-2 text-sm font-medium ${valueBetModel === 'xg' ? 'bg-purple-600 text-white z-10 ring-1 ring-purple-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} rounded-l-lg border border-gray-600 focus:z-10 focus:ring-2 focus:ring-purple-500`}
                        disabled={!xgResults}
                      >
                        xG (Poisson) Modeli
                      </button>
                      <button
                        type="button"
                        onClick={() => setValueBetModel('elo')}
                        className={`px-4 py-2 text-sm font-medium ${valueBetModel === 'elo' ? 'bg-purple-600 text-white z-10 ring-1 ring-purple-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} rounded-r-md border-t border-b border-r border-gray-600 focus:z-10 focus:ring-2 focus:ring-purple-500`}
                        disabled={!eloResults}
                      >
                        Elo Modeli
                      </button>
                    </div>
                </div>

                <BookmakerOddsComparison 
                  appProbs={probsForValueBet}
                  displayAsPercentage={displayAsPercentage} 
                  bankroll={bankroll}
                  setBankroll={setBankroll}
                  onLogBet={handleLogBet}
                  leagueName={allLeagueData[currentLeagueKey]?.name}
                  homeTeam={selectedHomeTeam}
                  awayTeam={selectedAwayTeam}
                />
                <GeminiAnalysis 
                    homeTeam={selectedHomeTeamName}
                    awayTeam={selectedAwayTeamName}
                    analysisResult={analysisResult}
                    isAnalysisLoading={isAnalysisLoading}
                    analysisError={analysisError}
                    onGetAnalysis={handleGetAnalysis}
                />
              </>
            )}
          </>
        )}
        
        {activeMainTab === 'bets' && (
            <EnhancedBetTracker 
                loggedBets={loggedBets}
                onAddBet={handleAddBet}
                onUpdateBet={handleUpdateBet}
                onDeleteBet={handleDeleteBet}
                onClearBets={handleClearBets}
                allLeagueData={allLeagueData}
            />
        )}
         {activeMainTab === 'tools' && (
             <div className="space-y-4">
                 <div className="border-b border-gray-700 flex justify-center space-x-2">
                    <button onClick={() => setActiveToolTab('margin')} className={`py-2 px-3 text-xs sm:text-sm font-medium transition-colors ${activeToolTab === 'margin' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}>Gerçek Oran Hesaplayıcı</button>
                    <button onClick={() => setActiveToolTab('arbitrage')} className={`py-2 px-3 text-xs sm:text-sm font-medium transition-colors ${activeToolTab === 'arbitrage' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}>Arbitraj & Değer Hesaplayıcısı</button>
                    <button onClick={() => setActiveToolTab('admin')} className={`py-2 px-3 text-xs sm:text-sm font-medium transition-colors ${activeToolTab === 'admin' ? 'border-b-2 border-purple-400 text-purple-300' : 'text-gray-400 hover:text-white'}`}>Admin Paneli</button>
                </div>
                {activeToolTab === 'margin' && <MarginCalculator />}
                {activeToolTab === 'arbitrage' && <ArbitrageCalculator />}
                {activeToolTab === 'admin' && <AdminPanel onDataImport={handleDataImport} />}
             </div>
        )}

      </div>
      <Footer onAdminToggle={() => setActiveToolTab('admin')} />
    </div>
  );
};

export default App;