import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import type { TokenPayload } from 'google-auth-library';
import { prisma } from '../db.js';
import { requireAuth, signJwt } from '../middleware/auth.js';
import { WeekDay, type User } from '../generated/prisma/client.js';
import { googleAuthBodySchema } from '../validators/auth.js';
import { currentUserResponseSchema, googleAuthResponseSchema } from '../validators/responses.js';

const WEEK_DAYS = [
  WeekDay.DOMINGO,
  WeekDay.SEGUNDA,
  WeekDay.TERÇA,
  WeekDay.QUARTA,
  WeekDay.QUINTA,
  WeekDay.SEXTA,
  WeekDay.SABADO,
];

const getRedirectUri = (): string => {
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  return `${frontendUrl}/auth/google/callback`;
};

const getOAuthClient = (): OAuth2Client => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID não configurado no ambiente');
  }
  return new OAuth2Client(clientId, process.env.GOOGLE_CLIENT_SECRET ?? '', getRedirectUri());
};

const verifyGoogleIdToken = async (idToken: string): Promise<TokenPayload> => {
  const ticket = await getOAuthClient().verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Token do Google sem payload');
  }
  return payload;
};

const exchangeGoogleCode = async (code: string): Promise<TokenPayload> => {
  const client = getOAuthClient();
  const { tokens } = await client.getToken({ code, redirect_uri: getRedirectUri() });
  const idToken = tokens.id_token;
  if (!idToken) {
    throw new Error('Código do Google sem ID token');
  }
  return verifyGoogleIdToken(idToken);
};

export const authRouter = Router();

/**
 * @openapi
 * /api/auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Autentica usuário com credencial do Google (code OAuth2 ou ID token) e retorna o JWT da API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             oneOf:
 *               - required: [token]
 *                 properties:
 *                   token:
 *                     type: string
 *                     description: ID token do Google (verifyIdToken)
 *               - required: [code]
 *                 properties:
 *                   code:
 *                     type: string
 *                     description: Authorization code OAuth2 do Google (getToken + verifyIdToken)
 *     responses:
 *       200:
 *         description: Autenticação realizada; no primeiro login o usuário nasce com os 7 treinos semanais
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT da API (válido por 24h)
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Credencial do Google ausente ou vazia no corpo da requisição
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Credencial do Google inválida, expirada ou sem ID token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
authRouter.post('/google', async (req, res) => {
  const parsed = googleAuthBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Credencial do Google ausente ou vazia' });
    return;
  }

  let payload: TokenPayload;
  try {
    payload =
      'code' in parsed.data
        ? await exchangeGoogleCode(parsed.data.code)
        : await verifyGoogleIdToken(parsed.data.token);
  } catch {
    res.status(401).json({ error: 'Credencial do Google inválida ou expirada' });
    return;
  }

  const googleId = payload.sub;
  const name = payload.name ?? '';
  const email = payload.email ?? '';

  const existing = await prisma.user.findUnique({ where: { googleId } });

  let user: User;

  if (existing) {
    user = await prisma.user.update({
      where: { id: existing.id },
      data: { name, email },
    });
  } else {
    user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { googleId, name, email } });
      await tx.workout.createMany({
        data: WEEK_DAYS.map((weekDay) => ({ userId: created.id, weekDay })),
      });
      return created;
    });
  }

  res.json(
    googleAuthResponseSchema.parse({
      token: signJwt({ user_id: user.id, google_id: user.googleId }),
      name: user.name,
      email: user.email,
    }),
  );
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Retorna dados do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 google_id:
 *                   type: string
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Usuário não encontrado no banco
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
authRouter.get('/me', requireAuth, async (req, res) => {
  const claims = req.user;
  if (!claims) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: claims.user_id } });
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  res.json(
    currentUserResponseSchema.parse({
      name: user.name,
      email: user.email,
      google_id: user.googleId,
    }),
  );
});
