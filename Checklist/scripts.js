let atendimentos = JSON.parse(localStorage.getItem('atendimentos')) || [];
let currentPage = 1;
const itemsPerPage = 10;
let showAll = false;

// Função para renderizar a tabela com paginação
function renderAtendimentosTable() {
    const tableBody = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    let filteredAtendimentos = atendimentos;
    // Aplicar filtro de atendimentos anteriores, se ativo
    const botao = document.getElementById('toggleAtendimentosAnteriores');
    const ocultar = botao.innerText.includes('Ocultar');

    if (ocultar) {
        filteredAtendimentos = atendimentos.filter(atendimento => {
            const dataAtendimento = atendimento.dataHora.split(' ')[0];
            return ehHoje(dataAtendimento);
        });
    }

    let dataToShow = filteredAtendimentos;
    let startIndex = 0;
    if (!showAll) {
        startIndex = (currentPage - 1) * itemsPerPage;
        const end = startIndex + itemsPerPage;
        dataToShow = filteredAtendimentos.slice(startIndex, end);
    }

    dataToShow.forEach((atendimento, localIndex) => {
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
    const totalPages = Math.ceil(atendimentos.length / itemsPerPage);
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

    // Restaurar o estado do botão de exibição/ocultação dos atendimentos anteriores
    restaurarEstadoBotaoAtendimentos();
}

// Função para alternar a exibição dos atendimentos anteriores
function toggleAtendimentosAnteriores() {
    var botao = document.getElementById('toggleAtendimentosAnteriores');
    var ocultar = botao.innerText.includes('Ocultar');
    botao.innerText = ocultar ? 'Exibir Atendimentos Anteriores' : 'Ocultar Atendimentos Anteriores';
    localStorage.setItem('botaoOcultarAtendimentos', ocultar ? 'exibir' : 'ocultar');
    currentPage = 1; // Resetar página ao mudar filtro
    renderAtendimentosTable();
}

// Função para restaurar o estado do botão de exibição/ocultação ao carregar a página
function restaurarEstadoBotaoAtendimentos() {
    var estadoBotao = localStorage.getItem('botaoOcultarAtendimentos');
    if (estadoBotao === 'exibir') {
        toggleAtendimentosAnteriores();
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

// Função para atualizar o gráfico com a opção de ocultar dias anteriores
function atualizarGrafico(ocultarDiasAnteriores = false) {
    var datas = {};

    for (var i = 0; i < atendimentos.length; i++) {
        var dataHora = atendimentos[i].dataHora.split(' ')[0];
        if (ocultarDiasAnteriores && !ehHoje(dataHora)) {
            continue; // Pula os dias anteriores se a opção estiver ativa
        }

        var dataFormatada = formatarData(dataHora);

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

    Object.keys(datas).forEach(function(data) {
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

// Função para alternar a exibição dos dias anteriores no gráfico
function toggleDiasAnteriores() {
    var botao = document.getElementById('toggleDiasAnteriores');
    var ocultar = botao.innerText.includes('Ocultar');

    atualizarGrafico(ocultar);
    botao.innerText = ocultar ? 'Exibir Dias Anteriores' : 'Ocultar Dias Anteriores';
}
