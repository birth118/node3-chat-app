let users =[]

// addUser, removeUser, getUser, getUsersInRoom


const addUser =({id, username, room})=>{
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room){
        return {
            error:'username and room are required'
        }
    }

    // Check for exising user
    const existingUser = users.find((user)=>{
        return  user.room===room&&user.username===username
    })

    // validate usertname
    if(existingUser){
        return {
            error: 'Username is in use'
        }
    }

    // Store the user if all good
    const user = { id, username, room}
    users.push(user)
    return {user}
}

const removeUser =(id)=>{
        //return users = users.filter((user)=>user.id !==id)
        
        const index = users.findIndex((user)=>user.id === id)
        // findIndex() is faster because it stops when found
        // Meanwhile filter() continues to the end.
        if(index !== -1){
            return users.splice(index, 1)[0]
        }       

}

const getUser = (id)=>{
    return users.find((user)=>user.id === id)
}

const getUsersInRoom =(room)=>{
    return  users.filter((user)=>user.room === room.trim().toLowerCase())
    
}

addUser({
    id: 202,
    username: 'Pete',
    room: ' South B ank'
})

addUser({
    id: 200,
    username: 'Kirby',
    room: ' South B ank'
})

addUser({
    id: 199,
    username: 'Paula',
    room: ' Street 1'
})

module.exports  = {
    addUser, 
    removeUser,
    getUser, 
    getUsersInRoom
}