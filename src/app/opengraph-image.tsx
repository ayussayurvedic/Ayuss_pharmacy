import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'S.S. Pharmacy — Authentic Ayurvedic Quality';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #134547 0%, #1A5C5E 50%, #0F3335 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top Gold Accent Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            background: 'linear-gradient(90deg, #C9943E, #E5C378, #C9943E)',
            display: 'flex',
          }}
        />

        {/* License Badge */}
        <div
          style={{
            padding: '6px 18px',
            borderRadius: '16px',
            background: 'rgba(201, 148, 62, 0.2)',
            border: '1px solid #C9943E',
            color: '#E5C378',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            display: 'flex',
            marginBottom: '24px',
          }}
        >
          Govt. Lic. No: R-1970/Ayur • GMP Certified
        </div>

        {/* Company Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-1px',
            textAlign: 'center',
            lineHeight: 1.1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <span>S.S. PHARMACY</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: '#FDF8F0',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
            display: 'flex',
            marginBottom: '36px',
            fontWeight: 300,
          }}
        >
          Authentic Ayurvedic Formulations & Herbal Wellness
        </div>

        {/* Key Pills */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['100% Herbal Ingredients', 'Pain Relief Creams', 'Traditional Science', 'Fast Delivery Across India'].map(
            (pill) => (
              <div
                key={pill}
                style={{
                  padding: '10px 22px',
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  fontSize: 18,
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                {pill}
              </div>
            )
          )}
        </div>

        {/* Footer Location */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#C9D5D5',
            fontSize: 16,
            letterSpacing: '0.5px',
          }}
        >
          Kadapa District, Andhra Pradesh, India • sspharmacy.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
