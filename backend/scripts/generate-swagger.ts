import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync } from 'node:fs';

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
        description: 'Servidor da API',
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
  apis: ['./src/app.ts', './src/routes/*.ts'],
};

const spec = swaggerJsdoc(options);
writeFileSync('public/swagger.json', JSON.stringify(spec, null, 2));
console.log('Swagger spec generated → public/swagger.json');
