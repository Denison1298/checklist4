let atendimentos = JSON.parse(localStorage.getItem('atendimentos')) || [];
let currentPage = 1;
const itemsPerPage = 10;
let showAll = false;
let mostrarTodosDiasAtendimentos = false; // Para a aba Atendimentos Mensais
let diasSelecionadosAtendimentos = getUltimosQuatroDias(); // Últimos 4 dias por padrão
let mostrarTodosDiasDashboard = false; // Para a aba Dashboard
let diasSelecionadosDashboard = getUltimosQuatroDias(); // Últimos 4 dias por padrão

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

    // Filtrar atendimentos por dias selecionados
    let filteredAtendimentos = atendimentos;
    if (!mostrarTodosDiasAtendimentos && diasSelecionadosAtendimentos.length > 0) {
        filteredAtendimentos = atendimentos.filter(atendimento => {
            const dataAtendimento = atendimento.dataHora.split(' ')[0];
            return diasSelecionadosAtendimentos.includes(dataAtendimento);
        });
    }

    // Determinar quais atendimentos exibir com base na paginação
    let dataToShow = filteredAtendimentos;
    let startIndex = 0;
    if (!showAll) {
        startIndex = (currentPage - 1) * itemsPerPage;
        const end = Math.min(startIndex + itemsPerPage, filteredAtendimentos.length);
        dataToShow = filteredAtendimentos.slice(startIndex, end);
    }

    // Renderizar linhas da tabela
    dataToShow.forEach((atendimento) => {
        const globalIndex = atendimentos.indexOf(atendimento); // Índice global para remoção
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${atendimento.tipo}</td>
            <td>${atendimento.protocolo}</td>
            <td>${atendimento.dataHora}</td>
            <td><button class="remove-btn" onclick="removerAtendimento(${globalIndex})">Remover</button></td>
        `;
        tableBody.appendChild(row);
    });

    // Atualizar controles de paginação
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
    currentPage = 1; // Volta para a primeira página
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
        currentPage = 1; // Resetar página
        renderAtendimentosTable();
    }
}

// Função para alternar entre mostrar todos os dias ou dias selecionados na aba Atendimentos Mensais
function toggleMostrarTodosDiasAtendimentos() {
    mostrarTodosDiasAtendimentos = document.getElementById('mostrarTodosDiasAtendimentos').checked;
    if (mostrarTodosDiasAtendimentos) {
        diasSelecionadosAtendimentos = []; // Limpa filtro de dias
    } else {
        diasSelecionadosAtendimentos = getUltimosQuatroDias(); // Volta para os últimos 4 dias
    }
    currentPage = 1; // Resetar página
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
        diasSelecionadosDashboard = []; // Limpa filtro de dias
    } else {
        diasSelecionadosDashboard = getUltimosQuatroDias(); // Volta para os últimos 4 dias
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
        mostrarTodosDiasDashboard = false;
    }
}

// Função para exibir o conteúdo da aba selecionada e manter a aba ativa após atualização da página
function showTabContent(tabId) {
    var tabs = document.getElementsByClassName('tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    document.getElementById(tabId).classList.add('active');
    localStorage.setItem('activeTab', tabId); // Salvar a aba ativa
    if (tabId === 'atendimentos') {
        renderAtendimentosTable(); // Atualizar tabela ao mudar para a aba Atendimentos
    } else if (tabId === 'dashboard') {
        atualizarGrafico(); // Atualizar gráfico ao mudar para a aba Dashboard
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
        showTabContent('checklist'); // Aba padrão
    }
    
    // Carregar atendimentos e atualizar o gráfico e contadores
    carregarAtendimentos();
    atualizarGrafico();
    atualizarContadores();

    // Configurar os inputs de data para limitar ao mês atual
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

    // Restaurar o estado dos checkboxes
    const mostrarTodosDiasAtendimentosCheckbox = document.getElementById('mostrarTodosDiasAtendimentos');
    if (mostrarTodosDiasAtendimentosCheckbox) {
        mostrarTodosDiasAtendimentosCheckbox.checked = mostrarTodosDiasAtendimentos;
    }

    const mostrarTodosDiasDashboardCheckbox = document.getElementById('mostrarTodosDiasDashboard');
    if (mostrarTodosDiasDashboardCheckbox) {
        mostrarTodosDiasDashboardCheckbox.checked = mostrarTodosDiasDashboard;
    }
}

// Função para verificar se a data é hoje
function ehHoje(data) {
    var hoje = new Date();
    var partesData = data.split('/');
    var dia = parseInt(partesData[0], 10);
    var mes = parseInt(partesData[1], 10) - 1; // Meses em JavaScript são baseados em zero
    var ano = hoje.getFullYear(); // Considerando que o ano seja o atual

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

        // Filtrar por dias selecionados, se não mostrar todos os dias
        if (!mostrarTodosDiasDashboard && diasSelecionadosDashboard.length > 0 && !diasSelecionadosDashboard.includes(dataFormatada)) {
            continue;
        }

        if (!datas[dataFormatada]) {
            datas[dataFormatada] = 0;
        }
        datas[dataFormatada]++;
    }

    // Restante do código para desenhar o gráfico
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

    // Atualiza os contadores no HTML
    document.getElementById('contadorInterno').innerText = 'Total Interno: ' + totalInterno;
    document.getElementById('contadorExterno').innerText = 'Total Externo: ' + totalExterno;
    document.getElementById('contadorGeral').innerText = 'Total Geral: ' + totalGeral;

    // Calcular e exibir a média de atendimentos diários
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

// Função para gerar o relatório em PDF (sem o gráfico)
function gerarRelatorioPDF() {
    var { jsPDF } = window.jspdf;
    var doc = new jsPDF();

    // Adicionar título
    doc.setFontSize(16);
    doc.text("Relatório de Atendimentos Mensais", 10, 10);

    // Adicionar contadores
    var totalInterno = document.getElementById('contadorInterno').innerText;
    var totalExterno = document.getElementById('contadorExterno').innerText;
    var totalGeral = document.getElementById('contadorGeral').innerText;

    doc.setFontSize(12);
    doc.text(totalInterno, 10, 20);
    doc.text(totalExterno, 10, 30);
    doc.text(totalGeral, 10, 40);

    // Adicionar a tabela de atendimentos
    var headers = [["Tipo de Atendimento", "Protocolo", "Data e Hora"]];
    var dados = atendimentos.map(atendimento => [
        atendimento.tipo,
        atendimento.protocolo,
        atendimento.dataHora
    ]);

    // Adicionar a tabela ao PDF
    doc.autoTable({
        head: headers,
        body: dados,
        startY: 50,
    });

    // Baixar o PDF
    doc.save('Relatorio_Atendimentos_Mensais.pdf');
}

// Meta diária e horários
const META_DIARIA = 30;
const HORARIO_SAIDA = "16:20";
const HORARIO_ALERTA = "16:15";

// Função para exibir o popup
function showPopup(message, duration = 3000) {
    const popup = document.getElementById("popupMessage");
    popup.innerText = message;
    popup.style.display = "block";

    setTimeout(() => {
        popup.style.display = "none";
        popup.innerText = "";
    }, duration);
}

// Função para verificar se é a primeira abertura do dia
function checkFirstOpenToday() {
    const today = new Date().toLocaleDateString("pt-BR");
    const lastOpened = localStorage.getItem("lastOpenedDate");

    if (lastOpened !== today) {
        showPopup("Bom dia, ótimo dia de trabalho e bora bater a meta!", 5000);
        localStorage.setItem("lastOpenedDate", today);
    }
}

// Função para contar atendimentos do dia atual
function getDailyAttendanceCount() {
    const today = new Date().toLocaleDateString("pt-BR");
    const atendimentos = JSON.parse(localStorage.getItem("atendimentos") || "[]");
    return atendimentos.filter(atendimento => {
        const dataAtendimento = new Date(atendimento.data).toLocaleDateString("pt-BR");
        return dataAtendimento === today;
    }).length;
}

// Função para mostrar mensagem de progresso da meta
function showGoalMessage() {
    const atendimentosHoje = getDailyAttendanceCount();
    const faltam = META_DIARIA - atendimentosHoje;
    const now = new Date();
    const isAfter16 = now.getHours() >= 16;

    let message = "";
    if (faltam > 0 && !isAfter16) {
        message = `Falta ${faltam} atendimento(s) para bater a meta diária.`;
    } else if (faltam > 0 && isAfter16) {
        message = `Atenção, falta ${faltam} atendimento(s) e está perto do final do expediente!`;
    } else if (faltam === 0) {
        message = "Pode relaxar, você já bateu a meta!";
    } else {
        message = `Pode relaxar, você já bateu a meta e passou ${Math.abs(faltam)}!`;
    }

    showPopup(message, 4000);
}

// Função para verificar mensagem de fim de expediente
function checkEndOfDayMessage() {
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const isSaturday = now.getDay() === 6;

    if (time === HORARIO_ALERTA) {
        const message = isSaturday
            ? "Ótimo final de semana, até segunda!"
            : "Seu expediente está chegando ao fim, ótimo descanso!";
        showPopup(message, 5000);
    }
}

// Função para enviar protocolo
function enviarProtocolo(tipo) {
    const protocoloInput = document.getElementById(`protocolo${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    const protocolo = protocoloInput.value.trim();

    if (protocolo) {
        const atendimentos = JSON.parse(localStorage.getItem("atendimentos") || "[]");
        atendimentos.push({
            tipo: tipo,
            protocolo: protocolo,
            data: new Date().toISOString()
        });
        localStorage.setItem("atendimentos", JSON.stringify(atendimentos));
        protocoloInput.value = "";
        showGoalMessage();
    } else {
        showPopup("Por favor, digite um protocolo válido.", 3000);
    }
}

// Função para desenhar o relógio analógico
function drawClock() {
    const canvas = document.getElementById("clockCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const radius = canvas.width / 2;
    ctx.translate(radius, radius);
    const now = new Date();

    // Fundo
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.9, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Marcadores de hora
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * Math.PI / 180;
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.85);
        ctx.lineTo(0, -radius * 0.75);
        ctx.stroke();
        ctx.rotate(Math.PI / 6);
    }

    // Ponteiros
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Ponteiro de horas
    ctx.save();
    ctx.rotate((hours * 30 + minutes / 2) * Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.5);
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Ponteiro de minutos
    ctx.save();
    ctx.rotate(minutes * 6 * Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.7);
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Ponteiro de segundos
    ctx.save();
    ctx.rotate(seconds * 6 * Math.PI / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius * 0.8);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Função para atualizar o relógio digital e o contador
function updateClock() {
    const now = new Date();
    const digitalClock = document.getElementById("digitalClock");
    const shiftCountdown = document.getElementById("shiftCountdown");

    // Relógio digital
    const time = now.toTimeString().slice(0, 5);
    digitalClock.innerText = `Horário: ${time}`;

    // Contador regressivo até 16:20
    const today = now.toDateString();
    const endTime = new Date(`${today} 16:20:00`);
    const timeDiff = endTime - now;

    if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        shiftCountdown.innerText = `Fim do turno: ${hours}h ${minutes}m`;
    } else {
        shiftCountdown.innerText = "Turno encerrado";
    }

    drawClock();
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    checkFirstOpenToday();
    setInterval(checkEndOfDayMessage, 60000);
    setInterval(updateClock, 1000);
    updateClock();
});
