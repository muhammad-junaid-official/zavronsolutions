/**
 * ZAVRON SOLUTIONS — REAL-TIME SEO ANALYZER & AUDIT ENGINE
 * Evaluates Title, Meta Description, Content Structure, Keyword Density,
 * Internal Linking, Media Alt Tags, and generates actionable optimization steps.
 */

export class ZavronSEOAnalyzer {
  constructor() {
    this.score = 0;
    this.checks = [];
    this.status = 'poor'; // 'excellent', 'good', 'poor'
  }

  /**
   * Run a comprehensive SEO audit on post/page data
   * @param {Object} data - { title, slug, metaDescription, focusKeyword, contentHtml, featuredImage }
   * @returns {Object} Complete SEO report with scores, checks, and SERP preview data
   */
  analyze(data) {
    const title = (data.title || '').trim();
    const slug = (data.slug || '').trim();
    const metaDesc = (data.metaDescription || '').trim();
    const keyword = (data.focusKeyword || '').trim().toLowerCase();
    const contentHtml = data.contentHtml || '';
    const featuredImage = data.featuredImage || '';

    // Strip HTML to get plain text
    const textContent = contentHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textContent.length > 0 ? textContent.split(/\s+/).filter(w => w.length > 0) : [];
    const wordCount = words.length;

    const checks = [];
    let totalScore = 0;
    const maxScore = 100;

    // -------------------------------------------------------------
    // 1. TITLE TAG CHECKS (Weight: 20 points)
    // -------------------------------------------------------------
    const titleLen = title.length;
    if (titleLen === 0) {
      checks.push({
        type: 'critical',
        category: 'Title',
        title: 'Title is missing',
        detail: 'Your post must have a page title for search engines to index it.',
        points: 0,
        maxPoints: 10
      });
    } else if (titleLen >= 50 && titleLen <= 65) {
      totalScore += 10;
      checks.push({
        type: 'passed',
        category: 'Title',
        title: `Optimal Title Length (${titleLen} characters)`,
        detail: 'Title is within Google\'s recommended 50-65 character limit.',
        points: 10,
        maxPoints: 10
      });
    } else if (titleLen < 50) {
      const pts = Math.max(3, Math.round(10 * (titleLen / 50)));
      totalScore += pts;
      checks.push({
        type: 'warning',
        category: 'Title',
        title: `Title is a bit short (${titleLen}/50 chars)`,
        detail: 'Consider adding descriptive modifiers or target service location to improve CTR.',
        points: pts,
        maxPoints: 10
      });
    } else {
      totalScore += 6;
      checks.push({
        type: 'warning',
        category: 'Title',
        title: `Title may truncate on SERP (${titleLen}/65 chars)`,
        detail: 'Google may cut off titles longer than 65 characters on desktop and mobile displays.',
        points: 6,
        maxPoints: 10
      });
    }

    // Keyword in Title
    if (keyword) {
      if (title.toLowerCase().includes(keyword)) {
        totalScore += 10;
        const index = title.toLowerCase().indexOf(keyword);
        if (index <= 15) {
          checks.push({
            type: 'passed',
            category: 'Title',
            title: `Focus keyword appears early in Title`,
            detail: `"${keyword}" is placed prominently within the first words of the title.`,
            points: 10,
            maxPoints: 10
          });
        } else {
          checks.push({
            type: 'passed',
            category: 'Title',
            title: `Focus keyword present in Title`,
            detail: `"${keyword}" is included in the title tag.`,
            points: 8,
            maxPoints: 10
          });
        }
      } else {
        checks.push({
          type: 'critical',
          category: 'Title',
          title: `Focus keyword not found in Title`,
          detail: `Add "${keyword}" to your title tag to ensure search relevance.`,
          points: 0,
          maxPoints: 10
        });
      }
    } else {
      checks.push({
        type: 'warning',
        category: 'General',
        title: 'No Focus Keyword specified',
        detail: 'Define a primary target keyword (e.g., "custom web development") to unlock keyword scoring.',
        points: 0,
        maxPoints: 10
      });
    }

    // -------------------------------------------------------------
    // 2. META DESCRIPTION CHECKS (Weight: 20 points)
    // -------------------------------------------------------------
    const descLen = metaDesc.length;
    if (descLen === 0) {
      checks.push({
        type: 'critical',
        category: 'Meta Description',
        title: 'Meta description is missing',
        detail: 'Without a meta description, Google will extract random body snippets.',
        points: 0,
        maxPoints: 10
      });
    } else if (descLen >= 140 && descLen <= 165) {
      totalScore += 10;
      checks.push({
        type: 'passed',
        category: 'Meta Description',
        title: `Optimal Meta Description length (${descLen} characters)`,
        detail: 'Fits comfortably within Google desktop and mobile snippet viewports.',
        points: 10,
        maxPoints: 10
      });
    } else if (descLen < 140) {
      const pts = Math.max(3, Math.round(10 * (descLen / 140)));
      totalScore += pts;
      checks.push({
        type: 'warning',
        category: 'Meta Description',
        title: `Meta description is short (${descLen}/140 chars)`,
        detail: 'Aim for 140-160 characters to maximize search snippet real estate.',
        points: pts,
        maxPoints: 10
      });
    } else {
      totalScore += 6;
      checks.push({
        type: 'warning',
        category: 'Meta Description',
        title: `Meta description may truncate (${descLen}/165 chars)`,
        detail: 'Descriptions over 165 characters risk getting clipped with an ellipsis (...).',
        points: 6,
        maxPoints: 10
      });
    }

    // Keyword in Meta Description
    if (keyword) {
      if (metaDesc.toLowerCase().includes(keyword)) {
        totalScore += 10;
        checks.push({
          type: 'passed',
          category: 'Meta Description',
          title: `Focus keyword present in Meta Description`,
          detail: `Google will highlight "${keyword}" in bold when searchers query this term.`,
          points: 10,
          maxPoints: 10
        });
      } else {
        checks.push({
          type: 'critical',
          category: 'Meta Description',
          title: `Focus keyword missing from Meta Description`,
          detail: `Integrate "${keyword}" naturally with an engaging call to action.`,
          points: 0,
          maxPoints: 10
        });
      }
    }

    // -------------------------------------------------------------
    // 3. URL SLUG CHECKS (Weight: 10 points)
    // -------------------------------------------------------------
    if (!slug) {
      checks.push({
        type: 'critical',
        category: 'URL Slug',
        title: 'URL slug is empty',
        detail: 'A clean, hypen-separated URL slug is required for indexing.',
        points: 0,
        maxPoints: 10
      });
    } else {
      let slugPoints = 6;
      const isClean = /^[a-z0-9-]+$/.test(slug);
      if (isClean && slug.length <= 60) {
        slugPoints += 2;
      }
      if (keyword && slug.includes(keyword.replace(/\s+/g, '-'))) {
        slugPoints += 2;
        checks.push({
          type: 'passed',
          category: 'URL Slug',
          title: 'Focus keyword included in URL Slug',
          detail: `URL slug contains target keyword: /blog/${slug}/`,
          points: 10,
          maxPoints: 10
        });
        totalScore += 10;
      } else {
        totalScore += slugPoints;
        checks.push({
          type: keyword ? 'warning' : 'passed',
          category: 'URL Slug',
          title: keyword ? 'Focus keyword not found in URL slug' : 'URL slug format is clean',
          detail: keyword ? `Consider including "${keyword.replace(/\s+/g, '-')}" in the slug.` : 'Valid slug structure.',
          points: slugPoints,
          maxPoints: 10
        });
      }
    }

    // -------------------------------------------------------------
    // 4. CONTENT LENGTH & READABILITY (Weight: 20 points)
    // -------------------------------------------------------------
    if (wordCount === 0) {
      checks.push({
        type: 'critical',
        category: 'Content Length',
        title: 'Content is completely empty',
        detail: 'Add body content and insights to analyze content depth.',
        points: 0,
        maxPoints: 10
      });
    } else if (wordCount >= 1000) {
      totalScore += 10;
      checks.push({
        type: 'passed',
        category: 'Content Length',
        title: `Comprehensive Word Count (${wordCount} words)`,
        detail: 'Exceeds the 1,000-word threshold for high-ranking authoritative industry articles.',
        points: 10,
        maxPoints: 10
      });
    } else if (wordCount >= 500) {
      totalScore += 7;
      checks.push({
        type: 'passed',
        category: 'Content Length',
        title: `Good Word Count (${wordCount} words)`,
        detail: 'Meets minimum depth for standard blog posts. Consider expanding to 1,000+ for topical authority.',
        points: 7,
        maxPoints: 10
      });
    } else {
      const pts = Math.max(2, Math.round(10 * (wordCount / 500)));
      totalScore += pts;
      checks.push({
        type: 'critical',
        category: 'Content Length',
        title: `Thin content detected (${wordCount}/500 words)`,
        detail: 'Search engines rarely rank thin content below 500 words. Expand with actionable sub-topics.',
        points: pts,
        maxPoints: 10
      });
    }

    // Heading Structure
    const h2Count = (contentHtml.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (contentHtml.match(/<h3[^>]*>/gi) || []).length;
    if (h2Count >= 2) {
      totalScore += 10;
      checks.push({
        type: 'passed',
        category: 'Structure',
        title: `Strong Heading Hierarchy (${h2Count} H2s, ${h3Count} H3s)`,
        detail: 'Content is broken down into structured sections for optimal readability.',
        points: 10,
        maxPoints: 10
      });
    } else {
      totalScore += 3;
      checks.push({
        type: 'warning',
        category: 'Structure',
        title: `Insufficient Subheadings (${h2Count}/2 H2s)`,
        detail: 'Add at least 2-3 H2 subheadings to organize your ideas and capture long-tail keywords.',
        points: 3,
        maxPoints: 10
      });
    }

    // -------------------------------------------------------------
    // 5. KEYWORD DENSITY & PLACEMENT (Weight: 15 points)
    // -------------------------------------------------------------
    let keywordCount = 0;
    let density = 0;
    if (keyword && wordCount > 0) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      keywordCount = (textContent.match(regex) || []).length;
      density = ((keywordCount * keyword.split(' ').length) / wordCount) * 100;
      density = Math.round(density * 10) / 10; // 1 decimal

      // Keyword in first 100 words
      const first100Words = words.slice(0, 100).join(' ').toLowerCase();
      if (first100Words.includes(keyword)) {
        totalScore += 7;
        checks.push({
          type: 'passed',
          category: 'Keyword Placement',
          title: 'Focus keyword found in introduction',
          detail: `"${keyword}" appears in the first 100 words of the article.`,
          points: 7,
          maxPoints: 7
        });
      } else {
        checks.push({
          type: 'warning',
          category: 'Keyword Placement',
          title: 'Focus keyword not in first 100 words',
          detail: 'Place your keyword within the opening paragraph so crawlers confirm topic intent immediately.',
          points: 0,
          maxPoints: 7
        });
      }

      // Keyword Density
      if (density >= 0.8 && density <= 2.5) {
        totalScore += 8;
        checks.push({
          type: 'passed',
          category: 'Keyword Density',
          title: `Optimal Keyword Density (${density}%)`,
          detail: `Mentioned ${keywordCount} times. Natural distribution without stuffing.`,
          points: 8,
          maxPoints: 8
        });
      } else if (density < 0.8) {
        const pts = keywordCount > 0 ? 4 : 0;
        totalScore += pts;
        checks.push({
          type: keywordCount === 0 ? 'critical' : 'warning',
          category: 'Keyword Density',
          title: `Low Keyword Frequency (${density}%)`,
          detail: `"${keyword}" appears ${keywordCount} times. Recommended range is 1.0% – 2.5%.`,
          points: pts,
          maxPoints: 8
        });
      } else {
        totalScore += 3;
        checks.push({
          type: 'warning',
          category: 'Keyword Density',
          title: `High Keyword Density (${density}%)`,
          detail: `Possible keyword stuffing. Reduce keyword occurrences to sound more natural.`,
          points: 3,
          maxPoints: 8
        });
      }
    }

    // -------------------------------------------------------------
    // 6. TECHNICAL & MEDIA SEO (Weight: 15 points)
    // -------------------------------------------------------------
    // Featured Image Check
    if (featuredImage && featuredImage.trim().length > 0) {
      totalScore += 5;
      checks.push({
        type: 'passed',
        category: 'Media',
        title: 'Featured Image provided',
        detail: 'Visual banner configured for SERP thumbnail and social cards.',
        points: 5,
        maxPoints: 5
      });
    } else {
      checks.push({
        type: 'warning',
        category: 'Media',
        title: 'Missing Featured Image',
        detail: 'Add a featured graphic or SVG thumbnail to maximize social CTR.',
        points: 0,
        maxPoints: 5
      });
    }

    // Internal Link Check
    const internalLinks = (contentHtml.match(/href=["'](\/[^"']*|https?:\/\/zavronsolutions\.com[^"']*)["']/gi) || []).length;
    if (internalLinks >= 2) {
      totalScore += 5;
      checks.push({
        type: 'passed',
        category: 'Links',
        title: `Internal Links Detected (${internalLinks} links)`,
        detail: 'Passes PageRank equity to other Zavron services and resources.',
        points: 5,
        maxPoints: 5
      });
    } else {
      checks.push({
        type: 'warning',
        category: 'Links',
        title: `Few or No Internal Links (${internalLinks}/2)`,
        detail: 'Add at least 2 internal links to related services (e.g. /services/web-development/) or /get-a-free-quote/.',
        points: internalLinks > 0 ? 2 : 0,
        maxPoints: 5
      });
      if (internalLinks > 0) totalScore += 2;
    }

    // Image Alt tags in content
    const imgTags = contentHtml.match(/<img[^>]+>/gi) || [];
    if (imgTags.length > 0) {
      const missingAlt = imgTags.filter(img => !img.includes('alt=') || /alt=["']\s*["']/.test(img)).length;
      if (missingAlt === 0) {
        totalScore += 5;
        checks.push({
          type: 'passed',
          category: 'Accessibility & SEO',
          title: `All content images have Alt text (${imgTags.length} images)`,
          detail: 'Enhances Google Image Search ranking and accessibility.',
          points: 5,
          maxPoints: 5
        });
      } else {
        checks.push({
          type: 'warning',
          category: 'Accessibility & SEO',
          title: `${missingAlt} image(s) missing Alt text`,
          detail: 'Every image should describe its visual content with descriptive alt text.',
          points: 0,
          maxPoints: 5
        });
      }
    } else {
      // Award partial points if featured image exists
      totalScore += 5;
      checks.push({
        type: 'passed',
        category: 'Accessibility & SEO',
        title: 'Clean HTML structure',
        detail: 'No broken image alt tags detected.',
        points: 5,
        maxPoints: 5
      });
    }

    // Calculate final clamped score
    const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));
    let status = 'poor';
    if (finalScore >= 80) status = 'excellent';
    else if (finalScore >= 60) status = 'good';

    return {
      score: finalScore,
      status,
      wordCount,
      keywordCount,
      keywordDensity: density,
      checks: {
        critical: checks.filter(c => c.type === 'critical'),
        warning: checks.filter(c => c.type === 'warning'),
        passed: checks.filter(c => c.type === 'passed')
      },
      serpPreview: {
        title: title ? `${title} | Zavron Solutions` : 'Page Title | Zavron Solutions',
        url: `https://zavronsolutions.com/blog/${slug || 'article-slug'}/`,
        description: metaDesc || 'Provide an engaging meta description to see how your snippet will appear on Google search results...'
      }
    };
  }
}
