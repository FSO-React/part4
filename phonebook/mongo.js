require('dotenv').config({ path: '.env' })
const mongoose = require('mongoose')

// Operation and Parameters
const saveOperation = process.argv.length >= 4
const personName = process.argv[2]
const personNumber = process.argv[3]

// Conection
const username = process.env.MONGODB_USERNAME
const password = process.env.MONGODB_PASSWORD
const databaseName = 'Phonebook'
const cluster = 'cluster0'
const appName = 'Cluster0'

const url =`mongodb+srv://${username}:${password}@${cluster}.l3wwy.mongodb.net/${databaseName}?retryWrites=true&w=majority&appName=${appName}`
mongoose.set('strictQuery',false)
mongoose.connect(url)
console.log('connected to MongoDB')

// Schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})
const Person = mongoose.model('Person', personSchema)


// SAVE PERSON
if (saveOperation) {
  const person = new Person({
    name: personName,
    number: personNumber,
  })
  person.save().then(({ name, number }) => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

// GET PERSONS
if (!saveOperation) {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`* ${person.name} | ${person.number}`)
    })
    mongoose.connection.close()
  })
}
