import request from 'supertest';
import { app } from '../app.js';
import { signJwt } from '../middleware/auth.js';

type MockPrisma = {
  user: {
    delete: jest.Mock<Promise<object>, [args: object]>;
  };
};

jest.mock('../db.js', () => ({
  prisma: {
    user: {
      delete: jest.fn<Promise<object>, [args: object]>(),
    },
  },
}));

const { prisma } = jest.requireMock('../db.js') as { prisma: MockPrisma };

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('account routes', () => {
  test('DELETE /api/account deletes the authenticated user', async () => {
    prisma.user.delete.mockResolvedValue({});

    const token = signJwt({ user_id: 1, google_id: 'google-123' });
    const response = await request(app)
      .delete('/api/account')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Conta excluída' });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  test('DELETE /api/account returns 404 when the authenticated user does not exist', async () => {
    const error = Object.assign(new Error('Record not found'), { code: 'P2025' });
    prisma.user.delete.mockRejectedValue(error);

    const token = signJwt({ user_id: 999, google_id: 'deleted-google-id' });
    const response = await request(app)
      .delete('/api/account')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Usuário não encontrado' });
  });

  test('DELETE /api/account returns 401 without a token', async () => {
    const response = await request(app).delete('/api/account');

    expect(response.status).toBe(401);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  test('DELETE /api/account returns 401 with an invalid token', async () => {
    const response = await request(app)
      .delete('/api/account')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });
});
