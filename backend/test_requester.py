import requests
from pprint import pprint

LOCAL_ADDRESS = 'http://127.0.0.1:5000'

transaction_api = "/transactions/1"

r = requests.get(LOCAL_ADDRESS + transaction_api)

pprint(r.json())