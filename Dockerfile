FROM node:14
EXPOSE 5000
RUN mkdir /home/node/app
RUN yarn global add serve @angular/cli
COPY ./ /home/node/app
WORKDIR /home/node/app
RUN yarn install && ng build --configuration production
ENTRYPOINT ["serve", "dist/sanakampa/"]
