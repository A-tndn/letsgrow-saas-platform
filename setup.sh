#!/bin/bash

# LetsGrow Platform Setup Script
# This script sets up the complete LetsGrow platform for development or production

set -e  # Exit on any error

echo "🚀 LetsGrow Platform Setup"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi

    print_status "Docker and Docker Compose are installed ✓"
}

# Check if Node.js is installed (for local development)
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Required for local development."
        echo "Visit: https://nodejs.org/"
        return 1
    fi

    NODE_VERSION=$(node -v | cut -d. -f1 | cut -dv -f2)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version 18 or higher is recommended. Current version: $(node -v)"
    else
        print_status "Node.js $(node -v) is installed ✓"
    fi
}

# Check if Python is installed (for local development)
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_warning "Python 3 is not installed. Required for local development."
        echo "Visit: https://www.python.org/downloads/"
        return 1
    fi

    PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    if python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)'; then
        print_status "Python $PYTHON_VERSION is installed ✓"
    else
        print_warning "Python 3.9+ is recommended. Current version: $PYTHON_VERSION"
    fi
}

# Setup environment files
setup_environment() {
    print_header "\n📝 Setting up environment files"

    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            print_status "Created backend/.env from example"
        else
            print_error "backend/.env.example not found"
            exit 1
        fi
    else
        print_status "backend/.env already exists"
    fi

    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        if [ -f "frontend/.env.local.example" ]; then
            cp frontend/.env.local.example frontend/.env.local
            print_status "Created frontend/.env.local from example"
        else
            print_error "frontend/.env.local.example not found"
            exit 1
        fi
    else
        print_status "frontend/.env.local already exists"
    fi
}

# Generate secure secret keys
generate_secrets() {
    print_header "\n🔐 Generating secure secret keys"

    # Generate random secret key
    SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || python3 -c 'import secrets; print(secrets.token_hex(32))')
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || python3 -c 'import secrets; print(secrets.token_hex(32))')

    # Update backend .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" backend/.env
        sed -i '' "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$JWT_SECRET/" backend/.env
    else
        # Linux
        sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" backend/.env
        sed -i "s/JWT_SECRET_KEY=.*/JWT_SECRET_KEY=$JWT_SECRET/" backend/.env
    fi

    print_status "Generated secure secret keys"
}

# Docker setup
setup_docker() {
    print_header "\n🐳 Setting up Docker environment"

    # Build and start services
    print_status "Building Docker containers..."
    docker-compose build

    print_status "Starting services..."
    docker-compose up -d

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10

    # Initialize database
    print_status "Initializing database..."
    docker-compose exec -T backend flask db upgrade || true

    print_status "Docker environment setup complete!"
}

# Local development setup
setup_local() {
    print_header "\n💻 Setting up local development environment"

    # Backend setup
    if command -v python3 &> /dev/null; then
        print_status "Setting up Python virtual environment..."
        cd backend
        python3 -m venv venv
        source venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        cd ..
        print_status "Backend dependencies installed"
    else
        print_warning "Skipping backend setup - Python not found"
    fi

    # Frontend setup
    if command -v npm &> /dev/null; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
        print_status "Frontend dependencies installed"
    else
        print_warning "Skipping frontend setup - npm not found"
    fi
}

# Health check
health_check() {
    print_header "\n🏥 Performing health check"

    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Docker services are running ✓"

        # Wait a bit for services to fully start
        sleep 5

        # Test API endpoint
        if curl -f -s http://localhost:5000/api/health > /dev/null 2>&1; then
            print_status "Backend API is responding ✓"
        else
            print_warning "Backend API is not responding yet (this is normal on first startup)"
        fi

        # Test frontend
        if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
            print_status "Frontend is responding ✓"
        else
            print_warning "Frontend is not responding yet (this is normal on first startup)"
        fi
    else
        print_warning "Some Docker services may not be running properly"
        docker-compose ps
    fi
}

# Display next steps
show_next_steps() {
    print_header "\n🎉 Setup Complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "============="
    echo ""
    echo "1. 🔑 Configure API Keys (Required):"
    echo "   Edit backend/.env and add your API keys:"
    echo "   - OPENAI_API_KEY (required for AI features)"
    echo "   - TWITTER_API_KEY & TWITTER_API_SECRET (for Twitter integration)"
    echo "   - Other social media API keys as needed"
    echo ""
    echo "2. 🌐 Access Your Platform:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5000"
    echo "   - API Documentation: http://localhost:5000/api/docs"
    echo ""
    echo "3. 🛠️ Development Commands:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Stop services: docker-compose down"
    echo "   - Restart services: docker-compose restart"
    echo ""
    echo "4. 📚 Documentation:"
    echo "   - README.md for detailed information"
    echo "   - Visit http://localhost:3000 for user guides"
    echo ""
    print_status "LetsGrow platform is ready for use! 🚀"
}

# Main execution
main() {
    print_header "Starting LetsGrow Platform Setup\n"

    # Check prerequisites
    check_docker
    check_nodejs
    check_python

    # Setup process
    setup_environment
    generate_secrets

    # Ask user for setup type
    echo ""
    echo "Choose setup type:"
    echo "1) Docker only (recommended for production)"
    echo "2) Docker + Local development"
    echo "3) Local development only"
    echo ""
    read -p "Enter choice (1-3): " setup_choice

    case $setup_choice in
        1)
            setup_docker
            ;;
        2)
            setup_docker
            setup_local
            ;;
        3)
            setup_local
            ;;
        *)
            print_error "Invalid choice. Defaulting to Docker setup."
            setup_docker
            ;;
    esac

    # Perform health check
    if [ "$setup_choice" != "3" ]; then
        health_check
    fi

    # Show completion message
    show_next_steps
}

# Run main function
main "$@"