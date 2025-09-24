import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TodoForm } from "@/components/todos/TodoForm";
import { TodoItem } from "@/components/todos/TodoItem";
import { useAuthStore } from "@/stores/authStore";
import { useTodoStore, type Todo } from "@/stores/todoStore";
import { LogOut, Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { todos, fetchTodos, createTodo, updateTodo, deleteTodo, isLoading } = useTodoStore();
  const { toast } = useToast();

  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // Load todos on login
  useEffect(() => {
    if (!user) return;
    fetchTodos();
  }, [user, fetchTodos]);

  // Filter todos and calculate stats
  useEffect(() => {
    let filtered = todos;

    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter(todo =>
        filterStatus === "completed" ? todo.completed : !todo.completed
      );
    }
    if (filterPriority !== "all") {
      filtered = filtered.filter(todo => todo.priority === filterPriority);
    }

    setFilteredTodos(filtered);

    const now = new Date();
    setStats({
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length,
      overdue: todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length,
    });
  }, [todos, searchTerm, filterStatus, filterPriority]);

const handleCreateTodo = async (todoData: Partial<Todo>) => {
  if (!user) return;
  try {
    await createTodo({
      title: todoData.title,
      description: todoData.description,
      priority: todoData.priority,
      dueDate: todoData.dueDate,
      // remove userId and userName
    });
    toast({ title: "Success", description: "Todo created successfully" });
    setShowForm(false);
  } catch {
    toast({ title: "Error", description: "Failed to create todo", variant: "destructive" });
  }
};


  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      await updateTodo(id, updates);
      toast({ title: "Success", description: "Todo updated successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to update todo", variant: "destructive" });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      toast({ title: "Success", description: "Todo deleted successfully" });
    } catch {
      toast({ title: "Error", description: "Failed to delete todo", variant: "destructive" });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b border-border/10 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Todo Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user.name}
                {user.role === "admin" && <Badge className="ml-2 bg-gradient-primary text-white border-0">Admin</Badge>}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Todos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-success">{stats.completed}</div></CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-warning">{stats.pending}</div></CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{stats.overdue}</div></CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search todos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
            <Plus className="h-4 w-4 mr-2" /> Add Todo
          </Button>
        </div>

        {/* Todo Form */}
        {showForm && <div className="mb-8"><TodoForm onSubmit={handleCreateTodo} /></div>}

        {/* Todos List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading todos...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "all" || filterPriority !== "all"
                    ? "No todos match your filters"
                    : "No todos yet. Create your first todo!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map(todo => (
              <TodoItem key={todo._id} todo={todo} onUpdate={handleUpdateTodo} onDelete={handleDeleteTodo} isAdmin={user.role === "admin"} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
