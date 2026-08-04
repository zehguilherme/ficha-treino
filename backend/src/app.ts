import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { prisma } from './db.js';
import { swaggerSpec } from './swagger.js';
import { authRouter } from './routes/auth.js';

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Verifica se o servidor e o banco de dados estão operacionais
 *     responses:
 *       200:
 *         description: Servidor e banco funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *       503:
 *         description: Banco de dados indisponível
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 */
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'error' });
  }
});

app.use('/api/auth', authRouter);
