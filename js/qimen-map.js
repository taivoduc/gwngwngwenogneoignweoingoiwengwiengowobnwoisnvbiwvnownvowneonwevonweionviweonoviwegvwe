/*
 * qimen-map.js — LỚP TRỰC QUAN HOÁ (Google Maps + Compass + Qimen Overlay).
 *
 * Chỉ ĐỌC dữ liệu Qimen từ window._cungData và hướng từ window._compass.heading.
 * KHÔNG sửa bàn Qimen, KHÔNG copy thuật toán. Ba lớp độc lập: MAP / ORIENTATION / OVERLAY.
 */
(function () {
    'use strict';
    if (typeof window === 'undefined') return;

    var C = (typeof QimenMapCore !== 'undefined') ? QimenMapCore : null;
    if (!C) { console.warn('[qimen-map] thiếu QimenMapCore'); return; }

    // --- CONFIG (API key KHÔNG hardcode) ---
    var CFG = window.QIMEN_MAP_CONFIG || {};
    function resolveApiKey() {
        if (CFG.apiKey) return CFG.apiKey;
        try { var p = new URLSearchParams(window.location.search); if (p.get('key')) return p.get('key'); } catch (e) {}
        try { return localStorage.getItem('qimen_gmap_key') || ''; } catch (e) { return ''; }
        return '';
    }

    // --- Data model ---
    var state = {
        location: { latitude: null, longitude: null, accuracy: null },
        orientation: { magneticHeading: null, trueHeading: null, accuracy: null, timestamp: null },
        map: { heading: 0, zoom: 16, mode: 'north-up' },
        qimen: { palace: null, direction: null, men: null, star: null, spirit: null, score: 0 }
    };

    var map = null, mapReady = false, mapLoading = false;
    var userMarker = null, destMarker = null, destPolyline = null;
    var sectorPolys = [], sectorLabels = [];
    var radiusMeters = 500, overlayOpacity = 0.35;
    var followMode = false, geolocationWatchId = null;
    var center = { lat: CFG.lat || 10.8231, lng: CFG.lng || 106.6297 }; // HCM mặc định

    function el(id) { return document.getElementById(id); }
    function getHeading() { return (typeof window._compass !== 'undefined') ? (window._compass.heading || 0) : 0; }
    function getBoard() { return window._cungData || null; }

    // --- Điểm Qimen cho 1 cung (CHỈ ĐỌC board) ---
    function palaceInfo(palace) {
        var board = getBoard();
        var cell = (board && board[palace]) ? board[palace] : null;
        return {
            palace: palace, cell: cell,
            men: cell ? cell.mon : '', star: cell ? cell.tinh : '', spirit: cell ? cell.than : '',
            score: scoreForCell(cell)
        };
    }
    function scoreForCell(cell) {
        if (!cell || !cell.mon) return 0;
        try {
            if (typeof normalizeScore === 'function' && typeof palaceScore === 'function') {
                return normalizeScore(palaceScore(cell));
            }
        } catch (e) {}
        return 0;
    }

    // --- Hình học ---
    function destinationPoint(lat, lng, bearingDeg, distM) {
        var R = 6371000, rad = Math.PI / 180;
        var p1 = lat * rad, l1 = lng * rad, th = bearingDeg * rad, d = distM / R;
        var p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(th));
        var l2 = l1 + Math.atan2(Math.sin(th) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
        return { lat: p2 / rad, lng: l2 / rad };
    }
    function sectorColor(score) {
        if (score > 0) return 'rgba(46, 204, 113, ALPHA)';
        if (score < 0) return 'rgba(231, 76, 60, ALPHA)';
        return 'rgba(241, 196, 15, ALPHA)';
    }

    function applyMapHeading() {
        if (!map) return;
        var h = (state.map.mode === 'heading-up') ? state.map.heading : 0;
        if (typeof map.setHeading === 'function') {
            try { map.setHeading(h); return; } catch (e) {}
        }
        // Raster map không hỗ trợ setHeading: sector là toạ độ địa lý nên vẫn đúng hướng thực.
    }

    function clearOverlay() {
        sectorPolys.forEach(function (p) { if (p) p.setMap(null); });
        sectorLabels.forEach(function (l) { if (l) l.setMap(null); });
        sectorPolys = []; sectorLabels = [];
    }
    function drawOverlay() {
        if (!map || !window.google || !window.google.maps) return;
        clearOverlay();
        var origin = { lat: center.lat, lng: center.lng };
        for (var i = 0; i < C.DIRECTIONS.length; i++) {
            var dir = C.DIRECTIONS[i];
            var info = palaceInfo(dir.palace);
            var path = [origin];
            for (var a = dir.mid - 22.5; a <= dir.mid + 22.5 + 0.01; a += 5) {
                path.push(destinationPoint(origin.lat, origin.lng, a, radiusMeters));
            }
            path.push(origin);
            var color = sectorColor(info.score).replace('ALPHA', String(overlayOpacity));
            var poly = new google.maps.Polygon({
                paths: path, map: map, fillColor: color, fillOpacity: 1,
                strokeColor: 'rgba(255,255,255,0.5)', strokeWeight: 1
            });
            sectorPolys.push(poly);
            var labelPos = destinationPoint(origin.lat, origin.lng, dir.mid, radiusMeters * 0.6);
            var labelText = dir.short + (info.men ? ' ' + info.men : '') + (info.score > 0 ? ' ✓' : (info.score < 0 ? ' ✗' : ''));
            var label = new google.maps.Marker({
                position: labelPos, map: map,
                label: { text: labelText, color: '#ffffff', fontWeight: 'bold', fontSize: '12px' },
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0, fillOpacity: 0, strokeOpacity: 0 },
                clickable: false
            });
            sectorLabels.push(label);
        }
    }

    function updateCompassOverlay() {
        var needle = el('mapNeedle'), rose = el('mapRose');
        var h = state.map.heading;
        if (state.map.mode === 'heading-up') {
            if (needle) needle.style.transform = 'rotate(0deg)';
            if (rose) rose.style.transform = 'rotate(' + (-h) + 'deg)';
        } else {
            if (needle) needle.style.transform = 'rotate(' + h + 'deg)';
            if (rose) rose.style.transform = 'rotate(0deg)';
        }
    }
    function updateHUD() {
        var h = state.map.heading;
        var dir = C.headingToDirection(h);
        var info = palaceInfo(dir.palace);
        state.qimen.palace = dir.palace; state.qimen.direction = dir.name;
        state.qimen.men = info.men; state.qimen.star = info.star; state.qimen.spirit = info.spirit;
        state.qimen.score = info.score;

        if (el('mapHeading')) el('mapHeading').textContent = 'Heading: ' + Math.round(h) + '° ' + dir.name;
        if (el('mapPalace')) el('mapPalace').textContent = 'Cung ' + dir.cung + ' (' + dir.palace + ')';
        if (el('mapMen')) el('mapMen').textContent = info.men || '—';
        if (el('mapStar')) el('mapStar').textContent = info.star || '—';
        if (el('mapSpirit')) el('mapSpirit').textContent = info.spirit || '—';
        var scoreEl = el('mapScore');
        if (scoreEl) {
            scoreEl.textContent = (info.score > 0 ? 'CÁT +' + info.score : (info.score < 0 ? 'HUNG ' + info.score : 'TRUNG 0'));
            scoreEl.className = 'map-score ' + (info.score > 0 ? 'good' : (info.score < 0 ? 'bad' : 'neutral'));
        }
        var warn = el('mapAccuracyWarn');
        if (warn && state.location.accuracy != null) {
            warn.style.display = (state.location.accuracy > 50) ? 'block' : 'none';
        }
        updateDebug();
    }

    // --- Geolocation (có xử lý lỗi rõ ràng + fallback vị trí mặc định) ---
    function gpsErrorText(err) {
        if (err && err.code === 1) return 'Bị từ chối quyền định vị. Hãy bật GPS/Location cho trình duyệt rồi bấm "⌖ Vị trí" để thử lại.';
        if (err && err.code === 2) return 'Không lấy được vị trí (tín hiệu GPS yếu?).';
        if (err && err.code === 3) return 'Hết thời gian định vị.';
        return 'Lỗi định vị: ' + (err && err.message ? err.message : 'không rõ');
    }
    function setStatus(t) { var s = el('mapStatus'); if (s) s.textContent = t; }

    function startGeolocation() {
        if (!navigator.geolocation) {
            setStatus('Trình duyệt không hỗ trợ GPS — dùng vị trí mặc định (TP.HCM).');
            return false;
        }
        if (window.isSecureContext === false) {
            setStatus('GPS cần HTTPS. Đang mở qua http:// hoặc file:// nên bị chặn — dùng vị trí mặc định.');
            return false;
        }
        setStatus('Đang xin quyền định vị...');
        geolocationWatchId = navigator.geolocation.watchPosition(function (pos) {
            state.location.latitude = pos.coords.latitude;
            state.location.longitude = pos.coords.longitude;
            state.location.accuracy = pos.coords.accuracy;
            center.lat = pos.coords.latitude; center.lng = pos.coords.longitude;
            if (!userMarker && map) {
                userMarker = new google.maps.Marker({ position: center, map: map, title: 'Vị trí của bạn' });
            } else if (userMarker) { userMarker.setPosition(center); }
            if (el('gpsLat')) el('gpsLat').textContent = center.lat.toFixed(6);
            if (el('gpsLng')) el('gpsLng').textContent = center.lng.toFixed(6);
            if (el('gpsAcc')) el('gpsAcc').textContent = '±' + Math.round(state.location.accuracy) + ' m';
            setStatus('Đã định vị (±' + Math.round(state.location.accuracy) + 'm)');
            if (followMode && map) map.setCenter(center);
            drawOverlay();
            updateHUD();
        }, function (err) { setStatus(gpsErrorText(err)); },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
        return true;
    }

    // --- Destination bearing ---
    function onMapClick(e) {
        if (!e.latLng || !map) return;
        var dest = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        if (!destMarker) { destMarker = new google.maps.Marker({ position: dest, map: map, title: 'Điểm đến' }); }
        else { destMarker.setPosition(dest); }
        var b = C.bearing(center.lat, center.lng, dest.lat, dest.lng);
        var dir = C.bearingToDirection(b);
        var info = palaceInfo(dir.palace);
        if (destPolyline && destPolyline.setMap) destPolyline.setMap(null);
        destPolyline = new google.maps.Polyline({ path: [{ lat: center.lat, lng: center.lng }, dest], map: map,
            strokeColor: '#f7971e', strokeWeight: 2, strokeOpacity: 0.8 });
        var box = el('mapDest');
        if (box) box.innerHTML = 'ĐIỂM ĐẾN<br>Bearing ' + Math.round(b) + '°<br>Hướng ' + dir.name +
            '<br>Cung ' + dir.cung + '<br>Môn: ' + (info.men || '—') + '<br>Tinh: ' + (info.star || '—') +
            '<br>Thần: ' + (info.spirit || '—') + '<br>Đánh giá: ' + (info.score > 0 ? 'CÁT' : (info.score < 0 ? 'HUNG' : 'TRUNG'));
    }

    // --- Tìm hướng tốt ---
    function findBestDirection() {
        var ranked = C.DIRECTIONS.map(function (d) {
            return { dir: d, info: palaceInfo(d.palace) };
        }).sort(function (a, b) { return b.info.score - a.info.score; });
        var html = '<b>TÌM HƯỚNG TỐT</b><br>';
        ranked.forEach(function (r, i) {
            var tag = i === 0 ? '★ TỐT NHẤT' : (i === 1 ? '☆ thứ hai' : (i === ranked.length - 1 ? '✗ NÊN TRÁNH' : ''));
            html += r.dir.name + ': ' + (r.info.score > 0 ? '+' : '') + r.info.score +
                ' (' + (r.info.men || '—') + ') ' + tag + '<br>';
        });
        var box = el('mapDest');
        if (box) box.innerHTML = html;
    }

    // --- Debug ---
    function updateDebug() {
        var dbg = el('mapDebug');
        if (!dbg || dbg.classList.contains('hidden')) return;
        var b = getBoard();
        dbg.innerHTML =
            '<b>GPS</b><br>lat: ' + (state.location.latitude != null ? state.location.latitude.toFixed(6) : '—') +
            '<br>lng: ' + (state.location.longitude != null ? state.location.longitude.toFixed(6) : '—') +
            '<br>accuracy: ' + (state.location.accuracy != null ? '±' + Math.round(state.location.accuracy) + 'm' : '—') +
            '<br><b>Compass</b><br>heading: ' + Math.round(state.map.heading) + '°' +
            '<br><b>Map</b><br>mode: ' + state.map.mode + '<br>ready: ' + (mapReady ? 'yes' : 'no') +
            '<br><b>Qimen</b><br>cục: ' + (b && b.info ? b.info.cuc.so + ' (' + (b.info.cuc.duong ? 'Dương' : 'Âm') + ')' : '—') +
            '<br>cung: ' + state.qimen.palace + ' (' + state.qimen.direction + ')' +
            '<br>môn: ' + state.qimen.men + ' | tinh: ' + state.qimen.star + ' | thần: ' + state.qimen.spirit +
            '<br><b>Mapping</b><br>Khảm=Bắc(1), Cấn=ĐB(8), Chấn=Đ(3), Tốn=ĐN(4), Ly=N(9), Khôn=TN(2), Đoài=T(7), Càn=TB(6)';
    }

    // --- Poll heading + phát hiện bàn Qimen đổi ---
    var lastBoard = null;
    function pollHeading() {
        var h = getHeading();
        var boardChanged = (getBoard() !== lastBoard);
        if (typeof h === 'number' && (Math.abs(h - state.map.heading) >= 1 || boardChanged)) {
            state.map.heading = h;
            lastBoard = getBoard();
            applyMapHeading();
            updateCompassOverlay();
            drawOverlay();
            updateHUD();
        }
    }

    function setMode(mode) {
        state.map.mode = mode;
        applyMapHeading();
        updateCompassOverlay();
        updateHUD();
        if (el('modeNorthUp') && el('modeHeadingUp')) {
            el('modeNorthUp').classList.toggle('active', mode === 'north-up');
            el('modeHeadingUp').classList.toggle('active', mode === 'heading-up');
        }
    }

    // --- Khởi tạo map (LAZY — chỉ khi view hiện, tránh 0x0) ---
    function initMap() {
        if (map || !window.google || !window.google.maps) return;
        var container = el('qimenMap');
        if (!container) return;
        map = new google.maps.Map(container, {
            center: center, zoom: state.map.zoom, mapTypeControl: true,
            fullscreenControl: true, streetViewControl: false, zoomControl: true
        });
        if (typeof map.setHeading === 'function') { try { map.setHeading(0); } catch (e) {} }
        map.addListener('click', onMapClick);
        mapReady = true;
        // Phát hiện tile không tải (thường do API key bị giới hạn HTTP referrer)
        var tilesOk = false;
        google.maps.event.addListenerOnce(map, 'tilesloaded', function () { tilesOk = true; });
        setTimeout(function () {
            if (mapReady && !tilesOk) {
                setStatus('⚠️ Map không tải tile. Thường do API key bị giới hạn "HTTP referrer". Mở Google Cloud Console → Credentials → key → Application restrictions, thêm đúng tên miền (vd: https://TEN.github.io/* hoặc http://localhost/*).');
            }
        }, 8000);
        drawOverlay();
        updateHUD();
        startGeolocation();
    }

    function ensureMapLoaded() {
        if (mapReady) {
            if (map && window.google && window.google.maps) {
                try { google.maps.event.trigger(map, 'resize'); } catch (e) {}
                map.setCenter(center);
                drawOverlay();
            }
            return;
        }
        if (mapLoading) return;
        var key = resolveApiKey();
        if (window.google && window.google.maps) { initMap(); return; }
        if (!key) {
            setStatus('Chưa có Google Maps API key. Thêm ?key=... vào URL hoặc localStorage.setItem("qimen_gmap_key", "KEY").');
            return;
        }
        mapLoading = true;
        setStatus('Đang tải Google Maps...');
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(key) + '&callback=__qimenMapReady';
        s.onerror = function () { mapLoading = false; setStatus('Không tải được Google Maps (kiểm tra mạng).'); };
        window.__qimenMapReady = function () { mapLoading = false; initMap(); };
        setTimeout(function () {
            if (!mapReady) { mapLoading = false; setStatus('Google Maps không phản hồi — API key có thể sai hoặc bị giới hạn domain.'); }
        }, 15000);
        document.head.appendChild(s);
    }

    function showMap() {
        var v = el('mapView');
        if (v) v.classList.remove('hidden');
        ensureMapLoaded();
        setTimeout(function () {
            if (map && window.google && window.google.maps) {
                try { google.maps.event.trigger(map, 'resize'); } catch (e) {}
                map.setCenter(center);
                drawOverlay();
                updateHUD();
            }
        }, 60);
    }

    function init() {
        if (!el('qimenMap')) return;
        var bind = function (id, ev, fn) { var e = el(id); if (e) e.addEventListener(ev, fn); };
        bind('mapToggleMode', 'click', function () { setMode(state.map.mode === 'north-up' ? 'heading-up' : 'north-up'); });
        bind('modeNorthUp', 'click', function () { setMode('north-up'); });
        bind('modeHeadingUp', 'click', function () { setMode('heading-up'); });
        bind('mapFindBest', 'click', findBestDirection);
        bind('mapRecenter', 'click', function () {
            if (map) map.setCenter(center);
            if (state.location.latitude == null) startGeolocation();
        });
        bind('mapToggleFollow', 'click', function () { followMode = !followMode; this.classList.toggle('active', followMode); if (followMode && map) map.setCenter(center); });
        bind('mapToggleDebug', 'click', function () { var d = el('mapDebug'); if (d) d.classList.toggle('hidden'); updateDebug(); });
        bind('mapOpacity', 'input', function () { overlayOpacity = parseInt(this.value, 10) / 100; drawOverlay(); });
        bind('mapRadius', 'change', function () { radiusMeters = parseInt(this.value, 10) || 500; drawOverlay(); });
        bind('mapShowMap', 'click', showMap);
        bind('mapClose', 'click', function () { var v = el('mapView'); if (v) v.classList.add('hidden'); });

        setInterval(pollHeading, 250);
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
    else { init(); }

    window.QimenMap = { state: state, refresh: function () { drawOverlay(); updateHUD(); }, show: showMap };
})();



