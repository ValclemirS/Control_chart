from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit
from datetime import datetime
#import sqlite3

app = Flask(__name__)
socketio = SocketIO(app)

# Configuração do banco de dados
#DATABASE = 'teste.db'

#def get_db_connection():
   # conn = sqlite3.connect(DATABASE)
    #conn.row_factory = sqlite3.Row
    #return conn

#def init_db():
    #with get_db_connection() as conn:
        #conn.execute('''
            #CREATE TABLE IF NOT EXISTS dados (
               # id INTEGER PRIMARY KEY AUTOINCREMENT,
              #  data1 TEXT NOT NULL,
             #   data2 REAL NOT NULL,
             #   data3 REAL NOT NULL
          #  )
      #  ''')
       # conn.commit()

#init_db() funciona pelo amor de Deus

# Dados de exemplo (inicializados como vazios)
dados = {
    "hora": [],
    "massa_linear": [],
    "nucleo": []
}

# Variáveis globais para as preferências
preferencias = {
    "norma_interna_min": None,
    "norma_interna_max": None,
    "norma_externa_min": None,
    "norma_externa_max": None,
    "norma_objetivada_min": None,
    "norma_objetivada_max": None
}

def calcular_massa_linear(massa, comprimento):
    return massa / comprimento if comprimento != 0 else 0

@app.route('/')
def index():
    return redirect(url_for('grafico'))

@app.route('/grafico')
def grafico():
    massa_linear = dados["massa_linear"][-1] if dados["massa_linear"] else 0
    nucleo = dados["nucleo"][-1] if dados["nucleo"] else 0
    return render_template("grafico.html",
                           massa_media=sum(dados['massa_linear'])/len(dados['massa_linear']) if dados['massa_linear'] else 0,
                           massa_maxima=max(dados['massa_linear']) if dados['massa_linear'] else 0,
                           massa_minima=min(dados['massa_linear']) if dados['massa_linear'] else 0,
                           massa_linear=massa_linear,
                           nucleo=nucleo,
                           **preferencias)

@app.route('/input', methods=["GET", "POST"])
def input():
    if request.method == "POST":
        try:
            massa = float(request.form.get('massa'))
            comprimento = float(request.form.get('comprimento'))
            nucleo = float(request.form.get('nucleo'))

            massa_linear = calcular_massa_linear(massa, comprimento)
            hora_entrada = datetime.now().strftime("%d-%m-%y %H:%M:%S")

            dados["hora"].append(hora_entrada)
            dados["massa_linear"].append(massa_linear)
            dados["nucleo"].append(nucleo)

            socketio.emit('update_data', {'hora': hora_entrada, 'nucleo': nucleo, 'massa_linear': massa_linear})
            return redirect(url_for('grafico'))
        except ValueError:
            return "Por favor, insira valores válidos para todos os campos numéricos."
    return render_template("input.html")

@app.route('/pref', methods=["GET", "POST"])
def pref():
    if request.method == "POST":
        for key in preferencias:
            preferencias[key] = float(request.form[key]) if request.form[key] else None
        return redirect(url_for('grafico'))
    return render_template("pref.html", **preferencias)

@app.route('/data')
def data():
    return jsonify({
        "hora": dados["hora"],
        "massa_linear": dados["massa_linear"],
        "nucleo": dados["nucleo"],
        **preferencias
    })

#@app.route('/save_data', methods=["POST"])
 #def save_data():
    #data = request.json
    #with get_db_connection() as conn:
        #conn.execute('INSERT INTO dados (hora, massa_linear, nucleo) VALUES (?, ?, ?)',
                   #  (data['hora'], data['massa_linear'], data['nucleo']))
       # conn.commit()
    #return jsonify({"status": "success"}) teste para o futuro

if __name__ == '__main__':
    socketio.run(app, debug=True)