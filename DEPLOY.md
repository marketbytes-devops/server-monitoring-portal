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

## HTTPS (SSL) - Highly Recommended

To enable HTTPS for both domains:

1.  Install Certbot on the host machine:
    ```bash
    apt install certbot
    ```
2.  Stop Nginx (if running on host) or stop the containers temporarily if they bind port 80.
    ```bash
    docker-compose down
    ```
3.  Obtain certificates:
    ```bash
    certbot certonly --standalone -d mbinfrawatch.marketbytes.in -d backendmbinfrawatch.marketbytes.in
    ```
4.  Update `frontend/nginx.conf` to include listen 443 blocks and point to the certificates in `/etc/letsencrypt/live/...`. You will need to mount these volumes in `docker-compose.yml`.

**Alternatively (Easier)**: Use Cloudflare for DNS and enable strict SSL encryption mode, letting Cloudflare handle the certificates. You still need port 80 open on your VPS.
