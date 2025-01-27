document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("massaLinearChart").getContext("2d");
    const socket = io();
    let chart; // Variável para armazenar a instância do gráfico
    let isUpdatingChart = false;  // Variável para garantir que a atualização do gráfico não seja feita simultaneamente

    // Função para buscar os dados do backend
    function fetchData() {
        if (isUpdatingChart) return;  // Previne que a função seja chamada enquanto está atualizando

        isUpdatingChart = true;  // Marca que está atualizando
        fetch("/data")
            .then(response => {
                if (!response.ok) throw new Error("Erro na resposta do servidor");
                return response.json();
            })
            .then(data => {
                // Verifique se os dados essenciais estão presentes
                if (!data.massa_linear || !data.nucleo || data.massa_linear.length === 0 || data.nucleo.length === 0) {
                    console.warn("Dados insuficientes recebidos para atualizar o gráfico.");
                    return;
                }

                // Pega as últimas 7 horas e valores
                const horas = data.hora.slice(-7);
                const massaLinear = data.massa_linear.slice(-7);
                const nucleo = data.nucleo.slice(-7);
                const normaInternaMin = data.norma_interna_min;
                const normaInternaMax = data.norma_interna_max;
                const normaExternaMin = data.norma_externa_min;
                const normaExternaMax = data.norma_externa_max;
                const normaObjetivadaMin = data.norma_objetivada_min;
                const normaObjetivadaMax = data.norma_objetivada_max;

                // Atualiza o gráfico
                updateChart(
                    horas,
                    massaLinear,
                    nucleo,
                    normaInternaMin,
                    normaInternaMax,
                    normaExternaMin,
                    normaExternaMax,
                    normaObjetivadaMin,
                    normaObjetivadaMax
                );

                // Atualiza as informações
                updateInfo(data);  // Passa todos os dados para garantir que a UI seja atualizada corretamente

                // Envia os dados atualizados para o WebSocket
                socket.emit('data-update', data);
            })
            .catch(error => console.error("Erro ao carregar os dados:", error))
            .finally(() => {
                isUpdatingChart = false;  // Libera a próxima atualização
            });
    }

    // Função para atualizar o gráfico
    // Função para atualizar o gráfico
function updateChart(horas, massaLinear, nucleo, normaInternaMin, normaInternaMax, normaExternaMin, normaExternaMax, normaObjetivadaMin, normaObjetivadaMax) {
    if (chart) {
        // Atualizar os dados do gráfico existente
        chart.data.labels = horas;
        chart.data.datasets[0].data = massaLinear;
        chart.data.datasets[1].data = horas.map(() => normaInternaMin);
        chart.data.datasets[2].data = horas.map(() => normaInternaMax);
        chart.data.datasets[3].data = horas.map(() => normaExternaMin);
        chart.data.datasets[4].data = horas.map(() => normaExternaMax);
        chart.data.datasets[5].data = horas.map(() => normaObjetivadaMin);
        chart.data.datasets[6].data = horas.map(() => normaObjetivadaMax);

        // Atualizar a anotação do núcleo

        chart.update();
    } else {
        // Criar o gráfico pela primeira vez
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: horas,
                datasets: [
                    {
                        label: "Massa Atual",
                        data: massaLinear,
                        borderColor: "blue",
                        backgroundColor: "rgba(0, 0, 255, 0.1)",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "AVB (Mínima)",
                        data: horas.map(() => normaInternaMin),
                        borderColor: "green",
                        backgroundColor: "green",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4,
                    },
                    {
                        label: "AVB (Máxima)",
                        data: horas.map(() => normaInternaMax),
                        borderColor: "green",
                        backgroundColor: "green",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4,
                    },
                    {
                        label: "ABNT (Mínima)",
                        data: horas.map(() => normaExternaMin),
                        borderColor: "red",
                        backgroundColor: "red",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4,
                    },
                    {
                        label: "ABNT (Máxima)",
                        data: horas.map(() => normaExternaMax),
                        borderColor: "red",
                        backgroundColor: "red",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4,
                    },
                    {
                        label: "Massa Objetivada (Mínima)",
                        data: horas.map(() => normaObjetivadaMin),
                        borderColor: "purple",
                        backgroundColor: "purple",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4,
                    },
                    {
                        label: "Massa Objetivada (Máxima)",
                        data: horas.map(() => normaObjetivadaMax),
                        borderColor: "purple",
                        backgroundColor: "purple",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 60,
                        left: 60,
                        rigth: 60
                    },
                },
                devicePixelRatio: window.devicePixelRatio || 1,
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            usePointStyle: true,
                        },
                    },
                    datalabels: {
                        display: true,
                        color: "blue",
                        align: "top",
                        font: {
                            weight: 'bold',
                            size: 16,
                        },
                        formatter: (value, context) => {
                            if (context.dataset.label === "Massa Atual") {
                                const index = context.dataIndex;
                                const massa = value ? value.toFixed(2) : "N/A";
                                const nucleoValue = nucleo && nucleo[index] !== undefined ? nucleo[index].toFixed(2) : "N/A";
                                return `${massa} g/mm | Núc: ${nucleoValue} mm`;
                            }
                            return null;
                        }
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: false,
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Massa Linear (kg/m)",
                            font: {
                                weight: 'bold',
                                size: 16,
                            }
                        },
                    },
                },
                suggestedMax: 10 * Math.max(...massaLinear),
            },
            plugins: [ChartDataLabels]
        });
    }
}

// Função para atualizar as informações
function updateInfo(data) {
    console.log("Atualizando as informações:", data); // Log para depuração

    // Atualiza o valor da massa atual
    const massaAtualEl = document.querySelector("#massaAtual .info-value");
    if (massaAtualEl) {
        massaAtualEl.textContent = data.massa_linear.slice(-1)[0].toFixed(2) + " kg/m";
    }

    // Atualiza o valor do núcleo
    const nucleoEl = document.querySelector("#nucleo .info-value");
    if (nucleoEl) {
        nucleoEl.textContent = data.nucleo.slice(-1)[0].toFixed(2) + " mm";
    }

    // Atualiza outras informações
    const massaMediaEl = document.querySelector(".informacoes:nth-child(2) .info-value");
    if (massaMediaEl) {
        massaMediaEl.textContent = (data.massa_linear.reduce((a, b) => a + b, 0) / data.massa_linear.length).toFixed(2) + " kg/m";
    }

    const massaMaxEl = document.querySelector(".informacoes:nth-child(3) .info-value");
    if (massaMaxEl) {
        massaMaxEl.textContent = Math.max(...data.massa_linear).toFixed(2) + " kg/m";
    }

    const massaMinEl = document.querySelector(".informacoes:nth-child(4) .info-value");
    if (massaMinEl) {
        massaMinEl.textContent = Math.min(...data.massa_linear).toFixed(2) + " kg/m";
    }

    // Atualizações de normas
    const normaInternaMinEl = document.querySelector(".informacoes:nth-child(5) .info-value");
    if (normaInternaMinEl) {
        normaInternaMinEl.textContent = data.norma_interna_min ? data.norma_interna_min.toFixed(2) + " kg/m" : "N/A";
    }

    const normaInternaMaxEl = document.querySelector(".informacoes:nth-child(6) .info-value");
    if (normaInternaMaxEl) {
        normaInternaMaxEl.textContent = data.norma_interna_max ? data.norma_interna_max.toFixed(2) + " kg/m" : "N/A";
    }

    const normaExternaMinEl = document.querySelector(".informacoes:nth-child(7) .info-value");
    if (normaExternaMinEl) {
        normaExternaMinEl.textContent = data.norma_externa_min ? data.norma_externa_min.toFixed(2) + " kg/m" : "N/A";
    }

    const normaExternaMaxEl = document.querySelector(".informacoes:nth-child(8) .info-value");
    if (normaExternaMaxEl) {
        normaExternaMaxEl.textContent = data.norma_externa_max ? data.norma_externa_max.toFixed(2) + " kg/m" : "N/A";
    }
}


    // Inicializa o carregamento dos dados periodicamente
    fetchData();
    setInterval(fetchData, 30000);  // Atualiza a cada 30 segundos

    // Escuta atualizações via WebSocket e atualiza a tela
    socket.on('data-update', (data) => {
        console.log("Dados recebidos via WebSocket:", data);
        updateInfo(data);
        updateChart(data.hora.slice(-7), data.massa_linear.slice(-7), data.nucleo.slice(-7), data.norma_interna_min, data.norma_interna_max, data.norma_externa_min, data.norma_externa_max, data.norma_objetivada_min, data.norma_objetivada_max);
    });
});
