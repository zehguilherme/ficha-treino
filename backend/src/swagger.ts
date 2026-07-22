import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ficha de Treino API',
      version: '0.1.0',
      description:
        'API REST do sistema Ficha de Treino. Endpoints de autenticação, treinos, exercícios e gerenciamento de conta.',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Servidor de desenvolvimento',
      },
    ],
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
  apis: ['./src/server.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
