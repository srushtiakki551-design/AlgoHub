import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" || problem.difficulty === filters.difficulty;

    const tagMatch =
      filters.tag === "all" || problem.tags === filters.tag;

    const statusMatch =
      filters.status === "all" ||
      solvedProblems.some(sp => sp._id === problem._id);

    const searchMatch = problem.title.toLowerCase().includes(search.toLowerCase());

    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <nav className="navbar bg-base-100 shadow-lg px-6 sticky top-0 z-50">
        <div className="flex-1">
          <NavLink to="/" className="text-2xl font-bold text-primary tracking-wide">
            AlgoHub
          </NavLink>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <span className="font-semibold">{user?.firstName}</span>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-sm btn-outline">Menu</div>
            <ul className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><button onClick={handleLogout}>Logout</button></li>
              <li><NavLink to="/submissions">Submission History</NavLink></li>  {/* NEW */}
              {user?.role === 'admin' && <li><NavLink to="/admin">Admin</NavLink></li>}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">

        {/* ===== Search Bar (Block Element) ===== */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search problems by title..."
            className="input input-bordered w-1/2 min-w-[250px] shadow-sm rounded-lg focus:ring focus:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ===== Existing Filters (Unchanged) ===== */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">

          <select
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Problems</option>
            <option value="solved">Solved Problems</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            className="select select-bordered"
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
          >
            <option value="all">All Tags</option>
            <option value="array">Array</option>
            <option value="linkedList">Linked List</option>
            <option value="graph">Graph</option>
            <option value="dp">DP</option>
          </select>

        </div>

        {/* Problems List */}
        <div className="grid gap-4">
          {filteredProblems.map((problem) => (
            <div
              key={problem._id}
              className="card bg-base-100 hover:bg-base-100/80 shadow-md hover:shadow-xl transition-all duration-200 border border-base-300 rounded-xl"
            >
              <div className="card-body py-4">

                <div className="flex items-center justify-between">
                  <h2 className="card-title text-lg font-semibold">
                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {problem.title}
                    </NavLink>
                  </h2>

                  {solvedProblems.some(sp => sp._id === problem._id) && (
                    <div className="badge badge-success gap-2">✔ Solved</div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </div>
                  <div className="badge badge-info">
                    {problem.tags}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success';
    case 'medium': return 'badge-warning';
    case 'hard': return 'badge-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;
