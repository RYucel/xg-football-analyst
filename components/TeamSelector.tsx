import React from 'react';
import { TeamStat } from '../types';

interface TeamSelectorProps {
  teams: TeamStat[];
  selectedHomeTeamName: string | null;
  setSelectedHomeTeamName: (name: string | null) => void;
  selectedAwayTeamName: string | null;
  setSelectedAwayTeamName: (name: string | null) => void;
  leagueName: string;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  selectedHomeTeamName,
  setSelectedHomeTeamName,
  selectedAwayTeamName,
  setSelectedAwayTeamName,
  leagueName,
}) => {
  const selectClasses = "w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors text-gray-100";
  const labelClasses = "block mb-2 text-sm font-medium text-purple-300";

  const handleTeamSelect = (
    event: React.ChangeEvent<HTMLSelectElement>,
    isHomeTeam: boolean
  ) => {
    const teamName = event.target.value;
    if (teamName === "") {
      if (isHomeTeam) {
        setSelectedHomeTeamName(null);
      } else {
        setSelectedAwayTeamName(null);
      }
      return;
    }
    
    const selectedTeam = teams.find(team => team.name === teamName);

    if (isHomeTeam) {
      setSelectedHomeTeamName(selectedTeam ? selectedTeam.name : null);
    } else {
      setSelectedAwayTeamName(selectedTeam ? selectedTeam.name : null);
    }
  };

  return (
    <div className="p-6 bg-gray-850 bg-opacity-70 rounded-lg shadow-md border border-gray-700">
      <h3 className="text-lg font-semibold text-purple-300 mb-4 text-center">
        Takım Seçimi ({leagueName})
      </h3>
      <p className="text-xs text-gray-400 text-center mb-4">
        Takım seçimi xG ve Elo değerlerini otomatik olarak doldurur.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="homeTeamSelect" className={labelClasses}>
            Ev Sahibi Takımı Seçin
          </label>
          <select
            id="homeTeamSelect"
            value={selectedHomeTeamName || ""}
            onChange={(e) => handleTeamSelect(e, true)}
            className={selectClasses}
            disabled={teams.length === 0}
          >
            <option value="">-- Ev Sahibi Takım Seçiniz --</option>
            {teams.map((team) => (
              <option key={`${team.name}-home-${leagueName}`} value={team.name}>
                {team.name} (xG: {team.xG}, xGA: {team.xGA}, Elo: {team.elo || 'N/A'})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="awayTeamSelect" className={labelClasses}>
            Deplasman Takımını Seçin
          </label>
          <select
            id="awayTeamSelect"
            value={selectedAwayTeamName || ""}
            onChange={(e) => handleTeamSelect(e, false)}
            className={selectClasses}
            disabled={teams.length === 0}
          >
            <option value="">-- Deplasman Takımı Seçiniz --</option>
            {teams.map((team) => (
              <option key={`${team.name}-away-${leagueName}`} value={team.name}>
                {team.name} (xG: {team.xG}, xGA: {team.xGA}, Elo: {team.elo || 'N/A'})
              </option>
            ))}
          </select>
        </div>
      </div>
       {teams.length === 0 && (
        <p className="text-xs text-yellow-400 text-center mt-2">
          Bu lig için takım verisi bulunamadı veya yükleniyor.
        </p>
      )}
    </div>
  );
};