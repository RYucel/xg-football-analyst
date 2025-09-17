import React, { useState, useMemo } from 'react';
import { LoggedBet, LeagueBetStats, TeamStat, LeagueData } from '../types';

interface EnhancedBetTrackerProps {
    loggedBets: LoggedBet[];
    onAddBet: (bet: Omit<LoggedBet, 'id' | 'date'>) => void;
    onUpdateBet: (id: string, closingOdds: number) => void;
    onDeleteBet: (id: string) => void;
    onClearBets: () => void;
    allLeagueData: LeagueData;
}

export const EnhancedBetTracker: React.FC<EnhancedBetTrackerProps> = ({
    loggedBets,
    onAddBet,
    onUpdateBet,
    onDeleteBet,
    onClearBets,
    allLeagueData
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [selectedLeague, setSelectedLeague] = useState('superLig');
    const [newBet, setNewBet] = useState({
        homeTeam: '',
        awayTeam: '',
        market: 'Ev Sahibi Galibiyeti',
        stake: '',
        odds: '',
        appProb: ''
    });

    const currentLeagueTeams = allLeagueData[selectedLeague]?.data || [];
    const currentLeagueName = allLeagueData[selectedLeague]?.name || '';

    // Calculate statistics by league
    const leagueStats = useMemo((): LeagueBetStats[] => {
        const statsMap = new Map<string, LeagueBetStats>();
        
        loggedBets.forEach(bet => {
            if (!statsMap.has(bet.leagueName)) {
                statsMap.set(bet.leagueName, {
                    leagueName: bet.leagueName,
                    totalBets: 0,
                    wonBets: 0,
                    lostBets: 0,
                    voidBets: 0,
                    totalStake: 0,
                    totalProfit: 0,
                    winRate: 0,
                    roi: 0
                });
            }
            
            const stats = statsMap.get(bet.leagueName)!;
            stats.totalBets++;
            stats.totalStake += bet.stake;
            
            if (bet.result === 'won') {
                stats.wonBets++;
                stats.totalProfit += (bet.odds - 1) * bet.stake;
            } else if (bet.result === 'lost') {
                stats.lostBets++;
                stats.totalProfit -= bet.stake;
            } else if (bet.result === 'void') {
                stats.voidBets++;
            }
            
            stats.winRate = stats.totalBets > 0 ? (stats.wonBets / (stats.wonBets + stats.lostBets)) * 100 : 0;
            stats.roi = stats.totalStake > 0 ? (stats.totalProfit / stats.totalStake) * 100 : 0;
        });
        
        return Array.from(statsMap.values());
    }, [loggedBets]);

    const handleAddBet = () => {
        if (!newBet.homeTeam || !newBet.awayTeam || !newBet.stake || !newBet.odds || !newBet.appProb) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        const bet: Omit<LoggedBet, 'id' | 'date'> = {
            leagueName: currentLeagueName,
            homeTeam: newBet.homeTeam,
            awayTeam: newBet.awayTeam,
            market: newBet.market,
            stake: parseFloat(newBet.stake),
            odds: parseFloat(newBet.odds),
            appProb: parseFloat(newBet.appProb),
            status: 'pending'
        };

        onAddBet(bet);
        setNewBet({
            homeTeam: '',
            awayTeam: '',
            market: 'Ev Sahibi Galibiyeti',
            stake: '',
            odds: '',
            appProb: ''
        });
        setShowAddForm(false);
    };

    const getResultColor = (result?: string) => {
        switch (result) {
            case 'won': return 'text-green-400';
            case 'lost': return 'text-red-400';
            case 'void': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const formatProfit = (bet: LoggedBet) => {
        if (bet.result === 'won') {
            return `+${((bet.odds - 1) * bet.stake).toFixed(2)} TL`;
        } else if (bet.result === 'lost') {
            return `-${bet.stake.toFixed(2)} TL`;
        }
        return '0.00 TL';
    };

    return (
        <div className="mt-8 p-4 sm:p-6 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-purple-300">Bahislerim</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-3 py-1 text-xs font-medium text-green-300 bg-green-800 hover:bg-green-700 rounded-md transition-colors"
                    >
                        {showAddForm ? 'İptal' : 'Bahis Ekle'}
                    </button>
                    <button 
                        onClick={() => setShowStats(!showStats)}
                        className="px-3 py-1 text-xs font-medium text-blue-300 bg-blue-800 hover:bg-blue-700 rounded-md transition-colors"
                    >
                        {showStats ? 'İstatistikleri Gizle' : 'İstatistikler'}
                    </button>
                    <button 
                        onClick={onClearBets}
                        className="px-3 py-1 text-xs font-medium text-red-300 bg-red-800 hover:bg-red-700 rounded-md transition-colors"
                    >
                        Tümünü Temizle
                    </button>
                </div>
            </div>

            {/* Add Bet Form */}
            {showAddForm && (
                <div className="mb-6 p-4 bg-gray-700 bg-opacity-50 rounded-lg">
                    <h4 className="text-lg font-medium text-purple-300 mb-3">Yeni Bahis Ekle</h4>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Lig Seçin</label>
                        <select
                            value={selectedLeague}
                            onChange={(e) => setSelectedLeague(e.target.value)}
                            className="w-full md:w-1/2 bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                        >
                            {Object.entries(allLeagueData).map(([key, league]) => (
                                <option key={key} value={key}>{league.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Ev Sahibi Takım</label>
                            <select
                                value={newBet.homeTeam}
                                onChange={(e) => setNewBet({...newBet, homeTeam: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                            >
                                <option value="">Takım Seçin</option>
                                {currentLeagueTeams.map(team => (
                                    <option key={team.name} value={team.name}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Deplasman Takımı</label>
                            <select
                                value={newBet.awayTeam}
                                onChange={(e) => setNewBet({...newBet, awayTeam: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                            >
                                <option value="">Takım Seçin</option>
                                {currentLeagueTeams.map(team => (
                                    <option key={team.name} value={team.name}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Bahis Türü</label>
                            <select
                                value={newBet.market}
                                onChange={(e) => setNewBet({...newBet, market: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                            >
                                <option value="Ev Sahibi Galibiyeti">Ev Sahibi Galibiyeti</option>
                                <option value="Beraberlik">Beraberlik</option>
                                <option value="Deplasman Galibiyeti">Deplasman Galibiyeti</option>
                                <option value="Alt 2.5">Alt 2.5</option>
                                <option value="Üst 2.5">Üst 2.5</option>
                                <option value="KG Var">KG Var</option>
                                <option value="KG Yok">KG Yok</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Yatırılan Miktar (TL)</label>
                            <input
                                type="number"
                                value={newBet.stake}
                                onChange={(e) => setNewBet({...newBet, stake: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                                placeholder="100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Oran</label>
                            <input
                                type="number"
                                step="0.01"
                                value={newBet.odds}
                                onChange={(e) => setNewBet({...newBet, odds: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                                placeholder="2.50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Uygulama Olasılığı (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={newBet.appProb}
                                onChange={(e) => setNewBet({...newBet, appProb: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                                placeholder="45.5"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleAddBet}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                        >
                            Bahis Ekle
                        </button>
                    </div>
                </div>
            )}

            {/* Statistics */}
            {showStats && leagueStats.length > 0 && (
                <div className="mb-6 p-4 bg-gray-700 bg-opacity-50 rounded-lg">
                    <h4 className="text-lg font-medium text-purple-300 mb-3">Lig Bazında İstatistikler</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-600">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Lig</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Toplam Bahis</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Kazanan</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Kaybeden</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Başarı %</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Toplam Yatırım</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Kar/Zarar</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">ROI %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-600">
                                {leagueStats.map(stats => (
                                    <tr key={stats.leagueName}>
                                        <td className="px-4 py-2 text-sm text-white">{stats.leagueName}</td>
                                        <td className="px-4 py-2 text-sm text-white">{stats.totalBets}</td>
                                        <td className="px-4 py-2 text-sm text-green-400">{stats.wonBets}</td>
                                        <td className="px-4 py-2 text-sm text-red-400">{stats.lostBets}</td>
                                        <td className="px-4 py-2 text-sm text-white">{stats.winRate.toFixed(1)}%</td>
                                        <td className="px-4 py-2 text-sm text-white">{stats.totalStake.toFixed(2)} TL</td>
                                        <td className={`px-4 py-2 text-sm ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)} TL
                                        </td>
                                        <td className={`px-4 py-2 text-sm ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bets Table */}
            {loggedBets.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-400">Henüz kaydedilmiş bahis bulunmamaktadır.</p>
                    <p className="text-xs text-gray-500 mt-1">Yukarıdaki "Bahis Ekle" butonunu kullanarak bahis ekleyebilirsiniz.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700 bg-opacity-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Tarih</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Maç</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Bahis</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Miktar</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Oran</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Sonuç</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Kar/Zarar</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {loggedBets.map(bet => (
                                <tr key={bet.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{bet.date}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{bet.homeTeam} vs {bet.awayTeam}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{bet.market}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{bet.stake.toFixed(2)} TL</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{bet.odds.toFixed(2)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {bet.result ? (
                                            <span className={getResultColor(bet.result)}>
                                                {bet.result === 'won' ? 'Kazandı' : bet.result === 'lost' ? 'Kaybetti' : 'İptal'}
                                            </span>
                                        ) : (
                                            <div className="flex gap-1">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Kapanış oranı"
                                                    className="w-20 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white mr-2"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const closingOdds = parseFloat((e.target as HTMLInputElement).value);
                                                            if (closingOdds > 0) {
                                                                onUpdateBet(bet.id, closingOdds);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${getResultColor(bet.result)}`}>
                                        {formatProfit(bet)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <button 
                                            onClick={() => onDeleteBet(bet.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};