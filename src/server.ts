import "reflect-metadata"; 
import express from 'express';
import bodyParser from 'body-parser';
import { createConnection } from 'typeorm';
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from 'swagger-jsdoc';
import fileUpload from 'express-fileupload';

import { router } from './routers/router';
import { routerLogin } from './routers/router_login';
import { checkToken } from './utils/check_token';
import { routerFile } from "./routers/router_file";
import config from './orm_config';


const server = express();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rest API Blog',
      version: '1.0.0',
    },
  },
  apis: ['./src/routers/*.ts'],
};

const openapiSpecification = swaggerDoc(options);

server.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

server.use(express.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(fileUpload({
  createParentPath: true
}));

const PORT = 3000;

createConnection(config).then(async connection => {
  console.log("Connected to DB");
}).catch(error => console.log("TypeORM connection error: ", error));

server.listen(PORT, () => {
  console.info('Server is running!');
});

server.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
});

server.use(checkToken);
server.use(routerLogin);
server.use(router);
server.use(routerFile);
