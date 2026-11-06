# 📋 Automação de Controle de Demandas - TI (Google Apps Script)

Este repositório contém os scripts desenvolvidos em Google Apps Script para a gestão, acompanhamento e envio de resumos automáticos das demandas do setor de TI da Unicesusc.

---

## 🚀 Funcionalidades

- **Resumo Semanal de Demandas:** Consolidação de pendências da equipe enviada periodicamente por e-mail.
- **Filtragem Inteligente de Linhas:** Ignora "linhas fantasma" pré-formatadas da planilha e considera apenas tarefas ativas.
- **Validação de Status:** Desconsidera automaticamente demandas marcadas como `Concluído`.
- **E-mail Institucional:** Envio padronizado através do remetente institucional do setor.

---

## 🛠️ Tecnologias Utilizadas

- **Google Apps Script (JavaScript)**
- **Google Sheets API**
- **HTML / CSS** (para renderização dos cards nos e-mails)

---

## 📌 Configuração e Disparadores (Triggers)

- **Remetente Oficial:** `atendimento.ti@unicesusc.edu.br`
- **Acionadores:** Configurados diretamente no painel de *Acionadores* (Triggers) do Apps Script para execução automática todas as sextas-feiras.

---

## 📁 Estrutura de Arquivos

- `resumo_semanal.js`: Script responsável por coletar as linhas da planilha, estruturar o HTML dos cards e disparar o resumo quinzenal/semanal.
- `README.md`: Documentação oficial do repositório.
