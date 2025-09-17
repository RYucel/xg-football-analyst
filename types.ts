export interface FullTimeResultProbs {
  homeWinProb: number;
  awayWinProb: number;
  drawProb: number;
}

export interface OverUnderProbs {
  threshold: number;
  overProb: number;
  underProb: number;
}

export interface CleanSheetProbs {
  homeCleanSheetProb: number;
  awayCleanSheetProb: number;
}

export interface BttsProbs {
  yesProb: number;
  noProb: number;
}

export interface CorrectScoreProbs {
  prob: number;
  homeGoals: number;
  awayGoals: number;
}

// Represents the probability of specific goal counts for a team
// Index is the number of goals, value is the probability. E.g., teamGoalProbs[2] is P(team scores 2 goals)
export type TeamGoalProbabilities = number[];

export interface CalculationResults {
  fullTimeResult: FullTimeResultProbs;
  overUnder: OverUnderProbs[];
  cleanSheet: CleanSheetProbs;
  btts: BttsProbs;
  correctScores: CorrectScoreProbs[][]; // Matrix [homeGoals 0-4][awayGoals 0-4]
}

export interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export interface TabsProps {
  children: import('react').ReactNode;
}

export enum ActiveTab {
  FULL_TIME = 'Maç Sonucu',
  OVER_UNDER = 'Alt/Üst',
  CORRECT_SCORE = 'Kesin Skor',
  BTTS = 'KG Var/Yok', // Karşılıklı Gol
  CLEAN_SHEET = 'Kalesini Gole Kapatma', // Clean Sheet
}

export type HistoricalMatchOutcome = 'W' | 'D' | 'L';

export interface HistoricalMatch {
  result: HistoricalMatchOutcome;
  fairOdds: number;
}

export interface TeamStat {
  rank: number;
  name: string;
  mp: number; // Matches Played
  xG: number; // Expected Goals For
  xGA: number; // Expected Goals Against
  xGD: number; // Expected Goal Difference
  gf?: number; // Goals For (actual) - Optional
  ga?: number; // Goals Against (actual) - Optional
  xGvsActual?: number; // xG vs Actual Difference - Optional
  elo?: number; // Elo rating - Optional
  matchHistory?: HistoricalMatch[]; // Added for Contrarian Betting System
}

export type League = 'superLig' | 'premierLeague' | 'laLiga' | 'serieA' | 'bundesliga';

export interface LeagueConfig {
  key: string;
  name: string;
  data: TeamStat[];
  imageUrl: string; // Added for league logo
}

// Defines the structure for storing multiple leagues' data
export interface LeagueData {
  [key: string]: LeagueConfig;
}

export type ActiveMainTab = 'analysis' | 'bets' | 'tools';
export type ActiveAnalysisTab = 'xg' | 'elo' | 'contrarian';
export type ActiveToolTab = 'margin' | 'arbitrage' | 'admin';


export interface LoggedBet {
    id: string;
    date: string;
    leagueName: string;
    homeTeam: string;
    awayTeam: string;
    market: string; // e.g., "Home Win", "Over 2.5"
    stake: number;
    odds: number;
    appProb: number;
    closingOdds?: number;
    clv?: number; // Closing Line Value
    status: 'pending' | 'won' | 'lost' | 'void';
    kellyRecommendation?: number; // Store the % recommendation
    result?: 'won' | 'lost' | 'void'; // Manual result entry
    profit?: number; // Calculated profit/loss
}

// Bet Statistics by League
export interface LeagueBetStats {
    leagueName: string;
    totalBets: number;
    wonBets: number;
    lostBets: number;
    voidBets: number;
    totalStake: number;
    totalProfit: number;
    winRate: number;
    roi: number; // Return on Investment
}

// CSV Data Import Interface
export interface CSVTeamData {
    rank: number;
    name: string;
    mp: number;
    xG: number;
    xGA: number;
    xGD: number;
    elo: number;
}

// Admin Panel Interface
export interface AdminPanelProps {
    onDataImport: (leagueKey: string, data: CSVTeamData[]) => void;
}

// Types for TrueOddsCalculator
export interface OutcomeDetail {
    odds: number | null;
    prob: number | null;
}

export interface TrueOdds {
    home: OutcomeDetail;
    draw: OutcomeDetail;
    away: OutcomeDetail;
}

export interface MarginModels {
    equalMargin: TrueOdds;
    proportionalMargin: TrueOdds;
    oddsRatio: TrueOdds;
    logarithmic: TrueOdds;
}

// Types for ArbitrageCalculator
export interface BookmakerOddsRow {
    id: number;
    name: string;
    home: string;
    draw: string;
    away: string;
}