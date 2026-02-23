# Deploying to Hostinger VPS with Docker

This guide will help you deploy your Django + React application to a Hostinger VPS using Docker, configured for your specific domains.

## Domains

-   **Frontend**: `http://mbinfrawatch.marketbytes.in`
-   **Backend**: `http://backendmbinfrawatch.marketbytes.in`

## Prerequisites

1.  **A Hostinger VPS**: Using Ubuntu 22.04 or 20.04.
2.  **DNS Records**:
    -   Add an **A Record** for `mbinfrawatch` pointing to your VPS IP.
    -   Add an **A Record** for `backendmbinfrawatch` pointing to your VPS IP.
3.  **This Codebase**: Clone it onto your server.

## Step 1: Connect to your VPS

```bash
ssh root@your_vps_ip_address
```

## Step 2: Install Docker and Docker Compose

```bash
apt-get update
apt-get install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
```

## Step 3: deploy

1.  Navigate to your project folder (e.g., `cd website-monitoring-portal`).
2.  **Crucial**: Ensure `docker-compose.yml` has the correct `VITE_API_URL` build argument. It is already set to `http://backendmbinfrawatch.marketbytes.in`.

3.  Run the containers:

```bash
docker-compose up -d --build
```

## Step 4: Verify Deployment

1.  Visit `http://mbinfrawatch.marketbytes.in`. You should see the login page or dashboard.
2.  Open Developer Tools (F12) -> Network.
3.  Perform an action that fetches data. The request should go to `http://backendmbinfrawatch.marketbytes.in/...`.

## Troubleshooting

-   **502 Bad Gateway**: Check if the backend is running: `docker-compose logs -f backend`.
-   **CORS Errors**: Check the browser console. Use `docker-compose logs -f backend` to see if Django is rejecting the Origin.
-   **Static Files**: If styles are missing on the backend admin (`http://backendmbinfrawatch.marketbytes.in/admin`), run:
    ```bash
    docker-compose exec backend python manage.py collectstatic
    ```

## Step 5: Nginx Configuration (On VPS Host)

Create a new Nginx configuration file: `/etc/nginx/sites-available/mbinfrawatch`

```nginx
# Frontend: mbinfrawatch.marketbytes.in
server {
    listen 80;
    server_name mbinfrawatch.marketbytes.in;

    location / {
        proxy_pass http://localhost:6301;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend: backendmbinfrawatch.marketbytes.in
server {
    server_name backendmbinfrawatch.marketbytes.in;

    location / {
        proxy_pass http://localhost:6300;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> [!NOTE]
> We skip the `/static/` and `/media/` aliases on the host Nginx. Instead, we let **WhiteNoise** inside the Django container serve them. This prevents permission errors where Nginx might be blocked from accessing your `/root/` folder.

Enable the site and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/mbinfrawatch /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 6: SSL with Certbot

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d mbinfrawatch.marketbytes.in -d backendmbinfrawatch.marketbytes.in
```

## Production Security Checklist

1. [ ] `DEBUG=False` in `backend/.env`
2. [ ] `SECRET_KEY` changed to a random string.
3. [ ] `ALLOWED_HOSTS` includes your domain.
4. [ ] CSRF and Session cookies are secure (set automatically by `settings.py` when `DEBUG=False`).
