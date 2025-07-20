import { saveAs } from 'file-saver';

class Logger {
  constructor() {
    this.logs = [];
  }

  log(type, message, data = {}) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, type, message, data };
    this.logs.push(entry);
    console.log(`[${timestamp}] ${type}: ${message}`, data);
  }

  logFileUpload(filename, success = true) {
    this.log(
      'FILE_UPLOAD', 
      success ? 'File uploaded successfully' : 'File upload failed',
      { filename, success }
    );
  }

  logApiFetch(endpoint, success = true, statusCode) {
    this.log(
      'API_FETCH',
      success ? 'API request succeeded' : 'API request failed',
      { endpoint, success, statusCode }
    );
  }

  logPortfolioUpdate(oldValue, newValue) {
    this.log(
      'PORTFOLIO_UPDATE',
      'Portfolio value updated',
      { oldValue, newValue, change: newValue - oldValue }
    );
  }

  exportLogs() {
    const logText = this.logs.map(entry => {
      return `[${entry.timestamp}] ${entry.type}: ${entry.message}\n` +
        `Details: ${JSON.stringify(entry.data, null, 2)}\n`;
    }).join('\n');

    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `app-logs-${new Date().toISOString().slice(0, 10)}.txt`);
  }
}

export default new Logger();
