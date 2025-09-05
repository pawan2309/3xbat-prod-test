#!/bin/bash

# Generate SSL Certificates for 3xbat Development
# This script creates self-signed certificates for local development

echo "🔐 Generating SSL certificates for 3xbat development..."

# Create SSL directory
mkdir -p ssl

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out ssl/key.pem 2048

# Generate certificate signing request
echo "📝 Generating certificate signing request..."
openssl req -new -key ssl/key.pem -out ssl/cert.csr -subj "/C=US/ST=State/L=City/O=3xbat/CN=localhost"

# Generate self-signed certificate
echo "📝 Generating self-signed certificate..."
openssl x509 -req -in ssl/cert.csr -signkey ssl/key.pem -out ssl/cert.pem -days 365

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# Clean up CSR file
rm ssl/cert.csr

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates saved in: ./ssl/"
echo "🔑 Private key: ssl/key.pem"
echo "📜 Certificate: ssl/cert.pem"
echo ""
echo "⚠️  Note: These are self-signed certificates for development only."
echo "   For production, use proper SSL certificates from a trusted CA." 