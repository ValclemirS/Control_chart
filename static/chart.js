document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("massaLinearChart").getContext("2d");

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
            })
            .catch(error => console.error("Erro ao carregar os dados:", error));
    }

    // Função para atualizar o gráfico
    function updateChart(horas, massaLinear, normaInternaMin, normaInternaMax, normaExternaMin, normaExternaMax, normaObjetivadaMin, normaObjetivadaMax) {
        // Criar ou atualizar o gráfico
        new Chart(ctx, {
            type: "line",
            data: {
                labels: horas,
                datasets: [
                    {
                        label: "Massa Linear",
                        data: massaLinear,
                        borderColor: "blue",
                        backgroundColor: "rgba(0, 0, 255, 0.1)",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4, // Adiciona suavização (spline)
                    },
                    {
                        label: "Norma Interna (Mínima)",
                        data: horas.map(() => normaInternaMin),
                        borderColor: "green",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4, // Adiciona suavização (spline)
                    },
                    {
                        label: "Norma Interna (Máxima)",
                        data: horas.map(() => normaInternaMax),
                        borderColor: "green",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4, // Adiciona suavização (spline)
                    },
                    {
                        label: "Norma Externa (Mínima)",
                        data: horas.map(() => normaExternaMin),
                        borderColor: "red",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4, // Adiciona suavização (spline)
                    },
                    {
                        label: "Norma Externa (Máxima)",
                        data: horas.map(() => normaExternaMax),
                        borderColor: "red",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4, // Adiciona suavização (spline)
                    },
                    {
                        label: "Norma Objetivada (Mínima)",
                        data: horas.map(() => normaObjetivadaMin),
                        borderColor: "purple",
                        borderDash: [5, 5],
                        borderWidth: 1,
                        fill: false,
                        tension: 0.4, // Adiciona suavização (spline)
                    },
                    {
                        label: "Norma Objetivada (Máxima)",
                        data: horas.map(() => normaObjetivadaMax),
                        borderColor: "purple",
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
                devicePixelRatio: window.devicePixelRatio || 1,
                plugins: {
                    legend: {
                        display: true,
                        position: "top",
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
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
                                size: 30        
                            }
                        },
                    },
                },
            },
        });
    }

    // Carregar os dados ao carregar a página
    fetchData();

    // Atualizar os dados a cada 2 segundos (você pode ajustar esse intervalo)
    setInterval(fetchData, 2000);
});
