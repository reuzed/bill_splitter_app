from flask import Flask
from flask import request

app = Flask(__name__)

sample_transactions = [
{'name':'reuben', 'amount':100},
{'name':'randolph', 'amount':25}
]

@app.route('/')
def hello():
    return "<h1>Hello</h1>"

@app.route('/transactions/<transaction_id>', methods=['GET', 'POST'])
def transactions(transaction_id):
    if request.method == 'GET':
        transaction_id = int(transaction_id)
        if 0<= transaction_id < len(sample_transactions):
            return sample_transactions[transaction_id]
        else:
            return "error"
    if request.method == 'POST':
        data = request.form
        return data
    

app.run(port=5000)