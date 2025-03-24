import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Task from "../../types/Task";
import "./EditTask.css";

type EditTaskProps = {
  task: Task;
  onAddTask: (newTask: Task, isNewTask: boolean) => void;
  onClose: () => void;
  onDelete: (taskId: string) => void;
};

function EditTask({ task, onAddTask, onClose, onDelete }: EditTaskProps) {
  const [localTask, setLocalTask] = useState<Task>({
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
  const [taskCompleted, setTaskCompleted] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [isNewTask, setIsNewTask] = useState<boolean>(true);
  const [hoverItem, setHoverItem] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const refTaskTitle = useRef<HTMLInputElement>(null);
  const refTaskCategory = useRef<HTMLSelectElement | null>(null);
  const refTaskDescription = useRef<HTMLTextAreaElement>(null);
  const refTaskDueDate = useRef<HTMLInputElement>(null);
  const refTaskStatus = useRef<HTMLSelectElement | null>(null);

  const categories = ["Cloud", "Frontend", "Backend"];
  const statuses = ["To Do", "In Progress", "in-progress", "Complete"];

  useEffect(() => {
    if (task && task.taskId) {
      setTags(task.tags);
      setTaskCompleted(task.completed);
      setLocalTask(task);
      setIsNewTask(false);
    }
  }, [task]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCloseAddTask = () => {
    setConfirmDelete(false);
    setLocalTask({
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
    setIsNewTask(true);
    onClose();
  };

  const reset = () => {
    setTags([]);
    setTaskCompleted(false);
    if (refTaskTitle.current) {
      refTaskTitle.current.value = "";
    }
    if (refTaskCategory.current) {
      refTaskCategory.current.value = "";
    }
    if (refTaskStatus.current) {
      refTaskStatus.current.value = "";
    }
    if (refTaskDescription.current) {
      refTaskDescription.current.value = "";
    }
    setIsNewTask(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirmDelete) {
      reset();
      onDelete(taskId);
    }
    setConfirmDelete(!confirmDelete);
  };

  const handleAddTask = (event: React.MouseEvent) => {
    event.preventDefault();
    if (refTaskCategory.current && refTaskStatus.current) {
      const categoryOptions = refTaskCategory.current.options;
      const statusOptions = refTaskStatus.current?.options;
      const newTask = {
        userId: localTask?.userId || "user-001",
        taskId: isNewTask ? uuidv4() : localTask?.taskId,
        title: refTaskTitle.current?.value,
        description: refTaskDescription.current?.value,
        category: categoryOptions[categoryOptions.selectedIndex].value,
        status: statusOptions[statusOptions.selectedIndex].value,
        completed: taskCompleted,
        dueDate: refTaskDueDate.current?.value,
        tags: tags,
      };
      onAddTask(newTask, isNewTask);
    }
  };

  const handleDeleteTag = (event: React.MouseEvent, deletedTag: string) => {
    event.preventDefault();
    const newTags = tags.filter((tag) => tag !== deletedTag);
    setTags(newTags);
  };

  return (
    <div className="edit-task">
      {!isNewTask && (
        <section className="cta-top">
          {!confirmDelete && (
            <button
              className="cta-delete-task confirm"
              onClick={() => handleDeleteTask(localTask.taskId)}
            >
              Delete Task
            </button>
          )}
          {confirmDelete && (
            <button
              className="cta-delete-task"
              onClick={() => handleDeleteTask(localTask.taskId)}
            >
              Permanently Delete Task
            </button>
          )}
        </section>
      )}
      <section>
        <div>
          <label htmlFor="taskTitle">Title</label>
          <input
            id="taskTitle"
            type="text"
            ref={refTaskTitle}
            autoFocus
            placeholder="Title..."
            defaultValue={localTask.title}
          />
        </div>
        <div>
          <label htmlFor="taskCategory">Category</label>
          <select id="taskCategory" ref={refTaskCategory}>
            <option value="">Select Category...</option>
            {categories.map((category) => (
              <option
                selected={category === localTask.category}
                defaultValue={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <div>
          <label htmlFor="taskStatus">Status</label>
          <select id="taskStatus" ref={refTaskStatus}>
            <option value="">Select Status...</option>
            {statuses.map((status) => (
              <option
                selected={status === localTask.status}
                defaultValue={status}
              >
                {status.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="radio">
          <label htmlFor="taskCompleted">Completed</label>
          <div>
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
        </div>
      </section>

      <section>
        <div>
          <label htmlFor="taskDueDate">Due Date</label>
          <input
            id="taskDueDate"
            type="text"
            ref={refTaskDueDate}
            defaultValue={localTask.dueDate || "2025-01-05T12:00:00Z"}
          />
        </div>
        <div>
          <label htmlFor="taskTags">Tags</label>
          <input
            type="text"
            onKeyDown={handleAddTag}
            placeholder="Add Tag..."
          />
          <ul className="tag-list">
            {tags.map((tag, index) => (
              <li
                onMouseOver={() => setHoverItem(index)}
                key={index}
                onMouseOut={() => setHoverItem(null)}
              >
                {tag}{" "}
                {hoverItem === index && (
                  <span
                    className="delete-tag"
                    onClick={(event) => handleDeleteTag(event, tag)}
                  >
                    x
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="justify-start">
        <div className="description">
          <label htmlFor="taskDescription">Description</label>
          <textarea
            id="taskDescription"
            rows={7}
            ref={refTaskDescription}
            defaultValue={localTask.description}
          ></textarea>
        </div>
      </section>
      <section className="cta">
        {isNewTask && <button onClick={handleAddTask}>Add</button>}
        {!isNewTask && <button onClick={handleAddTask}>Update</button>}
        <button onClick={handleCloseAddTask}>Cancel</button>
      </section>
    </div>
  );
}

export default EditTask;
