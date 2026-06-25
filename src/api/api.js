import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

export const rankResumes = (formData) =>
  API.post("/rank", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });