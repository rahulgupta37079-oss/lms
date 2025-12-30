/**
 * Generate Certificate HTML exactly matching PassionBots PDF format
 * Features: 1920x1080, Participation/Completion types, CEO signature, Download to PDF
 */

function generateCertificateHTML(data) {
  const {
    studentName = 'Student Name',
    courseName = 'IOT & Robotics',
    certificateCode = 'PB-IOT-2025-0001',
    issueDate = 'December 30, 2025',
    certificateType = 'participation',
    description = 'For outstanding performance and successful participation in the IoT and Robotics Webinar. Demonstrating exceptional skill in systems integration, automation logic, and robotics engineering principles.',
    grade = null
  } = data;

  const certTypeUpper = certificateType === 'participation' ? 'PARTICIPATION' : 'COMPLETION';
  const courseShort = courseName.toUpperCase().replace(/PROGRAM|BOOTCAMP|COURSE/gi, '').trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Certificate - ${studentName}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet"/>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet"/>
<style>
  @page {
    size: 1920px 1080px;
    margin: 0;
  }
  
  @media print {
    body {
      width: 1920px;
      height: 1080px;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print {
      display: none !important;
    }
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Roboto', sans-serif;
    background: #000;
    overflow: hidden;
  }
  
  .certificate-container {
    width: 1920px;
    height: 1080px;
    position: relative;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    color: white;
    overflow: hidden;
  }
  
  /* Yellow vertical bar */
  .yellow-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 140px;
    background: linear-gradient(180deg, #ffd700 0%, #f4c430 100%);
    box-shadow: 5px 0 30px rgba(255, 215, 0, 0.4);
    z-index: 10;
  }
  
  .vertical-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
    font-family: 'Oswald', sans-serif;
    font-size: 3.8rem;
    font-weight: 700;
    color: #000;
    letter-spacing: 0.5rem;
    text-transform: uppercase;
    white-space: nowrap;
  }
  
  /* Background decorations */
  .bg-pattern {
    position: absolute;
    right: 0;
    top: 0;
    width: 60%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(255, 215, 0, 0.03) 0%, transparent 70%);
    pointer-events: none;
  }
  
  .diagonal-accent {
    position: absolute;
    right: -100px;
    top: -100px;
    width: 800px;
    height: 800px;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, transparent 50%);
    transform: rotate(45deg);
    pointer-events: none;
  }
  
  /* Certificate ID tag */
  .cert-id {
    position: absolute;
    top: 50px;
    right: 80px;
    font-family: 'Oswald', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: #000;
    background: #ffd700;
    padding: 10px 28px;
    letter-spacing: 0.08rem;
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
    z-index: 20;
  }
  
  /* Main content */
  .content {
    position: relative;
    margin-left: 180px;
    padding: 120px 100px 80px 80px;
    max-width: 1500px;
    z-index: 5;
  }
  
  .logo-section {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 40px;
  }
  
  .logo-icon {
    width: 70px;
    height: 70px;
    background: #ffd700;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }
  
  .logo-icon i {
    font-size: 36px;
    color: #000;
  }
  
  .logo-text {
    font-family: 'Oswald', sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: 0.15rem;
    text-transform: uppercase;
    color: #fff;
  }
  
  .cert-title-group {
    margin-bottom: 40px;
  }
  
  .cert-label {
    font-family: 'Oswald', sans-serif;
    font-size: 8rem;
    font-weight: 700;
    line-height: 0.9;
    text-transform: uppercase;
    color: transparent;
    -webkit-text-stroke: 3px #ffd700;
    text-stroke: 3px #ffd700;
    letter-spacing: 0.1rem;
    margin-bottom: 15px;
  }
  
  .cert-subtitle {
    font-family: 'Oswald', sans-serif;
    font-size: 2.2rem;
    font-weight: 400;
    letter-spacing: 0.25rem;
    text-transform: uppercase;
    color: #ddd;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .cert-subtitle::before,
  .cert-subtitle::after {
    content: '';
    width: 80px;
    height: 3px;
    background: #ffd700;
  }
  
  .certifies-label {
    font-family: 'Roboto', sans-serif;
    font-size: 1.1rem;
    font-weight: 500;
    letter-spacing: 0.3rem;
    text-transform: uppercase;
    color: #999;
    margin-bottom: 25px;
  }
  
  .student-name {
    font-family: 'Oswald', sans-serif;
    font-size: 5rem;
    font-weight: 700;
    color: #ffd700;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    margin-bottom: 35px;
    text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.5);
  }
  
  .description {
    font-family: 'Roboto', sans-serif;
    font-size: 1.4rem;
    line-height: 1.9;
    color: #ccc;
    max-width: 1200px;
    margin-bottom: 60px;
  }
  
  .footer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 80px;
    padding-top: 40px;
    border-top: 2px solid rgba(255, 215, 0, 0.3);
  }
  
  .footer-item {
    text-align: center;
  }
  
  .footer-label {
    font-family: 'Oswald', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.15rem;
    text-transform: uppercase;
    color: #ffd700;
    margin-bottom: 15px;
  }
  
  .footer-value {
    font-family: 'Roboto', sans-serif;
    font-size: 1.35rem;
    font-weight: 500;
    color: #fff;
    margin-bottom: 10px;
  }
  
  .signature-section {
    margin-top: 15px;
  }
  
  .signature-line {
    width: 220px;
    height: 2px;
    background: rgba(255, 215, 0, 0.5);
    margin: 0 auto 12px;
  }
  
  .signature-name {
    font-family: 'Roboto', sans-serif;
    font-size: 1.4rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 5px;
  }
  
  .signature-title {
    font-family: 'Roboto', sans-serif;
    font-size: 1.05rem;
    font-weight: 400;
    color: #999;
  }
  
  /* Download button */
  .download-btn {
    position: fixed;
    top: 30px;
    right: 30px;
    padding: 16px 32px;
    background: linear-gradient(135deg, #ffd700 0%, #f4c430 100%);
    color: #000;
    font-family: 'Oswald', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 6px 25px rgba(255, 215, 0, 0.4);
    transition: all 0.3s ease;
    z-index: 1000;
  }
  
  .download-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(255, 215, 0, 0.6);
  }
  
  .download-btn i {
    margin-right: 10px;
  }
</style>
</head>
<body>
  <!-- Download Button -->
  <button class="download-btn no-print" onclick="window.print()">
    <i class="fas fa-download"></i>
    Download PDF
  </button>

  <div class="certificate-container">
    <!-- Yellow vertical bar -->
    <div class="yellow-bar">
      <div class="vertical-text">PASSIONBOTS // FUTURE TECH</div>
    </div>
    
    <!-- Background patterns -->
    <div class="bg-pattern"></div>
    <div class="diagonal-accent"></div>
    
    <!-- Certificate ID -->
    <div class="cert-id">ID: ${certificateCode}</div>
    
    <!-- Main content -->
    <div class="content">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-icon">
          <i class="fas fa-robot"></i>
        </div>
        <div class="logo-text">PASSIONBOTS</div>
      </div>
      
      <!-- Certificate Title -->
      <div class="cert-title-group">
        <div class="cert-label">CERTIFICATE</div>
        <div class="cert-subtitle">
          OF ${certTypeUpper} // ${courseShort}
        </div>
      </div>
      
      <!-- Certifies section -->
      <div class="certifies-label">THIS CERTIFIES THAT</div>
      
      <!-- Student Name -->
      <div class="student-name">${studentName}</div>
      
      <!-- Description -->
      <div class="description">
        ${description}
      </div>
      
      <!-- Footer with 3 columns -->
      <div class="footer-grid">
        <!-- Date Issued -->
        <div class="footer-item">
          <div class="footer-label">DATE ISSUED</div>
          <div class="footer-value">${issueDate}</div>
        </div>
        
        <!-- Founder Signature -->
        <div class="footer-item">
          <div class="footer-label">FOUNDER SIGNATURE</div>
          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-name">Rahul Gupta</div>
            <div class="signature-title">CEO, PASSIONBOTS</div>
          </div>
        </div>
        
        <!-- Verify At -->
        <div class="footer-item">
          <div class="footer-label">VERIFY AT</div>
          <div class="footer-value">passionbots.co.in</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Auto-adjust for different screen sizes
    function adjustScale() {
      const container = document.querySelector('.certificate-container');
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const scaleX = windowWidth / 1920;
      const scaleY = windowHeight / 1080;
      const scale = Math.min(scaleX, scaleY, 1);
      
      if (scale < 1) {
        container.style.transform = \`scale(\${scale})\`;
        container.style.transformOrigin = 'top left';
        document.body.style.width = \`\${1920 * scale}px\`;
        document.body.style.height = \`\${1080 * scale}px\`;
      }
    }
    
    adjustScale();
    window.addEventListener('resize', adjustScale);
    
    // Print to PDF tip
    console.log('💡 Tip: Use "Save as PDF" option in print dialog to download the certificate');
  </script>
</body>
</html>`;
}

// Export for use in Node.js/Cloudflare Workers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateCertificateHTML };
}
