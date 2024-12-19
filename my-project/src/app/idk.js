"use client";

import React, { useState, useEffect, useRef } from "react";
import "./idk.css";

const numDots = 50;
const speedFactor = 0.25;

export function Idk() {
  const [todoList, setTodoList] = useState(() => {
    return JSON.parse(localStorage.getItem("todos")) || [];
  });
  const [pillList, setPillList] = useState(() => {
    return JSON.parse(localStorage.getItem("pills")) || [];
  });

  const [todoInput, setTodoInput] = useState("");
  const [pillInput, setPillInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const dotsRef = useRef([]);

  // Dots Animation Setup
  useEffect(() => {
    function getRandomOutsidePosition() {
      const edge = Math.random() * 4;
      let x, y;
      if (edge < 1) {
        x = -20;
        y = Math.random() * window.innerHeight;
      } else if (edge < 2) {
        x = Math.random() * window.innerWidth;
        y = -20;
      } else if (edge < 3) {
        x = window.innerWidth + 20;
        y = Math.random() * window.innerHeight;
      } else {
        x = Math.random() * window.innerWidth;
        y = window.innerHeight + 20;
      }
      return { x, y };
    }

    function createDot() {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      const { x, y } = getRandomOutsidePosition();
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      document.body.appendChild(dot);

      const dotObject = {
        element: dot,
        x: x,
        y: y,
        vx: Math.random() * 2 + 1,
        vy: Math.random() * 2 + 1,
      };

      setTimeout(() => {
        dot.style.opacity = 0.7;
      }, 50);

      dotsRef.current.push(dotObject);
      moveDot(dotObject);
    }

    function moveDot(dotObject) {
      dotObject.x += dotObject.vx * speedFactor;
      dotObject.y += dotObject.vy * speedFactor;
      dotObject.element.style.left = `${dotObject.x}px`;
      dotObject.element.style.top = `${dotObject.y}px`;

      if (
        dotObject.x > window.innerWidth + 50 ||
        dotObject.y > window.innerHeight + 50
      ) {
        dotObject.element.remove();
        dotsRef.current = dotsRef.current.filter((d) => d !== dotObject);
        createDot();
      } else {
        requestAnimationFrame(() => moveDot(dotObject));
      }
    }

    for (let i = 0; i < numDots; i++) {
      createDot();
    }

    return () => {
      dotsRef.current.forEach((dot) => dot.element.remove());
      dotsRef.current = [];
    };
  }, []);

  // List Handlers
  const addTodo = () => {
    if (todoInput.trim()) {
      const newList = [...todoList, { text: todoInput, done: false }];
      setTodoList(newList);
      localStorage.setItem("todos", JSON.stringify(newList));
      setTodoInput("");
    }
  };

  const addPill = () => {
    if (pillInput.trim()) {
      const newList = [...pillList, { text: pillInput, taken: false }];
      setPillList(newList);
      localStorage.setItem("pills", JSON.stringify(newList));
      setPillInput("");
    }
  };

  const removeItem = (index, type) => {
    const newList = type === "todo" ? [...todoList] : [...pillList];
    newList.splice(index, 1);
    if (type === "todo") {
      setTodoList(newList);
      localStorage.setItem("todos", JSON.stringify(newList));
    } else {
      setPillList(newList);
      localStorage.setItem("pills", JSON.stringify(newList));
    }
  };

  const markDone = (index) => {
    const newList = [...todoList];
    newList[index].done = !newList[index].done;

    if (newList[index].done) {
      // Move done tasks to the bottom
      const doneItem = newList.splice(index, 1)[0];
      newList.push(doneItem);
    } else {
      // Move undone tasks to the top
      const undoneItem = newList.splice(index, 1)[0];
      newList.unshift(undoneItem);
    }

    setTodoList(newList);
    localStorage.setItem("todos", JSON.stringify(newList));
  };

  const markTaken = (index) => {
    const newList = [...pillList];
    newList[index].taken = !newList[index].taken;

    if (newList[index].taken) {
      // Move taken pills to the bottom
      const takenItem = newList.splice(index, 1)[0];
      newList.push(takenItem);
    } else {
      // Move undone pills to the top
      const undoneItem = newList.splice(index, 1)[0];
      newList.unshift(undoneItem);
    }

    setPillList(newList);
    localStorage.setItem("pills", JSON.stringify(newList));
  };

  // Edit Handlers
  const handleDoubleClick = (index, type) => {
    if (type === "todo") {
      setEditingIndex(index);
      setEditingText(todoList[index].text);
    } else {
      setEditingIndex(index);
      setEditingText(pillList[index].text);
    }
  };

  const handleSaveEdit = (index, type) => {
    if (type === "todo") {
      const updatedTodoList = [...todoList];
      updatedTodoList[index].text = editingText;
      setTodoList(updatedTodoList);
      localStorage.setItem("todos", JSON.stringify(updatedTodoList));
    } else {
      const updatedPillList = [...pillList];
      updatedPillList[index].text = editingText;
      setPillList(updatedPillList);
      localStorage.setItem("pills", JSON.stringify(updatedPillList));
    }

    setEditingIndex(null);
    setEditingText("");
  };

  // Add Task/Pill on Enter Key
  const handleAddKeyPress = (e, type) => {
    if (e.key === "Enter") {
      if (type === "todo") {
        addTodo();
      } else if (type === "pill") {
        addPill();
      }
    }
  };

  // Save Edited Text on Enter Key
  const handleEditKeyPress = (e, index, type) => {
    if (e.key === "Enter") {
      handleSaveEdit(index, type);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, index, type) => {
    e.dataTransfer.setData("index", index);
    e.dataTransfer.setData("type", type);
  };

  const handleDrop = (e, index, type) => {
    const draggedIndex = e.dataTransfer.getData("index");
    const draggedType = e.dataTransfer.getData("type");

    if (draggedType === type) {
      const draggedList = draggedType === "todo" ? todoList : pillList;
      const draggedItem = draggedList[draggedIndex];
      draggedList.splice(draggedIndex, 1);
      draggedList.splice(index, 0, draggedItem);

      if (draggedType === "todo") {
        setTodoList([...draggedList]);
        localStorage.setItem("todos", JSON.stringify(draggedList));
      } else {
        setPillList([...draggedList]);
        localStorage.setItem("pills", JSON.stringify(draggedList));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="container">
      <title>My Lists</title>
      <div className="list">
        <h1>To-Do List</h1>
        <input
          type="text"
          value={todoInput}
          onChange={(e) => setTodoInput(e.target.value)}
          onKeyDown={(e) => handleAddKeyPress(e, "todo")}
          placeholder="Add a new task"
        />
        <button onClick={addTodo}>
          <b>Add</b>
        </button>
        <ul>
          {todoList.map((item, index) => (
            <li
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index, "todo")}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index, "todo")}
            >
              {editingIndex === index && editingText !== "" ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => handleEditKeyPress(e, index, "todo")}
                  onBlur={() => handleSaveEdit(index, "todo")}
                  autoFocus
                />
              ) : (
                <span
                  style={{
                    textDecoration: item.done ? "line-through" : "none",
                    color: item.done ? "#555" : "#f0f", // Darker color when crossed out
                    fontWeight: "bold",
                  }}
                  onDoubleClick={() => handleDoubleClick(index, "todo")}
                >
                  {item.text}
                </span>
              )}
              <div>
                <button onClick={() => markDone(index)}>✔</button>
                <button onClick={() => removeItem(index, "todo")}>✖</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="list">
        <h1>Pill List</h1>
        <input
          type="text"
          value={pillInput}
          onChange={(e) => setPillInput(e.target.value)}
          onKeyDown={(e) => handleAddKeyPress(e, "pill")}
          placeholder="Add a pill to take"
        />
        <button onClick={addPill}>
          <b>Add</b>
        </button>
        <ul>
          {pillList.map((item, index) => (
            <li
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index, "pill")}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index, "pill")}
            >
              {editingIndex === index && editingText !== "" ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => handleEditKeyPress(e, index, "pill")}
                  onBlur={() => handleSaveEdit(index, "pill")}
                  autoFocus
                />
              ) : (
                <span
                  style={{
                    textDecoration: item.taken ? "line-through" : "none",
                    color: item.taken ? "#555" : "#f0f", // Darker color when crossed out
                    fontWeight: "bold",
                  }}
                  onDoubleClick={() => handleDoubleClick(index, "pill")}
                >
                  {item.text}
                </span>
              )}
              <div>
                <button onClick={() => markTaken(index)}>✔</button>
                <button onClick={() => removeItem(index, "pill")}>✖</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
