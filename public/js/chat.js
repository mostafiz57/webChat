// This file is executed in the browser, when people visit /chat/<random id>
var adminList = ['mostafiz', 'david', 'nasim', 'falisman'];
$(function() {

    // getting the id of the room from the url
    var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);


    // connect to the socket
    var socket = io.connect('/socket');
    //gloabal variable 
    idTime = 0;
    chatCount = false;
    // variables which hold the data for each person
    var name = "",
            email = "",
            img = "",
            friend = "";

    // cache some jQuery objects
    var section = $(".section"),
            footer = $("footer"),
            onConnect = $(".connected"),
            inviteSomebody = $(".invite-textfield"),
            personInside = $(".personinside"),
            chatScreen = $(".chatscreen"),
            left = $(".left"),
            //   noMessages = $(".nomessages"),
            noMessages = $(".chatscreen"),
            // wpmudev_chat_box = $('.wpmudev-chat-box'),
            tooManyPeople = $(".toomanypeople");

    // some more jquery objects
    var chatNickname = $(".nickname-chat"),
            leftNickname = $(".nickname-left"),
            loginForm = $(".loginForm"),
            yourName = $("#yourName"),
            yourEmail = $("#yourEmail"),
            hisName = $("#hisName"),
            hisEmail = $("#hisEmail"),
            chatForm = $("#chatform"),
            textarea = $("#chatMessage"),
            messageTimeSent = $(".timesent"),
            chats = $(".chats");

    // these variables hold images
    var ownerImage = $("#ownerImage"),
            leftImage = $("#leftImage"),
            noMessagesImage = $("#noMessagesImage");


    // on connection to server get the id of person's room
    socket.on('connect', function() {
        var seconds = new Date().getTime();
        //  if (1402133714539 > seconds) {
        socket.emit('load', {id: id, loadStatus: true});
        // }

    });

    // save the gravatar url
    socket.on('img', function(data) {
        img = data;
    });
    // receive the names and avatars of all pe\ople in the chat ro
    socket.on('peopleinchat', function(data) {
        if (typeof getCookie('userName') != 'undefined' && getCookie('userName') != null) {
            mediaUser = getCookie('userType');
            name = getCookie('userName');
			var now = new Date();
			var n =1;
			var yesterdayMs = now.getTime() - 1000 * 60 * 60 * 24 * n;
			var day = now.setTime(yesterdayMs);
		
            socket.emit('login', {user: name, avatar: email, id: id, loadStatus: false,days:day});
        } else {
            if (data.number === 0) {
                mediaUser = 'admin';
            } else {
                mediaUser = 'operator';
            }
            showMessage("connected");

            loginForm.on('submit', function(e) {

                e.preventDefault();

                name = $.trim(yourName.val());
                setCookie('userName', name, 1);
                if (adminList.indexOf(name) > -1) {
                    setCookie('userType', 'admin', 1);
                } else {
                    setCookie('userType', 'operator', 1);
                }
                if (name.length < 1) {
                    alert("Please enter a nick name longer than 1 character!");
                    return;
                }

                email = yourEmail.val();

                if (!isValid(email)) {
                    alert("Please enter a valid email!");
                }
                else {
                    socket.emit('login', {user: name, avatar: email, id: id});
                }
            });
        }
    });

    // Other useful 

    socket.on('startChat', function(data) {
        if (chatCount) {
            return false;
        }
        if (data.boolean && data.id == id) {

            chats.empty();

            if (name === data.users[0]) {
                // showMessage('chatStarted');
                showMessage("youStartedChatWithNoMessages", data);
            }
            else {
                //  showMessage('chatStarted');
                showMessage("heStartedChatWithNoMessages", data);
            }

            chatNickname.text(friend);
            showMessage("showChatHistory", data);
        }
    });

    socket.on('leave', function(data) {

        if (data.boolean && id == data.room) {

            //showMessage("somebodyLeft", data);
            //chats.empty();
        }

    });

    socket.on('removeChat', function(data) {

        alert(data.number);

    });

    socket.on('tooMany', function(data) {

        if (data.boolean && name.length === 0) {

            showMessage('tooManyPeople');
        }
    });

    socket.on('receive', function(data) {
        showMessage('chatStarted');

        createChatMessage(data.msg, data.user, data.img, moment(), data.id);
        scrollToBottom();
    });



    textarea.keypress(function(e) {

        // Submit the form on enter

        if (e.which == 13) {
            e.preventDefault();
            chatForm.trigger('submit');
        }

    });
    idddd = true;
    chatForm.on('submit', function(e) {

        e.preventDefault();

        // Create a new chat message and display it directly

        showMessage("chatStarted");
        var senderStatus = true;
        socket.emit('msgId');
        idStatus = true;
        socket.on('setMsgId', function(payload) {
            if (idStatus) {
                var id = payload.id;
                createChatMessage(textarea.val(), name, img, moment(), id, senderStatus);
                socket.emit('msg', {msg: textarea.val(), user: name, img: img, id: id});
                idStatus = false;
                textarea.val("");
            }
        });
        scrollToBottom();
        // Send the message to the other person in the chat
        // Empty the textarea
    });

    // Update the relative time stamps on the chat messages every minute

    setInterval(function() {

        messageTimeSent.each(function() {
            var each = moment($(this).data('time'));
            $(this).text(each.fromNow());
        });

    }, 60000);

    // Function that creates a new chat message

    function createChatMessage(msg, user, imgg, now, randNumber, senderStatus, rmvStatus) {

        var who = '', removeChat = '';

        if (user === name) {
            who = 'me';
        }
        else {
            who = 'you';
        }
        // var idTime= new Date().getTime();


        var id = randNumber;
        if (typeof getCookie('userType') != 'undefined' && getCookie('userType') != null) {
            mediaUser = getCookie('userType');
        }
        if (mediaUser == 'admin') {
            if (rmvStatus) {
                removeChat = '<div style="display:none" id="id' + id + '" onClick="removeChat(' + id + ')" class="removeChat"></div>';
            } else {
                removeChat = '<div id="id' + id + '" onClick="removeChat(' + id + ')" class="removeChat"></div>';
            }

        }
       removeChat='';
        var li = $(
                '<li  class=' + who + '>' +
                '<div class="image">' +
                '<img src="../img/person.png" />' +
                '<b></b>' +
                '<i class="timesent" data-time=' + now + '></i> ' +
                '</div>' +
                '' + removeChat + '<p id="' + id + '"></p> ' +
                '</li>');

        // use the 'text' method to escape malicious user input
        li.find('p').text(msg);
        li.find('b').text(user);

        chats.append(li);
        messageTimeSent = $(".timesent");
        if (senderStatus) {
            messageTimeSent.last().text(now.fromNow());
            socket.emit('saveChat', {chatId: randNumber, sender: user, time: now, msg: msg});
        }
    }

    socket.on('alterMsg', function(data) {
        // var id =data.id;
        var id = "#" + data.id;
        var removeId = '#id' + data.id;
        $(removeId).hide();
        $(id).html('This message has been removed...').addClass('removeMsg');
    });

    function scrollToBottom() {
        // $("#chatRoom").scrollTop(400);
        $(".chatArea").animate({scrollTop: 1000000}, 1000);
    }

    function isValid(thatemail) {

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(thatemail);
    }

    function showMessage(status, data) {
        // alert(status);
        if (status === "connected") {

            section.children().css('display', 'none');
            onConnect.fadeIn(1200);
        }

        else if (status === "inviteSomebody") {

            // Set the invite link content
            $("#link").text(window.location.href);

            onConnect.fadeOut(100, function() {
                inviteSomebody.fadeIn(100);
            });
        }

        else if (status === "personinchat") {

            onConnect.css("display", "none");
            personInside.fadeIn(1200);
            chatScreen.css("display", "none");
            //chatNickname.text(data.user);
            ownerImage.attr("src", data.avatar);
        }

        else if (status === "youStartedChatWithNoMessages") {

            left.fadeOut(1200, function() {
                inviteSomebody.fadeOut(1200, function() {
                    if (mediaUser == 'admin') {
                        noMessages.fadeIn(1200);
                    } else {
                        chatScreen.fadeIn(200);

                    }
                    //noMessages.fadeIn(1200);

                    footer.fadeIn(1200);
                });
            });

            friend = data.users[1];
            noMessagesImage.attr("src", data.avatars[1]);
        }

        else if (status === "heStartedChatWithNoMessages") {
            // if()

            personInside.css("display", "none");
            onConnect.fadeOut(1200, function() {

                noMessages.fadeIn(1200);
                chatScreen.fadeIn(1200);
                footer.fadeIn(1200);
            });

            friend = data.users[0];
            noMessagesImage.attr("src", data.avatars[0]);
        }

        else if (status === "chatStarted") {

            section.children().css('display', 'none');
            chatScreen.css('display', 'block');
            footer.fadeIn(1200);
            chatCount = true;
        }

        else if (status === "somebodyLeft") {

            leftImage.attr("src", data.avatar);
            leftNickname.text(data.user);

            section.children().css('display', 'none');
            footer.css('display', 'none');
            left.fadeIn(1200);
        }

        else if (status === "tooManyPeople") {

            section.children().css('display', 'none');
            tooManyPeople.fadeIn(1200);
        }
        else if (status === 'showChatHistory') {
            var chatHistory = data.chatData;
            if (data.loadStatus) {
                //  wpmudev_chat_box.show();
                textarea.hide();
            } else {
                //  wpmudev_chat_box.hide();
                textarea.show();
            }
            chatHistory.forEach(function(entry) {
                var msg = entry.msg;
                var user = entry.sender;
                var imgg = "";
                var now = entry.now;
                var randNumber = entry.chatId;
                var senderStatus = false;
                var rmvStatus = entry.rmvStatus;
                createChatMessage(msg, user, imgg, now, randNumber, senderStatus, rmvStatus);
                messageTimeSent.each(function() {
                    var each = moment($(this).data('time'));
                    $(this).text(each.fromNow());
                });
            });
        }
    }



    function hideMessage(status, data) {

    }

    window.removeChat = function(ths) {
        socket.emit('removeChat', {id: ths});
    };

    window.loadLogin = function() {
        socket.emit('load', {id: id, loadStatus: false});
    };

    window.showMessageHistory = function(ths) {
        var now = new Date();
        var n = parseInt(ths);
        var yesterdayMs = now.getTime() - 1000 * 60 * 60 * 24 * n;
        var day = now.setTime(yesterdayMs);
        socket.emit('chatHistory', {id: id, loadStatus: true, days: day});
    };

});
