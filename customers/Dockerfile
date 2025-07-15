FROM python:3.12-alpine
WORKDIR /app 
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ./customers .
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD pgrep -f "python main.py" || exit 1
CMD [ "python", "main.py" ]

