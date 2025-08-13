"use client"

import { useEffect, useState } from "react"

export function UserTableDashboard() {
  const [showModal, setShowModal] = useState(false)
  const [showViewDropdown, setShowViewDropdown] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false
  })

  const togglePassword = (field: 'password' | 'confirmPassword') => {
    setPasswordVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [showModal])

  return (
    <div className="pt-4">
      {/* Header removed: Add User will live next to View in controls */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 relative shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xl">👥</div>
            <span className="text-sm font-medium text-muted-foreground">Total</span>
          </div>
          <div className="text-3xl font-semibold text-foreground mb-1">12,000</div>
          <div className="text-sm text-muted-foreground">+5% em relação ao mês passado</div>
          <div className="absolute top-5 right-5 group">
            <svg className="w-4 h-4 text-muted-foreground cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
              <circle cx="10" cy="6" r="1"/>
              <rect x="9" y="9" width="2" height="5" rx="1"/>
            </svg>
            <span className="invisible group-hover:visible absolute -top-10 -right-2 bg-popover text-popover-foreground px-4 py-2 rounded-lg text-sm whitespace-nowrap z-10 border border-border shadow-md">
              Total number of users
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 relative shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xl">👤</div>
            <span className="text-sm font-medium text-muted-foreground">Novos</span>
          </div>
          <div className="text-3xl font-semibold text-foreground mb-1">+350</div>
          <div className="text-sm text-muted-foreground">+10% em relação ao mês passado</div>
          <div className="absolute top-5 right-5 group">
            <svg className="w-4 h-4 text-muted-foreground cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
              <circle cx="10" cy="6" r="1"/>
              <rect x="9" y="9" width="2" height="5" rx="1"/>
            </svg>
            <span className="invisible group-hover:visible absolute -top-10 -right-2 bg-popover text-popover-foreground px-4 py-2 rounded-lg text-sm whitespace-nowrap z-10 border border-border shadow-md">
              New Users
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 relative shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xl">⏳</div>
            <span className="text-sm font-medium text-muted-foreground">Pending Verifications</span>
          </div>
          <div className="text-3xl font-semibold text-foreground mb-1">42</div>
          <div className="text-sm text-muted-foreground">2% of users</div>
          <div className="absolute top-5 right-5 group">
            <svg className="w-4 h-4 text-muted-foreground cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
              <circle cx="10" cy="6" r="1"/>
              <rect x="9" y="9" width="2" height="5" rx="1"/>
            </svg>
            <span className="invisible group-hover:visible absolute -top-10 -right-2 bg-popover text-popover-foreground px-4 py-2 rounded-lg text-sm whitespace-nowrap z-10 border border-border shadow-md">
              Pending Verifications
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 relative shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xl">👤</div>
            <span className="text-sm font-medium text-muted-foreground">Active Users</span>
          </div>
          <div className="text-3xl font-semibold text-foreground mb-1">7,800</div>
          <div className="text-sm text-muted-foreground">65% of all users</div>
          <div className="absolute top-5 right-5 group">
            <svg className="w-4 h-4 text-muted-foreground cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
              <circle cx="10" cy="6" r="1"/>
              <rect x="9" y="9" width="2" height="5" rx="1"/>
            </svg>
            <span className="invisible group-hover:visible absolute -top-10 -right-2 bg-popover text-popover-foreground px-4 py-2 rounded-lg text-sm whitespace-nowrap z-10 border border-border shadow-md">
              Active Users
            </span>
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-4">
          <div className="relative w-70">
            <input 
              type="text" 
              placeholder="Buscar" 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Adicionar
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowViewDropdown(!showViewDropdown)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="6" cy="8" r="2" fill="white" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="10" cy="8" r="2" fill="white" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Filtro
            </button>
            {showViewDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-lg p-2 w-64 shadow-lg z-10">
                <div className="text-sm font-semibold text-foreground p-2 mb-2">Toggle columns</div>
                {['Email', 'PhoneNumber', 'CreatedAt', 'LastLoginAt'].map((column) => (
                  <div key={column} className="flex items-center gap-3 p-2 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <div className="w-4 h-4 border-2 border-primary rounded bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                    <span className="text-sm text-foreground">{column}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50 border-t border-b border-border">
            <tr>
              <th className="text-left p-3 w-10">
                <input type="checkbox" className="w-4 h-4 border border-input rounded cursor-pointer"/>
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email ↓</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phone Number</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Registered Date</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Last Login Date</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Montana Muller", email: "montana_schamberger@yahoo.com", phone: "+12827614031", registered: "12 Nov, 2024", lastLogin: "16 Jul, 2025", status: "Active", role: "Cashier", icon: "👤" },
              { name: "Aida Durgan", email: "aida_graham@gmail.com", phone: "+14069695927", registered: "24 Aug, 2024", lastLogin: "10 Jun, 2025", status: "Invited", role: "Superadmin", icon: "⭕" },
              { name: "Chadrick Trantow", email: "chadrick26@yahoo.com", phone: "+16939493174", registered: "24 Mar, 2025", lastLogin: "08 Jul, 2025", status: "Inactive", role: "Superadmin", icon: "⭕" },
              { name: "Abbie Reilly", email: "abbie_roberts@yahoo.com", phone: "+15843633665", registered: "27 Jan, 2025", lastLogin: "26 Jun, 2025", status: "Inactive", role: "Manager", icon: "👤" },
              { name: "Charley Hane", email: "charley_lebsack53@yahoo.com", phone: "+14937636683", registered: "01 Apr, 2025", lastLogin: "22 Jul, 2025", status: "Invited", role: "Admin", icon: "👤" },
              { name: "Loyce Lubowitz", email: "loyce56@yahoo.com", phone: "+12564755345", registered: "10 Sep, 2024", lastLogin: "11 Jun, 2025", status: "Active", role: "Manager", icon: "👤" },
              { name: "Jillian Klocko", email: "jillian.ernser85@hotmail.com", phone: "+17363308778", registered: "26 Nov, 2024", lastLogin: "08 May, 2025", status: "Suspended", role: "Manager", icon: "👤" },
              { name: "Donavon Donnelly", email: "donavon_reinger49@yahoo.com", phone: "+16507749792", registered: "16 Dec, 2024", lastLogin: "26 Jan, 2025", status: "Invited", role: "Admin", icon: "👤" },
              { name: "Kameron Turcotte", email: "kameron.heller25@yahoo.com", phone: "+19715552582", registered: "26 Nov, 2024", lastLogin: "18 Jul, 2025", status: "Inactive", role: "Superadmin", icon: "⭕" },
              { name: "Vernie Collins", email: "vernie75@yahoo.com", phone: "+17988907194", registered: "26 Apr, 2025", lastLogin: "29 May, 2025", status: "Invited", role: "Superadmin", icon: "⭕" }
            ].map((user, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <input type="checkbox" className="w-4 h-4 border border-input rounded cursor-pointer"/>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium text-foreground underline cursor-pointer hover:text-primary">{user.name}</span>
                </td>
                <td className="p-4 text-sm text-foreground">{user.email}</td>
                <td className="p-4 text-sm text-foreground">{user.phone}</td>
                <td className="p-4 text-sm text-foreground">{user.registered}</td>
                <td className="p-4 text-sm text-foreground">{user.lastLogin}</td>
                <td className="p-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' :
                    user.status === 'Invited' ? 'bg-blue-100 text-blue-800' :
                    user.status === 'Inactive' ? 'bg-gray-100 text-gray-600' :
                    user.status === 'Suspended' ? 'bg-red-100 text-red-800' : ''
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{user.icon}</span>
                    <span>{user.role}</span>
                  </div>
                </td>
                <td className="p-4">
                  <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">⋯</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-5 pt-4">
        <div className="text-sm text-muted-foreground">
          0 of 30 row(s) selected.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span>Rows per page</span>
            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <div className="text-sm text-foreground">Page 1 of 3</div>
          <div className="flex gap-1">
            <button disabled className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6 4L2 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button disabled className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 w-8">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 4L14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-background rounded-xl w-full max-w-md mx-4 animate-in slide-in-from-top-4 border border-border shadow-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="font-semibold leading-none tracking-tight">Adicionar novo usuário</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-6">Crie um novo usuário aqui. Clique em salvar quando terminar.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nome</label>
                  <input type="text" placeholder="João" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sobrenome</label>
                  <input type="text" placeholder="Silva" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nome de usuário</label>
                  <input type="text" placeholder="john_doe" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">E-mail</label>
                  <input type="email" placeholder="joao.silva@gmail.com" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Telefone</label>
                  <input type="tel" placeholder="+123456789" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"/>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Cargo</label>
                  <select className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Selecione um cargo</option>
                    <option value="admin">Administrador</option>
                    <option value="manager">Gerente</option>
                    <option value="cashier">Caixa</option>
                    <option value="superadmin">Superadministrador</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Senha</label>
                  <div className="relative">
                    <input 
                      type={passwordVisible.password ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button 
                      type="button"
                      onClick={() => togglePassword('password')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4C4.5 4 1 10 1 10s3.5 6 9 6 9-6 9-6-3.5-6-9-6z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Confirmar senha</label>
                  <div className="relative">
                    <input 
                      type={passwordVisible.confirmPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <button 
                      type="button"
                      onClick={() => togglePassword('confirmPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4C4.5 4 1 10 1 10s3.5 6 9 6 9-6 9-6-3.5-6-9-6z" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showViewDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowViewDropdown(false)}
        />
      )}
    </div>
  )
}
