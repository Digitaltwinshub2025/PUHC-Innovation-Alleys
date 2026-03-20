"""
Database models for Alley Bloom
Supports user authentication, scenario persistence, and collaboration tracking
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    """User model for authentication and collaboration tracking"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120))
    role = db.Column(db.String(20), default='user')  # user, designer, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    scenarios = db.relationship('Scenario', backref='creator', lazy=True, foreign_keys='Scenario.created_by')
    collaborations = db.relationship('Collaboration', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }

class Scenario(db.Model):
    """Scenario model for persistent storage of alley designs"""
    __tablename__ = 'scenarios'
    
    id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(255), nullable=False, index=True)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False)  # baseline, vision, hybrid
    alley_id = db.Column(db.String(50), nullable=False, index=True)
    location = db.Column(db.JSON)
    dimensions = db.Column(db.JSON)
    phase = db.Column(db.String(50))
    layers = db.Column(db.JSON, default=list)
    environmental_data = db.Column(db.JSON)
    notes = db.Column(db.Text)
    
    # Metadata
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_public = db.Column(db.Boolean, default=False)
    version = db.Column(db.Integer, default=1)
    
    # Relationships
    versions = db.relationship('ScenarioVersion', backref='scenario', lazy=True, cascade='all, delete-orphan')
    collaborations = db.relationship('Collaboration', backref='scenario', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'alley_id': self.alley_id,
            'location': self.location,
            'dimensions': self.dimensions,
            'phase': self.phase,
            'layers': self.layers or [],
            'environmental_data': self.environmental_data,
            'notes': self.notes,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'is_public': self.is_public,
            'version': self.version
        }

class ScenarioVersion(db.Model):
    """Version history for scenarios (undo/redo support)"""
    __tablename__ = 'scenario_versions'
    
    id = db.Column(db.Integer, primary_key=True)
    scenario_id = db.Column(db.String(100), db.ForeignKey('scenarios.id'), nullable=False, index=True)
    version_number = db.Column(db.Integer, nullable=False)
    data = db.Column(db.JSON, nullable=False)
    change_description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'scenario_id': self.scenario_id,
            'version_number': self.version_number,
            'data': self.data,
            'change_description': self.change_description,
            'created_at': self.created_at.isoformat(),
            'created_by': self.created_by
        }

class Collaboration(db.Model):
    """Track real-time collaboration on scenarios"""
    __tablename__ = 'collaborations'
    
    id = db.Column(db.Integer, primary_key=True)
    scenario_id = db.Column(db.String(100), db.ForeignKey('scenarios.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    status = db.Column(db.String(20), default='viewing')  # viewing, editing, idle
    cursor_position = db.Column(db.JSON)  # x, y coordinates
    last_activity = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    session_id = db.Column(db.String(100), index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'scenario_id': self.scenario_id,
            'user_id': self.user_id,
            'status': self.status,
            'cursor_position': self.cursor_position,
            'last_activity': self.last_activity.isoformat(),
            'session_id': self.session_id
        }

class Export(db.Model):
    """Track exports for audit and recovery"""
    __tablename__ = 'exports'
    
    id = db.Column(db.Integer, primary_key=True)
    scenario_id = db.Column(db.String(100), db.ForeignKey('scenarios.id'), nullable=False, index=True)
    export_type = db.Column(db.String(50), nullable=False)  # pdf, json, png, unreal
    file_path = db.Column(db.String(255))
    file_size = db.Column(db.Integer)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    export_metadata = db.Column(db.JSON)
    
    def to_dict(self):
        return {
            'id': self.id,
            'scenario_id': self.scenario_id,
            'export_type': self.export_type,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'export_metadata': self.export_metadata
        }
