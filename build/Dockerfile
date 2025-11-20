# Multi-stage Dockerfile for Novatra
# Final image will be <50MB

# Build stage
FROM golang:1.23-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata upx

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application with CGO disabled for static compilation
RUN CGO_ENABLED=0 GOOS=linux go build \
    -a -installsuffix cgo \
    -ldflags='-w -s -extldflags "-static"' \
    -gcflags="-l=4" \
    -o novatra-server ./cmd/api

# Compress the binary with UPX
RUN upx --best --lzma novatra-server

# Runtime stage
FROM alpine:3.19

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S novatra \
    && adduser -u 1001 -S novatra -G novatra

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/novatra-server .

# Copy config files
COPY --from=builder /app/config ./config

# Change ownership to non-root user
RUN chown -R novatra:novatra /app

# Switch to non-root user
USER novatra

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose ports
EXPOSE 8080 9090

# Add labels
LABEL maintainer="mrdm86@iicloud.school" \
      version="1.0.0" \
      description="Novatra Universal Repository" \
      org.opencontainers.image.source="https://github.com/mrdm86/novatra1"

# Run the application
CMD ["./novatra-server"]