from flask import Flask
from flask import request
from flask_cors import CORS
import sqlite3

DATABASE = 'bill_splitter.db'

app = Flask(__name__)
CORS(app) 

sample_transactions = [
{'name':'reuben', 'amount':100},
{'name':'randolph', 'amount':25}
]

@app.route('/')
def hello():
    return "<h1>Hello</h1>"

TRANSACTION_ID = 0
@app.route('/transactions', methods=['GET', 'POST'])
def transactions():
    print("got a request")
    if request.method == 'GET':
        con = sqlite3.connect(DATABASE)
        cur = con.cursor()
        res = cur.execute(
            'SELECT payer, amount, date FROM transactions'
        )
        data = res.fetchall()
        con.close()
        return data
        
    if request.method == 'POST':
        global TRANSACTION_ID
        data = request.json
        payer, amount, date = data['payer'],data['amount'],data['date']
        con = sqlite3.connect(DATABASE)
        cur = con.cursor()
        cur.execute(
            'INSERT INTO transactions VALUES(?,?,?,?)', [TRANSACTION_ID, payer, amount, date]
        )
        TRANSACTION_ID += 1
        con.commit()
        con.close()
        print(data)
        return data
   
USER_ID = 0 
@app.route('/users', methods=['GET','POST'])
def users():
    if request.method == 'POST':
        global USER_ID
        data = request.json
        name, bank_details = data['name'],data['bank_details']
        con = sqlite3.connect(DATABASE)
        cur = con.cursor()
        cur.execute(
            'INSERT INTO users VALUES(?,?,?)', [USER_ID, name, bank_details]
        )
        USER_ID += 1
        con.commit()
        con.close()
        print(data)
        return data

    

app.run(port=5000)