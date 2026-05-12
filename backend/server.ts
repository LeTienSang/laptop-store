import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './src/routes/authRoutes';
import brandRoutes from './src/routes/brandRoutes';
import laptopRoutes from './src/routes/laptopRoutes';
import orderRoutes from './src/routes/orderRoutes';
import userRoutes from './src/routes/userRoutes';
import dashboardRoutes from './src/routes/dashboardRoutes';
import uploadRoutes from './src/routes/uploadRoutes';
import locationRoutes from './src/routes/locationRoutes';
import { errorHandler, notFound } from './src/middlewares/errorMiddleware';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);
const corsOrigin = process.env.CORS_ORIGIN || '*';

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: process.env.SWAGGER_TITLE || 'Laptop Store API',
      version: process.env.SWAGGER_VERSION || '1.0.0',
      description: process.env.SWAGGER_DESCRIPTION || 'API documentation for Laptop Store v1',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(process.cwd(), 'src/routes/**/*.ts'), path.join(process.cwd(), 'server.ts')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/laptops', laptopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/locations', locationRoutes);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
