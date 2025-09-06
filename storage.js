export function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function loadFromStorage(key, defaultValue = null) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
}

