#!/usr/bin/env python3
"""
Development server runner for LetsGrow platform
"""
from app import create_app
from config import DevelopmentConfig

if __name__ == '__main__':
    app = create_app(DevelopmentConfig)
    app.run(debug=True, host='0.0.0.0', port=5000)
