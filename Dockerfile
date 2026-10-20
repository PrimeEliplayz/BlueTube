FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY by/ /usr/share/nginx/html/

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
