#!/bin/sh
sed "s|BACKEND_URL_PLACEHOLDER|${BACKEND_URL:-http://localhost:8080}|g" /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"
