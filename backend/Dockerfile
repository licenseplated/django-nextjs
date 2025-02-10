FROM python:3.11-slim

WORKDIR /app
COPY . /app/

RUN pip install -e .

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]

