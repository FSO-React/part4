require('dotenv').config({ path: '.env' })
const mongoose = require('mongoose')

// Conection
const username = process.env.MONGODB_USERNAME
const password = process.env.MONGODB_PASSWORD
const cluster = 'cluster0'
const appName = 'Cluster0'

const url =`mongodb+srv://${username}:${password}@${cluster}.l3wwy.mongodb.net/appNote?retryWrites=true&w=majority&appName=${appName}`
mongoose.set('strictQuery',false)

mongoose.connect(url)
console.log('connected to MongoDB')

// Schema
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})
const Note = mongoose.model('Note', noteSchema)


// SAVE NOTE
// const note = new Note({
//   content: 'Maybe the last... just maybe...',
//   important: true,
// })
// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })

// GET NOTES
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})