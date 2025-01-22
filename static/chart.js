document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById("massaLinearChart").getContext("2d");

    // Obter os dados do backend
    fetch("/data")
        .then(response => response.json())
        .then(data => {
            const horas = data.hora;
            const massaLinear = data.massa_linear;
            const normaInterna = data.norma_interna;
            const normaExterna = data.norma_externa;

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
                            label: "Norma Interna",
                            data: horas.map(() => normaInterna),
                            borderColor: "green",
                            borderDash: [5, 5],
                            borderWidth: 2,
                            fill: false,
                        },
                        {
                            label: "Norma Externa",
                            data: horas.map(() => normaExterna),
                            borderColor: "red",
                            borderDash: [5, 5],
                            borderWidth: 2,
                            fill: false,
                        },
                    ],
                },
                options: {
                    responsive: true,
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
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Massa Linear (kg/m)",
                            },
                        },
                    },
                },
            });
        })
        .catch(error => console.error("Erro ao carregar os dados:", error));
});
