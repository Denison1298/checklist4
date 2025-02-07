document.addEventListener("DOMContentLoaded", function () {
    atualizarContadores();
});

// Função para enviar patrimônio para a aba de patrimônios retirados
function enviarPatrimonio(tipo) {
    let inputId = tipo === "ONU" ? "patrimonioonu" : "patrimonioroteador";
    let patrimonio = document.getElementById(inputId).value.trim();

    if (patrimonio === "") {
        alert("Por favor, digite o patrimônio antes de enviar.");
        return;
    }

    let tabela = document.getElementById("patrimoniosTable").getElementsByTagName("tbody")[0];
    let novaLinha = tabela.insertRow();
    let dataHora = new Date().toLocaleString();

    novaLinha.innerHTML = `
        <td>${tipo}</td>
        <td>${patrimonio}</td>
        <td>${dataHora}</td>
    `;

    document.getElementById(inputId).value = ""; // Limpa o campo após o envio

    atualizarContadores();
}

// Atualiza os contadores com base nos patrimônios retirados
function atualizarContadores() {
    let totalInterno = document.querySelectorAll("#patrimoniosTable tbody tr:contains('Interno')").length;
    let totalExterno = document.querySelectorAll("#patrimoniosTable tbody tr:contains('Externo')").length;
    let totalPatrimonios = document.querySelectorAll("#patrimoniosTable tbody tr").length;
    let totalGeral = totalInterno + totalExterno + totalPatrimonios;

    let mediaDiaria = (totalPatrimonios / new Date().getDate()).toFixed(2); // Média por dia

    document.getElementById("contadorInterno").textContent = `Total Interno: ${totalInterno}`;
    document.getElementById("contadorExterno").textContent = `Total Externo: ${totalExterno}`;
    document.getElementById("contadorPatrimonio").textContent = `Total Patrimônios: ${totalPatrimonios}`;
    document.getElementById("contadorGeral").textContent = `Total Geral: ${totalGeral}`;
    document.getElementById("contadorMedia").textContent = `Média de Patrimônios Retirados Por Dia: ${mediaDiaria}`;

    atualizarGrafico();
}

// Cria um gráfico simples na aba "Dashboard Patrimônios"
function atualizarGrafico() {
    let totalInterno = document.getElementById("contadorInterno").textContent.split(": ")[1];
    let totalExterno = document.getElementById("contadorExterno").textContent.split(": ")[1];
    let totalPatrimonios = document.getElementById("contadorPatrimonio").textContent.split(": ")[1];

    let ctx = document.getElementById("graficoPatrimonios").getContext("2d");

    if (window.meuGrafico) {
        window.meuGrafico.destroy(); // Remove o gráfico anterior para atualizar
    }

    window.meuGrafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Interno", "Externo", "Total Patrimônios"],
            datasets: [{
                label: "Quantidade",
                data: [totalInterno, totalExterno, totalPatrimonios],
                backgroundColor: ["#3498db", "#e74c3c", "#2ecc71"]
            }]
        }
    });
}
