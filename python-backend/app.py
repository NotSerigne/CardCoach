from flask import Flask, request, jsonify
from blackjack_strategy import get_action

app = Flask(__name__)

@app.route('/action', methods=['POST'])
def action():
    data = request.get_json()
    player = data.get('player', [])
    dealer = data.get('dealer', '')
    # Appel de la logique de stratégie
    action = get_action(player, dealer)
    return jsonify({'action': action})

if __name__ == '__main__':
    app.run(debug=True)

