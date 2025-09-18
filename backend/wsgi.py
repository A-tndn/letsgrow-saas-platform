import os
from app import create_app

# Create Flask app instance
app = create_app()

if __name__ == '__main__':
    # Get port from environment for flexibility
    port = int(os.environ.get('PORT', 8000))
    # Run the app on all interfaces for Replit environment
    app.run(host='0.0.0.0', port=port, debug=False)