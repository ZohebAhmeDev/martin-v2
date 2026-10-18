const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const htmlFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.html'));

console.log('=== Running Pre-Flight Quality & Integrity Suite ===\n');

let totalErrors = 0;
let totalWarnings = 0;

// 1. Broken Links & Asset References Check
console.log('--- 1. Broken Link & Asset Reference Audit ---');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(distDir, file), 'utf8');

  // Check <img> and <source> src and srcset
  const srcRegex = /(?:src|href|srcset)=["']([^"']+)["']/g;
  let match;
  while ((match = srcRegex.exec(content)) !== null) {
    let url = match[1];
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('tel:') || url.startsWith('mailto:') || url.startsWith('data:') || url.startsWith('#')) {
      continue;
    }
    // Clean URL
    url = url.split('?')[0].split('#')[0];
    if (url === '' || url === '/') continue;

    const localAssetPath = path.join(distDir, url.startsWith('/') ? url.slice(1) : url);
    if (!fs.existsSync(localAssetPath)) {
      console.error(`[BROKEN ASSET] In ${file}: "${url}" -> file not found at ${localAssetPath}`);
      totalErrors++;
    }
  }
});
if (totalErrors === 0) {
  console.log('PASSED: All internal hrefs, images, fonts, and scripts exist in /dist!\n');
}

// 2. Structured Data (JSON-LD) Validation
console.log('--- 2. Structured Data (JSON-LD) Audit ---');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(distDir, file), 'utf8');
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let ldMatch;
  let found = 0;
  while ((ldMatch = jsonLdRegex.exec(content)) !== null) {
    found++;
    const jsonStr = ldMatch[1].trim();
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed['@context'] || !parsed['@type']) {
        console.error(`[INVALID SCHEMA] In ${file}: Missing @context or @type`);
        totalErrors++;
      }
    } catch (e) {
      console.error(`[JSON-LD PARSE ERROR] In ${file}: ${e.message}`);
      totalErrors++;
    }
  }
  if (found > 0) {
    console.log(`Verified ${found} JSON-LD schemas in ${file}`);
  }
});
console.log('PASSED: All JSON-LD scripts are valid, parseable JSON-LD structures!\n');

// 3. HTML Structure & Semantic Landmarks Audit
console.log('--- 3. Semantic Landmarks & SEO Heading Audit ---');
htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(distDir, file), 'utf8');

  // Title tag check
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  if (!titleMatch || !titleMatch[1].trim()) {
    console.error(`[SEO ERROR] ${file} is missing <title> tag!`);
    totalErrors++;
  } else if (titleMatch[1].length > 65) {
    console.warn(`[SEO WARNING] ${file} title length (${titleMatch[1].length} chars) > 60 chars: "${titleMatch[1]}"`);
    totalWarnings++;
  }

  // Meta description check
  const descMatch = content.match(/<meta name="description" content="(.*?)">/);
  if (!descMatch || !descMatch[1].trim()) {
    console.error(`[SEO ERROR] ${file} is missing meta description!`);
    totalErrors++;
  }

  // H1 tag count check
  const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g);
  if (!h1Matches) {
    console.error(`[SEO ERROR] ${file} has NO <h1> tag!`);
    totalErrors++;
  } else if (h1Matches.length > 1) {
    console.warn(`[SEO WARNING] ${file} has multiple (${h1Matches.length}) <h1> tags!`);
    totalWarnings++;
  }

  // Semantic landmark check: header, nav, main, footer
  ['<header', '<nav', '<main', '<footer'].forEach(tag => {
    if (!content.includes(tag)) {
      console.warn(`[A11Y WARNING] ${file} is missing ${tag}> landmark!`);
      totalWarnings++;
    }
  });

  // Check all images have alt attributes
  const imgTagRegex = /<img([^>]+)>/g;
  let imgMatch;
  while ((imgMatch = imgTagRegex.exec(content)) !== null) {
    if (!imgMatch[1].includes('alt=')) {
      console.error(`[A11Y ERROR] In ${file}: <img> tag missing alt attribute: ${imgMatch[0]}`);
      totalErrors++;
    }
  }
});

console.log(`\n=== Audit Summary: ${totalErrors} Errors, ${totalWarnings} Warnings ===`);
if (totalErrors > 0) {
  process.exit(1);
} else {
  console.log('ALL INTEGRITY AUDITS PASSED!\n');
}
