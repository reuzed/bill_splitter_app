import sqlite3

DATABASE = 'bill_splitter.db'

def setup():
    input("Are you sure you want to reset tables?")
    con = sqlite3.connect(DATABASE)
    cur = con.cursor()

    cur.execute("DROP TABLE transactions")
    cur.execute("DROP TABLE transaction_splits")
    cur.execute("DROP TABLE users")
    
    cur.execute(
        "CREATE TABLE transactions(transaction_id, payer, amount, date)"
    )

    cur.execute(
        "CREATE TABLE transaction_splits(transaction_id, recipient, share)"
    )

    cur.execute(
        "CREATE TABLE users(user_id, name, bank_details)"
    )

    con.commit()
    con.close()

def test_add():
    con = sqlite3.connect(DATABASE)
    cur = con.cursor()

    cur.execute(
        "INSERT INTO transactions VALUES(?,?,?,?)", [17, 'Reuben', '1000', 'Today']
    )

    con.commit()
    con.close()

if __name__ == '__main__':
    setup()