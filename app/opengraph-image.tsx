import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pass Vé Phim - Chợ sang nhượng vé xem phim & sự kiện';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(to bottom right, #0F172A, #1E293B)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#10B981',
              textAlign: 'center',
            }}
          >
            🎬 Pass Vé Phim
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#F1F5F9',
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            Chợ sang nhượng vé xem phim & sự kiện
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#94A3B8',
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            Mua bán vé uy tín, an toàn với hệ thống escrow tự động
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

