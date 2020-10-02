const socket = io()     //To connect to the server

// HTML Elements - Staring '$' is just for my convention to refer it html element
const $joinForm = document.querySelector('form')              
const $joinRoom = $joinForm.querySelector('#room')
const $joinButton = $joinForm.querySelector('button')
const $joinSelect = $joinForm.querySelector('select')
$joinSelect.setAttribute('disabled','disabled')


// const option1 = document.createElement('option')
// const option2 = document.createElement('option')
// const option3 = document.createElement('option')
// option1.textContent ='option1'
// option2.textContent ='option2'
// option3.textContent ='option3'

// $joinSelect.appendChild(option1)
// $joinSelect.appendChild(option2)
// $joinSelect.appendChild(option3)


$joinSelect.addEventListener('change',(e)=>{
    //console.log(e.target.value)
    $joinRoom.value = e.target.value
})

socket.emit('openingRooms', (ack)=>{     // callback (3rd argumet) for acknowledgement
    if(ack){
        return console.log(ack)
    }
})

socket.on('rooms',(rooms)=>{
    $joinSelect.innerHTML="<option></option>"
    rooms.forEach((room) => {
        $joinSelect.removeAttribute('disabled')
        const option = document.createElement('option')
        option.textContent = room
        $joinSelect.appendChild(option)
    })

})

