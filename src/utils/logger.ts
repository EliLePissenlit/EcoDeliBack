import chalk from 'chalk';

// Types de logs
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  SUCCESS = 'success',
}

// Interface pour les métadonnées du log
interface LogMetadata {
  [key: string]: unknown;
}

// Configuration Datadog
interface DatadogConfig {
  apiKey: string;
  service: string;
  environment: string;
}

class Logger {
  private static instance: Logger;
  private datadogConfig: DatadogConfig;
  private isDev: boolean;

  private constructor() {
    // Initialisation de la configuration Datadog
    this.datadogConfig = {
      apiKey: process.env.DATADOG_API_KEY || '',
      service: process.env.SERVICE_NAME || 'ecodeli-backend',
      environment: process.env.NODE_ENV || 'development',
    };
    this.isDev = process.env.NODE_ENV === 'development';

    // Pas de warning si la clé API n'est pas configurée
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const metadataStr = metadata ? JSON.stringify(metadata) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metadataStr}`;
  }

  private async sendToDatadog(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata
  ): Promise<void> {
    // Ne pas envoyer à Datadog si pas de clé API ou en dev
    if (!this.datadogConfig.apiKey || this.isDev) {
      return;
    }

    try {
      const logData = {
        ddsource: 'nodejs',
        ddtags: `env:${this.datadogConfig.environment},service:${this.datadogConfig.service}`,
        message: this.formatMessage(level, message, metadata),
        level: level,
        timestamp: new Date().getTime(),
        ...metadata,
      };

      const response = await fetch('https://http-intake.logs.datadoghq.com/v1/input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': this.datadogConfig.apiKey,
        },
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        console.error(`Erreur Datadog: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi des logs à Datadog:", error);
    }
  }

  private async log(level: LogLevel, message: string, metadata?: LogMetadata): Promise<void> {
    const formattedMessage = this.formatMessage(level, message, metadata);

    // Envoi des logs à Datadog uniquement si la clé API est configurée
    if (this.datadogConfig.apiKey && !this.isDev) {
      await this.sendToDatadog(level, message, metadata);
    }

    // Logs locaux avec couleurs en dev
    if (this.isDev) {
      const colors = {
        [LogLevel.ERROR]: chalk.red.bold,
        [LogLevel.WARN]: chalk.yellow.bold,
        [LogLevel.INFO]: chalk.blue.bold,
        [LogLevel.DEBUG]: chalk.magenta.bold,
        [LogLevel.SUCCESS]: chalk.green.bold,
      };
      const colorize = colors[level] || chalk.white;
      console.log(colorize(formattedMessage));
    } else {
      // Logs standards en production
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.SUCCESS:
          console.log(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }
  }

  public async info(message: string, metadata?: LogMetadata): Promise<void> {
    await this.log(LogLevel.INFO, message, metadata);
  }

  public async warn(message: string, metadata?: LogMetadata): Promise<void> {
    await this.log(LogLevel.WARN, message, metadata);
  }

  public async error(message: string, metadata?: LogMetadata): Promise<void> {
    await this.log(LogLevel.ERROR, message, metadata);
  }

  public async debug(message: string, metadata?: LogMetadata): Promise<void> {
    await this.log(LogLevel.DEBUG, message, metadata);
  }

  public async success(message: string, metadata?: LogMetadata): Promise<void> {
    await this.log(LogLevel.SUCCESS, message, metadata);
  }
}

// Export d'une instance unique du logger
export const logger = Logger.getInstance();
