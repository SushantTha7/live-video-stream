const express = require('express');
const exphbs = require('express-handlebars');
const routes = require('./routes/web');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const webSocket = require('ws');
const imageDataURI = require('image-data-uri');
const { spawn } = require('child_process');
const { lstat } = require('fs');


const HTTP_PORT = 8000;
const WS_PORT = 8001;
const baseUrl = `http://localhost:${HTTP_PORT}/`;
const FILE_NAME = "./public/images/face_recognition.jpeg";

const wsServer = new webSocket.Server({ port: WS_PORT }, () => {
    console.log(`WS server is listening at ws://localhost:${WS_PORT}`)
});

let connectedClients = [];

wsServer.on('connection', (ws, req) => {
    console.log('Connected');
    // add new connected client
    connectedClients.push(ws);
    // listen for messages from the streamer, the clients will not send anything so we don't need to filter
    // ws.on('message', data => {
    //     data = data.toString();
    //     // console.log('------------------------------------------------------------------------------------------------')
    //     // console.log(data.split(';base64,')[0])
    //     // send the base64 encoded frame to each connected ws
    //     connectedClients.forEach((wsc, i) => {
    //         if (wsc.readyState === wsc.OPEN) { // check if it is still connected
    //             wsc.send(data); // send
    //         } else { // if it's not connected remove from the array of connected ws
    //             connectedClients.splice(i, 1);
    //         }
    //     });
    //     const fileName = "test.jpeg"
        
    //     if (data.split('/')[0] == 'data:image'){
    //         imageDataURI.outputFile(data, fileName)
    //     }
    // });
    ws.on('message', data => {
        data = data.toString();
        if (data.split('/')[0] == 'data:image'){
            imageDataURI.outputFile(data, FILE_NAME)
            // predictedPerson = predict()
            const process = spawn('python', ['./ai/predict.py', FILE_NAME]);
            process.stderr.on('data', (data) => {
                data = data.toString()
                console.error(data)
            });
            process.stdout.on('data', (data) => {
                data = data.toString()
                console.log(data);
                connectedClients.forEach((wsc, i) => {
                    if (wsc.readyState === wsc.OPEN) { // check if it is still connected
                        wsc.send(data); // send
                    } else { // if it's not connected remove from the array of connected ws
                        connectedClients.splice(i, 1);
                    }
                })
            });
            process.on('close', (code) => {
                console.log(`closed process with code id: ${code}`)
            });
        }
    })
});

const predict = () => {
    const process = spawn('python /home/juhel/Documents/projects/nodejs/dmp_mini_project/predict.py')
    process.stdout.on('data', (data) => {
        console.log(data);
    });
    process.on('close', (code) => {
        console.log(`closed process with code id: ${code}`)
    })
}


app.set('view engine', 'hbs');
const handlebars = exphbs.create({
    layoutDir: __dirname + '/views/layouts',
    extname: 'hbs',
    defaultLayout: 'main',
    
    helpers: {
        baseUrl: (path) => {
            return baseUrl + path
        }
    }
});

app.engine('hbs', handlebars.engine);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))


app.use(routes);

app.use((req, res) => {
    res.status(404).render('404', {title: '404'});
});

app.listen(HTTP_PORT, () => {
    console.log(`Listening at port ${HTTP_PORT}`); 
});