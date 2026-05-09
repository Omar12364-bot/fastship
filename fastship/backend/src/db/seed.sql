-- ══════════════════════════════════════════════
-- FastShip Express — Seed Data
-- ══════════════════════════════════════════════

-- Cities (27 Egyptian Governorates)
INSERT INTO cities (name, code, active) VALUES
('القاهرة','CAI',true),('الجيزة','GIZ',true),('الإسكندرية','ALX',true),
('الشرقية','SHR',true),('الدقهلية','DAK',true),('الغربية','GHR',true),
('كفر الشيخ','KFS',true),('المنوفية','MNF',true),('البحيرة','BHR',true),
('الإسماعيلية','ISM',true),('السويس','SUZ',true),('بورسعيد','PSD',true),
('دمياط','DYT',true),('المنيا','MNA',true),('أسيوط','ASY',true),
('سوهاج','SOH',true),('قنا','QNA',true),('الأقصر','LXR',true),
('أسوان','ASW',true),('الفيوم','FAY',true),('بني سويف','BNS',true),
('الوادي الجديد','WAD',false),('البحر الأحمر','RED',false),
('مطروح','MTR',false),('شمال سيناء','NSN',false),
('جنوب سيناء','SSN',false),('كفر الدوار','KFD',true);

-- Zones for Cairo
INSERT INTO zones (city_id, name) VALUES
(1,'مدينة نصر'),(1,'المعادي'),(1,'حلوان'),(1,'مصر الجديدة'),
(1,'شبرا'),(1,'عين شمس'),(1,'النزهة'),(1,'المطرية'),(1,'الزيتون'),
(1,'المقطم'),(1,'حدائق الأهرام');

-- Zones for Giza
INSERT INTO zones (city_id, name) VALUES
(2,'الدقي'),(2,'المنيب'),(2,'بولاق الدكرور'),(2,'أكتوبر'),
(2,'الشيخ زايد'),(2,'حدائق أكتوبر'),(2,'كرداسة');

-- Zones for Alexandria
INSERT INTO zones (city_id, name) VALUES
(3,'سيدي جابر'),(3,'المنتزه'),(3,'العجمي'),(3,'كرموز'),
(3,'المحطة'),(3,'الرمل'),(3,'سيدي بشر'),(3,'أبو قير');

-- Roles
INSERT INTO roles (name, permissions) VALUES
('مدير عام',     '["shipments","merchants","agents","finance","settings","reports"]'),
('موظف استلام',  '["shipments","merchants"]'),
('محاسب',        '["finance","reports"]'),
('مشرف مناديب',  '["shipments","agents"]');

-- Branches
INSERT INTO branches (name, city_id, manager, phone, address) VALUES
('الفرع الرئيسي - القاهرة', 1, 'أحمد محمد', '01000000001', 'مدينة نصر - القاهرة'),
('فرع الجيزة',              2, 'محمد علي',   '01000000002', 'الدقي - الجيزة'),
('فرع الإسكندرية',          3, 'سامي حسن',   '01000000003', 'سيدي جابر - الإسكندرية');

INSERT INTO users (name, username, password, role_id, branch_id, phone) VALUES
('محمد مشهور', 'admin', '$2b$10$0x6fCRznWGE0E4cGYbclTOG7whdIJ694dXoxAR5oiVsA6/n3q6kdG', 1, 1, '01000000000'),
('أحمد سامي',  'ahmed', '$2b$10$EhKBX3Ww2WLHLix7ShYbku96BOmb4SXqccAcatFDlPmYbscnDc7Nu', 2, 1, '01011111111'),
('منى علي',    'mona',  '$2b$10$cAv64Gg1AhlRik9AJtpbuuWj7YA9hK1WRctH0hb3Vd6V4lQT09lka', 3, 2, '01022222222');

-- Cancel/Delay Reasons
INSERT INTO reasons (name, type) VALUES
('لم يرد مرتين','إلغاء'),('رفض بعد معاينة','إلغاء'),
('رفض الاستلام','إلغاء'),('المنتج خطأ','إلغاء'),
('العميل غائب','تأجيل'),('العنوان غلط','تأجيل');

-- Pricing list
INSERT INTO pricing_lists (name) VALUES ('قائمة ١٠٠ شحنة');
