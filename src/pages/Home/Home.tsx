import { useEffect, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";

import { v4 as uuidv4 } from "uuid";

function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [viewAddTask, setViewAddTask] = useState<boolean>(false);
  const [taskCompleted, setTaskCompleted] = useState<boolean>(true);
  const [tags, setTags] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string | undefined>("");
  let retryCount = 5;

  const refTaskTitle = useRef<HTMLInputElement>(null);
  const refTaskCategory = useRef<HTMLSelectElement | null>(null);
  const refTaskDescription = useRef<HTMLTextAreaElement>(null);
  const refTaskDueDate = useRef<HTMLInputElement>(null);
  const refTaskStatus = useRef<HTMLSelectElement | null>(null);

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
      setFilteredTasks(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (!tasks.length) return;
    setFilteredTasks(
      tasks.filter((task) =>
        task.title.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [searchText]);

  useEffect(() => {
    if (!tasks.length) return;
    setFilteredTasks(
      tasks.filter((task) =>
        task.tags.join(" ").toLowerCase().includes(filterText.toLowerCase())
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

  const addTask = async (newTask: any) => {
    try {
      const token = auth.user?.access_token;
      const response = await fetch(
        "https://oksbm9wyzc.execute-api.us-east-2.amazonaws.com/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTask),
        }
      );
      const result = await response.json();
      setTasks((prevTasks) => [...prevTasks, result.item]);
      resetForm();
      setViewAddTask(false);
    } catch (error) {
      console.error("Adding task failed");
    }
  };

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setTaskCompleted(event.target.value === "true");
  };

  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const tagInput = event.target as HTMLInputElement;
    if (tagInput.value === null) return false;
    if (event.key === "Enter") {
      event.preventDefault();
      const tag = tagInput.value;
      setTags((prev) => {
        const update = [...prev, tag];
        tagInput.value = "";
        return update;
      });
    } else {
      return;
    }
  };

  const handleAddTask = () => {
    if (refTaskCategory.current && refTaskStatus.current) {
      const categoryOptions = refTaskCategory.current.options;
      const statusOptions = refTaskStatus.current?.options;
      const newTask = {
        userId: "user-001",
        taskId: uuidv4(),
        title: refTaskTitle.current?.value,
        description: refTaskDescription.current?.value,
        category: categoryOptions[categoryOptions.selectedIndex].value,
        status: statusOptions[statusOptions.selectedIndex].value,
        completed: taskCompleted,
        dueDate: refTaskDueDate.current?.value,
        tags: tags,
      };
      addTask(newTask);
    }
  };

  const resetForm = () => {
    setTags([]);
    setTaskCompleted(false);
  };

  const handleCloseAddTask = () => {
    resetForm();
    setViewAddTask(false);
  };

  return (
    <div className="page-content">
      <div className="header">
        <h1>Cloudy Tasks</h1>
      </div>

      <div className="search">
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
      <div className="cards-grid">
        {!viewAddTask &&
          filteredTasks.map((task) => (
            <div key={task.taskId} className="card">
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
      {viewAddTask && (
        <div className="add-task">
          <section>
            <div>
              <label htmlFor="taskTitle">Title</label>
              <input
                id="taskTitle"
                type="text"
                ref={refTaskTitle}
                placeholder="Title..."
              />
            </div>
            <div>
              <label htmlFor="taskCategory">Category</label>
              <select id="taskCategory" ref={refTaskCategory}>
                <option defaultValue="Cloud">Cloud</option>
                <option defaultValue="Frontend">Frontend</option>
                <option defaultValue="Backend">Backend</option>
              </select>
            </div>
          </section>

          <section>
            <div>
              <label htmlFor="taskStatus">Status</label>
              <select id="taskStatus" ref={refTaskStatus}>
                <option defaultValue="to-do">To Do</option>
                <option defaultValue="in-progress">In Progress</option>
                <option defaultValue="complete">Complete</option>
              </select>
            </div>
            <div>
              <label htmlFor="taskCompleted">Completed</label>
              True{" "}
              <input
                name="taskCompleted"
                type="radio"
                value="true"
                checked={taskCompleted === true}
                onChange={handleRadioChange}
              />
              False{" "}
              <input
                name="taskCompleted"
                type="radio"
                value="false"
                checked={taskCompleted === false}
                onChange={handleRadioChange}
              />
            </div>
          </section>

          <section>
            <div>
              <label htmlFor="taskDueDate">Due Date</label>
              <input
                id="taskDueDate"
                type="text"
                ref={refTaskDueDate}
                defaultValue="2025-01-05T12:00:00Z"
              />
            </div>
            <div>
              <label htmlFor="taskTags">Tags</label>
              <input
                type="text"
                onKeyDown={handleAddTag}
                placeholder="Add Tag..."
              />
              <ul>
                {tags.map((tag, index) => (
                  <li key={index}>{tag}</li>
                ))}
              </ul>
            </div>
          </section>
          <section className="justify-start">
            <div>
              <label htmlFor="taskDescription">Description</label>
              <textarea
                id="taskDescription"
                rows={7}
                ref={refTaskDescription}
              ></textarea>
            </div>
          </section>
          <section className="cta">
            <button onClick={handleAddTask}>Add</button>
            <button onClick={handleCloseAddTask}>Cancel</button>
          </section>
        </div>
      )}
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
