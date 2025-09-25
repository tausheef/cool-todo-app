import Todo from "../models/Todo.js";

// Get todos
export const getTodos = async (req, res) => {
  try {
    const todos = req.user.role === "admin"
      ? await Todo.find()
      : await Todo.find({ userId: req.user._id });

    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch todos" });
  }
};

// Create todo
export const createTodo = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    // Automatically assign userId and userName from req.user
    const todo = await Todo.create({
      title,
      description,
      priority,
      dueDate,
      userId: req.user._id,
      userName: req.user.name,
      completed: false, // set default completed state
    });

    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create todo" });
  }
};

// Update todo
export const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    // Only admin or owner can update
    if (req.user.role !== "admin" && todo.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(todo, req.body);
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update todo" });
  }
};

// Delete todo
export const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    // Authorization: Only admin or owner
    if (req.user.role !== "admin" && todo.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await todo.deleteOne();  // ✅ Modern Mongoose
    res.json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete todo" });
  }
};

