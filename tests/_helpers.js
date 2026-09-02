// tests/_helpers.js — dùng chung cho interpretation tests.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'kymon.html'), 'utf8');
const JS = HTML.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeContext() {
    const stub = {
        addEventListener() {}, removeEventListener() {}, value: '', innerHTML: '',
        style: {}, dataset: {}, id: '', checked: false, textContent: '',
        classList: { add() {}, remove() {} }, options: [],
        querySelector() { return null; }, querySelectorAll() { return []; }
    };
    const document = { getElementById() { return stub; }, querySelectorAll() { return []; } };
    const window = { _cungData: null, onload: null, addEventListener() {}, removeEventListener() {} };
    const sandbox = { console, document, window, Date, Math, JSON, Array, Object, String, Number, Boolean };
    vm.createContext(sandbox);
    vm.runInContext(JS, sandbox);
    return sandbox;
}

/** Chart thật từ golden case 17/3/2021 03:00 (Dương độn 1, Giáp Tý, Bính Dần). */
function goldenChart() {
    const ctx = makeContext();
    return ctx.anBan(new ctx.Date(2021, 2, 17, 3, 0, 0));
}

// Danh sách biểu tượng theo chỉ số (khớp TEN_MON/TEN_TINH/TEN_THAN của project).
const DOORS = ['Hưu', 'Sinh', 'Thương', 'Đỗ', 'Cảnh', 'Tử', 'Kinh', 'Khai'];
const STARS = ['Thiên Bồng', 'Thiên Nhuế', 'Thiên Xung', 'Thiên Phụ', 'Thiên Cầm', 'Thiên Tâm', 'Thiên Trụ', 'Thiên Nhậm', 'Thiên Anh'];
const DEITIES = ['Trực Phù', 'Đằng Xà', 'Thái Âm', 'Lục Hợp', 'Bạch Hổ', 'Huyền Vũ', 'Cửu Địa', 'Cửu Thiên'];
const OUTER_PALACES = [1, 2, 3, 4, 6, 7, 8, 9];

/**
 * Chart tổng hợp: cung focus nhận (door, star, deity) chỉ định; các cung khác
 * dùng giá trị mặc định; can chi lấy từ golden chart.
 * @param {number} focusPalace 1..9 (khác 5)
 * @param {number} doorIdx 0..7
 * @param {number} starIdx 0..8
 * @param {number} deityIdx 0..7
 */
function syntheticChart(focusPalace, doorIdx, starIdx, deityIdx) {
    const base = goldenChart();
    const chart = { info: base.info };
    for (let p = 1; p <= 9; p++) {
        const src = base[p];
        chart[p] = { mon: src.mon, tinh: src.tinh, than: src.than, thien: src.thien, dia: src.dia };
        if (p === focusPalace) {
            chart[p].mon = DOORS[doorIdx];
            chart[p].tinh = STARS[starIdx];
            chart[p].than = DEITIES[deityIdx];
        }
    }
    return chart;
}

module.exports = { makeContext, goldenChart, syntheticChart, DOORS, STARS, DEITIES, OUTER_PALACES };
