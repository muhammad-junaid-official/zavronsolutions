# Admin Dashboard — setup & how it works

URL: `https://www.zavronsolutions.com/admin/` (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## One-time setup in Vercel
1. **Storage → Create Database → Upstash (Redis)** → connect it to this project (Production + Preview).
   Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
2. **Settings → Environment Variables**: add `ADMIN_PASSWORD` (Secret). `SMTP_PASS` must already be set.
3. **Deployments → Redeploy** the latest deployment.

## What each tab does
| Tab | Data source | Real-time |
|---|---|---|
| Overview | posts, leads, chats, last SEO crawl | heartbeat every 5 s |
| All Blog Posts | dashboard posts (Redis) + static posts (`/_data/static-posts.json`, built) | yes |
| New Article & SEO | live SEO scoring in the browser; **Publish** makes `/blog/<slug>/` live instantly (server-rendered, in `/blog-sitemap.xml`) | — |
| Site SEO Monitor | crawls every URL in the sitemaps and scores title, meta, canonical, H1, schema, alt text, word count | on demand |
| Leads & Inquiries | every contact form, quote wizard and chatbot submission, with email-delivery status | new-lead alert within ~5 s |
| Live Chat | visitor chat transcripts; **Join** pauses the bot and your replies reach the visitor in ~3 s | yes |
| Profile Settings | name, signature, password change, SMTP check & test email | — |

## Architecture
- `api/admin.js` — single authenticated endpoint (`/api/admin?action=…`). HttpOnly + SameSite=Strict cookie, CSRF header, login rate-limit.
- `api/send-email.js` — saves each inquiry as a lead **before** emailing, so nothing is lost if SMTP fails.
- `api/chat.js` — chat messages, bot log, visitor polling for agent replies.
- `api/blog.js` — renders dashboard posts with the site's own article template (`/_tpl/article.html`), plus `/blog-sitemap.xml` and the blog list.
- `lib/` — database (`db.js`), auth, data model (`store.js`), SEO auditor, blog renderer.
- Without a database connected, data is kept in temporary memory only and the dashboard shows a warning.
