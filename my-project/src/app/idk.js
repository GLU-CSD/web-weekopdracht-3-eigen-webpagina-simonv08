"use client";

import React, { useState, useEffect, useRef } from "react";
import "./idk.css";
import List from "./list";

const numDots = 50;
const speedFactor = 0.25;

function getListFromLocalStorage(key) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key)) || [];
  }
  return [];
}

export function Idk() {
  const [todoList, setTodoList] = useState(() => {
    getListFromLocalStorage("todos");
  });
  const [pillList, setPillList] = useState(() => {
    getListFromLocalStorage("pills");
  });

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

  return (
    <div className="container">
      <title>My Lists</title>
      <List
        list={todoList}
        setList={setTodoList}
        storageName="todos"
        title="todo list"
      />
      <List
        list={pillList}
        setList={setPillList}
        storageName="pills"
        title="pill list"
      />
    </div>
  );
}
