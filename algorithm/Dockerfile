FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY clustered_tsp.py optimizer_service.py config.json ./

EXPOSE 8001

CMD ["uvicorn", "optimizer_service:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
