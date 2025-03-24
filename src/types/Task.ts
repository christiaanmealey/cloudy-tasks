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

export default Task;