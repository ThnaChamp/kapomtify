-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- =============================================
-- 1. subscription_plan (5 rows)
-- =============================================
INSERT INTO subscription_plan (plan_id, plan_name, price, duration_day, description) VALUES
(1, 'Free',        0,   30,  'Free plan with ads'),
(2, 'Student',     59,  30,  'Discounted plan for students'),
(3, 'Premium',     99,  30,  'Full access, no ads'),
(4, 'Family',      159, 30,  'Up to 6 accounts'),
(5, 'Annual',      990, 365, 'Premium plan billed annually');

-- =============================================
-- 2. artist (20 rows)
-- =============================================
INSERT INTO artist (artist_id, artist_name, bio, debut_year, profile_image_url, gender, type, verified_status) VALUES
(1,  'The Weeknd',       'Canadian singer-songwriter',           '2010', 'https://img.example.com/artist/1.jpg',  'Male',   'Solo',    TRUE),
(2,  'Taylor Swift',     'American pop and country artist',      '2006', 'https://img.example.com/artist/2.jpg',  'Female', 'Solo',    TRUE),
(3,  'BTS',              'South Korean boy band',                '2013', 'https://img.example.com/artist/3.jpg',  'Male',   'Group',   TRUE),
(4,  'Billie Eilish',    'American singer and songwriter',       '2015', 'https://img.example.com/artist/4.jpg',  'Female', 'Solo',    TRUE),
(5,  'Ed Sheeran',       'British singer-songwriter',            '2004', 'https://img.example.com/artist/5.jpg',  'Male',   'Solo',    TRUE),
(6,  'Dua Lipa',         'Albanian-British pop singer',         '2015', 'https://img.example.com/artist/6.jpg',  'Female', 'Solo',    TRUE),
(7,  'Drake',            'Canadian rapper and singer',           '2006', 'https://img.example.com/artist/7.jpg',  'Male',   'Solo',    TRUE),
(8,  'Ariana Grande',    'American singer and actress',          '2008', 'https://img.example.com/artist/8.jpg',  'Female', 'Solo',    TRUE),
(9,  'Post Malone',      'American rapper and singer',           '2015', 'https://img.example.com/artist/9.jpg',  'Male',   'Solo',    TRUE),
(10, 'Olivia Rodrigo',   'American singer-songwriter',           '2020', 'https://img.example.com/artist/10.jpg', 'Female', 'Solo',    TRUE),
(11, 'Harry Styles',     'British singer and actor',             '2010', 'https://img.example.com/artist/11.jpg', 'Male',   'Solo',    TRUE),
(12, 'Adele',            'British soul and pop singer',          '2006', 'https://img.example.com/artist/12.jpg', 'Female', 'Solo',    TRUE),
(13, 'Coldplay',         'British rock band',                    '1996', 'https://img.example.com/artist/13.jpg', 'Mixed',  'Group',   TRUE),
(14, 'Justin Bieber',    'Canadian pop singer',                  '2008', 'https://img.example.com/artist/14.jpg', 'Male',   'Solo',    TRUE),
(15, 'Doja Cat',         'American rapper and singer',           '2014', 'https://img.example.com/artist/15.jpg', 'Female', 'Solo',    TRUE),
(16, 'SZA',              'American R&B singer',                  '2012', 'https://img.example.com/artist/16.jpg', 'Female', 'Solo',    TRUE),
(17, 'Kendrick Lamar',   'American rapper',                      '2003', 'https://img.example.com/artist/17.jpg', 'Male',   'Solo',    TRUE),
(18, 'Lana Del Rey',     'American singer-songwriter',           '2005', 'https://img.example.com/artist/18.jpg', 'Female', 'Solo',    TRUE),
(19, 'Bruno Mars',       'American singer and songwriter',       '2004', 'https://img.example.com/artist/19.jpg', 'Male',   'Solo',    TRUE),
(20, 'Charlie Puth',     'American singer and songwriter',       '2015', 'https://img.example.com/artist/20.jpg', 'Male',   'Solo',    FALSE);

-- =============================================
-- 3. album (20 rows)
-- =============================================
INSERT INTO album (album_id, artist_id, album_name, album_type, release_date, cover_image_url, total_music) VALUES
(1,  1,  'After Hours',          'Album',  '2020-03-20', 'https://img.example.com/album/1.jpg',  '14'),
(2,  1,  'Dawn FM',              'Album',  '2022-01-07', 'https://img.example.com/album/2.jpg',  '16'),
(3,  2,  'Midnights',            'Album',  '2022-10-21', 'https://img.example.com/album/3.jpg',  '13'),
(4,  2,  'Lover',                'Album',  '2019-08-23', 'https://img.example.com/album/4.jpg',  '18'),
(5,  3,  'Map of the Soul: 7',   'Album',  '2020-02-21', 'https://img.example.com/album/5.jpg',  '20'),
(6,  4,  'Happier Than Ever',    'Album',  '2021-07-30', 'https://img.example.com/album/6.jpg',  '16'),
(7,  5,  'Divide',               'Album',  '2017-03-03', 'https://img.example.com/album/7.jpg',  '16'),
(8,  6,  'Future Nostalgia',     'Album',  '2020-03-27', 'https://img.example.com/album/8.jpg',  '11'),
(9,  7,  'Certified Lover Boy',  'Album',  '2021-09-03', 'https://img.example.com/album/9.jpg',  '21'),
(10, 8,  'Thank U, Next',        'Album',  '2019-02-08', 'https://img.example.com/album/10.jpg', '12'),
(11, 9,  'Hollywood Bleeding',   'Album',  '2019-09-06', 'https://img.example.com/album/11.jpg', '17'),
(12, 10, 'SOUR',                 'Album',  '2021-05-21', 'https://img.example.com/album/12.jpg', '11'),
(13, 11, 'Harry''s House',       'Album',  '2022-05-20', 'https://img.example.com/album/13.jpg', '13'),
(14, 12, '30',                   'Album',  '2021-11-19', 'https://img.example.com/album/14.jpg', '12'),
(15, 13, 'Music of the Spheres', 'Album',  '2021-10-15', 'https://img.example.com/album/15.jpg', '12'),
(16, 15, 'Planet Her',           'Album',  '2021-06-25', 'https://img.example.com/album/16.jpg', '14'),
(17, 16, 'SOS',                  'Album',  '2022-12-09', 'https://img.example.com/album/17.jpg', '23'),
(18, 17, 'Mr. Morale',           'Album',  '2022-05-13', 'https://img.example.com/album/18.jpg', '18'),
(19, 19, 'An Evening With Silk Sonic', 'Album', '2021-11-05', 'https://img.example.com/album/19.jpg', '9'),
(20, 14, 'Justice',              'Album',  '2021-03-19', 'https://img.example.com/album/20.jpg', '16');

-- =============================================
-- 4. genre (10 rows)
-- =============================================
INSERT INTO genre (genre_id, genre_name, description) VALUES
(1,  'Pop',        'Popular music genre'),
(2,  'R&B',        'Rhythm and Blues'),
(3,  'Hip-Hop',    'Hip-Hop and Rap'),
(4,  'Rock',       'Rock music'),
(5,  'K-Pop',      'Korean pop music'),
(6,  'Electronic', 'Electronic and Dance music'),
(7,  'Soul',       'Soul and Funk music'),
(8,  'Indie',      'Independent music'),
(9,  'Country',    'Country music'),
(10, 'Alternative','Alternative rock and pop');

-- =============================================
-- 5. music (60 rows)
-- =============================================
INSERT INTO music (music_id, album_id, title, release_date, duration, play_count, track_number, file_url, is_explicit) VALUES
-- After Hours (album 1)
(1,  1, 'Blinding Lights',      '2020-03-20', 200, 5000000000, 1, 'https://cdn.example.com/music/1.mp3',  FALSE),
(2,  1, 'Save Your Tears',      '2020-03-20', 215, 2000000000, 2, 'https://cdn.example.com/music/2.mp3',  FALSE),
(3,  1, 'After Hours',          '2020-03-20', 361, 1500000000, 3, 'https://cdn.example.com/music/3.mp3',  TRUE),
-- Dawn FM (album 2)
(4,  2, 'Sacrifice',            '2022-01-07', 190, 800000000,  1, 'https://cdn.example.com/music/4.mp3',  FALSE),
(5,  2, 'Take My Breath',       '2022-01-07', 220, 700000000,  2, 'https://cdn.example.com/music/5.mp3',  FALSE),
-- Midnights (album 3)
(6,  3, 'Anti-Hero',            '2022-10-21', 200, 3000000000, 1, 'https://cdn.example.com/music/6.mp3',  FALSE),
(7,  3, 'Lavender Haze',        '2022-10-21', 202, 1200000000, 2, 'https://cdn.example.com/music/7.mp3',  FALSE),
(8,  3, 'Midnight Rain',        '2022-10-21', 174, 900000000,  3, 'https://cdn.example.com/music/8.mp3',  FALSE),
-- Lover (album 4)
(9,  4, 'Cruel Summer',         '2019-08-23', 178, 2500000000, 1, 'https://cdn.example.com/music/9.mp3',  FALSE),
(10, 4, 'Lover',                '2019-08-23', 221, 1800000000, 2, 'https://cdn.example.com/music/10.mp3', FALSE),
-- Map of the Soul: 7 (album 5)
(11, 5, 'ON',                   '2020-02-21', 236, 1200000000, 1, 'https://cdn.example.com/music/11.mp3', FALSE),
(12, 5, 'Black Swan',           '2020-02-21', 230, 900000000,  2, 'https://cdn.example.com/music/12.mp3', FALSE),
(13, 5, 'Boy With Luv',         '2020-02-21', 229, 2000000000, 3, 'https://cdn.example.com/music/13.mp3', FALSE),
-- Happier Than Ever (album 6)
(14, 6, 'Happier Than Ever',    '2021-07-30', 295, 1100000000, 1, 'https://cdn.example.com/music/14.mp3', FALSE),
(15, 6, 'Therefore I Am',       '2021-07-30', 174, 950000000,  2, 'https://cdn.example.com/music/15.mp3', FALSE),
(16, 6, 'NDA',                  '2021-07-30', 188, 600000000,  3, 'https://cdn.example.com/music/16.mp3', TRUE),
-- Divide (album 7)
(17, 7, 'Shape of You',         '2017-03-03', 234, 4000000000, 1, 'https://cdn.example.com/music/17.mp3', FALSE),
(18, 7, 'Perfect',              '2017-03-03', 263, 2800000000, 2, 'https://cdn.example.com/music/18.mp3', FALSE),
(19, 7, 'Castle on the Hill',   '2017-03-03', 261, 1200000000, 3, 'https://cdn.example.com/music/19.mp3', FALSE),
-- Future Nostalgia (album 8)
(20, 8, 'Levitating',           '2020-03-27', 203, 2200000000, 1, 'https://cdn.example.com/music/20.mp3', FALSE),
(21, 8, 'Don''t Start Now',     '2020-03-27', 183, 1900000000, 2, 'https://cdn.example.com/music/21.mp3', FALSE),
(22, 8, 'Physical',             '2020-03-27', 194, 1100000000, 3, 'https://cdn.example.com/music/22.mp3', FALSE),
-- Certified Lover Boy (album 9)
(23, 9, 'Way 2 Sexy',           '2021-09-03', 228, 700000000,  1, 'https://cdn.example.com/music/23.mp3', TRUE),
(24, 9, 'Girls Want Girls',     '2021-09-03', 213, 600000000,  2, 'https://cdn.example.com/music/24.mp3', TRUE),
-- Thank U, Next (album 10)
(25, 10,'thank u, next',        '2019-02-08', 207, 2100000000, 1, 'https://cdn.example.com/music/25.mp3', FALSE),
(26, 10,'7 rings',              '2019-02-08', 178, 1800000000, 2, 'https://cdn.example.com/music/26.mp3', FALSE),
(27, 10,'break up with your girlfriend', '2019-02-08', 190, 1000000000, 3, 'https://cdn.example.com/music/27.mp3', FALSE),
-- Hollywood Bleeding (album 11)
(28, 11,'Sunflower',            '2019-09-06', 158, 3000000000, 1, 'https://cdn.example.com/music/28.mp3', FALSE),
(29, 11,'Circles',              '2019-09-06', 215, 2500000000, 2, 'https://cdn.example.com/music/29.mp3', FALSE),
(30, 11,'Goodbyes',             '2019-09-06', 175, 900000000,  3, 'https://cdn.example.com/music/30.mp3', TRUE),
-- SOUR (album 12)
(31, 12,'drivers license',      '2021-05-21', 242, 2000000000, 1, 'https://cdn.example.com/music/31.mp3', FALSE),
(32, 12,'deja vu',              '2021-05-21', 215, 1200000000, 2, 'https://cdn.example.com/music/32.mp3', FALSE),
(33, 12,'good 4 u',             '2021-05-21', 178, 1500000000, 3, 'https://cdn.example.com/music/33.mp3', FALSE),
-- Harry's House (album 13)
(34, 13,'As It Was',            '2022-05-20', 167, 3500000000, 1, 'https://cdn.example.com/music/34.mp3', FALSE),
(35, 13,'Late Night Talking',   '2022-05-20', 172, 900000000,  2, 'https://cdn.example.com/music/35.mp3', FALSE),
-- 30 (album 14)
(36, 14,'Easy On Me',           '2021-11-19', 224, 2800000000, 1, 'https://cdn.example.com/music/36.mp3', FALSE),
(37, 14,'Oh My God',            '2021-11-19', 218, 700000000,  2, 'https://cdn.example.com/music/37.mp3', FALSE),
-- Music of the Spheres (album 15)
(38, 15,'My Universe',          '2021-10-15', 228, 1200000000, 1, 'https://cdn.example.com/music/38.mp3', FALSE),
(39, 15,'Higher Power',         '2021-10-15', 218, 800000000,  2, 'https://cdn.example.com/music/39.mp3', FALSE),
-- Planet Her (album 16)
(40, 16,'Kiss Me More',         '2021-06-25', 208, 1400000000, 1, 'https://cdn.example.com/music/40.mp3', FALSE),
(41, 16,'Need to Know',         '2021-06-25', 234, 900000000,  2, 'https://cdn.example.com/music/41.mp3', TRUE),
-- SOS (album 17)
(42, 17,'Kill Bill',            '2022-12-09', 153, 1100000000, 1, 'https://cdn.example.com/music/42.mp3', FALSE),
(43, 17,'Shirt',                '2022-12-09', 208, 700000000,  2, 'https://cdn.example.com/music/43.mp3', FALSE),
-- Mr. Morale (album 18)
(44, 18,'Die Hard',             '2022-05-13', 270, 600000000,  1, 'https://cdn.example.com/music/44.mp3', TRUE),
(45, 18,'N95',                  '2022-05-13', 188, 550000000,  2, 'https://cdn.example.com/music/45.mp3', TRUE),
-- Silk Sonic (album 19)
(46, 19,'Leave the Door Open',  '2021-11-05', 243, 1300000000, 1, 'https://cdn.example.com/music/46.mp3', FALSE),
(47, 19,'Smokin Out the Window','2021-11-05', 215, 800000000,  2, 'https://cdn.example.com/music/47.mp3', FALSE),
-- Justice (album 20)
(48, 20,'Peaches',              '2021-03-19', 198, 1100000000, 1, 'https://cdn.example.com/music/48.mp3', TRUE),
(49, 20,'Stay',                 '2021-03-19', 141, 2000000000, 2, 'https://cdn.example.com/music/49.mp3', FALSE),
(50, 20,'Ghost',                '2021-03-19', 153, 900000000,  3, 'https://cdn.example.com/music/50.mp3', FALSE),
-- Extra standalone singles
(51, 1, 'In Your Eyes',         '2020-04-10', 236, 1100000000, 4, 'https://cdn.example.com/music/51.mp3', FALSE),
(52, 3, 'Bejeweled',            '2022-10-21', 194, 700000000,  4, 'https://cdn.example.com/music/52.mp3', FALSE),
(53, 7, 'Galway Girl',          '2017-03-03', 170, 900000000,  4, 'https://cdn.example.com/music/53.mp3', FALSE),
(54, 8, 'Hallucinate',          '2020-03-27', 204, 600000000,  4, 'https://cdn.example.com/music/54.mp3', FALSE),
(55, 12,'brutal',               '2021-05-21', 142, 800000000,  4, 'https://cdn.example.com/music/55.mp3', TRUE),
(56, 13,'Cinema',               '2022-05-20', 216, 500000000,  3, 'https://cdn.example.com/music/56.mp3', FALSE),
(57, 14,'I Drink Wine',         '2021-11-19', 375, 600000000,  3, 'https://cdn.example.com/music/57.mp3', FALSE),
(58, 15,'Let Somebody Go',      '2021-10-15', 215, 450000000,  3, 'https://cdn.example.com/music/58.mp3', FALSE),
(59, 17,'Seek & Destroy',       '2022-12-09', 205, 400000000,  3, 'https://cdn.example.com/music/59.mp3', FALSE),
(60, 19,'After Last Night',     '2021-11-05', 243, 500000000,  3, 'https://cdn.example.com/music/60.mp3', FALSE);

-- =============================================
-- 6. music_genre (70 rows)
-- =============================================
INSERT INTO music_genre (music_id, genre_id) VALUES
(1,1),(1,6),(2,1),(2,2),(3,1),(3,2),(4,1),(4,6),(5,1),(5,6),
(6,1),(7,1),(8,1),(9,1),(10,1),(10,9),
(11,5),(12,5),(13,5),
(14,1),(15,1),(16,1),(16,10),
(17,1),(18,1),(19,4),(19,10),
(20,1),(20,6),(21,1),(21,6),(22,1),(22,6),
(23,3),(24,3),(25,1),(25,2),(26,1),(26,2),(27,1),
(28,1),(28,3),(29,1),(30,3),
(31,1),(32,1),(33,1),(34,1),(35,1),
(36,1),(36,7),(37,1),(38,1),(38,4),(39,1),
(40,1),(40,2),(41,1),(42,2),(43,2),(44,3),(45,3),
(46,7),(46,2),(47,7),(48,1),(48,3),(49,1),(50,1),
(51,2),(52,1),(53,4),(54,6),(55,4),(56,10),(57,7),(58,1),(59,2),(60,7);

-- =============================================
-- 7. music_artist (junction - some songs have featured artists)
-- =============================================
INSERT INTO music_artist (music_id, artist_id, role) VALUES
(1,  1,  'Main Artist'),
(2,  1,  'Main Artist'),
(3,  1,  'Main Artist'),
(4,  1,  'Main Artist'),
(5,  1,  'Main Artist'),
(6,  2,  'Main Artist'),
(7,  2,  'Main Artist'),
(8,  2,  'Main Artist'),
(9,  2,  'Main Artist'),
(10, 2,  'Main Artist'),
(11, 3,  'Main Artist'),
(12, 3,  'Main Artist'),
(13, 3,  'Main Artist'),
(14, 4,  'Main Artist'),
(15, 4,  'Main Artist'),
(16, 4,  'Main Artist'),
(17, 5,  'Main Artist'),
(18, 5,  'Main Artist'),
(19, 5,  'Main Artist'),
(20, 6,  'Main Artist'),
(21, 6,  'Main Artist'),
(22, 6,  'Main Artist'),
(23, 7,  'Main Artist'),
(24, 7,  'Main Artist'),
(25, 8,  'Main Artist'),
(26, 8,  'Main Artist'),
(27, 8,  'Main Artist'),
(28, 9,  'Main Artist'),
(29, 9,  'Main Artist'),
(30, 9,  'Main Artist'),
(31, 10, 'Main Artist'),
(32, 10, 'Main Artist'),
(33, 10, 'Main Artist'),
(34, 11, 'Main Artist'),
(35, 11, 'Main Artist'),
(36, 12, 'Main Artist'),
(37, 12, 'Main Artist'),
(38, 13, 'Main Artist'),
(38, 3,  'Featured'),
(39, 13, 'Main Artist'),
(40, 15, 'Main Artist'),
(41, 15, 'Main Artist'),
(42, 16, 'Main Artist'),
(43, 16, 'Main Artist'),
(44, 17, 'Main Artist'),
(45, 17, 'Main Artist'),
(46, 19, 'Main Artist'),
(47, 19, 'Main Artist'),
(48, 14, 'Main Artist'),
(48, 9,  'Featured'),
(49, 14, 'Main Artist'),
(50, 14, 'Main Artist'),
(51, 1,  'Main Artist'),
(52, 2,  'Main Artist'),
(53, 5,  'Main Artist'),
(54, 6,  'Main Artist'),
(55, 10, 'Main Artist'),
(56, 11, 'Main Artist'),
(57, 12, 'Main Artist'),
(58, 13, 'Main Artist'),
(59, 16, 'Main Artist'),
(60, 19, 'Main Artist');

-- =============================================
-- 8. user (20 rows)
-- =============================================
INSERT INTO users (user_id, username, email, password_hash, display_name, profile_image_url, gender, created_at) VALUES
(1,  'alice_m',    'alice@example.com',    'hash123456', 'Alice M.',     'https://img.example.com/user/1.jpg',  'Female', '2022-01-10 08:00:00'),
(2,  'bob_k',      'bob@example.com',      'hash234567', 'Bob K.',       'https://img.example.com/user/2.jpg',  'Male',   '2022-02-15 09:30:00'),
(3,  'carol_s',    'carol@example.com',    'hash345678', 'Carol S.',     'https://img.example.com/user/3.jpg',  'Female', '2022-03-20 10:00:00'),
(4,  'dave_t',     'dave@example.com',     'hash456789', 'Dave T.',      'https://img.example.com/user/4.jpg',  'Male',   '2022-04-05 11:00:00'),
(5,  'emma_j',     'emma@example.com',     'hash567890', 'Emma J.',      'https://img.example.com/user/5.jpg',  'Female', '2022-05-18 12:00:00'),
(6,  'frank_l',    'frank@example.com',    'hash678901', 'Frank L.',     'https://img.example.com/user/6.jpg',  'Male',   '2022-06-22 13:00:00'),
(7,  'grace_n',    'grace@example.com',    'hash789012', 'Grace N.',     'https://img.example.com/user/7.jpg',  'Female', '2022-07-30 14:00:00'),
(8,  'henry_w',    'henry@example.com',    'hash890123', 'Henry W.',     'https://img.example.com/user/8.jpg',  'Male',   '2022-08-11 15:00:00'),
(9,  'iris_p',     'iris@example.com',     'hash901234', 'Iris P.',      'https://img.example.com/user/9.jpg',  'Female', '2022-09-03 16:00:00'),
(10, 'jack_r',     'jack@example.com',     'hash112233', 'Jack R.',      'https://img.example.com/user/10.jpg', 'Male',   '2022-10-14 17:00:00'),
(11, 'kate_v',     'kate@example.com',     'hash223344', 'Kate V.',      'https://img.example.com/user/11.jpg', 'Female', '2022-11-01 08:30:00'),
(12, 'liam_b',     'liam@example.com',     'hash334455', 'Liam B.',      'https://img.example.com/user/12.jpg', 'Male',   '2022-12-05 09:00:00'),
(13, 'mia_c',      'mia@example.com',      'hash445566', 'Mia C.',       'https://img.example.com/user/13.jpg', 'Female', '2023-01-10 10:30:00'),
(14, 'noah_d',     'noah@example.com',     'hash556677', 'Noah D.',      'https://img.example.com/user/14.jpg', 'Male',   '2023-02-14 11:00:00'),
(15, 'olivia_e',   'olivia@example.com',   'hash667788', 'Olivia E.',    'https://img.example.com/user/15.jpg', 'Female', '2023-03-20 12:30:00'),
(16, 'peter_f',    'peter@example.com',    'hash778899', 'Peter F.',     'https://img.example.com/user/16.jpg', 'Male',   '2023-04-25 13:00:00'),
(17, 'quinn_g',    'quinn@example.com',    'hash889900', 'Quinn G.',     'https://img.example.com/user/17.jpg', 'Non-binary', '2023-05-30 14:30:00'),
(18, 'rose_h',     'rose@example.com',     'hash990011', 'Rose H.',      'https://img.example.com/user/18.jpg', 'Female', '2023-06-15 15:00:00'),
(19, 'sam_i',      'sam@example.com',      'hash101112', 'Sam I.',       'https://img.example.com/user/19.jpg', 'Male',   '2023-07-20 16:30:00'),
(20, 'tina_j',     'tina@example.com',     'hash121314', 'Tina J.',      'https://img.example.com/user/20.jpg', 'Female', '2023-08-25 17:00:00');

-- =============================================
-- 9. transaction (20 rows)
-- =============================================
INSERT INTO transactions (transaction_id, user_id, transaction_date, total_amount, status, currency, payment_method) VALUES
(1,  1,  '2023-01-15 10:00:00', 99,  'completed', 'THB', 'credit_card'),
(2,  2,  '2023-02-10 11:00:00', 99,  'completed', 'THB', 'credit_card'),
(3,  3,  '2023-01-20 12:00:00', 990, 'completed', 'USD', 'paypal'),
(4,  4,  '2023-03-05 13:00:00', 99,  'completed', 'GBP', 'credit_card'),
(5,  5,  '2023-02-28 14:00:00', 59,  'completed', 'JPY', 'credit_card'),
(6,  6,  '2023-04-01 09:00:00', 159, 'completed', 'THB', 'promptpay'),
(7,  7,  '2023-03-15 10:30:00', 99,  'completed', 'KRW', 'credit_card'),
(8,  8,  '2023-05-10 11:30:00', 990, 'completed', 'USD', 'credit_card'),
(9,  9,  '2023-04-20 12:30:00', 99,  'completed', 'THB', 'promptpay'),
(10, 10, '2023-06-15 13:30:00', 99,  'completed', 'AUD', 'credit_card'),
(11, 11, '2023-05-25 14:30:00', 59,  'completed', 'THB', 'credit_card'),
(12, 12, '2023-07-10 09:30:00', 99,  'completed', 'GBP', 'debit_card'),
(13, 13, '2023-06-20 10:30:00', 990, 'completed', 'USD', 'paypal'),
(14, 14, '2023-08-05 11:30:00', 99,  'completed', 'THB', 'credit_card'),
(15, 15, '2023-07-15 12:30:00', 99,  'completed', 'SGD', 'credit_card'),
(16, 16, '2023-09-01 13:30:00', 159, 'completed', 'THB', 'promptpay'),
(17, 17, '2023-08-20 14:30:00', 990, 'completed', 'CAD', 'credit_card'),
(18, 18, '2023-10-10 09:00:00', 99,  'completed', 'THB', 'credit_card'),
(19, 19, '2023-09-25 10:00:00', 59,  'completed', 'USD', 'paypal'),
(20, 20, '2023-11-05 11:00:00', 99,  'completed', 'JPY', 'credit_card');

-- =============================================
-- 10. transaction_detail (20 rows)
-- =============================================
INSERT INTO transaction_detail (transaction_id, detail_id, description, unit_price, quantity, period_covered) VALUES
(1,  1, 'Premium Plan - Monthly',  99,  1, '2023-02-15'),
(2,  1, 'Premium Plan - Monthly',  99,  1, '2023-03-10'),
(3,  1, 'Annual Plan',             990, 1, '2024-01-20'),
(4,  1, 'Premium Plan - Monthly',  99,  1, '2023-04-05'),
(5,  1, 'Student Plan - Monthly',  59,  1, '2023-03-28'),
(6,  1, 'Family Plan - Monthly',   159, 1, '2023-05-01'),
(7,  1, 'Premium Plan - Monthly',  99,  1, '2023-04-15'),
(8,  1, 'Annual Plan',             990, 1, '2024-05-10'),
(9,  1, 'Premium Plan - Monthly',  99,  1, '2023-05-20'),
(10, 1, 'Premium Plan - Monthly',  99,  1, '2023-07-15'),
(11, 1, 'Student Plan - Monthly',  59,  1, '2023-06-25'),
(12, 1, 'Premium Plan - Monthly',  99,  1, '2023-08-10'),
(13, 1, 'Annual Plan',             990, 1, '2024-06-20'),
(14, 1, 'Premium Plan - Monthly',  99,  1, '2023-09-05'),
(15, 1, 'Premium Plan - Monthly',  99,  1, '2023-08-15'),
(16, 1, 'Family Plan - Monthly',   159, 1, '2023-10-01'),
(17, 1, 'Annual Plan',             990, 1, '2024-08-20'),
(18, 1, 'Premium Plan - Monthly',  99,  1, '2023-11-10'),
(19, 1, 'Student Plan - Monthly',  59,  1, '2023-10-25'),
(20, 1, 'Premium Plan - Monthly',  99,  1, '2023-12-05');

-- =============================================
-- 11. user_subscription (20 rows)
-- =============================================
INSERT INTO user_subscription (user_id, subscription_id, plan_id, transaction_id, start_date, end_date, status) VALUES
(1,  1, 3, 1,  '2023-01-15', '2023-02-15', 'active'),
(2,  1, 3, 2,  '2023-02-10', '2023-03-10', 'active'),
(3,  1, 5, 3,  '2023-01-20', '2024-01-20', 'active'),
(4,  1, 3, 4,  '2023-03-05', '2023-04-05', 'active'),
(5,  1, 2, 5,  '2023-02-28', '2023-03-28', 'active'),
(6,  1, 4, 6,  '2023-04-01', '2023-05-01', 'active'),
(7,  1, 3, 7,  '2023-03-15', '2023-04-15', 'active'),
(8,  1, 5, 8,  '2023-05-10', '2024-05-10', 'active'),
(9,  1, 3, 9,  '2023-04-20', '2023-05-20', 'active'),
(10, 1, 3, 10, '2023-06-15', '2023-07-15', 'active'),
(11, 1, 2, 11, '2023-05-25', '2023-06-25', 'active'),
(12, 1, 3, 12, '2023-07-10', '2023-08-10', 'active'),
(13, 1, 5, 13, '2023-06-20', '2024-06-20', 'active'),
(14, 1, 3, 14, '2023-08-05', '2023-09-05', 'active'),
(15, 1, 3, 15, '2023-07-15', '2023-08-15', 'active'),
(16, 1, 4, 16, '2023-09-01', '2023-10-01', 'active'),
(17, 1, 5, 17, '2023-08-20', '2024-08-20', 'active'),
(18, 1, 3, 18, '2023-10-10', '2023-11-10', 'active'),
(19, 1, 2, 19, '2023-09-25', '2023-10-25', 'active'),
(20, 1, 3, 20, '2023-11-05', '2023-12-05', 'active');

-- =============================================
-- 12. library (20 rows)
-- =============================================
INSERT INTO librarys (user_id, total_albums, total_artists, total_playlists, updated_at) VALUES
(1,  5, 8,  3, '2023-12-01 10:00:00'),
(2,  3, 5,  2, '2023-12-02 10:00:00'),
(3,  8, 12, 5, '2023-12-03 10:00:00'),
(4,  4, 6,  2, '2023-12-04 10:00:00'),
(5,  6, 9,  4, '2023-12-05 10:00:00'),
(6,  2, 4,  1, '2023-12-06 10:00:00'),
(7,  7, 10, 3, '2023-12-07 10:00:00'),
(8,  9, 14, 6, '2023-12-08 10:00:00'),
(9,  3, 5,  2, '2023-12-09 10:00:00'),
(10, 5, 7,  3, '2023-12-10 10:00:00'),
(11, 4, 6,  2, '2023-12-11 10:00:00'),
(12, 6, 8,  4, '2023-12-12 10:00:00'),
(13, 10,15, 7, '2023-12-13 10:00:00'),
(14, 2, 3,  1, '2023-12-14 10:00:00'),
(15, 5, 7,  3, '2023-12-15 10:00:00'),
(16, 3, 5,  2, '2023-12-16 10:00:00'),
(17, 8, 11, 5, '2023-12-17 10:00:00'),
(18, 4, 6,  2, '2023-12-18 10:00:00'),
(19, 6, 9,  4, '2023-12-19 10:00:00'),
(20, 3, 5,  2, '2023-12-20 10:00:00');

-- =============================================
-- 13. library_albums (30 rows)
-- =============================================
INSERT INTO library_albums (album_id, user_id, added_at) VALUES
(1,  1,  '2023-06-01 10:00:00'),
(3,  1,  '2023-07-15 11:00:00'),
(8,  1,  '2023-08-20 12:00:00'),
(2,  2,  '2023-05-10 10:00:00'),
(6,  2,  '2023-09-05 11:00:00'),
(1,  3,  '2023-04-15 10:00:00'),
(4,  3,  '2023-06-20 11:00:00'),
(7,  3,  '2023-07-25 12:00:00'),
(12, 3,  '2023-08-30 13:00:00'),
(5,  4,  '2023-05-15 10:00:00'),
(15, 4,  '2023-09-10 11:00:00'),
(8,  5,  '2023-06-25 10:00:00'),
(13, 5,  '2023-07-30 11:00:00'),
(3,  6,  '2023-08-05 10:00:00'),
(5,  7,  '2023-05-20 10:00:00'),
(9,  7,  '2023-06-25 11:00:00'),
(16, 7,  '2023-09-15 12:00:00'),
(1,  8,  '2023-04-20 10:00:00'),
(6,  8,  '2023-07-05 11:00:00'),
(14, 8,  '2023-09-20 12:00:00'),
(11, 9,  '2023-06-10 10:00:00'),
(3,  10, '2023-07-15 10:00:00'),
(8,  10, '2023-08-20 11:00:00'),
(17, 11, '2023-09-25 10:00:00'),
(4,  12, '2023-05-30 10:00:00'),
(12, 12, '2023-07-10 11:00:00'),
(19, 13, '2023-08-15 10:00:00'),
(2,  14, '2023-09-20 10:00:00'),
(10, 15, '2023-06-05 10:00:00'),
(18, 16, '2023-10-01 10:00:00');

-- =============================================
-- 14. library_artist (30 rows)
-- =============================================
INSERT INTO library_artist (artist_id, user_id, followed_at) VALUES
(1,  1,  '2023-05-01 10:00:00'),
(2,  1,  '2023-06-10 11:00:00'),
(6,  1,  '2023-07-15 12:00:00'),
(1,  2,  '2023-04-20 10:00:00'),
(4,  2,  '2023-08-05 11:00:00'),
(1,  3,  '2023-03-15 10:00:00'),
(2,  3,  '2023-05-20 11:00:00'),
(5,  3,  '2023-07-25 12:00:00'),
(12, 3,  '2023-09-01 13:00:00'),
(3,  4,  '2023-04-10 10:00:00'),
(13, 4,  '2023-08-15 11:00:00'),
(6,  5,  '2023-05-25 10:00:00'),
(11, 5,  '2023-07-10 11:00:00'),
(2,  6,  '2023-06-30 10:00:00'),
(3,  7,  '2023-04-05 10:00:00'),
(7,  7,  '2023-06-10 11:00:00'),
(15, 7,  '2023-08-20 12:00:00'),
(1,  8,  '2023-03-20 10:00:00'),
(4,  8,  '2023-06-15 11:00:00'),
(12, 8,  '2023-09-01 12:00:00'),
(9,  9,  '2023-05-10 10:00:00'),
(2,  10, '2023-06-15 10:00:00'),
(6,  10, '2023-08-25 11:00:00'),
(16, 11, '2023-09-30 10:00:00'),
(2,  12, '2023-05-05 10:00:00'),
(10, 12, '2023-07-20 11:00:00'),
(19, 13, '2023-07-25 10:00:00'),
(1,  14, '2023-08-30 10:00:00'),
(8,  15, '2023-05-15 10:00:00'),
(17, 16, '2023-10-05 10:00:00');

-- =============================================
-- 15. playlist (20 rows)
-- =============================================
INSERT INTO playlist (playlist_id, user_id, name, description, is_public, date, update_date, create_at, cover_image_url) VALUES
(1,  1,  'Morning Vibes',       'Songs to start the day',        TRUE,  '2023-03-01 08:00:00', '2023-11-01 08:00:00', '2023-03-01 08:00:00', 'https://img.example.com/pl/1.jpg'),
(2,  1,  'Late Night Feels',    'Chill night playlist',          FALSE, '2023-04-15 22:00:00', '2023-10-15 22:00:00', '2023-04-15 22:00:00', 'https://img.example.com/pl/2.jpg'),
(3,  2,  'Workout Mix',         'High energy workout songs',     TRUE,  '2023-05-10 06:00:00', '2023-11-10 06:00:00', '2023-05-10 06:00:00', 'https://img.example.com/pl/3.jpg'),
(4,  3,  'K-Pop Favorites',     'Best K-Pop tracks',             TRUE,  '2023-02-20 12:00:00', '2023-10-20 12:00:00', '2023-02-20 12:00:00', 'https://img.example.com/pl/4.jpg'),
(5,  3,  'R&B Classics',        'Timeless R&B tracks',           TRUE,  '2023-03-25 14:00:00', '2023-11-25 14:00:00', '2023-03-25 14:00:00', 'https://img.example.com/pl/5.jpg'),
(6,  4,  'Road Trip',           'Music for the open road',       TRUE,  '2023-06-05 10:00:00', '2023-12-05 10:00:00', '2023-06-05 10:00:00', 'https://img.example.com/pl/6.jpg'),
(7,  5,  'Study Session',       'Focus music',                   FALSE, '2023-04-01 09:00:00', '2023-11-01 09:00:00', '2023-04-01 09:00:00', 'https://img.example.com/pl/7.jpg'),
(8,  6,  'Pop Hits 2023',       'Top pop songs of 2023',         TRUE,  '2023-01-15 11:00:00', '2023-12-01 11:00:00', '2023-01-15 11:00:00', 'https://img.example.com/pl/8.jpg'),
(9,  7,  'Hip-Hop Essentials',  'Must-have hip-hop tracks',      TRUE,  '2023-05-20 13:00:00', '2023-11-20 13:00:00', '2023-05-20 13:00:00', 'https://img.example.com/pl/9.jpg'),
(10, 8,  'Throwbacks',          'Nostalgic hits',                FALSE, '2023-07-10 15:00:00', '2023-12-10 15:00:00', '2023-07-10 15:00:00', 'https://img.example.com/pl/10.jpg'),
(11, 9,  'Rainy Day',           'Moody songs for rainy days',    TRUE,  '2023-06-15 16:00:00', '2023-11-15 16:00:00', '2023-06-15 16:00:00', 'https://img.example.com/pl/11.jpg'),
(12, 10, 'Party Playlist',      'Bangers for parties',           TRUE,  '2023-08-20 20:00:00', '2023-12-20 20:00:00', '2023-08-20 20:00:00', 'https://img.example.com/pl/12.jpg'),
(13, 11, 'Indie Gems',          'Hidden indie tracks',           FALSE, '2023-07-25 10:00:00', '2023-12-25 10:00:00', '2023-07-25 10:00:00', 'https://img.example.com/pl/13.jpg'),
(14, 12, 'Soul & Funk',         'Groovy soul and funk',          TRUE,  '2023-09-01 11:00:00', '2023-12-01 11:00:00', '2023-09-01 11:00:00', 'https://img.example.com/pl/14.jpg'),
(15, 13, 'Electronic Mix',      'Best electronic tracks',        TRUE,  '2023-08-05 12:00:00', '2023-12-05 12:00:00', '2023-08-05 12:00:00', 'https://img.example.com/pl/15.jpg'),
(16, 14, 'My Favorites',        'Personal all-time favorites',   FALSE, '2023-05-10 13:00:00', '2023-11-10 13:00:00', '2023-05-10 13:00:00', 'https://img.example.com/pl/16.jpg'),
(17, 15, 'Chill Out',           'Relax and unwind',              TRUE,  '2023-09-15 14:00:00', '2023-12-15 14:00:00', '2023-09-15 14:00:00', 'https://img.example.com/pl/17.jpg'),
(18, 16, 'Thai Hits',           'Popular Thai songs mix',        TRUE,  '2023-10-01 09:00:00', '2023-12-01 09:00:00', '2023-10-01 09:00:00', 'https://img.example.com/pl/18.jpg'),
(19, 17, 'Global Hits',         'Songs from around the world',   TRUE,  '2023-11-01 10:00:00', '2023-12-15 10:00:00', '2023-11-01 10:00:00', 'https://img.example.com/pl/19.jpg'),
(20, 18, 'Acoustic Sessions',   'Acoustic and unplugged tracks', FALSE, '2023-10-15 11:00:00', '2023-12-15 11:00:00', '2023-10-15 11:00:00', 'https://img.example.com/pl/20.jpg');

-- =============================================
-- 16. library_playlist (20 rows)
-- =============================================
INSERT INTO library_playlist (playlist_id, user_id, saved_at, is_owner) VALUES
(1,  1,  '2023-03-01 08:00:00', TRUE),
(2,  1,  '2023-04-15 22:00:00', TRUE),
(3,  2,  '2023-05-10 06:00:00', TRUE),
(4,  3,  '2023-02-20 12:00:00', TRUE),
(5,  3,  '2023-03-25 14:00:00', TRUE),
(6,  4,  '2023-06-05 10:00:00', TRUE),
(4,  5,  '2023-07-01 10:00:00', FALSE),
(8,  6,  '2023-01-15 11:00:00', TRUE),
(9,  7,  '2023-05-20 13:00:00', TRUE),
(3,  8,  '2023-09-01 12:00:00', FALSE),
(11, 9,  '2023-06-15 16:00:00', TRUE),
(12, 10, '2023-08-20 20:00:00', TRUE),
(8,  11, '2023-10-01 10:00:00', FALSE),
(14, 12, '2023-09-01 11:00:00', TRUE),
(15, 13, '2023-08-05 12:00:00', TRUE),
(16, 14, '2023-05-10 13:00:00', TRUE),
(17, 15, '2023-09-15 14:00:00', TRUE),
(1,  16, '2023-11-01 09:00:00', FALSE),
(19, 17, '2023-11-01 10:00:00', TRUE),
(20, 18, '2023-10-15 11:00:00', TRUE);

-- =============================================
-- 17. playlist_items (60 rows)
-- =============================================
INSERT INTO playlist_items (playlist_id, sequence_no, music_id, added_at) VALUES
-- Morning Vibes (pl 1)
(1, 1, 1,  '2023-03-01 08:00:00'),
(1, 2, 6,  '2023-03-01 08:01:00'),
(1, 3, 34, '2023-03-01 08:02:00'),
(1, 4, 20, '2023-03-01 08:03:00'),
(1, 5, 17, '2023-03-01 08:04:00'),
-- Late Night Feels (pl 2)
(2, 1, 3,  '2023-04-15 22:00:00'),
(2, 2, 36, '2023-04-15 22:01:00'),
(2, 3, 7,  '2023-04-15 22:02:00'),
(2, 4, 31, '2023-04-15 22:03:00'),
-- Workout Mix (pl 3)
(3, 1, 1,  '2023-05-10 06:00:00'),
(3, 2, 9,  '2023-05-10 06:01:00'),
(3, 3, 22, '2023-05-10 06:02:00'),
(3, 4, 33, '2023-05-10 06:03:00'),
(3, 5, 15, '2023-05-10 06:04:00'),
-- K-Pop Favorites (pl 4)
(4, 1, 11, '2023-02-20 12:00:00'),
(4, 2, 12, '2023-02-20 12:01:00'),
(4, 3, 13, '2023-02-20 12:02:00'),
(4, 4, 38, '2023-02-20 12:03:00'),
-- R&B Classics (pl 5)
(5, 1, 2,  '2023-03-25 14:00:00'),
(5, 2, 25, '2023-03-25 14:01:00'),
(5, 3, 42, '2023-03-25 14:02:00'),
(5, 4, 46, '2023-03-25 14:03:00'),
-- Road Trip (pl 6)
(6, 1, 17, '2023-06-05 10:00:00'),
(6, 2, 19, '2023-06-05 10:01:00'),
(6, 3, 28, '2023-06-05 10:02:00'),
(6, 4, 53, '2023-06-05 10:03:00'),
-- Study Session (pl 7)
(7, 1, 7,  '2023-04-01 09:00:00'),
(7, 2, 18, '2023-04-01 09:01:00'),
(7, 3, 39, '2023-04-01 09:02:00'),
-- Pop Hits 2023 (pl 8)
(8, 1, 6,  '2023-01-15 11:00:00'),
(8, 2, 34, '2023-01-15 11:01:00'),
(8, 3, 1,  '2023-01-15 11:02:00'),
(8, 4, 20, '2023-01-15 11:03:00'),
(8, 5, 36, '2023-01-15 11:04:00'),
-- Hip-Hop Essentials (pl 9)
(9, 1, 23, '2023-05-20 13:00:00'),
(9, 2, 24, '2023-05-20 13:01:00'),
(9, 3, 44, '2023-05-20 13:02:00'),
(9, 4, 45, '2023-05-20 13:03:00'),
-- Throwbacks (pl 10)
(10,1, 17, '2023-07-10 15:00:00'),
(10,2, 18, '2023-07-10 15:01:00'),
(10,3, 25, '2023-07-10 15:02:00'),
-- Rainy Day (pl 11)
(11,1, 3,  '2023-06-15 16:00:00'),
(11,2, 36, '2023-06-15 16:01:00'),
(11,3, 57, '2023-06-15 16:02:00'),
-- Party Playlist (pl 12)
(12,1, 21, '2023-08-20 20:00:00'),
(12,2, 26, '2023-08-20 20:01:00'),
(12,3, 40, '2023-08-20 20:02:00'),
(12,4, 48, '2023-08-20 20:03:00'),
-- Indie Gems (pl 13)
(13,1, 55, '2023-07-25 10:00:00'),
(13,2, 56, '2023-07-25 10:01:00'),
-- Soul & Funk (pl 14)
(14,1, 46, '2023-09-01 11:00:00'),
(14,2, 47, '2023-09-01 11:01:00'),
(14,3, 60, '2023-09-01 11:02:00'),
-- Electronic Mix (pl 15)
(15,1, 4,  '2023-08-05 12:00:00'),
(15,2, 5,  '2023-08-05 12:01:00'),
(15,3, 54, '2023-08-05 12:02:00'),
-- My Favorites (pl 16)
(16,1, 1,  '2023-05-10 13:00:00'),
(16,2, 9,  '2023-05-10 13:01:00'),
(16,3, 34, '2023-05-10 13:02:00');

-- =============================================
-- 18. listen_history (60 rows)
-- =============================================
INSERT INTO listen_history (user_id, music_id, played_at, duration_played) VALUES
(1,  1,  '2023-10-01', 200),(1,  6,  '2023-10-01', 200),(1,  17, '2023-10-02', 234),
(1,  34, '2023-10-03', 167),(1,  3,  '2023-10-04', 361),(2,  11, '2023-10-01', 236),
(2,  12, '2023-10-02', 230),(2,  13, '2023-10-03', 229),(2,  1,  '2023-10-04', 200),
(3,  25, '2023-10-01', 207),(3,  26, '2023-10-02', 178),(3,  36, '2023-10-03', 224),
(4,  17, '2023-10-01', 234),(4,  18, '2023-10-02', 263),(4,  19, '2023-10-03', 261),
(5,  20, '2023-10-01', 203),(5,  21, '2023-10-02', 183),(5,  6,  '2023-10-03', 200),
(6,  9,  '2023-10-01', 178),(6,  10, '2023-10-02', 221),(6,  1,  '2023-10-03', 200),
(7,  23, '2023-10-01', 228),(7,  24, '2023-10-02', 213),(7,  44, '2023-10-03', 270),
(8,  28, '2023-10-01', 158),(8,  29, '2023-10-02', 215),(8,  34, '2023-10-03', 167),
(9,  14, '2023-10-01', 295),(9,  15, '2023-10-02', 174),(9,  36, '2023-10-03', 224),
(10, 40, '2023-10-01', 208),(10, 41, '2023-10-02', 234),(10, 6,  '2023-10-03', 200),
(11, 42, '2023-10-01', 153),(11, 43, '2023-10-02', 208),(11, 17, '2023-10-03', 234),
(12, 46, '2023-10-01', 243),(12, 47, '2023-10-02', 215),(12, 60, '2023-10-03', 243),
(13, 4,  '2023-10-01', 190),(13, 5,  '2023-10-02', 220),(13, 20, '2023-10-03', 203),
(14, 48, '2023-10-01', 198),(14, 49, '2023-10-02', 141),(14, 50, '2023-10-03', 153),
(15, 31, '2023-10-01', 242),(15, 32, '2023-10-02', 215),(15, 33, '2023-10-03', 178),
(16, 38, '2023-10-01', 228),(16, 39, '2023-10-02', 218),(16, 11, '2023-10-03', 236),
(17, 44, '2023-10-01', 270),(17, 45, '2023-10-02', 188),(17, 23, '2023-10-03', 228),
(18, 34, '2023-10-01', 167),(18, 35, '2023-10-02', 172),(18, 36, '2023-10-03', 224),
(19, 1,  '2023-10-01', 200),(19, 6,  '2023-10-02', 200),(20, 9,  '2023-10-01', 178);


-- =============================================
-- 19. user_activity_log (40 rows)
-- =============================================
INSERT INTO user_activity_log (activity_id, user_id, music_id, action_type, field) VALUES
(1,  1,  1,  'play',     1),(2,  1,  6,  'play',     1),(3,  1,  17, 'like',     1),
(4,  1,  34, 'play',     1),(5,  2,  11, 'play',     1),(6,  2,  13, 'like',     1),
(7,  2,  1,  'share',    1),(8,  3,  25, 'play',     1),(9,  3,  36, 'like',     1),
(10, 4,  17, 'play',     1),(11, 4,  18, 'play',     1),(12, 4,  6,  'like',     1),
(13, 5,  20, 'play',     1),(14, 5,  21, 'like',     1),(15, 6,  9,  'play',     1),
(16, 6,  10, 'skip',     1),(17, 7,  23, 'play',     1),(18, 7,  44, 'like',     1),
(19, 8,  28, 'play',     1),(20, 8,  34, 'like',     1),(21, 9,  14, 'play',     1),
(22, 9,  36, 'like',     1),(23, 10, 40, 'play',     1),(24, 10, 6,  'share',    1),
(25, 11, 42, 'play',     1),(26, 11, 17, 'like',     1),(27, 12, 46, 'play',     1),
(28, 12, 60, 'like',     1),(29, 13, 4,  'play',     1),(30, 13, 20, 'skip',     1),
(31, 14, 48, 'play',     1),(32, 14, 49, 'like',     1),(33, 15, 31, 'play',     1),
(34, 15, 33, 'like',     1),(35, 16, 38, 'play',     1),(36, 16, 11, 'share',    1),
(37, 17, 44, 'play',     1),(38, 17, 23, 'like',     1),(39, 18, 34, 'play',     1),
(40, 19, 1,  'play',     1);

-- =============================================
-- 20. recommend (30 rows)
-- =============================================
INSERT INTO recommend (user_id, music_id, score, reason, generate_at) VALUES
(1,  20, 0.95, 'Based on listening history',   '2023-12-01 08:00:00'),
(1,  28, 0.90, 'Popular in your genre',         '2023-12-01 08:00:00'),
(1,  36, 0.88, 'Trending this week',            '2023-12-01 08:00:00'),
(2,  1,  0.92, 'Based on listening history',   '2023-12-01 08:00:00'),
(2,  6,  0.89, 'Popular in your genre',         '2023-12-01 08:00:00'),
(3,  11, 0.95, 'Based on your K-Pop interest', '2023-12-01 08:00:00'),
(3,  38, 0.91, 'Fans also like',                '2023-12-01 08:00:00'),
(4,  20, 0.87, 'Based on listening history',   '2023-12-01 08:00:00'),
(4,  21, 0.85, 'Popular in your genre',         '2023-12-01 08:00:00'),
(5,  1,  0.93, 'Trending this week',            '2023-12-01 08:00:00'),
(5,  9,  0.90, 'Based on listening history',   '2023-12-01 08:00:00'),
(6,  6,  0.88, 'Based on listening history',   '2023-12-01 08:00:00'),
(6,  34, 0.85, 'Popular this month',            '2023-12-01 08:00:00'),
(7,  44, 0.94, 'Based on listening history',   '2023-12-01 08:00:00'),
(7,  45, 0.91, 'Fans also like',                '2023-12-01 08:00:00'),
(8,  36, 0.89, 'Based on listening history',   '2023-12-01 08:00:00'),
(8,  57, 0.86, 'Popular in your genre',         '2023-12-01 08:00:00'),
(9,  3,  0.92, 'Based on listening history',   '2023-12-01 08:00:00'),
(9,  7,  0.88, 'Popular this month',            '2023-12-01 08:00:00'),
(10, 42, 0.91, 'Based on listening history',   '2023-12-01 08:00:00'),
(10, 43, 0.87, 'Fans also like',                '2023-12-01 08:00:00'),
(11, 59, 0.90, 'Based on listening history',   '2023-12-01 08:00:00'),
(12, 46, 0.93, 'Based on listening history',   '2023-12-01 08:00:00'),
(13, 5,  0.88, 'Based on listening history',   '2023-12-01 08:00:00'),
(14, 51, 0.86, 'Popular this week',             '2023-12-01 08:00:00'),
(15, 32, 0.89, 'Based on listening history',   '2023-12-01 08:00:00'),
(16, 12, 0.92, 'Based on your K-Pop interest', '2023-12-01 08:00:00'),
(17, 45, 0.94, 'Based on listening history',   '2023-12-01 08:00:00'),
(18, 35, 0.87, 'Based on listening history',   '2023-12-01 08:00:00'),
(19, 17, 0.90, 'Trending this week',            '2023-12-01 08:00:00');

-- =============================================
-- 21. reviews (30 rows)
-- =============================================
INSERT INTO reviews (review_id, user_id, music_id, rating, comment, create_at) VALUES
(1,  1,  1,  5, 'Absolute classic, never gets old!',       '2023-10-05 10:00:00'),
(2,  1,  6,  4, 'Great song, very catchy.',                '2023-10-06 11:00:00'),
(3,  2,  11, 5, 'BTS never disappoints!',                  '2023-10-07 12:00:00'),
(4,  2,  13, 5, 'Boy With Luv is pure joy.',               '2023-10-08 13:00:00'),
(5,  3,  25, 4, 'Ariana is phenomenal.',                   '2023-10-09 14:00:00'),
(6,  3,  36, 5, 'Easy On Me made me cry, masterpiece.',    '2023-10-10 15:00:00'),
(7,  4,  17, 5, 'Shape of You is timeless.',               '2023-10-11 16:00:00'),
(8,  4,  18, 4, 'Perfect is truly perfect.',               '2023-10-12 17:00:00'),
(9,  5,  20, 4, 'Levitating is so fun!',                   '2023-10-13 10:00:00'),
(10, 5,  21, 5, 'Don t Start Now is a bop.',               '2023-10-14 11:00:00'),
(11, 6,  9,  5, 'Cruel Summer deserved to be a hit.',      '2023-10-15 12:00:00'),
(12, 7,  23, 4, 'Way 2 Sexy is hype.',                     '2023-10-16 13:00:00'),
(13, 8,  28, 5, 'Sunflower is one of the best ever.',      '2023-10-17 14:00:00'),
(14, 8,  34, 5, 'As It Was stayed on repeat.',             '2023-10-18 15:00:00'),
(15, 9,  14, 4, 'Happier Than Ever really speaks to me.',  '2023-10-19 16:00:00'),
(16, 10, 40, 4, 'Kiss Me More is smooth and catchy.',      '2023-10-20 17:00:00'),
(17, 11, 42, 5, 'Kill Bill hits different.',               '2023-10-21 10:00:00'),
(18, 12, 46, 5, 'Leave the Door Open is so soulful.',      '2023-10-22 11:00:00'),
(19, 13, 4,  4, 'Sacrifice has great production.',         '2023-10-23 12:00:00'),
(20, 14, 48, 3, 'Peaches is decent but not my fave.',      '2023-10-24 13:00:00'),
(21, 15, 31, 5, 'Drivers license gave me chills.',         '2023-10-25 14:00:00'),
(22, 16, 38, 5, 'My Universe collab was unexpected.',      '2023-10-26 15:00:00'),
(23, 17, 44, 4, 'Die Hard is lyrical genius.',             '2023-10-27 16:00:00'),
(24, 18, 34, 5, 'As It Was is my song of the year.',       '2023-10-28 17:00:00'),
(25, 19, 1,  5, 'Blinding Lights will live forever.',      '2023-10-29 10:00:00'),
(26, 20, 9,  4, 'Cruel Summer is a good tune.',            '2023-10-30 11:00:00'),
(27, 1,  34, 5, 'Harry Styles is so talented.',            '2023-11-01 10:00:00'),
(28, 2,  36, 5, 'Adele is the GOAT.',                      '2023-11-02 11:00:00'),
(29, 3,  17, 4, 'Ed never misses.',                        '2023-11-03 12:00:00'),
(30, 4,  29, 4, 'Circles is so good for chill days.',      '2023-11-04 13:00:00');

-- =============================================
-- 22. chart (5 rows)
-- =============================================
INSERT INTO chart (chart_id, chart_name, description, chart_date) VALUES
(1, 'Global Top 50',     'Top 50 tracks worldwide',          '2023-12-01'),
(2, 'Thailand Top 20',   'Top 20 tracks in Thailand',        '2023-12-01'),
(3, 'US Billboard Hot',  'Billboard Hot 100 chart',          '2023-12-01'),
(4, 'K-Pop Top 30',      'Top 30 K-Pop tracks globally',     '2023-12-01'),
(5, 'Viral Hits',        'Most viral songs this week',       '2023-12-01');

-- =============================================
-- 23. music_chart (30 rows)
-- =============================================
INSERT INTO music_chart (chart_id, music_id, last_rank, peak_rank) VALUES
-- Global Top 50 (chart 1)
(1, 1,  1,  1),(1, 34, 2,  1),(1, 6,  3,  2),(1, 17, 4,  3),(1, 28, 5,  4),
(1, 9,  6,  5),(1, 36, 7,  6),(1, 20, 8,  7),(1, 31, 9,  8),(1, 25, 10, 9),
-- Thailand Top 20 (chart 2)
(2, 1,  1,  1),(2, 6,  2,  1),(2, 34, 3,  2),(2, 9,  4,  3),(2, 17, 5,  4),
-- US Billboard (chart 3)
(3, 1,  1,  1),(3, 17, 2,  1),(3, 6,  3,  2),(3, 25, 4,  3),(3, 28, 5,  4),
-- K-Pop Top 30 (chart 4)
(4, 11, 1,  1),(4, 12, 2,  2),(4, 13, 3,  1),(4, 38, 4,  3),
-- Viral Hits (chart 5)
(5, 34, 1,  1),(5, 1,  2,  1),(5, 6,  3,  2),(5, 49, 4,  3),(5, 55, 5,  4);
