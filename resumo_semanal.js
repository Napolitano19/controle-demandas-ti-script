function enviarResumoSemanalEAlertas() {
  console.log("🚀 [INÍCIO] Executando script com layout de Cards otimizado e link da planilha...");
  
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const urlPlanilha = planilha.getUrl(); // Obtém o link direto da planilha
  
  // Busca explicitamente a aba "20262". Caso ela não exista, usa a primeira aba à esquerda como fallback.
  const aba = planilha.getSheetByName("20262") || planilha.getSheets()[0];
  
  const dados = aba.getDataRange().getDisplayValues();
  const notas = aba.getDataRange().getNotes();
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const fimDaSemana = new Date(hoje);
  const diaDaSemana = hoje.getDay();
  fimDaSemana.setDate(hoje.getDate() + (7 - diaDaSemana));
  fimDaSemana.setHours(23, 59, 59, 999);

  function converterTextoParaData(textoData) {
    if (!textoData || typeof textoData !== 'string') return null;
    const limpo = textoData.trim();
    if (limpo === "" || limpo.toLowerCase().includes("não")) return null;
    const partes = limpo.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const ano = parseInt(partes[2], 10);
      return new Date(ano < 100 ? 2000 + ano : ano, mes, dia);
    }
    return null;
  }

  let demandasAtrasadasOuHoje = [];
  let demandasDaSemana = [];
  let demandasFuturas = [];
  let demandasSemPrazoAntigas = [];
  let demandasSemPrazoRecentes = [];

  for (let i = 2; i < dados.length; i++) {
    const setor = dados[i][0];
    const ca = dados[i][1];
    const tarefa = dados[i][2];
    const atendente = dados[i][3];
    const prioridade = dados[i][5];
    const status = dados[i][6];
    const dataSolTexto = dados[i][7];
    const prazoTexto = dados[i][8];
    
    const notaObservacao = notas[i][2] ? notas[i][2].trim() : ""; 

    if (status !== "Concluído" && tarefa && tarefa.trim() !== "") {
      const objDataSol = converterTextoParaData(dataSolTexto);
      const objPrazo = converterTextoParaData(prazoTexto);

      let txtSolicitacao = objDataSol ? objDataSol.toLocaleDateString('pt-BR') : "Não informada";
      let txtPrazo = objPrazo ? objPrazo.toLocaleDateString('pt-BR') : "Não definido";

      // Bloco de Observação/Nota (se existir)
      let blocoNota = "";
      if (notaObservacao !== "") {
        blocoNota = `<div style="margin-top: 8px; padding: 6px 10px; background-color: #f8f9fa; border-left: 3px solid #6c757d; font-size: 12px; color: #495057;">💬 <b>Observação:</b> ${notaObservacao}</div>`;
      }

      // Estilização dinâmica das Badges de Prioridade
      let estiloPrioridade = "background-color: #e2e8f0; color: #4a5568;";
      if (prioridade && prioridade.toLowerCase().includes("importante")) {
        estiloPrioridade = "background-color: #feebc8; color: #c05621;";
      } else if (prioridade && prioridade.toLowerCase().includes("urgente")) {
        estiloPrioridade = "background-color: #fed7d7; color: #c53030;";
      }

      // Função geradora de Cards
      const criarCard = (textoExtraPrazo = "") => `
        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 10px; background-color: #ffffff;">
          <div style="font-size: 14px; font-weight: bold; color: #1a202c; margin-bottom: 6px;">
            ${tarefa} <span style="font-size: 11px; font-weight: normal; color: #718096;">(#${ca})</span>
          </div>
          <div style="font-size: 11px; color: #4a5568;">
            <span style="background-color: #edf2f7; padding: 2px 6px; border-radius: 4px;">📂 ${setor}</span>
            <span style="background-color: #edf2f7; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">👤 ${atendente}</span>
            <span style="${estiloPrioridade} padding: 2px 6px; border-radius: 4px; margin-left: 4px;">⚡ ${prioridade}</span>
          </div>
          <div style="font-size: 11px; color: #718096; margin-top: 6px;">
            📅 Solicitado: <b>${txtSolicitacao}</b> | Prazo: <b>${txtPrazo}</b> ${textoExtraPrazo}
          </div>
          ${blocoNota}
        </div>`;

      if (objPrazo) {
        const dataPrazo = new Date(objPrazo);
        dataPrazo.setHours(0, 0, 0, 0);

        if (dataPrazo <= hoje) demandasAtrasadasOuHoje.push(criarCard());
        else if (dataPrazo > hoje && dataPrazo <= fimDaSemana) demandasDaSemana.push(criarCard());
        else demandasFuturas.push(criarCard());
      } else {
        if (objDataSol) {
          const diferencaEmMs = hoje.getTime() - objDataSol.getTime();
          const diasAberto = Math.floor(diferencaEmMs / (1000 * 60 * 60 * 24));
          if (diasAberto >= 7) {
            demandasSemPrazoAntigas.push(criarCard(`<span style="color: #c05621; font-weight: bold;">(aberta há ${diasAberto} dias)</span>`));
          } else {
            demandasSemPrazoRecentes.push(criarCard());
          }
        } else {
          demandasSemPrazoRecentes.push(criarCard());
        }
      }
    }
  }

  // --- ESTRUTURA DO E-MAIL ---
  let corpoHtml = `<div style="font-family: Arial, sans-serif; max-width: 650px; color: #2d3748;">
    <h2>Olá, Pessoal! 👋</h2>
    <p style="font-size: 13px; color: #4a5568;">Segue o resumo visual das atividades e demandas em andamento.</p><hr style="border: 0; border-top: 1px solid #e2e8f0;"><br>`;

  if (demandasAtrasadasOuHoje.length > 0) {
    corpoHtml += `<h3 style="color: #e53e3e; font-size: 15px;">🚨 Demandas Atrasadas ou Vencendo Hoje</h3>` + demandasAtrasadasOuHoje.join("") + "<br>";
  }
  if (demandasDaSemana.length > 0) {
    corpoHtml += `<h3 style="color: #3182ce; font-size: 15px;">📅 Demandas para Esta Semana</h3>` + demandasDaSemana.join("") + "<br>";
  }
  if (demandasSemPrazoAntigas.length > 0) {
    corpoHtml += `<h3 style="color: #dd6b20; font-size: 15px;">⏳ Demandas Sem Prazo (Abertas há 7+ dias)</h3>` + demandasSemPrazoAntigas.join("") + "<br>";
  }
  if (demandasSemPrazoRecentes.length > 0) {
    corpoHtml += `<h3 style="color: #38a169; font-size: 15px;">🆕 Demandas Recentes Sem Prazo</h3>` + demandasSemPrazoRecentes.join("") + "<br>";
  }
  if (demandasFuturas.length > 0) {
    corpoHtml += `<h3 style="color: #718096; font-size: 15px;">📆 Prazos Futuros</h3>` + demandasFuturas.join("") + "<br>";
  }

  // --- BOTÃO DE ACESSO À PLANILHA NO RODAPÉ ---
  corpoHtml += `
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 20px; margin-bottom: 20px;">
    <div style="text-align: center; margin-top: 15px; margin-bottom: 15px;">
      <a href="${urlPlanilha}" target="_blank" style="background-color: #3182ce; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 13px; display: inline-block;">
        📊 Acessar Planilha de Controle de Demandas
      </a>
    </div>
  </div>`;

  const total = demandasAtrasadasOuHoje.length + demandasDaSemana.length + demandasSemPrazoAntigas.length + demandasSemPrazoRecentes.length + demandasFuturas.length;

  if (total > 0) {
    MailApp.sendEmail({
      to: "suporte.ti@unicesusc.edu.br",
      subject: "📋 Resumo Semanal e Alerta de Prazos - Controle de Demandas",
      htmlBody: corpoHtml
    });
    console.log("✅ [SUCESSO] E-mail enviado com sucesso!");
  }
}