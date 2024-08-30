// Função para limpar a lista de atendimentos
function limparAtendimentos() {
    var tabela = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';  // Limpa o conteúdo da tabela

// Função para exibir o conteúdo da aba selecionada e manter a aba ativa após atualização da página
function showTabContent(tabId) {
    var tabs = document.getElementsByClassName('tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    document.getElementById(tabId).classList.add('active');
    localStorage.setItem('activeTab', tabId);  // Salvar a aba ativa
}

// Função para manter a aba ativa após a atualização da página
window.onload = function() {
    var activeTab = localStorage.getItem('activeTab');
    if (activeTab) {
        showTabContent(activeTab);
    } else {
        showTabContent('checklist');  // Aba padrão
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
    var linhas = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    var botao = document.getElementById('toggleAtendimentosAnteriores');
    var ocultar = botao.innerText.includes('Ocultar');

    for (var i = 0; i < linhas.length; i++) {
        var dataAtendimento = linhas[i].cells[2].innerText.split(' ')[0];
        if (!ehHoje(dataAtendimento)) {
            linhas[i].style.display = ocultar ? 'none' : '';
        }
    }

    botao.innerText = ocultar ? 'Exibir Atendimentos Anteriores' : 'Ocultar Atendimentos Anteriores';

    // Salvar estado do botão no localStorage
    localStorage.setItem('botaoOcultarAtendimentos', ocultar ? 'exibir' : 'ocultar');
}

// Função para restaurar o estado do botão de exibição/ocultação ao carregar a página
function restaurarEstadoBotaoAtendimentos() {
    var estadoBotao = localStorage.getItem('botaoOcultarAtendimentos');
    if (estadoBotao === 'exibir') {
        toggleAtendimentosAnteriores(); // Isso garante que, se o estado for "exibir", ele restaura a visibilidade conforme esperado.
    }
}

// Função para verificar se a data é hoje
function ehHoje(data) {
    var hoje = new Date();
    var partesData = data.split('/');
    var dia = parseInt(partesData[0], 10);
    var mes = parseInt(partesData[1], 10) - 1;  // Meses em JavaScript são baseados em zero
    var ano = hoje.getFullYear();  // Considerando que o ano seja o atual

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
    var linhas = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var i = 0; i < linhas.length; i++) {
        var protocoloExistente = linhas[i].cells[1].innerText;
        if (protocoloExistente === protocolo) {
            return true;
        }
    }
    return false;
}

// Função para adicionar atendimento à tabela e salvar no localStorage
function adicionarAtendimento(tipo, protocolo) {
    var tabela = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0];
    var novaLinha = tabela.insertRow();
    var celulaTipo = novaLinha.insertCell(0);
    var celulaProtocolo = novaLinha.insertCell(1);
    var celulaDataHora = novaLinha.insertCell(2);
    var celulaAcoes = novaLinha.insertCell(3);

    var dataHoraAtual = new Date().toLocaleString('pt-BR');
    var dataHoraFormatada = formatarData(dataHoraAtual.split(' ')[0]);

    celulaTipo.innerText = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    celulaProtocolo.innerText = protocolo;
    celulaDataHora.innerText = dataHoraFormatada + ' ' + dataHoraAtual.split(' ')[1];
    celulaAcoes.innerHTML = '<button class="remove-btn" onclick="removerAtendimento(this)">Remover</button>';

    salvarAtendimentos();
}

// Função para remover um atendimento da tabela
function removerAtendimento(botao) {
    var linha = botao.parentNode.parentNode;
    linha.parentNode.removeChild(linha);
    salvarAtendimentos();
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

// Função para carregar atendimentos do localStorage
function carregarAtendimentos() {
    var atendimentos = JSON.parse(localStorage.getItem('atendimentos')) || [];
    var tabela = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';  // Limpar a tabela

    atendimentos.forEach(function(atendimento) {
        var novaLinha = tabela.insertRow();
        var celulaTipo = novaLinha.insertCell(0);
        var celulaProtocolo = novaLinha.insertCell(1);
        var celulaDataHora = novaLinha.insertCell(2);
        var celulaAcoes = novaLinha.insertCell(3);

        celulaTipo.innerText = atendimento.tipo;
        celulaProtocolo.innerText = atendimento.protocolo;
        celulaDataHora.innerText = atendimento.dataHora;
        celulaAcoes.innerHTML = '<button class="remove-btn" onclick="removerAtendimento(this)">Remover</button>';
    });
}

// Função para atualizar o gráfico com a opção de ocultar dias anteriores
function atualizarGrafico(ocultarDiasAnteriores = false) {
    var atendimentos = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    var datas = {};

    for (var i = 0; i < atendimentos.length; i++) {
        var dataHora = atendimentos[i].cells[2].innerText.split(' ')[0];
        if (ocultarDiasAnteriores && !ehHoje(dataHora)) {
            continue;  // Pula os dias anteriores se a opção estiver ativa
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
        var altura = datas[data] * (alturaMaxima / Math.max(...Object.values(datas)));
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
    var atendimentos = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    var totalInterno = 0;
    var totalExterno = 0;

    for (var i = 0; i < atendimentos.length; i++) {
        var tipo = atendimentos[i].cells[0].innerText.toLowerCase();
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
    var atendimentos = [];
    var linhas = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    for (var i = 0; i < linhas.length; i++) {
        var tipo = linhas[i].cells[0].innerText;
        var protocolo = linhas[i].cells[1].innerText;
        var dataHora = linhas[i].cells[2].innerText;
        atendimentos.push({ tipo, protocolo, dataHora });
    }
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
    var tabela = document.getElementById('atendimentosTable').getElementsByTagName('tbody')[0];
    var linhas = tabela.getElementsByTagName('tr');

    // Cabeçalhos da tabela
    var headers = [["Tipo de Atendimento", "Protocolo", "Data e Hora"]];

    // Conteúdo da tabela
    var dados = [];
    for (var i = 0; i < linhas.length; i++) {
        var linha = linhas[i];
        var tipo = linha.cells[0].innerText;
        var protocolo = linha.cells[1].innerText;
        var dataHora = linha.cells[2].innerText;
        dados.push([tipo, protocolo, dataHora]);
    }

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
