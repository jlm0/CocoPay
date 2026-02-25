import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoreCreationParams } from '@/types/juicebox';

const COCOPAY_PROJECTS_STORAGE_KEY = '@cocopay/projects/v2';

export type StoredProject = {
  suckerGroupId?: string;
  primaryChainId: number;
  primaryProjectId: number;
  addedAt: number;
  failedChains?: number[];
  creationParams?: StoreCreationParams;
  metadataCid?: string;
  creationSalt?: `0x${string}`;
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

    const exists = current.some(
      (p) =>
        p.primaryProjectId === project.primaryProjectId &&
        p.primaryChainId === project.primaryChainId
    );

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

export async function removeStoredProject(projectId: number, chainId: number): Promise<void> {
  try {
    const current = await getStoredProjects();
    const updated = current.filter(
      (p) => !(p.primaryProjectId === projectId && p.primaryChainId === chainId)
    );
    cachedProjects = updated;
    await AsyncStorage.setItem(COCOPAY_PROJECTS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export async function updateStoredProject(
  projectId: number,
  chainId: number,
  updates: Partial<Omit<StoredProject, 'primaryProjectId' | 'primaryChainId' | 'addedAt'>>
): Promise<void> {
  try {
    const current = await getStoredProjects();
    const index = current.findIndex(
      (p) => p.primaryProjectId === projectId && p.primaryChainId === chainId
    );

    if (index === -1) return;

    current[index] = { ...current[index], ...updates };
    cachedProjects = current;
    await AsyncStorage.setItem(COCOPAY_PROJECTS_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function getStoredProjectSync(projectId: number, chainId: number): StoredProject | null {
  if (!cachedProjects) return null;
  return (
    cachedProjects.find((p) => p.primaryProjectId === projectId && p.primaryChainId === chainId) ??
    null
  );
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
