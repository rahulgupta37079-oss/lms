// Bulk Certificate Generator UI
const BulkCertificateGenerator = {
  students: [],
  
  render() {
    return `
      <div style="padding: 30px;">
        <h2 style="color: #ffd700; margin-bottom: 30px;">
          <i class="fas fa-file-import"></i> Bulk Certificate Generation
        </h2>
        
        <!-- Quick 19 Students -->
        <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px; padding: 25px; margin-bottom: 30px;">
          <h3 style="color: #ffd700; margin-bottom: 15px;">Quick Generate: 19 Pre-loaded Students</h3>
          <p style="color: #ccc; margin-bottom: 20px;">Generate certificates for all 19 students from your PDF</p>
          
          <div style="display: flex; gap: 15px; margin-bottom: 20px;">
            <select id="bulk-course" style="flex: 1; padding: 12px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; color: #fff;">
              <option value="IOT Robotics Program">IOT Robotics Program</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Web Development">Web Development</option>
            </select>
            
            <select id="bulk-type" style="flex: 1; padding: 12px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; color: #fff;">
              <option value="participation">Participation Certificate</option>
              <option value="completion">Completion Certificate</option>
            </select>
            
            <input type="date" id="bulk-date" value="${new Date().toISOString().split('T')[0]}" style="flex: 1; padding: 12px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; color: #fff;" />
          </div>
          
          <button onclick="BulkCertificateGenerator.generateAll()" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #ffd700, #f4c430); color: #000; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
            <i class="fas fa-bolt"></i> Generate 19 Certificates Now
          </button>
        </div>
        
        <!-- Results -->
        <div id="bulk-results" style="display: none;"></div>
        
        <!-- Student List -->
        <div id="student-list" style="margin-top: 30px;"></div>
      </div>
    `;
  },
  
  async generateAll() {
    const students = [
      'Bhavesh Gudlani', 'Abhishek Singh', 'Rahul Kumar', 'Priya Sharma',
      'Amit Patel', 'Neha Gupta', 'Arjun Reddy', 'Sneha Iyer',
      'Vikram Singh', 'Ananya Das', 'Rohan Mehta', 'Pooja Verma',
      'Karthik Krishnan', 'Divya Nair', 'Sanjay Rao', 'Meera Joshi',
      'Aditya Kapoor', 'Ritu Malhotra', 'Suresh Bhat'
    ];
    
    const course = document.getElementById('bulk-course').value;
    const certType = document.getElementById('bulk-type').value;
    const date = document.getElementById('bulk-date').value;
    
    const resultsDiv = document.getElementById('bulk-results');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
      <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700; border-radius: 10px; padding: 20px; text-align: center;">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #ffd700; margin-bottom: 15px;"></i>
        <p style="color: #ffd700; font-size: 16px;">Generating certificates for ${students.length} students...</p>
      </div>
    `;
    
    try {
      const response = await fetch('/api/admin/certificates/bulk-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_session')}`
        },
        body: JSON.stringify({
          students: students,
          course_name: course,
          certificate_type: certType,
          completion_date: date
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showResults(data);
      } else {
        throw new Error(data.error);
      }
      
    } catch (error) {
      resultsDiv.innerHTML = `
        <div style="background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 10px; padding: 20px;">
          <i class="fas fa-exclamation-circle" style="font-size: 32px; color: #dc3545;"></i>
          <p style="color: #dc3545; margin-top: 10px;">${error.message}</p>
        </div>
      `;
    }
  },
  
  showResults(data) {
    const resultsDiv = document.getElementById('bulk-results');
    
    resultsDiv.innerHTML = `
      <div style="background: rgba(74, 222, 128, 0.1); border: 1px solid #4ade80; border-radius: 10px; padding: 25px; margin-bottom: 30px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <i class="fas fa-check-circle" style="font-size: 48px; color: #4ade80;"></i>
          <h3 style="color: #4ade80; margin-top: 15px;">Successfully Generated ${data.generated} Certificates!</h3>
          ${data.failed > 0 ? `<p style="color: #dc3545;">Failed: ${data.failed}</p>` : ''}
        </div>
        
        <div style="max-height: 400px; overflow-y: auto; background: #0a0a0a; border-radius: 8px; padding: 15px;">
          ${data.certificates.map((cert, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #333;">
              <div style="flex: 1;">
                <div style="color: #fff; font-weight: 600;">${i + 1}. ${cert.name}</div>
                <div style="color: #999; font-size: 12px; font-family: monospace;">${cert.certificate_code}</div>
              </div>
              <div style="display: flex; gap: 10px;">
                <a href="/api/certificates/${cert.certificate_id}/view" target="_blank" 
                   style="padding: 8px 16px; background: #ffd700; color: #000; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                  <i class="fas fa-eye"></i> View
                </a>
                <button onclick="BulkCertificateGenerator.downloadDirect(${cert.certificate_id}, '${cert.name}')"
                   style="padding: 8px 16px; background: #4ade80; color: #000; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
                  <i class="fas fa-download"></i> Download
                </button>
                <button onclick="navigator.clipboard.writeText('${cert.verification_url}')"
                   style="padding: 8px 16px; background: transparent; border: 1px solid #ffd700; color: #ffd700; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
                  <i class="fas fa-copy"></i> Copy Link
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  downloadDirect(certId, studentName) {
    // Open in new window and trigger print automatically
    const url = `/api/certificates/${certId}/view`;
    const win = window.open(url, '_blank');
    
    // Auto-trigger print after page loads
    if (win) {
      win.onload = function() {
        setTimeout(() => {
          win.print();
        }, 1000);
      };
    }
  }
};

// Add to global scope
window.BulkCertificateGenerator = BulkCertificateGenerator;
