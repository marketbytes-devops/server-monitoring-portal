#!/bin/bash
set -e

echo "Waiting for MySQL to be ready..."
while ! python manage.py check > /dev/null 2>&1; do
    echo "MySQL is unavailable or system initializing - sleeping 3s..."
    sleep 3
done

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
