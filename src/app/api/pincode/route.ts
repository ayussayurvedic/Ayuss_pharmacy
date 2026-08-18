import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code')?.trim();
  const lat = searchParams.get('lat')?.trim();
  const lon = searchParams.get('lon')?.trim();

  // 1. Handle Indian Pincode Lookup
  if (code) {
    const cleanCode = code.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json(
        { success: false, error: 'PIN Code must be a 6-digit Indian postal code.' },
        { status: 400 }
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 86400 } // cache for 24h
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0] && data[0].Status === 'Success' && Array.isArray(data[0].PostOffice) && data[0].PostOffice.length > 0) {
          const po = data[0].PostOffice[0];
          const postOffices = data[0].PostOffice.map((p: any) => p.Name).filter(Boolean);
          const district = (po.District || '').trim();

          const cleanStr = (s: string) => s.replace(/\s*\((?:Urban|Rural|City)\)/gi, '').trim();

          // Intelligent City / Town vs District separation
          let city = '';
          const block = (po.Block || '').trim();
          const division = (po.Division || '').trim();
          const name = (po.Name || '').trim();

          if (block && block.toLowerCase() !== 'na' && block.toLowerCase() !== district.toLowerCase()) {
            city = cleanStr(block);
          } else if (division && division.toLowerCase() !== district.toLowerCase() && !division.toLowerCase().includes('division')) {
            city = cleanStr(division);
          } else if (name && name.toLowerCase() !== district.toLowerCase()) {
            city = cleanStr(name);
          } else {
            city = district;
          }
          
          return NextResponse.json({
            success: true,
            pincode: cleanCode,
            city,
            district,
            state: po.State || '',
            postOffice: po.Name || '',
            availableLocalities: postOffices.slice(0, 5),
          });
        }
      }

      return NextResponse.json(
        { success: false, error: 'PIN Code not found or postal service unavailable.' },
        { status: 404 }
      );
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.name === 'AbortError' ? 'Pincode lookup timed out.' : 'Failed to query postal API.' },
        { status: 502 }
      );
    }
  }

  // 2. Handle GPS Reverse Geocoding (Lat & Lon)
  if (lat && lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: 'Invalid latitude or longitude.' },
        { status: 400 }
      );
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      // Server-side Nominatim with compliant User-Agent
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SSPharmacy-Ayurveda/1.0 (ayuss.ayurvedic@gmail.com)',
            'Accept-Language': 'en-IN,en;q=0.9',
            'Accept': 'application/json',
          },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const address = data.address || {};

        const pincode = address.postcode || '';
        const state = address.state || '';
        const district = address.state_district || address.county || address.district || '';
        const localTown = address.town || address.village || address.suburb || address.neighbourhood || address.municipality || '';
        let city = address.city || localTown || district || '';
        if (city.toLowerCase() === district.toLowerCase() && localTown) {
          city = localTown;
        }
        
        // Build concise street line
        const streetParts = [
          address.house_number,
          address.building,
          address.road,
          address.suburb || address.neighbourhood
        ].filter(Boolean);

        const streetAddress = streetParts.length > 0 ? streetParts.join(', ') : (data.name || '');

        return NextResponse.json({
          success: true,
          pincode,
          city,
          district,
          state,
          streetAddress,
          formattedAddress: data.display_name || '',
        });
      }

      return NextResponse.json(
        { success: false, error: 'Unable to resolve reverse geocode coordinates.' },
        { status: 404 }
      );
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.name === 'AbortError' ? 'GPS lookup timed out.' : 'Geocoding failed.' },
        { status: 502 }
      );
    }
  }

  return NextResponse.json(
    { success: false, error: 'Provide either ?code=XXXXXX or ?lat=XX&lon=YY' },
    { status: 400 }
  );
}
