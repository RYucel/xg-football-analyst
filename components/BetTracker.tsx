import React, { useState } from 'react';
import { LoggedBet } from '../types';

interface BetTrackerProps {
    loggedBets: LoggedBet[];
    updateBet: (id: string, closingOdds: number) => void;
    deleteBet: (id: string) => void;
    clearBets: () => void;
}

export const BetTracker: React.FC<BetTrackerProps> = ({ loggedBets, updateBet, deleteBet, clearBets }) => {
    const [editingBetId, setEditingBetId] = useState<string | null>(null);
    const [closingOddsInput, setClosingOddsInput] = useState<string>('');

    const handleEdit = (bet: LoggedBet) => {
        setEditingBetId(bet.id);
        setClosingOddsInput(bet.closingOdds ? String(bet.closingOdds) : '');
    };
    
    const handleSave = (id: string) => {
        const odds = parseFloat(closingOddsInput);
        if (!isNaN(odds) && odds > 1) {
            updateBet(id, odds);
            setEditingBetId(null);
            setClosingOddsInput('');
        }
    };

    const getClvColor = (clv?: number) => {
        if (clv === undefined) return 'text-gray-400';
        if (clv > 0) return 'text-green-400';
        if (clv < 0) return 'text-red-400';
        return 'text-yellow-400';
    };

    if (loggedBets.length === 0) {
        return (
             <div className="mt-8 p-6 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-xl text-center">
                <h3 className="text-xl font-semibold text-purple-300">Bahislerim</h3>
                <p className="text-gray-400 mt-2">Henüz kaydedilmiş bahis bulunmamaktadır.</p>
                <p className="text-xs text-gray-500 mt-1">Maç Analizi sekmesinden değerli bulduğunuz bahisleri kaydedebilirsiniz.</p>
             </div>
        )
    }

    return (
        <div className="mt-8 p-4 sm:p-6 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-semibold text-purple-300">Bahislerim</h3>
                 <button onClick={clearBets} className="px-3 py-1 text-xs font-medium text-red-300 bg-red-800 hover:bg-red-700 rounded-md transition-colors">Tümünü Temizle</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700 bg-opacity-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Maç</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Bahis</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Oran</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Kapanış Oranı</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">CLV</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {loggedBets.map(bet => (
                            <tr key={bet.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{bet.homeTeam} vs {bet.awayTeam}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{bet.market}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">{bet.odds.toFixed(2)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {editingBetId === bet.id ? (
                                        <input
                                            type="number"
                                            value={closingOddsInput}
                                            onChange={(e) => setClosingOddsInput(e.target.value)}
                                            onBlur={() => handleSave(bet.id)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(bet.id); }}
                                            className="w-20 bg-gray-900 border border-gray-600 rounded-md px-1 py-0.5 text-center"
                                            autoFocus
                                        />
                                    ) : (
                                        <span onClick={() => handleEdit(bet)} className="cursor-pointer">
                                            {bet.closingOdds ? bet.closingOdds.toFixed(2) : 'Ekle'}
                                        </span>
                                    )}
                                </td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${getClvColor(bet.clv)}`}>
                                    {bet.clv !== undefined ? `${(bet.clv * 100).toFixed(2)}%` : 'N/A'}
                                </td>
                                 <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <button onClick={() => deleteBet(bet.id)} className="text-red-400 hover:text-red-300">Sil</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
