import { app } from './app.js';

const port = Number(process.env.PORT || 3000);

const server = app;

server.listen(port, () => {
  console.log(`Server started at PORT : ${port}`);
});
