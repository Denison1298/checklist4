let atendimentos = JSON.parse(localStorage.getItem('atendimentos')) || [];
let currentPage = 1;
const itemsPerPage = 10;
let showAll = false;
let mostrarTodosDiasAtendimentos = false;
let diasSelecionadosAtendimentos = getUltimosQuatroDias();
let mostrarTodosDiasDashboard = false;
let diasSelecionadosDashboard = getUltimosQuatroDias();

// Constantes para meta e horários
const DAILY_GOAL = 30;
const END_OF_DAY = { hour: 16, minute: 20 };
const REMINDER_TIME = { hour: 16, minute: 15 };
const FIRST_OPEN_KEY = 'first_open_today';

// Função para obter a chave do dia atual (YYYY-MM-DD)
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
}

// Função para contar atendimentos do dia atual
function countDailyAttendances() {
    const todayKey = getTodayKey();
    return atendimentos.filter(atendimento => {
        const [day, month, year] = atendimento.dataHora.split(' ')[0].split('/');
        const atendimentoDate = `${year}-${month}-${day}`;
        return atendimentoDate === todayKey;
    }).length;
}

// Função para exibir mensagem no pop-up
function showPopupMessage(message) {
    const popup = document.getElementById('popup');
    const messageElement = document.getElementById('popup-message');
    messageElement.textContent = message;
    popup.classList.remove('hidden');
    setTimeout(closePopup, 5000); // Fecha após 5 segundos
}

// Função para fechar o pop-up
function closePopup() {
    document.getElementById('popup').classList.add('hidden');
}

// Função para obter a mensagem com base no número de atendimentos
function getProgressMessage(count) {
    const remaining = DAILY_GOAL - count;
    const now = new Date();
    const isNearEnd = now.getHours() >= 15 && now.getMinutes() >= 30;

    if (remaining > 0 && isNearEnd) {
        return `Atenção, faltam ${remaining} atendimentos e está perto do final do expediente!`;
    } else if (remaining > 0) {
        return `Faltam ${remaining} atendimentos para bater a meta diária!`;
    } else if (remaining === 0) {
        return `Pode relaxar, você bateu a meta!`;
    } else {
        return `Parabéns! Você bateu a meta e passou ${-remaining} atendimentos!`;
    }
}

// Função para verificar a primeira abertura do dia
function checkFirstOpen() {
    const todayKey = getTodayKey();
    const lastOpen = localStorage.getItem(FIRST_OPEN_KEY);
    if (lastOpen !== todayKey && document.getElementById('checklist').classList.contains('active')) {
        showPopupMessage('Bom dia, ótimo dia de trabalho e bora bater a meta!');
        localStorage.setItem(FIRST_OPEN_KEY, todayKey);
    }
}

// Função para verificar o horário de lembrete (16:15)
function checkReminderTime() {
    const now = new Date();
    if (now.getHours() === REMINDER_TIME.hour && now.getMinutes() === REMINDER_TIME.minute && document.getElementById('checklist').classList.contains('active')) {
        const isSaturday = now.getDay() === 6;
        const message = isSaturday
            ? 'Seu expediente está chegando ao fim, ótimo final de semana, até segunda!'
            : 'Seu expediente está chegando ao fim, ótimo descanso!';
        showPopupMessage(message);
    }
}

// Função para obter os últimos 4 dias do mês atual
function getUltimosQuatroDias() {
    const hoje = new Date();
    const dias = [];
    for (let i = 3; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - i);
        const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
        dias.push(dataFormatada);
    }
    return dias;
}

// Função para renderizar a tabela com paginação e filtro de dias
function renderAtendimentosTable() {
    const tableBody = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    let filteredAtendimentos = atendimentos;
    if (!mostrarTodosDiasAtendimentos && diasSelecionadosAtendimentos.length > 0) {
        filteredAtendimentos = atendimentos.filter(atendimento => {
            const dataAtendimento = atendimento.dataHora.split(' ')[0];
            return diasSelecionadosAtendimentos.includes(dataAtendimento);
        });
    }

    let dataToShow = filteredAtendimentos;
    let startIndex = 0;
    if (!showAll) {
        startIndex = (currentPage - 1) * itemsPerPage;
        const end = Math.min(startIndex + itemsPerPage, filteredAtendimentos.length);
        dataToShow = filteredAtendimentos.slice(startIndex, end);
    }

    dataToShow.forEach((atendimento) => {
        const globalIndex = atendimentos.indexOf(atendimento);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${atendimento.tipo}</td>
            <td>${atendimento.protocolo}</td>
            <td>${atendimento.dataHora}</td>
            <td><button class="remove-btn" onclick="removerAtendimento(${globalIndex})">Remover</button></td>
        `;
        tableBody.appendChild(row);
    });

    updatePaginationControls(filteredAtendimentos.length);
}

// Função para atualizar os controles de paginação
function updatePaginationControls(totalItems) {
    const totalPages = showAll ? 1 : Math.ceil(totalItems / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevPage = document.getElementById('prevPage');
    const nextPage = document.getElementById('nextPage');
    const paginationControls = document.getElementById('paginationControls');

    if (showAll || totalItems === 0) {
        paginationControls.style.display = 'none';
    } else {
        paginationControls.style.display = 'block';
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        prevPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage >= totalPages;
    }
}

// Função para navegar para a página anterior
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderAtendimentosTable();
    }
}

// Função para navegar para a próxima página
function nextPage() {
    let filteredAtendimentos = atendimentos;
    if (!mostrarTodosDiasAtendimentos && diasSelecionadosAtendimentos.length > 0) {
        filteredAtendimentos = atendimentos.filter(atendimento => {
            const dataAtendimento = atendimento.dataHora.split(' ')[0];
            return diasSelecionadosAtendimentos.includes(dataAtendimento);
        });
    }
    const totalPages = Math.ceil(filteredAtendimentos.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderAtendimentosTable();
    }
}

// Função para alternar entre mostrar todos ou paginar
function toggleMostrarTodos() {
    showAll = document.getElementById('mostrarTodos').checked;
    currentPage = 1;
    renderAtendimentosTable();
}

// Função para filtrar por data na aba Atendimentos Mensais
function filtrarPorDataAtendimentos() {
    const filtroData = document.getElementById('filtroDataAtendimentos').value;
    if (filtroData) {
        const [ano, mes, dia] = filtroData.split('-');
        const dataFormatada = `${dia}/${mes}`;
        diasSelecionadosAtendimentos = [dataFormatada];
        document.getElementById('mostrarTodosDiasAtendimentos').checked = false;
        mostrarTodosDiasAtendimentos = false;
        currentPage = 1;
        renderAtendimentosTable();
    }
}

// Função para alternar entre mostrar todos os dias ou dias selecionados na aba Atendimentos Mensais
function toggleMostrarTodosDiasAtendimentos() {
    mostrarTodosDiasAtendimentos = document.getElementById('mostrarTodosDiasAtendimentos').checked;
    if (mostrarTodosDiasAtendimentos) {
        diasSelecionadosAtendimentos = [];
    } else {
        diasSelecionadosAtendimentos = getUltimosQuatroDias();
    }
    currentPage = 1;
    renderAtendimentosTable();
}

// Função para filtrar por data na aba Dashboard
function filtrarPorDataDashboard() {
    const filtroData = document.getElementById('filtroDataDashboard').value;
    if (filtroData) {
        const [ano, mes, dia] = filtroData.split('-');
        const dataFormatada = `${dia}/${mes}`;
        diasSelecionadosDashboard = [dataFormatada];
        document.getElementById('mostrarTodosDiasDashboard').checked = false;
        mostrarTodosDiasDashboard = false;
        atualizarGrafico();
    }
}

// Função para alternar entre mostrar todos os dias ou dias selecionados na aba Dashboard
function toggleMostrarTodosDiasDashboard() {
    mostrarTodosDiasDashboard = document.getElementById('mostrarTodosDiasDashboard').checked;
    if (mostrarTodosDiasDashboard) {
        diasSelecionadosDashboard = [];
    } else {
        diasSelecionadosDashboard = getUltimosQuatroDias();
    }
    atualizarGrafico();
}

// Função para limpar a lista de atendimentos
function limparAtendimentos() {
    if (confirm('Tem certeza que deseja limpar todos os atendimentos? Esta ação não pode ser desfeita.')) {
        atendimentos = [];
        localStorage.removeItem('atendimentos');
        renderAtendimentosTable();
        atualizarGrafico();
        atualizarContadores();
        mostrarMensagemSucesso('Todos os atendimentos foram limpos com sucesso!');
        currentPage = 1;
        document.getElementById('mostrarTodos').checked = false;
        showAll = false;
        diasSelecionadosAtendimentos = getUltimosQuatroDias();
        document.getElementById('mostrarTodosDiasAtendimentos').checked = false;
        mostrarTodosDiasAtendimentos = false;
        diasSelecionadosDashboard = getUltimosQuatroDias();
        document.getElementById('mostrarTodosDiasDashboard').checked = false;
    }
}

// Função para exibir o conteúdo da aba selecionada e manter a aba ativa após atualização da página
function showTabContent(tabId) {
    var tabs = document.getElementsByClassName('tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    document.getElementById(tabId).classList.add('active');
    localStorage.setItem('activeTab', tabId);
    if (tabId === 'atendimentos') {
        renderAtendimentosTable();
    } else if (tabId === 'dashboard') {
        atualizarGrafico();
    } else if (tabId === 'checklist') {
        checkFirstOpen(); // Verifica mensagem inicial ao abrir a aba Checklist
    }
}

// Função para carregar atendimentos do localStorage
function carregarAtendimentos() {
    atendimentos = JSON.parse(localStorage.getItem('atendimentos')) || [];
    renderAtendimentosTable();
}

// Função para manter a aba ativa após a atualização da página
window.onload = function() {
    var activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
        showTabContent(activeTab);
    } else {
        showTabContent('checklist');
    }

    carregarAtendimentos();
    atualizarGrafico();
    atualizarContadores();

    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const filtroDataAtendimentos = document.getElementById('filtroDataAtendimentos');
    if (filtroDataAtendimentos) {
        filtroDataAtendimentos.min = `${primeiroDia.getFullYear()}-${(primeiroDia.getMonth() + 1).toString().padStart(2, '0')}-01`;
        filtroDataAtendimentos.max = `${ultimoDia.getFullYear()}-${(ultimoDia.getMonth() + 1).toString().padStart(2, '0')}-${ultimoDia.getDate().toString().padStart(2, '0')}`;
    }

    const filtroDataDashboard = document.getElementById('filtroDataDashboard');
    if (filtroDataDashboard) {
        filtroDataDashboard.min = `${primeiroDia.getFullYear()}-${(primeiroDia.getMonth() + 1).toString().padStart(2, '0')}-01`;
        filtroDataDashboard.max = `${ultimoDia.getFullYear()}-${(ultimoDia.getMonth() + 1).toString().padStart(2, '0')}-${ultimoDia.getDate().toString().padStart(2, '0')}`;
    }

    const mostrarTodosDiasAtendimentosCheckbox = document.getElementById('mostrarTodosDiasAtendimentos');
    if (mostrarTodosDiasAtendimentosCheckbox) {
        mostrarTodosDiasAtendimentosCheckbox.checked = mostrarTodosDiasAtendimentos;
    }

    const mostrarTodosDiasDashboardCheckbox = document.getElementById('mostrarTodosDiasDashboard');
    if (mostrarTodosDiasDashboardCheckbox) {
        mostrarTodosDiasDashboardCheckbox.checked = mostrarTodosDiasDashboard;
    }

    // Iniciar verificação do horário de lembrete
    setInterval(checkReminderTime, 60000); // Verifica a cada minuto
}

// Função para verificar se a data é hoje
function ehHoje(data) {
    var hoje = new Date();
    var partesData = data.split('/');
    var dia = parseInt(partesData[0], 10);
    var mes = parseInt(partesData[1], 10) - 1;
    var ano = hoje.getFullYear();
    var dataAtendimento = new Date(ano, mes, dia);
    return dataAtendimento.toDateString() === hoje.toDateString();
}

// Função para enviar o protocolo
function enviarProtocolo(tipo) {
    var protocoloInput = document.getElementById('protocolo' + tipo.charAt(0).toUpperCase() + tipo.slice(1));
    var protocolo = protocoloInput.value.trim();

    if (protocolo === "") {
        alert('Por favor, insira um protocolo válido.');
        return;
    }

    if (protocoloDuplicado(protocolo)) {
        alert('Protocolo duplicado. Por favor, insira um protocolo único.');
        return;
    }

    adicionarAtendimento(tipo, protocolo);
    mostrarMensagemSucesso('Atendimento ' + tipo + ' enviado com sucesso!');
    protocoloInput.value = '';
    atualizarGrafico();
    atualizarContadores();

    // Exibir mensagem de progresso no pop-up
    const dailyCount = countDailyAttendances();
    showPopupMessage(getProgressMessage(dailyCount));
}

// Função para verificar se o protocolo é duplicado
function protocoloDuplicado(protocolo) {
    return atendimentos.some(atendimento => atendimento.protocolo === protocolo);
}

// Função para adicionar atendimento à tabela e salvar no localStorage
function adicionarAtendimento(tipo, protocolo) {
    var dataHoraAtual = new Date().toLocaleString('pt-BR');
    var dataHoraFormatada = formatarData(dataHoraAtual.split(' ')[0]) + ' ' + dataHoraAtual.split(' ')[1];
    atendimentos.push({
        tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
        protocolo: protocolo,
        dataHora: dataHoraFormatada
    });
    salvarAtendimentos();
    renderAtendimentosTable();
}

// Função para remover um atendimento da tabela
function removerAtendimento(index) {
    atendimentos.splice(index, 1);
    salvarAtendimentos();
    renderAtendimentosTable();
    atualizarGrafico();
    atualizarContadores();
}

// Função para mostrar a mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    var successMessage = document.getElementById('successMessage');
    successMessage.innerText = mensagem;
    successMessage.classList.add('active');
    setTimeout(function() {
        successMessage.classList.remove('active');
    }, 3000);
}

// Função para atualizar o gráfico com filtro de dias
function atualizarGrafico() {
    var datas = {};

    for (var i = 0; i < atendimentos.length; i++) {
        var dataHora = atendimentos[i].dataHora.split(' ')[0];
        var dataFormatada = formatarData(dataHora);

        if (!mostrarTodosDiasDashboard && diasSelecionadosDashboard.length > 0 && !diasSelecionadosDashboard.includes(dataFormatada)) {
            continue;
        }

        if (!datas[dataFormatada]) {
            datas[dataFormatada] = 0;
        }
        datas[dataFormatada]++;
    }

    var svg = document.getElementById('myChart');
    svg.innerHTML = '';

    var larguraBarra = 40;
    var espacoEntreBarras = 20;
    var alturaMaxima = 300;
    var x = 0;

    Object.keys(datas).sort().forEach(function(data) {
        var altura = datas[data] * (alturaMaxima / Math.max(...Object.values(datas), 1));
        var y = alturaMaxima - altura;

        var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', larguraBarra);
        rect.setAttribute('height', altura);
        rect.setAttribute('class', 'bar');
        svg.appendChild(rect);

        var quantidadeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        quantidadeText.setAttribute('x', x + larguraBarra / 2);
        var textY = y - 5;
        if (textY < 15) {
            textY = y + 15;
            quantidadeText.setAttribute('fill', 'white');
        }
        quantidadeText.setAttribute('y', textY);
        quantidadeText.setAttribute('class', 'axis');
        quantidadeText.setAttribute('text-anchor', 'middle');
        quantidadeText.textContent = datas[data];
        svg.appendChild(quantidadeText);

        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + larguraBarra / 2);
        text.setAttribute('y', alturaMaxima + 20);
        text.setAttribute('class', 'axis');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = data;
        svg.appendChild(text);

        x += larguraBarra + espacoEntreBarras;
    });

    var eixoX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    eixoX.setAttribute('x1', 0);
    eixoX.setAttribute('y1', alturaMaxima);
    eixoX.setAttribute('x2', x);
    eixoX.setAttribute('y2', alturaMaxima);
    eixoX.setAttribute('class', 'axis');
    svg.appendChild(eixoX);

    var eixoY = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    eixoY.setAttribute('x1', 0);
    eixoY.setAttribute('y1', 0);
    eixoY.setAttribute('x2', 0);
    eixoY.setAttribute('y2', alturaMaxima);
    eixoY.setAttribute('class', 'axis');
    svg.appendChild(eixoY);
}

// Função para atualizar os contadores de atendimentos
function atualizarContadores() {
    var totalInterno = 0;
    var totalExterno = 0;

    for (var i = 0; i < atendimentos.length; i++) {
        var tipo = atendimentos[i].tipo.toLowerCase();
        if (tipo === 'interno') {
            totalInterno++;
        } else if (tipo === 'externo') {
            totalExterno++;
        }
    }

    var totalGeral = totalInterno + totalExterno;

    document.getElementById('contadorInterno').innerText = 'Total Interno: ' + totalInterno;
    document.getElementById('contadorExterno').innerText = 'Total Externo: ' + totalExterno;
    document.getElementById('contadorGeral').innerText = 'Total Geral: ' + totalGeral;

    calcularMediaAtendimentos();
}

// Função para calcular a média de atendimentos diários
function calcularMediaAtendimentos() {
    var diasAtendimento = new Set();
    for (var i = 0; i < atendimentos.length; i++) {
        var dataAtendimento = atendimentos[i].dataHora.split(' ')[0];
        diasAtendimento.add(dataAtendimento);
    }

    const diasUnicos = diasAtendimento.size;
    const mediaAtendimentos = diasUnicos > 0 ? (atendimentos.length / diasUnicos) : 0;
    document.getElementById('contadorMedia').textContent = `Média de Atendimentos Diários: ${mediaAtendimentos.toFixed(2)}`;
}

// Função para formatar a data para o formato dia/mês
function formatarData(dataHora) {
    var partesData = dataHora.split('/');
    var dia = partesData[0];
    var mes = partesData[1];
    return `${dia}/${mes}`;
}

// Função para salvar atendimentos no localStorage
function salvarAtendimentos() {
    localStorage.setItem('atendimentos', JSON.stringify(atendimentos));
}

// Função para gerar o relatório em PDF
function gerarRelatorioPDF() {
    var { jsPDF } = window.jspdf;
    var doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Relatório de Atendimentos Mensais", 10, 10);

    var totalInterno = document.getElementById('contadorInterno').innerText;
    var totalExterno = document.getElementById('contadorExterno').innerText;
    var totalGeral = document.getElementById('contadorGeral').innerText;

    doc.setFontSize(12);
    doc.text(totalInterno, 10, 20);
    doc.text(totalExterno, 10, 30);
    doc.text(totalGeral, 10, 40);

    var headers = [["Tipo de Atendimento", "Protocolo", "Data e Hora"]];
    var dados = atendimentos.map(atendimento => [
        atendimento.tipo,
        atendimento.protocolo,
        atendimento.dataHora
    ]);

    doc.autoTable({
        head: headers,
        body: dados,
        startY: 50,
    });

    doc.save('Relatorio_Atendimentos_Mensais.pdf');
}
