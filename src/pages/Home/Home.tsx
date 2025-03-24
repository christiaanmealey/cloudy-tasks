import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import EditTask from "../../components/EditTask/EditTask";

type Task = {
  userId: string;
  taskId: string;
  title: string | undefined;
  category: string;
  description: string | undefined;
  dueDate: string | undefined;
  status: string;
  completed: boolean;
  tags: string[];
};

function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<string>("list");
  const [currentTask, setCurrentTask] = useState<Task>({
    userId: "",
    taskId: "",
    title: "",
    category: "",
    description: "",
    dueDate: new Date().toISOString(),
    status: "",
    completed: false,
    tags: [],
  });
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [stageTasks, setStageTasks] = useState<any>([]);
  const [viewAddTask, setViewAddTask] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string | undefined>("");
  const [stages, setStages] = useState<string[]>([]);
  let retryCount = 5;

  const auth = useAuth();

  useEffect(() => {
    if (accessToken === "" || accessToken === "undefined") {
    } else {
      fetchTasks();
    }
  }, [accessToken]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      //navigate("/login");
    } else if (auth.user?.access_token !== "undefined") {
      setAccessToken(auth.user?.access_token);
      fetchTasks();
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (!tasks.length) {
      //fetchTasks();
    } else {
      const availableStages = tasks.map((task) => task.status);
      const groupedTasks = tasks.reduce((acc: any, task) => {
        acc[task.status] = acc[task.status] || [];
        acc[task.status].push(task);
        return acc;
      }, {});
      console.log(groupedTasks);
      setStages([...new Set(availableStages)]);
      setStageTasks(groupedTasks);
      setFilteredTasks(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (!tasks.length) return;
    setFilteredTasks(
      tasks.filter((task) =>
        task.title?.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText]);

  useEffect(() => {
    if (!tasks.length) return;
    setFilteredTasks(
      tasks.filter((task) =>
        task.tags?.join(" ").toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [filterText]);

  const fetchTasks = async () => {
    if (!accessToken || accessToken.length === 0) return false;
    try {
      if (retryCount > 0) {
        const response = await fetch(
          "https://oksbm9wyzc.execute-api.us-east-2.amazonaws.com/tasks?userId=user-001",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const result = await response.json();

        if (response.status < 400) {
          setTasks(result);
        } else {
          throw Error("Unathorized");
        }
      }
    } catch (error) {
      retryCount--;
      fetchTasks();
    }
  };

  const addTask = async (taskItem: any, isNewTask: boolean) => {
    try {
      const token = auth.user?.access_token;
      const reqMethod = isNewTask ? "POST" : "PUT";
      const params = isNewTask
        ? ""
        : `?userId=${taskItem.userId}&taskId=${taskItem.taskId}`;
      const response = await fetch(
        `https://oksbm9wyzc.execute-api.us-east-2.amazonaws.com/tasks${params}`,
        {
          method: reqMethod,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(taskItem),
        }
      );
      const result = await response.json();
      if (isNewTask) {
        setTasks((prevTasks) => [result.item, ...prevTasks]);
      } else {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.taskId === result.item.taskId ? result.item : task
          )
        );
      }
      //resetForm();
      setViewAddTask(false);
    } catch (error) {
      console.error("Adding task failed");
    }
  };

  const deleteTask = async (taskId: string, userId: string) => {
    try {
      const response = await fetch(
        `https://oksbm9wyzc.execute-api.us-east-2.amazonaws.com/tasks?taskId=${taskId}&userId=${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(response);
    } catch (error) {}
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((task) => task.taskId === taskId);
    if (task) {
      deleteTask(task.taskId, task.userId);
      setTasks((prevTasks) => prevTasks.filter((t) => t.taskId !== taskId));
    }
    setCurrentTask({
      userId: "",
      taskId: "",
      title: "",
      category: "",
      description: "",
      dueDate: new Date().toISOString(),
      status: "",
      completed: false,
      tags: [],
    });
    setViewAddTask(false);
  };

  const handleSelectTask = (taskId: String) => {
    const selectedTask = tasks.find((task) => task.taskId === taskId);

    if (selectedTask) {
      const params = new URLSearchParams(window.location.search);
      params.set("taskId", selectedTask.taskId);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
      setCurrentTask(selectedTask);
      setViewAddTask(true);
    }
  };

  const handleAddTask = (newTask: Task, isNewTask: boolean) => {
    addTask(newTask, isNewTask);
  };

  const handleCloseAddTask = () => {
    window.history.replaceState({}, "", `${window.location.pathname}`);
    setCurrentTask({
      userId: "",
      taskId: "",
      title: "",
      category: "",
      description: "",
      dueDate: new Date().toISOString(),
      status: "",
      completed: false,
      tags: [],
    });
    setViewAddTask(false);
  };

  return (
    <div className="page-content">
      <div className="header">
        <Link to="/trading">Settings</Link>
        <h1>Cloudy Tasks</h1>
      </div>

      <div className="search">
        <div className="viewType">
          <p
            onClick={() => setCurrentView("list")}
            className={`${currentView === "list" ? "active" : ""}`}
          >
            List
          </p>
          <p
            onClick={() => setCurrentView("card")}
            className={`${currentView === "card" ? "active" : ""}`}
          >
            Card
          </p>
        </div>
        <div>
          Search{" "}
          <input
            type="text"
            placeholder="Search..."
            name="search"
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
        <div>
          Filter{" "}
          <input
            type="text"
            placeholder="Category | Tag..."
            name="categoryTagFilter"
            onChange={(event) => setFilterText(event.target.value)}
          />
        </div>
      </div>
      <div className={`cards-grid ${currentView}-view`}>
        {currentView === "list" &&
          stages.map((stage) => (
            <ul>
              <li className="stage-title">{stage}</li>
              {stageTasks[stage].map((task: any) => (
                <li key={task.taskId}>
                  <div
                    className="card"
                    onClick={() => handleSelectTask(task.taskId)}
                  >
                    <div className="card-header">
                      <p className="title">{task.title}</p>
                    </div>
                    {/* <p className="description">{task.description}</p>
                    <div className="footer">
                      <div className="category">
                        <p>{task.category}</p>
                      </div>
                      <div className="tags">
                        <p>{task?.tags.join(", ")}</p>
                      </div>
                    </div> */}
                  </div>
                </li>
              ))}
            </ul>
          ))}

        {currentView === "card" &&
          filteredTasks.map((task) => (
            <div
              key={task.taskId}
              className="card"
              onClick={() => handleSelectTask(task.taskId)}
            >
              <div className="card-header">
                <p className="title">{task.title}</p>
                <p className="status">{task.status}</p>
              </div>
              <p className="description">{task.description}</p>
              <div className="footer">
                <div className="category">
                  <p>{task.category}</p>
                </div>
                <div className="tags">
                  <p>{task?.tags.join(", ")}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div
        className={
          viewAddTask ? "show edit-task-wrapper" : "hide edit-task-wrapper"
        }
      >
        <EditTask
          onClose={handleCloseAddTask}
          onAddTask={handleAddTask}
          onDelete={handleDeleteTask}
          task={currentTask}
        />
      </div>
      <div className="bottom-section">
        {!viewAddTask && (
          <button onClick={() => setViewAddTask(true)}>
            <span>+</span>Add Task
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;
