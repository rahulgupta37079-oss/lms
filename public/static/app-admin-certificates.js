// ============================================
// ADMIN CERTIFICATE GENERATION TOOL
// PassionBots LMS - Admin Only
// ============================================

const AdminCertificateTool = {
  currentAdmin: null,
  certificateQueue: [],
  
  // ============================================
  // ADMIN LOGIN PAGE
  // ============================================
  renderAdminLogin() {
    return `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
        <div style="max-width: 450px; width: 100%; padding: 20px;">
          
          <!-- Admin Login Card -->
          <div style="background: #000; border: 2px solid #ffd700; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(255, 215, 0, 0.2);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i class="fas fa-shield-alt" style="font-size: 36px; color: #000;"></i>
              </div>
              <h1 style="font-size: 28px; font-weight: 700; color: #ffd700; margin: 0 0 8px;">Admin Portal</h1>
              <p style="color: #999; font-size: 14px;">Certificate Generation Tool</p>
            </div>
            
            <!-- Login Form -->
            <form onsubmit="AdminCertificateTool.handleAdminLogin(event)" style="margin-bottom: 20px;">
              
              <!-- Username -->
              <div style="margin-bottom: 20px;">
                <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                  <i class="fas fa-user" style="margin-right: 8px;"></i>Username
                </label>
                <input 
                  type="text" 
                  id="admin-username"
                  required
                  style="width: 100%; padding: 12px 16px; background: #1a1a1a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px; transition: all 0.3s;"
                  onfocus="this.style.borderColor='#ffd700'"
                  onblur="this.style.borderColor='#333'"
                  placeholder="Enter admin username"
                />
              </div>
              
              <!-- Password -->
              <div style="margin-bottom: 20px;">
                <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                  <i class="fas fa-lock" style="margin-right: 8px;"></i>Password
                </label>
                <input 
                  type="password" 
                  id="admin-password"
                  required
                  style="width: 100%; padding: 12px 16px; background: #1a1a1a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px; transition: all 0.3s;"
                  onfocus="this.style.borderColor='#ffd700'"
                  onblur="this.style.borderColor='#333'"
                  placeholder="Enter password"
                />
              </div>
              
              <!-- Login Button -->
              <button 
                type="submit"
                style="width: 100%; padding: 14px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #000; font-size: 16px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);"
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 215, 0, 0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255, 215, 0, 0.3)';"
              >
                <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>
                Login to Admin Portal
              </button>
            </form>
            
            <!-- Error Message -->
            <div id="admin-login-error" style="display: none; padding: 12px; background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 8px; color: #dc3545; font-size: 14px; text-align: center;">
              <i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>
              <span id="admin-error-text"></span>
            </div>
            
            <!-- Back to Student Portal -->
            <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
              <a href="javascript:navigateTo('login')" style="color: #999; font-size: 14px; text-decoration: none; transition: color 0.3s;" onmouseover="this.style.color='#ffd700'" onmouseout="this.style.color='#999'">
                <i class="fas fa-arrow-left" style="margin-right: 8px;"></i>Back to Student Portal
              </a>
            </div>
          </div>
          
        </div>
      </div>
    `;
  },
  
  // ============================================
  // ADMIN DASHBOARD
  // ============================================
  renderAdminDashboard() {
    return `
      <div style="min-height: 100vh; background: #000; color: #fff;">
        
        <!-- Admin Header -->
        ${this.renderAdminHeader()}
        
        <!-- Main Content -->
        <div style="padding: 30px; max-width: 1400px; margin: 0 auto;">
          
          <!-- Welcome Section -->
          <div style="margin-bottom: 30px;">
            <h1 style="font-size: 32px; font-weight: 700; color: #ffd700; margin: 0 0 8px;">
              <i class="fas fa-certificate" style="margin-right: 12px;"></i>
              Certificate Generation Tool
            </h1>
            <p style="color: #999; font-size: 16px;">Welcome, ${this.currentAdmin?.full_name || 'Admin'}</p>
          </div>
          
          <!-- Quick Stats -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
            
            <!-- Total Certificates -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border: 1px solid #ffd700; border-radius: 15px; padding: 25px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="width: 50px; height: 50px; background: rgba(255, 215, 0, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <i class="fas fa-certificate" style="font-size: 24px; color: #ffd700;"></i>
                </div>
                <span id="admin-total-certificates" style="font-size: 32px; font-weight: 700; color: #ffd700;">0</span>
              </div>
              <p style="color: #999; font-size: 14px; margin: 0;">Total Certificates</p>
            </div>
            
            <!-- Today's Generated -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border: 1px solid #4ade80; border-radius: 15px; padding: 25px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="width: 50px; height: 50px; background: rgba(74, 222, 128, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <i class="fas fa-plus-circle" style="font-size: 24px; color: #4ade80;"></i>
                </div>
                <span id="admin-today-certificates" style="font-size: 32px; font-weight: 700; color: #4ade80;">0</span>
              </div>
              <p style="color: #999; font-size: 14px; margin: 0;">Generated Today</p>
            </div>
            
            <!-- Active Students -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border: 1px solid #60a5fa; border-radius: 15px; padding: 25px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="width: 50px; height: 50px; background: rgba(96, 165, 250, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <i class="fas fa-users" style="font-size: 24px; color: #60a5fa;"></i>
                </div>
                <span id="admin-active-students" style="font-size: 32px; font-weight: 700; color: #60a5fa;">0</span>
              </div>
              <p style="color: #999; font-size: 14px; margin: 0;">Active Students</p>
            </div>
            
            <!-- Pending Verifications -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border: 1px solid #f59e0b; border-radius: 15px; padding: 25px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <div style="width: 50px; height: 50px; background: rgba(245, 158, 11, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                  <i class="fas fa-clock" style="font-size: 24px; color: #f59e0b;"></i>
                </div>
                <span id="admin-pending-certificates" style="font-size: 32px; font-weight: 700; color: #f59e0b;">0</span>
              </div>
              <p style="color: #999; font-size: 14px; margin: 0;">Pending Verification</p>
            </div>
            
          </div>
          
          <!-- Main Action Tabs -->
          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 15px; overflow: hidden;">
            
            <!-- Tab Headers -->
            <div style="display: flex; border-bottom: 1px solid #333; background: #0a0a0a;">
              <button 
                onclick="AdminCertificateTool.switchTab('generate')"
                id="tab-generate"
                style="flex: 1; padding: 18px; background: transparent; border: none; color: #ffd700; font-size: 16px; font-weight: 600; cursor: pointer; border-bottom: 3px solid #ffd700; transition: all 0.3s;"
              >
                <i class="fas fa-plus-circle" style="margin-right: 8px;"></i>Generate New
              </button>
              <button 
                onclick="AdminCertificateTool.switchTab('manage')"
                id="tab-manage"
                style="flex: 1; padding: 18px; background: transparent; border: none; color: #666; font-size: 16px; font-weight: 600; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.3s;"
              >
                <i class="fas fa-list" style="margin-right: 8px;"></i>Manage Certificates
              </button>
              <button 
                onclick="AdminCertificateTool.switchTab('bulk')"
                id="tab-bulk"
                style="flex: 1; padding: 18px; background: transparent; border: none; color: #666; font-size: 16px; font-weight: 600; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.3s;"
              >
                <i class="fas fa-file-upload" style="margin-right: 8px;"></i>Bulk Generate
              </button>
              <button 
                onclick="AdminCertificateTool.switchTab('verify')"
                id="tab-verify"
                style="flex: 1; padding: 18px; background: transparent; border: none; color: #666; font-size: 16px; font-weight: 600; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.3s;"
              >
                <i class="fas fa-check-circle" style="margin-right: 8px;"></i>Verify
              </button>
            </div>
            
            <!-- Tab Content -->
            <div id="admin-tab-content" style="padding: 30px;">
              ${this.renderGenerateTab()}
            </div>
            
          </div>
          
        </div>
        
      </div>
    `;
  },
  
  // ============================================
  // ADMIN HEADER
  // ============================================
  renderAdminHeader() {
    return `
      <div style="background: #0a0a0a; border-bottom: 2px solid #ffd700; padding: 20px 30px;">
        <div style="max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
          
          <!-- Logo -->
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-robot" style="font-size: 24px; color: #000;"></i>
            </div>
            <div>
              <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffd700;">PassionBots Admin</h2>
              <p style="margin: 0; font-size: 12px; color: #999;">Certificate Management</p>
            </div>
          </div>
          
          <!-- Admin Info & Actions -->
          <div style="display: flex; align-items: center; gap: 20px;">
            
            <!-- Notifications -->
            <button style="position: relative; width: 40px; height: 40px; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px; color: #ffd700; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.background='rgba(255, 215, 0, 0.2)'" onmouseout="this.style.background='rgba(255, 215, 0, 0.1)'">
              <i class="fas fa-bell"></i>
              <span style="position: absolute; top: -5px; right: -5px; width: 18px; height: 18px; background: #dc3545; border: 2px solid #0a0a0a; border-radius: 50%; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center;">3</span>
            </button>
            
            <!-- Admin Profile -->
            <div style="display: flex; align-items: center; gap: 12px; padding: 8px 16px; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px;">
              <div style="width: 35px; height: 35px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-user-shield" style="color: #000; font-size: 16px;"></i>
              </div>
              <div>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #ffd700;">${this.currentAdmin?.full_name || 'Admin'}</p>
                <p style="margin: 0; font-size: 11px; color: #999;">${this.currentAdmin?.role || 'Administrator'}</p>
              </div>
            </div>
            
            <!-- Logout -->
            <button 
              onclick="AdminCertificateTool.handleLogout()"
              style="padding: 10px 20px; background: transparent; border: 1px solid #dc3545; border-radius: 10px; color: #dc3545; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s;"
              onmouseover="this.style.background='rgba(220, 53, 69, 0.1)'"
              onmouseout="this.style.background='transparent'"
            >
              <i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i>Logout
            </button>
          </div>
          
        </div>
      </div>
    `;
  },
  
  // ============================================
  // GENERATE TAB
  // ============================================
  renderGenerateTab() {
    return `
      <div>
        <h3 style="font-size: 22px; font-weight: 700; color: #ffd700; margin: 0 0 20px;">
          <i class="fas fa-plus-circle" style="margin-right: 10px;"></i>
          Generate New Certificate
        </h3>
        
        <!-- Generation Form -->
        <form onsubmit="AdminCertificateTool.handleGenerateCertificate(event)" style="max-width: 800px;">
          
          <!-- Student Selection -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
              <i class="fas fa-user" style="margin-right: 8px;"></i>Student Name
            </label>
            <div style="position: relative;">
              <input 
                type="text" 
                id="cert-student-search"
                required
                oninput="AdminCertificateTool.searchStudents(this.value)"
                style="width: 100%; padding: 14px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px;"
                placeholder="Type to search student name or ID..."
              />
              <div id="student-search-results" style="display: none; position: absolute; top: 100%; left: 0; right: 0; max-height: 300px; overflow-y: auto; background: #0a0a0a; border: 1px solid #ffd700; border-top: none; border-radius: 0 0 10px 10px; z-index: 10;">
                <!-- Search results will appear here -->
              </div>
            </div>
            <input type="hidden" id="cert-student-id" required />
          </div>
          
          <!-- Course Selection -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
              <i class="fas fa-book" style="margin-right: 8px;"></i>Course/Program
            </label>
            <select 
              id="cert-course"
              required
              style="width: 100%; padding: 14px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px; cursor: pointer;"
            >
              <option value="">Select a course...</option>
              <option value="IOT Robotics Program">IOT Robotics Program</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Web Development Bootcamp">Web Development Bootcamp</option>
              <option value="Game Development">Game Development</option>
              <option value="3D Design & Printing">3D Design & Printing</option>
              <option value="Electronics & Circuits">Electronics & Circuits</option>
              <option value="Python Programming">Python Programming</option>
              <option value="Mobile App Development">Mobile App Development</option>
            </select>
          </div>
          
          <!-- Completion Date -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
              <i class="fas fa-calendar" style="margin-right: 8px;"></i>Completion Date
            </label>
            <input 
              type="date" 
              id="cert-completion-date"
              required
              style="width: 100%; padding: 14px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px;"
            />
          </div>
          
          <!-- Grade/Score (Optional) -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
              <i class="fas fa-star" style="margin-right: 8px;"></i>Grade/Score (Optional)
            </label>
            <input 
              type="text" 
              id="cert-grade"
              style="width: 100%; padding: 14px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px;"
              placeholder="e.g., A+, 95%, Distinction"
            />
          </div>
          
          <!-- Notes (Optional) -->
          <div style="margin-bottom: 25px;">
            <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
              <i class="fas fa-comment" style="margin-right: 8px;"></i>Additional Notes (Optional)
            </label>
            <textarea 
              id="cert-notes"
              rows="3"
              style="width: 100%; padding: 14px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px; resize: vertical;"
              placeholder="Any special notes or achievements..."
            ></textarea>
          </div>
          
          <!-- Preview & Generate -->
          <div style="display: flex; gap: 15px;">
            <button 
              type="button"
              onclick="AdminCertificateTool.previewCertificate()"
              style="flex: 1; padding: 16px; background: transparent; border: 2px solid #ffd700; border-radius: 10px; color: #ffd700; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s;"
              onmouseover="this.style.background='rgba(255, 215, 0, 0.1)'"
              onmouseout="this.style.background='transparent'"
            >
              <i class="fas fa-eye" style="margin-right: 8px;"></i>Preview
            </button>
            <button 
              type="submit"
              style="flex: 2; padding: 16px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #000; font-size: 16px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);"
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 215, 0, 0.4)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255, 215, 0, 0.3)'"
            >
              <i class="fas fa-certificate" style="margin-right: 8px;"></i>Generate Certificate
            </button>
          </div>
          
        </form>
        
        <!-- Result Message -->
        <div id="cert-generate-result" style="display: none; margin-top: 25px;"></div>
        
      </div>
    `;
  },
  
  // ============================================
  // MANAGE TAB
  // ============================================
  renderManageTab() {
    return `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <h3 style="font-size: 22px; font-weight: 700; color: #ffd700; margin: 0;">
            <i class="fas fa-list" style="margin-right: 10px;"></i>
            Manage Certificates
          </h3>
          
          <!-- Search & Filter -->
          <div style="display: flex; gap: 12px;">
            <input 
              type="text" 
              id="cert-search"
              oninput="AdminCertificateTool.filterCertificates()"
              style="padding: 10px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; color: #fff; width: 250px;"
              placeholder="Search by name, course, ID..."
            />
            <select 
              id="cert-status-filter"
              onchange="AdminCertificateTool.filterCertificates()"
              style="padding: 10px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; color: #fff; cursor: pointer;"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        
        <!-- Certificates Table -->
        <div id="certificates-table" style="background: #0a0a0a; border: 1px solid #333; border-radius: 10px; overflow: hidden;">
          <div style="text-align: center; padding: 60px 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #ffd700; margin-bottom: 20px;"></i>
            <p style="color: #999;">Loading certificates...</p>
          </div>
        </div>
      </div>
    `;
  },
  
  // ============================================
  // BULK GENERATE TAB
  // ============================================
  renderBulkTab() {
    return `
      <div>
        <h3 style="font-size: 22px; font-weight: 700; color: #ffd700; margin: 0 0 20px;">
          <i class="fas fa-file-upload" style="margin-right: 10px;"></i>
          Bulk Certificate Generation
        </h3>
        
        <!-- Upload Area -->
        <div style="border: 2px dashed #ffd700; border-radius: 15px; padding: 40px; text-align: center; margin-bottom: 25px; background: rgba(255, 215, 0, 0.02);">
          <i class="fas fa-cloud-upload-alt" style="font-size: 64px; color: #ffd700; margin-bottom: 20px;"></i>
          <h4 style="font-size: 20px; font-weight: 600; color: #fff; margin: 0 0 10px;">Upload CSV File</h4>
          <p style="color: #999; margin: 0 0 20px;">Drop your CSV file here or click to browse</p>
          
          <input 
            type="file" 
            id="bulk-csv-file"
            accept=".csv"
            onchange="AdminCertificateTool.handleCSVUpload(event)"
            style="display: none;"
          />
          <button 
            onclick="document.getElementById('bulk-csv-file').click()"
            style="padding: 12px 30px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #000; font-size: 16px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s;"
          >
            <i class="fas fa-folder-open" style="margin-right: 8px;"></i>Choose File
          </button>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
            <a href="/api/admin/certificates/template.csv" download style="color: #ffd700; text-decoration: none; font-size: 14px;">
              <i class="fas fa-download" style="margin-right: 8px;"></i>Download CSV Template
            </a>
          </div>
        </div>
        
        <!-- CSV Preview -->
        <div id="csv-preview" style="display: none; margin-bottom: 25px;">
          <h4 style="font-size: 18px; font-weight: 600; color: #fff; margin: 0 0 15px;">Preview Data</h4>
          <div id="csv-preview-content" style="background: #0a0a0a; border: 1px solid #333; border-radius: 10px; padding: 20px; overflow-x: auto;">
            <!-- CSV preview will appear here -->
          </div>
        </div>
        
        <!-- Generate Bulk -->
        <button 
          id="bulk-generate-btn"
          onclick="AdminCertificateTool.handleBulkGenerate()"
          disabled
          style="width: 100%; padding: 16px; background: #333; color: #666; font-size: 16px; font-weight: 700; border: none; border-radius: 10px; cursor: not-allowed;"
        >
          <i class="fas fa-certificate" style="margin-right: 8px;"></i>Generate All Certificates
        </button>
        
        <!-- Progress -->
        <div id="bulk-progress" style="display: none; margin-top: 25px;">
          <div style="background: #0a0a0a; border: 1px solid #ffd700; border-radius: 10px; padding: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #ffd700; font-weight: 600;">Generating certificates...</span>
              <span id="bulk-progress-text" style="color: #fff; font-weight: 700;">0 / 0</span>
            </div>
            <div style="width: 100%; height: 8px; background: #1a1a1a; border-radius: 4px; overflow: hidden;">
              <div id="bulk-progress-bar" style="height: 100%; background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%); width: 0%; transition: width 0.3s;"></div>
            </div>
          </div>
        </div>
        
      </div>
    `;
  },
  
  // ============================================
  // VERIFY TAB
  // ============================================
  renderVerifyTab() {
    return `
      <div>
        <h3 style="font-size: 22px; font-weight: 700; color: #ffd700; margin: 0 0 20px;">
          <i class="fas fa-check-circle" style="margin-right: 10px;"></i>
          Verify Certificate
        </h3>
        
        <!-- Verification Form -->
        <form onsubmit="AdminCertificateTool.handleVerifyCertificate(event)" style="max-width: 600px;">
          <div style="margin-bottom: 25px;">
            <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
              <i class="fas fa-key" style="margin-right: 8px;"></i>Certificate ID / Code
            </label>
            <input 
              type="text" 
              id="verify-code"
              required
              style="width: 100%; padding: 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 18px; font-family: monospace; text-transform: uppercase; letter-spacing: 2px;"
              placeholder="PB-IOT-2025-XXXX"
            />
          </div>
          
          <button 
            type="submit"
            style="width: 100%; padding: 16px; background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: #000; font-size: 16px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);"
            onmouseover="this.style.transform='translateY(-2px)'"
            onmouseout="this.style.transform='translateY(0)'"
          >
            <i class="fas fa-search" style="margin-right: 8px;"></i>Verify Certificate
          </button>
        </form>
        
        <!-- Verification Result -->
        <div id="verify-result" style="display: none; margin-top: 30px;"></div>
        
      </div>
    `;
  },
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  async handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const errorDiv = document.getElementById('admin-login-error');
    const errorText = document.getElementById('admin-error-text');
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentAdmin = data.admin;
        localStorage.setItem('admin_session', data.session_token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        
        // Redirect to dashboard
        document.getElementById('app').innerHTML = this.renderAdminDashboard();
        this.loadDashboardStats();
      } else {
        errorText.textContent = data.error || 'Invalid credentials';
        errorDiv.style.display = 'block';
      }
    } catch (error) {
      console.error('Login error:', error);
      errorText.textContent = 'An error occurred. Please try again.';
      errorDiv.style.display = 'block';
    }
  },
  
  handleLogout() {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    this.currentAdmin = null;
    navigateTo('login');
  },
  
  switchTab(tabName) {
    // Update tab styles
    ['generate', 'manage', 'bulk', 'verify'].forEach(tab => {
      const btn = document.getElementById(`tab-${tab}`);
      if (tab === tabName) {
        btn.style.color = '#ffd700';
        btn.style.borderBottomColor = '#ffd700';
      } else {
        btn.style.color = '#666';
        btn.style.borderBottomColor = 'transparent';
      }
    });
    
    // Update content
    const content = document.getElementById('admin-tab-content');
    switch(tabName) {
      case 'generate':
        content.innerHTML = this.renderGenerateTab();
        break;
      case 'manage':
        content.innerHTML = this.renderManageTab();
        this.loadCertificates();
        break;
      case 'bulk':
        content.innerHTML = this.renderBulkTab();
        break;
      case 'verify':
        content.innerHTML = this.renderVerifyTab();
        break;
    }
  },
  
  async handleGenerateCertificate(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('cert-student-id').value;
    const studentName = document.getElementById('cert-student-search').value;
    const courseName = document.getElementById('cert-course').value;
    const completionDate = document.getElementById('cert-completion-date').value;
    const grade = document.getElementById('cert-grade').value;
    const notes = document.getElementById('cert-notes').value;
    
    const resultDiv = document.getElementById('cert-generate-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="padding: 20px; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px; text-align: center;">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #ffd700; margin-bottom: 15px;"></i>
        <p style="color: #ffd700; font-size: 16px; font-weight: 600; margin: 0;">Generating certificate...</p>
      </div>
    `;
    
    try {
      const response = await fetch('/api/admin/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
        },
        body: JSON.stringify({
          student_id: studentId,
          student_name: studentName,
          course_name: courseName,
          completion_date: completionDate,
          grade: grade || null,
          notes: notes || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        resultDiv.innerHTML = `
          <div style="padding: 25px; background: rgba(74, 222, 128, 0.1); border: 1px solid #4ade80; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <i class="fas fa-check-circle" style="font-size: 48px; color: #4ade80; margin-bottom: 15px;"></i>
              <h4 style="font-size: 20px; font-weight: 700; color: #4ade80; margin: 0 0 8px;">Certificate Generated Successfully!</h4>
              <p style="color: #999; font-size: 14px; margin: 0;">Certificate ID: <span style="color: #fff; font-weight: 600; font-family: monospace;">${data.certificate.certificate_code}</span></p>
            </div>
            
            <div style="display: flex; gap: 12px; justify-content: center;">
              <a href="/api/certificates/${data.certificate.certificate_id}/view" target="_blank" style="padding: 12px 24px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #000; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 8px;">
                <i class="fas fa-eye"></i>View Certificate
              </a>
              <button onclick="navigator.clipboard.writeText('${data.certificate.verification_url}')" style="padding: 12px 24px; background: transparent; border: 1px solid #4ade80; color: #4ade80; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer;">
                <i class="fas fa-copy"></i>Copy Verification Link
              </button>
            </div>
          </div>
        `;
        
        // Reset form
        event.target.reset();
        document.getElementById('cert-student-id').value = '';
        
        // Reload stats
        this.loadDashboardStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Generate error:', error);
      resultDiv.innerHTML = `
        <div style="padding: 20px; background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 10px; text-align: center;">
          <i class="fas fa-exclamation-circle" style="font-size: 32px; color: #dc3545; margin-bottom: 15px;"></i>
          <p style="color: #dc3545; font-size: 16px; font-weight: 600; margin: 0;">${error.message}</p>
        </div>
      `;
    }
  },
  
  async searchStudents(query) {
    if (!query || query.length < 2) {
      document.getElementById('student-search-results').style.display = 'none';
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/students/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.students.length > 0) {
        const resultsDiv = document.getElementById('student-search-results');
        resultsDiv.innerHTML = data.students.map(student => `
          <div 
            onclick="AdminCertificateTool.selectStudent(${student.user_id}, '${student.name}')"
            style="padding: 12px 16px; border-bottom: 1px solid #333; cursor: pointer; transition: background 0.2s;"
            onmouseover="this.style.background='#1a1a1a'"
            onmouseout="this.style.background='transparent'"
          >
            <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">${student.name}</div>
            <div style="font-size: 12px; color: #999;">ID: ${student.user_id} | ${student.email}</div>
          </div>
        `).join('');
        resultsDiv.style.display = 'block';
      } else {
        document.getElementById('student-search-results').style.display = 'none';
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  },
  
  selectStudent(id, name) {
    document.getElementById('cert-student-id').value = id;
    document.getElementById('cert-student-search').value = name;
    document.getElementById('student-search-results').style.display = 'none';
  },
  
  async loadDashboardStats() {
    try {
      const response = await fetch('/api/admin/certificates/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('admin-total-certificates').textContent = data.stats.total || 0;
        document.getElementById('admin-today-certificates').textContent = data.stats.today || 0;
        document.getElementById('admin-active-students').textContent = data.stats.students || 0;
        document.getElementById('admin-pending-certificates').textContent = data.stats.pending || 0;
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  },
  
  async loadCertificates() {
    const tableDiv = document.getElementById('certificates-table');
    
    try {
      const response = await fetch('/api/admin/certificates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.certificates.length === 0) {
          tableDiv.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
              <i class="fas fa-certificate" style="font-size: 48px; color: #333; margin-bottom: 20px;"></i>
              <p style="color: #999;">No certificates found</p>
            </div>
          `;
        } else {
          tableDiv.innerHTML = `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #000; border-bottom: 2px solid #ffd700;">
                  <th style="padding: 16px; text-align: left; color: #ffd700; font-weight: 600;">Certificate ID</th>
                  <th style="padding: 16px; text-align: left; color: #ffd700; font-weight: 600;">Student</th>
                  <th style="padding: 16px; text-align: left; color: #ffd700; font-weight: 600;">Course</th>
                  <th style="padding: 16px; text-align: left; color: #ffd700; font-weight: 600;">Issued</th>
                  <th style="padding: 16px; text-align: left; color: #ffd700; font-weight: 600;">Status</th>
                  <th style="padding: 16px; text-align: center; color: #ffd700; font-weight: 600;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${data.certificates.map(cert => `
                  <tr style="border-bottom: 1px solid #222;">
                    <td style="padding: 16px; color: #ffd700; font-family: monospace;">${cert.certificate_code}</td>
                    <td style="padding: 16px; color: #fff;">${cert.student_name}</td>
                    <td style="padding: 16px; color: #999;">${cert.course_name}</td>
                    <td style="padding: 16px; color: #999;">${new Date(cert.issue_date).toLocaleDateString()}</td>
                    <td style="padding: 16px;">
                      <span style="padding: 6px 12px; background: ${cert.status === 'active' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(220, 53, 69, 0.1)'}; color: ${cert.status === 'active' ? '#4ade80' : '#dc3545'}; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                        ${cert.status}
                      </span>
                    </td>
                    <td style="padding: 16px; text-align: center;">
                      <a href="/api/certificates/${cert.certificate_id}/view" target="_blank" style="color: #ffd700; margin: 0 8px; text-decoration: none;" title="View">
                        <i class="fas fa-eye"></i>
                      </a>
                      <button onclick="AdminCertificateTool.downloadCertificate('${cert.certificate_id}')" style="background: none; border: none; color: #60a5fa; cursor: pointer; margin: 0 8px;" title="Download">
                        <i class="fas fa-download"></i>
                      </button>
                      <button onclick="AdminCertificateTool.revokeCertificate('${cert.certificate_id}')" style="background: none; border: none; color: #dc3545; cursor: pointer; margin: 0 8px;" title="Revoke">
                        <i class="fas fa-ban"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      }
    } catch (error) {
      console.error('Load certificates error:', error);
      tableDiv.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #dc3545; margin-bottom: 20px;"></i>
          <p style="color: #dc3545;">Error loading certificates</p>
        </div>
      `;
    }
  },
  
  async handleVerifyCertificate(event) {
    event.preventDefault();
    
    const code = document.getElementById('verify-code').value.toUpperCase();
    const resultDiv = document.getElementById('verify-result');
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="padding: 20px; background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px; text-align: center;">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #ffd700;"></i>
      </div>
    `;
    
    try {
      const response = await fetch(`/api/certificates/verify/${code}`);
      const data = await response.json();
      
      if (data.success && data.certificate) {
        const cert = data.certificate;
        resultDiv.innerHTML = `
          <div style="padding: 30px; background: rgba(74, 222, 128, 0.1); border: 2px solid #4ade80; border-radius: 15px;">
            <div style="text-align: center; margin-bottom: 25px;">
              <i class="fas fa-check-circle" style="font-size: 64px; color: #4ade80; margin-bottom: 20px;"></i>
              <h4 style="font-size: 24px; font-weight: 700; color: #4ade80; margin: 0 0 10px;">✓ Certificate Verified</h4>
              <p style="color: #999; font-size: 14px; margin: 0;">This certificate is authentic and valid</p>
            </div>
            
            <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 10px; padding: 25px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <p style="color: #999; font-size: 12px; margin: 0 0 5px;">Student Name</p>
                  <p style="color: #fff; font-size: 16px; font-weight: 600; margin: 0;">${cert.student_name}</p>
                </div>
                <div>
                  <p style="color: #999; font-size: 12px; margin: 0 0 5px;">Course</p>
                  <p style="color: #fff; font-size: 16px; font-weight: 600; margin: 0;">${cert.course_name}</p>
                </div>
                <div>
                  <p style="color: #999; font-size: 12px; margin: 0 0 5px;">Issue Date</p>
                  <p style="color: #fff; font-size: 16px; font-weight: 600; margin: 0;">${new Date(cert.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style="color: #999; font-size: 12px; margin: 0 0 5px;">Certificate ID</p>
                  <p style="color: #ffd700; font-size: 16px; font-weight: 600; font-family: monospace; margin: 0;">${cert.certificate_code}</p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="/api/certificates/${cert.certificate_id}/view" target="_blank" style="padding: 12px 30px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #000; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-flex; align-items: center; gap: 8px;">
                <i class="fas fa-eye"></i>View Certificate
              </a>
            </div>
          </div>
        `;
      } else {
        resultDiv.innerHTML = `
          <div style="padding: 30px; background: rgba(220, 53, 69, 0.1); border: 2px solid #dc3545; border-radius: 15px; text-align: center;">
            <i class="fas fa-times-circle" style="font-size: 64px; color: #dc3545; margin-bottom: 20px;"></i>
            <h4 style="font-size: 24px; font-weight: 700; color: #dc3545; margin: 0 0 10px;">✗ Invalid Certificate</h4>
            <p style="color: #999; font-size: 14px; margin: 0;">This certificate code could not be verified</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Verify error:', error);
      resultDiv.innerHTML = `
        <div style="padding: 30px; background: rgba(220, 53, 69, 0.1); border: 2px solid #dc3545; border-radius: 15px; text-align: center;">
          <i class="fas fa-exclamation-circle" style="font-size: 64px; color: #dc3545; margin-bottom: 20px;"></i>
          <p style="color: #dc3545; font-size: 16px; font-weight: 600; margin: 0;">Verification failed</p>
        </div>
      `;
    }
  },
  
  // Preview Certificate
  previewCertificate() {
    const studentName = document.getElementById('cert-student-search').value;
    const courseName = document.getElementById('cert-course').value;
    const completionDate = document.getElementById('cert-completion-date').value;
    const grade = document.getElementById('cert-grade').value;
    
    if (!studentName || !courseName || !completionDate) {
      alert('Please fill in required fields: Student Name, Course, and Completion Date');
      return;
    }
    
    // Generate preview code
    const previewCode = `PB-${courseName.substring(0,3).toUpperCase()}-${new Date().getFullYear()}-PREVIEW`;
    
    // Open preview in new tab
    const previewHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate Preview</title>
        <style>
          body { background: #000; color: #fff; font-family: Arial; padding: 40px; text-align: center; }
          .preview { background: #1a1a1a; border: 2px solid #ffd700; border-radius: 15px; padding: 60px; max-width: 800px; margin: 0 auto; }
          h1 { color: #ffd700; font-size: 48px; margin-bottom: 20px; }
          .student { font-size: 36px; color: #fff; margin: 30px 0; }
          .course { font-size: 24px; color: #999; margin: 20px 0; }
          .code { font-family: monospace; color: #ffd700; font-size: 18px; margin-top: 40px; }
          .watermark { color: #666; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="preview">
          <h1>🏆 Certificate of Completion</h1>
          <p style="font-size: 20px; color: #999;">This certifies that</p>
          <div class="student">${studentName}</div>
          <p style="font-size: 18px; color: #999;">has successfully completed</p>
          <div class="course">${courseName}</div>
          ${grade ? `<p style="font-size: 20px; color: #4ade80; margin: 20px 0;">Grade: ${grade}</p>` : ''}
          <p style="font-size: 16px; color: #999; margin-top: 30px;">Date: ${new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div class="code">Certificate ID: ${previewCode}</div>
          <div class="watermark">⚠️ PREVIEW ONLY - NOT A VALID CERTIFICATE</div>
        </div>
      </body>
      </html>
    `;
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
  },
  
  // Download Certificate
  async downloadCertificate(certificateId) {
    try {
      window.open(`/api/certificates/${certificateId}/view`, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download certificate');
    }
  },
  
  // Revoke Certificate
  async revokeCertificate(certificateId) {
    const reason = prompt('Enter reason for revocation:');
    if (!reason) return;
    
    if (!confirm('Are you sure you want to revoke this certificate?')) return;
    
    try {
      const response = await fetch(`/api/admin/certificates/${certificateId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Certificate revoked successfully');
        this.loadCertificates();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Revoke error:', error);
      alert('Failed to revoke certificate: ' + error.message);
    }
  },
  
  // Filter Certificates
  filterCertificates() {
    // This would filter the table in real-time
    // For now, just reload with search params
    this.loadCertificates();
  },
  
  // Handle CSV Upload
  handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const students = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        const student = {};
        headers.forEach((header, index) => {
          student[header.trim()] = values[index]?.trim();
        });
        students.push(student);
      }
      
      // Show preview
      const previewDiv = document.getElementById('csv-preview');
      const previewContent = document.getElementById('csv-preview-content');
      
      previewContent.innerHTML = `
        <p style="color: #ffd700; font-weight: 600; margin-bottom: 15px;">
          ${students.length} students found in CSV
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #000; border-bottom: 1px solid #ffd700;">
              ${headers.map(h => `<th style="padding: 10px; text-align: left; color: #ffd700;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${students.slice(0, 5).map(s => `
              <tr style="border-bottom: 1px solid #333;">
                ${headers.map(h => `<td style="padding: 10px; color: #fff;">${s[h] || '-'}</td>`).join('')}
              </tr>
            `).join('')}
            ${students.length > 5 ? `<tr><td colspan="${headers.length}" style="padding: 10px; color: #999; text-align: center;">... and ${students.length - 5} more</td></tr>` : ''}
          </tbody>
        </table>
      `;
      
      previewDiv.style.display = 'block';
      
      // Enable generate button
      const generateBtn = document.getElementById('bulk-generate-btn');
      generateBtn.disabled = false;
      generateBtn.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
      generateBtn.style.color = '#000';
      generateBtn.style.cursor = 'pointer';
      
      // Store students data
      this.certificateQueue = students;
    };
    
    reader.readAsText(file);
  },
  
  // Handle Bulk Generate
  async handleBulkGenerate() {
    if (!this.certificateQueue || this.certificateQueue.length === 0) {
      alert('No students loaded. Please upload a CSV file first.');
      return;
    }
    
    const courseName = prompt('Enter course name for all certificates:');
    if (!courseName) return;
    
    const completionDate = prompt('Enter completion date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!completionDate) return;
    
    // Show progress
    const progressDiv = document.getElementById('bulk-progress');
    const progressBar = document.getElementById('bulk-progress-bar');
    const progressText = document.getElementById('bulk-progress-text');
    
    progressDiv.style.display = 'block';
    
    try {
      const response = await fetch('/api/admin/certificates/bulk-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
        },
        body: JSON.stringify({
          batch_name: `Batch ${new Date().toISOString()}`,
          course_name: courseName,
          students: this.certificateQueue,
          completion_date: completionDate
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        progressText.textContent = `${data.batch.generated} / ${data.batch.total}`;
        progressBar.style.width = '100%';
        
        setTimeout(() => {
          alert(`Successfully generated ${data.batch.generated} certificates!\nFailed: ${data.batch.failed}`);
          progressDiv.style.display = 'none';
          document.getElementById('csv-preview').style.display = 'none';
          document.getElementById('bulk-csv-file').value = '';
          this.certificateQueue = [];
          this.loadDashboardStats();
        }, 1000);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Bulk generate error:', error);
      alert('Failed to generate certificates: ' + error.message);
      progressDiv.style.display = 'none';
    }
  },
  
  // Initialize admin portal
  init() {
    // Check for existing session
    const session = localStorage.getItem('admin_session');
    const adminUser = localStorage.getItem('admin_user');
    
    if (session && adminUser) {
      this.currentAdmin = JSON.parse(adminUser);
      document.getElementById('app').innerHTML = this.renderAdminDashboard();
      this.loadDashboardStats();
    } else {
      document.getElementById('app').innerHTML = this.renderAdminLogin();
    }
  }
};

// Auto-set today's date
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const dateInput = document.getElementById('cert-completion-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }, 100);
});
