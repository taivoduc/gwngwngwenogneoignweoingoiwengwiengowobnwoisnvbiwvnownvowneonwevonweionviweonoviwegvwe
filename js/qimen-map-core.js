/*
 * qimen-map-core.js — LOGIC THUẦN cho Map/Compass/Qimen Overlay.
 *
 * Tách khỏi DOM & Google Maps & cảm biến để test được bằng Node.
 * KHÔNG chứa thuật toán lập bàn Qimen — chỉ là HÌNH HỌC HƯỚNG + BEARING.
 * Quy ước: heading/bearing đều là độ địa lý, 0° = Bắc, chiều kim đồng hồ.
 *
 * Chạy được cả browser (window.QimenMapCore) lẫn Node (module.exports).
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) { module.exports = factory(); }
    else { root.QimenMapCore = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // 8 hướng địa lý ↔ cung Kỳ Môn (Khảm=Bắc, Cấn=ĐB, Chấn=Đông, Tốn=ĐN,
    // Ly=Nam, Khôn=TN, Đoài=Tây, Càn=TB). Trung cung KHÔNG có hướng.
    var DIRECTIONS = [
        { name: 'Bắc',      short: 'B',  palace: 1, cung: 'Khảm', mid: 0 },
        { name: 'Đông Bắc', short: 'ĐB', palace: 8, cung: 'Cấn',  mid: 45 },
        { name: 'Đông',     short: 'Đ',  palace: 3, cung: 'Chấn', mid: 90 },
        { name: 'Đông Nam', short: 'ĐN', palace: 4, cung: 'Tốn',  mid: 135 },
        { name: 'Nam',      short: 'N',  palace: 9, cung: 'Ly',   mid: 180 },
        { name: 'Tây Nam',  short: 'TN', palace: 2, cung: 'Khôn', mid: 225 },
        { name: 'Tây',      short: 'T',  palace: 7, cung: 'Đoài', mid: 270 },
        { name: 'Tây Bắc',  short: 'TB', palace: 6, cung: 'Càn',  mid: 315 }
    ];

    // Chuẩn hoá góc về [0, 360). Trả null nếu đầu vào không hợp lệ.
    function normalizeHeading(h) {
        if (typeof h !== 'number' || isNaN(h)) return null;
        return ((h % 360) + 360) % 360;
    }

    // heading (0–359) → 8 hướng. Sector rộng 45° (mid ± 22.5°).
    function headingToDirection(h) {
        h = normalizeHeading(h);
        if (h === null) return null;
        for (var i = 0; i < DIRECTIONS.length; i++) {
            var d = DIRECTIONS[i];
            var lo = d.mid - 22.5;
            var hi = d.mid + 22.5;
            if (lo < 0) { // Bắc quấn vòng qua 360/0
                if (h >= lo + 360 || h < hi) return d;
                continue;
            }
            if (h >= lo && h < hi) return d;
        }
        return DIRECTIONS[0];
    }

    // Bearing địa lý (great-circle initial bearing) giữa 2 điểm.
    function bearing(fromLat, fromLng, toLat, toLng) {
        var rad = Math.PI / 180;
        var p1 = fromLat * rad, p2 = toLat * rad;
        var dl = (toLng - fromLng) * rad;
        var y = Math.sin(dl) * Math.cos(p2);
        var x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
        var deg = Math.atan2(y, x) / rad;
        return normalizeHeading(deg);
    }

    // bearing → hướng → cung (tiện dùng cho destination).
    function bearingToDirection(b) { return headingToDirection(b); }
    function directionToPalace(d) { return d ? d.palace : null; }
    function headingToPalace(h) { return directionToPalace(headingToDirection(h)); }

    // Trung bình vòng (circular mean) của nhiều góc — dùng để lọc nhiễu cảm biến.
    function circularMean(angles) {
        if (!angles || !angles.length) return null;
        var rad = Math.PI / 180, sx = 0, sy = 0;
        for (var i = 0; i < angles.length; i++) {
            var a = normalizeHeading(angles[i]);
            if (a === null) continue;
            a *= rad; sx += Math.cos(a); sy += Math.sin(a);
        }
        return normalizeHeading(Math.atan2(sy, sx) / rad);
    }

    // Low-pass filter theo đường đi vòng ngắn nhất (không nhảy 359°↔0°).
    function createLowPassFilter(alpha) {
        var last = null;
        return {
            update: function (h) {
                h = normalizeHeading(h);
                if (h === null) return last;
                if (last === null) { last = h; return last; }
                var delta = h - last;
                delta = ((delta + 180) % 360 + 360) % 360 - 180;
                last = normalizeHeading(last + delta * alpha);
                return last;
            },
            reset: function () { last = null; },
            value: function () { return last; }
        };
    }

    return {
        DIRECTIONS: DIRECTIONS,
        normalizeHeading: normalizeHeading,
        headingToDirection: headingToDirection,
        bearing: bearing,
        bearingToDirection: bearingToDirection,
        directionToPalace: directionToPalace,
        headingToPalace: headingToPalace,
        circularMean: circularMean,
        createLowPassFilter: createLowPassFilter
    };
});
