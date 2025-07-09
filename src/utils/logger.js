const fs = require('fs').promises;
const path = require('path');

/**
 * Simple logging utility for the mockup generator
 */
class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.logFile = options.logFile || 'logs/mockup-generator.log';
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[37m', // White
      reset: '\x1b[0m'
    };
    
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      const logDir = path.dirname(this.logFile);
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  async log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    if (this.enableConsole) {
      const colorCode = this.colors[level] || this.colors.reset;
      console.log(`${colorCode}${formattedMessage}${this.colors.reset}`);
    }
    
    // File output
    if (this.enableFile) {
      try {
        await fs.appendFile(this.logFile, formattedMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error.message);
      }
    }
  }

  error(message, meta = {}) {
    return this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    return this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    return this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    return this.log('debug', message, meta);
  }

  // Performance logging
  async logPerformance(operation, duration, meta = {}) {
    const performanceData = {
      operation,
      duration: `${duration.toFixed(2)}ms`,
      ...meta
    };
    
    if (duration > 1000) {
      await this.warn('Slow operation detected', performanceData);
    } else {
      await this.info('Operation completed', performanceData);
    }
  }

  // Batch processing statistics
  async logBatchStats(stats) {
    await this.info('Batch processing completed', {
      totalFiles: stats.total,
      processed: stats.processed,
      errors: stats.errors,
      successRate: `${((stats.processed / stats.total) * 100).toFixed(1)}%`,
      avgProcessingTime: `${stats.avgTime.toFixed(2)}ms`
    });
  }

  // Clear log file
  async clearLogs() {
    try {
      await fs.writeFile(this.logFile, '');
      await this.info('Log file cleared');
    } catch (error) {
      console.error('Failed to clear log file:', error.message);
    }
  }
}

module.exports = Logger;