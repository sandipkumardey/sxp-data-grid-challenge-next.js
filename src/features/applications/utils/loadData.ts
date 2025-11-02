import { Application } from '../types/application';
import sampleData from '../../../../sample-applications.json';

/**
 * Loads and parses the sample applications data
 * @returns Promise that resolves to an array of Application objects
 */
export async function loadApplications(): Promise<Application[]> {
  try {
    // The sample data is imported directly, so we just need to type assert it
    return sampleData as unknown as Application[];
  } catch (error) {
    console.error('Error loading applications data:', error);
    return [];
  }
}

/**
 * Extracts all unique skills from the applications data
 * @param applications Array of applications
 * @returns Array of unique skill names
 */
export function extractUniqueSkills(applications: Application[]): string[] {
  const skillsSet = new Set<string>();
  
  applications.forEach(application => {
    if (Array.isArray(application.skills)) {
      application.skills.forEach(skill => {
        if (skill?.name) {
          skillsSet.add(skill.name);
        }
      });
    }
  });
  
  return Array.from(skillsSet).sort();
}
