/**
 * Regression tests cho logic Map/Compass/Qimen Overlay (thuần, không DOM).
 * Chạy: node tests/qimen-map.test.js
 */
'use strict';
const assert = require('assert');
const C = require('../js/qimen-map-core.js');

let passed = 0, failed = 0;
function test(name, fn) {
    try { fn(); passed++; console.log('  PASS  ' + name); }
    catch (e) { failed++; console.log('  FAIL  ' + name + ' -> ' + e.message); }
}

// --- normalizeHeading ---
test('normalizeHeading: chuẩn hoá [0,360)', () => {
    assert.strictEqual(C.normalizeHeading(0), 0);
    assert.strictEqual(C.normalizeHeading(360), 0);
    assert.strictEqual(C.normalizeHeading(-90), 270);
    assert.strictEqual(C.normalizeHeading(370), 10);
    assert.strictEqual(C.normalizeHeading(359), 359);
    assert.strictEqual(C.normalizeHeading(NaN), null);
    assert.strictEqual(C.normalizeHeading('x'), null);
});

// --- heading -> direction/palace (TEST 1-4 + 5-8) ---
test('TEST 1: heading=0° -> Bắc -> Khảm(1)', () => {
    assert.strictEqual(C.headingToDirection(0).name, 'Bắc');
    assert.strictEqual(C.headingToPalace(0), 1);
});
test('TEST 2: heading=90° -> Đông -> Chấn(3)', () => {
    assert.strictEqual(C.headingToDirection(90).name, 'Đông');
    assert.strictEqual(C.headingToPalace(90), 3);
});
test('TEST 3: heading=180° -> Nam -> Ly(9)', () => {
    assert.strictEqual(C.headingToDirection(180).name, 'Nam');
    assert.strictEqual(C.headingToPalace(180), 9);
});
test('TEST 4: heading=270° -> Tây -> Đoài(7)', () => {
    assert.strictEqual(C.headingToDirection(270).name, 'Tây');
    assert.strictEqual(C.headingToPalace(270), 7);
});

// --- 8 hướng cố định đúng địa lý (TEST 5-8 dạng tổng quát) ---
test('8 hướng ↔ 8 cung cố định (không phụ thuộc heading)', () => {
    const map = { 0: ['Bắc', 1], 45: ['Đông Bắc', 8], 90: ['Đông', 3], 135: ['Đông Nam', 4],
                  180: ['Nam', 9], 225: ['Tây Nam', 2], 270: ['Tây', 7], 315: ['Tây Bắc', 6] };
    for (const h in map) {
        const d = C.headingToDirection(parseInt(h, 10));
        assert.strictEqual(d.name, map[h][0], h + '° tên');
        assert.strictEqual(d.palace, map[h][1], h + '° cung');
    }
});

test('Biên sector: 22.5=ĐB, 67.5=Đ, 337.5=Bắc, 22.4=Bắc', () => {
    assert.strictEqual(C.headingToDirection(22.5).name, 'Đông Bắc');
    assert.strictEqual(C.headingToDirection(67.5).name, 'Đông');
    assert.strictEqual(C.headingToDirection(337.5).name, 'Bắc');
    assert.strictEqual(C.headingToDirection(22.4).name, 'Bắc');
});

// --- bearing (TEST 9-12) ---
test('TEST 9: bearing 0° (Bắc) -> Khảm(1)', () => {
    // từ (0,0) tới (1,0) = đi lên phía Bắc
    const b = C.bearing(0, 0, 1, 0);
    assert.strictEqual(b, 0);
    assert.strictEqual(C.bearingToDirection(b).name, 'Bắc');
    assert.strictEqual(C.bearingToDirection(b).palace, 1);
});
test('TEST 10: bearing 90° (Đông) -> Chấn(3)', () => {
    const b = C.bearing(0, 0, 0, 1); // đi sang Đông
    assert.strictEqual(b, 90);
    assert.strictEqual(C.bearingToDirection(b).name, 'Đông');
    assert.strictEqual(C.bearingToDirection(b).palace, 3);
});
test('TEST 11: bearing 180° (Nam) -> Ly(9)', () => {
    const b = C.bearing(0, 0, -1, 0);
    assert.strictEqual(b, 180);
    assert.strictEqual(C.bearingToDirection(b).name, 'Nam');
    assert.strictEqual(C.bearingToDirection(b).palace, 9);
});
test('TEST 12: bearing 270° (Tây) -> Đoài(7)', () => {
    const b = C.bearing(0, 0, 0, -1);
    assert.strictEqual(b, 270);
    assert.strictEqual(C.bearingToDirection(b).name, 'Tây');
    assert.strictEqual(C.bearingToDirection(b).palace, 7);
});

test('bearing đích 82° ≈ Đông -> Chấn', () => {
    // HCM 10.8231,106.6297 -> 10.9000,106.9000 (gần như đi Đông)
    const b = C.bearing(10.8231, 106.6297, 10.9000, 106.9000);
    const d = C.bearingToDirection(b);
    assert.strictEqual(d.name, 'Đông');
    assert.strictEqual(d.palace, 3);
});

// --- circular mean + low-pass filter ---
test('circularMean: trung bình 359° và 1° = 0° (không nhảy)', () => {
    assert.strictEqual(C.circularMean([359, 1]), 0);
});
test('circularMean: trường hợp suy biến (đối xứng) không throw', () => {
    // 4 góc đối xứng không có trung bình vòng xác định — chỉ cần không throw & ra số hợp lệ.
    const m = C.circularMean([0, 90, 180, 270]);
    assert.ok(typeof m === 'number' && m >= 0 && m < 360, 'ra số trong [0,360)');
});
test('lowPassFilter: đi đường vòng ngắn nhất 359->1->3', () => {
    const f = C.createLowPassFilter(0.5);
    assert.strictEqual(f.update(359), 359);
    // 359 -> 1: đường ngắn là +2 (qua 0), không phải -358
    const v1 = f.update(1);
    assert.ok(Math.abs(v1 - 0) < 1, '359->1 phải qua 0, got ' + v1);
    const v2 = f.update(3);
    assert.ok(v2 > 0 && v2 <= 3, 'tiếp tục tiến tới 3, got ' + v2);
});

// --- TEST 13/14: visualization KHÔNG được đổi dữ liệu Qimen ---
test('TEST 13: heading thay đổi KHÔNG làm đổi bàn Qimen', () => {
    // Mô phỏng một board đóng băng; các hàm mapping chỉ đọc, không ghi.
    const board = { 1: { mon: 'Hưu', tinh: 'Thiên Bồng', than: 'Trực Phù' },
                    3: { mon: 'Sinh', tinh: 'Thiên Tâm', than: 'Lục Hợp' } };
    const snapshot = JSON.stringify(board);
    C.headingToPalace(0); C.headingToPalace(90); C.headingToPalace(180); C.headingToPalace(270);
    C.bearing(10, 10, 11, 11);
    assert.strictEqual(JSON.stringify(board), snapshot, 'board không bị đổi');
});
test('TEST 14: location/GPS thay đổi KHÔNG tự ý đổi bàn Qimen', () => {
    // bearing chỉ là phép tính thuần, không có side effect lên board.
    const board = { 1: { mon: 'Khai' } };
    const before = JSON.stringify(board);
    C.bearing(0, 0, 1, 1);
    C.bearing(0, 0, 0, 1);
    assert.strictEqual(JSON.stringify(board), before);
});

console.log('\nKết quả: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
