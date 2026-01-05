interface GeoData {
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
}

const geoCache = new Map<string, { data: GeoData; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function lookupGeoLocation(ipAddress: string): Promise<GeoData> {
  if (!ipAddress || ipAddress === 'unknown' || ipAddress === '127.0.0.1' || ipAddress === '::1') {
    return { city: null, region: null, country: null, countryCode: null };
  }

  const cleanIP = ipAddress.replace('::ffff:', '');
  
  const cached = geoCache.get(cleanIP);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${cleanIP}?fields=city,regionName,country,countryCode,status`);
    
    if (!response.ok) {
      console.log(`Geo lookup failed for ${cleanIP}: HTTP ${response.status}`);
      return { city: null, region: null, country: null, countryCode: null };
    }

    const data = await response.json();
    
    if (data.status === 'fail') {
      console.log(`Geo lookup failed for ${cleanIP}: ${data.message || 'unknown error'}`);
      return { city: null, region: null, country: null, countryCode: null };
    }

    const geoData: GeoData = {
      city: data.city || null,
      region: data.regionName || null,
      country: data.country || null,
      countryCode: data.countryCode || null,
    };

    geoCache.set(cleanIP, { data: geoData, timestamp: Date.now() });
    
    return geoData;
  } catch (error) {
    console.log(`Geo lookup error for ${cleanIP}:`, error);
    return { city: null, region: null, country: null, countryCode: null };
  }
}
