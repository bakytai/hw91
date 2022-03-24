const express = require('express');
const cors = require('cors');
const {nanoid} = require('nanoid');
const app = express();

require('express-ws')(app);

const port = 8000;

app.use(cors());

const activeConnections = {};


app.ws('/chat', (ws, req) => {
    const id = nanoid();
    console.log('client connected! id=', id);
    activeConnections[id] = ws;

    let username = 'Anonymus';

    ws.on('message', (msg) => {
        const decodedMessage = JSON.parse(msg);
        switch (decodedMessage.type) {
            case 'SET_USERNAME':
                username = decodedMessage.username;
                break;
            case 'SEND_MESSAGE':
                Object.keys(activeConnections).forEach(id => {
                    const conn = activeConnections[id];
                    conn.send(JSON.stringify({
                        type: 'NEW_MESSAGE',
                        message: {
                            username,
                            text: decodedMessage.text
                        }
                    }))
                })
                break;
            default:
                console.log('Unknown message type:', decodedMessage.type);
        }
    })

    ws.on('close', () => {
        console.log('client disconnected! id=', id);
        delete activeConnections[id]
    });
});



app.listen(port, () => {
    console.log(`Server started on ${port} port!`)
});