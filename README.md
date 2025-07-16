# 🚀 Node.js/TypeScript/GraphQL Ecodeli backend

![Node](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)

Modern and scalable backend starter built with Node.js, TypeScript, and GraphQL.

## 🏗 Architecture

### Core Architecture

The application follows a three-layer architecture:

**Resolvers** → **Workflows** → **Services**

- **Resolvers**: Handle GraphQL requests and input validation, then delegate to workflows
- **Workflows**: Contain all business logic with static methods, orchestrating service calls
- **Services**: Extend GenericService for database operations using Objection.js ORM

This clean architecture ensures separation of concerns, maintainability, and code reusability. 🚀

### Directory Structure

```
└── ecodeli-backend
    └── 📁assets
        └── 📁public
    └── 📁config
        └── default.json
        └── production.json
        └── staging.json
        └── test.json
    └── 📁public
        └── index.html
        └── 📁javascripts
            └── spectaql.min.js
        └── 📁stylesheets
            └── spectaql.min.css
    └── 📁src
        └── 📁__tests__
        └── 📁db
            └── index.ts
            └── 📁migrations
            └── 📁model
            └── 📁seeds
        └── 📁external-services
        └── 📁graphql
        └── index.ts
        └── 📁infrastructure
        └── 📁jobs
        └── 📁services
        └── 📁shared
        └── 📁types
        └── 📁utils
        └── 📁workflows
    └── .eslintrc
    └── .gitignore
    └── .gitlab-ci.yml
    └── .prettierrc.json
    └── babel.config.ts
    └── codegen.ts
    └── cspell.json
    └── deploy.staging.yaml
    └── deploy.yaml
    └── docker-compose.yml
    └── Dockerfile
    └── Dockerfile.staging
    └── gcs-developer.json
    └── jest.config.ts
    └── knexfile.ts
    └── package-lock.json
    └── package.json
    └── README.md
    └── sonar-scanner.ts
    └── spectaql-config.yml
    └── tsconfig.eslint.json
    └── tsconfig.json
```

## 🛠 Technologies

### Core

- **Runtime**: Node.js 20
- **Language**: TypeScript 4.8
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with Knex.js & Objection.js
- **Testing**: Jest
- **Documentation**: SpectaQL

### Infrastructure

- **Logging**: Winston + Datadog
- **CI/CD**: GitLab CI
- **Cloud**: Google Cloud Platform
- **Containerization**: Docker

### Integrations

- SendGrid (Emails)
- Google Cloud Storage
- Slack

## ⚙️ Configuration

The project uses the `config` package for environment variables:

- `config/default.json`: Default configuration
- `config/production.json`: Production overrides
- `config/staging.json`: Staging overrides
- `config/test.json`: Test configuration

## 🔧 Development

### Available Scripts

```bash
"generate:doc": "npx spectaql spectaql-config.yml", // Generate documentation
"generate:types": "graphql-codegen --config codegen.ts  && npm run lint:fix", // Generate types
"generate:coverage": "npx jest --coverage", // Generate coverage
"test": "jest", // Run tests
"knex:dev": "npm run migrate && npm run seed", // Run migrations and seeds
"dev": "nodemon --watch src --ext ts,graphql,js,json --exec ts-node src/index.ts", // Run development server
"build": "rm -rf dist && tsc && ts-node ./src/graphql/buildGraphQlFiles.ts", // Build project
"build:deploy": "gcloud builds submit --config deploy.yaml", // Deploy to production
"build:deploy:staging": "gcloud builds submit --config deploy.staging.yaml", // Deploy to staging
"start": "node ./dist/index.js", // Start production server
"migrate": "knex migrate:latest", // Run migrations
"migrate:rollback": "knex migrate:rollback", // Rollback migrations
"migrate:make": "knex migrate:make", // Create a new migration
"seed": "knex seed:run", // Run seeds
"lint": "eslint src/ --max-warnings=0", // Run linting
"lint:fix": "eslint --fix src/", // Fix linting errors
"cspell": "cspell \"**\"", // Check spelling
"sonar": "ts-node sonar-scanner.ts", // Run SonarQube analysis
"format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"", // Format code
"format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"" // Check formatting
```
