/**
 * ZAVRON SOLUTIONS — REAL-TIME SEO ANALYZER & AUDIT ENGINE
 * Evaluates Title, Meta Description, Content Structure, Keyword Density,
 * Internal Linking, Media Alt Tags, and generates granular, pinpoint suggestions.
 */

export class ZavronSEOAnalyzer {
  constructor() {
    this.score = 0;
    this.checks = {
      critical: [],
      warning: [],
      passed: []
    };
    this.status = 'poor';
  }

  /**
   * Run a comprehensive SEO audit with exact locations and fix recommendations
   * @param {Object} data - { title, slug, metaDescription, focusKeyword, contentHtml, featuredImage }
   * @returns {Object} Complete SEO report with scores, granular checklists, and auto-fix templates
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

    const critical = [];
    const warning = [];
    const passed = [];
    let totalScore = 0;

    // -------------------------------------------------------------
    // 1. TITLE TAG CHECKS (Weight: 20 points)
    // -------------------------------------------------------------
    const titleLen = title.length;
    if (titleLen === 0) {
      critical.push({
        category: 'Title',
        location: 'Title Field',
        title: 'Title is completely missing',
        detail: 'Your post must have a descriptive H1/Title for Google to index and rank it.',
        action: 'Add a 50–65 character title including your focus keyword.',
        fixSnippet: keyword ? `${this.capitalizeWords(keyword)}: Complete Guide for US Businesses in 2026` : ''
      });
    } else if (titleLen >= 48 && titleLen <= 65) {
      totalScore += 10;
      passed.push({
        category: 'Title',
        location: 'Title Tag',
        title: `Optimal Title Length (${titleLen} chars)`,
        detail: 'Title fits within the 600px desktop and mobile Google SERP pixel limit.'
      });
    } else if (titleLen < 48) {
      const diff = 48 - titleLen;
      const pts = Math.max(3, Math.round(10 * (titleLen / 48)));
      totalScore += pts;
      warning.push({
        category: 'Title',
        location: 'Title Tag',
        title: `Title is short (${titleLen}/48 chars) — missing ~${diff} characters`,
        detail: `Google rewards descriptive titles. Missing modifiers like year ("2026"), format ("Complete Guide"), or target market ("US Businesses").`,
        action: `Expand title: add "${keyword ? keyword + ' - ' : ''}Strategic Guide for 2026"`
      });
    } else {
      totalScore += 6;
      warning.push({
        category: 'Title',
        location: 'Title Tag',
        title: `Title is long (${titleLen}/65 chars) and will truncate with '...'`,
        detail: `Google cuts off titles beyond 65 characters on mobile & desktop SERPs. Shorten by ${titleLen - 65} chars.`,
        action: 'Trim unnecessary filler words while keeping the focus keyword early.'
      });
    }

    // Keyword in Title
    if (keyword) {
      if (title.toLowerCase().includes(keyword)) {
        totalScore += 10;
        const index = title.toLowerCase().indexOf(keyword);
        if (index <= 15) {
          passed.push({
            category: 'Title',
            location: `Title (Position ${index})`,
            title: `Focus keyword placed at front of Title`,
            detail: `"${keyword}" is placed prominently in the first 15 characters for maximum ranking power.`
          });
        } else {
          passed.push({
            category: 'Title',
            location: `Title (Position ${index})`,
            title: `Focus keyword present in Title`,
            detail: `"${keyword}" is included in the title tag.`
          });
        }
      } else {
        critical.push({
          category: 'Title',
          location: 'Title Tag',
          title: `Focus keyword "${keyword}" is missing from Title`,
          detail: 'Primary search ranking requires the exact focus keyword in the title.',
          action: `Add "${keyword}" into your title.`,
          fixSnippet: `${this.capitalizeWords(keyword)} — Best Strategies for 2026`
        });
      }
    } else {
      warning.push({
        category: 'General',
        location: 'Focus Keyword Input',
        title: 'No Focus Keyword specified',
        detail: 'Define a target phrase (e.g. "enterprise web development") to unlock keyword density and heading audits.',
        action: 'Enter a focus keyword in the field above.'
      });
    }

    // -------------------------------------------------------------
    // 2. META DESCRIPTION CHECKS (Weight: 20 points)
    // -------------------------------------------------------------
    const descLen = metaDesc.length;
    if (descLen === 0) {
      critical.push({
        category: 'Meta Description',
        location: 'Meta Description Field',
        title: 'Meta description is missing',
        detail: 'Without a meta snippet, Google extracts random content chunks that lower Click-Through Rate (CTR).',
        action: 'Write a 140–160 character meta description with a clear Call-To-Action (CTA).',
        fixSnippet: keyword ? `Discover actionable insights on ${keyword}. Learn how US businesses scale performance and conversions in 2026. Get a free quote today.` : ''
      });
    } else if (descLen >= 135 && descLen <= 165) {
      totalScore += 10;
      passed.push({
        category: 'Meta Description',
        location: 'Meta Description',
        title: `Optimal Meta Length (${descLen}/160 characters)`,
        detail: 'Snippet fits Google snippet viewport without ellipsis truncation.'
      });
    } else if (descLen < 135) {
      const diff = 135 - descLen;
      const pts = Math.max(3, Math.round(10 * (descLen / 135)));
      totalScore += pts;
      warning.push({
        category: 'Meta Description',
        location: 'Meta Description',
        title: `Meta description is short (${descLen}/135 chars) — add ~${diff} chars`,
        detail: 'Take advantage of search snippet real-estate by including client benefits and a CTA (e.g., "Learn more" or "Get a free quote").',
        action: 'Add a concluding benefit or CTA phrase.'
      });
    } else {
      totalScore += 5;
      warning.push({
        category: 'Meta Description',
        location: 'Meta Description',
        title: `Meta description is long (${descLen}/165 chars)`,
        detail: `Google will cut off snippet text after ~160 characters. Remove ${descLen - 160} characters.`,
        action: 'Trim the end of your meta description to under 160 chars.'
      });
    }

    // Keyword in Meta Description
    if (keyword) {
      if (metaDesc.toLowerCase().includes(keyword)) {
        totalScore += 10;
        passed.push({
          category: 'Meta Description',
          location: 'Meta Description',
          title: `Focus keyword present in Meta Description`,
          detail: `"${keyword}" will be bolded in Google search results when matching user search queries.`
        });
      } else {
        critical.push({
          category: 'Meta Description',
          location: 'Meta Description',
          title: `Focus keyword "${keyword}" missing from Meta Description`,
          detail: 'Including the target keyword boosts organic CTR by making the snippet bold in search results.',
          action: `Work "${keyword}" naturally into the first sentence of your meta description.`
        });
      }
    }

    // -------------------------------------------------------------
    // 3. URL SLUG CHECKS (Weight: 10 points)
    // -------------------------------------------------------------
    if (!slug) {
      critical.push({
        category: 'URL Slug',
        location: 'URL Slug Field',
        title: 'URL Slug is missing',
        detail: 'Every article requires a clean, SEO-friendly permalink structure.',
        action: 'Click "Auto" to generate a slug from your title.'
      });
    } else {
      if (slug.length <= 60 && /^[a-z0-9-]+$/.test(slug)) {
        totalScore += 5;
        passed.push({
          category: 'URL Slug',
          location: `/blog/${slug}/`,
          title: 'Clean, SEO-friendly URL Slug structure',
          detail: 'Contains only lowercase letters, numbers, and hyphens.'
        });
      } else {
        warning.push({
          category: 'URL Slug',
          location: `/blog/${slug}/`,
          title: 'Slug contains invalid characters or is too long',
          detail: 'Keep slugs clean, short, and lowercase without special characters.',
          action: 'Use standard lowercase-hyphen format (e.g. enterprise-web-development-trends).'
        });
      }

      if (keyword && slug.includes(keyword.replace(/\s+/g, '-'))) {
        totalScore += 5;
        passed.push({
          category: 'URL Slug',
          location: `/blog/${slug}/`,
          title: `Focus keyword present in URL Slug`,
          detail: `URL path includes "/${keyword.replace(/\s+/g, '-')}/".`
        });
      } else if (keyword) {
        warning.push({
          category: 'URL Slug',
          location: `/blog/${slug}/`,
          title: `Focus keyword not reflected in URL Slug`,
          detail: `Having "${keyword.replace(/\s+/g, '-')}" in the URL helps Google understand page taxonomy.`,
          action: `Consider updating slug to include "${keyword.replace(/\s+/g, '-')}".`
        });
      }
    }

    // -------------------------------------------------------------
    // 4. CONTENT & HEADING HIERARCHY (Weight: 30 points)
    // -------------------------------------------------------------
    const h2Matches = contentHtml.match(/<h2[^>]*>(.*?)<\/h2>/gis) || [];
    const h3Matches = contentHtml.match(/<h3[^>]*>(.*?)<\/h3>/gis) || [];

    // Word Count
    if (wordCount >= 800) {
      totalScore += 10;
      passed.push({
        category: 'Content Length',
        location: 'Body Content',
        title: `Comprehensive Word Count (${wordCount} words)`,
        detail: 'Deep, authoritative content ranks higher in competitive Google search niches.'
      });
    } else if (wordCount >= 300) {
      totalScore += 6;
      warning.push({
        category: 'Content Length',
        location: 'Body Content',
        title: `Moderate Content Length (${wordCount}/800 words)`,
        detail: 'Article is acceptable, but 800–1,500 words is recommended for dominating US agency keywords.',
        action: 'Add case study examples, comparison tables, or FAQ sections to expand depth.'
      });
    } else {
      critical.push({
        category: 'Content Length',
        location: 'Body Content',
        title: `Thin content detected (${wordCount} words)`,
        detail: 'Google algorithmically downranks thin articles with fewer than 300 words.',
        action: 'Write at least 300–600 words of original content.'
      });
    }

    // H2 Headings Check
    if (h2Matches.length >= 2) {
      totalScore += 5;
      passed.push({
        category: 'Headings',
        location: 'Content H2 Structure',
        title: `Good Subheading Breakdown (${h2Matches.length} H2 sections found)`,
        detail: 'Content is cleanly structured for readers and crawler parsers.'
      });
    } else if (h2Matches.length === 1) {
      totalScore += 2;
      warning.push({
        category: 'Headings',
        location: 'Content Body',
        title: 'Only 1 H2 subheading found',
        detail: 'Break long blocks of text into at least 2 to 4 major H2 topic sections.',
        action: 'Add <h2>Key Technical Considerations</h2> or <h2>Why Scalability Matters</h2>.'
      });
    } else {
      critical.push({
        category: 'Headings',
        location: 'Content Body',
        title: 'No <h2> subheadings detected in content',
        detail: 'Heading tags (H2/H3) are critical for on-page SEO and readability hierarchy.',
        action: 'Use the H2 button in the toolbar to add structured subheadings.',
        fixSnippet: `<h2>Key Strategies for ${this.capitalizeWords(keyword || 'Growth')}</h2>`
      });
    }

    // Keyword in H2 Check
    if (keyword && h2Matches.length > 0) {
      const h2WithKeyword = h2Matches.filter(h => h.toLowerCase().includes(keyword));
      if (h2WithKeyword.length > 0) {
        totalScore += 5;
        passed.push({
          category: 'Headings',
          location: 'H2 Subheadings',
          title: `Focus keyword present in H2 Heading (${h2WithKeyword.length} found)`,
          detail: 'Google heavily weights keywords found in secondary headings.'
        });
      } else {
        warning.push({
          category: 'Headings',
          location: 'H2 Subheadings',
          title: `Focus keyword "${keyword}" is missing in all H2 headings`,
          detail: 'None of your H2 subheadings mention the focus keyword. Update at least one H2.',
          action: `Change one H2 heading to include "${keyword}" (e.g. <h2>Implementing ${this.capitalizeWords(keyword)}</h2>).`
        });
      }
    }

    // First Paragraph Keyword Check
    if (keyword) {
      const first100Words = words.slice(0, 100).join(' ').toLowerCase();
      if (first100Words.includes(keyword)) {
        totalScore += 5;
        passed.push({
          category: 'Keyword Placement',
          location: 'Introduction (First 100 Words)',
          title: 'Keyword appears in Introduction paragraph',
          detail: `"${keyword}" is introduced right away to signal search intent to crawlers.`
        });
      } else {
        critical.push({
          category: 'Keyword Placement',
          location: 'Introduction (First 100 Words)',
          title: `Focus keyword "${keyword}" missing from first 100 words`,
          detail: 'Crawlers expect the primary topic keyword in the opening paragraph.',
          action: `Add "${keyword}" into the first sentence of your article.`,
          fixSnippet: `<p>In modern digital commerce, understanding <strong>${keyword}</strong> is critical for sustainable growth...</p>`
        });
      }
    }

    // Keyword Density Check
    if (keyword && wordCount > 50) {
      const regex = new RegExp(this.escapeRegExp(keyword), 'gi');
      const matches = (textContent.match(regex) || []).length;
      const density = ((matches / wordCount) * 100).toFixed(1);

      if (density >= 0.8 && density <= 2.5) {
        totalScore += 5;
        passed.push({
          category: 'Keyword Density',
          location: 'Body Content',
          title: `Healthy Keyword Density (${density}% — ${matches} occurrences)`,
          detail: 'Optimal frequency without keyword stuffing penalties.'
        });
      } else if (density < 0.8) {
        warning.push({
          category: 'Keyword Density',
          location: 'Body Content',
          title: `Low Keyword Density (${density}% — only ${matches} mentions in ${wordCount} words)`,
          detail: `Mention "${keyword}" a few more times throughout sub-sections (target 1–2%).`,
          action: `Include "${keyword}" in 2–3 more paragraphs.`
        });
      } else {
        warning.push({
          category: 'Keyword Density',
          location: 'Body Content',
          title: `High Keyword Density (${density}% — ${matches} mentions)`,
          detail: 'Density over 2.5% can trigger Google over-optimization / keyword stuffing filters.',
          action: 'Replace repetitive keyword mentions with synonyms or pronouns.'
        });
      }
    }

    // -------------------------------------------------------------
    // 5. INTERNAL LINKING & MEDIA ALT (Weight: 20 points)
    // -------------------------------------------------------------
    // Internal Links
    const internalLinkMatches = contentHtml.match(/<a[^>]*href=["']\/(services|industries|work|contact|blog|case-studies)[^"']*["']/gi) || [];
    if (internalLinkMatches.length >= 2) {
      totalScore += 10;
      passed.push({
        category: 'Internal Links',
        location: 'Body Content',
        title: `Strong Internal Linking (${internalLinkMatches.length} internal links)`,
        detail: 'Distributes PageRank authority and keeps visitors engaged across the site.'
      });
    } else if (internalLinkMatches.length === 1) {
      totalScore += 5;
      warning.push({
        category: 'Internal Links',
        location: 'Body Content',
        title: 'Only 1 internal link detected',
        detail: 'Add at least 2–3 contextual links to related Zavron service or industry pages.',
        action: 'Add a link to <a href="/services/web-development/">Web Development</a> or <a href="/services/seo/">SEO</a>.'
      });
    } else {
      critical.push({
        category: 'Internal Links',
        location: 'Body Content',
        title: 'No internal links to Zavron services/pages found',
        detail: 'Internal links are critical for crawl discovery and topical authority clustering.',
        action: 'Add relevant internal links (e.g., <a href="/services/web-development/">our web development services</a>).',
        fixSnippet: '<p>Explore how our <a href="/services/web-development/">custom web development services</a> deliver enterprise-grade performance.</p>'
      });
    }

    // Featured Image & Image Alt tags
    const imgMatches = contentHtml.match(/<img[^>]*>/gi) || [];
    let imagesWithoutAlt = 0;
    imgMatches.forEach(img => {
      if (!img.includes('alt=') || img.match(/alt=["']\s*["']/)) {
        imagesWithoutAlt++;
      }
    });

    if (featuredImage && !featuredImage.includes('undefined')) {
      totalScore += 5;
      passed.push({
        category: 'Media & Visuals',
        location: 'Featured Image',
        title: 'Featured Image / OpenGraph Visual Set',
        detail: `Using visual asset: ${featuredImage}`
      });
    } else {
      warning.push({
        category: 'Media & Visuals',
        location: 'Featured Image Field',
        title: 'Featured Image is not defined',
        detail: 'Articles with visual media achieve 94% more social shares and higher search clicks.',
        action: 'Provide a valid image path like "/assets/og-image.jpg".'
      });
    }

    if (imgMatches.length > 0 && imagesWithoutAlt === 0) {
      totalScore += 5;
      passed.push({
        category: 'Media & Visuals',
        location: 'Body Images',
        title: `All in-article images have Alt text (${imgMatches.length} images)`,
        detail: 'Fully compliant with accessibility and Google Image Search indexing.'
      });
    } else if (imagesWithoutAlt > 0) {
      warning.push({
        category: 'Media & Visuals',
        location: 'Body Images',
        title: `${imagesWithoutAlt} image(s) missing descriptive Alt attributes`,
        detail: 'Images without alt tags cannot rank in Google Image Search and harm accessibility.',
        action: 'Add alt="Descriptive keywords" to all <img> tags.'
      });
    } else {
      totalScore += 5;
    }

    // Final calculations
    totalScore = Math.min(100, Math.max(0, totalScore));
    let status = 'poor';
    if (totalScore >= 80) status = 'excellent';
    else if (totalScore >= 60) status = 'good';

    return {
      score: totalScore,
      status,
      wordCount,
      keywordDensity: keyword && wordCount > 0 ? (((contentHtml.match(new RegExp(this.escapeRegExp(keyword), 'gi')) || []).length / wordCount) * 100).toFixed(1) : 0,
      checks: {
        critical,
        warning,
        passed
      },
      serpPreview: {
        title: title ? `${title} | Zavron Solutions` : 'Page Title | Zavron Solutions',
        url: `https://www.zavronsolutions.com › blog › ${slug || 'article-slug'}`,
        description: metaDesc || 'Provide a meta description to see how your snippet appears in Google search results...'
      }
    };
  }

  capitalizeWords(str) {
    if (!str) return '';
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
