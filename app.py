from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_aqui'  # Chave secreta para sessões
socketio = SocketIO(app)

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

# Dados de usuários (simulando um banco de dados)
usuarios = {
    'admin': {'senha': 'admin123', 'tipo': 'admin'},
    'operador': {'senha': 'operador123', 'tipo': 'operador'}
}

def calcular_massa_linear(massa, comprimento):
    return massa / comprimento if comprimento != 0 else 0

@app.route('/')
def index():
    return redirect(url_for('grafico'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in usuarios and usuarios[username]['senha'] == password:
            session['username'] = username
            session['tipo'] = usuarios[username]['tipo']
            flash('Login realizado com sucesso!', 'success')
            return redirect(url_for('grafico'))
        else:
            flash('Usuário ou senha incorretos!', 'danger')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('tipo', None)
    flash('Logout realizado com sucesso!', 'success')
    return redirect(url_for('login'))

@app.route('/grafico')
def grafico():
    if 'username' not in session:
        flash('Por favor, faça login para acessar esta página.', 'danger')
        return redirect(url_for('login'))
    
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
    if 'username' not in session:
        flash('Por favor, faça login para acessar esta página.', 'danger')
        return redirect(url_for('login'))
    
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

            # Emitir atualização para todas as telas conectadas
            socketio.emit('update_data', {
                'hora': hora_entrada,
                'nucleo': nucleo,
                'massa_linear': massa_linear,
                'massa_media': sum(dados['massa_linear'])/len(dados['massa_linear']) if dados['massa_linear'] else 0,
                'massa_maxima': max(dados['massa_linear']) if dados['massa_linear'] else 0,
                'massa_minima': min(dados['massa_linear']) if dados['massa_linear'] else 0
            })

            return redirect(url_for('grafico'))
        except ValueError:
            return "Por favor, insira valores válidos para todos os campos numéricos."
       
        # Passa o dicionário 'preferencias' para o template
    return render_template("input.html", preferencias=preferencias)

@app.route('/pref', methods=["GET", "POST"])
def pref():
    if 'username' not in session or session['tipo'] != 'admin':
        flash('Acesso negado. Somente administradores podem acessar esta página.', 'danger')
        return redirect(url_for('grafico'))
    
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

if __name__ == '__main__':
    socketio.run(app, debug=True)
