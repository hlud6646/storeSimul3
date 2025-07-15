FROM python:3.12-alpine
WORKDIR /app 
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apk add --no-cache curl
COPY ./api.py .
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8005/health || exit 1
CMD [ "python", "api.py" ]

