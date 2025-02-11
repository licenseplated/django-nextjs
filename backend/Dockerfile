FROM python:3.11-slim

WORKDIR /app
COPY . /app/

RUN pip install -e .

# Collect static files
RUN python manage.py collectstatic --noinput

EXPOSE 8000
# Use Django development server for hot reloading
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
