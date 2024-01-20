const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const personSchema = new mongoose.Schema({ name: String, number: String })
const Person = mongoose.model('Person', personSchema)

const username = "fullstack"

const addToDb = (password, name, number) => {
    const url = `mongodb+srv://${username}:${password}@cluster0.dv94kug.mongodb.net/?retryWrites=true&w=majority`
    mongoose.connect(url)

    const person = new Person({ name: name, number: number})

    person.save().then(result => {
        console.log(`added ${name} ${number} to phonebook`)
        mongoose.connection.close()
    })
}

const printFromDb = (password) => {
    const url = `mongodb+srv://${username}:${password}@cluster0.dv94kug.mongodb.net/?retryWrites=true&w=majority`
    mongoose.connect(url)

    console.log("phonebook:")

    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}

if (process.argv.length == 5) {
    addToDb(process.argv[2], process.argv[3], process.argv[4])
}

else if (process.argv.length == 3) {
    printFromDb(process.argv[2])
}

else {
    console.log('exactly 1 or 3 parameters needed')
}
