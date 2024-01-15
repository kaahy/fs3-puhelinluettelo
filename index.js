const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

morgan.token('data', function (req, res) { return JSON.stringify(req.body) })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))  //

let persons = [
    {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456",
    },
    {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    },
    {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345",
    },
    {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    }
]

app.get('/', (request, response) => {
    response.send('-')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const time = new Date
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${time}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const person = {...request.body}

    if (!person.name || !person.number) {
        return response.status(400).json({
            error: 'name or number is missing'
        })
    }

    if (persons.filter(p => p.name === person.name).length > 0) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    person.id = Math.round(Math.random() * 100000)
    persons = persons.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
