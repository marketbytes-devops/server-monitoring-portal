#!/bin/bash
set -e

echo "Waiting for MySQL to be ready..."
while ! python -c "
import MySQLdb
import os
try:
    MySQLdb.connect(
        host=os.getenv('DB_HOST', 'db'),
        user=os.getenv('DB_USER', 'monitor_user'),
        passwd=os.getenv('DB_PASSWORD', 'monitor_password'),
        db=os.getenv('DB_NAME', 'monitor_portal_db'),
        port=int(os.getenv('DB_PORT', '3306'))
    )
    print('MySQL is ready!')
except Exception as e:
    print(f'MySQL not ready: {e}')
    exit(1)
" ; do
    echo "MySQL is unavailable - sleeping 3s..."
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
