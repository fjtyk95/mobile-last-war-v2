// Mobile Last War v2 - ID Generator Utilities

let enemyIdCounter = 0
let bulletIdCounter = 0

export const createEnemyId = (): string => {
  return `enemy_${++enemyIdCounter}`
}

export const createBulletId = (): string => {
  return `bullet_${++bulletIdCounter}`
}

export const resetIdCounters = (): void => {
  enemyIdCounter = 0
  bulletIdCounter = 0
}