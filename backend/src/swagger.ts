import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import swaggerJsdoc from 'swagger-jsdoc';

// ponytail: swagger-jsdoc reads .ts files at runtime, which fails on Vercel
// (source files aren't in the deployment artifact). Pre-generate
// public/swagger.json via `npm run swagger:gen` at build time, then import
// the static JSON here. Falls back to swagger-jsdoc for local dev.
const loadSpec = (): ReturnType<typeof swaggerJsdoc> => {
  try {
    const json = readFileSync(resolve(__dirname, '../public/swagger.json'), 'utf-8');
    return JSON.parse(json) as ReturnType<typeof swaggerJsdoc>;
  } catch {
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
      apis: ['./src/app.ts', './src/routes/*.ts'],
    };
    return swaggerJsdoc(options);
  }
};

export const swaggerSpec = loadSpec();
