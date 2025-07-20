import { useState } from 'react';

const SettingsPanel = ({ settings, onChange }) => {
  const [localSettings, setLocalSettings] = useState({
    refreshInterval: settings.refreshInterval || 5,
    enableSentiment: settings.enableSentiment || false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : Number(value);

    const updatedSettings = {
      ...localSettings,
      [name]: newValue,
    };

    setLocalSettings(updatedSettings);
    onChange(updatedSettings);
  };

  return (
    <div className="settings-panel" style={styles.panel}>
      <h3 style={styles.heading}>Settings</h3>

      <div style={styles.field}>
        <label htmlFor="refreshInterval">Refresh Interval (minutes):</label>
        <input
          type="number"
          name="refreshInterval"
          min="1"
          max="60"
          value={localSettings.refreshInterval}
          onChange={handleInputChange}
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="enableSentiment">Enable Sentiment Analysis:</label>
        <input
          type="checkbox"
          name="enableSentiment"
          checked={localSettings.enableSentiment}
          onChange={handleInputChange}
          style={styles.checkbox}
        />
      </div>
    </div>
  );
};

const styles = {
  panel: {
    padding: '1rem',
    margin: '1rem 0',
    border: '1px solid #ddd',
    borderRadius: '8px',
    maxWidth: '400px',
    backgroundColor: '#f9f9f9',
  },
  heading: {
    marginBottom: '1rem',
    fontSize: '1.2rem',
  },
  field: {
    marginBottom: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    width: '60px',
    padding: '0.25rem',
  },
  checkbox: {
    transform: 'scale(1.2)',
  },
};

export default SettingsPanel;
