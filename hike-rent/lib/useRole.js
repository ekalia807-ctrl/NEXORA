"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("role-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("role-changed", callback);
  };
}

function getSnapshot() {
  return localStorage.getItem("role");
}

function getServerSnapshot() {
  return null;
}

export function useRole() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}