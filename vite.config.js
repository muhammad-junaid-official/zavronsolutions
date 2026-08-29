import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about-us/index.html'),
        services: resolve(__dirname, 'services/index.html'),
        serviceWebDev: resolve(__dirname, 'services/web-development/index.html'),
        serviceWordpress: resolve(__dirname, 'services/wordpress-development/index.html'),
        serviceEcommerce: resolve(__dirname, 'services/ecommerce-development/index.html'),
        serviceSeo: resolve(__dirname, 'services/seo/index.html'),
        serviceLocalSeo: resolve(__dirname, 'services/local-seo/index.html'),
        serviceTechnicalSeo: resolve(__dirname, 'services/technical-seo/index.html'),
        serviceEcommerceSeo: resolve(__dirname, 'services/ecommerce-seo/index.html'),
        serviceDigitalMarketing: resolve(__dirname, 'services/digital-marketing/index.html'),
        serviceGoogleAds: resolve(__dirname, 'services/google-ads/index.html'),
        serviceSocialMedia: resolve(__dirname, 'services/social-media-marketing/index.html'),
        serviceUiUx: resolve(__dirname, 'services/ui-ux-design/index.html'),
        work: resolve(__dirname, 'work/index.html'),
        caseStudies: resolve(__dirname, 'case-studies/index.html'),
        caseStudyDetail: resolve(__dirname, 'case-studies/apex-health-tech/index.html'),
        industries: resolve(__dirname, 'industries/index.html'),
        industryRealEstate: resolve(__dirname, 'industries/real-estate/index.html'),
        industryHealthcare: resolve(__dirname, 'industries/healthcare/index.html'),
        industryEcommerce: resolve(__dirname, 'industries/ecommerce/index.html'),
        industryRestaurants: resolve(__dirname, 'industries/restaurants/index.html'),
        industryLawFirms: resolve(__dirname, 'industries/law-firms/index.html'),
        industryConstruction: resolve(__dirname, 'industries/construction/index.html'),
        industrySaas: resolve(__dirname, 'industries/saas-technology/index.html'),
        industryProfServices: resolve(__dirname, 'industries/professional-services/index.html'),
        industrySmallBusiness: resolve(__dirname, 'industries/small-business/index.html'),
        resources: resolve(__dirname, 'resources/index.html'),
        guides: resolve(__dirname, 'resources/guides/index.html'),
        faqs: resolve(__dirname, 'resources/faqs/index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        blogPost: resolve(__dirname, 'blog/how-seo-drives-us-business-growth/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
        quote: resolve(__dirname, 'get-a-free-quote/index.html'),
        privacy: resolve(__dirname, 'privacy-policy/index.html'),
        terms: resolve(__dirname, 'terms-and-conditions/index.html'),
        cookies: resolve(__dirname, 'cookie-policy/index.html'),
        disclaimer: resolve(__dirname, 'disclaimer/index.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  }
});
