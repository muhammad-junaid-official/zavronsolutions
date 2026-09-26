# Zavron Solutions Website Documentation

## 1. Overview
The Zavron Solutions website is a modern, high-performance, mobile-first agency platform built for capturing enterprise B2B leads in the US market. The architecture is primarily static HTML/CSS with modular, component-based vanilla JavaScript for interactive elements. It integrates a custom Node.js server to handle AI live chat, lead capture, and a unified Admin Dashboard.

## 2. Technology Stack
- **Frontend Core**: Vanilla HTML5, CSS3, JavaScript (ES Modules).
- **Styling**: Custom modular CSS architecture without heavy frameworks (`global.css`, `components.css`, `variables.css`).
- **Animations**: Subtle, high-performance CSS and JS animations (`animations.css`).
- **Backend Orchestrator**: Node.js (`server.js`) running Express-like native HTTP routing.
- **AI Intelligence**: OpenAI GPT-4o-mini integrated for conversational support.
- **Email/IMAP Engine**: `nodemailer`, `imap-simple`, `mailparser` for two-way email syncing.
- **Build Tooling**: Vite for fast bundling and local previewing.

## 3. Directory Architecture
- **`/assets/`**: Images, favicons, branding SVGs, and other media.
- **`/css/`**: Core stylesheets.
- **`/js/`**: Client-side logic, including the AI Chatbot (`chatbot.js`), navigation (`main.js`), and the unified dashboard logic (`admin.js`).
- **`/api/`**: Serverless functions/endpoints handling chatbot responses and email dispatch.
- **`/scripts/`**: Backend orchestration scripts (`imapService.js`, `emailService.js`, etc.).
- **`/services/`**: Landing pages for core offerings (Web Development, SEO, WordPress, Shopify, PPC, etc.).
- **`/industries/`**: Targeted landing pages for specific verticals (Real Estate, Healthcare, Law Firms, etc.).
- **`/blog/`**: Content marketing hub optimized for Topical Authority and SEO.
- **`/case-studies/`**: Detailed project breakdowns showing measurable ROI.

## 4. Key Features & Functionality

### 4.1 Enterprise AI Chatbot
- **Conversational Engine**: Uses OpenAI to answer prospects' questions naturally.
- **Zavron Knowledge Base**: The bot is strictly constrained via its System Prompt to only answer questions relating to Zavron Solutions, its pricing, services, and team.
- **Multi-lingual Detection**: Natively detects and responds in the user's language, including Roman Urdu, traditional Urdu, Spanish, and French.
- **Lead Capture**: Seamlessly invites users to book 15-minute consultations with CEO Muhammad Junaid.

### 4.2 Unified Admin Dashboard (Chat & Email)
- **Live Chat Panel**: Admins can monitor ongoing chatbot conversations in real-time via Server-Sent Events (SSE).
- **Two-Way Email Syncing**: The Node.js server polls the IMAP server (`zavronsolutions@gmail.com`) every 10 seconds. Incoming inquiry emails instantly appear in the Admin Dashboard exactly like live chat sessions.
- **Admin Replies**: When an admin types a reply from the dashboard, it is dispatched via SMTP using a beautifully branded, mobile-responsive HTML email template.

### 4.3 High-Performance SEO & Schema
- **JSON-LD Structured Data**: Implemented across 100% of the site.
- **Granular Schemas**: 
  - `Organization` & `WebPage` for core pages.
  - Rich `Service` schemas (with pricing data) for all services.
  - `Article` schema for Case Studies.
  - `CollectionPage` schema for aggregate lists.
- **Core Web Vitals Optimized**: Zero cumulative layout shift (CLS), highly optimized LCP.

## 5. Deployment & Execution
- **Local Development**: Run `npm run dev` to use Vite for rapid frontend styling.
- **Full Server Environment**: Run `npm start` (or `node server.js`) to launch the unified environment containing both the web host and the IMAP/SMTP services on `http://localhost:3000`.

## 6. Maintenance & Updates
- **Adding Services**: Duplicate an existing service folder in `/services/`, update the `index.html` copy, and ensure the schema correctly reflects the new service.
- **Modifying Chatbot Prompt**: Update the OpenAI `system` instructions within `server.js` (around line 308).
- **Modifying Email Templates**: Update the branded HTML payloads within `scripts/emailService.js`.
