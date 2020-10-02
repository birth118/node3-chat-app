const http = require('http')
const express = require('express')
const path = require('path') 
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')

const {addUser, 
    removeUser,
    getUser, 
    getUsersInRoom, 
    getRooms
} = require('./utils/users')

const app = express()
const server = http.createServer(app)   
const io = socketio(server)     //*socketio piggy backs raw http 

const port = process.env.PORT || 3000

const publicDir = path.join(__dirname,'../public')  // To joind current directory (__dirname) + '../public' directory
app.use(express.static(publicDir))

// let count = 0


// * server emit --> client reveive - countUpdated event
// * client emit --> server receive - increment event

io.on('connection',(socket)=>{      // Server listening 'connection' from client (built-in event)
                                    // 'socket' created as a client connected
                                    // 'io' is systmer level, 'socket' is each connection level
                                    // therefore io.emit() is *broadcasting*
                                    // Meanwhile, socket.emit() is to emit to the specific client.
    console.log('new socket connection')    

    
    socket.on('openingRooms',(callback)=>{
        const rooms=   getRooms()
        if(rooms.length < 1){
            return callback('no rooms open')
        }
        socket.emit('rooms',rooms)
        callback()
    })

    socket.on('join', ({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, username, room})  // Powerful object assignment in decomposition

        if(error){
           return  callback(error)             // To ack Error the client browser
        }

        socket.join(user.room)                       // Wow! socket.io has a method that supports 'joining a room'

        // socket.emit(), io.emit(), socket.broadcast.emit()
        // io.to.emit() - send to everyone in a specific room including you
        // socket.broadcast.to.emit() - send to others in a room except you

        // To the joiner: you
        socket.emit('message', generateMessage('Admin',`Welcome, ${user.username}!`))       
     
        // To emit only to the self-connection 
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))         // To emit to all execept the self-socket connection
        io.to(user.room).emit('roomData',{
            room: user.room,
            users : getUsersInRoom(user.room)
        })
        callback()              // To ack No Error the client browser
    })

    socket.on('clientMessage',(msg, callback)=>{  // server socket listening 'clientMessage' from client.
        const user = getUser(socket.id)
        if(!user){                      // In what case the user doesn't exist? Never as socket is created and users array not broken
            return callback('No user')
        }
        filter = new Filter()
        if(filter.isProfane(msg)){
            return fn('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,msg))                    // To emit to all
        callback()                                      // 'fn' callback To give ack to connections with a message
    })

    socket.on('sendLocation',(coords, callback)=>{  // server socket listening 'sendLocation' from client.
        const user = getUser(socket.id)

        if(!user){    // In what case the user doesn't exist? Never as socket is created and users array not broken
            return callback('No user')
        }
        const url = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, url))                               // To emit to all
        return callback()          // 'fn' callback To give ack to connections with a message
    })

    socket.on('disconnect',()=>{     // Socket listening 'disconnect' from client (built-in event)
        const user = removeUser(socket.id)

        if (user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`)) 
            io.to(user.room).emit('roomData',{
                room: user.room,
                users : getUsersInRoom(user.room)
            })
        }


    })  

})

// Instead of usting app.listen(), to use http.server.listen() to setup socket.io
// For normal webserver opertaions, app.listen() is enough.

// *app.listen(port,()=>{  
server.listen(port,()=>{  
    console.log('Server up: ' + port)
})