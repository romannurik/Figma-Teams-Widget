const FIRST_NAMES = [
  "Harry", "Ross", "Bruce", "Cook",
  "Carolyn", "Morgan", "Albert", "Walker",
  "Randy", "Reed", "Larry", "Barnes",
  "Lois", "Wilson", "Jesse", "Campbell",
  "Ernest", "Rogers", "Theresa", "Patterson",
  "Henry", "Simmons", "Michelle", "Perry",
  "Frank", "Butler", "Shirley"];

const LAST_NAMES = [
  "Ruth", "Jackson", "Debra", "Allen",
  "Gerald", "Harris", "Raymond", "Carter",
  "Jacqueline", "Torres", "Joseph", "Nelson",
  "Carlos", "Sanchez", "Ralph", "Clark",
  "Jean", "Alexander", "Stephen", "Roberts",
  "Eric", "Long", "Amanda", "Scott",
  "Teresa", "Diaz", "Wanda", "Thomas"];

//https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(a: number): () => number {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function randomFakeUser(totalNumUsers: number = 9999): User {
  let seed = Math.floor(Math.random() * totalNumUsers);
  let rand = mulberry32(seed);
  let pick = (arr: string[]) => arr[Math.floor(rand() * arr.length)];
  return {
    photoUrl: `https://picsum.photos/id/${Math.floor(rand() * 40)}/50/50`,
    name: pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES),
    id: String(Math.floor(rand() * 9999)),
    color: "#ff8800",
    sessionId: Math.floor(rand() * 9999)
  };
}