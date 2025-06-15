-- Insert a sample user profile (will only work if the user exists in auth.users)
-- This is just a placeholder - the actual profile will be created when a user signs up
INSERT INTO public.profiles (id, name, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Sample User', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample sensors
INSERT INTO public.sensors (user_id, name, device_id, status, location, latitude, longitude, last_reading, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Sensor Rio Tietê', 'DEVICE001', 'active', 'Rio Tietê - Ponte das Bandeiras', -23.5205, -46.6333, 1.2, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', 'Sensor Rio Pinheiros', 'DEVICE002', 'active', 'Rio Pinheiros - Ponte Cidade Jardim', -23.5869, -46.6975, 0.8, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', 'Sensor Córrego Ipiranga', 'DEVICE003', 'inactive', 'Córrego Ipiranga - Parque da Independência', -23.5851, -46.6063, NULL, NOW(), NOW())
ON CONFLICT (device_id) DO NOTHING;

-- Insert sample readings
-- First, get the IDs of the sensors we just inserted
DO $$
DECLARE
  sensor1_id bigint;
  sensor2_id bigint;
BEGIN
  -- Get the IDs of our sample sensors
  SELECT id INTO sensor1_id FROM public.sensors WHERE device_id = 'DEVICE001' LIMIT 1;
  SELECT id INTO sensor2_id FROM public.sensors WHERE device_id = 'DEVICE002' LIMIT 1;
  
  -- Only insert readings if we found the sensors
  IF sensor1_id IS NOT NULL THEN
    INSERT INTO public.readings (sensor_id, water_level, created_at)
    VALUES 
      (sensor1_id, 1.0, NOW() - INTERVAL '7 days'),
      (sensor1_id, 1.1, NOW() - INTERVAL '6 days'),
      (sensor1_id, 1.3, NOW() - INTERVAL '5 days'),
      (sensor1_id, 1.2, NOW() - INTERVAL '4 days'),
      (sensor1_id, 1.0, NOW() - INTERVAL '3 days'),
      (sensor1_id, 1.1, NOW() - INTERVAL '2 days'),
      (sensor1_id, 1.2, NOW() - INTERVAL '1 day');
  END IF;
  
  IF sensor2_id IS NOT NULL THEN
    INSERT INTO public.readings (sensor_id, water_level, created_at)
    VALUES 
      (sensor2_id, 0.7, NOW() - INTERVAL '7 days'),
      (sensor2_id, 0.8, NOW() - INTERVAL '6 days'),
      (sensor2_id, 0.9, NOW() - INTERVAL '5 days'),
      (sensor2_id, 1.0, NOW() - INTERVAL '4 days'),
      (sensor2_id, 0.9, NOW() - INTERVAL '3 days'),
      (sensor2_id, 0.8, NOW() - INTERVAL '2 days'),
      (sensor2_id, 0.8, NOW() - INTERVAL '1 day');
  END IF;
END $$;

-- Insert sample reports
INSERT INTO public.reports (user_id, title, location, description, status, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Alagamento na Av. Paulista', 'Avenida Paulista, 1000', 'Alagamento na via devido a chuva forte', 'open', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', 'Bueiro entupido', 'Rua Augusta, 500', 'Bueiro entupido causando acúmulo de água na calçada', 'progress', NOW() - INTERVAL '2 days', NOW()),
  ('00000000-0000-0000-0000-000000000000', 'Vazamento na rede de água', 'Rua Oscar Freire, 200', 'Vazamento na rede de água potável', 'closed', NOW() - INTERVAL '5 days', NOW())
ON CONFLICT DO NOTHING;
