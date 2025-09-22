import React, { useState } from "react";
import axios from "axios";

export default function PdfAnalyzer({ token, roomId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const handleFile = (e) => setFile(e.target.files[0]);

  const upload = async () => {
    if (!file) return alert("Please select a PDF first");
    const fd = new FormData();
    fd.append("pdf", file);
    fd.append("roomId", roomId);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/pdf/analyze", fd, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>AI PDF Analyzer</h3>
      <input type="file" accept="application/pdf" onChange={handleFile} />
      <button onClick={upload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      {roadmap && <RoadmapViewer roadmap={roadmap} token={token} />}
    </div>
  );
}

function RoadmapViewer({ roadmap, token }) {
  return (
    <div>
      <h4>Summary</h4>
      <p>{roadmap.summary}</p>

      <h4>Roadmap</h4>
      {roadmap.roadmap.map((ms) => (
        <div key={ms.milestone_id} style={{ border: "1px solid #555", margin: "8px", padding: "8px" }}>
          <h5>{ms.title} ({ms.estimated_hours}h)</h5>
          <p>{ms.description}</p>
          <ul>
            {ms.tasks.map((t) => (
              <li key={t.task_id}>
                <b>{t.title}</b> — {t.description} — {t.points} pts
                <CompleteTaskButton roadmapId={roadmap._id} taskId={t.task_id} token={token} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CompleteTaskButton({ roadmapId, taskId, token }) {
  const [done, setDone] = useState(false);

  const handleComplete = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/roadmaps/${roadmapId}/tasks/${taskId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.ok) {
        setDone(true);
        alert(`+${res.data.pointsAwarded} points`);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error completing task");
    }
  };

  return (
    <button disabled={done} onClick={handleComplete} style={{ marginLeft: "1rem" }}>
      {done ? "Completed ✔" : "Complete Task"}
    </button>
  );
}
