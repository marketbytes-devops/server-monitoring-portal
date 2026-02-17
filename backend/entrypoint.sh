#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Wait for the database to be ready (optional but recommended if not using depends_on condition)
# You might want to use a tool like netcat (nc) to wait for the port, 
# but docker-compose depends_on healthcheck is usually sufficient.

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:8000 config.wsgi:application
