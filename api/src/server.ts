import { app } from './app.js';
import { config } from './config.js';

const port = config.PORT;

const server = app;

server.listen(port, () => {
  console.log(`Server started at PORT : ${port}`);
});
