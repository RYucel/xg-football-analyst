import { TeamStat, HistoricalMatchOutcome } from '../types';

export interface ContrarianAnalysisResult {
    homeTeamRating: number;
    awayTeamRating: number;
    matchRating: number;
    signal: string;
    signalStrength: 'strong' | 'weak' | 'none';
}

export class ContrarianService {
    
    private calculateTeamRating(team: TeamStat | undefined): number {
        if (!team || !team.matchHistory || team.matchHistory.length === 0) {
            return 0;
        }

        let finalRating = 0;
        // Using the logic from "The Contrarian Betting System": score is [1-1/odds] for win, and [-1/odds] for loss/draw.
        team.matchHistory.forEach(match => {
            if (match.result === 'W') {
                finalRating += (1 - 1 / match.fairOdds);
            } else { // Loss or Draw
                finalRating += (-1 / match.fairOdds);
            }
        });

        return finalRating;
    }

    public getAnalysis(homeTeam: TeamStat | undefined, awayTeam: TeamStat | undefined): ContrarianAnalysisResult {
        const homeTeamRating = this.calculateTeamRating(homeTeam);
        const awayTeamRating = this.calculateTeamRating(awayTeam);
        
        // Match rating is the difference between the two teams' ratings
        const matchRating = homeTeamRating - awayTeamRating;

        let signal = "Sinyal Yok: Piyasa bu maç için dengeli görünüyor.";
        let signalStrength: 'strong' | 'weak' | 'none' = 'none';

        // Based on the document's findings, returns improve for colder teams up to a point.
        // Match ratings < -3 showed the strongest profitable yields.
        if (matchRating < -3) {
            signal = `SİSTEM SİNYALİ: ${homeTeam?.name} (Aykırı Bahis Fırsatı)`;
            signalStrength = 'strong';
        } else if (matchRating > 3) {
            signal = `SİSTEM SİNYALİ: ${awayTeam?.name} (Aykırı Bahis Fırsatı)`;
            signalStrength = 'strong';
        } else if (matchRating < 0 && matchRating >= -3) {
            signal = `Potansiyel Sinyal: ${homeTeam?.name} piyasa beklentisinin altında ('soğuk').`;
             signalStrength = 'weak';
        } else if (matchRating > 0 && matchRating <= 3) {
            signal = `Potansiyel Sinyal: ${awayTeam?.name} piyasa beklentisinin altında ('soğuk').`;
             signalStrength = 'weak';
        }

        return {
            homeTeamRating,
            awayTeamRating,
            matchRating,
            signal,
            signalStrength,
        };
    }
}