// ============================================
// PASSIONBOTS LMS - CERTIFICATE MANAGEMENT
// Generate, view, and verify certificates
// ============================================

const CertificateManager = {
  
  certificates: [],
  
  // Render certificates page
  renderCertificatesPage() {
    return `
      <div class="dashboard-container" style="padding: 2rem;">
        ${this.renderHeader()}
        
        <!-- Certificate Stats -->
        ${this.renderStats()}
        
        <!-- Certificates Grid -->
        <div id="certificatesGrid" style="margin-top: 3rem;">
          <div style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
            <i class="fas fa-certificate fa-3x" style="opacity: 0.3; margin-bottom: 1rem;"></i>
            <p>Loading certificates...</p>
          </div>
        </div>
        
        <!-- Generate Certificate Modal -->
        <div id="generateModal" style="display: none;"></div>
      </div>
    `;
  },
  
  // Render header
  renderHeader() {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 class="gradient-text" style="font-size: 3rem; font-weight: 900; margin-bottom: 0.5rem;">
            <i class="fas fa-certificate"></i> My Certificates
          </h1>
          <p style="color: var(--text-secondary); font-size: 1.1rem;">
            View and download your achievement certificates
          </p>
        </div>
        
        <button onclick="CertificateManager.showGenerateModal()" style="
          background: var(--gradient-yellow);
          border: none;
          padding: 1rem 2rem;
          border-radius: var(--radius-md);
          color: #000;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: var(--shadow-md);
        ">
          <i class="fas fa-plus-circle"></i>
          Generate Certificate
        </button>
      </div>
    `;
  },
  
  // Render stats
  renderStats() {
    return `
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;
      ">
        <div class="card" style="padding: 2rem; background: var(--bg-card); border-radius: var(--radius-lg);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Total Certificates</p>
              <p id="totalCerts" style="color: var(--text-primary); font-size: 2.5rem; font-weight: 700;">0</p>
            </div>
            <div style="
              width: 60px;
              height: 60px;
              background: var(--gradient-yellow);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <i class="fas fa-award" style="font-size: 1.5rem; color: #000;"></i>
            </div>
          </div>
        </div>
        
        <div class="card" style="padding: 2rem; background: var(--bg-card); border-radius: var(--radius-lg);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Courses Completed</p>
              <p id="completedCourses" style="color: var(--text-primary); font-size: 2.5rem; font-weight: 700;">0</p>
            </div>
            <div style="
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <i class="fas fa-check-circle" style="font-size: 1.5rem; color: #000;"></i>
            </div>
          </div>
        </div>
        
        <div class="card" style="padding: 2rem; background: var(--bg-card); border-radius: var(--radius-lg);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Latest Certificate</p>
              <p id="latestDate" style="color: var(--text-primary); font-size: 1.2rem; font-weight: 600;">-</p>
            </div>
            <div style="
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <i class="fas fa-calendar-check" style="font-size: 1.5rem; color: #000;"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // Load certificates for current user
  async loadCertificates() {
    try {
      const studentId = AppState.currentUser?.id || 1;
      const response = await fetch(`/api/certificates/student/${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        this.certificates = data.certificates;
        this.updateStats();
        this.renderCertificatesGrid();
      }
    } catch (error) {
      console.error('Failed to load certificates:', error);
    }
  },
  
  // Update stats
  updateStats() {
    document.getElementById('totalCerts').textContent = this.certificates.length;
    document.getElementById('completedCourses').textContent = this.certificates.length;
    
    if (this.certificates.length > 0) {
      const latest = new Date(this.certificates[0].issue_date);
      document.getElementById('latestDate').textContent = latest.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  },
  
  // Render certificates grid
  renderCertificatesGrid() {
    const grid = document.getElementById('certificatesGrid');
    
    if (this.certificates.length === 0) {
      grid.innerHTML = `
        <div style="
          text-align: center;
          padding: 6rem 2rem;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 2px dashed var(--border-color);
        ">
          <i class="fas fa-certificate" style="font-size: 5rem; color: var(--text-secondary); opacity: 0.3; margin-bottom: 1.5rem;"></i>
          <h3 style="color: var(--text-primary); font-size: 1.5rem; margin-bottom: 1rem;">No Certificates Yet</h3>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Complete courses to earn certificates</p>
          <button onclick="navigateTo('curriculum')" style="
            background: var(--gradient-yellow);
            border: none;
            padding: 1rem 2rem;
            border-radius: var(--radius-md);
            color: #000;
            font-weight: 600;
            cursor: pointer;
          ">
            Browse Courses
          </button>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = `
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 2rem;
      ">
        ${this.certificates.map(cert => this.renderCertificateCard(cert)).join('')}
      </div>
    `;
  },
  
  // Render single certificate card
  renderCertificateCard(cert) {
    return `
      <div class="card" style="
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 2px solid var(--border-color);
        transition: all 0.3s;
      " onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='var(--shadow-yellow)'" 
         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
        
        <!-- Certificate Preview -->
        <div style="
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 20%;
            height: 100%;
            background: #fbbf24;
          "></div>
          
          <div style="
            position: relative;
            z-index: 1;
            text-align: center;
            padding: 2rem;
          ">
            <i class="fas fa-certificate" style="font-size: 4rem; color: #fbbf24; margin-bottom: 1rem;"></i>
            <p style="color: white; font-size: 1.2rem; font-weight: 700;">${cert.course_name}</p>
          </div>
        </div>
        
        <!-- Certificate Info -->
        <div style="padding: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">Student Name</p>
            <p style="color: var(--text-primary); font-size: 1.1rem; font-weight: 600;">${cert.student_name}</p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Issue Date</p>
              <p style="color: var(--text-primary); font-size: 0.9rem; font-weight: 500;">
                ${new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            
            <div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">Certificate ID</p>
              <p style="color: var(--accent-yellow); font-size: 0.85rem; font-weight: 600; font-family: monospace;">
                ${cert.certificate_code}
              </p>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.75rem;">
            <button onclick="CertificateManager.viewCertificate(${cert.certificate_id})" style="
              flex: 1;
              background: var(--gradient-yellow);
              border: none;
              padding: 0.75rem;
              border-radius: var(--radius-sm);
              color: #000;
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
            ">
              <i class="fas fa-eye"></i>
              View
            </button>
            
            <button onclick="CertificateManager.downloadCertificate(${cert.certificate_id})" style="
              flex: 1;
              background: var(--bg-hover);
              border: 1px solid var(--border-color);
              padding: 0.75rem;
              border-radius: var(--radius-sm);
              color: var(--text-primary);
              font-weight: 600;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
            ">
              <i class="fas fa-download"></i>
              Download
            </button>
            
            <button onclick="CertificateManager.shareCertificate('${cert.verification_url}')" style="
              background: var(--bg-hover);
              border: 1px solid var(--border-color);
              padding: 0.75rem;
              border-radius: var(--radius-sm);
              color: var(--text-primary);
              cursor: pointer;
            " title="Share Certificate">
              <i class="fas fa-share-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },
  
  // View certificate in new window
  viewCertificate(certificateId) {
    window.open(`/api/certificates/${certificateId}/view`, '_blank', 'width=1920,height=1080');
  },
  
  // Download certificate
  downloadCertificate(certificateId) {
    const link = document.createElement('a');
    link.href = `/api/certificates/${certificateId}/view`;
    link.download = `certificate_${certificateId}.html`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  // Share certificate
  shareCertificate(verificationUrl) {
    if (navigator.share) {
      navigator.share({
        title: 'My Certificate',
        text: 'Check out my certificate from PassionBots!',
        url: verificationUrl
      }).catch(err => console.log('Share failed:', err));
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(verificationUrl).then(() => {
        alert('Certificate link copied to clipboard!');
      });
    }
  },
  
  // Show generate certificate modal
  showGenerateModal() {
    const modal = document.getElementById('generateModal');
    modal.style.display = 'block';
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 2rem;
      " onclick="if(event.target === this) CertificateManager.closeModal()">
        
        <div style="
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          max-width: 600px;
          width: 100%;
          box-shadow: var(--shadow-lg);
        " onclick="event.stopPropagation()">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2 style="color: var(--text-primary); font-size: 1.8rem; font-weight: 700; margin: 0;">
              <i class="fas fa-certificate" style="color: var(--accent-yellow);"></i>
              Generate Certificate
            </h2>
            <button onclick="CertificateManager.closeModal()" style="
              background: none;
              border: none;
              color: var(--text-secondary);
              font-size: 1.5rem;
              cursor: pointer;
              padding: 0.5rem;
            ">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <form onsubmit="CertificateManager.generateCertificate(event); return false;">
            <div style="margin-bottom: 1.5rem;">
              <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">
                Course Name
              </label>
              <input type="text" id="courseName" required style="
                width: 100%;
                padding: 1rem;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                color: var(--text-primary);
                font-size: 1rem;
              " value="IoT & Robotics Webinar" />
            </div>
            
            <div style="margin-bottom: 1.5rem;">
              <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">
                Completion Date
              </label>
              <input type="date" id="completionDate" required style="
                width: 100%;
                padding: 1rem;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
                color: var(--text-primary);
                font-size: 1rem;
              " />
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
              <button type="button" onclick="CertificateManager.closeModal()" style="
                flex: 1;
                background: var(--bg-hover);
                border: 1px solid var(--border-color);
                padding: 1rem;
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
              ">
                Cancel
              </button>
              
              <button type="submit" style="
                flex: 1;
                background: var(--gradient-yellow);
                border: none;
                padding: 1rem;
                border-radius: var(--radius-md);
                color: #000;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
              ">
                Generate Certificate
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Set default date to today
    document.getElementById('completionDate').valueAsDate = new Date();
  },
  
  // Close modal
  closeModal() {
    document.getElementById('generateModal').style.display = 'none';
  },
  
  // Generate certificate
  async generateCertificate(event) {
    event.preventDefault();
    
    const courseName = document.getElementById('courseName').value;
    const completionDate = document.getElementById('completionDate').value;
    
    try {
      const studentId = AppState.currentUser?.id || 1;
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          course_id: 1,
          course_name: courseName,
          completion_date: completionDate
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.closeModal();
        await this.loadCertificates();
        
        // Show success message
        alert('🎉 Certificate generated successfully!');
        
        // Open certificate in new window
        const cert = this.certificates.find(c => c.certificate_code === data.certificate.certificate_code);
        if (cert) {
          this.viewCertificate(cert.certificate_id);
        }
      } else {
        alert('Failed to generate certificate: ' + data.error);
      }
    } catch (error) {
      console.error('Generate certificate error:', error);
      alert('Failed to generate certificate');
    }
  }
  
};

// Make available globally
window.CertificateManager = CertificateManager;

console.log('✅ Certificate Manager Loaded: Generate, view, and share certificates');
