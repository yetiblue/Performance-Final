// Load http module
let http = require("http");
let PORT = process.env.PORT;
let instrumentArray = [];
let queue = [];
let colorArray = [];
let q = 0;
let nextUser
let lastUser

// Load express module
let express = require("express");
let app = express();

// Create server
// Hook it up to listen to the correct PORT
let server = http.createServer(app).listen(PORT);

// Point my app at the public folder to serve up the index.html file
app.use(express.static("public"));

// Create an io object to manage sockets
let io = require("socket.io")(server);

// Create 2 namespaces on the socket server
// 1 for input clients
let inputs = io.of("/input");
// 1 for output clients
let outputs = io.of("/output");

// Do this when there's a connection
inputs.on("connection", function(socket) {
  console.log("We have a new input client: ", socket.id);
  queue.push(socket.id);
  // console.log("push done");
  console.log(queue);

  socket.on("square1", function(message) {
    console.log("received inputs");
    outputs.emit("square1", message);
    colorArray.push(message.color)
    console.log(colorArray, "colorArray")
    outputs.emit("colorArray", colorArray)
  });
  socket.on("next", function() {
    // Log the data that came in
    console.log("NEXT SOCKET!", socket.id);
    next(socket.id);
    // if (q > 5) {
    //   q = 0;
    // } else {
    //   q += 1;
    // }
  });
  socket.on("clearColors", function(){
    inputs.to(nextUser).emit("previousColors", colorArray);
    colorArray = []
  })
 

  // socket.on("disconnect", function() {
  //   console.log("Input client disconnected: ", socket.id);
  //   outputs.emit("disconnected", socket.id);
  //   for (let s = 0; s < queue.length; s++) {
  //     // Compare the id of each socket with the id of the disconnected socket.
  //     if (queue[s].id == socket.id) {
  //       console.log("splice1");
  //       queue.splice(s, 1);
  //     }
  //   }
  // });
     socket.on("disconnect", function() {
      console.log("BYE", socket.id);
      // Loop through all the sockets in the queue
     for (let s = 0; s < queue.length; s++) {
       console.log(queue[0])
        // Compare the id of each socket with the id of the disconnected socket.
        if (queue[s] == socket.id) { //queue object doesn't contain an id: param
          console.log("slice")
          queue.splice(s, 1);
          console.log(queue)


        }
      }
    });
});

// Listen for outputs to connect
outputs.on("connection", function(socket) {
  console.log("We have a new output client: ", socket.id);

  // Listen for disconnections
//   inputs.on("disconnect", function() {
//     console.log("Output client disconnected: ", socket.id);
//     for (let s = 0; s < queue.length; s++) {
//       // Compare the id of each socket with the id of the disconnected socket.

//       if (queue[s].id == socket.id) {
//         console.log("splice2");
//         queue.splice(s, 1);
//       }
//     }
//   });
});

function next(lastUser) {
  console.log(q, "q");
  nextUser = queue[Math.floor(Math.random() * queue.length)];
  if (nextUser === lastUser) {
    console.log("same user");
    inputs.to(nextUser).emit("goAgain");
  }
  if (nextUser != lastUser) {
    inputs.to(nextUser).emit("go");
    inputs.to(lastUser).emit("stop");
    console.log("check2");
  }

  // let nextUser = queue[q]
  // console.log("queue length", queue.length);

  console.log(nextUser, "nextUser");
  console.log("lastUser", lastUser);

  console.log(queue, "queue");

  inputs.to(nextUser).emit("go");
  inputs.to(lastUser).emit("stop");
  console.log("check2");
}
