require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

// eslint-disable-next-line no-unused-vars
morgan.token('data', function (request, respond) { return JSON.stringify(request.body) })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/info', (request, response) => {
  const time = new Date

  Person.find({}).then(people => {
    response.send(`<p>Phonebook has info for ${people.length} people</p><p>${time}</p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) { response.json(person) }
      else { response.status(404).end() }})
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => { response.status(204).end() })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const person = { ...request.body }

  if (!person.name || !person.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }

  const person2 = new Person({ name: person.name, number: person.number })

  person2.save()
    .then(savedPerson => { response.json(savedPerson) })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = { name: request.body.name, number: request.body.number }

  if (!person.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => { response.json(updatedPerson) })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => { response.status(404).send({ error:'unknown endpoint' })}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
