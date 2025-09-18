import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Database - Single PostgreSQL database only
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    @classmethod
    def init_app(cls, app):
        """Initialize application with database checks"""
        if not cls.SQLALCHEMY_DATABASE_URI:
            print("⚠️  DATABASE_URL not configured - use /api/setup/initialize for initial setup")
            return False
        return True

    # Redis
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379'
    CACHE_TYPE = "redis"
    CACHE_REDIS_URL = REDIS_URL

    # Celery
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL

    # API Rate Limiting
    RATELIMIT_STORAGE_URL = REDIS_URL
    RATELIMIT_DEFAULT = "1000 per hour"

    # File Upload
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'

    # External APIs
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

    # Social Media APIs
    TWITTER_CLIENT_ID = os.environ.get('TWITTER_CLIENT_ID')
    TWITTER_CLIENT_SECRET = os.environ.get('TWITTER_CLIENT_SECRET')

    FACEBOOK_APP_ID = os.environ.get('FACEBOOK_APP_ID')
    FACEBOOK_APP_SECRET = os.environ.get('FACEBOOK_APP_SECRET')

    INSTAGRAM_CLIENT_ID = os.environ.get('INSTAGRAM_CLIENT_ID')
    INSTAGRAM_CLIENT_SECRET = os.environ.get('INSTAGRAM_CLIENT_SECRET')

    LINKEDIN_CLIENT_ID = os.environ.get('LINKEDIN_CLIENT_ID')
    LINKEDIN_CLIENT_SECRET = os.environ.get('LINKEDIN_CLIENT_SECRET')

    REDDIT_CLIENT_ID = os.environ.get('REDDIT_CLIENT_ID')
    REDDIT_CLIENT_SECRET = os.environ.get('REDDIT_CLIENT_SECRET')

    # Email
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'localhost'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')

    # JWT
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # CORS
    CORS_ORIGINS = ['http://localhost:3000', 'https://localhost:3000']

class DevelopmentConfig(Config):
    DEBUG = True
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

class ProductionConfig(Config):
    DEBUG = False
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '').split(',')

class TestingConfig(Config):
    TESTING = True
    # Use a test PostgreSQL database if available, otherwise skip database-dependent tests
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL', os.environ.get('DATABASE_URL'))
    WTF_CSRF_ENABLED = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
