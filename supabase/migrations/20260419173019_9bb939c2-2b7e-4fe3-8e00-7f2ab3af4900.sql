INSERT INTO public.site_content (section, key, value, content_type) VALUES
('Leadership Messages', 'leader_message_founder', '', 'longtext'),
('Leadership Messages', 'leader_message_secretary', '', 'longtext'),
('Leadership Messages', 'leader_message_joint_secretary', '', 'longtext'),
('Leadership Messages', 'leader_message_director', '', 'longtext'),
('Leadership Messages', 'leader_message_school_principal', '', 'longtext'),
('Leadership Messages', 'leader_message_high_school_principal', '', 'longtext')
ON CONFLICT (key) DO NOTHING;