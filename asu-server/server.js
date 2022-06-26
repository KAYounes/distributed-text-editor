
const mongoose = require('mongoose')
const Document = require('./Document')
const url = `mongodb+srv://mongo:YVDZQHuIBQckQ7Oz@docsdatabase.rgfffkb.mongodb.net/?retryWrites=true&w=majority
`;
  

let cursorArr = []
const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })


const defaultValue = ""


const io = require('socket.io')(80, {
    cors:{
        origin: 'http://asu-client-v2.s3-website-us-east-1.amazonaws.com',
        methods: ['GET', 'POST']
    },
})

io.on("connection", socket => {
    socket.on("get-document", async documentId => {
      const document = await findOrCreateDocument(documentId)
      socket.join(documentId)
      socket.emit("load-document", document.data)
  
      socket.on("send-changes", delta => {
        socket.broadcast.to(documentId).emit("receive-changes", delta)
      })
  
      socket.on("save-document", async data => {
        await Document.findByIdAndUpdate(documentId, { data })
      })

      socket.on("send-cursor", cursors=>{
        console.log("inside-server")
        socket.broadcast.to(documentId).emit("receive-cursor", cursors)
      })
    })
  })
  
  async function findOrCreateDocument(id) {
    if (id == null) return
  
    const document = await Document.findById(id)
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
  }