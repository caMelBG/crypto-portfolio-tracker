import axios from 'axios';

export async function analyzeSentiment(tickers) {
    if (!Array.isArray(tickers) || tickers.length === 0) {
        throw new Error('Tickers must be a non-empty array of strings');
    }

    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    console.log(apiKey)
    const model = 'gpt-3.5-turbo';

    const prompt = `
Analyze sentiment for the following crypto tickers based on the latest news or general market outlook. 
Respond ONLY in JSON format like this: 
{ "BTC": "Positive", "ETH": "Neutral", "DOGE": "Negative" } 
Sentiments must be either "Positive", "Negative", or "Neutral". 
Tickers: ${tickers.join(', ')}
`;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model,
                messages: [
                    {
                        role: 'user',
                        content: prompt.trim()
                    }
                ],
                temperature: 0,
                max_tokens: 200
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0]?.message?.content?.trim();

        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            throw new Error('Failed to parse OpenAI JSON response');
        }

        // Validate result
        const valid = tickers.every(ticker =>
            ['Positive', 'Negative', 'Neutral'].includes(parsed[ticker])
        );

        if (!valid) {
            throw new Error('Invalid sentiment format in API response');
        }

        return parsed; // returns { BTC: "Positive", ETH: "Neutral", ... }
    } catch (error) {
        console.error('Sentiment analysis failed:', error);
        throw new Error(`Sentiment analysis failed: ${error.message}`);
    }
}

export async function fetchCryptoPrices(tickers) {
  try {
    const response = await fetch('https://api.coinlore.net/api/tickers/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    const priceMap = {};
    data.data.forEach(coin => {
      if (tickers.includes(coin.symbol)) {
        priceMap[coin.symbol] = parseFloat(coin.price_usd);
      }
    });
        
    return priceMap;
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error);
    throw error;
  }
}
