import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFile } from 'fs/promises';

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateSitemap() {
  try {
    // Current date for lastmod
    const today = new Date().toISOString().split('T')[0];
    
    // Example listing IDs (static for now)
    const listings = [
      { id: 'example-listing-1', data: { createdAt: new Date() } },
      { id: 'example-listing-2', data: { createdAt: new Date() } },
      { id: 'popular-item', data: { createdAt: new Date() } }
    ];
    
    // Example chat IDs (static for now)
    const chats = [
      { id: 'example-chat-1', data: {} },
      { id: 'example-chat-2', data: {} }
    ];

    // Generate sitemap content
    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/login', priority: '0.8', changefreq: 'weekly' },
      { path: '/register', priority: '0.8', changefreq: 'weekly' },
      { path: '/listings', priority: '0.9', changefreq: 'daily' },
      { path: '/browse', priority: '0.9', changefreq: 'daily' },
      { path: '/payment-success', priority: '0.6', changefreq: 'weekly' },
      { path: '/forgot-password', priority: '0.7', changefreq: 'weekly' },
      { path: '/subscription', priority: '0.8', changefreq: 'weekly' },
      { path: '/profile', priority: '0.7', changefreq: 'weekly' }
    ];

    staticPages.forEach(page => {
      sitemapContent += `
  <url>
    <loc>https://selify.netlify.app${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add dynamic listing pages
    listings.forEach(listing => {
      const lastmod = listing.data.createdAt ? 
        new Date(listing.data.createdAt).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];

      sitemapContent += `
  <url>
    <loc>https://selify.netlify.app/listings/${listing.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // Add chat pages
    chats.forEach(chat => {
      const lastmod = new Date().toISOString().split('T')[0];
      sitemapContent += `
  <url>
    <loc>https://selify.netlify.app/chat/${chat.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemapContent += '\n</urlset>';

    // Write to file
    const outputPath = resolve(__dirname, '../public/sitemap.xml');
    await writeFile(outputPath, sitemapContent);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

// Run the script
generateSitemap();
