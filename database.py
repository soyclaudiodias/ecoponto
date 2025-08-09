from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()  # lê o arquivo .env e coloca as variáveis no ambiente

def conectar():
    conexao = mysql.connector.connect(
        host=os.environ["MYSQL_HOST"],
        port=int(os.environ["MYSQL_PORT"]),
        user=os.environ["MYSQL_USER"],
        password=os.environ["MYSQL_PASSWORD"],
        database=os.environ["MYSQL_DATABASE"]
    )
    return conexao
