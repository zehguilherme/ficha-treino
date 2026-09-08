jest.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));
jest.mock('next/font/google', () => ({ Inter: () => ({ variable: 'mock-font' }) }));
jest.mock('../../../globals.css', () => ({}));

import { metadata as rootMetadata } from '../../../layout';
import { metadata } from './layout';

describe('Add exercise metadata', () => {
  /**
   * The private exercise-addition route exposes its contextual page title.
   * Assert: the route keeps the shared noindex policy and root title template compatibility.
   */
  test('uses the contextual title with the global browser-tab suffix', () => {
    expect(metadata).toEqual({
      title: { absolute: 'Adicionar exercício — Ficha de Treino' },
      robots: { index: false, follow: false },
    });
    expect(rootMetadata.title).toEqual({
      default: 'Ficha de Treino — Seu treino organizado',
      template: '%s — Ficha de Treino',
    });
  });
});
