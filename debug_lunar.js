const fs = require('fs');
const html = fs.readFileSync(__dirname + '/kymon.html', 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const stub = { addEventListener: function () {}, value: '', innerHTML: '', style: {}, dataset: {}, id: '', checked: false };
const document = { getElementById: function () { return stub; }, querySelectorAll: function () { return []; } };
const window = {};

const testCode = `
const lunar = convertSolar2Lunar(20, 8, 2026, 7.0);
console.log('Lunar 20/8/2026: ' + lunar.day + '/' + lunar.month + '/' + lunar.year + ' (leap=' + lunar.leap + ')');
const lunar2 = convertSolar2Lunar(8, 8, 2026, 7.0);
console.log('Lunar 8/8/2026: ' + lunar2.day + '/' + lunar2.month + '/' + lunar2.year);
const lunar3 = convertSolar2Lunar(23, 8, 2026, 7.0);
console.log('Lunar 23/8/2026: ' + lunar3.day + '/' + lunar3.month + '/' + lunar3.year);
`;
eval(js + testCode);
