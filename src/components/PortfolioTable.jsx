const PortfolioTable = ({ portfolio }) => {
  if (!portfolio || portfolio.length === 0) {
    return <p>No portfolio data available.</p>;
  }

  const formatNumber = (num, decimals = 2) =>
    Number(num).toFixed(decimals);

  const getChangeColor = (percent) => {
    if (percent > 0) return 'green';
    if (percent < 0) return 'red';
    return 'gray';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'green';
      case 'negative':
        return 'red';
      case 'neutral':
        return 'gray';
      default:
        return 'black';
    }
  };

  const totalInitial = portfolio.reduce((sum, coin) => sum + coin.amount * coin.buyPrice, 0);
  const totalCurrent = portfolio.reduce((sum, coin) => sum + coin.amount * coin.currentPrice, 0);
  const totalChangePercent = ((totalCurrent - totalInitial) / totalInitial) * 100;

  return (
    <div className="portfolio-table-wrapper">
      <h2>Portfolio Overview</h2>
      <table className="portfolio-table">
        <thead>
          <tr>
            <th>Coin</th>
            <th>Amount</th>
            <th>Buy Price</th>
            <th>Current Price</th>
            <th>Initial Value</th>
            <th>Current Value</th>
            <th>Change (%)</th>
            <th>Sentiment</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.map((coin, index) => {
            const initialValue = coin.amount * coin.buyPrice;
            const currentValue = coin.amount * coin.currentPrice;
            const changePercent = ((coin.currentPrice - coin.buyPrice) / coin.buyPrice) * 100;

            return (
              <tr key={index}>
                <td>{coin.symbol}</td>
                <td>{formatNumber(coin.amount, 6)}</td>
                <td>${formatNumber(coin.buyPrice)}</td>
                <td>${formatNumber(coin.currentPrice)}</td>
                <td>${formatNumber(initialValue)}</td>
                <td>${formatNumber(currentValue)}</td>
                <td style={{ color: getChangeColor(changePercent) }}>
                  {formatNumber(changePercent)}%
                </td>
                <td style={{ color: getSentimentColor(coin.sentiment) }}>
                  {coin.sentiment || 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4"><strong>Total</strong></td>
            <td><strong>${formatNumber(totalInitial)}</strong></td>
            <td><strong>${formatNumber(totalCurrent)}</strong></td>
            <td style={{ color: getChangeColor(totalChangePercent) }}>
              <strong>{formatNumber(totalChangePercent)}%</strong>
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default PortfolioTable;
