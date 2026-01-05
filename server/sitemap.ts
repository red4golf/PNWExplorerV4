import { storage } from "./storage";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export async function generateSitemap(): Promise<string> {
  const baseUrl = "https://historical-bainbridge-charles194.replit.app";
  const now = "2025-01-05";
  
  const urls: SitemapUrl[] = [
    {
      loc: baseUrl,
      lastmod: now,
      changefreq: "weekly",
      priority: "1.0"
    },
    {
      loc: `${baseUrl}/learn-more`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.8"
    },
    {
      loc: `${baseUrl}/submit`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.7"
    }
  ];

  // Get all approved locations
  const locations = await storage.getApprovedLocations();
  
  // Add location pages using SEO-friendly slugs
  locations.forEach(location => {
    urls.push({
      loc: `${baseUrl}/location/${location.slug}`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.9"
    });
  });

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

export async function generateRobotsTxt(): Promise<string> {
  const baseUrl = "https://historical-bainbridge-charles194.replit.app";
  
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin/
Disallow: /api/admin/

# Allow important pages
Allow: /
Allow: /location/
Allow: /learn-more
Allow: /submit`;
}