const fs = require('fs');
let sitemap = fs.readFileSync('sitemap.xml', 'utf8');

const regex = /<url>\s*<loc>https:\/\/www\.zavronsolutions\.com\/case-studies\/apex-health-tech\/?<\/loc>[\s\S]*?<\/url>/gi;
const regex2 = /<url>\s*<loc>https:\/\/www\.zavronsolutions\.com\/case-studies\/apex-health-tec\/?<\/loc>[\s\S]*?<\/url>/gi;

sitemap = sitemap.replace(regex, '');
sitemap = sitemap.replace(regex2, '');

fs.writeFileSync('sitemap.xml', sitemap, 'utf8');
console.log('Removed apex health case study from sitemap.');
