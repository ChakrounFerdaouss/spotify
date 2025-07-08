from flask import Flask
from flask_cors import CORS
from .database import init_db
from .auth_routes import auth_bp
from .playlist_routes import playlist_bp
from .spotify_routes import spotify_bp

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000"])  # CORS pour React
    init_db(app)
    app.register_blueprint(auth_bp)
    app.register_blueprint(playlist_bp)
    app.register_blueprint(spotify_bp, url_prefix="/spotify")
    return app
