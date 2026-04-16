// ========== app.js - User Page ==========

(function () {
    'use strict';

    // === Myanmar Date/Time ===
    function getMyanmarNow() {
        // Myanmar is UTC+6:30
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        return new Date(utc + 6.5 * 3600000);
    }

    function formatMyanmarDate(d) {
        const days = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
        const months = ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်',
            'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'];
        const dayName = days[d.getDay()];
        const month = months[d.getMonth()];
        const date = d.getDate();
        const year = d.getFullYear();
        const hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${year} ${month} ${date} ရက်၊ ${dayName}နေ့ | ${h12}:${minutes} ${ampm}`;
    }

    // === Date Display ===
    function updateDateDisplay() {
        const el = document.getElementById('dateDisplay');
        if (el) {
            el.textContent = formatMyanmarDate(getMyanmarNow());
        }
    }
    updateDateDisplay();
    setInterval(updateDateDisplay, 30000);

    // === Year Footer ===
    document.getElementById('yearFooter').textContent = getMyanmarNow().getFullYear();

    // === Accordion ===
    const howBtn = document.getElementById('howToPlayBtn');
    const howBody = document.getElementById('howToPlayBody');
    const arrow = document.getElementById('arrow');
    howBtn.addEventListener('click', function () {
        howBody.classList.toggle('show');
        arrow.classList.toggle('open');
    });

    // === Get Admin Data from localStorage ===
    function getTodayKey() {
        const d = getMyanmarNow();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function loadAdminData() {
        try {
            const data = JSON.parse(localStorage.getItem('admin_daily_number') || '{}');
            return data;
        } catch {
            return {};
        }
    }

    // === Generate Pairs ===
    function getAllDigits() {
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    function generatePairsWithOthers(digits) {
        const all = getAllDigits();
        const others = all.filter(d => !digits.includes(d));
        const pairs = [];
        for (const d of digits) {
            for (const o of others) {
                const pair = String(d) + String(o);
                pairs.push(pair);
            }
        }
        // Remove duplicates and sort
        return [...new Set(pairs)].sort();
    }

    function generatePairsAmongSelf(digits) {
        const pairs = [];
        // All 2-digit combos from the 4 digits (including same digit)
        for (let i = 0; i < digits.length; i++) {
            for (let j = 0; j < digits.length; j++) {
                if (i !== j) {
                    pairs.push(String(digits[i]) + String(digits[j]));
                }
            }
        }
        return [...new Set(pairs)].sort();
    }

    function renderGrid(containerId, pairs, extraClass) {
        const container = document.getElementById(containerId);
        if (!pairs || pairs.length === 0) {
            container.innerHTML = '<div class="empty-state">ဂဏန်း မရှိသေးပါ</div>';
            return;
        }
        container.innerHTML = '';
        pairs.forEach(p => {
            const box = document.createElement('div');
            box.className = 'num-box' + (extraClass ? ' ' + extraClass : '');
            box.textContent = p;
            container.appendChild(box);
        });
    }

    // === Main Render ===
    function render() {
        const data = loadAdminData();
        const todayKey = getTodayKey();
        const todayData = data[todayKey];

        const bigNumberEl = document.getElementById('bigNumber');

        if (todayData && todayData.number) {
            const num = todayData.number;
            bigNumberEl.textContent = num;

            const digits = num.split('').map(Number);
            const uniqueDigits = [...new Set(digits)];

            const pairsOthers = generatePairsWithOthers(uniqueDigits);
            const pairsSelf = generatePairsAmongSelf(digits);

            renderGrid('pairsWithOthers', pairsOthers, '');
            renderGrid('pairsAmongSelf', pairsSelf, 'r-box');
        } else {
            bigNumberEl.textContent = '----';
            renderGrid('pairsWithOthers', [], '');
            renderGrid('pairsAmongSelf', [], '');
        }
    }

    render();

    // Re-check every 10 seconds for admin updates
    setInterval(render, 10000);
})();
