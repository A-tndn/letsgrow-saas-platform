# LetsGrow Deployment Guide

## Quick Start (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/letsgrow.git
   cd letsgrow
   ```

2. **Run setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure environment variables**
   Edit `.env` file with your API keys:
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   TWITTER_CLIENT_ID=your-twitter-client-id
   TWITTER_CLIENT_SECRET=your-twitter-client-secret
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/docs

## Production Deployment

### 1. Server Requirements

- **Minimum**: 2 CPU cores, 4GB RAM, 50GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 100GB SSD
- **OS**: Ubuntu 20.04+ or any Docker-compatible Linux

### 2. Domain Setup

1. Point your domain to the server IP
2. Set up SSL certificates (Let's Encrypt recommended)
3. Update environment variables with production URLs

### 3. Production Environment

1. **Copy production environment**
   ```bash
   cp .env.example .env.prod
   ```

2. **Configure production variables**
   ```bash
   # Database
   DATABASE_URL=postgresql://user:pass@postgres:5432/letsgrow

   # Security
   SECRET_KEY=your-production-secret-key-64-chars-long
   ENCRYPTION_KEY=your-encryption-key

   # URLs
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

3. **Deploy with production compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### 4. SSL Setup

1. **Install Certbot**
   ```bash
   sudo apt install certbot
   ```

2. **Generate SSL certificates**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

3. **Copy certificates to nginx directory**
   ```bash
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
   ```

### 5. Monitoring & Maintenance

1. **View logs**
   ```bash
   docker-compose logs -f [service_name]
   ```

2. **Update application**
   ```bash
   git pull origin main
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Database backup**
   ```bash
   docker-compose exec postgres pg_dump -U letsgrow letsgrow > backup.sql
   ```

4. **Health checks**
   ```bash
   curl http://localhost/health
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` |
| `SECRET_KEY` | Flask secret key (64+ chars) | `your-secret-key` |
| `OPENAI_API_KEY` | OpenAI API key for content generation | `sk-...` |

### Social Media APIs

| Platform | Variables | Where to get |
|----------|-----------|--------------|
| Twitter | `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` | https://developer.twitter.com |
| Instagram | `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET` | https://developers.facebook.com |
| LinkedIn | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | https://www.linkedin.com/developers |
| Reddit | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | https://www.reddit.com/prefs/apps |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAIL_SERVER` | SMTP server for emails | `localhost` |
| `MAIL_PORT` | SMTP port | `587` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │     Frontend    │
│  (Reverse Proxy)│◄──►│   (Next.js)     │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│     Backend     │    │      Redis      │
│    (Flask)      │◄──►│    (Cache)      │
└─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Celery      │
│   (Database)    │    │   (Workers)     │
└─────────────────┘    └─────────────────┘
```

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check if PostgreSQL container is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **Redis connection failed**
   - Check if Redis container is running
   - Verify REDIS_URL format

3. **API keys not working**
   - Verify API keys are correctly set in .env
   - Check if services are properly configured
   - Review platform-specific API documentation

4. **Frontend not loading**
   - Check if backend is accessible
   - Verify NEXT_PUBLIC_API_URL is correct
   - Check browser console for errors

### Getting Help

1. Check logs: `docker-compose logs -f`
2. Verify container status: `docker-compose ps`
3. Test API health: `curl http://localhost:5000/health`
4. Check frontend health: `curl http://localhost:3000`

## Security Checklist

- [ ] Use strong SECRET_KEY (64+ random characters)
- [ ] Enable SSL/HTTPS in production
- [ ] Set up firewall (allow only ports 80, 443, 22)
- [ ] Use environment variables for sensitive data
- [ ] Regular security updates
- [ ] Monitor API usage and rate limits
- [ ] Backup database regularly
- [ ] Use strong database passwords
- [ ] Enable logging and monitoring

## Performance Optimization

1. **Database optimization**
   - Add indexes for frequently queried fields
   - Regular VACUUM and ANALYZE operations
   - Monitor query performance

2. **Redis optimization**
   - Configure appropriate memory limits
   - Monitor cache hit rates
   - Use Redis clustering for high traffic

3. **Application optimization**
   - Monitor Celery queue lengths
   - Scale workers based on load
   - Implement proper error handling and retries

4. **Frontend optimization**
   - Enable Next.js image optimization
   - Use CDN for static assets
   - Implement proper caching strategies