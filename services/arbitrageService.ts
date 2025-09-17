import { BookmakerOddsRow } from '../types';

export interface ArbitrageResult {
    isArbitrage: boolean;
    profitPercentage: number;
    bestOdds: {
        home: number;
        draw: number;
        away: number;
    };
    bestBookmakers: {
        home: string;
        draw: string;
        away: string;
    };
    stakes: {
        home: number;
        draw: number;
        away: number;
    };
    totalStake: number;
    guaranteedReturn: number;
}


export class ArbitrageService {
    calculateArbitrage(rows: BookmakerOddsRow[], totalInvestment: number): ArbitrageResult | null {
        if (rows.length < 1) return null;

        let bestHome = { odds: 0, name: '' };
        let bestDraw = { odds: 0, name: '' };
        let bestAway = { odds: 0, name: '' };

        rows.forEach(row => {
            const homeOdd = parseFloat(row.home);
            const drawOdd = parseFloat(row.draw);
            const awayOdd = parseFloat(row.away);

            if (!isNaN(homeOdd) && homeOdd > bestHome.odds) {
                bestHome = { odds: homeOdd, name: row.name || `Büro ${row.id}` };
            }
            if (!isNaN(drawOdd) && drawOdd > bestDraw.odds) {
                bestDraw = { odds: drawOdd, name: row.name || `Büro ${row.id}` };
            }
            if (!isNaN(awayOdd) && awayOdd > bestAway.odds) {
                bestAway = { odds: awayOdd, name: row.name || `Büro ${row.id}` };
            }
        });

        if (bestHome.odds === 0 || bestDraw.odds === 0 || bestAway.odds === 0) {
            return null;
        }

        const impliedProbHome = 1 / bestHome.odds;
        const impliedProbDraw = 1 / bestDraw.odds;
        const impliedProbAway = 1 / bestAway.odds;

        const totalImpliedProb = impliedProbHome + impliedProbDraw + impliedProbAway;
        
        const isArbitrage = totalImpliedProb < 1;

        if (!isArbitrage) {
             return {
                isArbitrage: false,
                profitPercentage: (1 - totalImpliedProb) * 100, // Negative profit
                bestOdds: { home: bestHome.odds, draw: bestDraw.odds, away: bestAway.odds },
                bestBookmakers: { home: bestHome.name, draw: bestDraw.name, away: bestAway.name },
                stakes: { home: 0, draw: 0, away: 0 },
                totalStake: 0,
                guaranteedReturn: 0
            };
        }

        const profitPercentage = (1 - totalImpliedProb) * 100;

        const stakeHome = (impliedProbHome / totalImpliedProb) * totalInvestment;
        const stakeDraw = (impliedProbDraw / totalImpliedProb) * totalInvestment;
        const stakeAway = (impliedProbAway / totalImpliedProb) * totalInvestment;
        
        const totalStake = stakeHome + stakeDraw + stakeAway;
        const guaranteedReturn = stakeHome * bestHome.odds; // Return is same for all outcomes

        return {
            isArbitrage,
            profitPercentage,
            bestOdds: { home: bestHome.odds, draw: bestDraw.odds, away: bestAway.odds },
            bestBookmakers: { home: bestHome.name, draw: bestDraw.name, away: bestAway.name },
            stakes: { home: stakeHome, draw: stakeDraw, away: stakeAway },
            totalStake,
            guaranteedReturn
        };
    }
}
