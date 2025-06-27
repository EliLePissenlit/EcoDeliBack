import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
import authRouter from './routes/auth/auth.routes';
import userRouter from './routes/user/user.routes';
import adminRouter from './routes/admin/admin-user.routes';
import { sequelize } from './database/config/sequelize';
import { logger } from './utils/logger';
import fs from 'fs';
import path from 'path';

dotenv.config();

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  logger.success("Fichier .env trouvé et chargé avec succès pour l'environnement :", {
    envPath,
  });
} else {
  logger.error('Fichier .env non trouvé. Veuillez créer un fichier .env à la racine du projet');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;
const isDev = process.env.NODE_ENV === 'development';

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoDeli API',
      version: '1.0.0',
      description: 'API documentation for EcoDeli backend',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/**/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Swagger UI only in development mode
if (isDev) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);

// Initialize database connection
sequelize
  .authenticate()
  .then(async () => {
    await logger.info('Database connection established successfully');
    return sequelize.sync();
  })
  .then(async () => {
    await logger.info('Database synchronized successfully');
    app.listen(PORT, async () => {
      await logger.success(`Server is running on http://localhost:${PORT}`);
      if (isDev) {
        await logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
      }
    });
  })
  .catch(async (error) => {
    await logger.error('Database connection error', { error: error.message });
    process.exit(1);
  });
