// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.

// Use the gravatar module, to turn email addresses into avatar images:


var gravatar = require('gravatar');
var fs = require('fs');
var outputFilename = './chat/chatList.json';
var adminList = './chat/adminList.json';
// Export a function, so that we can pass 
// the app and io instances from the app.js file:

module.exports = function(app, io) {

    app.get('/', function(req, res) {
        // var id = Math.round((Math.random() * 1000000));
        var id = 297207;
        // Render views/home.html
        res.redirect('/chat/' + id);
    });

    app.get('/create', function(req, res) {

        // Generate unique id for the room
        //var id = Math.round((Math.random() * 1000000));
        var id = 194207;

        // Redirect to the random room
        res.redirect('/chat/' + id);
    });

    app.get('/chat/:id', function(req, res) {

        // Render the chant.html view
        res.render('chat');
    });

    // Initialize a new socket.io application, named 'chat'
    var chat = io.of('/socket').on('connection', function(socket) {

        // When the client emits the 'load' event, reply with the 
        // number of people in this chat room

        socket.on('load', function(data) {

            if (chat.clients(data).length === 0) {
                socket.emit('peopleinchat', {number: 0, loadStatus: data.loadStatus});
            }
            else if (chat.clients(data).length < 200) {

                socket.emit('peopleinchat', {
                    number: 1,
                    user: chat.clients(data)[0].username,
                    avatar: chat.clients(data)[0].avatar,
                    id: data.id,
                    loadStatus: data.loadStatus
                });
            }
            else if (chat.clients(data).length >= 20) {

                chat.emit('tooMany', {boolean: true});
            }
        });

        // When the client emits 'login', save his name and avatar,
        // and add them to the room
        socket.on('login', function(data) {

            // Only two people per room are allowed
            if (chat.clients(data.id).length < 200) {

                // Use the socket object to store data. Each client gets
                // their own unique socket object

                socket.username = data.user;
                socket.room = data.id;
                socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
                // Tell the person what he should use for an avatar
                socket.emit('img', socket.avatar);
                //Read chat History

                // Add the client to the room
                socket.join(data.id);
                if (chat.clients(data.id).length < 20) {
                    var usernames = [],
                            avatars = [];
                    // Send the startChat event to all the people in the
                    // room, along with a list of people that are in it.
                    fs.readFile(outputFilename, "utf8", function(err, docData) {

                        if (err) {

                        } else {
                            var chatHistory = JSON.parse(docData);
							 var items = [];
							  chatHistory.forEach(function(entry) {
							 // console.log(entry.chatId,"============",data.days,"===================",entry.chatId >= data.days);
                              if (entry.chatId >= data.days) {
                                  items.push(entry);
							     }
							  });
						    var chatDataHistory = items;
							
                            chat.in(data.id).emit('startChat', {
                                boolean: true,
                                id: data.id,
                                users: usernames,
                                avatars: avatars,
                                chatData: chatDataHistory,
                                loadStatus: data.loadStatus
                            });
                        }
                    });
                }
                else {
                    socket.emit('tooMany', {boolean: true});
                }
            }
        });

        // When the client emits 'login', save his name and avatar,
        // and add them to the room
        socket.on('chatHistory', function(data) {

            // Read all chating data from file....
            fs.readFile(outputFilename, "utf8", function(err, docData) {
                if (err) {
                    return console.log(err);
                } else {
                    var chatHistory = JSON.parse(docData);
                    var items = [];
                    chatHistory.forEach(function(entry) {
                        if (entry.chatId >= data.days) {
                            items.push(entry);
                        }
                    });
                    //Read chat History
                    var usernames = [],
                            avatars = [];
                    // Send the startChat event to all the people in the
                    // room, along with a list of people that are in it.
                    var chatHistory = items;
                    chat.in(data.id).emit('startChat', {
                        boolean: true,
                        id: data.id,
                        users: usernames,
                        avatars: avatars,
                        chatData: chatHistory,
                        loadStatus: data.loadStatus
                    });
                }

            });
        });

        //Save Data in chat file
        socket.on('saveChat', function(data) {
            fs.readFile(outputFilename, "utf8", function(err, docData) {
                if (err) {
                    return console.log(err);
                } else {
                    var items = [];
                    var existingData = JSON.parse(docData);
                    // console.log(existingData);
                    var items = existingData;
                    // var jsonObj=existingData
                    var jsonObj = {chatId: data.chatId, sender: data.sender, now: data.time, msg: data.msg};
                    items.push(jsonObj);
                    var jsonString = JSON.stringify(items);

                    fs.writeFile(outputFilename, jsonString, function(err) {
                        if (err) {
                            console.log(err);
                        } else {

                        }
                    });
                }

            });

        });
        //Create Message Id from Here

        socket.on('msgId', function() {

            var idSecond = new Date().getTime()
            socket.emit('setMsgId', {id: idSecond});


        });

        // Somebody left the chat
        socket.on('disconnect', function() {

            // Notify the other person in the chat room
            // that his partner has left

            socket.broadcast.to(this.room).emit('leave', {
                boolean: true,
                room: this.room,
                user: this.username,
                avatar: this.avatar
            });

            // leave the room
            socket.leave(socket.room);
        });

        socket.on('removeChat', function(data) {
            // When the server receives a change request, it sends it to the other person in the room.
            socket.broadcast.in(socket.room).emit('alterMsg', {id: data.id});
            socket.emit('alterMsg', {id: data.id});
            fs.readFile(outputFilename, "utf8", function(err, docData) {
                if (err) {
                    return console.log(err);
                } else {
                    var chatHistory = JSON.parse(docData);
                    var items = [];
                    var jsonString = JSON.stringify(items);
                    fs.writeFile(outputFilename, jsonString, function(err) {
                        if (err) {
                            return  console.log(err);
                        } else {

                        }
                    });

                    chatHistory.forEach(function(entry) {
                        if (entry.chatId == data.id) {
                            var msg = 'This message has been removed...';
                            var jsonObj = {chatId: entry.chatId, sender: entry.sender, now: entry.time, msg: msg, rmvStatus: true};
                            items.push(jsonObj);
                        } else {
                            items.push(entry);
                        }
                    });
                    var jsonString = JSON.stringify(items);
                    fs.writeFile(outputFilename, jsonString, function(err) {
                        if (err) {
                            console.log(err);
                        } else {

                        }
                    });
                }

            });


        });
        // Handle the sending of messages
        socket.on('msg', function(data) {

            // When the server receives a message, it sends it to the other person in the room.
            socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img, id: data.id});
        });
    });
};
