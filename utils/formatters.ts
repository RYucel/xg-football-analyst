
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatDecimalOdds = (probability: number): string => {
  if (probability === 0) return "∞"; // Or "N/A" or some indicator for impossible
  if (probability >= 1) return "1.00"; // Certain event
  const odds = 1 / probability;
  if (odds > 1000) return ">1000"; // Cap display for extremely low probabilities
  return odds.toFixed(2);
};
