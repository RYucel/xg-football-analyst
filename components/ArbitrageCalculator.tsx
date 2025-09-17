
import React, { useState, useMemo } from 'react';
import { BookmakerOddsRow } from '../types';
import { ArbitrageService, ArbitrageResult } from '../services/arbitrageService';
import { MarginService } from '../services/marginService';
import { TrueOdds } from '../types';

const arbitrageService = new ArbitrageService();
const marginService = new MarginService();

export const ArbitrageCalculator: React.FC = () => {
    const [rows, setRows] = useState<BookmakerOddsRow[]>([
        { id: 1, name: 'Pinnacle', home: '', draw: '', away: '' },
        { id: 2, name: 'bet365', home: '', draw: '', away: '' },
        { id: 3, name: 'Nicosia Bet', home: '', draw: '', away: '' },
        { id: 4, name: 'Büro 4', home: '', draw: '', away: '' },
    ]);
    const [totalInvestment, setTotalInvestment] = useState<string>('100');
    const [benchmarkRowId, setBenchmarkRowId] = useState<number | null>(rows.length > 0 ? rows[0].id : null);


    const handleUpdateRow = (id: number, field: keyof BookmakerOddsRow, value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleAddRow = () => {
        setRows([...rows, { id: Date.now(), name: `Büro ${rows.length + 1}`, home: '', draw: '', away: '' }]);
    };
    
    const handleDeleteRow = (id: number) => {
        if (rows.length > 1) {
            setRows(rows.filter(row => row.id !== id));
        }
    };

    const arbitrageResult = useMemo<ArbitrageResult | null>(() => {
        const investment = parseFloat(totalInvestment);
        if (isNaN(investment) || investment <= 0) return null;
        return arbitrageService.calculateArbitrage(rows, investment);
    }, [rows, totalInvestment]);

    const benchmarkTrueOdds = useMemo<TrueOdds | null>(() => {
        if (benchmarkRowId === null) return null;
        const benchmarkRow = rows.find(r => r.id === benchmarkRowId);
        if (!benchmarkRow) return null;
    
        const h = parseFloat(benchmarkRow.home);
        const d = parseFloat(benchmarkRow.draw);
        const a = parseFloat(benchmarkRow.away);
    
        if (isNaN(h) || isNaN(d) || isNaN(a) || h <= 1 || d <= 1 || a <= 1) {
          return null;
        }
    
        return marginService.removeMargin(h, d, a).logarithmic;
      }, [rows, benchmarkRowId]);
    

    const renderValue = (currentRow: BookmakerOddsRow, outcome: 'home' | 'draw' | 'away') => {
        if (!benchmarkTrueOdds || currentRow.id === benchmarkRowId) return null;
        
        const oddStr = currentRow[outcome];
        const odd = parseFloat(oddStr);
        const trueOdd = benchmarkTrueOdds[outcome].odds;

        if (isNaN(odd) || !trueOdd) return null;

        const value = (odd / trueOdd) - 1;
        const color = value > 0 ? 'text-green-400' : 'text-red-400';

        return <span className={`text-xs block mt-1 ${color}`}>Değer: {(value * 100).toFixed(2)}%</span>
    };

    return (
        <div className="mt-8 p-4 sm:p-6 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-center text-purple-300 mb-2">Arbitraj & Değer Hesaplayıcısı</h3>
            <p className="text-xs text-gray-400 text-center mb-4">Farklı büroların oranlarını karşılaştırarak risksiz kar (arbitraj) ve değerli bahis (value) fırsatları bulun.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                         <tr className="text-xs text-purple-300">
                            <th className="p-2 font-semibold text-center">Ref.</th>
                            <th className="p-2 font-semibold text-left">Bahis Bürosu</th>
                            <th className="p-2 font-semibold text-center">Ev Sahibi</th>
                            <th className="p-2 font-semibold text-center">Beraberlik</th>
                            <th className="p-2 font-semibold text-center">Deplasman</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => (
                             <tr key={row.id} className="bg-gray-800 hover:bg-gray-750">
                                <td className="p-2 text-center">
                                    <input 
                                        type="radio"
                                        name="benchmark-radio"
                                        className="form-radio h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                                        checked={row.id === benchmarkRowId}
                                        onChange={() => setBenchmarkRowId(row.id)}
                                    />
                                </td>
                                <td className="p-2"><input type="text" value={row.name} onChange={e => handleUpdateRow(row.id, 'name', e.target.value)} className="w-full bg-gray-700 rounded p-1" /></td>
                                <td className="p-2 text-center">
                                    <input type="number" step="0.01" value={row.home} onChange={e => handleUpdateRow(row.id, 'home', e.target.value)} className="w-24 bg-gray-900 rounded p-1 text-center" />
                                    {renderValue(row, 'home')}
                                </td>
                                <td className="p-2 text-center">
                                    <input type="number" step="0.01" value={row.draw} onChange={e => handleUpdateRow(row.id, 'draw', e.target.value)} className="w-24 bg-gray-900 rounded p-1 text-center" />
                                    {renderValue(row, 'draw')}
                                </td>
                                <td className="p-2 text-center">
                                    <input type="number" step="0.01" value={row.away} onChange={e => handleUpdateRow(row.id, 'away', e.target.value)} className="w-24 bg-gray-900 rounded p-1 text-center" />
                                    {renderValue(row, 'away')}
                                </td>
                                <td className="p-2 text-center"><button onClick={() => handleDeleteRow(row.id)} className="text-red-500 hover:text-red-400 text-xl font-bold">&times;</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <button onClick={handleAddRow} className="mt-4 px-3 py-1 text-xs font-medium text-purple-200 bg-purple-800 hover:bg-purple-700 rounded-md transition-colors">
                    + Bahis Bürosu Ekle
                </button>
            </div>
            {arbitrageResult && (
                <div className={`mt-6 p-4 rounded-lg shadow-inner border ${arbitrageResult.isArbitrage ? 'bg-green-800 bg-opacity-50 border-green-600' : 'bg-red-800 bg-opacity-40 border-red-700'}`}>
                    <div className="flex justify-between items-center mb-4">
                         <h4 className="text-lg font-semibold">{arbitrageResult.isArbitrage ? 'Arbitraj Fırsatı Bulundu!' : 'Arbitraj Fırsatı Yok'}</h4>
                         <div className="text-right">
                             <span className="text-sm block">Garanti Kar</span>
                             <span className={`text-2xl font-bold ${arbitrageResult.isArbitrage ? 'text-green-300' : 'text-red-300'}`}>{arbitrageResult.profitPercentage.toFixed(3)}%</span>
                         </div>
                    </div>
                   
                    {arbitrageResult.isArbitrage && (
                         <>
                         <div className="mb-4">
                            <label htmlFor="total-investment" className="block text-sm font-medium mb-1">Toplam Yatırım</label>
                            <input 
                                id="total-investment"
                                type="number"
                                value={totalInvestment}
                                onChange={(e) => setTotalInvestment(e.target.value)}
                                className="w-full max-w-xs p-2 bg-gray-900 border border-gray-600 rounded-md"
                            />
                         </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="border-b border-gray-600">
                                    <tr>
                                        <th className="p-2">Sonuç</th>
                                        <th className="p-2">En İyi Oran</th>
                                        <th className="p-2">Büro</th>
                                        <th className="p-2">Yatırılacak Miktar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-700">
                                        <td className="p-2">Ev Sahibi</td>
                                        <td className="p-2 font-mono">{arbitrageResult.bestOdds.home.toFixed(2)}</td>
                                        <td className="p-2">{arbitrageResult.bestBookmakers.home}</td>
                                        <td className="p-2 font-mono">{arbitrageResult.stakes.home.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-700">
                                        <td className="p-2">Beraberlik</td>
                                        <td className="p-2 font-mono">{arbitrageResult.bestOdds.draw.toFixed(2)}</td>
                                        <td className="p-2">{arbitrageResult.bestBookmakers.draw}</td>
                                        <td className="p-2 font-mono">{arbitrageResult.stakes.draw.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2">Deplasman</td>
                                        <td className="p-2 font-mono">{arbitrageResult.bestOdds.away.toFixed(2)}</td>
                                        <td className="p-2">{arbitrageResult.bestBookmakers.away}</td>
                                        <td className="p-2 font-mono">{arbitrageResult.stakes.away.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                                <tfoot className="border-t-2 border-gray-500 font-bold">
                                    <tr>
                                        <td className="p-2" colSpan={3}>Toplam Yatırım</td>
                                        <td className="p-2 font-mono">{arbitrageResult.totalStake.toFixed(2)}</td>
                                    </tr>
                                     <tr>
                                        <td className="p-2" colSpan={3}>Garanti Geri Dönüş</td>
                                        <td className="p-2 font-mono text-green-400">{arbitrageResult.guaranteedReturn.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-2" colSpan={3}>Net Kar</td>
                                        <td className="p-2 font-mono text-green-300">{(arbitrageResult.guaranteedReturn - arbitrageResult.totalStake).toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                         </div>
                         </>
                    )}
                </div>
            )}
        </div>
    );
};