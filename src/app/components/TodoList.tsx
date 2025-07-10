"use client";

import { useState } from "react";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import type { Todo } from "../actions/fetchData";
import { toggleTodo, createTodo } from "../actions/fetchData";
import VapiWidget from "./vapi";

type TodoListProps = {
  initialTodos: Todo[];
};

export function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");
  const [isPending, startTransition] = useTransition();
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);
  const vapiApiKey = process.env.VAPI_API_KEY;
  const vapiAssistantId = process.env.VAPI_ASSISTANT_ID;

  async function handleToggle(id: number) {
    try {
      setUpdatingTodoId(id);
      startTransition(async () => {
        const updatedTodos = await toggleTodo(id);
        setTodos(updatedTodos);
      });
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    } finally {
      setUpdatingTodoId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    // Optimistic update
    const optimisticTodo = {
      id: Date.now(),
      title: newTodo,
      completed: false,
    };

    setTodos(prev => [...prev, optimisticTodo]);
    setNewTodo("");

    try {
      startTransition(async () => {
        const updatedTodos = await createTodo(newTodo);
        setTodos(updatedTodos);
      });
    } catch (error) {
      // Revert optimistic update on error
      setTodos(prev => prev.filter(todo => todo.id !== optimisticTodo.id));
      console.error("Failed to create todo:", error);
    }
  }

  return (
    <VapiWidget
      apiKey={vapiApiKey || ""}
      assistantId={vapiAssistantId || ""}      
    />
  );
}
