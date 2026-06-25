FROM python:3.13-slim

WORKDIR /app

RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY clustered_tsp.py optimizer_service.py config.json ./

EXPOSE 8001

CMD ["uvicorn", "optimizer_service:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
