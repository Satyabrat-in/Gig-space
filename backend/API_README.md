# Freelancing Platform – API Documentation

Welcome to the API Documentation for the Freelancing Platform. This robust backend is built with Node.js and Express, serving as the core engine for connecting freelancers, employers, and administrators. 

> **Base URL:** `http://localhost:5000/api`

---

## 🛡️ Authentication & Authorization
Most API endpoints require a valid **JSON Web Token (JWT)** passed in the `Authorization` header as a Bearer token.
Additionally, the platform uses Role-Based Access Control (RBAC) to restrict resources based on the user category:
- **`Public`**: Open to everyone.
- **`Protected`**: Requires a valid user auth token.
- **`Role Restricted`**: Restricted specifically to a `Freelancer`, `Employer`, or `Admin`.

---

## 🔗 RESTful Endpoints Overview

### 1. Auth API (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/register` | Register a new user account (Freelancer/Employer) | Public |
| `POST` | `/login` | Authenticate user & return JWT token | Public |
| `POST` | `/logout` | Invalidate current user session | Protected |

### 2. User API (`/api/user`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/freelancers` | Fetch a list of all freelancers | Public |
| `GET` | `/:id` | Retrieve specific user details by their ID | Public |
| `GET` | `/me` | Fetch the currently logged-in user's profile | Protected |
| `PUT` | `/update` | Update profile information for the logged-in user | Protected |
| `PUT` | `/change-password`| Change password for the current account | Protected |

### 3. Projects API (`/api/projects`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/all` | Fetch a list of all available projects | Public |
| `GET` | `/category/:category`| Filter and fetch projects by specific category | Public |
| `GET` | `/:id` | Retrieve detailed information about a single project | Public |
| `POST` | `/create` | Create a new freelance project/job instance | Protected (Employer) |
| `GET` | `/my-projects` | Retrieve all projects created by the logged-in employer| Protected (Employer) |
| `PUT` | `/update/:id` | Update metadata/details for a specific project | Protected (Employer) |
| `PUT` | `/status/:id` | Toggle project status (e.g., active, closed, completed) | Protected (Employer) |
| `DELETE` | `/delete/:id` | Delete a project from the system | Protected (Employer) |

### 4. Applications API (`/api/applications`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/apply` | Submit an application for a specific project | Protected (Freelancer) |
| `GET` | `/my-applications`| Fetch all applications submitted by the user | Protected (Freelancer) |
| `PUT` | `/withdraw/:id` | Withdraw an earlier submitted application | Protected (Freelancer) |
| `GET` | `/project/:projectId`| View all applicant proposals for a specific project | Protected (Employer) |
| `PUT` | `/accept/:id` | Accept a specific application proposal | Protected (Employer) |
| `PUT` | `/reject/:id` | Reject a specific application proposal | Protected (Employer) |
| `GET` | `/:id` | Get detailed information regarding an application | Protected (Both) |

### 5. Escrow & Payments API (`/api/escrow`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/fund` | Securely fund the escrow wallet for a project | Protected (Employer) |
| `PUT` | `/release/:projectId`| Release held escrow funds to the assigned freelancer | Protected (Employer) |
| `PUT` | `/refund/:projectId` | Request a refund for the escrow deposit | Protected (Employer) |
| `PUT` | `/dispute/:projectId`| Raise a formal dispute during the escrow lifecycle | Protected (Both) |
| `PUT` | `/resolve/:projectId`| Resolve a finalized escrow dispute | Protected (Admin) |
| `GET` | `/my-escrows` | Access all escrows related to the logged-in account | Protected (Both) |
| `GET` | `/:projectId` | Fetch escrow status/details by the given project ID | Protected |

### 6. Reviews API (`/api/reviews`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/freelancer/:freeId`| Retrieve all reviews targeted at a freelancer | Public |
| `GET` | `/project/:projectId`| Retrieve review left on a specific project | Public |
| `POST` | `/add` | Submit a new rating/review for accomplished work | Protected (Employer) |
| `PUT` | `/update/:id` | Edit and update an existing review instance | Protected (Employer) |
| `DELETE` | `/delete/:id` | Delete/retract a given review | Protected (Employer) |
| `GET` | `/my-reviews` | Retrieve all reviews given by the current Employer | Protected (Employer) |
| `GET` | `/received` | Retrieve all accumulated reviews for the Freelancer | Protected (Freelancer) |

### 7. Search API (`/api/search`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/jobs` | Advanced search querying tailored for jobs/projects | Public |
| `GET` | `/freelancers` | Advanced search querying tailored for freelancers | Public |
| `GET` | `/all` | Cross-platform global search parameter | Public |
| `GET` | `/skills` | Fetch available skills for autocomplete/suggestions | Public |
| `GET` | `/categories` | Fetch category statistics and density distribution | Public |
| `GET` | `/recommendations` | Get personalized algorithm-based job recommendations | Protected (Freelancer) |

### 8. Invitations API (`/api/invitations`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/invite` | Send an invitation for a project to a freelancer | Protected (Employer) |
| `GET` | `/project/:projectId`| View all invitations sent for a specific project | Protected (Employer) |
| `GET` | `/my-invitations` | Fetch all invitations received by the user | Protected (Freelancer) |
| `PUT` | `/:id/respond` | Respond (accepted/declined) to an invitation | Protected (Freelancer) |
