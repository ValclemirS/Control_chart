document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("massaLinearChart").getContext("2d");
    const socket = io();
    let chart; // Variável para armazenar a instância do gráfico

    // Função para buscar os dados do backend
    function fetchData() {
        fetch("/data")
            .then(response => response.json())
            .then(data => {
                const horas = data.hora.slice(-7); // Pega apenas as últimas 7 horas
                const massaLinear = data.massa_linear.slice(-7); // Pega apenas as últimas 7 massas lineares
                const normaInternaMin = data.norma_interna_min;
                const normaInternaMax = data.norma_interna_max;
                const normaExternaMin = data.norma_externa_min;
                const normaExternaMax = data.norma_externa_max;
                const normaObjetivadaMin = data.norma_objetivada_min;
                const normaObjetivadaMax = data.norma_objetivada_max;

                // Atualizar o gráfico
                updateChart(horas, massaLinear, normaInternaMin, normaInternaMax, normaExternaMin, normaExternaMax, normaObjetivadaMin, normaObjetivadaMax);

                // Atualizar as informações
                updateInfo(data);
            })
            .catch(error => console.error("Erro ao carregar os dados:", error));
    }

    // Função para atualizar o gráfico
    function updateChart(horas, massaLinear, normaInternaMin, normaInternaMax, normaExternaMin, normaExternaMax, normaObjetivadaMin, normaObjetivadaMax) {
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
                            tension: 0.4, // Adiciona suavização (spline)
                        },
                        {
                            label: "AVB (Mínima)",
                            data: horas.map(() => normaInternaMin),
                            borderColor: "green",
                            backgroundColor: "green",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                            tension: 0.4, // Adiciona suavização (spline)
                        },
                        {
                            label: "AVB (Máxima)",
                            data: horas.map(() => normaInternaMax),
                            borderColor: "green",
                            backgroundColor: "green",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                            tension: 0.4, // Adiciona suavização (spline)
                        },
                        {
                            label: "ABNT (Mínima)",
                            data: horas.map(() => normaExternaMin),
                            borderColor: "red",
                            backgroundColor: "red",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                            tension: 0.4, // Adiciona suavização (spline)
                        },
                        {
                            label: "ABNT (Máxima)",
                            data: horas.map(() => normaExternaMax),
                            borderColor: "red",
                            backgroundColor: "red",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                            tension: 0.4, // Adiciona suavização (spline)
                        },
                        {
                            label: "Massa Objetivada (Mínima)",
                            data: horas.map(() => normaObjetivadaMin),
                            borderColor: "purple",
                            backgroundColor: "purple",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                            tension: 0.4, // Adiciona suavização (spline)
                        },
                        {
                            label: "Massa Objetivada (Máxima)",
                            data: horas.map(() => normaObjetivadaMax),
                            borderColor: "purple",
                            backgroundColor: "purple",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                            tension: 0.4, // Adiciona suavização (spline)
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 30, // Adiciona espaço extra no topo
                        }
                    },
                    devicePixelRatio: window.devicePixelRatio || 1,
                    plugins: {
                        legend: {
                            display: true,
                            position: "bottom", // Mover a legenda para a parte inferior
                            labels: {
                                usePointStyle: true, // Altera os pontos da legenda para quadrados
                            },
                        },
                        datalabels: {
                            display: true,
                            color: "black",
                            align: "top",
                            font: {
                                weight: 'bold'
                            },
                            formatter: function(value, context) {
                                // Exibir os valores apenas para "Massa Atual"
                                return context.dataset.label === "Massa Atual" ? value.toFixed(2) + " kg/m" : null;
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: false,
                                text: "Hora",
                                font: {
                                    weight: 'bold',
                                    size: 30        
                                }
                            },
                           
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Massa Linear (kg/m)",
                                font: {
                                    weight: 'bold',
                                    size: 16        
                                }
                            },
                        },
                    },
                    suggestedMax: 10 * Math.max(...massaLinear), // Aumenta o limite superior
                },
                plugins: [ChartDataLabels]
            });
        }
    }

    // Função para atualizar as informações
    function updateInfo(data) {
        document.querySelector("#massaAtual .info-value").textContent = data.massa_linear.slice(-1)[0].toFixed(2) + " kg/m";
        document.querySelector(".informacoes:nth-child(2) .info-value").textContent = (data.massa_linear.reduce((a, b) => a + b, 0) / data.massa_linear.length).toFixed(2) + " kg/m";
        document.querySelector(".informacoes:nth-child(3) .info-value").textContent = Math.max(...data.massa_linear).toFixed(2) + " kg/m";
        document.querySelector(".informacoes:nth-child(4) .info-value").textContent = Math.min(...data.massa_linear).toFixed(2) + " kg/m";
        document.querySelector(".informacoes:nth-child(5) .info-value").textContent = data.norma_interna_min ? data.norma_interna_min.toFixed(2) + " kg/m" : "N/A";
        document.querySelector(".informacoes:nth-child(6) .info-value").textContent = data.norma_interna_max ? data.norma_interna_max.toFixed(2) + " kg/m" : "N/A";
        document.querySelector(".informacoes:nth-child(7) .info-value").textContent = data.norma_externa_min ? data.norma_externa_min.toFixed(2) + " kg/m" : "N/A";
        document.querySelector(".informacoes:nth-child(8) .info-value").textContent = data.norma_externa_max ? data.norma_externa_max.toFixed(2) + " kg/m" : "N/A";
        document.querySelector(".informacoes:nth-child(9) .info-value").textContent = data.norma_objetivada_min ? data.norma_objetivada_min.toFixed(2) + " kg/m" : "N/A";
        document.querySelector(".informacoes:nth-child(10) .info-value").textContent = data.norma_objetivada_max ? data.norma_objetivada_max.toFixed(2) + " kg/m" : "N/A";
    }

    // Carregar os dados ao carregar a página
    fetchData();
    
    // Atualizar os dados a cada 2 segundos (você pode ajustar esse intervalo)
    setInterval(fetchData, 2000);

    // Ouvir eventos de atualização do SocketIO
    socket.on('update_data', (data) => {
        console.log('Evento update_data recebido:', data);
        fetchData(); // Recarregar os dados quando um evento de atualização for recebido
    });
});