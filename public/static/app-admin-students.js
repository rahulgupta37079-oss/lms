// ============================================
// ADMIN STUDENT MANAGEMENT
// PassionBots LMS - Admin Only
// ============================================

const AdminStudentManager = {
  students: [],
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  filterStatus: 'all',
  sortBy: 'registration_date',
  sortOrder: 'desc',
  
  // ============================================
  // RENDER STUDENT MANAGEMENT TAB
  // ============================================
  renderStudentManagementTab() {
    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
          <h3 style="font-size: 22px; font-weight: 700; color: #ffd700; margin: 0;">
            <i class="fas fa-users" style="margin-right: 10px;"></i>
            Student Management
          </h3>
          <button 
            onclick="AdminStudentManager.showAddStudentModal()"
            style="padding: 12px 24px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #000; font-size: 15px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);"
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255, 215, 0, 0.4)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255, 215, 0, 0.3)';"
          >
            <i class="fas fa-plus-circle" style="margin-right: 8px;"></i>
            Add New Student
          </button>
        </div>
        
        <!-- Filters & Search -->
        <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 15px;">
            
            <!-- Search -->
            <div>
              <label style="display: block; color: #999; font-size: 13px; margin-bottom: 8px;">
                <i class="fas fa-search" style="margin-right: 6px;"></i>Search Students
              </label>
              <input 
                type="text" 
                id="student-search"
                placeholder="Search by name, email, or mobile..."
                onkeyup="AdminStudentManager.handleSearch(this.value)"
                style="width: 100%; padding: 12px 16px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px;"
              />
            </div>
            
            <!-- Filter by Status -->
            <div>
              <label style="display: block; color: #999; font-size: 13px; margin-bottom: 8px;">
                <i class="fas fa-filter" style="margin-right: 6px;"></i>Filter by Status
              </label>
              <select 
                id="student-filter-status"
                onchange="AdminStudentManager.handleFilterChange(this.value)"
                style="width: 100%; padding: 12px 16px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; cursor: pointer;"
              >
                <option value="all">All Students</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            
            <!-- Sort By -->
            <div>
              <label style="display: block; color: #999; font-size: 13px; margin-bottom: 8px;">
                <i class="fas fa-sort" style="margin-right: 6px;"></i>Sort By
              </label>
              <select 
                id="student-sort"
                onchange="AdminStudentManager.handleSortChange(this.value)"
                style="width: 100%; padding: 12px 16px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; cursor: pointer;"
              >
                <option value="registration_date_desc">Latest First</option>
                <option value="registration_date_asc">Oldest First</option>
                <option value="full_name_asc">Name (A-Z)</option>
                <option value="full_name_desc">Name (Z-A)</option>
              </select>
            </div>
            
          </div>
        </div>
        
        <!-- Students Table -->
        <div id="students-table-container" style="background: #0a0a0a; border: 1px solid #333; border-radius: 12px; overflow: hidden;">
          <div style="text-align: center; padding: 60px 20px;">
            <div class="spinner" style="margin: 0 auto 20px;"></div>
            <p style="color: #999;">Loading students...</p>
          </div>
        </div>
        
      </div>
      
      <!-- Add/Edit Student Modal -->
      <div id="student-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; align-items: center; justify-content: center; padding: 20px; overflow-y: auto;">
        <div style="background: #1a1a1a; border: 2px solid #ffd700; border-radius: 20px; padding: 40px; max-width: 600px; width: 100%; position: relative; margin: auto;">
          
          <!-- Close Button -->
          <button 
            onclick="AdminStudentManager.closeModal()"
            style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 50%; color: #dc3545; font-size: 18px; cursor: pointer; transition: all 0.3s;"
          >
            <i class="fas fa-times"></i>
          </button>
          
          <!-- Modal Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <i class="fas fa-user-plus" style="font-size: 36px; color: #000;"></i>
            </div>
            <h2 id="modal-title" style="font-size: 24px; font-weight: 700; color: #ffd700; margin: 0;">Add New Student</h2>
          </div>
          
          <!-- Student Form -->
          <form id="student-form" onsubmit="AdminStudentManager.handleSubmitStudent(event)">
            <input type="hidden" id="student-id" value="" />
            
            <!-- Full Name -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                <i class="fas fa-user" style="margin-right: 8px;"></i>Full Name *
              </label>
              <input 
                type="text" 
                id="student-full-name"
                required
                placeholder="Enter student's full name"
                style="width: 100%; padding: 12px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px;"
              />
            </div>
            
            <!-- Email -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                <i class="fas fa-envelope" style="margin-right: 8px;"></i>Email Address *
              </label>
              <input 
                type="email" 
                id="student-email"
                required
                placeholder="student@example.com"
                style="width: 100%; padding: 12px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px;"
              />
            </div>
            
            <!-- Mobile -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                <i class="fas fa-phone" style="margin-right: 8px;"></i>Mobile Number *
              </label>
              <input 
                type="tel" 
                id="student-mobile"
                required
                placeholder="9876543210"
                pattern="[0-9]{10}"
                style="width: 100%; padding: 12px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px;"
              />
            </div>
            
            <!-- College Name -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                <i class="fas fa-university" style="margin-right: 8px;"></i>College/Institution
              </label>
              <input 
                type="text" 
                id="student-college"
                placeholder="Enter college or institution name"
                style="width: 100%; padding: 12px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px;"
              />
            </div>
            
            <!-- Year of Study -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                <i class="fas fa-graduation-cap" style="margin-right: 8px;"></i>Year of Study
              </label>
              <select 
                id="student-year"
                style="width: 100%; padding: 12px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px; cursor: pointer;"
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            
            <!-- Payment Status -->
            <div style="margin-bottom: 25px;">
              <label style="display: block; color: #ffd700; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                <i class="fas fa-rupee-sign" style="margin-right: 8px;"></i>Payment Status
              </label>
              <select 
                id="student-payment-status"
                style="width: 100%; padding: 12px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 10px; color: #fff; font-size: 15px; cursor: pointer;"
              >
                <option value="free">Free Access</option>
                <option value="paid">Paid (₹2,999)</option>
                <option value="pending">Payment Pending</option>
              </select>
            </div>
            
            <!-- Error Message -->
            <div id="student-form-error" style="display: none; padding: 12px; background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 8px; color: #dc3545; font-size: 14px; margin-bottom: 20px;">
              <i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>
              <span id="student-error-text"></span>
            </div>
            
            <!-- Submit Buttons -->
            <div style="display: flex; gap: 12px;">
              <button 
                type="button"
                onclick="AdminStudentManager.closeModal()"
                style="flex: 1; padding: 14px; background: transparent; border: 1px solid #666; color: #999; font-size: 16px; font-weight: 600; border-radius: 10px; cursor: pointer; transition: all 0.3s;"
              >
                Cancel
              </button>
              <button 
                type="submit"
                style="flex: 2; padding: 14px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #000; font-size: 16px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);"
              >
                <i class="fas fa-save" style="margin-right: 8px;"></i>
                <span id="submit-btn-text">Add Student</span>
              </button>
            </div>
          </form>
          
        </div>
      </div>
    `;
  },
  
  // ============================================
  // LOAD ALL STUDENTS
  // ============================================
  async loadStudents() {
    try {
      const response = await axios.get('/api/admin/students');
      
      if (response.data.success) {
        this.students = response.data.students || [];
        this.renderStudentsTable();
      } else {
        this.showError('Failed to load students');
      }
    } catch (error) {
      console.error('Load students error:', error);
      this.showError('Failed to load students: ' + (error.response?.data?.error || error.message));
    }
  },
  
  // ============================================
  // RENDER STUDENTS TABLE
  // ============================================
  renderStudentsTable() {
    const container = document.getElementById('students-table-container');
    if (!container) return;
    
    // Apply filters
    let filteredStudents = [...this.students];
    
    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredStudents = filteredStudents.filter(s => 
        s.full_name?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.mobile?.includes(query)
      );
    }
    
    // Status filter
    if (this.filterStatus !== 'all') {
      filteredStudents = filteredStudents.filter(s => {
        if (this.filterStatus === 'active') return s.status === 'active';
        if (this.filterStatus === 'inactive') return s.status !== 'active';
        if (this.filterStatus === 'free') return s.payment_status === 'free';
        if (this.filterStatus === 'paid') return s.payment_status === 'paid';
        return true;
      });
    }
    
    // Sort
    filteredStudents.sort((a, b) => {
      if (this.sortBy === 'registration_date') {
        const dateA = new Date(a.registration_date || 0);
        const dateB = new Date(b.registration_date || 0);
        return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (this.sortBy === 'full_name') {
        const nameA = (a.full_name || '').toLowerCase();
        const nameB = (b.full_name || '').toLowerCase();
        return this.sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      return 0;
    });
    
    // Pagination
    const totalStudents = filteredStudents.length;
    const totalPages = Math.ceil(totalStudents / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    
    if (paginatedStudents.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <i class="fas fa-users-slash" style="font-size: 64px; color: #333; margin-bottom: 20px;"></i>
          <p style="color: #999; font-size: 18px;">No students found</p>
          <button 
            onclick="AdminStudentManager.showAddStudentModal()"
            style="margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #000; font-size: 15px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer;"
          >
            <i class="fas fa-plus-circle" style="margin-right: 8px;"></i>Add First Student
          </button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <!-- Table Header -->
      <div style="background: #000; padding: 15px 20px; border-bottom: 1px solid #333; display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr; gap: 15px; font-size: 13px; font-weight: 700; color: #ffd700;">
        <div><i class="fas fa-user" style="margin-right: 6px;"></i>Student</div>
        <div><i class="fas fa-envelope" style="margin-right: 6px;"></i>Email</div>
        <div><i class="fas fa-phone" style="margin-right: 6px;"></i>Mobile</div>
        <div><i class="fas fa-calendar" style="margin-right: 6px;"></i>Registered</div>
        <div><i class="fas fa-rupee-sign" style="margin-right: 6px;"></i>Payment</div>
        <div style="text-align: center;"><i class="fas fa-cog" style="margin-right: 6px;"></i>Actions</div>
      </div>
      
      <!-- Table Body -->
      ${paginatedStudents.map(student => `
        <div style="padding: 15px 20px; border-bottom: 1px solid #222; display: grid; grid-template-columns: 2fr 2fr 1.5fr 1fr 1fr 1fr; gap: 15px; align-items: center; font-size: 14px; transition: all 0.3s;" onmouseover="this.style.background='rgba(255, 215, 0, 0.05)'" onmouseout="this.style.background='transparent'">
          
          <!-- Student Info -->
          <div>
            <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">${student.full_name || 'N/A'}</div>
            ${student.college_name ? `<div style="font-size: 12px; color: #999;"><i class="fas fa-university" style="margin-right: 6px;"></i>${student.college_name}</div>` : ''}
          </div>
          
          <!-- Email -->
          <div style="color: #60a5fa; font-size: 13px; word-break: break-all;">${student.email || 'N/A'}</div>
          
          <!-- Mobile -->
          <div style="color: #999; font-size: 13px;">${student.mobile || 'N/A'}</div>
          
          <!-- Registration Date -->
          <div style="color: #999; font-size: 13px;">
            ${student.registration_date ? new Date(student.registration_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
          </div>
          
          <!-- Payment Status -->
          <div>
            ${this.getPaymentBadge(student.payment_status)}
          </div>
          
          <!-- Actions -->
          <div style="display: flex; gap: 8px; justify-content: center;">
            <button 
              onclick="AdminStudentManager.editStudent(${student.registration_id})"
              style="width: 32px; height: 32px; background: rgba(96, 165, 250, 0.1); border: 1px solid #60a5fa; border-radius: 8px; color: #60a5fa; cursor: pointer; transition: all 0.3s;"
              title="Edit Student"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              onclick="AdminStudentManager.deleteStudent(${student.registration_id}, '${student.full_name}')"
              style="width: 32px; height: 32px; background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 8px; color: #dc3545; cursor: pointer; transition: all 0.3s;"
              title="Delete Student"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
          
        </div>
      `).join('')}
      
      <!-- Pagination -->
      ${totalPages > 1 ? `
        <div style="padding: 20px; background: #000; border-top: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
          <div style="color: #999; font-size: 14px;">
            Showing ${startIndex + 1} to ${Math.min(endIndex, totalStudents)} of ${totalStudents} students
          </div>
          <div style="display: flex; gap: 8px;">
            <button 
              onclick="AdminStudentManager.changePage(${this.currentPage - 1})"
              ${this.currentPage === 1 ? 'disabled' : ''}
              style="padding: 8px 16px; background: ${this.currentPage === 1 ? '#222' : 'rgba(255, 215, 0, 0.1)'}; border: 1px solid ${this.currentPage === 1 ? '#333' : '#ffd700'}; border-radius: 8px; color: ${this.currentPage === 1 ? '#666' : '#ffd700'}; cursor: ${this.currentPage === 1 ? 'not-allowed' : 'pointer'}; font-size: 14px; font-weight: 600;"
            >
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
              const pageNum = i + 1;
              return `
                <button 
                  onclick="AdminStudentManager.changePage(${pageNum})"
                  style="width: 40px; height: 40px; background: ${pageNum === this.currentPage ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : 'rgba(255, 215, 0, 0.1)'}; border: 1px solid #ffd700; border-radius: 8px; color: ${pageNum === this.currentPage ? '#000' : '#ffd700'}; cursor: pointer; font-size: 14px; font-weight: 700;"
                >
                  ${pageNum}
                </button>
              `;
            }).join('')}
            <button 
              onclick="AdminStudentManager.changePage(${this.currentPage + 1})"
              ${this.currentPage === totalPages ? 'disabled' : ''}
              style="padding: 8px 16px; background: ${this.currentPage === totalPages ? '#222' : 'rgba(255, 215, 0, 0.1)'}; border: 1px solid ${this.currentPage === totalPages ? '#333' : '#ffd700'}; border-radius: 8px; color: ${this.currentPage === totalPages ? '#666' : '#ffd700'}; cursor: ${this.currentPage === totalPages ? 'not-allowed' : 'pointer'}; font-size: 14px; font-weight: 600;"
            >
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      ` : ''}
    `;
  },
  
  // ============================================
  // HELPER: GET PAYMENT BADGE
  // ============================================
  getPaymentBadge(status) {
    const badges = {
      'paid': '<span style="padding: 4px 12px; background: rgba(74, 222, 128, 0.1); border: 1px solid #4ade80; border-radius: 6px; color: #4ade80; font-size: 12px; font-weight: 600;"><i class="fas fa-check-circle" style="margin-right: 4px;"></i>Paid</span>',
      'free': '<span style="padding: 4px 12px; background: rgba(96, 165, 250, 0.1); border: 1px solid #60a5fa; border-radius: 6px; color: #60a5fa; font-size: 12px; font-weight: 600;"><i class="fas fa-gift" style="margin-right: 4px;"></i>Free</span>',
      'pending': '<span style="padding: 4px 12px; background: rgba(245, 158, 11, 0.1); border: 1px solid #f59e0b; border-radius: 6px; color: #f59e0b; font-size: 12px; font-weight: 600;"><i class="fas fa-clock" style="margin-right: 4px;"></i>Pending</span>'
    };
    return badges[status] || badges['free'];
  },
  
  // ============================================
  // SHOW ADD STUDENT MODAL
  // ============================================
  showAddStudentModal() {
    document.getElementById('modal-title').textContent = 'Add New Student';
    document.getElementById('submit-btn-text').textContent = 'Add Student';
    document.getElementById('student-form').reset();
    document.getElementById('student-id').value = '';
    document.getElementById('student-modal').style.display = 'flex';
  },
  
  // ============================================
  // EDIT STUDENT
  // ============================================
  editStudent(studentId) {
    const student = this.students.find(s => s.registration_id === studentId);
    if (!student) return;
    
    document.getElementById('modal-title').textContent = 'Edit Student';
    document.getElementById('submit-btn-text').textContent = 'Update Student';
    document.getElementById('student-id').value = student.registration_id;
    document.getElementById('student-full-name').value = student.full_name || '';
    document.getElementById('student-email').value = student.email || '';
    document.getElementById('student-mobile').value = student.mobile || '';
    document.getElementById('student-college').value = student.college_name || '';
    document.getElementById('student-year').value = student.year_of_study || '';
    document.getElementById('student-payment-status').value = student.payment_status || 'free';
    document.getElementById('student-modal').style.display = 'flex';
  },
  
  // ============================================
  // CLOSE MODAL
  // ============================================
  closeModal() {
    document.getElementById('student-modal').style.display = 'none';
    document.getElementById('student-form-error').style.display = 'none';
  },
  
  // ============================================
  // SUBMIT STUDENT (ADD OR UPDATE)
  // ============================================
  async handleSubmitStudent(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('student-id').value;
    const isEdit = !!studentId;
    
    const studentData = {
      full_name: document.getElementById('student-full-name').value,
      email: document.getElementById('student-email').value,
      mobile: document.getElementById('student-mobile').value,
      college_name: document.getElementById('student-college').value || null,
      year_of_study: document.getElementById('student-year').value || null,
      payment_status: document.getElementById('student-payment-status').value
    };
    
    try {
      const url = isEdit ? `/api/admin/students/${studentId}` : '/api/admin/add-student';
      const method = isEdit ? 'put' : 'post';
      
      const response = await axios[method](url, studentData);
      
      if (response.data.success) {
        this.closeModal();
        this.showSuccess(isEdit ? 'Student updated successfully!' : 'Student added successfully!');
        this.loadStudents(); // Reload list
      } else {
        this.showFormError(response.data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Submit student error:', error);
      this.showFormError(error.response?.data?.error || 'Operation failed');
    }
  },
  
  // ============================================
  // DELETE STUDENT
  // ============================================
  async deleteStudent(studentId, studentName) {
    if (!confirm(`Are you sure you want to delete ${studentName}?\n\nThis action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await axios.delete(`/api/admin/students/${studentId}`);
      
      if (response.data.success) {
        this.showSuccess('Student deleted successfully!');
        this.loadStudents(); // Reload list
      } else {
        this.showError(response.data.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Delete student error:', error);
      this.showError(error.response?.data?.error || 'Failed to delete student');
    }
  },
  
  // ============================================
  // HANDLE SEARCH
  // ============================================
  handleSearch(query) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.renderStudentsTable();
  },
  
  // ============================================
  // HANDLE FILTER CHANGE
  // ============================================
  handleFilterChange(status) {
    this.filterStatus = status;
    this.currentPage = 1;
    this.renderStudentsTable();
  },
  
  // ============================================
  // HANDLE SORT CHANGE
  // ============================================
  handleSortChange(sortValue) {
    const [field, order] = sortValue.split('_');
    this.sortBy = `${field}_${order === 'asc' || order === 'desc' ? '' : 'date'}`.replace(/_$/, '');
    this.sortOrder = order;
    this.currentPage = 1;
    this.renderStudentsTable();
  },
  
  // ============================================
  // CHANGE PAGE
  // ============================================
  changePage(pageNum) {
    this.currentPage = pageNum;
    this.renderStudentsTable();
  },
  
  // ============================================
  // SHOW ERROR
  // ============================================
  showError(message) {
    alert('❌ Error: ' + message);
  },
  
  // ============================================
  // SHOW FORM ERROR
  // ============================================
  showFormError(message) {
    const errorDiv = document.getElementById('student-form-error');
    const errorText = document.getElementById('student-error-text');
    errorText.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  },
  
  // ============================================
  // SHOW SUCCESS
  // ============================================
  showSuccess(message) {
    alert('✅ ' + message);
  },
  
  // ============================================
  // INITIALIZE
  // ============================================
  init() {
    this.loadStudents();
  }
};
