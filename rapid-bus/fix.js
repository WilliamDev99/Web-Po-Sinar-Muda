const fs = require('fs');
let c = fs.readFileSync('src/app/booking/page.jsx', 'utf8');
c = c.replace(/<SeatBtn\s+id={(\d+)}\s+selected={selectedSeats\.includes\(\d+\)}\s+toggle={\(\) => toggleSeat\(\d+\)}\s*\/>/g, (match, id) => {
  return `<SeatBtn id={${id}} selected={selectedSeats.includes(${id})} toggle={() => toggleSeat(${id})} bookedGender={bookedSeatsMap[${id}]} />`;
});
fs.writeFileSync('src/app/booking/page.jsx', c);
console.log('Done');
