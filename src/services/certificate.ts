/**
 * Certificate Generation Service
 * Generates PDF-like HTML certificates with QR code verification
 */

import QRCode from 'qrcode'

interface CertificateData {
  studentName: string
  courseName: string
  completionDate: string
  certificateId: string
  registrationId: number
}

interface GenerateCertificateParams {
  studentName: string
  courseName: string
  completionDate?: string
  registrationId: number
  verificationBaseUrl?: string
}

export class CertificateService {
  /**
   * Generate unique certificate ID
   */
  static generateCertificateId(registrationId: number): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `PBCERT-${registrationId}-${random}-${timestamp}`
  }

  /**
   * Generate QR code for certificate verification
   */
  static async generateQRCode(certificateId: string, verificationBaseUrl: string): Promise<string> {
    try {
      const verificationUrl = `${verificationBaseUrl}/verify-certificate?id=${certificateId}`
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrCodeDataUrl
    } catch (error) {
      console.error('QR Code generation error:', error)
      return ''
    }
  }

  /**
   * Generate HTML Certificate
   */
  static async generateCertificateHTML(params: GenerateCertificateParams): Promise<string> {
    const {
      studentName,
      courseName,
      registrationId,
      verificationBaseUrl = 'https://passionbots-lms.pages.dev'
    } = params

    const completionDate = params.completionDate || new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const certificateId = this.generateCertificateId(registrationId)
    const qrCodeDataUrl = await this.generateQRCode(certificateId, verificationBaseUrl)

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${studentName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f5f5f5;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .certificate-container {
      width: 100%;
      max-width: 1000px;
      background: white;
      border: 20px solid transparent;
      border-image: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) 1;
      box-shadow: 0 10px 50px rgba(0, 0, 0, 0.2);
      padding: 60px;
      position: relative;
    }
    
    .certificate-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      width: 120px;
      height: 120px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
      font-weight: bold;
    }
    
    .org-name {
      font-size: 32px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 10px;
    }
    
    .certificate-title {
      font-size: 48px;
      font-weight: bold;
      color: #333;
      margin: 30px 0;
      letter-spacing: 2px;
    }
    
    .certificate-body {
      text-align: center;
      line-height: 2;
      font-size: 18px;
      color: #555;
      margin: 30px 0;
    }
    
    .student-name {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      margin: 20px 0;
      padding: 10px 0;
      border-bottom: 3px solid #667eea;
      display: inline-block;
    }
    
    .course-name {
      font-size: 24px;
      font-weight: bold;
      color: #764ba2;
      margin: 20px 0;
    }
    
    .certificate-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 60px;
      padding-top: 40px;
      border-top: 2px solid #e0e0e0;
    }
    
    .signature-section {
      text-align: center;
      flex: 1;
    }
    
    .signature-line {
      width: 200px;
      height: 2px;
      background: #333;
      margin: 20px auto 10px;
    }
    
    .signature-title {
      font-size: 14px;
      color: #666;
      font-weight: bold;
    }
    
    .signature-name {
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }
    
    .qr-section {
      text-align: center;
    }
    
    .qr-code {
      width: 120px;
      height: 120px;
      border: 2px solid #667eea;
      padding: 5px;
      background: white;
    }
    
    .certificate-id {
      font-size: 12px;
      color: #888;
      margin-top: 10px;
      font-family: 'Courier New', monospace;
    }
    
    .date-section {
      text-align: center;
      margin-top: 30px;
      font-size: 16px;
      color: #666;
    }
    
    .decorative-corner {
      position: absolute;
      width: 100px;
      height: 100px;
      opacity: 0.1;
    }
    
    .top-left {
      top: 20px;
      left: 20px;
      border-top: 10px solid #667eea;
      border-left: 10px solid #667eea;
    }
    
    .top-right {
      top: 20px;
      right: 20px;
      border-top: 10px solid #764ba2;
      border-right: 10px solid #764ba2;
    }
    
    .bottom-left {
      bottom: 20px;
      left: 20px;
      border-bottom: 10px solid #f093fb;
      border-left: 10px solid #f093fb;
    }
    
    .bottom-right {
      bottom: 20px;
      right: 20px;
      border-bottom: 10px solid #667eea;
      border-right: 10px solid #667eea;
    }
    
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(102, 126, 234, 0.03);
      font-weight: bold;
      z-index: 0;
      pointer-events: none;
    }
    
    .content {
      position: relative;
      z-index: 1;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .certificate-container {
        box-shadow: none;
        page-break-inside: avoid;
      }
    }
    
    @media (max-width: 768px) {
      .certificate-container {
        padding: 30px;
        border-width: 10px;
      }
      
      .certificate-title {
        font-size: 32px;
      }
      
      .student-name {
        font-size: 24px;
      }
      
      .course-name {
        font-size: 18px;
      }
      
      .certificate-footer {
        flex-direction: column;
        gap: 30px;
      }
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="decorative-corner top-left"></div>
    <div class="decorative-corner top-right"></div>
    <div class="decorative-corner bottom-left"></div>
    <div class="decorative-corner bottom-right"></div>
    
    <div class="watermark">PASSIONBOTS</div>
    
    <div class="content">
      <div class="certificate-header">
        <div class="logo">PB</div>
        <div class="org-name">PassionBots</div>
        <div style="font-size: 14px; color: #888; margin-top: 5px;">IoT & Robotics Learning Platform</div>
      </div>
      
      <h1 class="certificate-title">CERTIFICATE OF COMPLETION</h1>
      
      <div class="certificate-body">
        <p>This is to certify that</p>
        
        <div class="student-name">${studentName}</div>
        
        <p>has successfully completed the course</p>
        
        <div class="course-name">${courseName}</div>
        
        <p style="margin-top: 20px;">with dedication and excellence, demonstrating proficiency in<br>
        IoT concepts, robotics applications, and hands-on project development.</p>
      </div>
      
      <div class="date-section">
        <strong>Date of Completion:</strong> ${completionDate}
      </div>
      
      <div class="certificate-footer">
        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="signature-title">Director</div>
          <div class="signature-name">PassionBots Academy</div>
        </div>
        
        <div class="qr-section">
          ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code">` : ''}
          <div class="certificate-id">ID: ${certificateId}</div>
          <div style="font-size: 10px; color: #aaa; margin-top: 5px;">Scan to verify</div>
        </div>
        
        <div class="signature-section">
          <div class="signature-line"></div>
          <div class="signature-title">Course Coordinator</div>
          <div class="signature-name">Technical Team</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Add download functionality
    function downloadCertificate() {
      window.print();
    }
    
    // Add LinkedIn share functionality
    function shareOnLinkedIn() {
      const certificateUrl = window.location.href;
      const text = encodeURIComponent('I just completed ${courseName} at PassionBots! 🎓');
      const linkedInUrl = \`https://www.linkedin.com/sharing/share-offsite/?url=\${certificateUrl}&title=\${text}\`;
      window.open(linkedInUrl, '_blank', 'width=600,height=400');
    }
  </script>
</body>
</html>
    `

    return html
  }

  /**
   * Generate certificate data for database storage
   */
  static generateCertificateData(params: GenerateCertificateParams): CertificateData {
    const {
      studentName,
      courseName,
      registrationId
    } = params

    const completionDate = params.completionDate || new Date().toISOString().split('T')[0]
    const certificateId = this.generateCertificateId(registrationId)

    return {
      studentName,
      courseName,
      completionDate,
      certificateId,
      registrationId
    }
  }
}

export default CertificateService
