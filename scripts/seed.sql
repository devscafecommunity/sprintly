-- Insert sample data for development/testing

-- Sample profiles (these would normally be created via Supabase Auth)
INSERT INTO profiles (id, username, bio, avatar_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'joao_dev', 'Desenvolvedor apaixonado por tecnologia', ''),
  ('550e8400-e29b-41d4-a716-446655440001', 'maria_design', 'Designer UX/UI focada em experiência do usuário', ''),
  ('550e8400-e29b-41d4-a716-446655440002', 'pedro_fitness', 'Personal trainer e entusiasta de vida saudável', '');

-- Sample goals
INSERT INTO goals (id, user_id, title, description, tags, visibility) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Aprender React Native', 'Desenvolver habilidades em desenvolvimento mobile com React Native para criar apps multiplataforma', ARRAY['programação', 'mobile', 'react'], 'public'),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Estudar para AWS Certification', 'Obter certificação AWS Solutions Architect Associate', ARRAY['aws', 'cloud', 'certificação'], 'private'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Criar Portfolio de Design', 'Desenvolver um portfolio online showcasing meus melhores projetos de design', ARRAY['design', 'portfolio', 'carreira'], 'public'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Perder 10kg em 6 meses', 'Programa de emagrecimento saudável com foco em exercícios e alimentação balanceada', ARRAY['saúde', 'fitness', 'emagrecimento'], 'public');

-- Sample steps for React Native goal
INSERT INTO steps (goal_id, title, description, order_index, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', 'Configurar ambiente de desenvolvimento', 'Instalar Node.js, React Native CLI, Android Studio e Xcode', 0, 'done'),
  ('660e8400-e29b-41d4-a716-446655440000', 'Estudar fundamentos do React Native', 'Aprender componentes básicos, navegação e estado', 1, 'done'),
  ('660e8400-e29b-41d4-a716-446655440000', 'Criar primeiro app - Todo List', 'Desenvolver um app simples de lista de tarefas', 2, 'doing'),
  ('660e8400-e29b-41d4-a716-446655440000', 'Integrar com API REST', 'Conectar o app com uma API externa para dados dinâmicos', 3, 'todo'),
  ('660e8400-e29b-41d4-a716-446655440000', 'Implementar autenticação', 'Adicionar login/logout com Firebase Auth', 4, 'todo'),
  ('660e8400-e29b-41d4-a716-446655440000', 'Publicar na Play Store', 'Preparar e publicar o app na Google Play Store', 5, 'todo');

-- Sample steps for AWS Certification goal
INSERT INTO steps (goal_id, title, description, order_index, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Estudar EC2 e VPC', 'Dominar conceitos de instâncias e redes virtuais', 0, 'done'),
  ('660e8400-e29b-41d4-a716-446655440001', 'Aprender S3 e CloudFront', 'Storage e CDN na AWS', 1, 'doing'),
  ('660e8400-e29b-41d4-a716-446655440001', 'Praticar com RDS e DynamoDB', 'Bancos de dados relacionais e NoSQL', 2, 'todo'),
  ('660e8400-e29b-41d4-a716-446655440001', 'Fazer simulados', 'Resolver questões práticas do exame', 3, 'todo'),
  ('660e8400-e29b-41d4-a716-446655440001', 'Agendar e fazer o exame', 'Realizar a prova oficial da AWS', 4, 'todo');

-- Sample steps for Design Portfolio goal
INSERT INTO steps (goal_id, title, description, order_index, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440002', 'Selecionar melhores projetos', 'Escolher 8-10 projetos que demonstrem diferentes habilidades', 0, 'done'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Criar wireframes do site', 'Planejar estrutura e navegação do portfolio', 1, 'done'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Desenvolver identidade visual', 'Criar logo, paleta de cores e tipografia', 2, 'doing'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Desenvolver o site', 'Implementar o design em HTML/CSS/JS', 3, 'todo'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Escrever case studies', 'Documentar processo e resultados de cada projeto', 4, 'todo'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Publicar e divulgar', 'Colocar online e compartilhar nas redes sociais', 5, 'todo');

-- Sample steps for Fitness goal
INSERT INTO steps (goal_id, title, description, order_index, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440003', 'Consulta com nutricionista', 'Criar plano alimentar personalizado', 0, 'done'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Montar rotina de exercícios', 'Definir treinos para 4x por semana', 1, 'done'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Primeira semana de adaptação', 'Seguir dieta e exercícios básicos', 2, 'done'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Mês 1: Estabelecer rotina', 'Criar hábitos consistentes de alimentação e exercício', 3, 'doing'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Mês 2-3: Intensificar treinos', 'Aumentar intensidade e duração dos exercícios', 4, 'todo'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Mês 4-6: Manter consistência', 'Focar na manutenção dos hábitos até atingir a meta', 5, 'todo');

-- Sample shared goals
INSERT INTO shared_goals (goal_id, user_id) VALUES
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002');

-- Sample comments
INSERT INTO comments (shared_goal_id, user_id, content) VALUES
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440000'), '550e8400-e29b-41d4-a716-446655440001', 'Ótima escolha! React Native é muito versátil 💪'),
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440000'), '550e8400-e29b-41d4-a716-446655440002', 'Estou seguindo sua jornada, muito inspirador!'),
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440002'), '550e8400-e29b-41d4-a716-446655440000', 'Mal posso esperar para ver o resultado final 🎨'),
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440003'), '550e8400-e29b-41d4-a716-446655440001', 'Você consegue! Consistência é a chave 🔥');

-- Sample reactions
INSERT INTO reactions (shared_goal_id, user_id, reaction_type) VALUES
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440000'), '550e8400-e29b-41d4-a716-446655440001', 'force'),
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440000'), '550e8400-e29b-41d4-a716-446655440002', 'idea'),
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440002'), '550e8400-e29b-41d4-a716-446655440000', 'idea'),
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440002'), '550e8400-e29b-41d4-a716-446655440002', 'force'),
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440003'), '550e8400-e29b-41d4-a716-446655440000', 'progress'),
  ((SELECT id FROM shared_goals WHERE goal_id = '660e8400-e29b-41d4-a716-446655440003'), '550e8400-e29b-41d4-a716-446655440001', 'force');

-- Sample groups
INSERT INTO groups (id, name, description, created_by) VALUES
  ('770e8400-e29b-41d4-a716-446655440000', 'Desenvolvedores', 'Grupo para quem está aprendendo programação e desenvolvimento', '550e8400-e29b-41d4-a716-446655440000'),
  ('770e8400-e29b-41d4-a716-446655440001', 'Design & Criatividade', 'Espaço para designers e profissionais criativos', '550e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440002', 'Saúde & Fitness', 'Comunidade focada em bem-estar e vida saudável', '550e8400-e29b-41d4-a716-446655440002');

-- Sample group members
INSERT INTO group_members (group_id, user_id) VALUES
  ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000'),
  ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001');
