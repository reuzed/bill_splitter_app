from flask import Flask
from flask import request
from flask_cors import CORS
import sqlite3

DATABASE = 'bill_splitter.db'

app = Flask(__name__)
CORS(app) 

def sql_strip(iterable):
    return list(map(lambda x:x[0], iterable))

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
    transaction_ids = sql_strip(transaction_ids)
    return transaction_ids

def get_user_ids():
    user_ids = make_select_query(
        'SELECT user_id FROM users'
    )
    user_ids = sql_strip(user_ids)
    return user_ids

def get_names():
    names = make_select_query(
        'SELECT name FROM users'
    )
    names = sql_strip(names)
    return names


def get_transactions():
    transaction_ids = get_transaction_ids()
    transactions = []
    for id in transaction_ids:
        transaction = {}
        transaction_data = make_select_query(
            f"SELECT payer, amount, date FROM transactions WHERE transaction_id = {id}"
        )
        split_data = make_select_query(
            f"SELECT recipient, share FROM transaction_splits WHERE transaction_id = {id}"
        )
        transaction_data = transaction_data[0] #sql queries return list of matching rows
        
        payer =  transaction_data[0]
        amount = float(transaction_data[1])
        shares = {}
        total_shares = sum(map(lambda x:float(x[1]), split_data)) #
        for entry in split_data:
            share_for_entry = float(entry[1])
            share_of_cost = - amount * share_for_entry / total_shares
            name = entry[0]
            if name == payer:
                share_of_cost += amount
            shares[name] = share_of_cost
        
        transaction['date'] = transaction_data[2]
        transaction['shares'] = shares
        transaction['payer'] = payer
        transaction['amount'] = amount
        transactions.append(transaction)
    
    return transactions

def get_balances():
    transactions = get_transactions()
    list_of_shares = [transaction['shares'] for transaction in transactions]
    names = get_names()
    balances = dict([(name,0) for name in names])
    for shares in list_of_shares:
        for name, amount in shares.items():
            balances[name] += amount
    return balances
    
def calculate_repayments():
    pass

@app.route('/')
def hello():
    return "<h1>Hello! This is the default route.</h1>" + str(get_transactions())

@app.route('/transactions', methods=['GET', 'POST'])
def transactions():
    if request.method == 'GET':
        transactions = get_transactions()
        return transactions
        
    if request.method == 'POST':
        TRANSACTION_ID = max(get_transaction_ids() + [0]) + 1
        data = request.json
        payer, amount, date = data['payer'],data['amount'],data['date']
        make_insert_query('INSERT INTO transactions VALUES(?,?,?,?)', [TRANSACTION_ID, payer, amount, date])
        sharers = list(filter(lambda s:s[:6]=='share_', data.keys()))
        for sharer in sharers:
            name = sharer[6:]
            share = data[sharer]
            make_insert_query('INSERT INTO transaction_splits VALUES(?,?,?)', [TRANSACTION_ID, name, share])
        
        return data
   
@app.route('/users', methods=['GET','POST'])
def users():
    if request.method == 'POST':
        USER_ID = max(get_user_ids() + [0])+1
        data = request.json
        name, bank_details = data['name'],data['bank_details']
        make_insert_query('INSERT INTO users VALUES(?,?,?)', [USER_ID, name, bank_details])
        return data
    
    if request.method == 'GET':
        return get_names()

@app.route("/balances", methods=["GET"])
def balances():
    return get_balances()

app.run(port=5000)