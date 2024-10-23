from flask import Flask, jsonify
from flask import request
from flask_cors import CORS
import sqlite3 
from collections import namedtuple

DATABASE = 'bill_splitter.db'

database_schemas = {
    "users" : ["splitter_name", "user_id", "name", "name_on_account", "is_international", "sort_code", "account_number", "BIC_code", "IBAN_number", "paying_description"],
    "transactions" : ["splitter_name", "transaction_id", "payer_id", "amount", "title", "description", "date"],
    "transaction_splits" : ["splitter_name", "transaction_id", "recipient_id", "share"]
}

database_defaults = {
    "users" : {
        "name_on_account":"Not Provided", "is_international":"0", "sort_code":"Not Provided", "account_number":"Not Provided",
        "BIC_code":"Not Provided", "IBAN_number":"Not Provided", "paying_description":"Not Provided"
    },
    "transactions":{
        "title":"Transaction","description":"","date":"Not Provided"
    },
    "transaction_splits":{
    }
}

app = Flask(__name__)
CORS(app)


def make_sql_query(query):
    con = sqlite3.connect(DATABASE)
    cur = con.cursor()
    cur.execute(query)
    con.commit()
    con.close()

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

def insert_by_db_schema(table, columns, data):
    question_marks = ", ".join(["?"]*len(columns))
    query = f"INSERT INTO {table} VALUES({question_marks})"
    values = list(map(lambda column : data[column], columns))
    make_insert_query(query, values)

def get_by_db_schema(table, columns):
    column_string = ", ".join(columns)
    query = f"SELECT {column_string} FROM {table}"
    results = make_select_query(query)
    data = dict({columns[i]:results[i] for i in range(columns)})
    return data

def populate_defaults(data, defaults):
    #Adds the default values from defaults if they are not already present in data
    for key, default in defaults.items():
        if key not in data.keys():
            data[key] = default
    return data
 
def sql_strip(iterable):
    '''Takes a list of singleton tuples, as returned by a select query, and returns a list.'''
    return list(map(lambda x:x[0], iterable))
 
def get_column(name, table, splitter_name):
    query = f"SELECT {name} FROM {table} WHERE splitter_name=\"{splitter_name}\""
    print(query)
    data = make_select_query(query)
    return sql_strip(data)

def get_new_transaction_id(splitter_name):
    #Finds all transaction ids, takes the maximum and adds one to ensure a new unique id
    return max(map(int,get_column("transaction_id", "transactions", splitter_name)), default=0)+1

def get_new_user_id(splitter_name):
    return max(map(int,get_column("user_id", "users", splitter_name)), default=0)+1

def get_user_by_id(id, splitter_name):
    result = make_select_query(f'SELECT name FROM users WHERE user_id={id} AND splitter_name=\"{splitter_name}\"')
    #Query returns a list of rows, each row is a tuple so need the only row, only element 0,0
    if len(result) == 1:
        return result[0][0]
    return "User Not Found"
    
TransactionData = namedtuple("TransactionData", ["payer_id", "amount", "title", "description", "date"])
SplitData = namedtuple("SplitData", ["recipient_id", "share"])
def get_transactions(splitter_name):
    transaction_ids = get_column("transaction_id", "transactions", splitter_name)
    transactions = []
    for id in transaction_ids:
        transaction_data = make_select_query(
            f"SELECT payer_id, amount, title, description, date FROM transactions WHERE transaction_id = {id} AND splitter_name=\"{splitter_name}\""
        )
        print(transaction_data)
        transaction_data = transaction_data[0] #sql queries return list of matching rows
        transaction_data = TransactionData(*transaction_data)
        split_data = make_select_query(
            f"SELECT recipient_id, share FROM transaction_splits WHERE transaction_id = {id} AND splitter_name=\"{splitter_name}\""
        )
        split_data = list(map(lambda split_entry:SplitData(*split_entry), split_data))
        
        payer_id =  transaction_data.payer_id
        amount = float(transaction_data.amount)
        shares = {}
        total_shares = sum(map(lambda split_entry:float(split_entry.share), split_data)) #
        for split_entry in split_data:
            print(split_entry)
            share_for_entry = split_entry.share
            print(share_for_entry)
            print(amount)
            share_of_cost = - amount * share_for_entry / total_shares
            recipient_id = split_entry.recipient_id
            if recipient_id == payer_id:
                share_of_cost += amount #if they have paid, their balance should be positive
            shares[recipient_id] = share_of_cost
        #Repack the data from the queries into a transaction dictionary
        transaction = {}
        transaction['transaction_id'] = id
        transaction['title'] = transaction_data.title
        transaction['description'] = transaction_data.description
        transaction['date'] = transaction_data.date
        transaction['shares'] = shares
        transaction['payer_id'] = payer_id
        transaction['amount'] = amount
        transaction["payer"] = get_user_by_id(payer_id, splitter_name)
        transactions.append(transaction)
    return transactions

UserData = namedtuple("UserData", ["user_id", "name", "name_on_account",
                                   "is_international", "sort_code", "account_number",
                                   "BIC_code", "IBAN_number", "paying_description"])
def get_users(splitter_name):
    user_data = make_select_query(
            f"SELECT user_id, name, name_on_account, is_international, sort_code, account_number, BIC_code, "+
            "IBAN_number, paying_description FROM users WHERE splitter_name=\"{splitter_name}\""
        )
    user_data = UserData(*user_data)
    user_dict = user_data._asdict()
    return user_dict
    

def get_balances(splitter_name):
    transactions = get_transactions(splitter_name)
    list_of_shares = [transaction['shares'] for transaction in transactions]
    user_ids = get_column("user_id", "users", splitter_name)
    balances = dict([(user_id,0) for user_id in user_ids])
    for shares in list_of_shares:
        for user_id, amount in shares.items():
            print(balances)
            balances[user_id] += amount
    return balances

Balance = namedtuple("Balance", ["user_id", "amount"])
def calculate_repayments(splitter_name):
    balances = get_balances(splitter_name)
    balances = list(map(lambda bal:Balance(*bal), balances.items()))
    #reformats the dict {3:40,...} as [Balance(user_id=3, amount=40),...]
    positive_balances = list(filter(lambda bal : bal.amount > 0, balances))
    positive_balances = sorted(positive_balances, key=lambda bal:-bal.amount)
    negative_balances = list(filter(lambda bal : bal.amount < 0, balances))
    negative_balances = sorted(negative_balances, key=lambda bal:bal.amount)
    if len(negative_balances) == 0:
        print("No Negative Balances!")
        return []
    payer_index = 0
    receiver_index = 0
    pot = -negative_balances[receiver_index].amount
    repayments = []
    paying = True
    while paying:
        if payer_index >= len(negative_balances) or receiver_index >= len(positive_balances):
            paying = False
            continue
        receiver = positive_balances[receiver_index]
        payer = negative_balances[payer_index]
        repayment_data = {"payer_id":payer.user_id,
                          "receiver_id":receiver.user_id,
                          "payer":get_user_by_id(payer.user_id, splitter_name),
                          "receiver":get_user_by_id(receiver.user_id, splitter_name)
                          }
        if pot >= receiver.amount:
            #enough to pay so pay them
            repayment_data["amount"] = receiver.amount
            repayments.append(repayment_data)
            pot -= receiver.amount
            receiver_index += 1
        else:
            if pot > 0:
                #pay the remaining pot
                print(f"Split pot payment with pot {pot} and amount {receiver.amount}")
                repayment_data["amount"] = pot
                repayments.append(repayment_data)
                new_amount = receiver.amount - pot
                positive_balances[receiver_index] = receiver._replace(amount=new_amount)
            #new payer begins
            payer_index += 1
            if payer_index >= len(negative_balances):
                continue
            pot = -negative_balances[payer_index].amount
    return repayments
    

@app.route('/')
def hello():
    return "<h1>Hello! This is the default route.</h1>" + str(calculate_repayments("debug"))


def add_transaction(data):
    splitter_name = data["splitter_name"]
    TRANSACTION_ID = get_new_transaction_id(splitter_name)
    data["transaction_id"] = TRANSACTION_ID
    data = populate_defaults(data, database_defaults["transactions"])
    columns = database_schemas["transactions"]
    insert_by_db_schema("transactions", columns, data)
    
    shares = data["shares"]
    for recipient_id, share in shares.items():
        recipient_id = int(recipient_id)
        make_insert_query('INSERT INTO transaction_splits VALUES(?,?,?,?)', [splitter_name, TRANSACTION_ID, recipient_id, share])

def delete_transaction(transaction_id, splitter_name):
    query = f"DELETE FROM transactions WHERE transaction_id={transaction_id} AND splitter_name=\"{splitter_name}\""
    make_sql_query(query)
    query = f"DELETE FROM transaction_splits WHERE transaction_id={transaction_id} AND splitter_name=\"{splitter_name}\""
    make_sql_query(query)
    
@app.route('/transactions/<splitter_name>', methods=['GET', 'POST'])
@app.route('/transactions/<splitter_name>/<transaction_id>', methods = ['DELETE'])
def transactions(splitter_name ,transaction_id=None):
    if request.method == 'GET':
        transactions = get_transactions(splitter_name)
        return jsonify(transactions)

    if request.method == 'POST':
        data = request.json
        data["splitter_name"] = splitter_name
        add_transaction(data)
        return data

    if request.method == "DELETE":
        print("trying to delete")
        delete_transaction(transaction_id, splitter_name)
        return "Deleted transaction"
        
def add_user(data):
    splitter_name = data["splitter_name"]
    USER_ID = get_new_user_id(splitter_name)
    data["user_id"] = USER_ID
    data = populate_defaults(data, database_defaults["users"])
    columns = database_schemas["users"]
    insert_by_db_schema("users", columns, data)

def delete_user(user_id, splitter_name):
    #Messy operation of removing them from all transaction splits - try a hacky way for now
    query = f"DELETE FROM users WHERE user_id={user_id} AND splitter_name=\"{splitter_name}\""
    make_sql_query(query)
        
@app.route('/users/<splitter_name>', methods=['GET','POST', 'DELETE'])
def users(splitter_name):
    print(f"Got a request to users with method {request.method}")
    if request.method == 'POST':
        data = request.json
        print(data)
        data["splitter_name"] = splitter_name
        add_user(data)
        return jsonify(data)

    if request.method == 'GET':
        user_ids = get_column("user_id", "users", splitter_name)
        data = list([{"user_id":user_id, "name":get_user_by_id(user_id, splitter_name)} for user_id in user_ids])
        return jsonify(data)

    if request.method == "DELETE":
        data = request.json
        user_id = data["user_id"]
        delete_user(user_id, splitter_name)
        return "Deleted user"

@app.route("/balances/<splitter_name>", methods=["GET"])
def balances(splitter_name):
    return jsonify(get_balances(splitter_name))

@app.route("/repayments/<splitter_name>", methods=["GET"])
def repayments(splitter_name):
    return jsonify(calculate_repayments(splitter_name))

@app.route('/refresh')
def refresh():
    database_setup_queries = []
    for table_name, columns in database_schemas.items():
        database_setup_queries.append("DROP TABLE IF EXISTS " + table_name)
        database_setup_queries.append("CREATE TABLE " + table_name + "(" + ", ".join(columns) + ")")
    
    con = sqlite3.connect(DATABASE)
    cur = con.cursor()
    for query in database_setup_queries:
        cur.execute(query)
    con.commit()
    con.close()
    return "Successfully reloaded database."

@app.route('/debugpopulate')
def debugpopulate():
    transaction_data = {"splitter_name":"debug", "transaction_id":1, "payer_id":1,
            "amount":"100", "title":"Goods", "description":"None", "date":"Today"}
    insert_by_db_schema("transactions", database_schemas["transactions"], transaction_data)
    user_data1 = {"splitter_name":"debug", "user_id":1, "name":"Reuben", "name_on_account":"Reuben Mason",
                 "is_international":"false", "sort_code":"123456", "account_number":"98765432",
                 "BIC_code":"NA", "IBAN_number":"NA", "paying_description":"NA"}
    insert_by_db_schema("users", database_schemas["users"], user_data1)
    user_data2 = {"splitter_name":"debug", "user_id":2, "name":"Ben", "name_on_account":"Benjamin Blaker",
                 "is_international":"false", "sort_code":"523456", "account_number":"58765432",
                 "BIC_code":"NA", "IBAN_number":"NA", "paying_description":"NA"}
    insert_by_db_schema("users", database_schemas["users"], user_data2)
    data = {"splitter_name":"debug", "payer_id":1, "amount":30, "shares":{1:2, 2:3}}
    add_transaction(data)
    data2 = {"splitter_name":"debug", "name":"Ann", "sort_code":"444444"}
    add_user(data2)
    delete_user(3, "debug")
    return "Successfully populated database."
    
if __name__ == '__main__':
    app.run(port=5000)