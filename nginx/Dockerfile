# Nginx Load Balancer Dockerfile for Production
FROM nginx:alpine

# Install required packages
RUN apk add --no-cache \
    openssl \
    curl \
    bash \
    certbot \
    python3 \
    py3-pip

# Install certbot nginx plugin using pip with --break-system-packages flag
RUN pip3 install --break-system-packages certbot-nginx

# Create necessary directories
RUN mkdir -p /etc/nginx/ssl \
    /var/www/certbot \
    /etc/letsencrypt/live/3xbat.com

# Generate self-signed SSL certificate for initial startup
RUN openssl req -x509 -nodes -days 1 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=3xbat/CN=3xbat.com"

# Copy nginx configurations
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-production.conf /etc/nginx/nginx-production.conf

# Set up nginx user permissions (user already exists in nginx:alpine)
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /var/www/certbot && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Create SSL setup and renewal scripts
RUN echo '#!/bin/bash\n\
# Check if Let'\''s Encrypt certificates exist\n\
if [ -f "/etc/letsencrypt/live/3xbat.com/fullchain.pem" ]; then\n\
    echo "Using Let'\''s Encrypt certificates"\n\
    cp /etc/nginx/nginx-production.conf /etc/nginx/nginx.conf\n\
else\n\
    echo "Using self-signed certificates for initial startup"\n\
fi\n\
nginx -s reload' > /usr/local/bin/switch-to-production.sh && \
    chmod +x /usr/local/bin/switch-to-production.sh

# Create certificate renewal script
RUN echo '#!/bin/bash\n\
certbot renew --quiet --nginx\n\
/usr/local/bin/switch-to-production.sh' > /usr/local/bin/renew-certs.sh && \
    chmod +x /usr/local/bin/renew-certs.sh

# Create health check script
RUN echo '#!/bin/bash\ncurl -f http://localhost:8080/nginx_status || exit 1' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Expose ports
EXPOSE 80 443 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /healthcheck.sh

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 