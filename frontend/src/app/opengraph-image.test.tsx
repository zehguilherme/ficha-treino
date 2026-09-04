jest.mock('next/og', () => ({
  ImageResponse: class MockImageResponse {
    readonly element: React.ReactNode;
    readonly options: Record<string, unknown>;

    constructor(element: React.ReactNode, options: Record<string, unknown>) {
      this.element = element;
      this.options = options;
    }
  },
}));

import { alt, contentType, default as OpenGraphImage, size } from './opengraph-image';

describe('Open Graph image', () => {
  /**
   * The generated social card exposes the expected metadata dimensions.
   * Assert: the route declares descriptive alt text, PNG output, and 1200x630 dimensions.
   */
  test('declares social image metadata', () => {
    expect(alt).toBe('Ficha de Treino — Seu próximo shape começa aqui');
    expect(contentType).toBe('image/png');
    expect(size).toEqual({ width: 1200, height: 630 });
  });

  /**
   * The image route renders the home brand and existing value proposition.
   * Assert: ImageResponse receives the configured dimensions and visible copy.
   */
  test('renders the home brand card', async () => {
    const response = await OpenGraphImage();
    const element = (response as unknown as { element: React.ReactElement }).element;
    const text = JSON.stringify(element);

    expect((response as unknown as { options: Record<string, unknown> }).options).toEqual(size);
    expect(text).toContain('Ficha de Treino');
    expect(text).toContain('Seu próximo shape começa aqui');
    expect(text).toContain(
      'Organize seus treinos, acompanhe cada exercício e evolua com consistência.',
    );
    expect(text).toContain('Começar agora');
  });
});
