require('dotenv').config({ path: '.env' })
const mongoose = require('mongoose')

// Conection
const username = process.env.MONGODB_USERNAME
const password = process.env.MONGODB_PASSWORD

const url =`mongodb+srv://${username}:${password}@cluster0.l3wwy.mongodb.net/testNoteApp?retryWrites=true&w=majority&appName=Cluster0`
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
const note = new Note({
  content: 'HTML is easy',
  important: true,
})
note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})

// GET NOTES
// Note.find({}).then(result => {
//   result.forEach(note => {
//     console.log(note)
//   })
//   mongoose.connection.close()
// })