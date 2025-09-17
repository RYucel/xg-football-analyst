import React, { useState } from 'react';
import { CSVTeamData, AdminPanelProps } from '../types';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onDataImport }) => {
    const [selectedLeague, setSelectedLeague] = useState<string>('superLig');
    const [csvData, setCsvData] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

    const leagues = [
        { key: 'superLig', name: 'Türkiye Süper Ligi' },
        { key: 'premierLeague', name: 'İngiltere Premier Ligi' },
        { key: 'laLiga', name: 'İspanya La Liga' },
        { key: 'serieA', name: 'İtalya Serie A' },
        { key: 'bundesliga', name: 'Almanya Bundesliga' }
    ];

    const parseCsvData = (csvText: string): CSVTeamData[] => {
        const lines = csvText.trim().split('\n');
        const data: CSVTeamData[] = [];
        
        // Skip header line if it exists
        const startIndex = lines[0].toLowerCase().includes('rank') || lines[0].toLowerCase().includes('sıra') ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
            
            if (columns.length < 7) {
                throw new Error(`Satır ${i + 1}: En az 7 sütun gerekli (rank,name,mp,xG,xGA,xGD,elo)`);
            }
            
            const teamData: CSVTeamData = {
                rank: parseInt(columns[0]),
                name: columns[1],
                mp: parseInt(columns[2]),
                xG: parseFloat(columns[3]),
                xGA: parseFloat(columns[4]),
                xGD: parseFloat(columns[5]),
                elo: parseFloat(columns[6])
            };
            
            // Validate data
            if (isNaN(teamData.rank) || isNaN(teamData.mp) || isNaN(teamData.xG) || 
                isNaN(teamData.xGA) || isNaN(teamData.xGD) || isNaN(teamData.elo)) {
                throw new Error(`Satır ${i + 1}: Geçersiz sayısal değer`);
            }
            
            if (!teamData.name) {
                throw new Error(`Satır ${i + 1}: Takım adı boş olamaz`);
            }
            
            data.push(teamData);
        }
        
        return data;
    };


    const handleImport = async () => {
        if (!csvData.trim()) {
            setMessage('Lütfen CSV verisi girin.');
            setMessageType('error');
            return;
        }
        
        setIsProcessing(true);
        setMessage('');
        
        try {
            const parsedData = parseCsvData(csvData);
            
            if (parsedData.length === 0) {
                throw new Error('CSV dosyasında geçerli veri bulunamadı.');
            }
            
            onDataImport(selectedLeague, parsedData);
            
            setMessage(`${parsedData.length} takım verisi başarıyla yüklendi.`);
            setMessageType('success');
            setCsvData('');
            
        } catch (error) {
            setMessage(`Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
            setMessageType('error');
        } finally {
            setIsProcessing(false);
        }
    };

    const csvExample = `rank,name,mp,xG,xGA,xGD,elo
1,"Galatasaray",30,2.1,0.8,1.3,1850
2,"Fenerbahçe",30,1.9,0.9,1.0,1820
3,"Beşiktaş",30,1.7,1.1,0.6,1780`;

    return (
        <div className="mt-8 p-4 sm:p-6 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-purple-300 mb-2">Admin Paneli - Veri Yükleme</h3>
                <p className="text-sm text-gray-400">CSV formatında lig verilerini yükleyebilirsiniz.</p>
            </div>

            {/* League Selection */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Lig Seçin</label>
                <select
                    value={selectedLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                    className="w-full md:w-1/2 bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                    {leagues.map(league => (
                        <option key={league.key} value={league.key}>{league.name}</option>
                    ))}
                </select>
            </div>

            {/* CSV Data Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">CSV Verisi</label>
                <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    placeholder={`CSV formatında veri girin:\n\n${csvExample}`}
                    className="w-full h-40 bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white font-mono text-sm"
                    disabled={isProcessing}
                />
            </div>

            {/* CSV Format Info */}
            <div className="mb-4 p-3 bg-blue-900 bg-opacity-30 rounded-md border border-blue-700">
                <h4 className="text-sm font-medium text-blue-300 mb-2">CSV Format Bilgisi</h4>
                <p className="text-xs text-blue-200 mb-2">Sütun sırası: rank,name,mp,xG,xGA,xGD,elo</p>
                <div className="text-xs text-blue-200">
                    <p><strong>rank:</strong> Sıralama (sayı)</p>
                    <p><strong>name:</strong> Takım adı (metin)</p>
                    <p><strong>mp:</strong> Oynanan maç sayısı (sayı)</p>
                    <p><strong>xG:</strong> Beklenen gol (ondalık sayı)</p>
                    <p><strong>xGA:</strong> Beklenen gol yenilme (ondalık sayı)</p>
                    <p><strong>xGD:</strong> Beklenen gol farkı (ondalık sayı)</p>
                    <p><strong>elo:</strong> Elo puanı (sayı)</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
                <button
                    onClick={handleImport}
                    disabled={isProcessing || !csvData.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                >
                    {isProcessing ? 'Yükleniyor...' : 'Veriyi Yükle'}
                </button>
                <button
                    onClick={() => setCsvData(csvExample)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                    Örnek Veri
                </button>
                <button
                    onClick={() => setCsvData('')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                    Temizle
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-3 rounded-md ${
                    messageType === 'success' 
                        ? 'bg-green-900 bg-opacity-30 border border-green-700 text-green-300'
                        : 'bg-red-900 bg-opacity-30 border border-red-700 text-red-300'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
};