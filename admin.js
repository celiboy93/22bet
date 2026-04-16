// ========== admin.js - Admin Panel ==========

(function () {
    'use strict';

    // ===== CONFIG =====
    const ADMIN_PASSWORD = 'admin2d2025'; // <-- ဒီမှာ password ပြောင်းပါ

    const ITEMS_PER_PAGE = 30; // ~1 month

    // === Myanmar Time ===
    function getMyanmarNow() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        return new Date(utc + 6.5 * 3600000);
    }

    function getTodayKey() {
        const d = getMyanmarNow();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    // === LocalStorage Helpers ===
    function loadDailyData() {
        try {
            return JSON.parse(localStorage.getItem('admin_daily_number') || '{}');
        } catch {
            return {};
        }
    }

    function saveDailyData(data) {
        localStorage.setItem('admin_daily_number', JSON.stringify(data));
    }

    function loadResults() {
        try {
            return JSON.parse(localStorage.getItem('admin_results') || '{}');
        } catch {
            return {};
        }
    }

    function saveResults(data) {
        localStorage.setItem('admin_results', JSON.stringify(data));
    }

    // === Auth ===
    const loginOverlay = document.getElementById('loginOverlay');
    const adminPanel = document.getElementById('adminPanel');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    function checkSession() {
        return sessionStorage.getItem('admin_logged_in') === 'true';
    }

    function showAdmin() {
        loginOverlay.style.display = 'none';
        adminPanel.style.display = 'block';
        loadAll();
    }

    if (checkSession()) {
        showAdmin();
    }

    loginBtn.addEventListener('click', doLogin);
    passwordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doLogin();
    });

    function doLogin() {
        const val = passwordInput.value.trim();
        if (val === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_logged_in', 'true');
            loginError.textContent = '';
            showAdmin();
        } else {
            loginError.textContent = 'Password မှားနေပါသည်';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem('admin_logged_in');
        location.reload();
    });

    // === Save 4-digit number ===
    const fourDigitInput = document.getElementById('fourDigitInput');
    const saveNumberBtn = document.getElementById('saveNumberBtn');
    const saveMsg = document.getElementById('saveMsg');
    const currentSetNumber = document.getElementById('currentSetNumber');

    saveNumberBtn.addEventListener('click', function () {
        const val = fourDigitInput.value.trim();
        if (!/^\d{4}$/.test(val)) {
            saveMsg.style.color = 'var(--danger)';
            saveMsg.textContent = 'ဂဏန်း ၄ လုံးသာ ထည့်ပါ (ဥပမာ 4578)';
            return;
        }
        const data = loadDailyData();
        const key = getTodayKey();
        data[key] = data[key] || {};
        data[key].number = val;
        saveDailyData(data);

        saveMsg.style.color = 'var(--success)';
        saveMsg.textContent = 'အောင်မြင်စွာ သိမ်းပြီးပါပြီ!';
        currentSetNumber.textContent = val;
        fourDigitInput.value = '';

        setTimeout(() => { saveMsg.textContent = ''; }, 3000);
        renderHistory();
    });

    // === Display current set number ===
    function displayCurrentNumber() {
        const data = loadDailyData();
        const key = getTodayKey();
        if (data[key] && data[key].number) {
            currentSetNumber.textContent = data[key].number;
        } else {
            currentSetNumber.textContent = '----';
        }
    }

    // === Save Result ===
    const resultDate = document.getElementById('resultDate');
    const result12 = document.getElementById('result12');
    const result430 = document.getElementById('result430');
    const saveResultBtn = document.getElementById('saveResultBtn');
    const resultMsg = document.getElementById('resultMsg');

    // Set default date to today
    resultDate.value = getTodayKey();

    saveResultBtn.addEventListener('click', function () {
        const dateVal = resultDate.value;
        const r12 = result12.value.trim();
        const r430 = result430.value.trim();

        if (!dateVal) {
            resultMsg.style.color = 'var(--danger)';
            resultMsg.textContent = 'ရက်စွဲ ရွေးပါ';
            return;
        }

        if (r12 && !/^\d{2}$/.test(r12)) {
            resultMsg.style.color = 'var(--danger)';
            resultMsg.textContent = '12:00 ရလဒ် ဂဏန်း ၂ လုံးသာ ထည့်ပါ';
            return;
        }

        if (r430 && !/^\d{2}$/.test(r430)) {
            resultMsg.style.color = 'var(--danger)';
            resultMsg.textContent = '4:30 ရလဒ် ဂဏန်း ၂ လုံးသာ ထည့်ပါ';
            return;
        }

        const results = loadResults();
        results[dateVal] = results[dateVal] || {};
        if (r12) results[dateVal].r12 = r12;
        if (r430) results[dateVal].r430 = r430;
        saveResults(results);

        resultMsg.style.color = 'var(--success)';
        resultMsg.textContent = 'ရလဒ် သိမ်းပြီးပါပြီ!';
        result12.value = '';
        result430.value = '';

        setTimeout(() => { resultMsg.textContent = ''; }, 3000);
        renderHistory();
    });

    // === Check Hit ===
    function generateAllPairs(fourDigitStr) {
        if (!fourDigitStr || fourDigitStr.length !== 4) return [];

        const digits = fourDigitStr.split('').map(Number);
        const uniqueDigits = [...new Set(digits)];
        const allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const others = allDigits.filter(d => !uniqueDigits.includes(d));
        const pairs = new Set();

        // Pairs with remaining 6 digits
        for (const d of uniqueDigits) {
            for (const o of others) {
                pairs.add(String(d) + String(o));
            }
        }

        // Pairs among themselves
        for (let i = 0; i < digits.length; i++) {
            for (let j = 0; j < digits.length; j++) {
                if (i !== j) {
                    pairs.add(String(digits[i]) + String(digits[j]));
                }
            }
        }

        return pairs;
    }

    function checkHit(fourDigitStr, resultStr) {
        if (!fourDigitStr || !resultStr) return null;
        const pairs = generateAllPairs(fourDigitStr);
        return pairs.has(resultStr);
    }

    // === Render History ===
    let currentPage = 1;

    function renderHistory() {
        const dailyData = loadDailyData();
        const results = loadResults();

        // Merge all dates
        const allDates = new Set([...Object.keys(dailyData), ...Object.keys(results)]);
        const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a));

        const totalPages = Math.ceil(sortedDates.length / ITEMS_PER_PAGE) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const pageDates = sortedDates.slice(start, start + ITEMS_PER_PAGE);

        const tbody = document.getElementById('historyBody');
        tbody.innerHTML = '';

        if (pageDates.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="color:var(--text-dim);padding:20px;">ရလဒ် မရှိသေးပါ</td></tr>';
        }

        pageDates.forEach(dateKey => {
            const dd = dailyData[dateKey] || {};
            const rr = results[dateKey] || {};
            const fourDigit = dd.number || '';

            const tr = document.createElement('tr');

            // Date
            const tdDate = document.createElement('td');
            tdDate.style.fontFamily = "'Noto Sans Myanmar', sans-serif";
            tdDate.style.fontSize = '0.8rem';
            tdDate.textContent = dateKey;
            tr.appendChild(tdDate);

            // 4 Digit
            const td4 = document.createElement('td');
            td4.style.color = 'var(--gold)';
            td4.style.fontWeight = '700';
            td4.textContent = fourDigit || '-';
            tr.appendChild(td4);

            // 12:00 result
            const td12 = document.createElement('td');
            td12.textContent = rr.r12 || '-';
            tr.appendChild(td12);

            // 12:00 check
            const tdCheck12 = document.createElement('td');
            if (rr.r12 && fourDigit) {
                const hit = checkHit(fourDigit, rr.r12);
                const badge = document.createElement('span');
                badge.className = 'badge ' + (hit ? 'badge-hit' : 'badge-miss');
                badge.textContent = hit ? 'ပေါက်' : 'မပေါက်';
                tdCheck12.appendChild(badge);
            } else {
                const badge = document.createElement('span');
                badge.className = 'badge badge-none';
                badge.textContent = '-';
                tdCheck12.appendChild(badge);
            }
            tr.appendChild(tdCheck12);

            // 4:30 result
            const td430 = document.createElement('td');
            td430.textContent = rr.r430 || '-';
            tr.appendChild(td430);

            // 4:30 check
            const tdCheck430 = document.createElement('td');
            if (rr.r430 && fourDigit) {
                const hit = checkHit(fourDigit, rr.r430);
                const badge = document.createElement('span');
                badge.className = 'badge ' + (hit ? 'badge-hit' : 'badge-miss');
                badge.textContent = hit ? 'ပေါက်' : 'မပေါက်';
                tdCheck430.appendChild(badge);
            } else {
                const badge = document.createElement('span');
                badge.className = 'badge badge-none';
                badge.textContent = '-';
                tdCheck430.appendChild(badge);
            }
            tr.appendChild(tdCheck430);

            tbody.appendChild(tr);
        });

        // Pagination
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const container = document.getElementById('pagination');
        container.innerHTML = '';
        if (totalPages <= 1) return;

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
            btn.textContent = i;
            btn.addEventListener('click', function () {
                currentPage = i;
                renderHistory();
            });
            container.appendChild(btn);
        }
    }

    // === Load All ===
    function loadAll() {
        displayCurrentNumber();
        renderHistory();
    }
})();
