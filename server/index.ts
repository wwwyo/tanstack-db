import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
}

let todos: Todo[] = [
  {
    id: '1',
    title: 'Learn TanStack DB',
    completed: false,
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'Build a demo app',
    completed: false,
    createdAt: new Date()
  }
]

app.get('/api/todos', (req, res) => {
  res.json(todos)
})

app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id)
  if (todo) {
    res.json(todo)
  } else {
    res.status(404).json({ error: 'Todo not found' })
  }
})

app.post('/api/todos', (req, res) => {
  const newTodo: Todo = {
    id: Date.now().toString(),
    title: req.body.title,
    completed: req.body.completed || false,
    createdAt: new Date()
  }
  todos.push(newTodo)
  res.status(201).json(newTodo)
})

app.put('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id)
  if (index !== -1) {
    todos[index] = {
      ...todos[index],
      title: req.body.title || todos[index].title,
      completed: req.body.completed !== undefined ? req.body.completed : todos[index].completed
    }
    res.json(todos[index])
  } else {
    res.status(404).json({ error: 'Todo not found' })
  }
})

app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id)
  if (index !== -1) {
    const deleted = todos.splice(index, 1)
    res.json(deleted[0])
  } else {
    res.status(404).json({ error: 'Todo not found' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})