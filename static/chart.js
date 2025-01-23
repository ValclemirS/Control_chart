document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("massaLinearChart").getContext("2d");

    // Obter os dados do backend
    fetch("/data")
        .then(response => response.json())
        .then(data => {
            const horas = data.hora;
            const massaLinear = data.massa_linear;
            const normaInternaMin = data.norma_interna_min;
            const normaInternaMax = data.norma_interna_max;
            const normaExternaMin = data.norma_externa_min;
            const normaExternaMax = data.norma_externa_max;
            const normaObjetivadaMin = data.norma_objetivada_min;
            const normaObjetivadaMax = data.norma_objetivada_max;

            // Criar o gráfico
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
                        },
                        {
                            label: "Norma Interna (Mínima)",
                            data: horas.map(() => normaInternaMin),
                            borderColor: "green",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                        },
                        {
                            label: "Norma Interna (Máxima)",
                            data: horas.map(() => normaInternaMax),
                            borderColor: "green",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                        },
                        {
                            label: "Norma Externa (Mínima)",
                            data: horas.map(() => normaExternaMin),
                            borderColor: "red",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                        },
                        {
                            label: "Norma Externa (Máxima)",
                            data: horas.map(() => normaExternaMax),
                            borderColor: "red",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                        },
                        {
                            label: "Norma Objetivada (Mínima)",
                            data: horas.map(() => normaObjetivadaMin),
                            borderColor: "purple",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                        },
                        {
                            label: "Norma Objetivada (Máxima)",
                            data: horas.map(() => normaObjetivadaMax),
                            borderColor: "purple",
                            borderDash: [5, 5],
                            borderWidth: 1,
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,//teste
                    devicePixelRatio: window.devicePixelRatio || 1,//teste
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
                                    weight: 'bold',  // teste
                                    size: 30        // teste
                                }
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Massa Linear (kg/m)",
                                font: {
                                    weight: 'bold',  // teste
                                    size: 30        // teste
                                }
                            },
                        },
                    },
                },
            });
        })
        .catch(error => console.error("Erro ao carregar os dados:", error));
});
