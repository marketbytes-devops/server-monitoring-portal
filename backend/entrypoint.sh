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

echo "Collect complete."

# Execute the CMD from Dockerfile or command from docker-compose
exec "$@"
