-- Seed badges
insert into badges (name, description, icon, requirement) values
  ('First Explorer', 'Complete your first mission', '🗺️', 'missions_completed>=1'),
  ('7-Day Streak', 'Maintain a 7 day streak', '🔥', 'streak>=7'),
  ('Photographer', 'Complete 5 photo-based missions', '📸', 'photo_missions>=5'),
  ('Social Butterfly', 'Complete 5 social missions', '🤝', 'social_missions>=5'),
  ('Self-Improver', 'Complete 5 self-improvement missions', '💪', 'self_missions>=5'),
  ('Knowledge Seeker', 'Complete 5 learning missions', '🧠', 'learn_missions>=5'),
  ('Adventure Master', 'Complete 10 adventure missions', '🌍', 'adventure_missions>=10'),
  ('100 Missions', 'Complete 100 missions total', '🏆', 'missions_completed>=100')
on conflict do nothing;

-- Seed starter missions (one per mood, mirrors the prototype's library)
insert into missions (title, description, category, difficulty, estimated_time, estimated_cost, distance, xp_reward, steps, requirements, is_ai_generated) values
(
  'The Hidden World Challenge', 'Discover something new hiding in plain sight near you.',
  'explore', 'Easy', '45 min', '₹0–100', '5 km', 50,
  '[{"title":"Explore","description":"Walk to a place within 5 km you have never noticed before"},
    {"title":"Capture","description":"Take one creative photograph of it"},
    {"title":"Learn","description":"Find one interesting fact about it"},
    {"title":"Share","description":"Share your discovery with the community"}]',
  '["Phone with camera"]', false
),
(
  'The Discipline Sprint', 'A short burst of momentum for your body and mind.',
  'self', 'Easy', '30 min', '₹0', 'At home', 70,
  '[{"title":"Move","description":"Do 15 minutes of any physical movement"},
    {"title":"Plan","description":"Write down one habit you want to build"},
    {"title":"Hydrate","description":"Drink a full bottle of water"},
    {"title":"Reflect","description":"Rate your energy 1-10"}]',
  '["Water bottle"]', false
),
(
  'Stranger Connection Quest', 'Practice genuine, low-stakes connection with someone new.',
  'social', 'Medium', '1 hr', '₹100–200', 'Nearby', 100,
  '[{"title":"Go","description":"Go to a public café or park"},
    {"title":"Connect","description":"Start a conversation with someone new"},
    {"title":"Ask","description":"Ask them one interesting question about their life"},
    {"title":"Exchange","description":"Exchange a fun fact"}]',
  '["A public place"]', false
),
(
  'Micro-Hustle Hour', 'A small real-world earning challenge.',
  'earn', 'Medium', '1 hr', '₹0', 'From home', 80,
  '[{"title":"List","description":"List 3 unused items you could resell"},
    {"title":"Post","description":"Post one item online with a photo"},
    {"title":"Offer","description":"Offer a small skill to one contact"},
    {"title":"Track","description":"Track any interest you get"}]',
  '["Item to sell or a skill to offer"]', false
),
(
  'Photography 101 Field Trip', 'Learn one technique, then go apply it immediately.',
  'learn', 'Easy', '1.5 hr', '₹0', 'Nearby', 85,
  '[{"title":"Learn","description":"Learn the rule of thirds"},
    {"title":"Shoot","description":"Shoot 5 photos applying it"},
    {"title":"Experiment","description":"Shoot one photo using only shadows"},
    {"title":"Share","description":"Pick your best and share why"}]',
  '["Phone with camera"]', false
),
(
  'Warm Contact Ritual', 'Reconnect with someone who matters.',
  'connect', 'Easy', '30 min', '₹0', 'From home', 60,
  '[{"title":"Reach out","description":"Message an old friend you have not spoken to in a while"},
    {"title":"Ask","description":"Ask them one real question about their life"},
    {"title":"Share","description":"Share something honest about your day"},
    {"title":"Plan","description":"Plan one small future hangout"}]',
  '["Phone"]', false
),
(
  'The Unknown Corner', 'A short, low-cost spontaneous adventure.',
  'adventure', 'Medium', '1 hr', '₹50', '5 km', 95,
  '[{"title":"Pick a direction","description":"Pick a direction you never walk in"},
    {"title":"Explore","description":"Explore for 30 minutes without a map"},
    {"title":"Discover","description":"Find a landmark you did not know existed"},
    {"title":"Mark it","description":"Mark it on your personal map"}]',
  '[]', false
),
(
  'Deep Focus Block', 'A short, structured productivity sprint.',
  'self', 'Easy', '35 min', '₹0', 'At home', 65,
  '[{"title":"Choose","description":"Pick your one most important task today"},
    {"title":"Focus","description":"Work on it for 25 focused minutes, phone away"},
    {"title":"Move","description":"Take a 5 min walk break"},
    {"title":"Review","description":"Review what you completed"}]',
  '[]', false
),
(
  'One Object, Five Angles', 'A tiny creative constraint exercise.',
  'create', 'Easy', '40 min', '₹0', 'At home', 55,
  '[{"title":"Choose","description":"Pick any everyday object near you"},
    {"title":"Shoot","description":"Photograph it from 5 different creative angles"},
    {"title":"Caption","description":"Write a 2-line caption as if it were art"},
    {"title":"Share","description":"Share your favorite frame"}]',
  '["Phone with camera"]', false
)
on conflict do nothing;
