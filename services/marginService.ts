import { TrueOdds, MarginModels, OutcomeDetail } from '../types';

// No need to re-export as these are already exported from types.ts

// Bisection method to find the root of a function
const bisect = (fn: (x: number) => number, a: number, b: number, epsilon = 1e-9, maxIter = 100): number => {
    let mid = a;
    for (let i = 0; i < maxIter; i++) {
        mid = (a + b) / 2;
        const fnMid = fn(mid);
        if (Math.abs(fnMid) < epsilon) {
            return mid;
        }
        if (fn(a) * fnMid < 0) {
            b = mid;
        } else {
            a = mid;
        }
    }
    return mid; // Return best guess
};


export class MarginService {
    calculateOverround(h: number, d: number, a: number): number {
        return (1 / h) + (1 / d) + (1 / a);
    }

    removeMargin(h: number, d: number, a: number): MarginModels {
        const overround = this.calculateOverround(h, d, a);

        return {
            equalMargin: this.equalMarginModel(h, d, a, overround),
            proportionalMargin: this.additiveMarginModel(h, d, a, overround),
            oddsRatio: this.oddsRatioModel(h, d, a, overround),
            logarithmic: this.logarithmicModel(h, d, a, overround),
        };
    }
    
    private equalMarginModel(h: number, d: number, a: number, overround: number): TrueOdds {
        const homeOdds = h * overround;
        const drawOdds = d * overround;
        const awayOdds = a * overround;
        return {
            home: { odds: homeOdds, prob: 1 / homeOdds },
            draw: { odds: drawOdds, prob: 1 / drawOdds },
            away: { odds: awayOdds, prob: 1 / awayOdds },
        };
    }
    
    private additiveMarginModel(h: number, d: number, a: number, overround: number): TrueOdds {
        const margin = overround - 1;
        const marginPerOutcome = margin / 3;
        const probH = 1/h - marginPerOutcome;
        const probD = 1/d - marginPerOutcome;
        const probA = 1/a - marginPerOutcome;

        const homeOdds = probH > 0 ? 1 / probH : null;
        const drawOdds = probD > 0 ? 1 / probD : null;
        const awayOdds = probA > 0 ? 1 / probA : null;

        return {
            home: { odds: homeOdds, prob: homeOdds ? probH : null },
            draw: { odds: drawOdds, prob: drawOdds ? probD : null },
            away: { odds: awayOdds, prob: awayOdds ? probA : null },
        };
    }

    private oddsRatioModel(h: number, d: number, a: number, overround: number): TrueOdds {
        const fn = (c: number) => {
           const val = (c * (1/h)) / (1 - (1/h) + c * (1/h)) + 
                   (c * (1/d)) / (1 - (1/d) + c * (1/d)) +
                   (c * (1/a)) / (1 - (1/a) + c * (1/a));
           return val - 1;
        }
        const c = bisect(fn, 0.01, 5.0);
        
        const probH = (c * (1/h)) / (1 - (1/h) + c * (1/h));
        const probD = (c * (1/d)) / (1 - (1/d) + c * (1/d));
        const probA = (c * (1/a)) / (1 - (1/a) + c * (1/a));
        
        return {
            home: { odds: probH > 0 ? 1 / probH : null, prob: probH > 0 ? probH : null },
            draw: { odds: probD > 0 ? 1 / probD : null, prob: probD > 0 ? probD : null },
            away: { odds: probA > 0 ? 1 / probA : null, prob: probA > 0 ? probA : null },
        }
    }

    private logarithmicModel(h: number, d: number, a: number, overround: number): TrueOdds {
        const probH_implied = 1 / h;
        const probD_implied = 1 / d;
        const probA_implied = 1 / a;

        const fn = (k: number) => Math.pow(probH_implied, k) + Math.pow(probD_implied, k) + Math.pow(probA_implied, k) - 1;
        
        const k = bisect(fn, 0.5, 2.0);

        const probH = Math.pow(probH_implied, k);
        const probD = Math.pow(probD_implied, k);
        const probA = Math.pow(probA_implied, k);

        return {
            home: { odds: probH > 0 ? 1 / probH : null, prob: probH > 0 ? probH : null },
            draw: { odds: probD > 0 ? 1 / probD : null, prob: probD > 0 ? probD : null },
            away: { odds: probA > 0 ? 1 / probA : null, prob: probA > 0 ? probA : null },
        };
    }
}