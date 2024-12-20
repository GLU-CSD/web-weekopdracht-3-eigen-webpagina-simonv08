"use client";
import React, { useState, useEffect, useRef } from "react";
export default function List({ list = [], setList, storageName, title }) {
  const [listInput, setInput] = useState("");
  const [isDragging, setDragging] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    const resetDragging = () => {
      setDragging(false);
    };
    document.body.addEventListener("mouseup", resetDragging);
    return () => {
      document.body.removeEventListener("mouseup", resetDragging);
    };
  });

  useEffect(() => {
    localStorage.setItem(storageName, JSON.stringify(list));
  }, [list]);

  const addItem = () => {
    if (listInput.trim()) {
      const newlist = [...list, { text: listInput, done: false }];
      setList(newlist);
      setInput("");
    }
  };

  const removeItem = (index) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  const markDone = (index) => {
    const newList = [...list];
    newList[index].done = !newList[index].done;

    if (newList[index].done) {
      const doneItem = newList.splice(index, 1)[0];
      newList.push(doneItem);
    } else {
      const undoneItem = newList.splice(index, 1)[0];
      newList.unshift(undoneItem);
    }

    setList(newList);
  };

  // Edit Handlers
  const handleDoubleClick = (index) => {
    setEditingIndex(index);
    setEditingText(list[index].text);
  };

  const handleSaveEdit = (index) => {
    const updatedList = [...list];
    updatedList[index].text = editingText;
    setList(updatedList);
    setEditingIndex(null);
    setEditingText("");
  };

  // Add Task/Pill on Enter Key
  const handleAddKeyPress = (e) => {
    if (e.key === "Enter") {
      addItem();
    }
  };

  // Save Edited Text on Enter Key
  const handleEditKeyPress = (e, index) => {
    if (e.key === "Enter") {
      handleSaveEdit(index);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
    setDragging(true);
  };

  const handleDrop = (e, index) => {
    if (!isDragging) {
      return;
    }
    const draggedIndex = e.dataTransfer.getData("index");
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    setList([...list]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  return (
    <div className="list">
      <h1>{title}</h1>
      <input
        type="text"
        value={listInput}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => handleAddKeyPress(e)}
        placeholder="Add a new task"
      />
      <button onClick={addItem}>
        <b>Add</b>
      </button>
      <ul>
        {list.map((item, index) => (
          <li
            key={index}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            {editingIndex === index && editingText !== "" ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => handleEditKeyPress(e, index)}
                onBlur={() => handleSaveEdit(index)}
                autoFocus
              />
            ) : (
              <span
                style={{
                  textDecoration: item.done ? "line-through" : "none",
                  color: item.done ? "#555" : "#f0f",
                  fontWeight: "bold",
                }}
                onDoubleClick={() => handleDoubleClick(index)}
              >
                {item.text}
              </span>
            )}
            <div>
              <button onClick={() => markDone(index)}>✔</button>
              <button onClick={() => removeItem(index)}>✖</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
