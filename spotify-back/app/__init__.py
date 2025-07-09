from flask import Flask, request
from flask_cors import CORS
from .database import init_db
from .auth_routes import auth_bp
from .playlist_routes import playlist_bp
from .spotify_routes import spotify_bp
from .reports_routes import reports_bp

def create_app():
    app = Flask(__name__)
    
    # Configuration CORS automatique
    CORS(app,
         origins=["http://localhost:3000"],
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Authorization", "Content-Type"]
    )

    # Gestion manuelle des requêtes OPTIONS (preflight)
    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            resp = app.make_default_options_response()
            headers = resp.headers
            headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
            headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
            headers["Access-Control-Allow-Credentials"] = "true"
            return resp

    init_db(app)
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(playlist_bp)
    app.register_blueprint(spotify_bp, url_prefix="/spotify")
    app.register_blueprint(reports_bp, url_prefix="/reports")
    return app
