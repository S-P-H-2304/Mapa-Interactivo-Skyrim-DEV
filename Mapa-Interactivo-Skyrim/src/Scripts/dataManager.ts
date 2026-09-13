const STORAGE_KEY = 'skyrim_map_user_data'

export interface UserData {
  settings: {
    muted: boolean;
    volumePercent: number;
  };
  unlockedLocations: string[];
  completedTexts: string[];
}

const defaultData: UserData = {
  settings: {
    muted: false,
    volumePercent: 50,
  },
  unlockedLocations: [],
  completedTexts: []
}

class DataManager {
  private data: UserData

  constructor() {
    this.data = this.loadData()
  }

  private loadData(): UserData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        // Merge with defaults to ensure all fields exist
        return { ...defaultData, ...JSON.parse(stored) }
      }
    } catch (e) {
      console.warn('Error loading data from localStorage', e)
    }
    return { ...defaultData }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.warn('Error saving data to localStorage', e)
    }
  }

  public getData(): UserData {
    return this.data
  }

  // Settings
  public updateSettings(muted: boolean, volumePercent: number) {
    this.data.settings.muted = muted
    this.data.settings.volumePercent = volumePercent
    this.save()
  }

  // Locations
  public unlockLocation(locationId: string) {
    if (!this.data.unlockedLocations.includes(locationId)) {
      this.data.unlockedLocations.push(locationId)
      this.save()
    }
  }

  public isLocationUnlocked(locationId: string): boolean {
    return this.data.unlockedLocations.includes(locationId)
  }

  // Texts
  public markTextCompleted(textId: string) {
    if (!this.data.completedTexts.includes(textId)) {
      this.data.completedTexts.push(textId)
      this.save()
    }
  }

  public isTextCompleted(textId: string): boolean {
    return this.data.completedTexts.includes(textId)
  }

  // Testing utility — borra todo el progreso y ajustes
  public clearAll() {
    this.data = { ...defaultData, settings: { ...defaultData.settings } }
    this.save()
  }
}

export const dataManager = new DataManager()
