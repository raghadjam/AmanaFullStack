import fs from 'fs'

export function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}
