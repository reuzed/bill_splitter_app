# import sqlite3
# from flask import Flask

# DATABASE = "data.db"

# def sql_strip(iterable):
#     return list(map(lambda x:x[0], iterable))

# def get_users_names():
#     con = sqlite3.connect(DATABASE)
#     cur = con.cursor()
#     res = cur.execute(
#         "SELECT name FROM users"
#         )
#     data = res.fetchall()
#     con.close()
#     return sql_strip(data)

# def post_user_name(name):
#     con = sqlite3.connect(DATABASE)
#     cur = con.cursor()
#     cur.execute(
#         "INSERT INTO users VALUES(?)", [name]
#         )
#     con.commit()
#     con.close()

# app = Flask(__name__)

# @app.route('/')
# def hello_world():
#     return 'Hello from Flask!'

# @app.route('/add/<a>/<b>')
# def add(a,b):
#     #a,b = int(a), int(b)
#     return a+b

# @app.route('/query')
# def query():
#     names = get_users_names()
#     return ", ".join(names)

# @app.route('/post/<name>')
# def post(name):
#     post_user_name(name)
#     return "Added " + name + " to database."

# @app.route('/refeshtables')
# def refreshtables():
#     con = sqlite3.connect(DATABASE)
#     cur = con.cursor()
#     cur.execute(
#         "DROP TABLE IF EXISTS users"
#         )
#     cur.execute(
#         "CREATE TABLE users(name)"
#         )

#     cur.executemany(
#         "INSERT INTO users VALUES(?)", [["Ben"], ["Ann"], ["Reuben"]]
#         )
#     con.commit()
#     return "Refreshed Tables"

# if __name__ =='__main__':
#     print(refreshtables())
#     post_user_name("Gabe")
#     print(get_users_names())

from flask import Flask, jsonify
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

@app.route('/refresh')
def refresh():
    con = sqlite3.connect(DATABASE)
    cur = con.cursor()
    cur.execute("DROP TABLE IF EXISTS users")
    cur.execute("DROP TABLE IF EXISTS transactions")
    cur.execute("DROP TABLE IF EXISTS transaction_splits")
    cur.execute("CREATE TABLE users(user_id, name, bank_details)")
    cur.execute("CREATE TABLE transactions(transaction_id, payer, amount, date)")
    cur.execute("CREATE TABLE transaction_splits(transaction_id, recipient, share)")
    con.commit()
    con.close()
    return "Successfully reloaded database"


@app.route('/transactions', methods=['GET', 'POST'])
def transactions():
    print("/transaction route accessed")
    print("method used is " + request.method)
    if request.method == 'GET':
        transactions = get_transactions()
        print(transactions)
        return jsonify(transactions)

    if request.method == 'POST':
        TRANSACTION_ID = max(get_transaction_ids(),default=0) + 1
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
    print("/users route accessed")
    print("method used is " + request.method)
    if request.method == 'POST':
        USER_ID = max(get_user_ids(),default=0)+1
        data = request.json
        name, bank_details = data['name'],data['bank_details']
        make_insert_query('INSERT INTO users VALUES(?,?,?)', [USER_ID, name, bank_details])
        return data

    if request.method == 'GET':
        names = get_names()
        print(names)
        return jsonify(names)

@app.route("/balances", methods=["GET"])
def balances():
    return get_balances()

@app.route("/debug/addtransaction/<payer>/<amount>/<date>")
def debug_addtransaction(payer, amount, date):
    print(f"Debug adding transaction: {payer}, {amount}, {date}")
    TRANSACTION_ID = max(get_transaction_ids(),default=0) + 1
    make_insert_query('INSERT INTO transactions VALUES(?,?,?,?)', [TRANSACTION_ID, payer, amount, date])
    return "Success"

@app.route("/debug/adduser/<name>/<details>")
def debug_adduser(name, details):
    print(f"Debug adding user: {name}, {details}")
    USER_ID = max(get_user_ids(), default=0)+1
    make_insert_query('INSERT INTO users VALUES(?,?,?)', [USER_ID, name, details])
    return "Success"

#app.run(port=5000)