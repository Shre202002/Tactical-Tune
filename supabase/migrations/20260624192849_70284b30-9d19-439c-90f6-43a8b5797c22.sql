
-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCTS
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  brand TEXT,
  short_description TEXT,
  description TEXT,
  sku TEXT,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  category_slug TEXT REFERENCES public.categories(slug) ON DELETE SET NULL,
  sub_category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  specifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  weight INTEGER,
  seo_title TEXT,
  seo_description TEXT,
  licence_required BOOLEAN NOT NULL DEFAULT false,
  power_plant TEXT,
  caliber TEXT,
  velocity TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON public.products(category_slug);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = true;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── SEED: CATEGORIES ────────────────────────────────────────────
INSERT INTO public.categories (name, slug, description, image, sort_order) VALUES
  ('CO2 Air Pistols', 'co2-air-pistols', 'High-performance CO2 powered air pistols for sport shooting',
    'https://www.invincibleone.in/wp-content/uploads/2021/04/PicsArt_04-10-02.14.16-scaled.jpg', 1),
  ('PCP Air Rifles', 'pcp-air-rifles', 'Pre-Charged Pneumatic air rifles for precision shooting',
    'https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg', 2),
  ('Break Barrel Air Rifles', 'break-barrel-air-rifles', 'Spring & nitro piston break barrel air rifles',
    'https://www.airgunkart.com/wp-content/uploads/2021/03/nx200-athena.jpg', 3),
  ('CO2 Revolvers', 'co2-revolvers', 'Classic full-metal CO2 revolvers for collectors and shooters',
    'https://www.invincibleone.in/wp-content/uploads/2021/06/PicsArt_06-17-06.58.56-scaled.jpg', 4),
  ('PCP Air Pistols', 'pcp-air-pistols', 'High-power PCP air pistols with rifle-like accuracy',
    'https://www.airgunkart.com/wp-content/uploads/harpy-x3.jpg', 5);

-- ─── SEED: PRODUCTS ──────────────────────────────────────────────
INSERT INTO public.products
  (name, slug, brand, short_description, description, sku, price, compare_at_price, category_slug, sub_category, tags, images, stock, low_stock_threshold, is_featured, licence_required, power_plant, caliber, velocity, weight, specifications, seo_title, seo_description)
VALUES
-- 1. Camstar Star PXi
('Camstar Star PXi .177 Cal PCP Air Rifle', 'camstar-star-pxi-pcp-air-rifle', 'Camstar Sports',
 'India''s premium PCP air rifle with side-lever action, 10-shot magazine, 870 FPS velocity, and 20 Joules power. Includes scope, hand pump, cover & pellets.',
 'Experience the perfect balance of precision, performance, and innovation with the Camstar Star PXi — proudly designed and manufactured in India. The Star PXi features a side-lever action, two-stage trigger, integrated suppressor, and 10-shot rotary magazine. With velocity up to 870 FPS (265 mps) and 20 Joules of muzzle energy. Combo includes Rifle + 4x32 Scope + 3-Stage PCP Hand Pump (200 Bar) + Cover + 2 Magazines + Pellets. No licence required. 100% Made in India.',
 'TT-PXICPRI-001', 31999, 35000, 'pcp-air-rifles', 'Indian PCP Rifles',
 ARRAY['pcp','air rifle','camstar','made in india','no licence','side lever','combo','scope included'],
 '[{"url":"https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg","alt":"Camstar Star PXi PCP Air Rifle","order":0}]'::jsonb,
 8, 3, true, false, 'PCP (Pre-Charged Pneumatic)', '.177 (4.5mm)', 'Up to 870 FPS / 265 mps', 3200,
 '[{"key":"Caliber","value":".177 (4.5mm)"},{"key":"Max Velocity","value":"870 FPS / 265 mps"},{"key":"Power","value":"20 Joules"},{"key":"Action","value":"Side-Lever"},{"key":"Magazine Capacity","value":"10 shots"},{"key":"Shots Per Fill","value":"Up to 90"},{"key":"Max Fill Pressure","value":"200 Bar / 2900 PSI"},{"key":"Trigger","value":"Two-Stage Adjustable"},{"key":"Suppressor","value":"Integrated"},{"key":"Scope Rail","value":"11mm Dovetail"},{"key":"Warranty","value":"1 Year"},{"key":"Country of Origin","value":"India"}]'::jsonb,
 'Camstar Star PXi PCP Air Rifle | Buy Online India | TacticalTune',
 'Buy Camstar Star PXi .177 Cal PCP Air Rifle in India. 870 FPS, 20 Joules, side-lever action, 90 shots/fill. Combo with scope & pump. No licence required.'),

-- 2. Camstar Star PX
('Camstar Star PX .177 Cal PCP Air Rifle', 'camstar-star-px-pcp-air-rifle', 'Camstar Sports',
 'Classic Black PCP air rifle with spare magazine, 90 shots per fill, 12 months warranty. Made in India.',
 'The Camstar Star PX is a reliable, high-performance PCP air rifle designed for accuracy and ease of use. Classic Black finish with spare magazine and 90 shots per fill. Built in India with 12-month manufacturer warranty.',
 'TT-PXCPRI-002', 24999, 27000, 'pcp-air-rifles', 'Indian PCP Rifles',
 ARRAY['pcp','air rifle','camstar','made in india','no licence','classic black'],
 '[{"url":"https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg","alt":"Camstar Star PX PCP Air Rifle","order":0}]'::jsonb,
 12, 3, false, false, 'PCP (Pre-Charged Pneumatic)', '.177 (4.5mm)', 'Up to 850 FPS', 3000,
 '[{"key":"Caliber","value":".177 (4.5mm)"},{"key":"Power Plant","value":"PCP"},{"key":"Shots Per Fill","value":"Up to 90"},{"key":"Finish","value":"Classic Black"},{"key":"Warranty","value":"12 Months"},{"key":"Country of Origin","value":"India"}]'::jsonb,
 'Camstar Star PX PCP Air Rifle | Buy Online India | TacticalTune',
 'Buy Camstar Star PX .177 Cal PCP Air Rifle. Classic Black, 90 shots/fill, spare magazine. Made in India.'),

-- 3. Precihole NX200 Athena Karbin
('Precihole NX200 Athena Karbin Air Rifle .177 Cal', 'precihole-nx200-athena-karbin-air-rifle', 'Precihole Sports',
 'Next-gen NX series air rifle — super accurate, short carbine barrel, fleur-de-lis checkering, max legal power. Perfect for fun shooting & field targets.',
 'The Precihole NX200 Athena Karbin is the next generation air rifle in Precihole''s legendary NX series. Short & compact barrel, classic-style stock with fleur-de-lis checkering, butt cap, butt pad, and metal trigger guard. Precise, Powerful and Pretty too.',
 'TT-NX200ATH-003', 14000, 16399, 'break-barrel-air-rifles', 'Indian Air Rifles',
 ARRAY['precihole','nx200','athena','karbin','break barrel','air rifle','made in india','no licence'],
 '[{"url":"https://www.airgunkart.com/wp-content/uploads/2021/03/nx200-athena.jpg","alt":"Precihole NX200 Athena Karbin Air Rifle","order":0}]'::jsonb,
 15, 4, true, false, 'Spring Piston', '.177 (4.5mm)', 'Up to 625 FPS', 2800,
 '[{"key":"Caliber","value":".177 (4.5mm)"},{"key":"Power Plant","value":"Spring Piston"},{"key":"Action","value":"Break Barrel"},{"key":"Max Velocity","value":"~625 FPS"},{"key":"Stock","value":"Classic with Fleur-de-lis Checkering"},{"key":"Barrel","value":"Short Karbin Barrel"},{"key":"Trigger Guard","value":"Metal"},{"key":"Country of Origin","value":"India"}]'::jsonb,
 'Precihole NX200 Athena Karbin Air Rifle .177 | Buy India | TacticalTune',
 'Buy Precihole NX200 Athena Karbin .177 air rifle at ₹14,000. Max legal power, fleur-de-lis stock. No licence.'),

-- 4. Precihole NX100 Club Elite Plus
('Precihole NX100 Club Elite Plus Air Rifle .177 Cal', 'precihole-nx100-club-elite-plus-air-rifle', 'Precihole Sports',
 'India''s No.1 open-sight competition air rifle. Nitro Piston technology, enhanced trigger, improved butt ergonomics. 600 FPS, 7.5 Joules.',
 'The Precihole NX100 Club Elite Plus is India''s go-to break-barrel competition air rifle. Nitro Piston technology, enhanced trigger, improved butt ergonomics, and proven Precihole Club accuracy. 7.5 Joules / 5.5 ft-lb power.',
 'TT-NX100CEP-004', 13000, 14000, 'break-barrel-air-rifles', 'Indian Air Rifles',
 ARRAY['precihole','nx100','club elite plus','nitro piston','break barrel','competition','made in india'],
 '[{"url":"https://www.airgunkart.com/wp-content/uploads/2021/03/nx200-athena.jpg","alt":"Precihole NX100 Club Elite Plus","order":0}]'::jsonb,
 20, 5, false, false, 'Nitro Piston', '.177 (4.5mm)', '600 FPS / 180 mps', 2600,
 '[{"key":"Caliber","value":".177 (4.5mm)"},{"key":"Max Velocity","value":"600 FPS / 180 mps"},{"key":"Power","value":"7.5 Joules / 5.5 ft-lb"},{"key":"Power Plant","value":"Nitro Piston"},{"key":"Action","value":"Break Barrel"},{"key":"Sights","value":"Open Sight (Competition Grade)"},{"key":"Country of Origin","value":"India"}]'::jsonb,
 'Precihole NX100 Club Elite Plus Air Rifle | Buy India | TacticalTune',
 'Buy Precihole NX100 Club Elite Plus .177 at ₹13,000. India''s No.1 open-sight competition rifle.'),

-- 5. Precihole PX100 Benchrest X3
('Precihole PX100 Benchrest X3 PCP Air Rifle', 'precihole-px100-benchrest-x3-pcp-air-rifle', 'Precihole Sports',
 'Match-grade PCP benchrest rifle with integrated suppressor, Picatinny rails, match-grade trigger, and dovetail scope mount. Precision redefined.',
 'The Precihole PX100 Benchrest X3 is a match-grade PCP air rifle for competitive shooters. Integrated suppressor, match-grade trigger, dual Dovetail & Picatinny mounting, and Picatinny accessory rail. Compatible with MZ07 and MZ10 magazines.',
 'TT-PX100BX3-005', 45499, 49000, 'pcp-air-rifles', 'Match Grade PCP',
 ARRAY['precihole','px100','benchrest','pcp','match grade','competition','suppressor','made in india'],
 '[{"url":"https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg","alt":"Precihole PX100 Benchrest X3","order":0}]'::jsonb,
 5, 2, true, false, 'PCP (Regulated)', '.177 (4.5mm)', 'Regulated — competition grade consistency', 4200,
 '[{"key":"Caliber","value":".177 (4.5mm)"},{"key":"Power Plant","value":"PCP (Regulated)"},{"key":"Action","value":"Bolt Action"},{"key":"Trigger","value":"Match Grade"},{"key":"Suppressor","value":"Integrated"},{"key":"Scope Rail","value":"Dovetail + Picatinny"},{"key":"Accessory Rail","value":"Picatinny (below barrel)"},{"key":"Magazine","value":"MZ07 / MZ10 compatible"},{"key":"Country of Origin","value":"India"}]'::jsonb,
 'Precihole PX100 Benchrest X3 PCP Air Rifle | TacticalTune India',
 'Buy Precihole PX100 Benchrest X3 match-grade PCP air rifle. Integrated suppressor, match trigger, Picatinny rails.'),

-- 6. Precihole PP100 Harpy X3
('Precihole PP100 Harpy X3 Air Pistol', 'precihole-pp100-harpy-x3-air-pistol', 'Precihole Sports',
 'Opening a new era in Indian air pistols — High Power PCP pistol with rifle-like accuracy, match trigger, integrated suppressor, and Picatinny rails.',
 'The Precihole PP100 Harpy X3 is a high-power PCP pistol that delivers rifle-like accuracy. Match-grade trigger, regulated cylinder, precision barrel, and integrated suppressor. Dovetail/Picatinny barrel mounts and Picatinny accessory rail for bipods.',
 'TT-PP100HX3-006', 26499, 29000, 'pcp-air-pistols', 'Indian PCP Pistols',
 ARRAY['precihole','pp100','harpy','pcp','air pistol','match grade','made in india','suppressor'],
 '[{"url":"https://www.airgunkart.com/wp-content/uploads/harpy-x3.jpg","alt":"Precihole PP100 Harpy X3","order":0}]'::jsonb,
 7, 2, false, false, 'PCP (Regulated)', '.177 (4.5mm)', 'High Power — regulated', 1400,
 '[{"key":"Caliber","value":".177 (4.5mm)"},{"key":"Power Plant","value":"PCP (Regulated)"},{"key":"Action","value":"Semi-Automatic"},{"key":"Trigger","value":"Match Grade"},{"key":"Magazine","value":"MZ07 / MZ10 compatible"},{"key":"Suppressor","value":"Integrated"},{"key":"Scope Rail","value":"Dovetail + Picatinny"},{"key":"Country of Origin","value":"India"}]'::jsonb,
 'Precihole PP100 Harpy X3 PCP Air Pistol | Buy India | TacticalTune',
 'Buy Precihole PP100 Harpy X3 PCP air pistol. Rifle-like accuracy, match trigger, suppressor, Picatinny rails.'),

-- 7. Crosman 1911
('Crosman 1911 CO2 BB Pistol .177 Cal (20-Round)', 'crosman-1911-co2-bb-pistol-177-cal', 'Crosman',
 'Realistic 1911 CO2 clone — semi-automatic, 20-shot BB magazine, 480 FPS, double-action. Feels and acts like a real 1911 firearm.',
 'The Crosman 1911 CO2 BB Pistol is for anyone who loves the 1911 platform. CO2-powered using 12-gram cartridges, semi-automatic with 480 FPS and a 20-shot spring-activated BB magazine. Perfect for plinking and indoor shooting.',
 'TT-CRO1911-007', 9499, 11000, 'co2-air-pistols', 'Imported CO2 Pistols',
 ARRAY['crosman','1911','co2','bb pistol','semi automatic','import','.177','plinking'],
 '[{"url":"https://www.invincibleone.in/wp-content/uploads/2021/04/PicsArt_04-10-02.14.16-scaled.jpg","alt":"Crosman 1911 CO2 BB Pistol","order":0}]'::jsonb,
 18, 4, false, false, 'CO2 (12g cartridge)', '.177 Cal (4.5mm)', '480 FPS', 750,
 '[{"key":"Caliber","value":".177 Cal (4.5mm)"},{"key":"Max Velocity","value":"480 FPS"},{"key":"Ammo Type","value":"BB"},{"key":"Shot Capacity","value":"20 rounds"},{"key":"Power Plant","value":"CO2 (12g)"},{"key":"Action","value":"Semi-Automatic, Double-Action"},{"key":"Safety","value":"Manual"},{"key":"Overall Length","value":"7.88 inch"},{"key":"Airgun Rail","value":"Yes"}]'::jsonb,
 'Crosman 1911 CO2 BB Pistol .177 | Buy India | TacticalTune',
 'Buy Crosman 1911 CO2 BB Pistol .177 in India. 480 FPS, 20-shot magazine, semi-auto. Realistic 1911 replica.'),

-- 8. Crosman SNR357
('Crosman SNR357 CO2 Full Metal Dual Ammo Revolver', 'crosman-snr357-co2-full-metal-revolver', 'Crosman',
 'Full-metal snub-nose CO2 revolver — fires both BBs and pellets, 6-round swing-out cylinder, adjustable rear sight, 400 FPS. 100 shots per fill.',
 'The Crosman SNR357 is a full-metal snub-nosed BB/pellet revolver. Up to 100 shots per fill, 6-round swing-out cylinder with reusable BB/pellet cartridges, double/single action, and adjustable rear sight.',
 'TT-SNR357-008', 14999, 17000, 'co2-revolvers', 'Imported CO2 Revolvers',
 ARRAY['crosman','snr357','revolver','co2','full metal','dual ammo','bb','pellet','import'],
 '[{"url":"https://www.invincibleone.in/wp-content/uploads/2022/05/146457-scaled.jpg","alt":"Crosman SNR357 CO2 Revolver","order":0}]'::jsonb,
 10, 3, true, false, 'CO2 (12g cartridge)', '.177 (4.5mm)', '400 FPS (BB) / 350 FPS (Pellet)', 870,
 '[{"key":"Caliber","value":".177 (4.5mm)"},{"key":"Max Velocity (BB)","value":"400 FPS"},{"key":"Max Velocity (Pellet)","value":"350 FPS"},{"key":"Power Plant","value":"CO2 (12g)"},{"key":"Ammo Type","value":"BB & Lead Pellets (Dual)"},{"key":"Action","value":"Revolver, Double/Single Action"},{"key":"Shot Capacity","value":"6 rounds"},{"key":"Max Shots Per Fill","value":"100"},{"key":"Barrel Length","value":"2.5 inch"},{"key":"Material","value":"Full Metal"},{"key":"Rear Sight","value":"Adjustable for windage & elevation"}]'::jsonb,
 'Crosman SNR357 CO2 Full Metal Revolver | Buy India | TacticalTune',
 'Buy Crosman SNR357 full metal CO2 revolver. Dual ammo (BB & pellet), 400 FPS, 100 shots/fill.'),

-- 9. Webley MKVI Battlefield
('Webley MKVI CO2 Pellet Revolver 6" Barrel — Battlefield Finish', 'webley-mkvi-co2-pellet-revolver-battlefield-finish', 'Webley',
 'Legendary WWII British service revolver — CO2 pellet repeater built from original 1915 blueprints. Full metal, 6-inch barrel, battlefield distressed finish.',
 'A legend of British firearms, the Webley Mark VI first entered service in 1915. This CO2 pellet repeater is built from original blueprints with original 1915 markings — it loads, cycles, fires, ejects, and field-strips like the original. Battlefield distressed finish for an authentic worn look.',
 'TT-WBMKVI-009', 19999, 22500, 'co2-revolvers', 'Imported CO2 Revolvers',
 ARRAY['webley','mkvi','mark vi','co2','revolver','full metal','battlefield','wwii','collectible','import'],
 '[{"url":"https://www.invincibleone.in/wp-content/uploads/2021/06/PicsArt_06-17-06.58.56-scaled.jpg","alt":"Webley MKVI CO2 Pellet Revolver Battlefield","order":0}]'::jsonb,
 6, 2, true, false, 'CO2 (12g cartridge)', '.177 (4.5mm)', '430 FPS', 1088,
 '[{"key":"Caliber","value":".177 (4.5mm)"},{"key":"Max Velocity","value":"430 FPS"},{"key":"Muzzle Energy","value":"2.1 ft/lbs"},{"key":"Power Plant","value":"CO2 (12g)"},{"key":"Action","value":"Revolver, Double/Single Action"},{"key":"Shot Capacity","value":"6 rounds"},{"key":"Barrel Length","value":"6.0 inch"},{"key":"Overall Length","value":"11.25 inch"},{"key":"Material","value":"Full Metal"},{"key":"Finish","value":"Battlefield Distressed"},{"key":"Barrel","value":"Rifled"},{"key":"Field Strippable","value":"Yes"}]'::jsonb,
 'Webley MKVI CO2 Revolver Battlefield Finish | Buy India | TacticalTune',
 'Buy Webley MKVI CO2 pellet revolver. Battlefield finish, 6-inch barrel, full metal, built from 1915 blueprints.'),

-- 10. Evanix MP30
('Evanix MP30 Semi-Automatic PCP Air Rifle .177 — High Power Tactical', 'evanix-mp30-semi-automatic-pcp-air-rifle-177', 'Evanix',
 'Experience rapid-fire performance with the Evanix MP30 — semi-auto PCP, 24-shot magazine, adjustable regulator, multiple Picatinny rails, compact tactical design.',
 'Experience rapid-fire performance with the Evanix MP30. Semi-automatic action for fast follow-up shots, adjustable regulator, 24-shot high-capacity magazine, and multiple Picatinny rails. Premium import product — ID verification required after order.',
 'TT-EVMP30-010', 225000, NULL, 'pcp-air-rifles', 'Premium Import PCP',
 ARRAY['evanix','mp30','pcp','semi automatic','tactical','high power','import','premium','picatinny','24 shot'],
 '[{"url":"https://www.invincibleone.in/wp-content/uploads/2026/06/1000856215.jpg","alt":"Evanix MP30 Semi-Auto PCP","order":0}]'::jsonb,
 3, 1, true, false, 'PCP (Regulated, Semi-Auto)', '.177 (4.5mm)', 'High Power', 3500,
 '[{"key":"Caliber","value":".177 (4.5mm)"},{"key":"Power Plant","value":"PCP (Pre-Charged Pneumatic)"},{"key":"Action","value":"Semi-Automatic"},{"key":"Magazine Capacity","value":"24 shots"},{"key":"Regulator","value":"Adjustable"},{"key":"Picatinny Rails","value":"Multiple (top, bottom, sides)"},{"key":"Barrel","value":"Precision Rifled"},{"key":"Design","value":"Compact Tactical"},{"key":"Brand","value":"Evanix (Korea)"}]'::jsonb,
 'Evanix MP30 Semi-Auto PCP Air Rifle .177 | ₹2,25,000 | TacticalTune',
 'Buy Evanix MP30 semi-automatic PCP air rifle in India at ₹2,25,000. 24-shot magazine, Picatinny rails.');
