const socket = io()     //To connect to the server

// socket.on('countUpdated',(count)=>{      // 'countUpdated' event is synced with the server.emit()
//                                          // 'count' is the 2nd argument that server emit as the 2nd aguement.
//     console.log('The count has been updated:', count)
     
// })

// HTML Elements - Staring '$' is just for my convention to refer it html element
const $messageForm = document.querySelector('#message-form')         
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')
const $selectRoom = document.querySelector('#selectRoom')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationUrlTemplate = document.querySelector('#locationURL-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})    // 'Qs' from https://cdnjs.cloudflare.com/ajax/libs/qs/6.6.0/qs.min.js       
                                                        // browser object 'location' to retrive quey string such as '?username=Pete&room=Street1'

// server (emit) -> client (receive) -> acknowledgement (optional)-> server
// client (emit) -> server (receive) -> acknowledgement -> client

const autoScroll =()=>{
    // To get new message element that is added at the bottom
    const $newMessage = $messages.lastElementChild      

    // To get the height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight  +  newMessageMargin

    // Visible hesight
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if( containerHeight - newMessageHeight <= scrollOffset ){
            $messages.scrollTop = $messages.scrollHeight        // push us to bottom
    }


    console.log(newMessageMargin)
}

socket.on('message',(msg)=>{
    console.log(msg)

    //To populate matching template and render it
    const html = Mustache.render($messageTemplate,{
        username: msg.username,
        message1: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)      //'beforeend' is contant defined ib the library
    
    autoScroll()
})

socket.on('locationMessage',(msg)=>{
    console.log(msg)
    
    //To populate matching template and render it
    const html = Mustache.render($locationUrlTemplate,{
        username: msg.username,
        locationURL: msg.url,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    
    autoScroll()
})

// io.to(user.room).emit('roomData',{
//     room: user.room,
//     users : getUsersInRoom(user.room)
// })

socket.on('roomData',({room, users})=>{
    const html = Mustache.render($sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})


// Form submit for send message
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')      // to diable submit button once it is clicked (submitted)
    //const msg = document.querySelector('input').value
    const msg = $messageFormInput.value
    
    socket.emit('clientMessage', msg, (ack)=>{     // callback (3rd argumet) for acknowledgement
        $messageFormButton.removeAttribute('disabled')          // To enable submit button back once being ack'ed
        $messageFormInput.value=''                              // To clear up the input field      
        $messageFormInput.focus()                               // To get the input field focused
        if(ack){
            return console.log(ack)
        }
        console.log('Message delivered!')
    })   
})



// Sendlocation Button for send location
$sendLocationButton.addEventListener('click',()=>{

    if(!navigator.geolocation){         // browser object 'navigator' to retrive geolocation where the broser runs
        return alert('geolocation is not supported by yoru browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position, err)=>{
        if(err){
            return alert('Something wrong: navigator.geolocation.getCurrentPosition()')
        }

        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(ack)=>{                                             //if ack'ed from server
            if(ack){            // if ack === 'No user"
                alert(ack)
                location.href='/'
            }else{              // if ack === undefined
                $sendLocationButton.removeAttribute('disabled')   
                console.log('Location shared!')
            }

        })
    })
})


socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        location.href='/'   // To route back to the join page
    }
})