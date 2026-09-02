import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { accountDeletionResponseSchema } from '../validators/responses.js';

export const accountRouter = Router();

/**
 * @openapi
 * /api/account:
 *   delete:
 *     tags: [Account]
 *     summary: Exclui permanentemente a conta do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conta excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [message]
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Conta excluída
 *       401:
 *         description: Token JWT ausente, inválido ou expirado
 *       404:
 *         description: Usuário não encontrado
 */
accountRouter.delete('/', requireAuth, async (req, res) => {
  const claims = req.user;
  if (!claims) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }

  try {
    await prisma.user.delete({ where: { id: claims.user_id } });
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    throw error;
  }

  res.json(accountDeletionResponseSchema.parse({ message: 'Conta excluída' }));
});
