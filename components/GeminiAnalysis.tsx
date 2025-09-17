
import React from 'react';

interface GeminiAnalysisProps {
    homeTeam: string | null;
    awayTeam: string | null;
    analysisResult: string | null;
    isAnalysisLoading: boolean;
    analysisError: string | null;
    onGetAnalysis: () => void;
}

const FormattedAnalysis: React.FC<{ text: string }> = ({ text }) => {
    // Basic markdown-like formatting for paragraphs, bold text and list items
    const paragraphs = text.split('\n').map((paragraph, index) => {
        if (paragraph.trim() === '') return null; // Skip empty lines
        
        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
        
        return (
            <p key={index} className="mb-3 text-gray-300">
                {parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="text-purple-300">{part.slice(2, -2)}</strong>;
                    }
                    if (part.trim().startsWith('- ')) {
                       return <span key={i} className="block ml-4 before:content-['•'] before:mr-2">{part.trim().substring(2)}</span>
                    }
                    return part;
                })}
            </p>
        );
    });
    return <>{paragraphs}</>;
};


export const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({
    homeTeam,
    awayTeam,
    analysisResult,
    isAnalysisLoading,
    analysisError,
    onGetAnalysis,
}) => {
    const areTeamsSelected = homeTeam && awayTeam;

    return (
        <div className="mt-8 p-6 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-lg shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-center text-purple-300 mb-4">AI Destekli Maç Analizi</h3>
            
            <button
                onClick={onGetAnalysis}
                disabled={!areTeamsSelected || isAnalysisLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isAnalysisLoading ? 'Analiz Ediliyor...' : 'AI Analizi Oluştur'}
            </button>
            {!areTeamsSelected && <p className="text-xs text-center mt-2 text-gray-500">Analiz için lütfen ev sahibi ve deplasman takımlarını seçin.</p>}

            {isAnalysisLoading && (
                <div className="mt-6 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
                    <p className="ml-3 text-md text-blue-300">Gemini Analiz Hazırlıyor...</p>
                </div>
            )}
            
            {analysisError && (
                <div className="mt-4 p-3 bg-red-700 bg-opacity-50 text-red-100 border border-red-500 rounded-md text-center">
                    {analysisError}
                </div>
            )}

            {analysisResult && !isAnalysisLoading && (
                <div className="mt-6 p-4 bg-gray-900 bg-opacity-50 rounded-lg border border-gray-700">
                     <FormattedAnalysis text={analysisResult} />
                    <p className="text-right text-xs text-gray-500 mt-4">~ Gemini tarafından desteklenmektedir</p>
                </div>
            )}
        </div>
    );
};
