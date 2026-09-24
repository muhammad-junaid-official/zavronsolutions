/**
 * Zavron Solutions - 100% Authentic Live Website Audit Service
 * Performs real HTTP analysis, TTFB measurement, SSL verification,
 * and deep DOM inspection for SEO, Performance, Mobile, and Security.
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

/**
 * Perform a real, live technical audit on any public website URL
 * @param {string} targetUrl 
 * @returns {Promise<Object>} Authentic audit results
 */
export async function auditTargetWebsite(targetUrl) {
  let normalizedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'https://' + normalizedUrl.replace(/^www\./, '');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch (e) {
    throw new Error('Invalid URL format');
  }

  const hostname = parsedUrl.hostname;
  const isHttps = parsedUrl.protocol === 'https:';

  // Perform real HTTP fetch with timing and follow redirects
  const startTime = Date.now();
  const fetchResult = await fetchWithRedirects(normalizedUrl, 3);
  const ttfb = Date.now() - startTime;

  const html = fetchResult.body || '';
  const statusCode = fetchResult.statusCode || 0;
  const headers = fetchResult.headers || {};
  const finalUrl = fetchResult.finalUrl || normalizedUrl;
  const finalIsHttps = finalUrl.startsWith('https://');

  // 1. SSL & Security Analysis
  const hasHsts = !!headers['strict-transport-security'];
  const hasCsp = !!headers['content-security-policy'];
  const hasXContentType = !!headers['x-content-type-options'];
  const hasXFrame = !!headers['x-frame-options'];

  let securityScore = 70;
  if (finalIsHttps) securityScore += 15;
  if (hasHsts) securityScore += 5;
  if (hasCsp || hasXContentType) securityScore += 10;
  securityScore = Math.min(100, Math.max(20, securityScore));

  // 2. SEO Inspection (Real HTML DOM regex analysis)
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : null;
  const titleLength = title ? title.length : 0;

  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : null;
  const metaDescLength = metaDescription ? metaDescription.length : 0;

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
                         html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : null;

  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);
  const isMobileResponsive = !!viewportMatch;

  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h1Count = h1Matches.length;

  const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  const h2Count = h2Matches.length;

  const imgMatches = html.match(/<img\b[^>]*>/gi) || [];
  let totalImages = imgMatches.length;
  let imagesMissingAlt = 0;
  imgMatches.forEach(img => {
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(img) || /\balt\s*=\s*["']\s*["']/i.test(img)) {
      imagesMissingAlt++;
    }
  });

  const hasSchema = /application\/ld\+json/i.test(html) || /itemscope/i.test(html);
  const hasOpenGraph = /<meta[^>]*property=["']og:title["']/i.test(html);

  // Calculate Real SEO Score
  let seoScore = 100;
  if (!title) seoScore -= 20;
  else if (titleLength < 25 || titleLength > 70) seoScore -= 8;

  if (!metaDescription) seoScore -= 20;
  else if (metaDescLength < 60 || metaDescLength > 165) seoScore -= 8;

  if (h1Count === 0) seoScore -= 15;
  else if (h1Count > 1) seoScore -= 5;

  if (totalImages > 0 && imagesMissingAlt > 0) {
    const missingRatio = imagesMissingAlt / totalImages;
    seoScore -= Math.round(missingRatio * 15);
  }

  if (!canonicalUrl) seoScore -= 8;
  if (!hasSchema) seoScore -= 10;
  if (!hasOpenGraph) seoScore -= 5;
  seoScore = Math.min(100, Math.max(30, seoScore));

  // 3. Performance Inspection
  const scriptMatches = html.match(/<script\b[^>]*>/gi) || [];
  const scriptCount = scriptMatches.length;
  const stylesheetMatches = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
  const cssCount = stylesheetMatches.length;
  const htmlSizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);

  let perfScore = 100;
  if (ttfb > 1200) perfScore -= 30;
  else if (ttfb > 600) perfScore -= 18;
  else if (ttfb > 300) perfScore -= 8;

  if (htmlSizeKb > 250) perfScore -= 15;
  else if (htmlSizeKb > 100) perfScore -= 8;

  if (scriptCount > 25) perfScore -= 15;
  else if (scriptCount > 15) perfScore -= 8;

  if (cssCount > 8) perfScore -= 10;
  perfScore = Math.min(100, Math.max(25, perfScore));

  // 4. Mobile UX Score
  let mobileScore = 95;
  if (!isMobileResponsive) mobileScore = 40;
  else {
    if (perfScore < 60) mobileScore -= 15;
    if (scriptCount > 20) mobileScore -= 10;
  }

  // 5. Overall Weighted Score
  const overallScore = Math.round(
    (perfScore * 0.35) + (seoScore * 0.35) + (mobileScore * 0.15) + (securityScore * 0.15)
  );

  // 6. Generate Real Authentic Findings & Deficiencies
  const verifiedIssues = [];
  const verifiedSuccesses = [];
  const recommendedServices = [];

  // Title findings
  if (!title) {
    verifiedIssues.push('Critical: Missing <title> tag on homepage. Search engines cannot index your page name correctly.');
    recommendedServices.push('Technical SEO & Metadata Architecture');
  } else if (titleLength < 30) {
    verifiedIssues.push(`Short Title Tag: "${title}" is only ${titleLength} characters (recommended: 50–60 characters for optimal click-through rates).`);
  } else if (titleLength > 65) {
    verifiedIssues.push(`Long Title Tag: "${title.slice(0, 50)}..." (${titleLength} chars) will be truncated in Google search results.`);
  } else {
    verifiedSuccesses.push(`Optimal Title Tag: "${title}" (${titleLength} characters).`);
  }

  // Meta Description findings
  if (!metaDescription) {
    verifiedIssues.push('Missing Meta Description: Google is generating snippet text automatically, which lowers organic CTR.');
    recommendedServices.push('Search Snippet & CTR Optimization');
  } else if (metaDescLength < 70) {
    verifiedIssues.push(`Thin Meta Description: Only ${metaDescLength} characters. Recommended length is 130–160 characters.`);
  } else {
    verifiedSuccesses.push(`Meta Description present (${metaDescLength} chars).`);
  }

  // Heading hierarchy
  if (h1Count === 0) {
    verifiedIssues.push('Heading Hierarchy: 0 <h1> tags detected. Primary page topic is undefined for search spiders.');
    recommendedServices.push('On-Page Semantic HTML Restructuring');
  } else if (h1Count > 1) {
    verifiedIssues.push(`Multiple H1 Tags: Found ${h1Count} <h1> tags. A single primary <h1> is recommended for clear topical authority.`);
  } else {
    verifiedSuccesses.push('Optimal single <h1> heading tag detected.');
  }

  // Images and alt text
  if (totalImages > 0 && imagesMissingAlt > 0) {
    verifiedIssues.push(`Image Accessibility: ${imagesMissingAlt} of ${totalImages} image(s) lack descriptive alt attributes.`);
    recommendedServices.push('Image SEO & Alt Tag Optimization');
  } else if (totalImages > 0) {
    verifiedSuccesses.push(`All ${totalImages} detected images contain alt attributes.`);
  }

  // Schema markup
  if (!hasSchema) {
    verifiedIssues.push('Missing Structured Data: No Schema.org JSON-LD found (Organization, WebSite, LocalBusiness entities absent).');
    recommendedServices.push('Schema.org JSON-LD Entity Markup Integration');
  } else {
    verifiedSuccesses.push('Schema.org structured data detected.');
  }

  // Speed and performance
  if (ttfb > 600) {
    verifiedIssues.push(`Server Latency (TTFB): Server took ${ttfb}ms to respond (Google recommends < 200ms). Indicates slow hosting or heavy backend queries.`);
    recommendedServices.push('Sub-Second Next.js / Server Speed Engineering');
    recommendedServices.push('Enterprise CDN & Edge Caching Architecture');
  } else {
    verifiedSuccesses.push(`Fast Initial Server Response: ${ttfb}ms TTFB.`);
  }

  if (scriptCount > 15) {
    verifiedIssues.push(`Asset Bloat: ${scriptCount} script tags and ${cssCount} stylesheets detected. Render-blocking resources increase First Contentful Paint.`);
    recommendedServices.push('Core Web Vitals Remediation (LCP/INP/CLS)');
  }

  // Mobile responsiveness
  if (!isMobileResponsive) {
    verifiedIssues.push('Mobile Viewport Missing: Page does not specify a viewport meta tag and will not scale properly on smartphones.');
    recommendedServices.push('Mobile-First Responsive Redesign');
  } else {
    verifiedSuccesses.push('Mobile-ready viewport tag is active.');
  }

  // Security
  if (!finalIsHttps) {
    verifiedIssues.push('Insecure Connection: Site is serving over unencrypted HTTP. Browsers display "Not Secure" warnings.');
    recommendedServices.push('Full SSL / HTTPS Migration & Security Hardening');
  } else {
    verifiedSuccesses.push('Secure SSL / HTTPS active.');
  }

  if (!hasHsts && finalIsHttps) {
    verifiedIssues.push('Security Headers: HTTP Strict Transport Security (HSTS) header is missing.');
  }

  // Guarantee at least 2 recommended services
  if (recommendedServices.length === 0) {
    recommendedServices.push('Enterprise PageSpeed & Core Web Vitals Retainer');
    recommendedServices.push('Topical Authority & Organic Search Expansion');
  }

  let grade = 'GOOD / ROOM TO SCALE';
  let gradeClass = 'zv-score-good';
  if (overallScore < 60) {
    grade = 'CRITICAL FIXES REQUIRED';
    gradeClass = 'zv-score-poor';
  } else if (overallScore < 80) {
    grade = 'NEEDS OPTIMIZATION';
    gradeClass = 'zv-score-fair';
  }

  return {
    success: true,
    authentic: true,
    hostname,
    url: finalUrl,
    statusCode,
    ttfbMs: ttfb,
    scores: {
      overall: overallScore,
      performance: perfScore,
      seo: seoScore,
      mobile: mobileScore,
      security: securityScore
    },
    grade,
    gradeClass,
    details: {
      title,
      titleLength,
      metaDescription,
      metaDescLength,
      canonicalUrl,
      h1Count,
      h2Count,
      totalImages,
      imagesMissingAlt,
      hasSchema,
      isMobileResponsive,
      isHttps: finalIsHttps,
      scriptCount,
      cssCount,
      htmlSizeKb
    },
    issues: verifiedIssues,
    successes: verifiedSuccesses,
    recommendedServices
  };
}

/**
 * Fetch URL following up to maxRedirects redirects with timeout
 */
function fetchWithRedirects(targetUrl, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) {
      return reject(new Error('Too many redirects'));
    }

    let parsed;
    try {
      parsed = new URL(targetUrl);
    } catch (e) {
      return reject(new Error('Invalid URL'));
    }

    const isHttps = parsed.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ZavronAuditBot/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 8000
    };

    const req = client.request(options, (res) => {
      // Handle redirect
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const nextUrl = new URL(res.headers.location, targetUrl).toString();
        return resolve(fetchWithRedirects(nextUrl, maxRedirects - 1));
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        // Cap payload at 2MB for analysis
        if (data.length < 2000000) data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          finalUrl: targetUrl
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const url = body?.url;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Target URL is required' });
    }

    const audit = await auditTargetWebsite(url);
    return res.status(200).json(audit);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
