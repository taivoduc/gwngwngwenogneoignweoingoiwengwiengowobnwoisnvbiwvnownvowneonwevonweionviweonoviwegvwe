const fs = require('fs');
const html = fs.readFileSync('bazi_page.html', 'utf8');

// Split into palace boxes
const boxes = html.split(/<!--number \d+-->/g);
// boxes[0] is preamble; boxes[1..9] are the 9 palaces

function clean(s) {
  return (s || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

const results = [];
for (let i = 1; i < boxes.length && i <= 9; i++) {
  const b = boxes[i];
  // spirit
  const spiritMatch = b.match(/<div class="item-top">[\s\S]*?item-text-1[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
  // heaven stem (text-wrapper-1 within item-center, before Sao)
  const itemCenter = b.match(/<div class="item-center">([\s\S]*?)<!--Sao-->/);
  const itemBottom = b.match(/<div class="item-bottom">([\s\S]*?)$/);

  let spirit = '';
  const sm = b.match(/<div class="text-wrapper(-2)?">([^<]*)<\/div>/);
  if (sm) spirit = sm[2].trim();

  // heaven stem: first text-wrapper-1 active block
  let heaven = '';
  const hm = b.match(/class="text-wrapper-1[^"]*">\s*<div class="text-mu">([^<]*)<\/div>/);
  const hm2 = b.match(/class="text-wrapper-1[^"]*">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/);
  if (hm) heaven = hm[1].trim();
  else if (hm2) heaven = hm2[1].trim();

  // star
  let star = '';
  const stm = b.match(/class="text-wrapper-center-top[^"]*">[\s\S]*?<div class="text-wrapper-(?:5|11)">([^<]*)<\/div>/);
  if (stm) star = stm[1].trim();

  // earth stem (item-bottom, first item-text-1)
  let earth = '';
  const em = b.match(/<div class="item-bottom">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/);
  if (em) earth = em[1].trim();

  // gate (text-wrapper-8)
  let gate = '';
  const gm = b.match(/<div class="text-wrapper-8">([^<]*)<\/div>/);
  if (gm) gate = gm[1].trim();

  // number
  let num = '';
  const nm = b.match(/<div class="text-wrapper-9">\s*([0-9])\s*<\/div>/);
  if (nm) num = nm[1];

  results.push({ box: i, spirit, heaven, star, earth, gate, num });
}

console.log('box | spirit | heaven | star | earth | gate | num');
for (const r of results) {
  console.log(`${r.box} | ${r.spirit} | ${r.heaven} | ${r.star} | ${r.earth} | ${r.gate} | ${r.num}`);
}

// Also extract the center "Thời Bàn" content
const center = html.match(/Thời Bàn[\s\S]*?(\d{2}\/\d{2}\/\d{4}[^<]*)/);
console.log('\nCenter (Thời Bàn) found:', center ? center[1].trim() : 'N/A');

// Extract the "thời bàn" stems (Quý Quý)
const qq = html.match(/text-wrapper-(?:10|9)[^>]*>\s*癸\s*<\/div>/g);
console.log('癸 occurrences in center region:', qq ? qq.length : 0);
