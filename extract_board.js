const fs = require('fs');
const html = fs.readFileSync('bazi_page.html', 'utf8');

// Find the board div
const start = html.indexOf('class="ban-ky-mon"');
const seg = html.slice(start, start + 60000);

// Replace images with their src basename for hints
let t = seg.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, (m, src) => {
  const base = src.split('/').pop().replace('.png', '').replace('.jpg', '');
  return ` [IMG:${base}] `;
});

// Insert newlines at structural boundaries
t = t.replace(/<\/(div|td|tr|table|p|h1|h2|h3|li)>/gi, '\n');
t = t.replace(/<(div|td|tr|p|li)[^>]*>/gi, '\n');
t = t.replace(/<br\s*\/?>/gi, '\n');

// Strip remaining tags
t = t.replace(/<[^>]+>/g, ' ');
t = t.replace(/&nbsp;/g, ' ');
t = t.replace(/&amp;/g, '&');
// collapse multiple spaces but keep newlines
t = t.replace(/[ \t]+/g, ' ');
t = t.replace(/ ?\n ?/g, '\n');
t = t.replace(/\n{2,}/g, '\n');

// Trim each line, drop empty
const lines = t.split('\n').map(l => l.trim()).filter(l => l.length > 0);
console.log(lines.join('\n'));
