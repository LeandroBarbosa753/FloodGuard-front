-- Criar tabela email_settings se não existir
CREATE TABLE IF NOT EXISTS email_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT true,
  critical_alerts BOOLEAN DEFAULT true,
  maintenance_alerts BOOLEAN DEFAULT true,
  report_day TEXT DEFAULT 'monday',
  report_time TEXT DEFAULT '09:00',
  critical_threshold DECIMAL DEFAULT 2.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Criar tabela notifications se não existir
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  category TEXT DEFAULT 'system' CHECK (category IN ('system', 'alert', 'maintenance', 'report')),
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar colunas de latitude e longitude aos reports se não existirem
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS latitude DECIMAL,
ADD COLUMN IF NOT EXISTS longitude DECIMAL;

-- Corrigir políticas RLS para email_settings
DROP POLICY IF EXISTS "Users can view own email settings" ON email_settings;
DROP POLICY IF EXISTS "Users can insert own email settings" ON email_settings;
DROP POLICY IF EXISTS "Users can update own email settings" ON email_settings;

CREATE POLICY "Users can manage own email settings" ON email_settings
  FOR ALL USING (auth.uid() = user_id);

-- Habilitar RLS para email_settings
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Corrigir políticas RLS para notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Habilitar RLS para notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Atualizar status dos reports para padronizar
UPDATE reports SET status = 'open' WHERE status = 'pending' OR status = 'new';
UPDATE reports SET status = 'progress' WHERE status = 'in_progress' OR status = 'investigating';
UPDATE reports SET status = 'closed' WHERE status = 'resolved' OR status = 'completed';

-- Adicionar constraint para status padronizado
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE reports ADD CONSTRAINT reports_status_check 
  CHECK (status IN ('open', 'progress', 'closed'));
