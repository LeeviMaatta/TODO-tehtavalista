import { pool } from '../helper/db.js'
import { Router } from 'express'
import { auth } from '../helper/auth.js'

const router = Router()

router.get('/', (req, res, next) => {
    pool.query('SELECT * FROM task', (err, result) => {
        if (err) {
            return next (err)
        }
        res.status(200).json(result.rows || [])
    })
})

router.post('/create', auth, (req, res, next) => {
    const { task } = req.body

    if (!task) {
        return res.status(400).json({ error: 'Task is required' })
    }

    pool.query('insert into task (description) values ($1) returning *', [task.description],
        (err, result) => {
            if (err) {
                return next(err)
            }
            res.status(201).json({ id: result.rows[0].id, description: task.description })
        })
})

router.delete('/delete/:id', (req, res, next) => {
    const { id } = req.params
    
    pool.query('delete from task WHERE id = $1',
        [id], (err, result) => {
            if (err) {
                return next (err)
            }
            if (result.rowCount === 0) {
                const error = new Error('Task not found')
                error.status = 404
                return next(error)
            }
            return res.status(200).json({ id: id })
        })
})

router.post('/signin', (req, res, next) => {
    const { user } = req.body

    if (!user || !user.email || !user.password) {
        const error = new Error('Email and password are required')
        error.status = 400
        return next(error)
    }

    pool.query('SELECT * FROM account WHERE email = $1', [user.email], (err, result) => {
        if (err) return next(err)
        if (result.rows.length === 0) {
            const error = new Error('User not found')
            error.status = 404
            return next(error)
        }
        const dbUser = result.rows[0]
        compare(user.password, dbUser.password, (err, isMatch) => {
            if (err) return next(err)

            if (!isMatch) {
                const error = new Error('Invalid password')
                error.status = 401
                return next(error)
            }
        })
        const token = sign({ user: dbUser.email }, process.env.JWT_SECRET)
        res.status(200).json({
            id: dbUser.id,
            email: dbUser.email,
            token
        })
    })
})

export default router