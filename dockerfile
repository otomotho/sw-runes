FROM nginx:alpine
COPY index.html style.css script.js /usr/share/nginx/html/
COPY icons /usr/share/nginx/html/icons/
COPY version.txt /usr/share/nginx/html/
COPY fonts /usr/share/nginx/html/fonts/
EXPOSE 80