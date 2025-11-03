import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Application, Skill } from '../types/application';

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportOptions {
  filename?: string;
  includeSkills?: boolean;
  dateFormat?: 'short' | 'long' | 'iso';
}

/**
 * Transform application data for export by flattening skills and formatting dates
 */
export function transformApplicationsForExport(
  applications: Application[],
  options: ExportOptions = {}
): Record<string, any>[] {
  const { includeSkills = true, dateFormat = 'short' } = options;

  return applications.map(app => {
    const baseData: Record<string, any> = {
      'ID': app.id,
      'Name': app.name,
      'Email': app.email,
      'Phone': app.phone,
      'Location': app.location,
      'Employer': app.employer || '',
      'Experience (Years)': app.overallExperience,
      'Current Work Type': app.currentWorkType || '',
      'Preferred Work Type': app.preferredWorkType,
      'Current CTC (LPA)': app.ctc ? `₹${app.ctc}` : '',
      'Expected CTC (LPA)': app.expectedCTC ? `₹${app.expectedCTC}` : '',
      'Status': app.applicationStatus,
      'Match %': `${app.matchPercentage}%`,
      'Applied Date': formatDate(app.createdAt, dateFormat),
      'Willing to Relocate': app.willingToRelocate ? 'Yes' : 'No',
      'Notice Period (Days)': app.noticePeriod,
      'Offers in Hand': app.offersInHand,
      'Current Contract Type': app.currentContractType || '',
      'Attachment Extension': app.attachmentFileExtension,
    };

    // Add skill columns if requested
    if (includeSkills && app.skills) {
      // Get all unique skill names across all applications
      const allSkillNames = Array.from(
        new Set(
          applications.flatMap(app =>
            app.skills?.map(skill => skill.name) || []
          )
        )
      ).sort();

      // Add each skill as a separate column
      allSkillNames.forEach(skillName => {
        const skill = app.skills?.find(s => s.name === skillName);
        baseData[`${skillName} (Years)`] = skill ? skill.years : '';
      });
    }

    return baseData;
  });
}

/**
 * Format date based on the specified format
 */
function formatDate(dateStr: string, format: 'short' | 'long' | 'iso'): string {
  try {
    const date = new Date(dateStr);

    switch (format) {
      case 'iso':
        return date.toISOString().split('T')[0];
      case 'long':
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'short':
      default:
        return date.toLocaleDateString('en-IN');
    }
  } catch (error) {
    return dateStr; // Return original string if parsing fails
  }
}

/**
 * Export applications data to CSV format
 */
export function exportToCSV(
  applications: Application[],
  options: ExportOptions = {}
): void {
  const { filename = `applications-${new Date().toISOString().split('T')[0]}` } = options;

  try {
    console.log('Transforming data for CSV export...');
    const transformedData = transformApplicationsForExport(applications, options);

    if (transformedData.length === 0) {
      throw new Error('No data to export');
    }

    console.log('Creating CSV content with', transformedData.length, 'rows');
    // Create CSV content
    const headers = Object.keys(transformedData[0]);
    const csvRows = [
      headers.join(','),
      ...transformedData.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    console.log('CSV content length:', csvContent.length);

    // Create and download the file
    console.log('Creating blob and triggering download...');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${filename}.csv`);
    console.log('CSV download triggered');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

/**
 * Export applications data to Excel format (.xlsx)
 */
export function exportToExcel(
  applications: Application[],
  options: ExportOptions = {}
): void {
  const { filename = `applications-${new Date().toISOString().split('T')[0]}` } = options;

  try {
    const transformedData = transformApplicationsForExport(applications, options);

    if (transformedData.length === 0) {
      throw new Error('No data to export');
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(transformedData);

    // Auto-size columns
    const colWidths = Object.keys(transformedData[0]).map(header => ({
      wch: Math.max(header.length, 12) // Minimum width of 12 characters
    }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');

    // Generate and download the file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

/**
 * Export applications data to PDF format
 */
export function exportToPDF(
  applications: Application[],
  options: ExportOptions = {}
): void {
  const { filename = `applications-${new Date().toISOString().split('T')[0]}` } = options;

  try {
    const transformedData = transformApplicationsForExport(applications, options);

    if (transformedData.length === 0) {
      throw new Error('No data to export');
    }

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    doc.setFontSize(16);
    doc.text('Job Applications Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Applications: ${applications.length}`, 14, 35);

    // Prepare table data
    const headers = Object.keys(transformedData[0]);
    const data = transformedData.map(row => headers.map(header => row[header] || ''));

    // Add table to PDF
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 45 },
    });

    // Download the PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

/**
 * Utility function to download a file blob
 */
function downloadFile(blob: Blob, filename: string): void {
  console.log('downloadFile called with filename:', filename, 'blob size:', blob.size);
  try {
    const url = window.URL.createObjectURL(blob);
    console.log('Created object URL:', url);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    console.log('Appending link to document...');
    document.body.appendChild(link);

    console.log('Clicking link programmatically...');
    link.click();

    console.log('Removing link and revoking URL...');
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('Download process completed');
  } catch (error) {
    console.error('Error in downloadFile:', error);
    throw error;
  }
}

/**
 * Get export statistics for UI display
 */
export function getExportStats(applications: Application[]) {
  return {
    totalRecords: applications.length,
    totalSkills: Array.from(
      new Set(
        applications.flatMap(app => app.skills?.map(skill => skill.name) || [])
      )
    ).length,
    dateRange: applications.length > 0 ? {
      earliest: applications
        .map(app => new Date(app.createdAt))
        .sort((a, b) => a.getTime() - b.getTime())[0]
        .toLocaleDateString(),
      latest: applications
        .map(app => new Date(app.createdAt))
        .sort((a, b) => b.getTime() - a.getTime())[0]
        .toLocaleDateString(),
    } : null,
  };
}
