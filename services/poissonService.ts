
import { CalculationResults, FullTimeResultProbs, OverUnderProbs, CleanSheetProbs, BttsProbs, CorrectScoreProbs, TeamGoalProbabilities } from '../types';

const MAX_GOALS_FOR_SUMMATION = 15; // Max goals to consider for sum calculations (like win/draw/loss, over/under)
const MAX_GOALS_FOR_MATRIX = 4; // Max goals for each team in the correct score matrix (0-4)

// No need to re-export CalculationResults as it's already exported from types.ts

export class PoissonService {
  private memoizedFactorials: { [key: number]: number } = { 0: 1, 1: 1 };

  private factorial(n: number): number {
    if (n < 0) throw new Error("Factorial is not defined for negative numbers.");
    if (this.memoizedFactorials[n] !== undefined) {
      return this.memoizedFactorials[n];
    }
    let result = this.memoizedFactorials[n - 1] * n;
    this.memoizedFactorials[n] = result;
    return result;
  }

  public poissonProbability(lambda: number, k: number): number {
    if (lambda < 0) return 0; // Or throw error, xG shouldn't be negative
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  private calculateTeamGoalProbabilities(lambda: number, maxGoals: number): TeamGoalProbabilities {
    const probs: TeamGoalProbabilities = [];
    for (let k = 0; k <= maxGoals; k++) {
      probs.push(this.poissonProbability(lambda, k));
    }
    return probs;
  }

  public calculateAllProbabilities(homeXG: number, awayXG: number): CalculationResults {
    const homeTeamProbs = this.calculateTeamGoalProbabilities(homeXG, MAX_GOALS_FOR_SUMMATION);
    const awayTeamProbs = this.calculateTeamGoalProbabilities(awayXG, MAX_GOALS_FOR_SUMMATION);

    const fullTimeResult = this.calculateFullTimeResultProbs(homeTeamProbs, awayTeamProbs);
    const overUnder = this.calculateOverUnderProbs(homeTeamProbs, awayTeamProbs);
    const cleanSheet = this.calculateCleanSheetProbs(homeTeamProbs[0], awayTeamProbs[0]);
    const btts = this.calculateBttsProbs(homeTeamProbs[0], awayTeamProbs[0]);
    const correctScores = this.calculateCorrectScoreProbs(homeTeamProbs, awayTeamProbs);
    
    this.memoizedFactorials = {0:1, 1:1}; // Clear memoization cache for factorials if needed, or keep it if class instance persists

    return {
      fullTimeResult,
      overUnder,
      cleanSheet,
      btts,
      correctScores,
    };
  }

  private calculateFullTimeResultProbs(homeTeamProbs: TeamGoalProbabilities, awayTeamProbs: TeamGoalProbabilities): FullTimeResultProbs {
    let homeWinProb = 0;
    let awayWinProb = 0;
    let drawProb = 0;

    for (let i = 0; i <= MAX_GOALS_FOR_SUMMATION; i++) {
      for (let j = 0; j <= MAX_GOALS_FOR_SUMMATION; j++) {
        const probScore = homeTeamProbs[i] * awayTeamProbs[j];
        if (i > j) homeWinProb += probScore;
        else if (j > i) awayWinProb += probScore;
        else drawProb += probScore;
      }
    }
    // Normalize to ensure sum is 1, handles tiny floating point inaccuracies or truncated MAX_GOALS_FOR_SUMMATION
    const totalProb = homeWinProb + awayWinProb + drawProb;
    if (totalProb > 0 && totalProb < 1) { // Only normalize if sum is slightly off but positive
        homeWinProb /= totalProb;
        awayWinProb /= totalProb;
        drawProb /= totalProb;
    }

    return { homeWinProb, awayWinProb, drawProb };
  }

  private calculateOverUnderProbs(homeTeamProbs: TeamGoalProbabilities, awayTeamProbs: TeamGoalProbabilities): OverUnderProbs[] {
    const thresholds = [0.5, 1.5, 2.5, 3.5, 4.5];
    const results: OverUnderProbs[] = [];

    const totalGoalProbs: { [totalGoals: number]: number } = {};
    for (let i = 0; i <= MAX_GOALS_FOR_SUMMATION; i++) {
      for (let j = 0; j <= MAX_GOALS_FOR_SUMMATION; j++) {
        const total = i + j;
        const probScore = homeTeamProbs[i] * awayTeamProbs[j];
        totalGoalProbs[total] = (totalGoalProbs[total] || 0) + probScore;
      }
    }
    
    thresholds.forEach(threshold => {
      let overProb = 0;
      let underProb = 0;
      for (const goals in totalGoalProbs) {
        const numGoals = parseInt(goals, 10);
        if (numGoals > threshold) { // e.g., for 2.5, goals >= 3
          overProb += totalGoalProbs[numGoals];
        } else { // e.g., for 2.5, goals <= 2
          underProb += totalGoalProbs[numGoals];
        }
      }
      results.push({ threshold, overProb, underProb });
    });

    return results;
  }

  private calculateCleanSheetProbs(homeProb0Goals: number, awayProb0Goals: number): CleanSheetProbs {
    // P(Home Clean Sheet) = P(Away scores 0 goals)
    // P(Away Clean Sheet) = P(Home scores 0 goals)
    return {
      homeCleanSheetProb: awayProb0Goals,
      awayCleanSheetProb: homeProb0Goals,
    };
  }

  private calculateBttsProbs(homeProb0Goals: number, awayProb0Goals: number): BttsProbs {
    // P(BTTS Yes) = (1 - P(Home scores 0)) * (1 - P(Away scores 0))
    const bttsYesProb = (1 - homeProb0Goals) * (1 - awayProb0Goals);
    return {
      yesProb: bttsYesProb,
      noProb: 1 - bttsYesProb,
    };
  }

  private calculateCorrectScoreProbs(homeTeamProbs: TeamGoalProbabilities, awayTeamProbs: TeamGoalProbabilities): CorrectScoreProbs[][] {
    const matrix: CorrectScoreProbs[][] = [];
    for (let i = 0; i <= MAX_GOALS_FOR_MATRIX; i++) {
      matrix[i] = [];
      for (let j = 0; j <= MAX_GOALS_FOR_MATRIX; j++) {
        matrix[i][j] = {
          prob: homeTeamProbs[i] * awayTeamProbs[j],
          homeGoals: i,
          awayGoals: j,
        };
      }
    }
    return matrix;
  }
}
