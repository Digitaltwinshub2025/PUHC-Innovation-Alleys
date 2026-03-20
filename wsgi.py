"""
WSGI entry point for production deployment
"""
from app import app, socketio

if __name__ == "__main__":
    socketio.run(app)
