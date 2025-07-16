import config from 'config';
import sonarqubeScanner from 'sonarqube-scanner';

import logger from './src/infrastructure/logger';

const token: string = config.get('sonarqube.token');
const serverUrl: string = config.get('sonarqube.serverUrl');
const projectKey: string = config.get('sonarqube.projectKey');

if (!token || !serverUrl || !projectKey) {
  throw new Error('Missing SonarQube configuration');
}

sonarqubeScanner(
  {
    options: {
      'sonar.exclusions': ['public/**/*', 'config/**/*', 'assets/**/*', 'gcs-developer.json'].join(','),
      'sonar.projectKey': projectKey,
      'sonar.sources': 'src',
      'sonar.test.inclusions': 'src/**/*.test.ts',
      'sonar.tests': 'src/__tests__',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
    },
    serverUrl,
    token,
  },
  () => {
    logger.info('SonarQube scan completed.');
  }
);
