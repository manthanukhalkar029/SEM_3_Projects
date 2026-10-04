export const holdingValue = holding =>
  Number(holding.qty || 0) * Number(holding.current || 0);

export const holdingValueInr = holding =>
  holding.currency === 'USD'
    ? holdingValue(holding) * Number(holding.fxRateToInr || 85)
    : holdingValue(holding);

export const investedValueInr = holding =>
  holding.currency === 'USD'
    ? Number(holding.invested || 0) * Number(holding.fxRateToInr || 85)
    : Number(holding.invested || 0);

export const profitLoss = holding =>
  holdingValue(holding) - Number(holding.invested || 0);

export const returnPercent = holding => {
  const invested = Number(holding.invested || 0);
  return invested ? (profitLoss(holding) / invested) * 100 : 0;
};

export const formatMoney = (
  value,
  currency = 'INR',
  maximumFractionDigits = 2
) => {
  const symbol = currency === 'USD' ? '$' : '₹';

  return `${symbol}${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits
  })}`;
};
