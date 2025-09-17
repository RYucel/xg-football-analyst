
import React from 'react';

interface InputFormProps {
  homeXG: string;
  setHomeXG: (value: string) => void;
  awayXG: string;
  setAwayXG: (value: string) => void;
  displayAsPercentage: boolean;
  setDisplayAsPercentage: (value: boolean) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  homeXG,
  setHomeXG,
  awayXG,
  setAwayXG,
  displayAsPercentage,
  setDisplayAsPercentage,
  onCalculate,
  isLoading,
}) => {
  const inputClasses = "w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-100 placeholder-gray-400";
  const labelClasses = "block mb-2 text-sm font-medium text-purple-300";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="homeXG" className={labelClasses}>
            Ev Sahibi Takım Gol Beklentisi (xG)
          </label>
          <input
            type="number"
            id="homeXG"
            value={homeXG}
            onChange={(e) => setHomeXG(e.target.value)}
            placeholder="örn. 1.65"
            className={inputClasses}
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="awayXG" className={labelClasses}>
            Deplasman Takımı Gol Beklentisi (xG)
          </label>
          <input
            type="number"
            id="awayXG"
            value={awayXG}
            onChange={(e) => setAwayXG(e.target.value)}
            placeholder="örn. 1.23"
            className={inputClasses}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="displayPercentage" className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="displayPercentage"
            checked={displayAsPercentage}
            onChange={(e) => setDisplayAsPercentage(e.target.checked)}
            className="form-checkbox h-5 w-5 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-600 focus:ring-offset-gray-800"
          />
          <span className="ml-3 text-sm text-gray-300">Yüzde olarak göster (Oran yerine)</span>
        </label>
      </div>

      <button
        onClick={onCalculate}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Hesaplanıyor...
          </>
        ) : (
          'Olasılıkları Hesapla'
        )}
      </button>
    </div>
  );
};
