import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { NavLink } from "react-router";

const AllSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllSubmissions = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get("/problem/allSubmissions");
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching all submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubmissions();
  }, []);

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} KB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted": return "badge-success";
      case "wrong": return "badge-error";
      case "error": return "badge-warning";
      default: return "badge-neutral";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">All Submissions</h1>

      {submissions.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <span>No submissions found</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th>Language</th>
                <th>Status</th>
                <th>Runtime</th>
                <th>Memory</th>
                <th>Passed</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {submissions.map((s, index) => (
                <tr key={s._id}>
                  <td>{index + 1}</td>

                  <td>
                    <NavLink 
                      className="text-blue-500 underline"
                      to={`/problem/${s.problemId}`}
                    >
                      {s.problemTitle || "View Problem"}
                    </NavLink>
                  </td>

                  <td>{s.language}</td>

                  <td>
                    <span className={`badge ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>

                  <td>{s.runtime}s</td>
                  <td>{formatMemory(s.memory)}</td>
                  <td>{s.testCasesPassed}/{s.testCasesTotal}</td>
                  <td>{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllSubmissions;
