from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
from datetime import datetime

app = Flask(__name__)

# Dados de exemplo (inicializados como vazios)
dados = {
    "hora": [],
    "massa_linear": []
}

# Variáveis globais para as preferências
norma_interna = None
norma_externa = None

# Rota principal redirecionando para o gráfico
@app.route('/')
def index():
    return redirect(url_for('grafico'))  # Redireciona para a rota de gráfico

# Rota para o gráfico
@app.route('/grafico')
def grafico():
    return render_template("grafico.html", 
                           massa_media=sum(dados['massa_linear'])/len(dados['massa_linear']) if dados['massa_linear'] else 0,
                           massa_maxima=max(dados['massa_linear']) if dados['massa_linear'] else 0,
                           massa_minima=min(dados['massa_linear']) if dados['massa_linear'] else 0)


# Rota para a entrada de dados
@app.route('/input', methods=["GET", "POST"])
def input():
    global norma_interna, norma_externa
    if request.method == "POST":
        try:
            # Verificação se os campos não estão vazios
            if not request.form['massa'] or not request.form['comprimento']:
                return "Por favor, preencha todos os campos de massa e comprimento."

            # Coletar dados do formulário
            norma_interna = float(request.form['norma_interna']) if request.form['norma_interna'] else None
            norma_externa = float(request.form['norma_externa']) if request.form['norma_externa'] else None
            massa = float(request.form['massa'])  # Massa
            comprimento = float(request.form['comprimento'])  # Comprimento
            
            # Calcular a massa linear
            massa_linear = massa / comprimento
            
            # Capturar a hora de lançamento
            hora_entrada = datetime.now().strftime("%H:%M:%S")  # Hora exata do lançamento
            
            # Adicionar dados (isso seria salvo em banco de dados em produção)
            dados["hora"].append(hora_entrada)
            dados["massa_linear"].append(massa_linear)
            
            return redirect(url_for('grafico'))  # Redirecionar após o envio
        except ValueError:
            return "Por favor, insira valores válidos para todos os campos numéricos."

    return render_template("input.html", norma_interna=norma_interna, norma_externa=norma_externa)

# Rota para preferências
@app.route('/pref', methods=["GET", "POST"])
def pref():
    global norma_interna, norma_externa
    if request.method == "POST":
        # Atualizar as preferências
        norma_interna = float(request.form['norma_interna']) if request.form['norma_interna'] else None
        norma_externa = float(request.form['norma_externa']) if request.form['norma_externa'] else None
        
        return redirect(url_for('grafico'))  # Redirecionar para o gráfico

    return render_template("pref.html", norma_interna=norma_interna, norma_externa=norma_externa)

# Endpoint para dados JSON (usado pelo gráfico)
@app.route('/data')
def data():
    return jsonify({
        "hora": dados["hora"],
        "massa_linear": dados["massa_linear"],
        "norma_interna": norma_interna,
        "norma_externa": norma_externa
    })

# Inicializar a aplicação
if __name__ == '__main__':
    app.run(debug=True)
