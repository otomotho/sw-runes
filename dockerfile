FROM nginx:alpine
COPY index.html style.css script.js /usr/share/nginx/html/
COPY icons /usr/share/nginx/html/icons/
EXPOSE 80