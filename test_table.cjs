const fs = require('fs');
const path = require('path');

const block = `| Расход | Сумма |
|--------|-------|
| Оценка недвижимости | 3 000 — 10 000 ₽ |
| Страхование | 0.3 — 1% от суммы |
| Регистрация в Росреестре | 2 000 ₽ |
| Нотариус (при необходимости) | 2 000 — 5 000 ₽ |
| **Итого** | **7 000 — 25 000 ₽** |`;

let trimmed = block.trim();
const rows = trimmed.split('\n');

console.log("Starts with |", trimmed.startsWith('|'));
console.log("Includes \n", trimmed.includes('\n'));
console.log("Rows length >= 2", rows.length >= 2);
console.log("Row 1", JSON.stringify(rows[1]));
console.log("Matches:", rows[1].match(/\|[-:\s]+\|/));
