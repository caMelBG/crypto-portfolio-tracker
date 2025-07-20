import { useState } from 'react';

const FileUploader = ({ onParseComplete }) => {
  const [parsedData, setParsedData] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contents = e.target.result;
        const lines = contents.split('\n').filter(line => line.trim() !== '');

        const parsed = lines.map((line, index) => {
          const parts = line.trim().split('|');
          if (parts.length !== 3) {
            throw new Error(`Invalid format at line ${index + 1}: ${line}`);
          }

          const amount = parseFloat(parts[0]);
          const ticker = parts[1].trim();
          const buyPrice = parseFloat(parts[2]);

          if (isNaN(amount) || isNaN(buyPrice)) {
            throw new Error(`Invalid number format at line ${index + 1}: ${line}`);
          }

          return {
            amount,
            ticker,
            buyPrice
          };
        });

        setParsedData(parsed);
        setError(null);
        if (onParseComplete) {
          onParseComplete(parsed);
        }
      } catch (err) {
        setError(err.message);
        setParsedData([]);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setParsedData([]);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" accept=".txt" onChange={handleFileUpload} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default FileUploader;
