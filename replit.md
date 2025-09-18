# LetsGrow - Social Media Automation Platform

## Overview

LetsGrow is a dual-approach social media growth platform that serves both autonomous users seeking complete hands-off automation and personal content creators who want data-driven insights for their own content. The platform combines AI-powered content generation, smart scheduling, growth automation, and comprehensive analytics to maximize social media presence across multiple platforms.

The system offers two primary user paths:
- **Autonomous Growth**: Complete automation with AI-generated content, automated engagement, and hands-off growth strategies
- **Personal Creator Support**: Advanced analytics, content optimization insights, and personalized recommendations for users creating their own content

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with TypeScript for a modern, type-safe React application
- **Styling**: Tailwind CSS with custom design system and component library
- **State Management**: Zustand for client-side state with persistence capabilities
- **Data Fetching**: TanStack Query (React Query) for server state management, caching, and optimistic updates
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Routing**: Next.js App Router for file-based routing and nested layouts

### Backend Architecture
- **Framework**: Flask with SQLAlchemy ORM for Python-based web services
- **Database**: PostgreSQL with Alembic migrations for relational data storage
- **Task Queue**: Celery with Redis for background job processing and scheduling
- **Authentication**: Flask-Login with JWT tokens for session management
- **API Design**: RESTful endpoints with consistent JSON responses and error handling

### Core Services Architecture
- **AI Content Generation**: OpenAI GPT integration for intelligent content creation
- **Social Media Integration**: Platform-specific APIs (Twitter, Instagram, LinkedIn, Reddit) with encrypted token storage
- **Growth Bot Engine**: Autonomous engagement system for following, liking, and commenting within platform limits
- **Analytics Engine**: Real-time performance tracking and trend analysis
- **Recommendation System**: ML-driven insights for content optimization and growth strategies

### Data Storage Solutions
- **Primary Database**: PostgreSQL for user accounts, content queue, social accounts, and analytics
- **Cache Layer**: Redis for session storage, task queue, and frequently accessed data
- **File Storage**: Configurable upload system for media assets
- **Encrypted Storage**: Sensitive tokens and credentials stored with Fernet encryption

### Authentication and Authorization
- **User Authentication**: Email/password with bcrypt hashing
- **Session Management**: JWT tokens with configurable expiration
- **API Security**: Token-based authentication with automatic refresh
- **Social OAuth**: Platform-specific OAuth flows for social media account linking

### Background Processing
- **Content Scheduling**: Automated posting at optimal times across platforms
- **Growth Automation**: Safe, compliant engagement activities
- **Analytics Collection**: Periodic data fetching and performance metrics calculation
- **Weekly Reports**: Automated generation of growth insights and recommendations

## External Dependencies

### AI and Content Services
- **OpenAI API**: GPT models for content generation, hashtag suggestions, and trend analysis
- **Content Intelligence**: AI-powered niche analysis and viral prediction capabilities

### Social Media Platform APIs
- **Twitter API v2**: Tweet posting, engagement data, and user analytics
- **Instagram Graph API**: Photo/video posting and insights (coming soon)
- **LinkedIn API**: Professional content publishing and company updates (coming soon)
- **Reddit API**: Community engagement and content sharing (coming soon)

### Infrastructure Services
- **Redis**: In-memory data structure store for caching and task queue management
- **PostgreSQL**: Primary relational database for persistent data storage
- **Celery**: Distributed task queue for background job processing

### Development and Monitoring
- **Flask-CORS**: Cross-origin resource sharing for API access
- **Flask-Migrate**: Database schema versioning and migrations
- **Flask-Limiter**: API rate limiting and abuse prevention
- **React Hot Toast**: User notification system for frontend feedback

### Security and Encryption
- **Cryptography**: Fernet symmetric encryption for sensitive token storage
- **PyJWT**: JSON Web Token implementation for secure authentication
- **bcrypt**: Password hashing for user account security

The architecture prioritizes scalability, security, and user experience while maintaining platform compliance and providing both automated and manual content management workflows.

## Port Configuration & Remix Guidelines

### Port Allocation
- **Frontend**: Port 5000 (required by Replit for webview display)
- **Backend**: Port 8000 (Flask default, communicates with frontend via proxy)

### Post-Remix Setup
When remixing this app, the following may be required:
1. **Database Setup**: Click the "Setup App (One-Click)" button on the homepage to initialize PostgreSQL
2. **Port Conflicts**: Both workflows include automatic port cleanup to prevent conflicts
3. **Environment Variables**: DATABASE_URL will be auto-configured during setup

### Workflow Configuration
- Frontend workflow: `cd frontend && bash startup.sh` (includes automatic port cleanup)
- Backend workflow: `cd backend && python wsgi.py` (direct startup for stable server process)
- Replit automatically manages port conflicts through workflow restart system

### Troubleshooting
- If setup fails: Check that DATABASE_URL environment variable is set
- If port conflicts occur: Restart both workflows - they include automatic cleanup
- If database connection fails: Use the setup button to reinitialize database tables