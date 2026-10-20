-- Migration 09: Seed a default Playdex organisation + all 135 Lahore venues
-- Uses a fixed UUID so re-running is idempotent (ON CONFLICT DO NOTHING).

-- ── Default organisation ────────────────────────────────────────────────────
INSERT INTO organization (id, company_name, description, phone_no)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Playdex Lahore Directory',
  'Auto-seeded public venue directory for Lahore arenas, gyms, and swimming pools.',
  '042 00000000'
)
ON CONFLICT (id) DO NOTHING;

-- ── Helper: reference the seeded org ────────────────────────────────────────
DO $$
DECLARE
  org_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- ════════════════════════════════════════════════════════════════════════════
-- ARENAS (82 venues)
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'The Padel Square', 'Padel courts', 'Street 20, L Block, DHA Phase 6, Lahore', 'Lahore', 50, 'Arena', '0317 9993993', 'https://maps.google.com/maps?q=The+Padel+Square+DHA+Phase+6+Lahore'),
  (org_id, 'Prime Padel Haus', 'Padel courts', 'Prime Padel Haus Road, Sector KK, DHA Phase 4, Lahore', 'Lahore', 40, 'Arena', '0325 0515333', 'https://maps.google.com/maps?q=Prime+Padel+Haus+DHA+Phase+4+Lahore'),
  (org_id, 'FR Padel Arena DHA Executive', 'Padel courts', 'M Block, DHA Phase 5, Lahore', 'Lahore', 60, 'Arena', '0331 3333011', 'https://maps.google.com/maps?q=FR+Padel+Arena+DHA+Executive+Lahore'),
  (org_id, 'Padel Park Lahore', 'Padel courts', 'Next to DHA Security Office, M Block, DHA Phase 5, Lahore', 'Lahore', 50, 'Arena', '0325 7233555', 'https://maps.google.com/maps?q=Padel+Park+Lahore'),
  (org_id, 'Farm Padel', 'Padel courts', 'Bristol Farms, H Block, Acro Green / Bakers Avenue, Lahore', 'Lahore', 40, 'Arena', '0321 7605683', 'https://maps.google.com/maps?q=Farm+Padel+Lahore'),
  (org_id, 'Padel Nexus', 'Padel courts', 'Main Canal Road, Harbanspura, Lahore', 'Lahore', 50, 'Arena', '0324 7233507', 'https://maps.google.com/maps?q=Padel+Nexus+Harbanspura+Lahore'),
  (org_id, 'Casa de Padel', 'Padel courts', 'FC49+FWQ, Kirian Wala / DHA Phase 5, Lahore', 'Lahore', 40, 'Arena', '0314 4128621', 'https://maps.google.com/maps?q=Casa+de+Padel+Lahore'),
  (org_id, 'Padel Cafe', 'Padel and badminton', 'Link Bedian Road, near PKLI Hospital, DHA Phase 6, Lahore', 'Lahore', 60, 'Arena', '0302 2949999', 'https://maps.google.com/maps?q=Padel+Cafe+DHA+Phase+6+Lahore'),
  (org_id, 'Space Padel Lahore', 'Padel courts', 'DHA Lahore', 'Lahore', 40, 'Arena', '0331 0432342', 'https://maps.google.com/maps?q=Space+Padel+Lahore'),
  (org_id, 'Pure Padel', 'Padel courts', 'Street 17, KK Block, DHA Phase 4, Lahore', 'Lahore', 40, 'Arena', '0311 7777873', 'https://maps.google.com/maps?q=Pure+Padel+DHA+Phase+4+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Coca-Cola Legends Arena', 'Futsal and padel', 'Street 10, Sector G, DHA Phase 5, Lahore', 'Lahore', 80, 'Arena', '0304 2227362', 'https://maps.google.com/maps?q=Coca+Cola+Legends+Arena+DHA+Phase+5+Lahore'),
  (org_id, 'Mega Arena', 'Cricket, futsal, padel', 'E-40 Bedian Road, near Jammu Stop, Lahore', 'Lahore', 200, 'Arena', '0325 6904488', 'https://maps.google.com/maps?q=Mega+Arena+Bedian+Road+Lahore'),
  (org_id, 'Maximus Sports Arena', 'Cricket and futsal', 'Main Raiwind Road, opposite Ali Fatima Hospital, Lahore', 'Lahore', 150, 'Arena', '0304 4386929', 'https://maps.google.com/maps?q=Maximus+Sports+Arena+Raiwind+Road+Lahore'),
  (org_id, 'Sky Sports Arena', 'Cricket', 'Bara Dari Road, Taragarh, Shahdara Town, Lahore', 'Lahore', 100, 'Arena', '0318 6430150', 'https://maps.google.com/maps?q=Sky+Sports+Arena+Shahdara+Lahore'),
  (org_id, 'LDA Sports Complex Minar-e-Pakistan', 'Multi-sport complex', 'Main Road, Ravi Park, Minar-e-Pakistan, Lahore', 'Lahore', 500, 'Arena', '0322 8888527', 'https://maps.google.com/maps?q=LDA+Sports+Complex+Minar+e+Pakistan+Lahore'),
  (org_id, 'Sportify Arena', 'Cricket and futsal', 'First Roundabout, near Unique School, Samanabad, Lahore', 'Lahore', 120, 'Arena', '0309 1447789', 'https://maps.google.com/maps?q=Sportify+Arena+Samanabad+Lahore'),
  (org_id, 'FR Sports Wapda Town', 'Cricket and futsal', '89, H1 Block, Wapda Town Phase 1, Lahore', 'Lahore', 100, 'Arena', '0331 3333011', 'https://maps.google.com/maps?q=FR+Sports+Wapda+Town+Lahore'),
  (org_id, 'Punjab University Sports Complex', 'Multi-sport complex', 'Quaid-e-Azam Campus, University of the Punjab, Lahore', 'Lahore', 500, 'Arena', '0327 8829422', 'https://maps.google.com/maps?q=Punjab+University+Sports+Complex+Lahore'),
  (org_id, '5th Generation Sports Complex', 'Multi-sport complex', 'Sector Y, DHA Phase 8, Lahore', 'Lahore', 300, 'Arena', '0333 0001333', 'https://maps.google.com/maps?q=5th+Generation+Sports+Complex+DHA+Phase+8+Lahore'),
  (org_id, 'Tennis & Badminton Stadium', 'Tennis and badminton', 'E-2 Block, Gulberg III, Lahore', 'Lahore', 200, 'Arena', '0300 0258096', 'https://maps.google.com/maps?q=Tennis+Badminton+Stadium+Gulberg+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'LDA Sports Complex Johar Town', 'Multi-sport complex', 'Khayaban-e-Firdousi, D2 Block, Johar Town, Lahore', 'Lahore', 400, 'Arena', '0300 4446506', 'https://maps.google.com/maps?q=LDA+Sports+Complex+Johar+Town+Lahore'),
  (org_id, 'Landmark Sports Arena', 'Multi-sport complex', 'Behind Safari Mall, Safari Block, Sector B, Bahria Town, Lahore', 'Lahore', 200, 'Arena', '0311 1111201', 'https://maps.google.com/maps?q=Landmark+Sports+Arena+Bahria+Town+Lahore'),
  (org_id, 'SkyLine Sports Arena', 'Cricket', 'H8VP+3XR, Chah Miran, Lahore', 'Lahore', 100, 'Arena', '0316 4646602', 'https://maps.google.com/maps?q=SkyLine+Sports+Arena+Lahore'),
  (org_id, 'Players Avenue Indoor Cricket', 'Cricket', 'Service Road West, Airline Society, Lahore', 'Lahore', 80, 'Arena', '0300 3205678', 'https://maps.google.com/maps?q=Players+Avenue+Indoor+Cricket+Lahore'),
  (org_id, 'Be Play Sports Arena', 'Cricket and indoor games', '1380 P Block Road, opposite Sabzazar Sports Complex, Lahore', 'Lahore', 120, 'Arena', '0332 7575782', 'https://maps.google.com/maps?q=Be+Play+Sports+Arena+Lahore'),
  (org_id, 'Cross Courts by FR', 'Futsal, cricket, padel', 'Green Acres Main Boulevard, near Valencia Roundabout, Pine Avenue, Lahore', 'Lahore', 150, 'Arena', '0331 3333011', 'https://maps.google.com/maps?q=Cross+Courts+FR+Valencia+Lahore'),
  (org_id, 'Cricbuzz Indoor Cricket Arena', 'Cricket', 'At Khan Gym, Kacha Jail Road, Quaid-e-Azam Industrial Estate, Lahore', 'Lahore', 80, 'Arena', '0345 4232602', 'https://maps.google.com/maps?q=Cricbuzz+Indoor+Cricket+Arena+Lahore'),
  (org_id, 'Pluto Arena', 'Futsal and cricket', '20 Abdul Sattar Edhi Road, Rahimabad, Lahore', 'Lahore', 100, 'Arena', '0306 4659219', 'https://maps.google.com/maps?q=Pluto+Arena+Rahimabad+Lahore'),
  (org_id, 'Maidaan Sports Arena', 'Cricket and badminton', '252 Block L, Johar Town, Lahore', 'Lahore', 120, 'Arena', '0325 1181822', 'https://maps.google.com/maps?q=Maidaan+Sports+Arena+Johar+Town+Lahore'),
  (org_id, 'Lord''s Futsal and Cricket Field', 'Futsal and cricket', 'Plot 535, Sector XX, DHA Phase 3, Lahore', 'Lahore', 100, 'Arena', '0326 6289004', 'https://maps.google.com/maps?q=Lords+Futsal+Cricket+DHA+Phase+3+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'THE CAGE Sports Arena', 'Cricket and futsal', 'Jinnah Extension, Lilac Block, Bahria Town, Lahore', 'Lahore', 100, 'Arena', '0324 4645763', 'https://maps.google.com/maps?q=THE+CAGE+Sports+Arena+Bahria+Town+Lahore'),
  (org_id, 'Legacy Arena Iqbal Town', 'Cricket and futsal', 'Bari Studios, Zeenat Block, Allama Iqbal Town, Lahore', 'Lahore', 100, 'Arena', '0336 4422883', 'https://maps.google.com/maps?q=Legacy+Arena+Iqbal+Town+Lahore'),
  (org_id, 'Arena 56 Indoor Cricket Sports Club', 'Cricket', '56 Main Boulevard, C Block, Sabzazar, Lahore', 'Lahore', 80, 'Arena', '0305 4060000', 'https://maps.google.com/maps?q=Arena+56+Indoor+Cricket+Sabzazar+Lahore'),
  (org_id, 'Game On Sports Complex', 'Multi-sport complex', 'Plot 769, Lahore', 'Lahore', 200, 'Arena', '0304 7052091', 'https://maps.google.com/maps?q=Game+On+Sports+Complex+Lahore'),
  (org_id, 'DHA Sports Complex Lahore', 'Multi-sport complex', 'Street 16, DHA Lahore', 'Lahore', 500, 'Arena', '042 37186411', 'https://maps.google.com/maps?q=DHA+Sports+Complex+Lahore'),
  (org_id, 'Ayub Sports Complex', 'Multi-sport complex', 'Aziz Bhatti Road, Lahore', 'Lahore', 500, 'Arena', '0325 9550711', 'https://maps.google.com/maps?q=Ayub+Sports+Complex+Lahore'),
  (org_id, 'Sports In', 'Multi-sport complex', 'F734+98Q, Lahore', 'Lahore', 150, 'Arena', '0335 0637802', 'https://maps.google.com/maps?q=Sports+In+Lahore'),
  (org_id, 'Sportzilla Sports Arena', 'Karting and multi-sport', 'Shabbir Sagheer Road, Bedian Road, Lahore', 'Lahore', 200, 'Arena', '0325 8999981', 'https://maps.google.com/maps?q=Sportzilla+Sports+Arena+Bedian+Road+Lahore'),
  (org_id, 'Play On Model Town', 'Indoor cricket', 'F8FJ+9FF, R Block, Model Town, Lahore', 'Lahore', 80, 'Arena', '0302 8804976', 'https://maps.google.com/maps?q=Play+On+Model+Town+Lahore'),
  (org_id, 'Askari Sports Arena', 'Multi-sport', 'Askari 11, Sector D, Lahore', 'Lahore', 150, 'Arena', '0301 8840334', 'https://maps.google.com/maps?q=Askari+Sports+Arena+Askari+11+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Sporto Indoor Football & Cricket', 'Cricket and futsal', '12 km Bedian Road, Lahore', 'Lahore', 100, 'Arena', '0317 8866633', 'https://maps.google.com/maps?q=Sporto+Indoor+Football+Cricket+Bedian+Lahore'),
  (org_id, 'JS Arena & Padel Court', 'Cricket and padel', 'Near DHA Phase 5, Natha Singh Wala, Lahore', 'Lahore', 100, 'Arena', '0309 4344431', 'https://maps.google.com/maps?q=JS+Arena+Padel+Court+DHA+Lahore'),
  (org_id, 'B Active Sports Arena', 'Multi-sport', 'Plot 711, Lahore', 'Lahore', 100, 'Arena', '0306 9217507', 'https://maps.google.com/maps?q=B+Active+Sports+Arena+Lahore'),
  (org_id, 'Wynn Sports Arena', 'Indoor sports', '3 km Khayaban-e-Jinnah, next to Al-Khidmat Foundation, Lahore', 'Lahore', 120, 'Arena', '0310 8888249', 'https://maps.google.com/maps?q=Wynn+Sports+Arena+Lahore'),
  (org_id, 'Lahore Indoor Arena', 'Indoor sports', 'Raiwind Road, beside Aslam Mart, LDA Avenue Phase 1, Lahore', 'Lahore', 120, 'Arena', '0313 4466669', 'https://maps.google.com/maps?q=Lahore+Indoor+Arena+Raiwind+Road'),
  (org_id, 'Falcon Arena', 'Indoor cricket and multi-sport', 'FC4J+3C, Natha Singh Wala, Lahore', 'Lahore', 100, 'Arena', '0322 1455179', 'https://maps.google.com/maps?q=Falcon+Arena+Natha+Singh+Wala+Lahore'),
  (org_id, 'Cric & Kick Indoor Arena', 'Indoor cricket and multi-sport', 'Doungi Ground, Block B, UET Housing Society, Lahore', 'Lahore', 100, 'Arena', '0339 1000103', 'https://maps.google.com/maps?q=Cric+Kick+Indoor+Arena+UET+Housing+Lahore'),
  (org_id, 'Indoor Cricket Sports Club', 'Indoor cricket and multi-sport', 'FCQC+6C4, Rohi Nala Road, Khuda Buksh Colony, Lahore', 'Lahore', 80, 'Arena', '0302 1414536', 'https://maps.google.com/maps?q=Indoor+Cricket+Sports+Club+Lahore'),
  (org_id, 'Sports Galaxy Indoor Cricket', 'Indoor cricket and multi-sport', 'M Block, opposite DHA Phase 5, Natha Singh Wala, Lahore', 'Lahore', 80, 'Arena', '0323 4522042', 'https://maps.google.com/maps?q=Sports+Galaxy+Indoor+Cricket+Lahore'),
  (org_id, 'CricBox Rooftop Cricket', 'Indoor cricket and multi-sport', 'NADRA Mega Center, PECO Road, Sector B1, Lahore', 'Lahore', 80, 'Arena', '0300 7722543', 'https://maps.google.com/maps?q=CricBox+Rooftop+Cricket+PECO+Road+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Royal Indoor Cricket Club', 'Indoor cricket and multi-sport', 'Main Bazar, Muft Pura, Gul Colony, Lahore', 'Lahore', 80, 'Arena', '0322 4291926', 'https://maps.google.com/maps?q=Royal+Indoor+Cricket+Club+Lahore'),
  (org_id, 'Royal Arena for Indoor Sports', 'Indoor cricket and multi-sport', 'GCGC+QFP, Sector F, Askari X, Lahore', 'Lahore', 100, 'Arena', '0300 4767119', 'https://maps.google.com/maps?q=Royal+Arena+Indoor+Sports+Askari+X+Lahore'),
  (org_id, 'Sixer Indoor Arena', 'Indoor cricket and multi-sport', '1369 P Block Road, near Sabzazar Hospital, Lahore', 'Lahore', 80, 'Arena', '0323 4384873', 'https://maps.google.com/maps?q=Sixer+Indoor+Arena+Sabzazar+Lahore'),
  (org_id, 'BM Cage Indoor Cricket', 'Indoor cricket and multi-sport', '140 Ali Town, Lahore', 'Lahore', 80, 'Arena', '0309 6737302', 'https://maps.google.com/maps?q=BM+Cage+Indoor+Cricket+Lahore'),
  (org_id, 'Straight Shots Cricket Arena', 'Indoor cricket and multi-sport', 'H7Q4+GRW, Sagian Wala Bypass Road, Lahore', 'Lahore', 80, 'Arena', '0320 6208221', 'https://maps.google.com/maps?q=Straight+Shots+Cricket+Arena+Lahore'),
  (org_id, 'Play Zone Indoor Cricket & Football', 'Indoor cricket and multi-sport', '257 L Block Road, Johar Town, Lahore', 'Lahore', 100, 'Arena', '0331 7776024', 'https://maps.google.com/maps?q=Play+Zone+Indoor+Cricket+Football+Johar+Town+Lahore'),
  (org_id, 'Lahore Sports Arena', 'Indoor cricket and multi-sport', 'Bypass Road, near Total Petrol Pump, Lahore', 'Lahore', 120, 'Arena', '0313 4613456', 'https://maps.google.com/maps?q=Lahore+Sports+Arena+Bypass+Road'),
  (org_id, 'Elite Indoor & Cricket Academy', 'Indoor cricket and multi-sport', 'Dera Chahal, Lahore', 'Lahore', 80, 'Arena', '0301 0010121', 'https://maps.google.com/maps?q=Elite+Indoor+Cricket+Academy+Dera+Chahal+Lahore'),
  (org_id, 'Straight Drive Indoor Sports', 'Indoor cricket and multi-sport', 'Ring Road Service Lane, near Quaid-e-Azam Road, Harbanspura, Lahore', 'Lahore', 80, 'Arena', '0321 8806039', 'https://maps.google.com/maps?q=Straight+Drive+Indoor+Sports+Harbanspura+Lahore'),
  (org_id, 'Fusion Arena', 'Indoor cricket and multi-sport', 'M Block, Natha Singh Wala, Lahore', 'Lahore', 80, 'Arena', '0328 5876146', 'https://maps.google.com/maps?q=Fusion+Arena+Natha+Singh+Wala+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Big Bash Boom Indoor Cricket Arena', 'Indoor cricket', '58-A Multan Road, near ShahFreed Darbar, Sabzazar, Lahore', 'Lahore', 80, 'Arena', '0327 0771157', 'https://maps.google.com/maps?q=Big+Bash+Boom+Indoor+Cricket+Arena+Lahore'),
  (org_id, 'Mughal''s Indoor Cricket', 'Indoor cricket', 'Bassi Mor, Shadi Pura, Lahore', 'Lahore', 80, 'Arena', '0313 4666041', 'https://maps.google.com/maps?q=Mughals+Indoor+Cricket+Shadi+Pura+Lahore'),
  (org_id, 'The Pavilion Cricket Club', 'Indoor cricket', '17-B1 Main Boulevard, Engineers Town, Lahore', 'Lahore', 100, 'Arena', '0324 7090830', 'https://maps.google.com/maps?q=The+Pavilion+Cricket+Club+Engineers+Town+Lahore'),
  (org_id, 'The Pavilion Executive', 'Indoor cricket', '2-A3 Main Boulevard, Engineers Town, Lahore', 'Lahore', 100, 'Arena', '0309 7414041', 'https://maps.google.com/maps?q=The+Pavilion+Executive+Engineers+Town+Lahore'),
  (org_id, 'MS Indoor & Cricket Academy', 'Indoor cricket', 'Hamza Park Street, Thokar Niaz Baig, Lahore', 'Lahore', 80, 'Arena', '0323 8820494', 'https://maps.google.com/maps?q=MS+Indoor+Cricket+Academy+Thokar+Niaz+Baig+Lahore'),
  (org_id, 'PlaySito Indoor Sports Arena', 'Indoor cricket', 'Mana Wala Stop, Bedian Road, Lahore', 'Lahore', 80, 'Arena', '0333 4099227', 'https://maps.google.com/maps?q=PlaySito+Indoor+Sports+Arena+Bedian+Road+Lahore'),
  (org_id, '3rd Umpire Cricket & Football Arena', 'Indoor cricket', 'Superior Services Housing Society / NESPAK area, Lahore', 'Lahore', 100, 'Arena', '0327 1717170', 'https://maps.google.com/maps?q=3rd+Umpire+Cricket+Football+Arena+Lahore'),
  (org_id, 'York Indoor', 'Indoor cricket', 'E-6 Street, Rah-e-Danish School, Nadirabad, Bedian Road, Lahore', 'Lahore', 80, 'Arena', '0300 7863290', 'https://maps.google.com/maps?q=York+Indoor+Bedian+Road+Lahore'),
  (org_id, 'PAK Indoor Cricket Arena', 'Indoor cricket', 'Lodhi Palace, Bund Road, Karim Park, Lahore', 'Lahore', 80, 'Arena', '0309 9068491', 'https://maps.google.com/maps?q=PAK+Indoor+Cricket+Arena+Bund+Road+Lahore'),
  (org_id, 'FR DHA Phase 5', 'Cricket and futsal', 'M Block, DHA Phase 5, Lahore', 'Lahore', 120, 'Arena', '0331 3333011', 'https://maps.google.com/maps?q=FR+DHA+Phase+5+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'FR Valencia', 'Cricket, futsal, padel', 'Block A, Valencia Community Centre, Lahore', 'Lahore', 150, 'Arena', '0331 3333011', 'https://maps.google.com/maps?q=FR+Valencia+Lahore'),
  (org_id, 'Misber Sports Academy', 'Cricket, futsal, padel', 'Valencia Town, Lahore', 'Lahore', 120, 'Arena', '0327 4255132', 'https://maps.google.com/maps?q=Misber+Sports+Academy+Valencia+Town+Lahore'),
  (org_id, 'Warehouse Arena', 'Padel, badminton, squash', 'Main Defence Road, opposite Valencia Gate 9, DHA Rahbar Phase 1, Lahore', 'Lahore', 150, 'Arena', '0329 8454567', 'https://maps.google.com/maps?q=Warehouse+Arena+Defence+Road+Lahore'),
  (org_id, 'Capt. Fasih Babar Ameen Shaheed Sports Complex', 'Multi-sport complex', 'Sector A, DHA Phase 6, Lahore', 'Lahore', 500, 'Arena', '042 37176020', 'https://maps.google.com/maps?q=Fasih+Babar+Ameen+Sports+Complex+DHA+Phase+6+Lahore'),
  (org_id, 'Khalid Sports Complex', 'Cricket, futsal, badminton', 'Plot 4, Lajna Chowk, College Road, Johar Town, Lahore', 'Lahore', 200, 'Arena', '0336 6444453', 'https://maps.google.com/maps?q=Khalid+Sports+Complex+Johar+Town+Lahore'),
  (org_id, 'Elite Wings Arena', 'Futsal and cricket', 'Lahore', 'Lahore', 100, 'Arena', '0306 0650391', 'https://maps.google.com/maps?q=Elite+Wings+Arena+Lahore'),
  (org_id, 'AIO Sports Arena', 'Indoor sports', 'P Block, TIP Block, Khayaban-e-Ameen, Lahore', 'Lahore', 100, 'Arena', NULL, 'https://maps.google.com/maps?q=AIO+Sports+Arena+Khayaban+e+Ameen+Lahore'),
  (org_id, 'Al-Raffay Rooftop Arena', 'Indoor cricket', 'Al-Faisal Town, Lahore', 'Lahore', 80, 'Arena', NULL, 'https://maps.google.com/maps?q=Al+Raffay+Rooftop+Arena+Al+Faisal+Town+Lahore'),
  (org_id, 'Aqua Cricket Arena', 'Indoor cricket', 'Wildlife Park Road, Kot Bagh, Lahore', 'Lahore', 80, 'Arena', NULL, 'https://maps.google.com/maps?q=Aqua+Cricket+Arena+Kot+Bagh+Lahore'),
  (org_id, 'Box Sports', 'Indoor cricket', 'Harbanspura, Lahore', 'Lahore', 80, 'Arena', NULL, 'https://maps.google.com/maps?q=Box+Sports+Harbanspura+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Can Games Indoor Arena', 'Indoor cricket', 'Ichhra, Lahore', 'Lahore', 80, 'Arena', NULL, 'https://maps.google.com/maps?q=Can+Games+Indoor+Arena+Ichhra+Lahore'),
  (org_id, 'Champions Sports Arena', 'Indoor sports', 'Mustafa Town, Lahore', 'Lahore', 100, 'Arena', NULL, 'https://maps.google.com/maps?q=Champions+Sports+Arena+Mustafa+Town+Lahore')
ON CONFLICT (name) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- GYMS & FITNESS CENTRES (35 venues)
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Structure Health & Fitness Gulberg', 'Gym and fitness centre', '39-A Zafar Ali Road, Gulberg V, Lahore', 'Lahore', 150, 'Gym', '0322 2295555', 'https://maps.google.com/maps?q=Structure+Health+Fitness+Gulberg+Lahore'),
  (org_id, 'Structure Health & Fitness Johar Town', 'Gym and fitness centre', '590, Block H-3, Phase 2, opposite Emporium Mall, Johar Town, Lahore', 'Lahore', 150, 'Gym', '0322 2265559', 'https://maps.google.com/maps?q=Structure+Health+Fitness+Johar+Town+Lahore'),
  (org_id, 'Structure Health & Fitness DHA', 'Gym and fitness centre', '186, CCA, DHA Phase 3, Lahore', 'Lahore', 150, 'Gym', '0322 2255591', 'https://maps.google.com/maps?q=Structure+Health+Fitness+DHA+Phase+3+Lahore'),
  (org_id, 'Shapes Wellness Club Gulberg', 'Gym and fitness centre', '50 E/1, adjacent Al Fatah Head Office, Gulberg III, Lahore', 'Lahore', 200, 'Gym', '042 111742737', 'https://maps.google.com/maps?q=Shapes+Wellness+Club+Gulberg+Lahore'),
  (org_id, 'Shapes Fitness Centre DHA', 'Gym and fitness centre', '275 Street 13, Sector G, DHA Phase 5, Lahore', 'Lahore', 200, 'Gym', '042 37177961', 'https://maps.google.com/maps?q=Shapes+Fitness+Centre+DHA+Phase+5+Lahore'),
  (org_id, 'GYMIT DHA Phase 6', 'Gym and fitness centre', '78 H, Main Boulevard, Sector H, DHA Phase 6, Lahore', 'Lahore', 100, 'Gym', '0302 4964888', 'https://maps.google.com/maps?q=GYMIT+DHA+Phase+6+Lahore'),
  (org_id, 'Pure Gym Lahore', 'Gym and fitness centre', 'Fazal Elahi Road, Rehmanpura Colony, Lahore', 'Lahore', 100, 'Gym', '0300 4122383', 'https://maps.google.com/maps?q=Pure+Gym+Rehmanpura+Lahore'),
  (org_id, 'Xtreme Fitness DHA Phase 8', 'Gym and fitness centre', 'Block M, Air Avenue, DHA Phase 8, Lahore', 'Lahore', 100, 'Gym', '0336 4255323', 'https://maps.google.com/maps?q=Xtreme+Fitness+DHA+Phase+8+Lahore'),
  (org_id, 'Sukh Chan Wellness Club', 'Gym and fitness centre', '25-H College Road, Gulberg II, Lahore', 'Lahore', 150, 'Gym', '0330 8602222', 'https://maps.google.com/maps?q=Sukh+Chan+Wellness+Club+Gulberg+Lahore'),
  (org_id, 'Max Fit Gym', 'Gym and fitness centre', 'CCA 1, Plaza 11, Sector C, DHA Phase 6, Lahore', 'Lahore', 80, 'Gym', '0300 7861723', 'https://maps.google.com/maps?q=Max+Fit+Gym+DHA+Phase+6+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'ABS Wellness Club Garden Town', 'Gym and fitness centre', '79 Babar Block, Garden Town, Lahore', 'Lahore', 100, 'Gym', '0307 0148821', 'https://maps.google.com/maps?q=ABS+Wellness+Club+Garden+Town+Lahore'),
  (org_id, 'ZS Fitness Gym', 'Gym and fitness centre', 'Canal View Park, Lahore', 'Lahore', 80, 'Gym', '0323 8810806', 'https://maps.google.com/maps?q=ZS+Fitness+Gym+Canal+View+Park+Lahore'),
  (org_id, 'Activo Fitness Gym Studio', 'Gym and fitness centre', '199-FF Commercial Area, DHA Phase 4, Lahore', 'Lahore', 80, 'Gym', '0300 4409888', 'https://maps.google.com/maps?q=Activo+Fitness+Gym+DHA+Phase+4+Lahore'),
  (org_id, 'Aesthetics Health & Fitness', 'Gym and fitness centre', '211-FF, DHA Phase 4, Lahore', 'Lahore', 80, 'Gym', '0321 4100261', 'https://maps.google.com/maps?q=Aesthetics+Health+Fitness+DHA+Phase+4+Lahore'),
  (org_id, 'Alphatime Fitness Club', 'Gym and fitness centre', '2nd Floor, Cakes and Bakes Building, Ali View Garden Cantt, Lahore', 'Lahore', 60, 'Gym', '0318 4032008', 'https://maps.google.com/maps?q=Alphatime+Fitness+Club+Lahore'),
  (org_id, 'ABS Wellness Club DHA', 'Gym and fitness centre', '338-Z Commercial Market, DHA Phase 3, Lahore', 'Lahore', 100, 'Gym', '0307 0857773', 'https://maps.google.com/maps?q=ABS+Wellness+Club+DHA+Phase+3+Lahore'),
  (org_id, 'AimFit Fitness Studios Garden Town', 'Gym and fitness centre', 'Plaza 23, Ali Block, Main Boulevard Garden Town, Lahore', 'Lahore', 80, 'Gym', '0315 4246348', 'https://maps.google.com/maps?q=AimFit+Fitness+Studios+Garden+Town+Lahore'),
  (org_id, 'Bazil Fitness Club', 'Gym and fitness centre', 'Plot 47-A, Jasmine Commercial, Park View City, Lahore', 'Lahore', 60, 'Gym', '0334 9511084', 'https://maps.google.com/maps?q=Bazil+Fitness+Club+Park+View+City+Lahore'),
  (org_id, 'Be Legend Fitness Club', 'Gym and fitness centre', '8-C Main, Faisal Town, Lahore', 'Lahore', 60, 'Gym', '0316 4609209', 'https://maps.google.com/maps?q=Be+Legend+Fitness+Club+Faisal+Town+Lahore'),
  (org_id, 'Beats Fitness', 'Gym and fitness centre', '24 Ali Block, Garden Town, Lahore', 'Lahore', 60, 'Gym', '0320 4027607', 'https://maps.google.com/maps?q=Beats+Fitness+Garden+Town+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Brick Gym & CrossFit', 'Gym and CrossFit', '213-Y Commercial Area, DHA Phase 3, Lahore', 'Lahore', 80, 'Gym', '0323 7710224', 'https://maps.google.com/maps?q=Brick+Gym+CrossFit+DHA+Phase+3+Lahore'),
  (org_id, 'Convert Fitness Atelier DHA Phase 3', 'Gym and fitness centre', '62-Z Commercial Area, DHA Phase 3, Lahore', 'Lahore', 60, 'Gym', '0321 8422240', 'https://maps.google.com/maps?q=Convert+Fitness+Atelier+DHA+Phase+3+Lahore'),
  (org_id, 'CrossFit Gym Firdous Market', 'CrossFit gym', 'Al-Mateen Majestic Plaza, Firdous Market, Gulberg III, Lahore', 'Lahore', 80, 'Gym', '0322 2262888', 'https://maps.google.com/maps?q=CrossFit+Gym+Firdous+Market+Gulberg+Lahore'),
  (org_id, 'Cuts & Shapes Fitness Center', 'Gym and fitness centre', 'Zarrar Shaheed Road, Old Officers Colony, Lahore', 'Lahore', 60, 'Gym', '0300 4217005', 'https://maps.google.com/maps?q=Cuts+Shapes+Fitness+Center+Lahore'),
  (org_id, 'Eleven Gym', 'Gym and fitness centre', '11-A Jail Road, Main Gulberg, Lahore', 'Lahore', 100, 'Gym', '042 35776816', 'https://maps.google.com/maps?q=Eleven+Gym+Jail+Road+Gulberg+Lahore'),
  (org_id, 'Equinox Fitness Studio', 'Gym and fitness centre', '4-Z Commercial Plaza, DHA Phase 3, Lahore', 'Lahore', 80, 'Gym', '0300 8888114', 'https://maps.google.com/maps?q=Equinox+Fitness+Studio+DHA+Phase+3+Lahore'),
  (org_id, 'Evoke Fitness Arena', 'Gym and fitness centre', 'A Road, Block B1, PIA Housing Society, Lahore', 'Lahore', 80, 'Gym', '0304 4976288', 'https://maps.google.com/maps?q=Evoke+Fitness+Arena+PIA+Housing+Society+Lahore'),
  (org_id, 'Qutab Fitness Club', 'Gym and fitness centre', 'Hassan Center, 1st Floor, Main Boulevard, Bahria Town, Lahore', 'Lahore', 80, 'Gym', '0322 0423279', 'https://maps.google.com/maps?q=Qutab+Fitness+Club+Bahria+Town+Lahore'),
  (org_id, 'Reshape Ladies Fitness Club', 'Ladies gym and fitness centre', 'Rehmat Market, 2nd Floor, Usmania Tower, WAPDA Town, Lahore', 'Lahore', 60, 'Gym', '0315 8046177', 'https://maps.google.com/maps?q=Reshape+Ladies+Fitness+Club+WAPDA+Town+Lahore'),
  (org_id, 'Sculpture Fitness', 'Gym and fitness centre', 'Defence Road opposite DHA Rahbar Gate 4, Lahore', 'Lahore', 80, 'Gym', '0300 4371516', 'https://maps.google.com/maps?q=Sculpture+Fitness+Defence+Road+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Ted Fitness', 'Gym and fitness centre', '1st Floor, 74 Civic Centre, Jubilee Town, Lahore', 'Lahore', 80, 'Gym', '0335 4541631', 'https://maps.google.com/maps?q=Ted+Fitness+Jubilee+Town+Lahore'),
  (org_id, 'Transformers Gym & Fitness Centre', 'Gym and fitness centre', '78 R1 Block, Main Boulevard, Johar Town Phase 2, Lahore', 'Lahore', 100, 'Gym', '0333 8470700', 'https://maps.google.com/maps?q=Transformers+Gym+Fitness+Johar+Town+Lahore'),
  (org_id, 'Velocity Health & Fitness', 'Gym and fitness centre', '5th Floor, Amanah Mall, Model Town Link Road, Lahore', 'Lahore', 100, 'Gym', '0322 4966664', 'https://maps.google.com/maps?q=Velocity+Health+Fitness+Amanah+Mall+Lahore'),
  (org_id, 'VCL Gym', 'Gym and fitness centre', '24-M Civic Centre, International Market, Model Town, Lahore', 'Lahore', 80, 'Gym', '0344 7760000', 'https://maps.google.com/maps?q=VCL+Gym+Model+Town+Lahore'),
  (org_id, 'Workout Zone Fitness Center', 'Gym and fitness centre', 'Street 8, Block B3, PGECHS, Lahore', 'Lahore', 80, 'Gym', '0309 9536709', 'https://maps.google.com/maps?q=Workout+Zone+Fitness+Center+PGECHS+Lahore')
ON CONFLICT (name) DO NOTHING;

-- ════════════════════════════════════════════════════════════════════════════
-- SWIMMING POOLS (18 venues)
-- ════════════════════════════════════════════════════════════════════════════
INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Punjab International Swimming Complex', 'Olympic swimming complex', 'Block E2, Gulberg III / Nishtar Park Sports Complex, Lahore', 'Lahore', 300, 'Pool', '042 99232532', 'https://maps.google.com/maps?q=Punjab+International+Swimming+Complex+Lahore'),
  (org_id, 'Greenland Swimming Pool', 'Swimming pool', 'Al Janet Road, off Sagian Wala Bypass Road, Lahore', 'Lahore', 150, 'Pool', '0304 4785543', 'https://maps.google.com/maps?q=Greenland+Swimming+Pool+Lahore'),
  (org_id, 'K Block Swimming Pool DHA Phase 5', 'Swimming pool', 'Sector K, DHA Phase 5, Lahore', 'Lahore', 200, 'Pool', '042 37176020', 'https://maps.google.com/maps?q=K+Block+Swimming+Pool+DHA+Phase+5+Lahore'),
  (org_id, 'Ashraf Sons Swimming Pool', 'Swimming pool', 'Brahamnabad Road, Mandiana Wala, Lahore', 'Lahore', 100, 'Pool', '0304 0838572', 'https://maps.google.com/maps?q=Ashraf+Sons+Swimming+Pool+Lahore'),
  (org_id, 'Defence Club J-Sector Pools', 'Swimming pools', 'Street 78, Sector J, DHA Phase 1, Lahore', 'Lahore', 200, 'Pool', '042 35723984', 'https://maps.google.com/maps?q=Defence+Club+J+Sector+DHA+Phase+1+Lahore'),
  (org_id, 'Defence Club FF Pool', 'Swimming pool', 'Sector FF, DHA Phase 4, Lahore', 'Lahore', 200, 'Pool', '042 35743450', 'https://maps.google.com/maps?q=Defence+Club+FF+DHA+Phase+4+Lahore'),
  (org_id, 'DHA Swimming Pool & Gym Complex', 'Swimming pool and gym', 'Y Block, near Sheba Park, DHA Phase 3, Lahore', 'Lahore', 200, 'Pool', NULL, 'https://maps.google.com/maps?q=DHA+Swimming+Pool+Gym+Complex+DHA+Phase+3+Lahore'),
  (org_id, 'Shapes Community Club Swimming Pool', 'Swimming pool', 'Al Rehman Garden Phase 2, Lahore', 'Lahore', 150, 'Pool', '0300 0222904', 'https://maps.google.com/maps?q=Shapes+Community+Club+Swimming+Pool+Lahore'),
  (org_id, 'Gold Spa and Fitness Club Pool', 'Swimming pool and spa', '3rd Floor, Mall of Lahore, Aziz Bhatti Road, Cantt, Lahore', 'Lahore', 150, 'Pool', '042 111111980', 'https://maps.google.com/maps?q=Gold+Spa+Fitness+Club+Mall+of+Lahore'),
  (org_id, 'Samanabad Sports Arena Swimming Pool', 'Swimming pool', 'Ghazali Road, Samanabad Town, Lahore', 'Lahore', 200, 'Pool', '042 37550000', 'https://maps.google.com/maps?q=Samanabad+Sports+Arena+Swimming+Pool+Lahore')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue (organization_id, name, description, address, city, capacity, sport_type, phone, google_maps_url)
VALUES
  (org_id, 'Lahore Gymkhana Club Pools', 'Swimming pools', 'Shahrah-e-Quaid-e-Azam, Gulberg V, Lahore', 'Lahore', 250, 'Pool', '042 35789417', 'https://maps.google.com/maps?q=Lahore+Gymkhana+Club+Pools+Lahore'),
  (org_id, 'Shapes Wellness Club Gulberg Pool', 'Swimming pool', '50 E/1, Gulberg III, Lahore', 'Lahore', 150, 'Pool', '042 111742737', 'https://maps.google.com/maps?q=Shapes+Wellness+Club+Gulberg+Pool+Lahore'),
  (org_id, 'Shapes Fitness Centre DHA Pool', 'Swimming pool', 'Street 13, Sector G, DHA Phase 5, Lahore', 'Lahore', 150, 'Pool', '042 37177961', 'https://maps.google.com/maps?q=Shapes+Fitness+Centre+DHA+Pool+Lahore'),
  (org_id, '5th Generation Sports Complex Pool', 'Swimming pool', 'Sector Y, DHA Phase 8, Lahore', 'Lahore', 200, 'Pool', '0333 0001333', 'https://maps.google.com/maps?q=5th+Generation+Sports+Complex+Pool+DHA+Phase+8+Lahore'),
  (org_id, 'DHA Sports Complex Pool Phase 6', 'Swimming pool', 'Sector A, DHA Phase 6, Lahore', 'Lahore', 250, 'Pool', '042 111342547', 'https://maps.google.com/maps?q=DHA+Sports+Complex+Pool+Phase+6+Lahore'),
  (org_id, 'Structure Health & Fitness Gulberg Pool', 'Swimming pool', '39-A Zafar Ali Road, Gulberg V, Lahore', 'Lahore', 100, 'Pool', '0322 2295555', 'https://maps.google.com/maps?q=Structure+Health+Fitness+Gulberg+Pool+Lahore'),
  (org_id, 'LDA Sports Complex Minar-e-Pakistan Pool', 'Swimming pool', 'Ravi Park, Main Road, near Minar-e-Pakistan, Lahore', 'Lahore', 200, 'Pool', '0322 8888527', 'https://maps.google.com/maps?q=LDA+Sports+Complex+Minar+e+Pakistan+Pool+Lahore'),
  (org_id, 'Defence Club Phase 1 Pool', 'Swimming pool', 'Defence Club, Sector J, DHA Phase 1, Lahore', 'Lahore', 200, 'Pool', NULL, 'https://maps.google.com/maps?q=Defence+Club+Phase+1+Pool+Lahore')
ON CONFLICT (name) DO NOTHING;

END $$;
