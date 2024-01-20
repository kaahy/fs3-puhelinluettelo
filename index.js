require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })

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
        .then(result => { response.status(204).end() })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const person = {...request.body}

    if (!person.name || !person.number) {
        return response.status(400).json({
            error: 'name or number is missing'
        })
    }

    const person2 = new Person({ name: person.name, number: person.number })

    person2.save().then(savedPerson => { response.json(savedPerson) })
})

app.put('/api/persons/:id', (request, response, next) => {
    const person = { name: request.body.name, number: request.body.number }

    if (!person.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => { response.json(updatedPerson) })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => { response.status(404).send({ error:'unknown endpoint' })}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') { return response.status(400).send({ error: 'malformatted id' }) }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
