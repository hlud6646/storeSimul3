FROM python:3.11-alpine
WORKDIR /app
RUN apk --no-cache add curl
COPY ./server.py .
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1
CMD ["python", "./server.py"]
