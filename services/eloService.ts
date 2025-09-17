import { FullTimeResultProbs } from '../types';

const HOME_FIELD_ADVANTAGE = 65; // Common value for home field advantage in Elo points

export class EloService {
  /**
   * Calculates win/draw/loss probabilities based on team Elo ratings.
   * This model first calculates the two-way win probability using the standard Elo formula,
   * then estimates the draw probability based on the rating difference, and finally
   * distributes the remaining probability for wins.
   * @param homeElo - The Elo rating of the home team.
   * @param awayElo - The Elo rating of the away team.
   * @returns An object with homeWinProb, awayWinProb, and drawProb.
   */
  public calculateEloProbabilities(homeElo: number, awayElo: number): FullTimeResultProbs {
    const diff = (homeElo + HOME_FIELD_ADVANTAGE) - awayElo;

    // A model for draw probability that decreases as the Elo difference increases.
    // Constants are empirically derived approximations. d0 = max draw prob, c = decay rate.
    const d0 = 0.32; // Max draw probability when diff is 0
    const c = 0.000012; // Controls how fast draw prob drops
    const drawProb = d0 * Math.exp(-c * diff * diff);

    // Standard Elo formula for 2-way outcome (win/lose, no draw)
    const homeWinProbTwoWay = 1 / (1 + Math.pow(10, -diff / 400));
    
    // Distribute the remaining probability (1 - drawProb) according to the 2-way probabilities
    const homeWinProb = homeWinProbTwoWay * (1 - drawProb);
    const awayWinProb = (1 - homeWinProbTwoWay) * (1 - drawProb);
    
    // Normalize to be safe, although it should be very close to 1
    const total = homeWinProb + awayWinProb + drawProb;
    return {
      homeWinProb: homeWinProb / total,
      awayWinProb: awayWinProb / total,
      drawProb: drawProb / total,
    };
  }
}
