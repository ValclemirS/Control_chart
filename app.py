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
massa_linear = dados["massa_linear"]
norma_interna_min = None
norma_interna_max = None
norma_externa_min = None
norma_externa_max = None
norma_objetivada_min = None
norma_objetivada_max = None

# Rota principal redirecionando para o gráfico
@app.route('/')
def index():
    return redirect(url_for('grafico'))  # Redireciona para a rota de gráfico

# Rota para o gráfico
@app.route('/grafico')
def grafico():
    massa_linear= dados["massa_linear"][-1] if dados["massa_linear"] else 0  # 0 se a lista estiver vazia
    return render_template("grafico.html", 
                           massa_media=sum(dados['massa_linear'])/len(dados['massa_linear']) if dados['massa_linear'] else 0,
                           massa_maxima=max(dados['massa_linear']) if dados['massa_linear'] else 0,
                           massa_minima=min(dados['massa_linear']) if dados['massa_linear'] else 0,
                           norma_interna_min=norma_interna_min,
                           norma_interna_max=norma_interna_max,
                           norma_externa_min=norma_externa_min,
                           norma_externa_max=norma_externa_max,
                           norma_objetivada_min=norma_objetivada_min,
                           norma_objetivada_max=norma_objetivada_max,
                           massa_linear = massa_linear
                           )



@app.route('/input', methods=["GET", "POST"])
def input():
    if request.method == "POST":
        try:
            massa = request.form.get('massa')
            comprimento = request.form.get('comprimento')
            
            # Verificar se os campos estão vazios
            if not massa or not comprimento:
                return "Por favor, preencha todos os campos de massa e comprimento."
            
            # Converter os valores para float
            massa = float(massa)
            comprimento = float(comprimento)
            
            # Calcular a massa linear
            massa_linear = massa / comprimento
            
            # Capturar a hora de lançamento
            hora_entrada = datetime.now().strftime("%H:%M:%S")
            
            # Adicionar dados
            dados["hora"].append(hora_entrada)
            dados["massa_linear"].append(massa_linear)
            
            return redirect(url_for('grafico'))  # Redirecionar após o envio
        except ValueError:
            return "Por favor, insira valores válidos para todos os campos numéricos."
    return render_template("input.html")







# Rota para preferências
@app.route('/pref', methods=["GET", "POST"])
def pref():
    global norma_interna_min, norma_interna_max, norma_externa_min, norma_externa_max, norma_objetivada_min, norma_objetivada_max
    if request.method == "POST":
        # Atualizar as preferências
        norma_interna_min = float(request.form['norma_interna_min']) if request.form['norma_interna_min'] else None
        norma_interna_max = float(request.form['norma_interna_max']) if request.form['norma_interna_max'] else None
        norma_externa_min = float(request.form['norma_externa_min']) if request.form['norma_externa_min'] else None
        norma_externa_max = float(request.form['norma_externa_max']) if request.form['norma_externa_max'] else None
        norma_objetivada_min = float(request.form['norma_objetivada_min']) if request.form['norma_objetivada_min'] else None
        norma_objetivada_max = float(request.form['norma_objetivada_max']) if request.form['norma_objetivada_max'] else None
        return redirect(url_for('grafico'))  # Redirecionar para o gráfico
    return render_template("pref.html", 
                           norma_interna_min=norma_interna_min, 
                           norma_interna_max=norma_interna_max,
                           norma_externa_min=norma_externa_min, 
                           norma_externa_max=norma_externa_max,
                           norma_objetivada_min=norma_objetivada_min, 
                           norma_objetivada_max=norma_objetivada_max)

# Endpoint para dados JSON (usado pelo gráfico)
@app.route('/data')
def data():
    return jsonify({
        "hora": dados["hora"],
        "massa_linear": dados["massa_linear"],
        "norma_interna_min": norma_interna_min,
        "norma_interna_max": norma_interna_max,
        "norma_externa_min": norma_externa_min,
        "norma_externa_max": norma_externa_max,
        "norma_objetivada_min": norma_objetivada_min,
        "norma_objetivada_max": norma_objetivada_max
    })

# Inicializar a aplicação
if __name__ == '__main__':
    app.run(debug=True)
