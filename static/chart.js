document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("massaLinearChart").getContext("2d");
    const socket = io();
    let chart;
    let isUpdatingChart = false;

    function fetchData() {
        if (isUpdatingChart) return;

        isUpdatingChart = true;
        fetch("/data")
            .then(response => {
                if (!response.ok) throw new Error("Erro na resposta do servidor");
                return response.json();
            })
            .then(data => {
                if (!data.massa_linear || !data.nucleo || data.massa_linear.length === 0 || data.nucleo.length === 0) {
                    console.warn("Dados insuficientes recebidos para atualizar o gráfico.");
                    return;
                }

                const horas = data.hora.slice(-7);
                const massaLinear = data.massa_linear.slice(-7);
                const nucleo = data.nucleo.slice(-7);

                updateChart(
                    horas,
                    massaLinear,
                    nucleo,
                    data.norma_interna_min,
                    data.norma_interna_max,
                    data.norma_externa_min,
                    data.norma_externa_max,
                    data.norma_objetivada_min,
                    data.norma_objetivada_max
                );

                updateInfo(data);
                socket.emit('data-update', data);
            })
            .catch(error => console.error("Erro ao carregar os dados:", error))
            .finally(() => {
                isUpdatingChart = false;
            });
    }

    function updateChart(horas, massaLinear, nucleo, normaInternaMin, normaInternaMax, normaExternaMin, normaExternaMax, normaObjetivadaMin, normaObjetivadaMax) {
        if (chart) {
            chart.data.labels = horas;
            chart.data.datasets[0].data = massaLinear;
            chart.data.datasets[1].data = horas.map(() => normaInternaMin);
            chart.data.datasets[2].data = horas.map(() => normaInternaMax);
            chart.data.datasets[3].data = horas.map(() => normaExternaMin);
            chart.data.datasets[4].data = horas.map(() => normaExternaMax);
            chart.data.datasets[5].data = horas.map(() => normaObjetivadaMin);
            chart.data.datasets[6].data = horas.map(() => normaObjetivadaMax);
            chart.options.plugins.datalabels.formatter = (value, context) => {
                if (context.dataset.label === "Massa Atual") {
                    const index = context.dataIndex;
                    const massa = value ? value.toFixed(2) : "N/A";
                    const nucleoValue = nucleo && nucleo[index] !== undefined ? nucleo[inde].toFixed(2) : "N/A";
                    return `ML:${massa}Kg/mm\nNúc:${nucleoValue}mm`;
                }
                return null;
            };
            chart.update();
        } else {
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
                            right: 60,
                            bottom: 50,
                        },
                    },
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
                                size: 11,
                            },
                            formatter: (value, context) => {
                                if (context.dataset.label === "Massa Atual") {
                                    const index = context.dataIndex;
                                    const massa = value ? value.toFixed(2) : "N/A";
                                    var nucleoValue = nucleo && nucleo[index] !== undefined ? nucleo[index].toFixed(2) : "N/A";
                                    return `ML:${massa}Kg/mm\nNúc:${nucleoValue}mm`;
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

    function updateInfo(data) {
        const updateElement = (selector, value, suffix = "") => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value !== undefined ? value.toFixed(2) + suffix : "N/A";
            }
        };

        updateElement("#massaAtual .info-value", data.massa_linear.slice(-1)[0], " kg/m");
        updateElement(".informacoes:nth-child(2) .info-value", data.massa_linear.reduce((a, b) => a + b, 0) / data.massa_linear.length, " kg/m");
        updateElement(".informacoes:nth-child(3) .info-value", Math.max(...data.massa_linear), " kg/m");
        updateElement(".informacoes:nth-child(4) .info-value", Math.min(...data.massa_linear), " kg/m");
        updateElement(".informacoes:nth-child(5) .info-value", data.norma_interna_min, " kg/m");
        updateElement(".informacoes:nth-child(6) .info-value", data.norma_interna_max, " kg/m");
        updateElement(".informacoes:nth-child(7) .info-value", data.norma_externa_min, " kg/m");
        updateElement(".informacoes:nth-child(8) .info-value", data.norma_externa_max, " kg/m");
    }

    fetchData();
    setInterval(fetchData, 30000);

    socket.on('data-update', (data) => {
        updateInfo(data);
        updateChart(data.hora.slice(-7), data.massa_linear.slice(-7), data.nucleo.slice(-7), data.norma_interna_min, data.norma_interna_max, data.norma_externa_min, data.norma_externa_max, data.norma_objetivada_min, data.norma_objetivada_max);
    });
});