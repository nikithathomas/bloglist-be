const app=require('./app');
const config=require('./utils/config');
const http=require('http');

const httpServer=http.createServer(app);

httpServer.listen(config.PORT,(request,response)=>{
    console.log(`Server started on ${config.PORT}`);
});