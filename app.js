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
  if (activeNavItem) activeNavItem.classList.remove('active');
  if (el) { el.classList.add('active'); activeNavItem = el; }
}

function toggleSub(id, el) {
  const sub = document.getElementById(id);
  const hidden = sub.style.display === 'none' || sub.style.display === '';
  sub.style.display = hidden ? 'block' : 'none';
  el.classList.toggle('open', hidden);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openPricingModal() { openModal('pricing-modal'); }

document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

// ════════════════════════════════
// DATA STORE
// ════════════════════════════════

// ── CITIES DATA (كل محافظات مصر الأساسية) ──
let cities = [
  { id:1,  name:'القاهرة',       code:'CAI',  active:true },
  { id:2,  name:'الجيزة',        code:'GIZ',  active:true },
  { id:3,  name:'الإسكندرية',    code:'ALX',  active:true },
  { id:4,  name:'الشرقية',       code:'SHR',  active:true },
  { id:5,  name:'الدقهلية',      code:'DAK',  active:true },
  { id:6,  name:'الغربية',       code:'GHR',  active:true },
  { id:7,  name:'كفر الشيخ',     code:'KFS',  active:true },
  { id:8,  name:'المنوفية',      code:'MNF',  active:true },
  { id:9,  name:'البحيرة',       code:'BHR',  active:true },
  { id:10, name:'الإسماعيلية',   code:'ISM',  active:true },
  { id:11, name:'السويس',        code:'SUZ',  active:true },
  { id:12, name:'بورسعيد',       code:'PSD',  active:true },
  { id:13, name:'دمياط',         code:'DYT',  active:true },
  { id:14, name:'كفر الدوار',    code:'KFD',  active:true },
  { id:15, name:'المنيا',        code:'MNA',  active:true },
  { id:16, name:'أسيوط',         code:'ASY',  active:true },
  { id:17, name:'سوهاج',         code:'SOH',  active:true },
  { id:18, name:'قنا',           code:'QNA',  active:true },
  { id:19, name:'الأقصر',        code:'LXR',  active:true },
  { id:20, name:'أسوان',         code:'ASW',  active:true },
  { id:21, name:'الفيوم',        code:'FAY',  active:true },
  { id:22, name:'بني سويف',      code:'BNS',  active:true },
  { id:23, name:'الوادي الجديد', code:'WAD',  active:false },
  { id:24, name:'البحر الأحمر',  code:'RED',  active:false },
  { id:25, name:'مطروح',         code:'MTR',  active:false },
  { id:26, name:'شمال سيناء',    code:'NSN',  active:false },
  { id:27, name:'جنوب سيناء',    code:'SSN',  active:false },
];
let nextCityId = 28;
let editingCityIdx = -1;

// ── ZONES DATA ──
let zones = [
  // القاهرة
  { id:1,  cityId:1, name:'مدينة نصر',      active:true },
  { id:2,  cityId:1, name:'المعادي',         active:true },
  { id:3,  cityId:1, name:'حلوان',           active:true },
  { id:4,  cityId:1, name:'مصر الجديدة',     active:true },
  { id:5,  cityId:1, name:'زهراء مدينة نصر', active:true },
  { id:6,  cityId:1, name:'شبرا',            active:true },
  { id:7,  cityId:1, name:'عين شمس',         active:true },
  { id:8,  cityId:1, name:'النزهة',          active:true },
  // الجيزة
  { id:9,  cityId:2, name:'الدقي',           active:true },
  { id:10, cityId:2, name:'المنيب',          active:true },
  { id:11, cityId:2, name:'بولاق الدكرور',   active:true },
  { id:12, cityId:2, name:'صفط اللبن',       active:true },
  { id:13, cityId:2, name:'ميدان الجيزة',    active:true },
  { id:14, cityId:2, name:'أكتوبر',          active:true },
  { id:15, cityId:2, name:'الشيخ زايد',      active:true },
  // الإسكندرية
  { id:16, cityId:3, name:'سيدي جابر',       active:true },
  { id:17, cityId:3, name:'المنتزه',         active:true },
  { id:18, cityId:3, name:'العجمي',          active:true },
  { id:19, cityId:3, name:'كرموز',           active:true },
  { id:20, cityId:3, name:'المحطة',          active:true },
  // الشرقية
  { id:21, cityId:4, name:'الزقازيق',        active:true },
  { id:22, cityId:4, name:'العاشر من رمضان', active:true },
  { id:23, cityId:4, name:'أبو حماد',        active:true },
  { id:24, cityId:4, name:'ميت غمر',         active:true },
  // الدقهلية
  { id:25, cityId:5, name:'المنصورة',        active:true },
  { id:26, cityId:5, name:'طلخا',            active:true },
  { id:27, cityId:5, name:'ميت سلسيل',       active:true },
  // الغربية
  { id:28, cityId:6, name:'طنطا',            active:true },
  { id:29, cityId:6, name:'المحلة الكبرى',   active:true },
  { id:30, cityId:6, name:'كفر الزيات',      active:true },
  { id:31, cityId:6, name:'زفتى',            active:true },
  { id:32, cityId:6, name:'السنطة',          active:true },
  { id:33, cityId:6, name:'بسيون',           active:true },
  // كفر الشيخ
  { id:34, cityId:7, name:'كفر الشيخ',       active:true },
  { id:35, cityId:7, name:'دسوق',            active:true },
  { id:36, cityId:7, name:'فوه',             active:true },
  { id:37, cityId:7, name:'بلطيم',           active:true },
  { id:38, cityId:7, name:'مطوبس',           active:true },
  { id:39, cityId:7, name:'الرياض',          active:true },
  { id:40, cityId:7, name:'سيدي سالم',       active:true },
  { id:41, cityId:7, name:'قلين',            active:true },
  { id:42, cityId:7, name:'بيلا',            active:true },
  { id:43, cityId:7, name:'الحامول',         active:true },
  // المنوفية
  { id:44, cityId:8, name:'شبين الكوم',      active:true },
  { id:45, cityId:8, name:'منوف',            active:true },
  { id:46, cityId:8, name:'أشمون',           active:true },
  { id:47, cityId:8, name:'قويسنا',          active:true },
  // البحيرة
  { id:48, cityId:9, name:'دمنهور',          active:true },
  { id:49, cityId:9, name:'كفر الدوار',      active:true },
  { id:50, cityId:9, name:'رشيد',            active:true },
  { id:51, cityId:9, name:'أبو حمص',         active:true },
];
let nextZoneId = 100;
let editingZoneIdx = -1;

// ── BRANCHES DATA ──
let branches = [
  { id:1, name:'الفرع الرئيسي - القاهرة', cityId:1, manager:'أحمد محمد', phone:'01000000001', address:'مدينة نصر - القاهرة', active:true },
  { id:2, name:'فرع الجيزة',              cityId:2, manager:'محمد علي',   phone:'01000000002', address:'الدقي - الجيزة',     active:true },
  { id:3, name:'فرع الإسكندرية',          cityId:3, manager:'سامي حسن',   phone:'01000000003', address:'سيدي جابر - الإسكندرية', active:true },
  { id:4, name:'فرع الغربية',             cityId:6, manager:'',           phone:'',            address:'طنطا - الغربية',    active:true },
  { id:5, name:'فرع كفر الشيخ',           cityId:7, manager:'',           phone:'',            address:'كفر الشيخ',         active:true },
];
let nextBranchId = 6;
let editingBranchIdx = -1;

// ── ROLES DATA ──
let roles = [
  { id:1, name:'مدير عام',    perms:['shipments','merchants','agents','finance','settings','reports'], active:true, users:1 },
  { id:2, name:'موظف استلام', perms:['shipments','merchants'],                                        active:true, users:2 },
  { id:3, name:'محاسب',       perms:['finance','reports'],                                            active:true, users:1 },
  { id:4, name:'مشرف مناديب', perms:['shipments','agents'],                                           active:true, users:0 },
];
let nextRoleId = 5;
let editingRoleIdx = -1;

// ── USERS DATA ──
let users = [
  { id:1, name:'محمد مشهور', username:'admin',  roleId:1, branchId:1, phone:'01000000000', active:true },
  { id:2, name:'أحمد سامي',  username:'ahmed',  roleId:2, branchId:1, phone:'01011111111', active:true },
  { id:3, name:'منى علي',    username:'mona',   roleId:3, branchId:2, phone:'01022222222', active:true },
];
let nextUserId = 4;
let editingUserIdx = -1;

// ── MERCHANTS ──
let merchants = [];
let editingMerchantIdx = -1;

// ── AGENTS ──
let agents = [];
let editingAgentIdx = -1;

// ── REASONS ──
let reasons = [
  { name:'لم يرد مرتين',   type:'إلغاء',  active:true },
  { name:'رفض بعد معاينة', type:'إلغاء',  active:true },
  { name:'رفض الاستلام',   type:'إلغاء',  active:true },
  { name:'المنتج خطأ',     type:'إلغاء',  active:true },
  { name:'العميل غائب',    type:'تأجيل',  active:true },
  { name:'العنوان غلط',    type:'تأجيل',  active:true },
];
let editingReasonIdx = -1;

// ════════════════════════════════
// HELPERS
// ════════════════════════════════
function getCityName(id) {
  const c = cities.find(x => x.id === id);
  return c ? c.name : '-';
}
function getRoleName(id) {
  const r = roles.find(x => x.id === id);
  return r ? r.name : '-';
}
function getBranchName(id) {
  const b = branches.find(x => x.id === id);
  return b ? b.name : '-';
}
function populateCitySelects() {
  const activeCities = cities.filter(c => c.active);
  const selects = [
    'z-city', 'b-city', 'zone-city-filter',
    // in shipment & agent modals:
  ];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const val = sel.value;
    sel.innerHTML = id === 'zone-city-filter'
      ? '<option value="">كل المدن</option>'
      : '<option value="">اختر المدينة</option>';
    activeCities.forEach(c => {
      sel.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
    sel.value = val;
  });
  // All city selects in forms (shipments, agents filter)
  document.querySelectorAll('select.form-ctrl').forEach(sel => {
    if (sel.dataset.cityDyn) populateDynCitySelect(sel);
  });
}
function populateBranchSelects() {
  const sel = document.getElementById('u-branch');
  if (!sel) return;
  const val = sel.value;
  sel.innerHTML = '<option value="">اختر الفرع</option>';
  branches.filter(b=>b.active).forEach(b => {
    sel.innerHTML += `<option value="${b.id}">${b.name}</option>`;
  });
  sel.value = val;
}
function populateRoleSelects() {
  const sel = document.getElementById('u-role');
  if (!sel) return;
  sel.innerHTML = '<option value="">اختر الدور</option>';
  roles.filter(r=>r.active).forEach(r => {
    sel.innerHTML += `<option value="${r.id}">${r.name}</option>`;
  });
}

// ════════════════════════════════
// CITIES CRUD
// ════════════════════════════════
function renderCities(list) {
  list = list || cities;
  const tb = document.getElementById('cities-tbody');
  const cnt = document.getElementById('cities-count');
  cnt && (cnt.textContent = 'عدد المدن: ' + list.length);
  if (!list.length) {
    tb.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-ico">🏙️</div><p>لا توجد مدن</p></div></td></tr>';
    return;
  }
  tb.innerHTML = list.map((c, i) => {
    const zoneCount = zones.filter(z => z.cityId === c.id).length;
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
  renderCities(cities.filter(c => c.name.includes(q) || c.code.toLowerCase().includes(q.toLowerCase())));
}
function openCityModal(id) {
  editingCityIdx = -1;
  document.getElementById('c-name').value = '';
  document.getElementById('c-code').value = '';
  document.getElementById('c-active').classList.add('on');
  document.getElementById('city-modal-title').textContent = 'إضافة مدينة جديدة';
  openModal('city-modal');
}
function editCity(id) {
  const c = cities.find(x => x.id === id);
  if (!c) return;
  editingCityIdx = cities.indexOf(c);
  document.getElementById('c-name').value = c.name;
  document.getElementById('c-code').value = c.code;
  c.active ? document.getElementById('c-active').classList.add('on') : document.getElementById('c-active').classList.remove('on');
  document.getElementById('city-modal-title').textContent = 'تعديل بيانات المدينة';
  openModal('city-modal');
}
function saveCity() {
  const name = document.getElementById('c-name').value.trim();
  if (!name) { showToast('⚠️ اسم المدينة مطلوب'); return; }
  const active = document.getElementById('c-active').classList.contains('on');
  if (editingCityIdx >= 0) {
    const c = cities[editingCityIdx];
    c.name = name;
    c.active = active;
    editingCityIdx = -1;
    showToast('تم تعديل المدينة ✓');
  } else {
    const code = name.substring(0,3).toUpperCase() + nextCityId;
    cities.push({ id: nextCityId++, name, code, active });
    showToast('تم إضافة المدينة ✓');
  }
  renderCities();
  populateCitySelects();
  closeModal('city-modal');
}
function toggleCityActive(id) {
  const c = cities.find(x => x.id === id);
  if (c) { c.active = !c.active; renderCities(); populateCitySelects(); showToast(c.active ? '✅ تم تفعيل المدينة' : '🔴 تم إيقاف المدينة'); }
}

// ════════════════════════════════
// ZONES CRUD
// ════════════════════════════════
function renderZones(list) {
  list = list || zones;
  const tb = document.getElementById('zones-tbody');
  const cnt = document.getElementById('zones-count');
  cnt && (cnt.textContent = 'عدد المناطق: ' + list.length);
  if (!list.length) {
    tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-ico">🗺️</div><p>لا توجد مناطق</p></div></td></tr>';
    return;
  }
  tb.innerHTML = list.map((z, i) => `
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
  const cityFilter = document.getElementById('zone-city-filter').value;
  let list = zones;
  if (cityFilter) list = list.filter(z => z.cityId == cityFilter);
  if (q) list = list.filter(z => z.name.includes(q));
  renderZones(list);
}
function filterZonesByCity(cityId) {
  const list = cityId ? zones.filter(z => z.cityId == cityId) : zones;
  renderZones(list);
}
function openZoneModal() {
  editingZoneIdx = -1;
  document.getElementById('z-name').value = '';
  document.getElementById('z-city').value = '';
  document.getElementById('z-active').classList.add('on');
  document.getElementById('zone-modal-title').textContent = 'إضافة منطقة جديدة';
  openModal('zone-modal');
}
function editZone(id) {
  const z = zones.find(x => x.id === id);
  if (!z) return;
  editingZoneIdx = zones.indexOf(z);
  document.getElementById('z-name').value = z.name;
  document.getElementById('z-city').value = z.cityId;
  z.active ? document.getElementById('z-active').classList.add('on') : document.getElementById('z-active').classList.remove('on');
  document.getElementById('zone-modal-title').textContent = 'تعديل المنطقة';
  openModal('zone-modal');
}
function saveZone() {
  const name = document.getElementById('z-name').value.trim();
  const cityId = parseInt(document.getElementById('z-city').value);
  if (!name) { showToast('⚠️ اسم المنطقة مطلوب'); return; }
  if (!cityId) { showToast('⚠️ اختر المدينة'); return; }
  const active = document.getElementById('z-active').classList.contains('on');
  if (editingZoneIdx >= 0) {
    const z = zones[editingZoneIdx];
    z.name = name; z.cityId = cityId; z.active = active;
    editingZoneIdx = -1;
    showToast('تم تعديل المنطقة ✓');
  } else {
    zones.push({ id: nextZoneId++, cityId, name, active });
    showToast('تم إضافة المنطقة ✓');
  }
  renderZones();
  closeModal('zone-modal');
}
function toggleZoneActive(id) {
  const z = zones.find(x => x.id === id);
  if (z) { z.active = !z.active; renderZones(); }
}

// ════════════════════════════════
// BRANCHES CRUD
// ════════════════════════════════
function renderBranches() {
  const tb = document.getElementById('branches-tbody');
  if (!tb) return;
  if (!branches.length) {
    tb.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-ico">🏢</div><p>لا توجد فروع</p></div></td></tr>';
    return;
  }
  tb.innerHTML = branches.map((b, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${b.name}</strong></td>
      <td>${getCityName(b.cityId)}</td>
      <td>${b.manager || '-'}</td>
      <td>${b.phone || '-'}</td>
      <td><span class="badge ${b.active?'badge-green':'badge-gray'}">${b.active?'● نشط':'● غير نشط'}</span></td>
      <td><span class="act-btn" onclick="editBranch(${b.id})">✏️</span></td>
    </tr>`).join('');
  // sync merchant/agent branch selects
  syncBranchSelects();
}
function syncBranchSelects() {
  document.querySelectorAll('select').forEach(sel => {
    if (sel.id === 'm-branch' || sel.id === 'a-branch') {
      const val = sel.value;
      sel.innerHTML = '<option value="">اختر الفرع</option>';
      branches.filter(b=>b.active).forEach(b => {
        sel.innerHTML += `<option value="${b.name}">${b.name}</option>`;
      });
      sel.value = val;
    }
  });
}
function openBranchModal() {
  editingBranchIdx = -1;
  ['b-name','b-manager','b-phone','b-address'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('b-city').value = '';
  document.getElementById('b-active').classList.add('on');
  document.getElementById('branch-modal-title').textContent = 'إضافة فرع جديد';
  openModal('branch-modal');
}
function editBranch(id) {
  const b = branches.find(x => x.id === id);
  if (!b) return;
  editingBranchIdx = branches.indexOf(b);
  document.getElementById('b-name').value = b.name;
  document.getElementById('b-city').value = b.cityId;
  document.getElementById('b-manager').value = b.manager;
  document.getElementById('b-phone').value = b.phone;
  document.getElementById('b-address').value = b.address;
  b.active ? document.getElementById('b-active').classList.add('on') : document.getElementById('b-active').classList.remove('on');
  document.getElementById('branch-modal-title').textContent = 'تعديل الفرع';
  openModal('branch-modal');
}
function saveBranch() {
  const name = document.getElementById('b-name').value.trim();
  const cityId = parseInt(document.getElementById('b-city').value);
  if (!name) { showToast('⚠️ اسم الفرع مطلوب'); return; }
  if (!cityId) { showToast('⚠️ اختر المدينة'); return; }
  const manager = document.getElementById('b-manager').value.trim();
  const phone = document.getElementById('b-phone').value.trim();
  const address = document.getElementById('b-address').value.trim();
  const active = document.getElementById('b-active').classList.contains('on');
  if (editingBranchIdx >= 0) {
    Object.assign(branches[editingBranchIdx], { name, cityId, manager, phone, address, active });
    editingBranchIdx = -1;
    showToast('تم تعديل الفرع ✓');
  } else {
    branches.push({ id: nextBranchId++, name, cityId, manager, phone, address, active });
    showToast('تم إضافة الفرع ✓');
  }
  renderBranches();
  populateBranchSelects();
  closeModal('branch-modal');
}

// ════════════════════════════════
// ROLES CRUD
// ════════════════════════════════
const permLabels = { shipments:'الشحنات', merchants:'التجار', agents:'المناديب', finance:'الحسابات', settings:'التعريفات', reports:'التقارير' };
function renderRoles() {
  const tb = document.getElementById('roles-tbody');
  if (!tb) return;
  if (!roles.length) {
    tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-ico">👥</div><p>لا توجد أدوار</p></div></td></tr>';
    return;
  }
  tb.innerHTML = roles.map((r, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${r.name}</strong></td>
      <td style="font-size:11px">${r.perms.map(p => `<span class="badge badge-blue" style="margin-left:3px">${permLabels[p]||p}</span>`).join('')}</td>
      <td><span class="badge badge-gray">${r.users} مستخدم</span></td>
      <td><span class="badge ${r.active?'badge-green':'badge-gray'}">${r.active?'● نشط':'● غير نشط'}</span></td>
      <td><span class="act-btn" onclick="editRole(${r.id})">✏️</span></td>
    </tr>`).join('');
}
function openRoleModal() {
  editingRoleIdx = -1;
  document.getElementById('ro-name').value = '';
  ['shipments','merchants','agents','finance','settings','reports'].forEach(p => {
    const el = document.getElementById('perm-'+p);
    if (el) el.checked = ['shipments','merchants','agents'].includes(p);
  });
  document.getElementById('ro-active').classList.add('on');
  document.getElementById('role-modal-title').textContent = 'إضافة دور جديد';
  openModal('role-modal');
}
function editRole(id) {
  const r = roles.find(x => x.id === id);
  if (!r) return;
  editingRoleIdx = roles.indexOf(r);
  document.getElementById('ro-name').value = r.name;
  ['shipments','merchants','agents','finance','settings','reports'].forEach(p => {
    const el = document.getElementById('perm-'+p);
    if (el) el.checked = r.perms.includes(p);
  });
  r.active ? document.getElementById('ro-active').classList.add('on') : document.getElementById('ro-active').classList.remove('on');
  document.getElementById('role-modal-title').textContent = 'تعديل الدور';
  openModal('role-modal');
}
function saveRole() {
  const name = document.getElementById('ro-name').value.trim();
  if (!name) { showToast('⚠️ اسم الدور مطلوب'); return; }
  const perms = ['shipments','merchants','agents','finance','settings','reports'].filter(p => {
    const el = document.getElementById('perm-'+p); return el && el.checked;
  });
  const active = document.getElementById('ro-active').classList.contains('on');
  if (editingRoleIdx >= 0) {
    Object.assign(roles[editingRoleIdx], { name, perms, active });
    editingRoleIdx = -1;
    showToast('تم تعديل الدور ✓');
  } else {
    roles.push({ id: nextRoleId++, name, perms, active, users: 0 });
    showToast('تم إضافة الدور ✓');
  }
  renderRoles();
  populateRoleSelects();
  closeModal('role-modal');
}

// ════════════════════════════════
// USERS CRUD
// ════════════════════════════════
function renderUsers() {
  const tb = document.getElementById('users-tbody');
  if (!tb) return;
  if (!users.length) {
    tb.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-ico">👤</div><p>لا يوجد مستخدمين</p></div></td></tr>';
    return;
  }
  tb.innerHTML = users.map((u, i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${u.name}</strong></td>
      <td><span style="font-size:11px;color:var(--muted);font-family:monospace">@${u.username}</span></td>
      <td><span class="badge badge-purple">${getRoleName(u.roleId)}</span></td>
      <td>${u.phone || '-'}</td>
      <td><span class="badge ${u.active?'badge-green':'badge-gray'}">${u.active?'● نشط':'● غير نشط'}</span></td>
      <td><span class="act-btn" onclick="editUser(${u.id})">✏️</span></td>
    </tr>`).join('');
}
function openUserModal() {
  editingUserIdx = -1;
  ['u-name','u-username','u-pass','u-phone'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('u-role').value = '';
  document.getElementById('u-branch').value = '';
  document.getElementById('u-active').classList.add('on');
  document.getElementById('user-modal-title').textContent = 'إضافة مستخدم جديد';
  openModal('user-modal');
}
function editUser(id) {
  const u = users.find(x => x.id === id);
  if (!u) return;
  editingUserIdx = users.indexOf(u);
  document.getElementById('u-name').value = u.name;
  document.getElementById('u-username').value = u.username;
  document.getElementById('u-pass').value = '';
  document.getElementById('u-phone').value = u.phone;
  document.getElementById('u-role').value = u.roleId;
  document.getElementById('u-branch').value = u.branchId || '';
  u.active ? document.getElementById('u-active').classList.add('on') : document.getElementById('u-active').classList.remove('on');
  document.getElementById('user-modal-title').textContent = 'تعديل بيانات المستخدم';
  openModal('user-modal');
}
function saveUser() {
  const name = document.getElementById('u-name').value.trim();
  const username = document.getElementById('u-username').value.trim();
  const roleId = parseInt(document.getElementById('u-role').value);
  if (!name) { showToast('⚠️ الاسم مطلوب'); return; }
  if (!username) { showToast('⚠️ اسم المستخدم مطلوب'); return; }
  if (!roleId) { showToast('⚠️ اختر الدور'); return; }
  const phone = document.getElementById('u-phone').value.trim();
  const branchId = parseInt(document.getElementById('u-branch').value) || null;
  const active = document.getElementById('u-active').classList.contains('on');
  if (editingUserIdx >= 0) {
    Object.assign(users[editingUserIdx], { name, username, roleId, branchId, phone, active });
    editingUserIdx = -1;
    showToast('تم تعديل المستخدم ✓');
  } else {
    users.push({ id: nextUserId++, name, username, roleId, branchId, phone, active });
    showToast('تم إضافة المستخدم ✓');
  }
  renderUsers();
  closeModal('user-modal');
}

// ════════════════════════════════
// MERCHANT CRUD
// ════════════════════════════════
function saveMerchant() {
  const name = document.getElementById('m-name').value.trim();
  if (!name) { showToast('⚠️ اسم التاجر مطلوب'); return; }
  const phone = document.getElementById('m-phone').value.trim();
  if (!phone) { showToast('⚠️ رقم الهاتف مطلوب'); return; }
  const branch = document.getElementById('m-branch').value;
  const code = 'M' + String(merchants.length + 1).padStart(3,'0');
  merchants.push({ name, code, branch, phone });
  renderMerchants();
  closeModal('merchant-modal');
  document.getElementById('m-name').value = '';
  document.getElementById('m-phone').value = '';
  document.getElementById('m-branch').value = '';
  document.getElementById('m-email').value = '';
  document.getElementById('m-address').value = '';
  document.getElementById('m-notes').value = '';
  showToast('تم إضافة التاجر بنجاح ✓');
}
function renderMerchants() {
  const tb = document.querySelector('#page-merchants tbody');
  if (!merchants.length) {
    tb.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-ico">🏪</div><p>لا توجد بيانات للعرض</p></div></td></tr>';
    return;
  }
  tb.innerHTML = merchants.map((m,i) => `
    <tr>
      <td>${m.name}</td>
      <td><span style="font-size:11px;color:var(--muted)">${m.code}</span></td>
      <td>${m.branch || '-'}</td>
      <td>${m.phone}</td>
      <td><span class="badge badge-green">● نشط</span></td>
      <td><span class="act-btn" onclick="editMerchant(${i})">✏️</span></td>
    </tr>`).join('');
}
function editMerchant(i) {
  const m = merchants[i];
  document.getElementById('m-name').value = m.name;
  document.getElementById('m-phone').value = m.phone;
  document.getElementById('merchant-modal-title').textContent = 'تعديل بيانات التاجر';
  openModal('merchant-modal');
}

// ════════════════════════════════
// AGENT CRUD
// ════════════════════════════════
function saveAgent() {
  const name = document.getElementById('a-name').value.trim();
  if (!name) { showToast('⚠️ اسم المندوب مطلوب'); return; }
  const phone = document.getElementById('a-phone').value.trim();
  if (!phone) { showToast('⚠️ رقم الهاتف مطلوب'); return; }
  const zone = document.getElementById('a-zone').value;
  agents.push({ name, phone, zone });
  renderAgents();
  closeModal('agent-modal');
  document.getElementById('a-name').value = '';
  document.getElementById('a-phone').value = '';
  document.getElementById('a-phone2').value = '';
  document.getElementById('a-zone').value = '';
  document.getElementById('a-city').value = '';
  showToast('تم إضافة المندوب بنجاح ✓');
}
function renderAgents() {
  const tb = document.querySelector('#page-agents tbody');
  if (!agents.length) {
    tb.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-ico">🚴</div><p>لا توجد بيانات للعرض</p></div></td></tr>';
    return;
  }
  tb.innerHTML = agents.map((a,i) => `
    <tr>
      <td>${a.name}</td>
      <td>${a.phone}</td>
      <td>${a.zone || '-'}</td>
      <td><span class="badge badge-green">● نشط</span></td>
      <td><span class="act-btn" onclick="editAgent(${i})">✏️</span></td>
    </tr>`).join('');
}
function editAgent(i) {
  const a = agents[i];
  document.getElementById('a-name').value = a.name;
  document.getElementById('a-phone').value = a.phone;
  document.getElementById('agent-modal-title').textContent = 'تعديل بيانات المندوب';
  openModal('agent-modal');
}

// ════════════════════════════════
// CITY→ZONE DYNAMIC LINKING
// ════════════════════════════════
function updateZonesForCity(cityId, zoneSelectId) {
  const sel = document.getElementById(zoneSelectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">اختر المنطقة</option>';
  if (!cityId) return;
  zones.filter(z => z.cityId == cityId && z.active).forEach(z => {
    sel.innerHTML += `<option value="${z.name}">${z.name}</option>`;
  });
}

// ════════════════════════════════
// REASONS CRUD
// ════════════════════════════════
function saveReason() {
  const name = document.getElementById('r-name').value.trim();
  if (!name) { showToast('⚠️ اسم السبب مطلوب'); return; }
  const type = document.getElementById('r-type').value;
  const active = document.getElementById('r-active').classList.contains('on');
  if (editingReasonIdx >= 0) {
    reasons[editingReasonIdx] = { name, type, active };
    editingReasonIdx = -1;
  } else {
    reasons.push({ name, type, active });
  }
  renderReasons();
  closeModal('reason-modal');
  document.getElementById('r-name').value = '';
  document.getElementById('reason-modal-title').textContent = 'إضافة سبب جديد';
  showToast('تم الحفظ بنجاح ✓');
}
function editReason(name, type) {
  const idx = reasons.findIndex(r => r.name === name);
  if (idx < 0) return;
  editingReasonIdx = idx;
  const r = reasons[idx];
  document.getElementById('r-name').value = r.name;
  document.getElementById('r-type').value = r.type;
  const tog = document.getElementById('r-active');
  r.active ? tog.classList.add('on') : tog.classList.remove('on');
  document.getElementById('reason-modal-title').textContent = 'تعديل السبب';
  openModal('reason-modal');
}
function renderReasons() {
  const tb = document.getElementById('reasons-tbody');
  const now = new Date().toLocaleDateString('ar-EG',{day:'numeric',month:'long',year:'numeric'});
  tb.innerHTML = reasons.map((r,i) => `
    <tr>
      <td>${r.name}</td>
      <td><span class="badge ${r.type==='إلغاء'?'badge-red':'badge-yellow'}">${r.type}</span></td>
      <td><span class="badge ${r.active?'badge-green':'badge-gray'}">${r.active?'● نشط':'● غير نشط'}</span></td>
      <td>${now}</td>
      <td><span class="act-btn" onclick="editReason('${r.name}','${r.type}')">✏️</span></td>
    </tr>`).join('');
}

// ════════════════════════════════
// SHIPMENT
// ════════════════════════════════
function saveShipment() {
  closeModal('shipment-modal');
  showToast('تم إضافة الشحنة بنجاح ✓');
}

// ════════════════════════════════
// TOAST
// ════════════════════════════════
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function switchEntitleTab(el, type) {
  document.querySelectorAll('.entitle-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  showToast('عرض مستحقات ' + (type === 'agents' ? 'المناديب' : 'التجار'));
}

// open reason modal fresh
document.querySelector('[onclick="openModal(\'reason-modal\')"]') &&
  document.querySelector('[onclick="openModal(\'reason-modal\')"]').addEventListener('click', () => {
    editingReasonIdx = -1;
    document.getElementById('r-name').value = '';
    document.getElementById('r-type').value = 'إلغاء';
    document.getElementById('r-active').classList.add('on');
    document.getElementById('reason-modal-title').textContent = 'إضافة سبب جديد';
  });

// ════════════════════════════════
// INIT
// ════════════════════════════════
(function init() {
  populateCitySelects();
  populateBranchSelects();
  populateRoleSelects();
  renderCities();
  renderZones();
  renderBranches();
  renderRoles();
  renderUsers();
  renderReasons();

  // populate all existing city selects in the page (static ones)
  const staticCitySelects = document.querySelectorAll('select.form-ctrl');
  staticCitySelects.forEach(sel => {
    // detect city selects by checking for existing القاهرة option
    const opts = sel.querySelectorAll('option');
    const hasCity = Array.from(opts).some(o => o.textContent === 'القاهرة');
    if (hasCity) {
      const val = sel.value;
      sel.innerHTML = '<option value="">اختر المدينة</option>';
      cities.filter(c=>c.active).forEach(c => {
        sel.innerHTML += `<option value="${c.name}">${c.name}</option>`;
      });
      sel.value = val;
    }
  });
})();
