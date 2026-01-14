import AsyncStorage from '@react-native-async-storage/async-storage';

const COCOPAY_PROJECTS_STORAGE_KEY = '@cocopay/projects/v2';

export type StoredProject = {
  suckerGroupId: string;
  primaryChainId: number;
  primaryProjectId: number;
  addedAt: number;
  failedChains?: number[];
};

let cachedProjects: StoredProject[] | null = null;

export async function getStoredProjects(): Promise<StoredProject[]> {
  if (cachedProjects) {
    return cachedProjects;
  }

  try {
    const stored = await AsyncStorage.getItem(COCOPAY_PROJECTS_STORAGE_KEY);
    if (stored) {
      cachedProjects = JSON.parse(stored);
      return cachedProjects ?? [];
    }
  } catch {
    // ignore
  }
  return [];
}

export function getStoredProjectsSync(): StoredProject[] {
  return cachedProjects ?? [];
}

export async function addStoredProject(project: Omit<StoredProject, 'addedAt'>): Promise<void> {
  try {
    const current = await getStoredProjects();

    const exists = current.some((p) => p.suckerGroupId === project.suckerGroupId);

    if (exists) {
      return;
    }

    const newProject: StoredProject = {
      ...project,
      addedAt: Date.now(),
    };

    const updated = [...current, newProject];
    cachedProjects = updated;
    await AsyncStorage.setItem(COCOPAY_PROJECTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export async function removeStoredProject(suckerGroupId: string): Promise<void> {
  try {
    const current = await getStoredProjects();
    const updated = current.filter((p) => p.suckerGroupId !== suckerGroupId);
    cachedProjects = updated;
    await AsyncStorage.setItem(COCOPAY_PROJECTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export async function setStoredProjects(projects: StoredProject[]): Promise<void> {
  try {
    cachedProjects = projects;
    await AsyncStorage.setItem(COCOPAY_PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // ignore
  }
}

export async function clearStoredProjects(): Promise<void> {
  try {
    cachedProjects = null;
    await AsyncStorage.removeItem(COCOPAY_PROJECTS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function initializeProjectStorage(): Promise<void> {
  await getStoredProjects();
}
