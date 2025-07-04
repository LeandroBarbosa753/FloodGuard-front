-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  type varchar(50) NOT NULL DEFAULT 'info', -- info, warning, error, success
  category varchar(50) NOT NULL DEFAULT 'system', -- system, alert, maintenance, report
  read boolean DEFAULT false,
  action_url varchar(255),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);

-- Criar tabela de configurações de email
CREATE TABLE IF NOT EXISTS public.email_settings (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_notifications boolean DEFAULT true,
  weekly_reports boolean DEFAULT true,
  critical_alerts boolean DEFAULT true,
  maintenance_alerts boolean DEFAULT true,
  report_day varchar(20) DEFAULT 'monday',
  report_time time DEFAULT '09:00:00',
  critical_threshold float DEFAULT 2.0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Users can manage their own email settings" 
ON public.email_settings FOR ALL 
USING (auth.uid() = user_id);

-- Inserir algumas notificações de exemplo
INSERT INTO public.notifications (user_id, title, message, type, category, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Sistema Atualizado', 'O FloodGuard foi atualizado com novas funcionalidades de monitoramento.', 'info', 'system', NOW() - INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000000', 'Nível Crítico Detectado', 'Sensor Rio Tietê detectou nível de água acima do limite crítico (2.5m).', 'warning', 'alert', NOW() - INTERVAL '1 hour'),
  ('00000000-0000-0000-0000-000000000000', 'Manutenção Programada', 'Sensor Rio Pinheiros precisa de manutenção preventiva.', 'warning', 'maintenance', NOW() - INTERVAL '30 minutes'),
  ('00000000-0000-0000-0000-000000000000', 'Relatório Semanal Enviado', 'Seu relatório semanal foi enviado para seu email com sucesso.', 'success', 'report', NOW() - INTERVAL '10 minutes')
ON CONFLICT DO NOTHING;
