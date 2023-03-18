import { readFileSync } from 'fs';

export function GetDataFromJsonFile() {
  const filePath = './src/@core/infra/db/vetor-data.json';

  const data = readFileSync(filePath, 'utf8');

  return JSON.parse(data);
}
