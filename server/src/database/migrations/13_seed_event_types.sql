-- Migration 13: add unique constraint on event_type.name + seed all sport types

ALTER TABLE event_type ADD CONSTRAINT IF NOT EXISTS event_type_name_key UNIQUE (name);

INSERT INTO event_type (name, description) VALUES
  ('Cricket',      'Indoor and outdoor cricket nets and pitches'),
  ('Futsal',       'Indoor 5-a-side football / futsal'),
  ('Football',     'Outdoor and indoor football'),
  ('Padel',        'Padel court sessions'),
  ('Badminton',    'Badminton court bookings'),
  ('Squash',       'Squash court sessions'),
  ('Tennis',       'Tennis court bookings'),
  ('Swimming',     'Swimming pool lap sessions'),
  ('Gym Session',  'General gym and fitness centre access'),
  ('CrossFit',     'CrossFit class or open gym'),
  ('Basketball',   'Basketball court sessions'),
  ('Volleyball',   'Volleyball court sessions'),
  ('Table Tennis', 'Table tennis / ping pong'),
  ('Snooker',      'Snooker and billiards'),
  ('Karting',      'Indoor go-karting'),
  ('Multi-Sport',  'General multi-sport venue access')
ON CONFLICT (name) DO NOTHING;
