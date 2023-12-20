"use client";
import React, { createContext, useState, useContext } from "react";
import themes from "./themes";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

export const GlobalContext = createContext();
export const GlobalUpdateContext = createContext();

export const GlobalProvider = ({ children }) => {
  const { user } = useUser();

  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState({});
  const [currentTaskId, setCurrentTaskId] = useState();

  const theme = themes[selectedTheme];

  const openModal = () => {
    setModal(true);
  };

  const openEditModal = (id) => {
		setEditModal(true);
    setCurrentTaskId(id)
  };

  const closeModal = () => {
    setModal(false);
  };

  const closeEditModal = () => {
    setEditModal(false);
  };

  const collapseMenu = () => {
    setCollapsed(!collapsed);
  };

  const allTasks = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/tasks");

      const sorted = res.data.sort((a, b) => {
        return (
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });

      setTasks(sorted);

      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const selectedTask = async (currentTaskId) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/tasks/${currentTaskId}`);

      // const sorted = res.data.sort((a, b) => {
      //   return (
      //     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      //   );
      // });

      setCurrentTask(res.data);

      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await axios.delete(`/api/tasks/${id}`);
      toast.success("Task deleted");

      allTasks();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const updateTask = async (task) => {
    try {
      const res = await axios.put(`/api/tasks`, task);

      toast.success("Task updated");

      allTasks();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const editTask = async (task) => {
    try {
      const res = await axios.put(`/api/tasks/${task.id}`, task);

      toast.success("Task updated");

      allTasks();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const completedTasks = tasks.filter((task) => task.isCompleted === true);
  const importantTasks = tasks.filter((task) => task.isImportant === true);
  const incompleteTasks = tasks.filter((task) => task.isCompleted === false);

  React.useEffect(() => {
    if (user) allTasks();
  }, [user]);

  return (
		<GlobalContext.Provider
			value={{
				theme,
				tasks,
				currentTask,
				deleteTask,
				isLoading,
				completedTasks,
				importantTasks,
				incompleteTasks,
				updateTask,
        editTask,
				modal,
				openModal,
				closeModal,
				editModal,
				openEditModal,
				closeEditModal,
				allTasks,
				selectedTask,
        currentTaskId,
				collapsed,
				collapseMenu,
			}}>
			<GlobalUpdateContext.Provider value={{}}>
				{children}
			</GlobalUpdateContext.Provider>
		</GlobalContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalContext);
export const useGlobalUpdate = () => useContext(GlobalUpdateContext);
