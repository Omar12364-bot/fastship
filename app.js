// ════════════════════════════════════════════════════════
// FastShip Express — app.js  (GitHub Pages compatible)
// ════════════════════════════════════════════════════════

const titles = {
  dashboard:'لوحة التحكم', shipments:'الشحنات', returns:'طلبات الاسترجاع',
  merchants:'التجار', pricing:'قوائم الاسعار', agents:'المناديب',
  entitlements:'المستحقات', transfers:'عمليات التحويل', expenses:'المصاريف',
  roles:'ادوار المستخدمين', users:'المستخدمين', cities:'المدن',
  zones:'المناطق', branches:'الفروع', reasons:'اسباب الالغاء والتاجيل'
};

let activeNavItem = document.querySelector('.nav-item.active');

function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + name);
  if (pg) pg.classList.add('active');
  document.getElementById('pageTitle').textContent = titles[name] || name;
  document.getElementById('pageBreadcrumb').textContent = name.toUpperCase();
  if (activeNavItem) activeNavItem.classList.remove('active');
  if (el) { el.classList.add('active'); activeNavItem = el; }
}

function toggleSub(id, el) {
  const sub = document.getElementById(id);
  const hidden = sub.style.display === 'none' || sub.style.display === '';
  sub.style.display = hidden ? 'block' : 'none';
  el.classList.toggle('open', hidden);
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openPricingModal() { openModal('pricing-modal'); }

document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ESC closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
  }
});

// ════════════════════════════════
// SESSION CHECK
// ════════════════════════════════
function checkSession() {
  // If no session, redirect to login
  if (!localStorage.getItem('fs_loggedIn') && !sessionStorage.getItem('fs_user')) {
    // Allow demo mode without redirect (comment out next line to enforce login)
    // window.location.href = 'login.html';
  }
  const userData = sessionStorage.getItem('fs_user');
  if (userData) {
    try {
      const u = JSON.parse(userData);
      const el = document.getElementById('topbar-username');
      if (el) el.textContent = u.name + ' — ' + u.role;
    } catch(e) {}
  }
}

function doLogout() {
  localStorage.removeItem('fs_loggedIn');
  sessionStorage.removeItem('fs_user');
  window.location.href = 'login.html';
}

// ════════════════════════════════
// DATA STORE
// ════════════════════════════════

// ── كل محافظات مصر الـ 27 ──
let cities = [
  { id:1,  name:'القاهرة',          code:'CAI', active:true },
  { id:2,  name:'الجيزة',           code:'GIZ', active:true },
  { id:3,  name:'الإسكندرية',       code:'ALX', active:true },
  { id:4,  name:'الشرقية',          code:'SHR', active:true },
  { id:5,  name:'الدقهلية',         code:'DAK', active:true },
  { id:6,  name:'الغربية',          code:'GHR', active:true },
  { id:7,  name:'كفر الشيخ',        code:'KFS', active:true },
  { id:8,  name:'المنوفية',         code:'MNF', active:true },
  { id:9,  name:'البحيرة',          code:'BHR', active:true },
  { id:10, name:'الإسماعيلية',      code:'ISM', active:true },
  { id:11, name:'السويس',           code:'SUZ', active:true },
  { id:12, name:'بورسعيد',          code:'PSD', active:true },
  { id:13, name:'دمياط',            code:'DYT', active:true },
  { id:14, name:'المنيا',           code:'MNA', active:true },
  { id:15, name:'أسيوط',            code:'ASY', active:true },
  { id:16, name:'سوهاج',            code:'SOH', active:true },
  { id:17, name:'قنا',              code:'QNA', active:true },
  { id:18, name:'الأقصر',           code:'LXR', active:true },
  { id:19, name:'أسوان',            code:'ASW', active:true },
  { id:20, name:'الفيوم',           code:'FAY', active:true },
  { id:21, name:'بني سويف',         code:'BNS', active:true },
  { id:22, name:'الوادي الجديد',    code:'WAD', active:false },
  { id:23, name:'البحر الأحمر',     code:'RED', active:false },
  { id:24, name:'مطروح',            code:'MTR', active:false },
  { id:25, name:'شمال سيناء',       code:'NSN', active:false },
  { id:26, name:'جنوب سيناء',       code:'SSN', active:false },
  { id:27, name:'كفر الدوار',       code:'KFD', active:true },
];
let nextCityId = 28;
let editingCityIdx = -1;

// ── مناطق كل محافظة ──
let zones = [
  // القاهرة (1)
  {id:1,  cityId:1, name:'مدينة نصر',         active:true},
  {id:2,  cityId:1, name:'المعادي',            active:true},
  {id:3,  cityId:1, name:'حلوان',              active:true},
  {id:4,  cityId:1, name:'مصر الجديدة',        active:true},
  {id:5,  cityId:1, name:'زهراء مدينة نصر',   active:true},
  {id:6,  cityId:1, name:'شبرا',               active:true},
  {id:7,  cityId:1, name:'عين شمس',            active:true},
  {id:8,  cityId:1, name:'النزهة',             active:true},
  {id:9,  cityId:1, name:'المطرية',            active:true},
  {id:10, cityId:1, name:'الزيتون',            active:true},
  {id:11, cityId:1, name:'الموسكي',            active:true},
  {id:12, cityId:1, name:'الأزهر',             active:true},
  {id:13, cityId:1, name:'التبين',             active:true},
  {id:14, cityId:1, name:'المقطم',             active:true},
  {id:15, cityId:1, name:'حدائق الأهرام',      active:true},
  {id:16, cityId:1, name:'منشأة ناصر',         active:true},
  // الجيزة (2)
  {id:17, cityId:2, name:'الدقي',              active:true},
  {id:18, cityId:2, name:'المنيب',             active:true},
  {id:19, cityId:2, name:'بولاق الدكرور',      active:true},
  {id:20, cityId:2, name:'صفط اللبن',          active:true},
  {id:21, cityId:2, name:'ميدان الجيزة',       active:true},
  {id:22, cityId:2, name:'أكتوبر',             active:true},
  {id:23, cityId:2, name:'الشيخ زايد',         active:true},
  {id:24, cityId:2, name:'حدائق أكتوبر',       active:true},
  {id:25, cityId:2, name:'المنصورية',           active:true},
  {id:26, cityId:2, name:'البدرشين',            active:true},
  {id:27, cityId:2, name:'أوسيم',               active:true},
  {id:28, cityId:2, name:'كرداسة',              active:true},
  // الإسكندرية (3)
  {id:29, cityId:3, name:'سيدي جابر',          active:true},
  {id:30, cityId:3, name:'المنتزه',             active:true},
  {id:31, cityId:3, name:'العجمي',              active:true},
  {id:32, cityId:3, name:'كرموز',               active:true},
  {id:33, cityId:3, name:'المحطة',              active:true},
  {id:34, cityId:3, name:'الرمل',               active:true},
  {id:35, cityId:3, name:'الورديان',            active:true},
  {id:36, cityId:3, name:'سيدي بشر',           active:true},
  {id:37, cityId:3, name:'المنشية',             active:true},
  {id:38, cityId:3, name:'أبو قير',             active:true},
  {id:39, cityId:3, name:'برج العرب',           active:true},
  // الشرقية (4)
  {id:40, cityId:4, name:'الزقازيق',            active:true},
  {id:41, cityId:4, name:'العاشر من رمضان',     active:true},
  {id:42, cityId:4, name:'أبو حماد',            active:true},
  {id:43, cityId:4, name:'ميت غمر',             active:true},
  {id:44, cityId:4, name:'بلبيس',               active:true},
  {id:45, cityId:4, name:'منيا القمح',          active:true},
  {id:46, cityId:4, name:'كفر صقر',             active:true},
  {id:47, cityId:4, name:'الإبراهيمية',         active:true},
  {id:48, cityId:4, name:'ههيا',                active:true},
  {id:49, cityId:4, name:'فاقوس',               active:true},
  {id:50, cityId:4, name:'ديرب نجم',            active:true},
  // الدقهلية (5)
  {id:51, cityId:5, name:'المنصورة',            active:true},
  {id:52, cityId:5, name:'طلخا',                active:true},
  {id:53, cityId:5, name:'ميت سلسيل',           active:true},
  {id:54, cityId:5, name:'شربين',               active:true},
  {id:55, cityId:5, name:'بلقاس',               active:true},
  {id:56, cityId:5, name:'السنبلاوين',          active:true},
  {id:57, cityId:5, name:'أجا',                 active:true},
  {id:58, cityId:5, name:'دكرنس',               active:true},
  {id:59, cityId:5, name:'تمي الأمديد',         active:true},
  {id:60, cityId:5, name:'ميت غمر',             active:true},
  // الغربية (6)
  {id:61, cityId:6, name:'طنطا',                active:true},
  {id:62, cityId:6, name:'المحلة الكبرى',       active:true},
  {id:63, cityId:6, name:'كفر الزيات',          active:true},
  {id:64, cityId:6, name:'زفتى',                active:true},
  {id:65, cityId:6, name:'السنطة',              active:true},
  {id:66, cityId:6, name:'بسيون',               active:true},
  {id:67, cityId:6, name:'سمنود',               active:true},
  // كفر الشيخ (7)
  {id:68, cityId:7, name:'كفر الشيخ (مركز)',   active:true},
  {id:69, cityId:7, name:'دسوق',                active:true},
  {id:70, cityId:7, name:'فوه',                 active:true},
  {id:71, cityId:7, name:'بلطيم',               active:true},
  {id:72, cityId:7, name:'مطوبس',               active:true},
  {id:73, cityId:7, name:'الرياض',              active:true},
  {id:74, cityId:7, name:'سيدي سالم',           active:true},
  {id:75, cityId:7, name:'قلين',                active:true},
  {id:76, cityId:7, name:'بيلا',                active:true},
  {id:77, cityId:7, name:'الحامول',             active:true},
  // المنوفية (8)
  {id:78, cityId:8, name:'شبين الكوم',          active:true},
  {id:79, cityId:8, name:'منوف',                active:true},
  {id:80, cityId:8, name:'أشمون',               active:true},
  {id:81, cityId:8, name:'قويسنا',              active:true},
  {id:82, cityId:8, name:'السادات',             active:true},
  {id:83, cityId:8, name:'بركة السبع',          active:true},
  {id:84, cityId:8, name:'الشهداء',             active:true},
  {id:85, cityId:8, name:'سرس الليان',          active:true},
  {id:86, cityId:8, name:'طنطا الكبرى',         active:true},
  // البحيرة (9)
  {id:87, cityId:9, name:'دمنهور',              active:true},
  {id:88, cityId:9, name:'كفر الدوار (البحيرة)',active:true},
  {id:89, cityId:9, name:'رشيد',                active:true},
  {id:90, cityId:9, name:'أبو حمص',             active:true},
  {id:91, cityId:9, name:'إيتاي البارود',       active:true},
  {id:92, cityId:9, name:'المحمودية',           active:true},
  {id:93, cityId:9, name:'حوش عيسى',           active:true},
  {id:94, cityId:9, name:'كوم حمادة',           active:true},
  {id:95, cityId:9, name:'شبراخيت',             active:true},
  {id:96, cityId:9, name:'وادي النطرون',        active:true},
  // الإسماعيلية (10)
  {id:97, cityId:10, name:'الإسماعيلية (مركز)', active:true},
  {id:98, cityId:10, name:'فايد',               active:true},
  {id:99, cityId:10, name:'القنطرة شرق',        active:true},
  {id:100,cityId:10, name:'القنطرة غرب',        active:true},
  {id:101,cityId:10, name:'التل الكبير',        active:true},
  {id:102,cityId:10, name:'أبو صوير',           active:true},
  // السويس (11)
  {id:103,cityId:11, name:'السويس (مركز)',       active:true},
  {id:104,cityId:11, name:'الأربعين',           active:true},
  {id:105,cityId:11, name:'عتاقة',              active:true},
  {id:106,cityId:11, name:'فيصل',               active:true},
  {id:107,cityId:11, name:'جناين',              active:true},
  // بورسعيد (12)
  {id:108,cityId:12, name:'بورسعيد (مركز)',     active:true},
  {id:109,cityId:12, name:'بورفؤاد',            active:true},
  {id:110,cityId:12, name:'الزهور',             active:true},
  {id:111,cityId:12, name:'المناخ',             active:true},
  // دمياط (13)
  {id:112,cityId:13, name:'دمياط (مركز)',       active:true},
  {id:113,cityId:13, name:'رأس البر',           active:true},
  {id:114,cityId:13, name:'فارسكور',            active:true},
  {id:115,cityId:13, name:'الزرقا',             active:true},
  {id:116,cityId:13, name:'كفر سعد',            active:true},
  {id:117,cityId:13, name:'عزبة البرج',         active:true},
  // المنيا (14)
  {id:118,cityId:14, name:'المنيا (مركز)',      active:true},
  {id:119,cityId:14, name:'ملوي',               active:true},
  {id:120,cityId:14, name:'سمالوط',             active:true},
  {id:121,cityId:14, name:'مغاغة',              active:true},
  {id:122,cityId:14, name:'بني مزار',           active:true},
  {id:123,cityId:14, name:'مطاي',               active:true},
  {id:124,cityId:14, name:'أبو قرقاص',          active:true},
  {id:125,cityId:14, name:'العدوة',             active:true},
  // أسيوط (15)
  {id:126,cityId:15, name:'أسيوط (مركز)',       active:true},
  {id:127,cityId:15, name:'ديروط',              active:true},
  {id:128,cityId:15, name:'منفلوط',             active:true},
  {id:129,cityId:15, name:'القوصية',            active:true},
  {id:130,cityId:15, name:'أبنوب',              active:true},
  {id:131,cityId:15, name:'صدفا',               active:true},
  {id:132,cityId:15, name:'الغنايم',            active:true},
  {id:133,cityId:15, name:'ساحل سليم',          active:true},
  // سوهاج (16)
  {id:134,cityId:16, name:'سوهاج (مركز)',       active:true},
  {id:135,cityId:16, name:'جرجا',               active:true},
  {id:136,cityId:16, name:'طما',                active:true},
  {id:137,cityId:16, name:'طهطا',               active:true},
  {id:138,cityId:16, name:'أخميم',              active:true},
  {id:139,cityId:16, name:'المراغة',            active:true},
  {id:140,cityId:16, name:'البلينا',            active:true},
  {id:141,cityId:16, name:'دار السلام',         active:true},
  // قنا (17)
  {id:142,cityId:17, name:'قنا (مركز)',         active:true},
  {id:143,cityId:17, name:'نجع حمادي',          active:true},
  {id:144,cityId:17, name:'دشنا',               active:true},
  {id:145,cityId:17, name:'أبو تشت',            active:true},
  {id:146,cityId:17, name:'قفط',                active:true},
  {id:147,cityId:17, name:'قوص',                active:true},
  {id:148,cityId:17, name:'الوقف',              active:true},
  // الأقصر (18)
  {id:149,cityId:18, name:'الأقصر (مركز)',      active:true},
  {id:150,cityId:18, name:'الأقصر الغربية',     active:true},
  {id:151,cityId:18, name:'إسنا',               active:true},
  {id:152,cityId:18, name:'أرمنت',              active:true},
  // أسوان (19)
  {id:153,cityId:19, name:'أسوان (مركز)',       active:true},
  {id:154,cityId:19, name:'كوم أمبو',           active:true},
  {id:155,cityId:19, name:'إدفو',               active:true},
  {id:156,cityId:19, name:'دراو',               active:true},
  {id:157,cityId:19, name:'نصر النوبة',         active:true},
  // الفيوم (20)
  {id:158,cityId:20, name:'الفيوم (مركز)',      active:true},
  {id:159,cityId:20, name:'إطسا',               active:true},
  {id:160,cityId:20, name:'سنورس',              active:true},
  {id:161,cityId:20, name:'يوسف الصديق',        active:true},
  {id:162,cityId:20, name:'طامية',              active:true},
  // بني سويف (21)
  {id:163,cityId:21, name:'بني سويف (مركز)',    active:true},
  {id:164,cityId:21, name:'ناصر',               active:true},
  {id:165,cityId:21, name:'الواسطى',            active:true},
  {id:166,cityId:21, name:'ببا',                active:true},
  {id:167,cityId:21, name:'الفشن',              active:true},
  {id:168,cityId:21, name:'بياض العرب',         active:true},
  // كفر الدوار (27)
  {id:169,cityId:27, name:'كفر الدوار (مركز)',  active:true},
  {id:170,cityId:27, name:'أبو المطامير',       active:true},
  {id:171,cityId:27, name:'حوش عيسى',          active:true},
];
let nextZoneId = 200;
let editingZoneIdx = -1;

// ── BRANCHES ──
let branches = [
  {id:1, name:'الفرع الرئيسي - القاهرة', cityId:1,  manager:'أحمد محمد', phone:'01000000001', address:'مدينة نصر - القاهرة',         active:true},
  {id:2, name:'فرع الجيزة',              cityId:2,  manager:'محمد علي',   phone:'01000000002', address:'الدقي - الجيزة',              active:true},
  {id:3, name:'فرع الإسكندرية',          cityId:3,  manager:'سامي حسن',   phone:'01000000003', address:'سيدي جابر - الإسكندرية',     active:true},
  {id:4, name:'فرع الغربية',             cityId:6,  manager:'',           phone:'',            address:'طنطا - الغربية',             active:true},
  {id:5, name:'فرع كفر الشيخ',           cityId:7,  manager:'',           phone:'',            address:'كفر الشيخ',                  active:true},
];
let nextBranchId = 6;
let editingBranchIdx = -1;

// ── ROLES ──
let roles = [
  {id:1, name:'مدير عام',    perms:['shipments','merchants','agents','finance','settings','reports'], active:true, users:1},
  {id:2, name:'موظف استلام', perms:['shipments','merchants'],                                        active:true, users:2},
  {id:3, name:'محاسب',       perms:['finance','reports'],                                            active:true, users:1},
  {id:4, name:'مشرف مناديب', perms:['shipments','agents'],                                           active:true, users:0},
];
let nextRoleId = 5;
let editingRoleIdx = -1;

// ── USERS ──
let users = [
  {id:1, name:'محمد مشهور', username:'admin', password:'admin123', roleId:1, branchId:1, phone:'01000000000', active:true},
  {id:2, name:'أحمد سامي',  username:'ahmed', password:'ahmed123', roleId:2, branchId:1, phone:'01011111111', active:true},
  {id:3, name:'منى علي',    username:'mona',  password:'mona123',  roleId:3, branchId:2, phone:'01022222222', active:true},
];
let nextUserId = 4;
let editingUserIdx = -1;

// ── MERCHANTS ──
let merchants = [];
let editingMerchantIdx = -1;

// ── AGENTS ──
let agents = [];
let editingAgentIdx = -1;

// ── SHIPMENTS ──
let shipments = [];
let editingShipmentIdx = -1;
let selectedShipments = new Set();

// ── REASONS ──
let reasons = [
  {name:'لم يرد مرتين',   type:'إلغاء',  active:true},
  {name:'رفض بعد معاينة', type:'إلغاء',  active:true},
  {name:'رفض الاستلام',   type:'إلغاء',  active:true},
  {name:'المنتج خطأ',     type:'إلغاء',  active:true},
  {name:'العميل غائب',    type:'تأجيل',  active:true},
  {name:'العنوان غلط',    type:'تأجيل',  active:true},
];
let editingReasonIdx = -1;

// ── EXPENSES ──
let expenses = [];

// ════════════════════════════════
// HELPERS
// ════════════════════════════════
function getCityName(id) { const c=cities.find(x=>x.id===id); return c?c.name:'-'; }
function getRoleName(id)  { const r=roles.find(x=>x.id===id);  return r?r.name:'-'; }
function getBranchName(id){ const b=branches.find(x=>x.id===id);return b?b.name:'-'; }
function today() { return new Date().toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'}); }
function todayISO() { return new Date().toISOString().split('T')[0]; }
function generateBillNo() { return 'FS-' + Date.now().toString().slice(-6); }

function populateCitySelects() {
  const activeCities = cities.filter(c=>c.active);
  ['z-city','b-city','zone-city-filter','a-city','sh-city'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = (id==='zone-city-filter')
      ? '<option value="">كل المدن</option>'
      : '<option value="">اختر المدينة</option>';
    activeCities.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    sel.value = val;
  });
  // Sync dynamic city selects by data attribute
  document.querySelectorAll('[data-city-sel]').forEach(sel => {
    const val = sel.value;
    sel.innerHTML = '<option value="">اختر المدينة</option>';
    activeCities.forEach(c => sel.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    sel.value = val;
  });
}
function populateBranchSelects() {
  ['u-branch','sh-branch'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = '<option value="">اختر الفرع</option>';
    branches.filter(b=>b.active).forEach(b => sel.innerHTML += `<option value="${b.id}">${b.name}</option>`);
    sel.value = val;
  });
}
function populateRoleSelects() {
  const sel = document.getElementById('u-role');
  if (!sel) return;
  sel.innerHTML = '<option value="">اختر الدور</option>';
  roles.filter(r=>r.active).forEach(r => sel.innerHTML += `<option value="${r.id}">${r.name}</option>`);
}
function syncBranchSelects() {
  document.querySelectorAll('#m-branch,#a-branch').forEach(sel => {
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = '<option value="">اختر الفرع</option>';
    branches.filter(b=>b.active).forEach(b => sel.innerHTML += `<option value="${b.name}">${b.name}</option>`);
    sel.value = val;
  });
}
function updateZonesForCity(cityId, zoneSelectId) {
  const sel = document.getElementById(zoneSelectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">اختر المنطقة</option>';
  if (!cityId) return;
  zones.filter(z=>z.cityId==cityId&&z.active).forEach(z => sel.innerHTML += `<option value="${z.name}">${z.name}</option>`);
}

// ════════════════════════════════
// CITIES CRUD
// ════════════════════════════════
function renderCities(list) {
  list = list || cities;
  const tb  = document.getElementById('cities-tbody');
  const cnt = document.getElementById('cities-count');
  if (cnt) cnt.textContent = 'عدد المدن: ' + list.length;
  if (!list.length) {
    tb.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-ico">🏙️</div><p>لا توجد مدن</p></div></td></tr>';
    return;
  }
  tb.innerHTML = list.map((c,i) => {
    const zoneCount = zones.filter(z=>z.cityId===c.id).length;
    return `<tr>
      <td>${i+1}</td>
      <td><strong>${c.name}</strong></td>
      <td><span style="font-size:11px;color:var(--muted);font-family:monospace">${c.code}</span></td>
      <td><span class="badge badge-blue">${zoneCount} منطقة</span></td>
      <td><span class="badge ${c.active?'badge-green':'badge-gray'}">${c.active?'● نشط':'● غير نشط'}</span></td>
      <td>
        <span class="act-btn" onclick="editCity(${c.id})" title="تعديل">✏️</span>
        <span class="act-btn" style="margin-right:4px" onclick="toggleCityActive(${c.id})" title="${c.active?'إيقاف':'تفعيل'}">${c.active?'🔴':'🟢'}</span>
      </td>
    </tr>`;
  }).join('');
}
function filterCities(q) {
  renderCities(cities.filter(c=>c.name.includes(q)||c.code.toLowerCase().includes(q.toLowerCase())));
}
function openCityModal() {
  editingCityIdx = -1;
  document.getElementById('c-name').value='';
  document.getElementById('c-code').value='';
  document.getElementById('c-active').classList.add('on');
  document.getElementById('city-modal-title').textContent='إضافة مدينة جديدة';
  openModal('city-modal');
}
function editCity(id) {
  const c=cities.find(x=>x.id===id); if(!c) return;
  editingCityIdx=cities.indexOf(c);
  document.getElementById('c-name').value=c.name;
  document.getElementById('c-code').value=c.code;
  c.active?document.getElementById('c-active').classList.add('on'):document.getElementById('c-active').classList.remove('on');
  document.getElementById('city-modal-title').textContent='تعديل بيانات المدينة';
  openModal('city-modal');
}
function saveCity() {
  const name=document.getElementById('c-name').value.trim();
  if(!name){showToast('⚠️ اسم المدينة مطلوب');return;}
  const active=document.getElementById('c-active').classList.contains('on');
  if(editingCityIdx>=0){
    const c=cities[editingCityIdx]; c.name=name; c.active=active;
    editingCityIdx=-1; showToast('تم تعديل المدينة ✓');
  } else {
    const code=name.substring(0,3).toUpperCase()+nextCityId;
    cities.push({id:nextCityId++,name,code,active});
    showToast('تم إضافة المدينة ✓');
  }
  renderCities(); populateCitySelects(); closeModal('city-modal');
}
function toggleCityActive(id) {
  const c=cities.find(x=>x.id===id);
  if(c){c.active=!c.active;renderCities();populateCitySelects();showToast(c.active?'✅ تم تفعيل المدينة':'🔴 تم إيقاف المدينة');}
}

// ════════════════════════════════
// ZONES CRUD
// ════════════════════════════════
function renderZones(list) {
  list=list||zones;
  const tb=document.getElementById('zones-tbody');
  const cnt=document.getElementById('zones-count');
  if(cnt) cnt.textContent='عدد المناطق: '+list.length;
  if(!list.length){
    tb.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-ico">🗺️</div><p>لا توجد مناطق</p></div></td></tr>';
    return;
  }
  tb.innerHTML=list.map((z,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${z.name}</td>
      <td><span class="badge badge-blue">${getCityName(z.cityId)}</span></td>
      <td><span class="badge ${z.active?'badge-green':'badge-gray'}">${z.active?'● نشط':'● غير نشط'}</span></td>
      <td>
        <span class="act-btn" onclick="editZone(${z.id})">✏️</span>
        <span class="act-btn" style="margin-right:4px" onclick="toggleZoneActive(${z.id})">${z.active?'🔴':'🟢'}</span>
      </td>
    </tr>`).join('');
}
function filterZones(q) {
  const cityFilter=document.getElementById('zone-city-filter').value;
  let list=zones;
  if(cityFilter) list=list.filter(z=>z.cityId==cityFilter);
  if(q) list=list.filter(z=>z.name.includes(q));
  renderZones(list);
}
function filterZonesByCity(cityId) {
  const list=cityId?zones.filter(z=>z.cityId==cityId):zones;
  renderZones(list);
}
function openZoneModal() {
  editingZoneIdx=-1;
  document.getElementById('z-name').value='';
  document.getElementById('z-city').value='';
  document.getElementById('z-active').classList.add('on');
  document.getElementById('zone-modal-title').textContent='إضافة منطقة جديدة';
  openModal('zone-modal');
}
function editZone(id) {
  const z=zones.find(x=>x.id===id); if(!z) return;
  editingZoneIdx=zones.indexOf(z);
  document.getElementById('z-name').value=z.name;
  document.getElementById('z-city').value=z.cityId;
  z.active?document.getElementById('z-active').classList.add('on'):document.getElementById('z-active').classList.remove('on');
  document.getElementById('zone-modal-title').textContent='تعديل المنطقة';
  openModal('zone-modal');
}
function saveZone() {
  const name=document.getElementById('z-name').value.trim();
  const cityId=parseInt(document.getElementById('z-city').value);
  if(!name){showToast('⚠️ اسم المنطقة مطلوب');return;}
  if(!cityId){showToast('⚠️ اختر المدينة');return;}
  const active=document.getElementById('z-active').classList.contains('on');
  if(editingZoneIdx>=0){
    const z=zones[editingZoneIdx]; z.name=name; z.cityId=cityId; z.active=active;
    editingZoneIdx=-1; showToast('تم تعديل المنطقة ✓');
  } else {
    zones.push({id:nextZoneId++,cityId,name,active});
    showToast('تم إضافة المنطقة ✓');
  }
  renderZones(); closeModal('zone-modal');
}
function toggleZoneActive(id) {
  const z=zones.find(x=>x.id===id);
  if(z){z.active=!z.active;renderZones();}
}

// ════════════════════════════════
// BRANCHES CRUD
// ════════════════════════════════
function renderBranches() {
  const tb=document.getElementById('branches-tbody'); if(!tb) return;
  if(!branches.length){
    tb.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-ico">🏢</div><p>لا توجد فروع</p></div></td></tr>';
    return;
  }
  tb.innerHTML=branches.map((b,i)=>`
    <tr>
      <td>${i+1}</td>
      <td><strong>${b.name}</strong></td>
      <td>${getCityName(b.cityId)}</td>
      <td>${b.manager||'-'}</td>
      <td>${b.phone||'-'}</td>
      <td><span class="badge ${b.active?'badge-green':'badge-gray'}">${b.active?'● نشط':'● غير نشط'}</span></td>
      <td><span class="act-btn" onclick="editBranch(${b.id})">✏️</span></td>
    </tr>`).join('');
  syncBranchSelects();
}
function openBranchModal() {
  editingBranchIdx=-1;
  ['b-name','b-manager','b-phone','b-address'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('b-city').value='';
  document.getElementById('b-active').classList.add('on');
  document.getElementById('branch-modal-title').textContent='إضافة فرع جديد';
  openModal('branch-modal');
}
function editBranch(id) {
  const b=branches.find(x=>x.id===id); if(!b) return;
  editingBranchIdx=branches.indexOf(b);
  document.getElementById('b-name').value=b.name;
  document.getElementById('b-city').value=b.cityId;
  document.getElementById('b-manager').value=b.manager;
  document.getElementById('b-phone').value=b.phone;
  document.getElementById('b-address').value=b.address;
  b.active?document.getElementById('b-active').classList.add('on'):document.getElementById('b-active').classList.remove('on');
  document.getElementById('branch-modal-title').textContent='تعديل الفرع';
  openModal('branch-modal');
}
function saveBranch() {
  const name=document.getElementById('b-name').value.trim();
  const cityId=parseInt(document.getElementById('b-city').value);
  if(!name){showToast('⚠️ اسم الفرع مطلوب');return;}
  if(!cityId){showToast('⚠️ اختر المدينة');return;}
  const manager=document.getElementById('b-manager').value.trim();
  const phone=document.getElementById('b-phone').value.trim();
  const address=document.getElementById('b-address').value.trim();
  const active=document.getElementById('b-active').classList.contains('on');
  if(editingBranchIdx>=0){
    Object.assign(branches[editingBranchIdx],{name,cityId,manager,phone,address,active});
    editingBranchIdx=-1; showToast('تم تعديل الفرع ✓');
  } else {
    branches.push({id:nextBranchId++,name,cityId,manager,phone,address,active});
    showToast('تم إضافة الفرع ✓');
  }
  renderBranches(); populateBranchSelects(); closeModal('branch-modal');
}

// ════════════════════════════════
// ROLES CRUD
// ════════════════════════════════
const permLabels={shipments:'الشحنات',merchants:'التجار',agents:'المناديب',finance:'الحسابات',settings:'التعريفات',reports:'التقارير'};
function renderRoles() {
  const tb=document.getElementById('roles-tbody'); if(!tb) return;
  if(!roles.length){
    tb.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-ico">👥</div><p>لا توجد أدوار</p></div></td></tr>';
    return;
  }
  tb.innerHTML=roles.map((r,i)=>`
    <tr>
      <td>${i+1}</td>
      <td><strong>${r.name}</strong></td>
      <td style="font-size:11px">${r.perms.map(p=>`<span class="badge badge-blue" style="margin-left:3px">${permLabels[p]||p}</span>`).join('')}</td>
      <td><span class="badge badge-gray">${r.users} مستخدم</span></td>
      <td><span class="badge ${r.active?'badge-green':'badge-gray'}">${r.active?'● نشط':'● غير نشط'}</span></td>
      <td><span class="act-btn" onclick="editRole(${r.id})">✏️</span></td>
    </tr>`).join('');
}
function openRoleModal() {
  editingRoleIdx=-1;
  document.getElementById('ro-name').value='';
  ['shipments','merchants','agents','finance','settings','reports'].forEach(p=>{
    const el=document.getElementById('perm-'+p);
    if(el) el.checked=['shipments','merchants','agents'].includes(p);
  });
  document.getElementById('ro-active').classList.add('on');
  document.getElementById('role-modal-title').textContent='إضافة دور جديد';
  openModal('role-modal');
}
function editRole(id) {
  const r=roles.find(x=>x.id===id); if(!r) return;
  editingRoleIdx=roles.indexOf(r);
  document.getElementById('ro-name').value=r.name;
  ['shipments','merchants','agents','finance','settings','reports'].forEach(p=>{
    const el=document.getElementById('perm-'+p);
    if(el) el.checked=r.perms.includes(p);
  });
  r.active?document.getElementById('ro-active').classList.add('on'):document.getElementById('ro-active').classList.remove('on');
  document.getElementById('role-modal-title').textContent='تعديل الدور';
  openModal('role-modal');
}
function saveRole() {
  const name=document.getElementById('ro-name').value.trim();
  if(!name){showToast('⚠️ اسم الدور مطلوب');return;}
  const perms=['shipments','merchants','agents','finance','settings','reports'].filter(p=>{
    const el=document.getElementById('perm-'+p); return el&&el.checked;
  });
  const active=document.getElementById('ro-active').classList.contains('on');
  if(editingRoleIdx>=0){
    Object.assign(roles[editingRoleIdx],{name,perms,active});
    editingRoleIdx=-1; showToast('تم تعديل الدور ✓');
  } else {
    roles.push({id:nextRoleId++,name,perms,active,users:0});
    showToast('تم إضافة الدور ✓');
  }
  renderRoles(); populateRoleSelects(); closeModal('role-modal');
}

// ════════════════════════════════
// USERS CRUD
// ════════════════════════════════
function renderUsers() {
  const tb=document.getElementById('users-tbody'); if(!tb) return;
  if(!users.length){
    tb.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-ico">👤</div><p>لا يوجد مستخدمين</p></div></td></tr>';
    return;
  }
  tb.innerHTML=users.map((u,i)=>`
    <tr>
      <td>${i+1}</td>
      <td><strong>${u.name}</strong></td>
      <td><span style="font-size:11px;color:var(--muted);font-family:monospace">@${u.username}</span></td>
      <td><span class="badge badge-purple">${getRoleName(u.roleId)}</span></td>
      <td>${u.phone||'-'}</td>
      <td><span class="badge ${u.active?'badge-green':'badge-gray'}">${u.active?'● نشط':'● غير نشط'}</span></td>
      <td><span class="act-btn" onclick="editUser(${u.id})">✏️</span></td>
    </tr>`).join('');
}
function openUserModal() {
  editingUserIdx=-1;
  ['u-name','u-username','u-pass','u-phone'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('u-role').value='';
  document.getElementById('u-branch').value='';
  document.getElementById('u-active').classList.add('on');
  document.getElementById('user-modal-title').textContent='إضافة مستخدم جديد';
  openModal('user-modal');
}
function editUser(id) {
  const u=users.find(x=>x.id===id); if(!u) return;
  editingUserIdx=users.indexOf(u);
  document.getElementById('u-name').value=u.name;
  document.getElementById('u-username').value=u.username;
  document.getElementById('u-pass').value='';
  document.getElementById('u-phone').value=u.phone;
  document.getElementById('u-role').value=u.roleId;
  document.getElementById('u-branch').value=u.branchId||'';
  u.active?document.getElementById('u-active').classList.add('on'):document.getElementById('u-active').classList.remove('on');
  document.getElementById('user-modal-title').textContent='تعديل بيانات المستخدم';
  openModal('user-modal');
}
function saveUser() {
  const name=document.getElementById('u-name').value.trim();
  const username=document.getElementById('u-username').value.trim();
  const roleId=parseInt(document.getElementById('u-role').value);
  if(!name){showToast('⚠️ الاسم مطلوب');return;}
  if(!username){showToast('⚠️ اسم المستخدم مطلوب');return;}
  if(!roleId){showToast('⚠️ اختر الدور');return;}
  const phone=document.getElementById('u-phone').value.trim();
  const branchId=parseInt(document.getElementById('u-branch').value)||null;
  const active=document.getElementById('u-active').classList.contains('on');
  if(editingUserIdx>=0){
    Object.assign(users[editingUserIdx],{name,username,roleId,branchId,phone,active});
    editingUserIdx=-1; showToast('تم تعديل المستخدم ✓');
  } else {
    users.push({id:nextUserId++,name,username,roleId,branchId,phone,active});
    showToast('تم إضافة المستخدم ✓');
  }
  renderUsers(); closeModal('user-modal');
}

// ════════════════════════════════
// MERCHANT CRUD
// ════════════════════════════════
function openMerchantModal() {
  editingMerchantIdx=-1;
  ['m-name','m-phone','m-email','m-address','m-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('m-branch').value='';
  document.getElementById('merchant-modal-title').textContent='إضافة تاجر جديد';
  openModal('merchant-modal');
}
function saveMerchant() {
  const name=document.getElementById('m-name').value.trim();
  if(!name){showToast('⚠️ اسم التاجر مطلوب');return;}
  const phone=document.getElementById('m-phone').value.trim();
  if(!phone){showToast('⚠️ رقم الهاتف مطلوب');return;}
  const branch=document.getElementById('m-branch').value;
  const email=document.getElementById('m-email').value.trim();
  const address=document.getElementById('m-address').value.trim();
  const notes=document.getElementById('m-notes').value.trim();
  if(editingMerchantIdx>=0){
    Object.assign(merchants[editingMerchantIdx],{name,phone,branch,email,address,notes});
    editingMerchantIdx=-1; showToast('تم تعديل بيانات التاجر ✓');
  } else {
    const code='M'+String(merchants.length+1).padStart(3,'0');
    merchants.push({name,code,branch,phone,email,address,notes,active:true});
    showToast('تم إضافة التاجر بنجاح ✓');
  }
  renderMerchants(); closeModal('merchant-modal');
}
function renderMerchants() {
  const tb=document.querySelector('#page-merchants tbody'); if(!tb) return;
  if(!merchants.length){
    tb.innerHTML='<tr><td colspan="6"><div class="empty-state"><div class="empty-ico">🏪</div><p>لا توجد بيانات للعرض</p></div></td></tr>';
    return;
  }
  tb.innerHTML=merchants.map((m,i)=>`
    <tr>
      <td>${m.name}</td>
      <td><span style="font-size:11px;color:var(--muted)">${m.code}</span></td>
      <td>${m.branch||'-'}</td>
      <td>${m.phone}</td>
      <td><span class="badge badge-green">● نشط</span></td>
      <td><span class="act-btn" onclick="editMerchant(${i})">✏️</span></td>
    </tr>`).join('');
}
function editMerchant(i) {
  const m=merchants[i]; editingMerchantIdx=i;
  document.getElementById('m-name').value=m.name;
  document.getElementById('m-phone').value=m.phone;
  document.getElementById('m-branch').value=m.branch||'';
  document.getElementById('m-email').value=m.email||'';
  document.getElementById('m-address').value=m.address||'';
  document.getElementById('m-notes').value=m.notes||'';
  document.getElementById('merchant-modal-title').textContent='تعديل بيانات التاجر';
  openModal('merchant-modal');
}

// ════════════════════════════════
// AGENT CRUD
// ════════════════════════════════
function openAgentModal() {
  editingAgentIdx=-1;
  ['a-name','a-phone','a-phone2','a-zone','a-branch'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('a-city').value='';
  document.getElementById('a-rate').value='0';
  document.getElementById('agent-modal-title').textContent='إضافة مندوب جديد';
  openModal('agent-modal');
}
function saveAgent() {
  const name=document.getElementById('a-name').value.trim();
  if(!name){showToast('⚠️ اسم المندوب مطلوب');return;}
  const phone=document.getElementById('a-phone').value.trim();
  if(!phone){showToast('⚠️ رقم الهاتف مطلوب');return;}
  const phone2=document.getElementById('a-phone2').value.trim();
  const city=document.getElementById('a-city').value;
  const zone=document.getElementById('a-zone').value;
  const branch=document.getElementById('a-branch').value;
  const rate=document.getElementById('a-rate').value;
  if(editingAgentIdx>=0){
    Object.assign(agents[editingAgentIdx],{name,phone,phone2,city,zone,branch,rate});
    editingAgentIdx=-1; showToast('تم تعديل بيانات المندوب ✓');
  } else {
    agents.push({name,phone,phone2,city,zone,branch,rate,active:true});
    showToast('تم إضافة المندوب بنجاح ✓');
  }
  renderAgents(); closeModal('agent-modal');
}
function renderAgents() {
  const tb=document.querySelector('#page-agents tbody'); if(!tb) return;
  if(!agents.length){
    tb.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-ico">🚴</div><p>لا توجد بيانات للعرض</p></div></td></tr>';
    return;
  }
  tb.innerHTML=agents.map((a,i)=>`
    <tr>
      <td>${a.name}</td>
      <td>${a.phone}</td>
      <td>${a.zone||'-'}</td>
      <td><span class="badge badge-green">● نشط</span></td>
      <td><span class="act-btn" onclick="editAgent(${i})">✏️</span></td>
    </tr>`).join('');
}
function editAgent(i) {
  const a=agents[i]; editingAgentIdx=i;
  document.getElementById('a-name').value=a.name;
  document.getElementById('a-phone').value=a.phone;
  document.getElementById('a-phone2').value=a.phone2||'';
  document.getElementById('a-city').value=a.city||'';
  if(a.city) updateZonesForCity(a.city,'a-zone');
  document.getElementById('a-zone').value=a.zone||'';
  document.getElementById('a-branch').value=a.branch||'';
  document.getElementById('a-rate').value=a.rate||0;
  document.getElementById('agent-modal-title').textContent='تعديل بيانات المندوب';
  openModal('agent-modal');
}

// ════════════════════════════════
// SHIPMENTS CRUD
// ════════════════════════════════
function openShipmentModal() {
  editingShipmentIdx=-1;
  // Clear fields
  document.querySelectorAll('#shipment-modal input, #shipment-modal select, #shipment-modal textarea').forEach(el => {
    if(el.type==='checkbox'||el.type==='radio') return;
    el.value='';
  });
  document.getElementById('shipment-modal').querySelector('h3').textContent='إضافة شحنة جديدة';
  // Populate city select inside modal
  const citySelInModal = document.getElementById('sh-city');
  if(citySelInModal) {
    const val=citySelInModal.value;
    citySelInModal.innerHTML='<option value="">اختر المدينة</option>';
    cities.filter(c=>c.active).forEach(c=>citySelInModal.innerHTML+=`<option value="${c.id}">${c.name}</option>`);
    citySelInModal.value=val;
  }
  openModal('shipment-modal');
}
function saveShipment() {
  const recipient=document.getElementById('sh-recipient')?.value.trim();
  if(!recipient){showToast('⚠️ اسم المستلم مطلوب');return;}
  const phone=document.getElementById('sh-phone')?.value.trim();
  if(!phone){showToast('⚠️ رقم الهاتف مطلوب');return;}
  const cityId=document.getElementById('sh-city')?.value;
  const zone=document.getElementById('sh-zone')?.value;
  const amount=document.getElementById('sh-amount')?.value||0;
  const desc=document.getElementById('sh-desc')?.value.trim()||'';
  const billNo=generateBillNo();
  const now=todayISO();
  shipments.push({billNo,recipient,phone,cityId,zone,amount,desc,status:'قيد التوصيل',date:now,agent:'',active:true});
  showToast('تم إضافة الشحنة بنجاح ✓ رقم: '+billNo);
  renderShipments();
  closeModal('shipment-modal');
}
function renderShipments() {
  const tb=document.getElementById('shipments-tbody'); if(!tb) return;
  if(!shipments.length){
    tb.innerHTML='<tr><td colspan="8"><div class="empty-state"><div class="empty-ico">📭</div><p>لا توجد بيانات للعرض</p></div></td></tr>';
    return;
  }
  tb.innerHTML=shipments.map((s,i)=>`
    <tr>
      <td><input type="checkbox" onchange="toggleShipmentSelect(${i},this.checked)"></td>
      <td>${s.date}</td>
      <td><strong style="font-family:monospace">${s.billNo}</strong></td>
      <td><span class="badge badge-blue">-</span></td>
      <td>${s.agent||'-'}</td>
      <td>${s.recipient}</td>
      <td>${s.phone}</td>
      <td>
        <span class="badge ${statusBadge(s.status)}">${s.status}</span>
        <span class="act-btn" style="margin-right:4px" onclick="printBill(${i})" title="طباعة">🖨️</span>
      </td>
    </tr>`).join('');
}
function statusBadge(s){
  if(s==='تم التوصيل') return 'badge-green';
  if(s==='ملغي') return 'badge-red';
  if(s==='مرتجع') return 'badge-orange';
  return 'badge-blue';
}
function toggleShipmentSelect(i,checked){
  checked?selectedShipments.add(i):selectedShipments.delete(i);
  document.querySelector('.count-badge').textContent=`الشحنات المحددة: (${selectedShipments.size}) شحنة`;
}

// ════════════════════════════════
// PRINT FUNCTIONS
// ════════════════════════════════
function printBill(idx) {
  const s = shipments[idx];
  if(!s){showToast('⚠️ لا توجد شحنة محددة');return;}
  const cityName = cities.find(c=>c.id==s.cityId)?.name||'';
  const win = window.open('','_blank','width=400,height=600');
  win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>بوليصة شحن - ${s.billNo}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Cairo',sans-serif;padding:20px;font-size:13px;color:#0f172a}
  .header{text-align:center;border-bottom:3px solid #f97316;padding-bottom:14px;margin-bottom:14px}
  .logo{font-size:22px;font-weight:900;color:#f97316}
  .logo span{color:#0f172a}
  .bill-no{font-size:28px;font-weight:900;text-align:center;margin:10px 0;letter-spacing:2px;font-family:monospace}
  .barcode-placeholder{border:2px dashed #e2e8f0;padding:12px;text-align:center;font-family:monospace;font-size:15px;letter-spacing:3px;border-radius:6px;margin:8px 0}
  table{width:100%;border-collapse:collapse;margin-top:10px}
  td{padding:6px 8px;border:1px solid #e2e8f0;font-size:12.5px}
  td:first-child{font-weight:700;background:#f8fafc;width:35%}
  .footer{margin-top:14px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px}
  .status{display:inline-block;padding:3px 10px;border-radius:20px;font-weight:700;font-size:12px;background:#dbeafe;color:#1d4ed8}
  @media print{body{padding:0} @page{margin:10mm;size:A6}}
</style>
</head>
<body>
<div class="header">
  <div class="logo">📦 FastShip <span>Express</span></div>
  <div style="font-size:11px;color:#64748b;margin-top:4px">إدارة الشحن والتوصيل</div>
</div>
<div class="bill-no">${s.billNo}</div>
<div class="barcode-placeholder">||| ${s.billNo} |||</div>
<table>
  <tr><td>التاريخ</td><td>${s.date}</td></tr>
  <tr><td>المستلم</td><td><strong>${s.recipient}</strong></td></tr>
  <tr><td>الهاتف</td><td>${s.phone}</td></tr>
  <tr><td>المدينة</td><td>${cityName}</td></tr>
  <tr><td>المنطقة</td><td>${s.zone||'-'}</td></tr>
  <tr><td>الوصف</td><td>${s.desc||'-'}</td></tr>
  <tr><td>المبلغ</td><td><strong>${Number(s.amount).toLocaleString('ar-EG')} ج.م</strong></td></tr>
  <tr><td>الحالة</td><td><span class="status">${s.status}</span></td></tr>
</table>
<div class="footer">
  FastShip Express — Powered by Muhammed Mashhour<br>
  تم الطباعة: ${new Date().toLocaleString('ar-EG')}
</div>
<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script>
</body></html>`);
  win.document.close();
}

function printSelectedBills() {
  if(!selectedShipments.size){showToast('⚠️ اختر شحنات أولاً');return;}
  selectedShipments.forEach(i=>printBill(i));
}

function printPage() {
  window.print();
}

function exportToExcel() {
  if(!shipments.length){showToast('⚠️ لا توجد شحنات للتصدير');return;}
  let csv='رقم الشحنة,التاريخ,المستلم,الهاتف,المدينة,المنطقة,المبلغ,الحالة\n';
  shipments.forEach(s=>{
    const city=cities.find(c=>c.id==s.cityId)?.name||'';
    csv+=`${s.billNo},${s.date},${s.recipient},${s.phone},${city},${s.zone||''},${s.amount},${s.status}\n`;
  });
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='shipments.csv';
  a.click();
  showToast('✅ تم تصدير الملف بنجاح');
}

function downloadSampleFile() {
  const sample='رقم الشحنة,اسم المستلم,رقم الهاتف,المدينة,المنطقة,العنوان,المبلغ,الوصف\nFS-001,أحمد محمد,01011111111,القاهرة,مدينة نصر,شارع النصر,250,ملابس\n';
  const blob=new Blob(['\ufeff'+sample],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='sample-shipments.csv';
  a.click();
  showToast('✅ تم تحميل ملف المثال');
}

function assignAgent() {
  if(!selectedShipments.size){showToast('⚠️ اختر شحنات أولاً');return;}
  if(!agents.length){showToast('⚠️ لا يوجد مناديب مضافين');return;}
  showToast(`تم تعيين ${selectedShipments.size} شحنة على المندوب ✓`);
}

function changeStatus() {
  if(!selectedShipments.size){showToast('⚠️ اختر شحنات أولاً');return;}
  showToast('تم تغيير حالة '+selectedShipments.size+' شحنة ✓');
}

function createReturn() {
  if(!selectedShipments.size){showToast('⚠️ اختر شحنات أولاً');return;}
  showToast('تم إنشاء طلب استرجاع ✓');
}

// ════════════════════════════════
// REASONS CRUD
// ════════════════════════════════
function saveReason() {
  const name=document.getElementById('r-name').value.trim();
  if(!name){showToast('⚠️ اسم السبب مطلوب');return;}
  const type=document.getElementById('r-type').value;
  const active=document.getElementById('r-active').classList.contains('on');
  if(editingReasonIdx>=0){
    reasons[editingReasonIdx]={name,type,active}; editingReasonIdx=-1;
  } else { reasons.push({name,type,active}); }
  renderReasons(); closeModal('reason-modal');
  document.getElementById('r-name').value='';
  document.getElementById('reason-modal-title').textContent='إضافة سبب جديد';
  showToast('تم الحفظ بنجاح ✓');
}
function openReasonModal() {
  editingReasonIdx=-1;
  document.getElementById('r-name').value='';
  document.getElementById('r-type').value='إلغاء';
  document.getElementById('r-active').classList.add('on');
  document.getElementById('reason-modal-title').textContent='إضافة سبب جديد';
  openModal('reason-modal');
}
function editReason(idx) {
  editingReasonIdx=idx;
  const r=reasons[idx];
  document.getElementById('r-name').value=r.name;
  document.getElementById('r-type').value=r.type;
  r.active?document.getElementById('r-active').classList.add('on'):document.getElementById('r-active').classList.remove('on');
  document.getElementById('reason-modal-title').textContent='تعديل السبب';
  openModal('reason-modal');
}
function renderReasons() {
  const tb=document.getElementById('reasons-tbody'); if(!tb) return;
  tb.innerHTML=reasons.map((r,i)=>`
    <tr>
      <td>${r.name}</td>
      <td><span class="badge ${r.type==='إلغاء'?'badge-red':'badge-yellow'}">${r.type}</span></td>
      <td><span class="badge ${r.active?'badge-green':'badge-gray'}">${r.active?'● نشط':'● غير نشط'}</span></td>
      <td>${today()}</td>
      <td><span class="act-btn" onclick="editReason(${i})">✏️</span></td>
    </tr>`).join('');
}

// ════════════════════════════════
// TOAST
// ════════════════════════════════
let toastTimer;
function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

function switchEntitleTab(el,type) {
  document.querySelectorAll('.entitle-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  showToast('عرض مستحقات '+(type==='agents'?'المناديب':'التجار'));
}

// ════════════════════════════════
// INIT
// ════════════════════════════════
(function init() {
  checkSession();
  populateCitySelects();
  populateBranchSelects();
  populateRoleSelects();
  syncBranchSelects();
  renderCities();
  renderZones();
  renderBranches();
  renderRoles();
  renderUsers();
  renderReasons();
  renderShipments();
  renderMerchants();
  renderAgents();
})();
