
import React, { useState, useMemo } from 'react';
import { MarginService } from '../services/marginService';
import { MarginModels, OutcomeDetail } from '../types';

interface OddsRow {
    id: number;
    home: string;
    draw: string;
    away: string;
}

const marginService = new MarginService();

const OddsRowComponent: React.FC<{
    row: OddsRow;
    onUpdate: (id: number, field: keyof OddsRow, value: string) => void;
    onDelete: (id: number) => void;
}> = ({ row, onUpdate, onDelete }) => {
    
    const results = useMemo<({ margin: string; models: MarginModels }) | null>(() => {
        const homeNum = parseFloat(row.home);
        const drawNum = parseFloat(row.draw);
        const awayNum = parseFloat(row.away);

        if (!isNaN(homeNum) && !isNaN(drawNum) && !isNaN(awayNum) && homeNum > 1 && drawNum > 1 && awayNum > 1) {
            const overround = marginService.calculateOverround(homeNum, drawNum, awayNum);
            const margin = ((overround - 1) * 100).toFixed(2) + '%';
            const models = marginService.removeMargin(homeNum, drawNum, awayNum);
            return { margin, models };
        }
        return null;
    }, [row.home, row.draw, row.away]);

    const renderResultCell = (detail: OutcomeDetail | null | undefined, addBorder: boolean = false) => {
        const content = detail && detail.odds !== null ? (
            <div className="flex flex-col leading-tight">
                <span className="font-semibold text-gray-100">{detail.odds.toFixed(3)}</span>
                <span className="text-xs text-gray-400">
                    {detail.prob ? `(${(detail.prob * 100).toFixed(2)}%)` : ''}
                </span>
            </div>
        ) : '-';

        return (
            <td className={`p-2 text-center ${addBorder ? 'border-r border-gray-700' : ''}`}>
                {content}
            </td>
        );
    };


    return (
        <tr className="bg-gray-800 hover:bg-gray-750 transition-colors">
            {/* Inputs */}
            <td className="p-2 border-r border-gray-700"><input type="number" value={row.home} onChange={e => onUpdate(row.id, 'home', e.target.value)} className="w-20 bg-gray-900 rounded p-1 text-center" /></td>
            <td className="p-2 border-r border-gray-700"><input type="number" value={row.draw} onChange={e => onUpdate(row.id, 'draw', e.target.value)} className="w-20 bg-gray-900 rounded p-1 text-center" /></td>
            <td className="p-2 border-r border-gray-700"><input type="number" value={row.away} onChange={e => onUpdate(row.id, 'away', e.target.value)} className="w-20 bg-gray-900 rounded p-1 text-center" /></td>
            <td className="p-2 border-r-2 border-gray-700 text-center">{results?.margin || '-'}</td>
            
            {/* Results */}
            {renderResultCell(results?.models.equalMargin.home)}
            {renderResultCell(results?.models.equalMargin.draw)}
            {renderResultCell(results?.models.equalMargin.away, true)}
            
            {renderResultCell(results?.models.proportionalMargin.home)}
            {renderResultCell(results?.models.proportionalMargin.draw)}
            {renderResultCell(results?.models.proportionalMargin.away, true)}

            {renderResultCell(results?.models.oddsRatio.home)}
            {renderResultCell(results?.models.oddsRatio.draw)}
            {renderResultCell(results?.models.oddsRatio.away, true)}
            
            {renderResultCell(results?.models.logarithmic.home)}
            {renderResultCell(results?.models.logarithmic.draw)}
            {renderResultCell(results?.models.logarithmic.away)}
            
            <td className="p-2 text-center"><button onClick={() => onDelete(row.id)} className="text-red-500 hover:text-red-400">&times;</button></td>
        </tr>
    );
};

export const MarginCalculator: React.FC = () => {
    const [rows, setRows] = useState<OddsRow[]>([{ id: 1, home: '', draw: '', away: '' }]);

    const handleUpdateRow = (id: number, field: keyof OddsRow, value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleAddRow = () => {
        setRows([...rows, { id: Date.now(), home: '', draw: '', away: '' }]);
    };
    
    const handleDeleteRow = (id: number) => {
        if (rows.length > 1) {
            setRows(rows.filter(row => row.id !== id));
        }
    };

    const renderHeaderCell = (modelName: string) => (
        <th colSpan={3} className="p-2 border-b-2 border-r-2 border-gray-700 font-semibold">
            <div className="flex flex-col leading-tight">
                <span>{modelName}</span>
                <span className="text-xs font-normal text-gray-400">(Oran / Olasılık)</span>
            </div>
        </th>
    );


    return (
        <div className="mt-8 p-4 sm:p-6 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-center text-purple-300 mb-2">Gerçek Oran Hesaplayıcısı</h3>
            <p className="text-xs text-gray-400 text-center mb-4">Bahis bürosu oranlarındaki marjı kaldırarak farklı modellere göre 'gerçek' oranları görün.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-purple-300">
                            <th colSpan={4} className="p-2 border-b-2 border-r-2 border-gray-700 font-semibold">Bahis Bürosu Oranları</th>
                            {renderHeaderCell('Eşit Marj (Tarafsız)')}
                            {renderHeaderCell('Oranlarla Orantılı Marj')}
                            {renderHeaderCell('Oran Oranı')}
                            <th colSpan={3} className="p-2 border-b-2 border-gray-700 font-semibold">
                                <div className="flex flex-col leading-tight">
                                    <span>Logaritmik Fonksiyon</span>
                                    <span className="text-xs font-normal text-gray-400">(Oran / Olasılık)</span>
                                </div>
                            </th>
                            <th className="p-2 border-b-2 border-gray-700"></th>
                        </tr>
                        <tr className="text-xs text-gray-400">
                            <th className="p-2 font-normal border-r border-gray-700">Ev</th>
                            <th className="p-2 font-normal border-r border-gray-700">Ber.</th>
                            <th className="p-2 font-normal border-r border-gray-700">Dep.</th>
                            <th className="p-2 font-normal border-r-2 border-gray-700">Marj</th>
                            
                            <th className="p-2 font-normal">Ev</th>
                            <th className="p-2 font-normal">Ber.</th>
                            <th className="p-2 font-normal border-r-2 border-gray-700">Dep.</th>

                            <th className="p-2 font-normal">Ev</th>
                            <th className="p-2 font-normal">Ber.</th>
                            <th className="p-2 font-normal border-r-2 border-gray-700">Dep.</th>
                            
                            <th className="p-2 font-normal">Ev</th>
                            <th className="p-2 font-normal">Ber.</th>
                            <th className="p-2 font-normal border-r-2 border-gray-700">Dep.</th>

                            <th className="p-2 font-normal">Ev</th>
                            <th className="p-2 font-normal">Ber.</th>
                            <th className="p-2 font-normal">Dep.</th>
                            <th className="p-2 font-normal">Sil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => (
                            <OddsRowComponent key={row.id} row={row} onUpdate={handleUpdateRow} onDelete={handleDeleteRow} />
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={handleAddRow} className="mt-4 px-3 py-1 text-xs font-medium text-purple-200 bg-purple-800 hover:bg-purple-700 rounded-md transition-colors">
                + Satır Ekle
            </button>
        </div>
    );
};