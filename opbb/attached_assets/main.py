from flask import Flask, render_template, send_file, send_from_directory, request, jsonify, session, redirect, url_for
from flask_socketio import SocketIO, emit
import os
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

# Server-side storage
match_data = {
    'court1': {
        'team1': '',
        'team2': '',
        'servingTeam': 'team1',
        'status': 'paused',
        'timeRemaining': 600
    },
    'court2': {
        'team1': '',
        'team2': '',
        'servingTeam': 'team1',
        'status': 'paused',
        'timeRemaining': 600
    },
    'nextMatch': '',
    'upcoming': []
}

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

@app.route('/api/admin-login', methods=['POST'])
def admin_login():
    password = request.json.get('password')
    if password == "Ansh":
        session['admin_authenticated'] = True
        return jsonify({'status': 'success'})
    return jsonify({'status': 'error', 'message': 'Invalid password'}), 401

@app.route('/api/check-admin')
def check_admin():
    return jsonify({'authenticated': session.get('admin_authenticated', False)})

@app.route('/api/match-data', methods=['GET'])
def get_match_data():
    return jsonify(match_data)

@app.route('/api/update-match', methods=['POST'])
def update_match():
    if not session.get('admin_authenticated'):
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    global match_data
    new_data = request.json
    match_data.update(new_data)
    emit('match_update', match_data, namespace='/', broadcast=True)
    return jsonify({'status': 'success'})

@socketio.on('connect')
def handle_connect():
    emit('match_update', match_data)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)