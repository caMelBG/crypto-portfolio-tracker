import { useEffect, useState, useCallback } from 'react';
import FileUploader from './components/FileUploader';
import PortfolioTable from './components/PortfolioTable';
import SettingsPanel from './components/SettingsPanel';
import { fetchCryptoPrices, analyzeSentiment } from './utils/api';
import logger from './utils/logger';

const App = () => {
  const [rawPortfolio, setRawPortfolio] = useState([]);
  const [enrichedPortfolio, setEnrichedPortfolio] = useState([]);
  const [previousValue, setPreviousValue] = useState(0);
  const [settings, setSettings] = useState({
    refreshInterval: 5,
    enableSentiment: false,
  });
  const [nextRefreshIn, setNextRefreshIn] = useState(settings.refreshInterval * 60);

  const enrichPortfolio = useCallback(async (parsedData) => {
    const tickers = parsedData.map(item => item.ticker.toUpperCase());

    try {
      logger.logApiFetch('https://api.coinlore.net/api/tickers/', true);
      const priceMap = await fetchCryptoPrices(tickers);

      let sentimentMap = {};
      if (settings.enableSentiment) {
        try {
          logger.logApiFetch('https://api.openai.com/v1/chat/completions', true);
          sentimentMap = await analyzeSentiment(tickers);
        } catch (error) {
          logger.log('SENTIMENT', 'Batch sentiment fetch failed', { error: error.message });
          sentimentMap = tickers.reduce((acc, t) => {
            acc[t] = 'Error';
            return acc;
          }, {});
        }
      }

      const newPortfolio = parsedData.map((item) => {
        const symbol = item.ticker.toUpperCase();
        const currentPrice = priceMap[symbol] || 0;
        const sentiment = settings.enableSentiment ? sentimentMap[symbol] || 'N/A' : 'N/A';

        return {
          symbol,
          amount: item.amount,
          buyPrice: item.buyPrice,
          currentPrice,
          sentiment,
        };
      });

      const newTotal = newPortfolio.reduce((acc, coin) => acc + coin.amount * coin.currentPrice, 0);
      if (previousValue !== 0 && newTotal !== previousValue) {
        logger.logPortfolioUpdate(previousValue, newTotal);
      }

      setPreviousValue(newTotal);
      setEnrichedPortfolio(newPortfolio);
    } catch (error) {
      logger.logApiFetch('https://api.coinlore.net/api/tickers/', false);
    }
  }, [settings.enableSentiment, previousValue]);


  const handleParseComplete = (parsedData) => {
    setRawPortfolio(parsedData);
    logger.logFileUpload('Uploaded file');
    enrichPortfolio(parsedData);
    setNextRefreshIn(settings.refreshInterval * 60);
  };

  useEffect(() => {
    if (!rawPortfolio.length) return;

    const interval = setInterval(() => {
      enrichPortfolio(rawPortfolio);
      setNextRefreshIn(settings.refreshInterval * 60);
    }, settings.refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [rawPortfolio, settings.refreshInterval, enrichPortfolio]);

  useEffect(() => {
    if (!rawPortfolio.length) return;

    const timer = setInterval(() => {
      setNextRefreshIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [rawPortfolio, settings.refreshInterval]);

  const handleExportLogs = () => {
    logger.exportLogs();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Crypto Portfolio Tracker</h1>

      <SettingsPanel
        settings={settings}
        onChange={(newSettings) => {
          setSettings(newSettings);
          setNextRefreshIn(newSettings.refreshInterval * 60);
        }}
      />

      <FileUploader
        onParseComplete={handleParseComplete}
      />

      {rawPortfolio.length > 0 && (
        <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
          Next refresh in: <strong>{formatTime(nextRefreshIn)}</strong>
        </p>
      )}

      <PortfolioTable portfolio={enrichedPortfolio} />

      <button onClick={handleExportLogs} style={{ marginTop: '1rem' }}>
        Export Logs
      </button>
    </div>
  );
};

export default App;
