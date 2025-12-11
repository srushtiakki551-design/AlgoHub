import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { Search, Filter, Code2, TrendingUp, Award, LogOut, User, Settings, BookOpen } from 'lucide-react';

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

  const solvedCount = solvedProblems.length;
  const totalCount = problems.length;
  const solvedPercentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-300 to-base-200">

      {/* Enhanced Navbar */}
      <nav className="navbar bg-base-100/95 backdrop-blur-md shadow-xl px-4 md:px-8 sticky top-0 z-50 border-b border-base-300">
        <div className="flex-1">
          <NavLink to="/" className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-primary hover:text-primary-focus transition-colors">
            <Code2 className="w-8 h-8" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AlgoHub
            </span>
          </NavLink>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 mr-4">
          <NavLink to="/" className="btn btn-ghost btn-sm gap-2">
            <BookOpen className="w-4 h-4" />
            Problems
          </NavLink>
          <NavLink to="/submissions" className="btn btn-ghost btn-sm gap-2">
            <TrendingUp className="w-4 h-4" />
            Submissions
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className="btn btn-ghost btn-sm gap-2">
              <Settings className="w-4 h-4" />
              Admin
            </NavLink>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="font-semibold text-sm">{user?.firstName}</span>
            <span className="text-xs text-base-content/60">{solvedCount} solved</span>
          </div>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-circle btn-ghost avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-10 flex justify-center items-center">
                <span className="text-lg">{user?.firstName?.[0]?.toUpperCase()}</span>
              </div>
            </div>
            <ul className="mt-3 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300">
              <li className="menu-title">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.firstName}
                </span>
              </li>
              <li className="md:hidden"><NavLink to="/">Problems</NavLink></li>
              <li><NavLink to="/submissions">Submission History</NavLink></li>
              {user?.role === 'admin' && <li><NavLink to="/admin">Admin Panel</NavLink></li>}
              <div className="divider my-1"></div>
              <li>
                <button onClick={handleLogout} className="text-error">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stats shadow-lg bg-base-100 border border-base-300">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Award className="w-8 h-8" />
              </div>
              <div className="stat-title">Problems Solved</div>
              <div className="stat-value text-primary">{solvedCount}</div>
              <div className="stat-desc">out of {totalCount} total</div>
            </div>
          </div>

          <div className="stats shadow-lg bg-base-100 border border-base-300">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="stat-title">Progress</div>
              <div className="stat-value text-secondary">{solvedPercentage}%</div>
              <div className="stat-desc">completion rate</div>
            </div>
          </div>

          <div className="stats shadow-lg bg-base-100 border border-base-300">
            <div className="stat">
              <div className="stat-figure text-accent">
                <Code2 className="w-8 h-8" />
              </div>
              <div className="stat-title">Available</div>
              <div className="stat-value text-accent">{totalCount}</div>
              <div className="stat-desc">coding challenges</div>
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="card bg-base-100 shadow-xl mb-6 border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter
            </h2>

            {/* Search Bar */}
            <div className="form-control mb-4 flex items-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search problems by title..."
                  className="input input-bordered w-full pl-10 focus:input-primary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label mr-1.5">
                  <span className="label-text font-semibold">Status</span>
                </label>
                <select
                  className="select select-bordered focus:select-primary"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Problems</option>
                  <option value="solved">Solved Problems</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label mr-1.5">
                  <span className="label-text font-semibold">Difficulty </span>
                </label>
                <select
                  className="select select-bordered focus:select-primary"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                >
                  <option value="all">All Difficulties </option>
                  <option value="easy">Easy </option>
                  <option value="medium">Medium </option>
                  <option value="hard">Hard </option>
                </select>
              </div>

              <div className="form-control">
                <label className="label mr-1.5">
                  <span className="label-text font-semibold">Tag</span>
                </label>
                <select
                  className="select select-bordered focus:select-primary"
                  value={filters.tag}
                  onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                >
                  <option value="all">All Tags</option>
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Problems Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Problems 
            <span className="text-base-content/60 ml-2">({filteredProblems.length})</span>
          </h2>
        </div>

        {/* Problems List */}
        <div className="grid gap-3">
          {filteredProblems.length === 0 ? (
            <div className="card bg-base-100 shadow-lg border border-base-300">
              <div className="card-body text-center py-12">
                <Code2 className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                <p className="text-lg text-base-content/60">No problems found matching your filters</p>
              </div>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="card bg-base-100 hover:shadow-2xl transition-all duration-300 border border-base-300 hover:border-primary/50 group"
              >
                <div className="card-body py-4 px-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="card-title text-lg font-semibold">
                          <NavLink
                            to={`/problem/${problem._id}`}
                            className="hover:text-primary transition-colors group-hover:underline"
                          >
                            {problem.title}
                          </NavLink>
                        </h2>
                        {solvedProblems.some(sp => sp._id === problem._id) && (
                          <div className="badge badge-success gap-1 badge-sm">
                            <Award className="w-3 h-3" />
                            Solved
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className={`badge badge-sm ${getDifficultyBadgeColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </div>
                        <div className="badge badge-info badge-sm badge-outline">
                          {problem.tags}
                        </div>
                      </div>
                    </div>

                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="btn btn-primary btn-sm gap-2 self-start md:self-center"
                    >
                      <Code2 className="w-4 h-4" />
                      Solve
                    </NavLink>
                  </div>
                </div>
              </div>
            ))
          )}
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