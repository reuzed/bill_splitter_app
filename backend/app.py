from flask import Flask
from flask import request
from flask_cors import CORS
import sqlite3

DATABASE = 'bill_splitter.db'

app = Flask(__name__)
CORS(app) 

def make_select_query(query):
    con = sqlite3.connect(DATABASE)
    cur = con.cursor()
    res = cur.execute(query)
    data = res.fetchall()
    con.close()
    return data

def make_insert_query(query, data):
    con = sqlite3.connect(DATABASE)
    cur = con.cursor()
    cur.execute(
        query, data
    )
    con.commit()
    con.close()

def get_transaction_ids():
    transaction_ids = make_select_query(
        'SELECT transaction_id FROM transactions'
    )
    transaction_ids = list(map(lambda x:x[0], transaction_ids))
    return transaction_ids

def get_user_ids():
    user_ids = make_select_query(
        'SELECT user_id FROM users'
    )
    user_ids = list(map(lambda x:x[0], user_ids))
    return user_ids

@app.route('/')
def hello():
    return "<h1>Hello! This is the default route.</h1>" + str(get_transaction_ids())

@app.route('/transactions', methods=['GET', 'POST'])
def transactions():
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
        TRANSACTION_ID = max(get_transaction_ids()) + 1
        data = request.json
        payer, amount, date = data['payer'],data['amount'],data['date']
        con = sqlite3.connect(DATABASE)
        cur = con.cursor()
        cur.execute(
            'INSERT INTO transactions VALUES(?,?,?,?)', [TRANSACTION_ID, payer, amount, date]
        )
        con.commit()
        con.close()
        print(data)
        return data
   
@app.route('/users', methods=['GET','POST'])
def users():
    if request.method == 'POST':
        USER_ID = max(get_user_ids())+1
        data = request.json
        name, bank_details = data['name'],data['bank_details']
        make_insert_query('INSERT INTO users VALUES(?,?,?)', [USER_ID, name, bank_details])
        print(data)
        return data
    
    if request.method == 'GET':
        con = sqlite3.connect(DATABASE)
        cur = con.cursor()
        res = cur.execute(
            "SELECT name FROM users"
        )
        data = res.fetchall()
        con.close()
        return data

    

app.run(port=5000)