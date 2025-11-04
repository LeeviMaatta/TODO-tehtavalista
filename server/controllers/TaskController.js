import { ApiError } from '../helper/ApiError.js'
import { selectAllTasks, insertTask, delTask } from '../models/Task.js'

const getTasks = async (req, res, next) => {
    try {
        const result = await selectAllTasks()
        const rows = result && result.rows ? result.rows : result
        return res.status(200).json(rows || [])
    } catch (error) {
        return next(error)
    }
}

const postTask = async (req, res, next) => {
    const { task } = req.body

    try {
        if (!task || !task.description || task.description.trim().length === 0) {
            return next(new ApiError('Task description is required', 400))
        }
        const result = await insertTask(task.description)
        return res.status(201).json({ id: result.rows[0].id, description: result.rows[0].description })
    } catch (error) {
        return next(error)
    }
}

const deleteTask = async (req, res, next) => {
    const { id } = req.params

    try {
        if (!id || String(id).trim().length === 0) {
            return next(new ApiError('Task id is required', 400))
        }
        const result = await delTask(id)
        return res.status(200).json({ id: id })
    } catch (error) {
        return next(error)
    }
}

export { getTasks, postTask, deleteTask }