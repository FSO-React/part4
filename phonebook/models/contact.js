const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

// connection
const url = process.env.MONGODB_URI_CONTACTS
console.log('connecting to MongoDB')
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

// schema
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name required'],
    minlength: [3, 'Name must be at least 3 characters long'],
    unique: true,
    trim: true,
  },
  number: {
    type: String,
    required: [true, 'Phone number required'],
    minlength: [8, 'Number must be at least 8 characters long'],
    validate: {
      validator: (v) => {
        return /^(\d{2,3})-(\d{6,8})$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)