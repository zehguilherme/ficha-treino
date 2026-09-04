import { ImageResponse } from 'next/og';

export const alt = 'Ficha de Treino — Seu próximo shape começa aqui';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const OpenGraphImage = (): ImageResponse =>
  new ImageResponse(
    <div
      style={{
        background: '#111827',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: '72px 84px',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>Ficha de Treino</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
        <div style={{ color: '#bfdbfe', display: 'flex', fontSize: 24, fontWeight: 600 }}>
          ORGANIZE. EXECUTE. EVOLUA.
        </div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
          Seu próximo shape começa aqui
        </div>
        <div style={{ color: '#cbd5e1', display: 'flex', fontSize: 28, lineHeight: 1.35 }}>
          Organize seus treinos, acompanhe cada exercício e evolua com consistência.
        </div>
      </div>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ color: '#94a3b8', display: 'flex', fontSize: 22 }}>
          fichatreino.vercel.app
        </div>
        <div
          style={{
            background: '#bfdbfe',
            borderRadius: 8,
            color: '#111827',
            display: 'flex',
            fontSize: 22,
            fontWeight: 700,
            padding: '12px 18px',
          }}
        >
          Começar agora
        </div>
      </div>
    </div>,
    size,
  );

// eslint-disable-next-line no-restricted-syntax
export default OpenGraphImage;
