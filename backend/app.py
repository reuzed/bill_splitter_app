from flask import Flask
from flask import request
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

sample_transactions = [
{'name':'reuben', 'amount':100},
{'name':'randolph', 'amount':25}
]

@app.route('/')
def hello():
    return "<h1>Hello</h1>"

@app.route('/transactions', methods=['GET', 'POST'])
def transactions(transaction_id):
    print("got a request")
    if request.method == 'GET':
        transaction_id = int(transaction_id)
        if 0<= transaction_id < len(sample_transactions):
            return sample_transactions[transaction_id]
        else:
            return "error"
    if request.method == 'POST':
        data = request.json
        data = str(data)
        with open('tempfile.txt', 'w') as file:
            file.write(data)
        return data
    
@app.route('/users', methods=['GET','POST'])
def users():
    pass
    

app.run(port=5000)