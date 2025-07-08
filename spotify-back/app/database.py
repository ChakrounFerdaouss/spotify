from flask import g
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

def init_db(app):
    client = MongoClient(os.getenv("MONGODB_URI"))
    app.db = client.spotify_app