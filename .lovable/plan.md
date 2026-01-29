

# Meu Bolso - App de Finanças Pessoais

Um aplicativo Android completo para gestão financeira pessoal, 100% offline, com Material Design 3 em português brasileiro.

---

## 🔐 Segurança e Acesso

### Tela de Login com PIN
- Tela inicial exigindo PIN de 4-6 dígitos para acessar o app
- Botões grandes e de alto contraste para fácil digitação
- Opção de recuperação via biometria (impressão digital ou Face Unlock do Android)
- Configuração do PIN durante primeiro acesso

---

## 🏠 Dashboard Principal

### Visão Geral do Mês
- Menu lateral (drawer) com navegação para todas as seções
- Resumo do mês atual: Receitas, Despesas, Saldo
- Cards de acesso rápido para Cartões, Investimentos e Alertas
- Botão flutuante (+) para adicionar nova transação rapidamente
- Toggle para modo escuro no menu lateral

---

## 💰 Receitas e Despesas

### Gestão de Transações
- Lista de transações do mês com filtros por categoria
- Cadastro rápido: valor, descrição, categoria, data
- Categorias pré-definidas (Salário, Alimentação, Transporte, Moradia, etc.) + criação de novas
- Edição e exclusão de transações
- Transações recorrentes (mensais, semanais, anuais)
- Parcelamento: definir número de parcelas (até 999x) com distribuição automática nos meses futuros

---

## 💳 Cartões de Crédito

### Gestão de Cartões
- Cadastro de múltiplos cartões: nome, limite, dia de fechamento, dia de vencimento
- Cada cartão com sua própria fatura e histórico

### Compras no Cartão
- Compras no cartão ficam separadas (não aparecem como despesas diretas)
- Suporte a parcelamento no cartão
- Visualização da fatura: todas as compras entre um fechamento e outro

### Lógica de Fatura
- Fatura é gerada automaticamente com as compras do período
- No dia do vencimento, a fatura aparece como **UMA única despesa** nas Despesas
- Fatura só é criada se houver compras no período
- Histórico de faturas anteriores por cartão

---

## 📈 Investimentos

### Gestão de Aplicações
- Cadastro de investimentos com tipos customizados (o usuário define: Poupança, CDB, Fundos, etc.)
- Ações: Aplicar (adicionar valor) e Resgatar (retirar valor)
- Rendimento manual: usuário informa o percentual de rendimento de cada aplicação
- Exibição do rendimento diário e mensal estimado
- Histórico de movimentações por investimento

---

## 📊 Relatórios

### Visualização Simples (padrão)
- Totais por categoria
- Saldo do mês
- Comparativo Receitas vs Despesas

### Visualização Detalhada (sob demanda)
- Gráfico de pizza para despesas por categoria
- Gráfico de barras para evolução mensal
- Tendências de gastos
- Análise de padrões de consumo
- Comparativo entre meses

---

## 🔔 Alertas Visuais

### Notificações Locais
- Alerta de fatura próxima do vencimento
- Alerta de limite do cartão próximo
- Alerta de despesas acima da média
- Badge visual no ícone de alertas quando houver pendências

---

## 💾 Backup e Restauração

### Exportar/Importar Dados
- Botão para exportar todos os dados em arquivo local (JSON ou SQLite)
- Importação com confirmação (sobrescreve dados existentes com aviso)
- Histórico de backups realizados

---

## 🎨 Design e Experiência

### Material Design 3
- Cores do Material You com tema claro padrão
- Toggle para modo escuro no menu lateral
- Botões grandes (mínimo 48dp) com alto contraste
- Tipografia clara e legível
- Animações suaves e feedback tátil

### Responsividade
- Layout adaptado para diferentes tamanhos de tela Android
- Suporte a orientação retrato e paisagem

---

## 📱 Arquitetura Técnica

### Capacitor para Android
- App React empacotado como APK nativo
- Banco de dados local SQLite para persistência offline
- Biometria nativa via plugin Capacitor
- Sistema de arquivos local para backups

### Isolamento Mensal
- Cada mês é tratado independentemente
- Sem carry-over de saldo entre meses
- Navegação por meses no dashboard

