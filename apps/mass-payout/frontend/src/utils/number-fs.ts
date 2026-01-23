export function formatNumber(input: string, decimals: number = 2) {
  const power = 10 ** decimals;
  return (Math.floor(Number.parseFloat(input) * power) / power).toFixed(decimals);
}
