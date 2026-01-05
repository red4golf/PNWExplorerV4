import { db } from "./db";
import { sql } from "drizzle-orm";

interface GeoData {
  query: string;
  city?: string;
  regionName?: string;
  country?: string;
  countryCode?: string;
  status: string;
}

async function backfillGeo() {
  const result = await db.execute(sql`
    SELECT DISTINCT ip_address 
    FROM user_analytics 
    WHERE is_developer = false 
      AND city IS NULL 
      AND ip_address NOT IN ('127.0.0.1', '::1', 'unknown')
    LIMIT 100
  `);
  
  const ips = (result.rows as any[]).map((r) => r.ip_address).filter((ip: string) => ip && !ip.startsWith('::ffff:'));
  console.log(`Found ${ips.length} IPs to lookup`);
  
  const response = await fetch('http://ip-api.com/batch?fields=query,city,regionName,country,countryCode,status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ips.slice(0, 100))
  });
  
  const data: GeoData[] = await response.json();
  console.log(`Got ${data.length} geo results`);
  
  let updated = 0;
  for (const geo of data) {
    if (geo.status === 'success' && (geo.city || geo.country)) {
      await db.execute(sql`
        UPDATE user_analytics 
        SET city = ${geo.city || null}, 
            region = ${geo.regionName || null}, 
            country = ${geo.country || null}, 
            country_code = ${geo.countryCode || null}
        WHERE ip_address = ${geo.query}
      `);
      updated++;
    }
  }
  console.log(`Updated ${updated} records`);
}

backfillGeo().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
