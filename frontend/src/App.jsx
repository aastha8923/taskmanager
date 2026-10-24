import { Fragment, useState, useEffect } from 'react'
import './App.css'

const API = 'http://localhost:8080/api'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [email, setEmail] = useState('')
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '')
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [projectFilter, setProjectFilter] = useState('ALL')
  const [userFilter, setUserFilter] = useState('ALL')
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [projectSearch, setProjectSearch] = useState('')

  const [users, setUsers] = useState([]);
  const [expandedProjectId, setExpandedProjectId] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectDueDate, setProjectDueDate] = useState('')
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [isEditingTask, setIsEditingTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskProjectId, setTaskProjectId] = useState('')
  const [taskAssignedUserId, setTaskAssignedUserId] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskPriority, setTaskPriority] = useState('MEDIUM')
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [taskHistory, setTaskHistory] = useState({})
  const [taskActivityHistory, setTaskActivityHistory] = useState({});
  const [historyLoading, setHistoryLoading] = useState(false)


  // Authenticate an existing user and save the JWT for API requests.
  async function login(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Check your credentials.')
      }

      // Store the authenticated user's token and profile details.
      localStorage.setItem('token', data.token)
      localStorage.setItem('userName', data.name)
      localStorage.setItem('userRole', data.role)

      setUserName(data.name)
      setUserRole(data.role)
      setToken(data.token)
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  // Register a new account through the backend registration endpoint.
  // The backend should assign the USER role automatically.
  async function handleRegister(event) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.')
      }

      setIsRegistering(false)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setError('')
      alert('Registration successful! Please sign in.')
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch dashboard data using the currently authenticated user's token.

  async function loadDashboard() {
    if (!token) return

    try {
      const headers = { Authorization: `Bearer ${token}` }

      const [taskResponse, projectResponse] = await Promise.all([
        fetch(`${API}/tasks`, { headers }),
        fetch(`${API}/projects`, { headers }),
      ])

      if (
          taskResponse.status === 401 ||
          projectResponse.status === 401
      ) {
        logout()
        return
      }

      if (taskResponse.ok) setTasks(await taskResponse.json())
      if (projectResponse.ok) setProjects(await projectResponse.json())

      // Load registered users for the admin's task assignment dropdown.
      if (userRole === 'ADMIN') {
        const userResponse = await fetch(`${API}/users`, { headers })

        if (userResponse.ok) {
          setUsers(await userResponse.json())
        } else {
          setUsers([])
        }
      } else {
        setUsers([])
      }

    } catch {
      setError('Could not load data. Check that the backend is running.')
    }
  }

  async function loadTaskHistory(taskId) {
    setHistoryLoading(true)

    try {
      const response = await fetch(`${API}/tasks/${taskId}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load task history')
      }

      const history = await response.json()

      setTaskHistory((prev) => ({
        ...prev,
        [taskId]: history,
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setHistoryLoading(false)
    }
  }

  async function loadTaskActivityHistory(taskId) {
    try {
      const response = await fetch(
          `${API}/tasks/${taskId}/activity-history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (!response.ok) {
        throw new Error('Failed to load activity history');
      }

      const activities = await response.json();

      setTaskActivityHistory((prev) => ({
        ...prev,
        [taskId]: activities,
      }));
    } catch (err) {
      setError(err.message);
    }
  }





  useEffect(() => {
    if (token) {
      loadDashboard()
    }
  }, [token])

  // Clear the saved session and dashboard data when logging out.
  function logout() {

    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')

    setToken('')
    setUserName('')
    setUserRole('')
    setTasks([])
    setProjects([])
    setError('')
    setEmail('')
    setPassword('')
  }
  // Populates the project form with existing details so the admin can edit the selected project.
  function startEditingProject(project) {
    setEditingProjectId(project.id)
    setProjectName(project.name || '')
    setProjectDescription(project.description || '')
    setProjectDueDate(project.dueDate || '')
    setIsEditingProject(true)
    setShowProjectForm(true)
  }

  // Populate the task form with the selected task's existing details.
  function startEditingTask(task) {
    setEditingTaskId(task.id)
    setTaskTitle(task.title || '')
    setTaskDescription(task.description || '')
    setTaskProjectId(String(task.project?.id ?? task.projectId ?? ''))
    setTaskAssignedUserId(
        String(task.assignedTo?.id ?? task.assignedUserId ?? '')
    )
    setTaskDueDate(task.dueDate || '')
    setTaskPriority(task.priority || 'MEDIUM')
    setIsEditingTask(true)
    setShowTaskForm(true)
    setError('')
  }



  // Updates an existing project with the edited details and refreshes the dashboard.
  async function updateProject(event) {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch(`${API}/projects/${editingProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          dueDate: projectDueDate || null,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Could not update project.')
      }

      setShowProjectForm(false)
      setIsEditingProject(false)
      setEditingProjectId(null)
      setProjectName('')
      setProjectDescription('')
      setProjectDueDate('')

      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not update project.')
    }
  }


  // Allow administrators to create projects through the backend API.
  async function createProject(event) {
    event.preventDefault()
    setError('')

    try {
      const response = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription,
          dueDate: projectDueDate || null,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Could not create project.')
      }

      setProjectName('')
      setProjectDescription('')
      setProjectDueDate('')
      setShowProjectForm(false)
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not create project.')
    }
  }


  // Delete a project (Admin only).
  async function deleteProject(projectId, projectName) {
    const confirmed = window.confirm(
        `Are you sure you want to delete "${projectName}"?`
    )

    if (!confirmed) return

    setError('')

    try {
      const response = await fetch(`${API}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const message = await response.text()

        throw new Error(
            message || `Could not delete project (HTTP ${response.status}).`
        )
      }

      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not delete project.')
    }
  }



  // Create a task for a selected project and assign it to a registered user.
  // The user ID is entered by the admin because this app does not currently expose a users-list endpoint.

  async function createTask(event) {
    event.preventDefault()
    setError('')

    try {
      const isEditing = isEditingTask

      const url = isEditing
          ? `${API}/tasks/${editingTaskId}?projectId=${Number(taskProjectId)}&assignedUserId=${Number(taskAssignedUserId)}`
          : `${API}/tasks?projectId=${Number(taskProjectId)}&assignedUserId=${Number(taskAssignedUserId)}`

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          dueDate: taskDueDate || null,
          project: { id: Number(taskProjectId) },
          assignedTo: taskAssignedUserId
              ? { id: Number(taskAssignedUserId) }
              : null,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
            data.message ||
            `Could not ${isEditing ? 'update' : 'create'} task (HTTP ${response.status}).`
        )
      }

      setTaskTitle('')
      setTaskDescription('')
      setTaskProjectId('')
      setTaskAssignedUserId('')
      setTaskDueDate('')
      setTaskPriority('MEDIUM')
      setShowTaskForm(false)
      setIsEditingTask(false)
      setEditingTaskId(null)

      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not save task.')
    }
  }


  // Let an authenticated user update task progress; the backend enforces assignment permissions.
  async function updateTaskStatus(taskId, status) {
    setError('')
    try {
      const response = await fetch(
          `${API}/tasks/${taskId}/status?status=${encodeURIComponent(status)}`,
          {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
          }
      )
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || `Could not update status (HTTP ${response.status}).`)
      }
      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not update task status.')
    }
  }

  // Delete a task after the admin confirms the action.
  async function deleteTask(taskId, taskTitle) {
    const confirmed = window.confirm(
        `Are you sure you want to delete "${taskTitle}"?`
    )

    if (!confirmed) return

    setError('')

    try {
      const response = await fetch(`${API}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
            data.message || `Could not delete task (HTTP ${response.status}).`
        )
      }

      await loadDashboard()
    } catch (err) {
      setError(err.message || 'Could not delete task.')
    }
  }


  // Filter tasks by title or description based on the search input.

  const visibleTasks = (
      activeTab === 'My Tasks' ? tasks : tasks.slice(0, 5)
  ).filter((task) => {
    const query = searchQuery.toLowerCase().trim()

    const matchesSearch =
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)

    const matchesStatus =
        statusFilter === 'ALL' || task.status === statusFilter


    const matchesProject =
        projectFilter === 'ALL' ||
        String(task.project?.id) === projectFilter

    const matchesUser =
        userFilter === 'ALL' ||
        String(task.assignedTo?.id) === userFilter

    return matchesSearch && matchesStatus && matchesProject && matchesUser

  })


  // Display the existing dashboard after authentication.
  if (token) {
    return (
        <div className="app-shell">
          <aside className="sidebar">
            <div className="brand">
              <span className="brand-icon">T</span> TaskFlow
            </div>

            <p className="nav-label">WORKSPACE</p>

            {['Overview', 'Projects', 'My Tasks'].map((item) => (
                <button
                    key={item}
                    className={`nav-item ${activeTab === item ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab(item)
                      loadDashboard()
                    }}
                >
                  {item === 'Overview' ? '▦' : item === 'Projects' ? '▣' : '✓'}
                  <span>{item}</span>
                </button>
            ))}

            <div className="sidebar-bottom">
              <div className="avatar">U</div>
              <div className="profile-text">
                <strong>{userName || 'User'}</strong>
                <span>
    {userRole === 'ADMIN' ? 'Administrator' : 'Regular User'}
  </span>
              </div>
              <button
                  className="logout-button"
                  onClick={logout}
                  title="Log out"
              >
                ↪
              </button>
            </div>
          </aside>

          <main className="main-content">
            <header className="topbar">
              <div>
                <p className="eyebrow">WORKSPACE / TASKFLOW</p>
                <h1>{activeTab}</h1>
              </div>
              <button className="primary-button" onClick={loadDashboard}>
                ↻ Refresh data
              </button>
            </header>

            {error && <div className="error-banner">{error}</div>}
            {activeTab === 'Overview' && (
                <>
            <section className="welcome-card">
              <div>
                <p className="welcome-tag">YOUR WORKSPACE</p>
                <h2>Make progress, one task at a time.</h2>
                <p>Keep projects organized and track your team's progress.</p>
              </div>
              <div className="welcome-art">✓</div>
            </section>


            <section className="stats-grid">
              <div className="stat-card">
                <span>Total Tasks</span>
                <strong>{tasks.length}</strong>
                <small>Tasks across projects</small>
              </div>

              <div className="stat-card">
                <span>Completed Tasks</span>
                <strong>
                  {tasks.filter(t => t.status === 'COMPLETED').length}
                </strong>
                <small>Tasks finished</small>
              </div>

              <div className="stat-card">
                <span>Pending Tasks</span>
                <strong>
                  {tasks.filter(t => t.status !== 'COMPLETED').length}
                </strong>
                <small>Tasks not yet completed</small>
              </div>

              <div className="stat-card">
                <span>Overdue Tasks</span>
                <strong>
                  {tasks.filter(t =>
                      t.status !== 'COMPLETED' &&
                      t.dueDate &&
                      new Date(t.dueDate) < new Date(new Date().toDateString())
                  ).length}
                </strong>
                <small>Past due date and not completed</small>
              </div>
            </section>
                </>
            )}

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>
                    {activeTab === 'Projects'
                        ? 'Projects'
                        : activeTab === 'My Tasks'
                            ? 'Tasks'
                            : 'Recent tasks'}
                  </h2>
                  <p>Live data from your Task Management API</p>


                  {activeTab === 'My Tasks' && (
                      <div className="task-filters">
                        <div className="task-search">
                          <input
                              type="text"
                              placeholder="Search tasks"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        <select
                            className="task-filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            aria-label="Filter tasks by status"
                        >
                          <option value="ALL">All statuses</option>
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="BLOCKED">Blocked</option>
                        </select>

                        <select
                            className="task-filter-select"
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                        >
                          <option value="ALL">All Projects</option>
                          {projects.map((project) => (
                              <option key={project.id} value={String(project.id)}>
                                {project.name}
                              </option>
                          ))}
                        </select>

                        {userRole === 'ADMIN' && (
                            <select
                                className="task-filter-select"
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                            >
                              <option value="ALL">All Users</option>
                              {users.map((user) => (
                                  <option key={user.id} value={String(user.id)}>
                                    {user.name || user.email}
                                  </option>
                              ))}
                            </select>
                        )}


                      </div>
                  )}


                </div>

                <div className="section-actions">
                  <button className="secondary-button" onClick={loadDashboard}>
                    Load latest
                  </button>

                  {activeTab === 'Projects' && userRole === 'ADMIN' && (
                      <button
                          className="primary-button"
                          onClick={() => setShowProjectForm(!showProjectForm)}
                      >
                        {showProjectForm ? 'Cancel' : '+ Create Project'}
                      </button>
                  )}
                  {activeTab !== 'Projects' && userRole === 'ADMIN' && (
                      <button
                          className="primary-button"
                          onClick={() => setShowTaskForm(!showTaskForm)}
                      >
                        {showTaskForm ? 'Cancel' : '+ Create Task'}
                      </button>
                  )}

                </div>
              </div>

              {activeTab === 'Projects' &&
                  userRole === 'ADMIN' &&
                  showProjectForm && (
                      <form
                          className="project-form"
                          onSubmit={isEditingProject ? updateProject : createProject}
                      >
                        <h3>{isEditingProject ? 'Edit Project' : 'Create a new project'}</h3>

                        <label htmlFor="projectName">Project name</label>
                        <input
                            id="projectName"
                            type="text"
                            placeholder="Enter project name"
                            value={projectName}
                            onChange={e => setProjectName(e.target.value)}
                            maxLength={150}
                            required
                        />

                        <label htmlFor="projectDescription">Description</label>
                        <textarea
                            id="projectDescription"
                            placeholder="Describe the project"
                            value={projectDescription}
                            onChange={e => setProjectDescription(e.target.value)}
                            maxLength={2000}
                        />

                        <label htmlFor="projectDueDate">Due date</label>
                        <input
                            id="projectDueDate"
                            type="date"
                            value={projectDueDate}
                            onChange={e => setProjectDueDate(e.target.value)}
                        />

                        <button className="primary-button" type="submit">
                          {isEditingProject ? 'Update Project' : 'Create Project'}
                        </button>
                      </form>
                  )}

              {activeTab !== 'Projects' && userRole === 'ADMIN' && showTaskForm && (
                  <form className="project-form" onSubmit={createTask}>
                    <h3>{isEditingTask ? 'Edit Task' : 'Create and assign a task'}</h3>

                    <label htmlFor="taskTitle">Task title</label>
                    <input
                        id="taskTitle"
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                        placeholder="e.g. Implement user registration"
                        maxLength={150}
                        required
                    />

                    <label htmlFor="taskDescription">Description</label>
                    <textarea
                        id="taskDescription"
                        value={taskDescription}
                        onChange={e => setTaskDescription(e.target.value)}
                        placeholder="Describe the task"
                        maxLength={2000}
                    />

                    <label htmlFor="taskProjectId">Project</label>
                    <select
                        id="taskProjectId"
                        value={taskProjectId}
                        onChange={e => setTaskProjectId(e.target.value)}
                        required
                    >
                      <option value="">Select a project</option>
                      {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name} (ID: {project.id})
                          </option>
                      ))}
                    </select>


                    <label htmlFor="taskAssignedUserId">Assign to user</label>
                    <select
                        id="taskAssignedUserId"
                        value={taskAssignedUserId}
                        onChange={e => {
                          console.log("Selected user ID:", e.target.value)
                          setTaskAssignedUserId(e.target.value)
                        }}
                        required
                    >
                      <option value="">Select a user</option>
                      {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                      ))}
                    </select>

                    <small>Use the registered user's database ID (for example, 3).</small>

                    <label htmlFor="taskPriority">Priority</label>
                    <select
                        id="taskPriority"
                        value={taskPriority}
                        onChange={e => setTaskPriority(e.target.value)}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>

                    <label htmlFor="taskDueDate">Due date</label>
                    <input
                        id="taskDueDate"
                        type="date"
                        value={taskDueDate}
                        onChange={e => setTaskDueDate(e.target.value)}
                    />

                    <button className="primary-button" type="submit">
                      {isEditingTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </form>
              )}


              {activeTab === 'Projects' && (
                  <div className="task-filters">
                    <div className="task-search">
                      <input
                          type="text"
                          placeholder="Search projects"
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                      />
                    </div>


                  </div>
              )}



              {activeTab === 'Projects' ? (
                  projects.filter((project) => {
                    const query = projectSearch.toLowerCase().trim()

                    const matchesSearch =
                        project.name?.toLowerCase().includes(query) ||
                        project.description?.toLowerCase().includes(query)

                    return matchesSearch
                  }).length ? (
                      projects.filter((project) => {
                        const query = projectSearch.toLowerCase().trim()

                        const matchesSearch =
                            project.name?.toLowerCase().includes(query) ||
                            project.description?.toLowerCase().includes(query)

                        return matchesSearch
                      }).map(project => (

                          <>
                            <div className="list-row" key={project.id}>
                              <div className="row-icon project-icon">▣</div>






                              <div className="row-details">
                                <div className="project-title-line">
                                  <strong>{project.name}</strong>

                                  <button
                                      type="button"
                                      className="project-expand-arrow"
                                      title={expandedProjectId === project.id ? 'Hide details' : 'View details'}
                                      aria-label="Toggle project details"
                                      aria-expanded={expandedProjectId === project.id}
                                      onClick={() =>
                                          setExpandedProjectId(
                                              expandedProjectId === project.id ? null : project.id
                                          )
                                      }
                                  >
                                    {expandedProjectId === project.id ? '⌃' : '⌄'}
                                  </button>
                                </div>

                                <span>{project.description || 'No description'}</span>
                              </div>

                              <span className="status-pill">
    {project.status || 'PLANNED'}
  </span>



                              {userRole === 'ADMIN' && (
                                  <>
                                    <button
                                        type="button"
                                        className="icon-button edit-icon-button"
                                        title="Edit"
                                        aria-label="Edit project"
                                        onClick={() => startEditingProject(project)}
                                    >
                                      ✎
                                    </button>

                                    <button
                                        type="button"
                                        className="icon-button delete-icon-button"
                                        title="Delete"
                                        aria-label="Delete project"
                                        onClick={() => deleteProject(project.id, project.name)}
                                    >
                                      🗑
                                    </button>
                                  </>
                              )}


                            </div>
                            {expandedProjectId === project.id && (
                                <div className="project-details-panel">
                                  <p><strong>Project ID:</strong> {project.id}</p>
                                  <p><strong>Name:</strong> {project.name}</p>
                                  <p><strong>Description:</strong> {project.description || 'No description available'}</p>
                                  <p><strong>Status:</strong> {project.status || 'Not specified'}</p>
                                  <p><strong>Due Date:</strong> {project.dueDate || 'No due date'}</p>
                                  <p>
                                    <strong>Total Tasks:</strong>{' '}
                                    {tasks.filter(
                                        (task) => Number(task.project?.id) === Number(project.id)
                                    ).length}
                                  </p>
                                </div>
                            )}
                          </>
                      ))
                  ) : (
                      <p className="empty-state">
                        No projects loaded yet. Click “Refresh data”.
                      </p>
                  )
              ) : (
                  visibleTasks.length ? (
                      visibleTasks.map(task => (
                          <Fragment key={task.id}>
                            <div className="list-row">
                              <div
                                  className={`row-icon ${
                                      task.status === 'COMPLETED' ? 'done-icon' : 'task-icon'
                                  }`}
                              >
                                {task.status === 'COMPLETED' ? '✓' : '◷'}
                              </div>

                              <div className="row-details">
                                <div className="project-title-line">
                                  <strong>{task.title}</strong>


                                  <button
                                      type="button"
                                      className="project-expand-arrow"
                                      onClick={() => {
                                        if (expandedTaskId === task.id) {
                                          setExpandedTaskId(null)
                                        } else {
                                          setExpandedTaskId(task.id)
                                          loadTaskHistory(task.id)
                                          loadTaskActivityHistory(task.id)
                                        }
                                      }}
                                      aria-label={
                                        expandedTaskId === task.id
                                            ? 'Collapse task details'
                                            : 'Expand task details'
                                      }
                                      aria-expanded={expandedTaskId === task.id}
                                  >
                                    {expandedTaskId === task.id ? '⌃' : '⌄'}
                                  </button>
                                </div>
                                <span>{task.description || 'No description'}</span>
                              </div>

                              <span
                                  className={`status-pill ${
                                      task.status === 'COMPLETED'
                                          ? 'completed'
                                          : task.status === 'IN_PROGRESS'
                                              ? 'progress'
                                              : task.status === 'BLOCKED'
                                                  ? 'blocked'
                                                  : ''
                                  }`}
                              >
                                {(task.status || 'TODO').replace('_', ' ')}
                              </span>

                              <select
                                  className="task-status-select"
                                  aria-label={`Update status for ${task.title}`}
                                  value={task.status || 'TODO'}
                                  onChange={e => updateTaskStatus(task.id, e.target.value)}
                              >
                                <option value="TODO">To do</option>
                                <option value="IN_PROGRESS">In progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="BLOCKED">Blocked</option>
                              </select>

                              {userRole === 'ADMIN' && (
                                  <>
                                    <button
                                        type="button"
                                        className="icon-button edit-icon-button"
                                        title="Edit task"
                                        aria-label="Edit task"
                                        onClick={() => startEditingTask(task)}
                                    >
                                      ✎
                                    </button>

                                    <button
                                        type="button"
                                        className="icon-button delete-icon-button"
                                        title="Delete task"
                                        aria-label="Delete task"
                                        onClick={() => deleteTask(task.id, task.title)}
                                    >
                                      🗑
                                    </button>
                                  </>
                              )}

                            </div>


                            {expandedTaskId === task.id && (
                                <div className="project-expanded-details">
                                  <div>
                                    <span>Task ID</span>
                                    <strong>{task.id}</strong>
                                  </div>

                                  <div>
                                    <span>Project ID</span>
                                    <strong>{task.project?.id ?? task.projectId ?? 'N/A'}</strong>
                                  </div>

                                  <div>
                                    <span>Priority</span>
                                    <strong>{task.priority || 'N/A'}</strong>
                                  </div>

                                  <div>
                                    <span>Due Date</span>
                                    <strong>{task.dueDate || 'Not set'}</strong>
                                  </div>

                                  <div>
                                    <span>Assigned To</span>
                                    <strong>{task.assignedTo?.name || 'Unassigned'}</strong>
                                  </div>

                                  <div className="task-status-history">
                                    <span>Status History</span>

                                    {historyLoading && !taskHistory[task.id] && (
                                        <p>Loading status history...</p>
                                    )}

                                    {!historyLoading &&
                                        taskHistory[task.id]?.length === 0 && (
                                            <p>No status changes recorded yet.</p>
                                        )}

                                    {taskHistory[task.id]?.map((entry, index) => (
                                        <div key={entry.id ?? index} className="history-entry">
                                          <strong>
                                            {entry.previousStatus || 'CREATED'} → {entry.newStatus}
                                          </strong>

                                          <span>
            Changed by:{' '}
                                            {entry.changedBy?.name ||
                                                entry.changedBy?.email ||
                                                'Unknown'}
          </span>

                                          <span>
            {entry.changedAt
                ? new Date(entry.changedAt).toLocaleString()
                : ''}
          </span>
                                        </div>
                                    ))}
                                  </div>
                                  <div className="task-status-history">
                                    <span>Assignee Activity History</span>

                                    {taskActivityHistory[task.id]?.length === 0 && (
                                        <p>No assignee changes recorded yet.</p>
                                    )}

                                    {taskActivityHistory[task.id]?.map((entry, index) => (
                                        <div key={entry.id ?? index} className="history-entry">
                                          <strong>
                                            {entry.activityType === 'ASSIGNEE_CHANGED'
                                                ? 'Assignee changed'
                                                : entry.activityType}
                                          </strong>

                                          <span>
        {entry.oldValue || 'Unassigned'} → {entry.newValue || 'Unassigned'}
      </span>

                                          <span>
        Changed by: {entry.changedBy?.name || entry.changedBy?.email || 'Unknown'}
      </span>

                                          <span>
        {entry.changedAt
            ? new Date(entry.changedAt).toLocaleString()
            : ''}
      </span>
                                        </div>
                                    ))}
                                  </div>
                                </div>
                            )}

                          </Fragment>
                      ))
                  ) : (
                      <p className="empty-state">
                        No tasks loaded yet. Click “Refresh data”.
                      </p>
                  )
              )}
            </section>

            <p className="footer-note">
              TaskFlow · Project &amp; Task Management System
            </p>
          </main>
        </div>
    )
  }

  // Show either the login form or registration form before authentication.
  return (
      <main className="login-page">
        <section className="login-visual">
          <div className="brand light-brand">
            <span className="brand-icon">T</span> TaskFlow
          </div>

          <div className="visual-copy">
            <span className="visual-tag">PLAN · COLLABORATE · DELIVER</span>
            <h1>
              Great work starts
              <br />
              with a clear plan.
            </h1>
            <p>
              Bring projects, tasks, and people together in one organized workspace.
            </p>
            <div className="visual-checks">
              <span>✓ &nbsp;Organize projects</span>
              <span>✓ &nbsp;Track task progress</span>
              <span>✓ &nbsp;Stay on schedule</span>
            </div>
          </div>

          <div className="visual-footer">PROJECT &amp; TASK MANAGEMENT</div>
        </section>

        <section className="login-panel">
          <form
              className="login-form"
              onSubmit={isRegistering ? handleRegister : login}
          >
            <div className="mobile-brand brand">
              <span className="brand-icon">T</span> TaskFlow
            </div>

            <span className="form-tag">
            {isRegistering ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
          </span>

            <h2>
              {isRegistering
                  ? 'Create your account'
                  : 'Sign in to your workspace'}
            </h2>

            <p className="form-description">
              {isRegistering
                  ? 'Enter your details to join TaskFlow.'
                  : 'Enter your account details to continue.'}
            </p>

            {isRegistering && (
                <>
                  <label htmlFor="name">Full name</label>
                  <input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      maxLength={100}
                      required
                  />
                </>
            )}

            <label htmlFor="email">Email address</label>
            <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />

            <label htmlFor="password">Password</label>
            <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={isRegistering ? 8 : undefined}
                required
            />

            {isRegistering && (
                <>
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      minLength={8}
                      required
                  />
                </>
            )}

            {error && <div className="error-banner">{error}</div>}

            <button
                className="sign-in-button"
                type="submit"
                disabled={loading}
            >
              {loading
                  ? isRegistering
                      ? 'Creating account...'
                      : 'Signing in...'
                  : isRegistering
                      ? 'Create account →'
                      : 'Sign in →'}
            </button>

            <p className="login-help">
              {isRegistering
                  ? 'Already have an account?'
                  : 'New to TaskFlow?'}{' '}
              <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => {
                    setIsRegistering(!isRegistering)
                    setError('')
                    setName('')
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
              >
                {isRegistering ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </form>

          <div className="panel-footer">
            Secure access powered by JWT authentication
          </div>
        </section>
      </main>
  )
}

export default App
