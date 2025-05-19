const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { createCanvas } = require('canvas');

class ReportGeneratorService {
  /**
   * Generate a comprehensive security report
   * @param {Object} analysisResults - Results from the security analysis
   * @param {Object} options - Report generation options
   * @returns {Object} Report in the requested format
   */
  generateReport(analysisResults, options = {}) {
    console.log('Generating comprehensive security report...');
    
    // Set default options
    const reportOptions = {
      format: options.format || 'json',
      includeVisuals: options.includeVisuals !== false,
      includeSolutions: options.includeSolutions !== false,
      includeCodeSnippets: options.includeCodeSnippets !== false,
      outputPath: options.outputPath || null
    };
    
    // Process the analysis results
    const processedData = this.processAnalysisData(analysisResults);
    
    // Generate the report in the requested format
    let report;
    switch(reportOptions.format.toLowerCase()) {
      case 'html':
        report = this.generateHtmlReport(processedData, reportOptions);
        break;
      case 'pdf':
        report = this.generatePdfReport(processedData, reportOptions);
        break;
      case 'json':
      default:
        report = this.generateJsonReport(processedData, reportOptions);
    }
    
    // Save the report if an output path is provided
    if (reportOptions.outputPath) {
      this.saveReport(report, reportOptions);
    }
    
    return report;
  }
  
  /**
   * Process and organize analysis data for reporting
   * @private
   */
  processAnalysisData(analysisResults) {
    // Create a structured object for reporting
    const reportData = {
      summary: this.generateSummary(analysisResults),
      vulnerabilities: this.processVulnerabilities(analysisResults.vulnerabilities || []),
      tokenAnalysis: this.processTokenAnalysis(analysisResults.tokenAnalysis || null),
      securityScore: analysisResults.securityScore || 0,
      metadata: {
        timestamp: new Date().toISOString(),
        contractAddress: analysisResults.tokenAddress || 'Unknown',
        scanId: this.generateScanId(),
      }
    };
    
    return reportData;
  }
  
  /**
   * Generate a unique scan ID for reference
   * @private
   */
  generateScanId() {
    return `SCAN-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }
  
  /**
   * Generate summary information from analysis results
   * @private
   */
  generateSummary(analysisResults) {
    const vulnerabilities = analysisResults.vulnerabilities || [];
    
    // Count vulnerabilities by severity
    const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'High').length;
    const mediumCount = vulnerabilities.filter(v => v.severity === 'Medium').length;
    const lowCount = vulnerabilities.filter(v => v.severity === 'Low').length;
    
    // Determine overall security status
    let securityStatus;
    if (criticalCount > 0) {
      securityStatus = 'Critical';
    } else if (highCount > 0) {
      securityStatus = 'Warning';
    } else if (mediumCount > 0 || lowCount > 0) {
      securityStatus = 'Caution';
    } else {
      securityStatus = 'Secure';
    }
    
    return {
      securityStatus,
      securityScore: analysisResults.securityScore || 0,
      totalIssues: vulnerabilities.length,
      issuesBySeverity: {
        Critical: criticalCount,
        High: highCount,
        Medium: mediumCount,
        Low: lowCount
      },
      isToken: analysisResults.isToken?.isToken || false,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Process vulnerabilities for better reporting
   * @private
   */
  processVulnerabilities(vulnerabilities) {
    // Group vulnerabilities by category
    const groupedByCategory = {};
    
    for (const vuln of vulnerabilities) {
      const category = vuln.category || 'Other';
      
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = [];
      }
      
      // Add impact and exploitability assessments
      const enrichedVuln = {
        ...vuln,
        impact: this.assessImpact(vuln),
        exploitability: this.assessExploitability(vuln),
        remediation: {
          recommendation: vuln.recommendation || 'Review the code for potential security issues',
          codeSample: this.generateRemediationSample(vuln),
          difficulty: this.assessRemediationDifficulty(vuln)
        }
      };
      
      groupedByCategory[category].push(enrichedVuln);
    }
    
    return {
      total: vulnerabilities.length,
      bySeverity: {
        Critical: vulnerabilities.filter(v => v.severity === 'Critical'),
        High: vulnerabilities.filter(v => v.severity === 'High'),
        Medium: vulnerabilities.filter(v => v.severity === 'Medium'),
        Low: vulnerabilities.filter(v => v.severity === 'Low')
      },
      byCategory: groupedByCategory
    };
  }
  
  /**
   * Process token analysis for reporting
   * @private
   */
  processTokenAnalysis(tokenAnalysis) {
    if (!tokenAnalysis) {
      return null;
    }
    
    // Create a structure specifically for token analysis reporting
    return {
      supply: {
        ...tokenAnalysis.supply,
        riskScore: this.calculateCategoryRiskScore(tokenAnalysis.supply.riskAssessment || [])
      },
      ownership: {
        ...tokenAnalysis.ownership,
        riskScore: this.calculateCategoryRiskScore(tokenAnalysis.ownership.riskAssessment || [])
      },
      upgrade: {
        ...tokenAnalysis.upgrade,
        riskScore: this.calculateCategoryRiskScore(tokenAnalysis.upgrade.riskAssessment || [])
      },
      treasury: {
        ...tokenAnalysis.treasury,
        riskScore: this.calculateCategoryRiskScore(tokenAnalysis.treasury.riskAssessment || [])
      }
    };
  }
  
  /**
   * Calculate risk score for a category based on its risk assessment
   * @private
   */
  calculateCategoryRiskScore(riskAssessment) {
    if (!riskAssessment || riskAssessment.length === 0) {
      return 100; // Perfect score if no risks
    }
    
    // Count vulnerabilities by severity
    const criticalCount = riskAssessment.filter(v => v.severity === 'Critical').length;
    const highCount = riskAssessment.filter(v => v.severity === 'High').length;
    const mediumCount = riskAssessment.filter(v => v.severity === 'Medium').length;
    const lowCount = riskAssessment.filter(v => v.severity === 'Low').length;
    
    // Calculate score (start with 100 and deduct based on severity)
    let score = 100;
    score -= criticalCount * 25;
    score -= highCount * 10;
    score -= mediumCount * 5;
    score -= lowCount * 1;
    
    return Math.max(0, score); // Ensure score doesn't go below 0
  }
  
  /**
   * Assess the impact of a vulnerability
   * @private
   */
  assessImpact(vulnerability) {
    // Map severity to impact assessment
    const impactMap = {
      'Critical': {
        level: 'Severe',
        description: 'Could lead to significant asset loss or contract compromise'
      },
      'High': {
        level: 'Significant',
        description: 'May allow malicious actors to manipulate contract functionality'
      },
      'Medium': {
        level: 'Moderate',
        description: 'Could disrupt contract operations or cause minor financial impact'
      },
      'Low': {
        level: 'Minor',
        description: 'Unlikely to cause significant harm but represents best practice violation'
      }
    };
    
    return impactMap[vulnerability.severity] || {
      level: 'Unknown',
      description: 'Impact cannot be determined from available information'
    };
  }
  
  /**
   * Assess the exploitability of a vulnerability
   * @private
   */
  assessExploitability(vulnerability) {
    // This would be more sophisticated in a real implementation
    // For now we'll base it on severity and category
    
    const category = vulnerability.category || '';
    const severity = vulnerability.severity;
    
    if (severity === 'Critical') {
      return {
        level: 'Easy',
        description: 'Easily exploitable by attackers with basic knowledge'
      };
    } else if (severity === 'High') {
      return {
        level: 'Moderate',
        description: 'Exploitable by attackers with moderate technical skills'
      };
    } else if (category.includes('Security') || category.includes('Safety')) {
      return {
        level: 'Difficult',
        description: 'Requires specific conditions and technical expertise to exploit'
      };
    } else {
      return {
        level: 'Complex',
        description: 'Difficult to exploit in realistic scenarios'
      };
    }
  }
  
  /**
   * Assess the difficulty of remediation
   * @private
   */
  assessRemediationDifficulty(vulnerability) {
    // This would be more sophisticated in a real implementation
    // Here we're making a simple assessment based on severity and available info
    
    const category = vulnerability.category || '';
    
    if (category.includes('Safety') || category.includes('Resource')) {
      return {
        level: 'Simple',
        description: 'Straightforward fix requiring minimal code changes',
        estimatedTime: '< 1 hour'
      };
    } else if (category.includes('Security') || category.includes('Access')) {
      return {
        level: 'Moderate',
        description: 'Requires careful implementation and testing',
        estimatedTime: '2-4 hours'
      };
    } else {
      return {
        level: 'Complex',
        description: 'May require architectural changes to address properly',
        estimatedTime: '4+ hours'
      };
    }
  }
  
  /**
   * Generate a code sample showing how to fix the vulnerability
   * @private
   */
  generateRemediationSample(vulnerability) {
    // This would be expanded in a real implementation with more specific examples
    const id = vulnerability.id || '';
    
    // Sample fixes based on vulnerability type
    const fixExamples = {
      'SUI-VULN-001': {
        title: 'Add proper access control',
        before: 'public entry fun update_config(value: u64) {',
        after: 'public entry fun update_config(admin: &AdminCap, value: u64) {\n    // Verify admin capability\n'
      },
      'SUI-VULN-002': {
        title: 'Add key ability to struct with UID',
        before: 'struct TokenStore {\n    id: UID,\n    tokens: Table<ID, Token>\n}',
        after: 'struct TokenStore has key {\n    id: UID,\n    tokens: Table<ID, Token>\n}'
      },
      'SUI-VULN-003': {
        title: 'Add overflow/underflow checks',
        before: 'let result = value1 + value2;',
        after: 'assert!(value2 <= MAX_U64 - value1, EOverflow);\nlet result = value1 + value2;'
      },
      'SUI-VULN-004': {
        title: 'Add existence check before table access',
        before: 'let item = table::borrow(&self.items, key);',
        after: 'assert!(table::contains(&self.items, key), EItemNotFound);\nlet item = table::borrow(&self.items, key);'
      }
    };
    
    // Return example if available for this vulnerability type
    return fixExamples[id] || null;
  }
  
  /**
   * Generate a JSON format report
   * @private
   */
  generateJsonReport(reportData, options) {
    // For JSON, we simply return the structured data
    return {
      format: 'json',
      data: reportData
    };
  }
  
  /**
   * Generate an HTML format report
   * @private
   */
  generateHtmlReport(reportData, options) {
    // In a real implementation, this would use a template engine
    // For this example, we'll create a simple HTML structure
    
    // Generate vulnerability tables
    let vulnerabilityTables = '';
    const severities = ['Critical', 'High', 'Medium', 'Low'];
    
    for (const severity of severities) {
      const vulns = reportData.vulnerabilities.bySeverity[severity];
      if (vulns.length > 0) {
        vulnerabilityTables += `
          <div class="severity-section severity-${severity.toLowerCase()}">
            <h3>${severity} Severity Issues (${vulns.length})</h3>
            <table class="vulnerability-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                ${vulns.map(vuln => `
                  <tr>
                    <td>${vuln.id || 'N/A'}</td>
                    <td>${vuln.title}</td>
                    <td>${vuln.description}</td>
                    <td>${this.formatLocation(vuln.location)}</td>
                    <td>${vuln.remediation.recommendation}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }
    
    // Generate security score visualization
    const securityScoreChart = options.includeVisuals ? 
      this.generateSecurityScoreChartSvg(reportData.securityScore) : '';
    
    // Generate vulnerability distribution chart
    const vulnerabilityDistributionChart = options.includeVisuals ?
      this.generateVulnerabilityDistributionChartSvg(reportData.vulnerabilities) : '';
    
    // Generate HTML content
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Analysis Report - ${reportData.metadata.contractAddress}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; }
          .report-container { max-width: 1200px; margin: 0 auto; }
          .report-header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .report-title { margin: 0; color: #2c3e50; }
          .report-meta { color: #7f8c8d; font-size: 14px; }
          .summary-section { display: flex; margin-bottom: 20px; }
          .summary-card { flex: 1; padding: 15px; margin: 0 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .chart-container { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .chart { flex: 1; margin: 0 10px; padding: 15px; background: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .severity-section { margin-bottom: 30px; }
          .severity-critical { border-left: 5px solid #e74c3c; padding-left: 15px; }
          .severity-high { border-left: 5px solid #e67e22; padding-left: 15px; }
          .severity-medium { border-left: 5px solid #f39c12; padding-left: 15px; }
          .severity-low { border-left: 5px solid #3498db; padding-left: 15px; }
          .vulnerability-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .vulnerability-table th, .vulnerability-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .vulnerability-table th { background-color: #f9f9f9; }
          .remediation-section { margin-top: 30px; }
          .code-block { background: #f8f8f8; padding: 10px; border-radius: 3px; font-family: monospace; margin: 10px 0; }
          .token-analysis { margin-top: 30px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <h1 class="report-title">Security Analysis Report</h1>
            <p class="report-meta">
              Contract: ${reportData.metadata.contractAddress}<br>
              Scan ID: ${reportData.metadata.scanId}<br>
              Generated: ${new Date(reportData.metadata.timestamp).toLocaleString()}<br>
              Security Score: ${reportData.securityScore}/100
            </p>
          </div>
          
          <div class="summary-section">
            <div class="summary-card" style="background-color: ${this.getStatusColor(reportData.summary.securityStatus)};">
              <h3>Security Status</h3>
              <p style="font-size: 24px; font-weight: bold;">${reportData.summary.securityStatus}</p>
            </div>
            <div class="summary-card">
              <h3>Issues Summary</h3>
              <p>
                Critical: ${reportData.summary.issuesBySeverity.Critical}<br>
                High: ${reportData.summary.issuesBySeverity.High}<br>
                Medium: ${reportData.summary.issuesBySeverity.Medium}<br>
                Low: ${reportData.summary.issuesBySeverity.Low}
              </p>
            </div>
            <div class="summary-card">
              <h3>Contract Type</h3>
              <p>${reportData.summary.isToken ? 'Token Contract' : 'Standard Contract'}</p>
            </div>
          </div>
          
          <div class="chart-container">
            <div class="chart">
              <h3>Security Score</h3>
              ${securityScoreChart}
            </div>
            <div class="chart">
              <h3>Vulnerability Distribution</h3>
              ${vulnerabilityDistributionChart}
            </div>
          </div>
          
          <h2>Vulnerabilities</h2>
          ${vulnerabilityTables}
          
          ${this.generateTokenAnalysisHtml(reportData.tokenAnalysis)}
          
          <div class="footer">
            <p>Report generated by Voysa Blockchain Security Scanner</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return {
      format: 'html',
      data: html
    };
  }
  
  /**
   * Generate PDF format report
   * @private
   */
  generatePdfReport(reportData, options) {
    // In a real implementation, this would generate an actual PDF
    // For this example, we'll return a placeholder
    
    return {
      format: 'pdf',
      data: 'PDF generation not implemented in this version'
    };
  }
  
  /**
   * Format location information for display
   * @private
   */
  formatLocation(location) {
    if (!location) return 'Unknown';
    
    if (location.line) {
      return `Line ${location.line}${location.column ? `, Column ${location.column}` : ''}`;
    } else if (location.snippet) {
      return `Code: ${location.snippet}`;
    } else {
      return 'Unknown location';
    }
  }
  
  /**
   * Generate security score chart as SVG
   * @private
   */
  generateSecurityScoreChartSvg(score) {
    // In a real implementation, this would generate an SVG gauge chart
    // For this example, we'll create a simple gauge
    
    const width = 200;
    const height = 100;
    const radius = 80;
    const centerX = width / 2;
    const centerY = height - 10;
    
    // Calculate the angle based on the score (0-100 to 0-180 degrees)
    const angle = (score / 100) * Math.PI;
    const needleX = centerX + radius * Math.sin(angle);
    const needleY = centerY - radius * Math.cos(angle);
    
    // Get color based on score
    const color = score >= 80 ? '#27ae60' : score >= 60 ? '#f39c12' : '#e74c3c';
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Gauge Background -->
        <path d="M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}" 
              fill="none" stroke="#ecf0f1" stroke-width="10" />
        
        <!-- Gauge Value -->
        <path d="M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${needleX} ${needleY}" 
              fill="none" stroke="${color}" stroke-width="10" />
        
        <!-- Needle -->
        <line x1="${centerX}" y1="${centerY}" x2="${needleX}" y2="${needleY}" 
              stroke="#34495e" stroke-width="2" />
        
        <!-- Score Text -->
        <text x="${centerX}" y="${centerY - 20}" text-anchor="middle" font-size="24" fill="${color}">${score}</text>
      </svg>
    `;
  }
  
  /**
   * Generate vulnerability distribution chart as SVG
   * @private
   */
  generateVulnerabilityDistributionChartSvg(vulnerabilities) {
    // Simple bar chart showing vulnerability distribution by severity
    
    const width = 300;
    const height = 150;
    const barWidth = 50;
    const spacing = 10;
    const maxBarHeight = 120;
    
    // Get counts
    const counts = {
      Critical: vulnerabilities.bySeverity.Critical.length,
      High: vulnerabilities.bySeverity.High.length,
      Medium: vulnerabilities.bySeverity.Medium.length,
      Low: vulnerabilities.bySeverity.Low.length
    };
    
    // Find the maximum count for scaling
    const maxCount = Math.max(counts.Critical, counts.High, counts.Medium, counts.Low, 1);
    
    // Determine bar heights
    const barHeights = {
      Critical: (counts.Critical / maxCount) * maxBarHeight,
      High: (counts.High / maxCount) * maxBarHeight,
      Medium: (counts.Medium / maxCount) * maxBarHeight,
      Low: (counts.Low / maxCount) * maxBarHeight
    };
    
    // Colors for each severity
    const colors = {
      Critical: '#e74c3c',
      High: '#e67e22',
      Medium: '#f39c12',
      Low: '#3498db'
    };
    
    // Generate SVG bars
    let bars = '';
    let x = spacing;
    
    for (const severity of ['Critical', 'High', 'Medium', 'Low']) {
      const barHeight = barHeights[severity];
      const y = height - barHeight - spacing;
      
      bars += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${colors[severity]}" />
        <text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-size="12">${counts[severity]}</text>
        <text x="${x + barWidth/2}" y="${height - 5}" text-anchor="middle" font-size="10">${severity.substring(0, 1)}</text>
      `;
      
      x += barWidth + spacing;
    }
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${bars}
      </svg>
    `;
  }
  
  /**
   * Generate HTML for token analysis
   * @private
   */
  generateTokenAnalysisHtml(tokenAnalysis) {
    if (!tokenAnalysis) {
      return '';
    }
    
    return `
      <div class="token-analysis">
        <h2>Token Analysis</h2>
        
        <div class="summary-section">
          <div class="summary-card">
            <h3>Supply Analysis</h3>
            <p>Risk Score: ${tokenAnalysis.supply.riskScore}/100</p>
            <p>${tokenAnalysis.supply.summary || 'No supply issues detected'}</p>
          </div>
          
          <div class="summary-card">
            <h3>Ownership Analysis</h3>
            <p>Risk Score: ${tokenAnalysis.ownership.riskScore}/100</p>
            <p>${tokenAnalysis.ownership.summary || 'No ownership issues detected'}</p>
          </div>
          
          <div class="summary-card">
            <h3>Upgrade Analysis</h3>
            <p>Risk Score: ${tokenAnalysis.upgrade.riskScore}/100</p>
            <p>${tokenAnalysis.upgrade.summary || 'No upgrade issues detected'}</p>
          </div>
          
          <div class="summary-card">
            <h3>Treasury Analysis</h3>
            <p>Risk Score: ${tokenAnalysis.treasury.riskScore}/100</p>
            <p>${tokenAnalysis.treasury.summary || 'No treasury issues detected'}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Get color for security status
   * @private
   */
  getStatusColor(status) {
    const colors = {
      'Critical': '#ffebee',
      'Warning': '#fff3e0',
      'Caution': '#fffde7',
      'Secure': '#e8f5e9'
    };
    
    return colors[status] || '#ffffff';
  }
  
  /**
   * Save the report to a file
   * @private
   */
  saveReport(report, options) {
    const outputPath = options.outputPath;
    
    try {
      // Determine file extension based on format
      let extension;
      let content;
      
      switch(report.format) {
        case 'html':
          extension = 'html';
          content = report.data;
          break;
        case 'pdf':
          extension = 'pdf';
          content = report.data;
          break;
        case 'json':
        default:
          extension = 'json';
          content = JSON.stringify(report.data, null, 2);
      }
      
      // Create full file path
      const filePath = outputPath.endsWith(`.${extension}`) ? 
        outputPath : `${outputPath}.${extension}`;
      
      // Ensure directory exists
      const directory = path.dirname(filePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(filePath, content);
      console.log(`Report saved to: ${filePath}`);
    } catch (error) {
      console.error('Error saving report:', error);
      throw new Error(`Failed to save report: ${error.message}`);
    }
  }
}

module.exports = new ReportGeneratorService();