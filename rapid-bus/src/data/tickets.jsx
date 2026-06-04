export const tickets = [
  {
    id: 1,
    operator: 'MKS - TRJ Bisnis • 1852',
    busType: 'Mercedes Benz • 1626',
    capacity: 26,
    seatFormat: '1 x 2 dan 2 x 2',
    departure: '08:00',
    arrival: '11:30',
    duration: '3 Jam 30 Menit',
    price: 'Rp 150.000',
    seats: 12,
    features: ['ac_unit', 'wifi', 'power'],
    amenities: [
      { icon: 'ac_unit', name: 'Ac' },
      { icon: 'bed', name: 'Blanket' },
      { icon: 'power', name: 'Charger' },
      { icon: 'lightbulb', name: 'Lamp' },
      { icon: 'luggage', name: 'Luggage' },
      { icon: 'airline_seat_recline_extra', name: 'Reclining Seat' }
    ],
    ticketClasses: [
      { name: 'President', price: 'Rp 230.000' },
      { name: 'Bisnis', price: 'Rp 180.000' },
      { name: 'Gubernur', price: 'Rp 200.000' },
      { name: 'Cad', price: 'Rp 150.000' }
    ]
  },
  {
    id: 2,
    operator: 'MKS - TRJ COMBI • 1844',
    busType: 'Scania K410IB',
    capacity: 28,
    seatFormat: '2 x 2',
    departure: '10:00',
    arrival: '13:00',
    duration: '3 Jam 00 Menit',
    price: 'Rp 230.000',
    seats: 4,
    features: ['ac_unit', 'wifi', 'power', 'chair'],
    amenities: [
      { icon: 'ac_unit', name: 'Ac' },
      { icon: 'bed', name: 'Blanket' },
      { icon: 'power', name: 'Charger' },
      { icon: 'lightbulb', name: 'Lamp' },
      { icon: 'luggage', name: 'Luggage' },
      { icon: 'airline_seat_recline_extra', name: 'Reclining Seat' }
    ],
    ticketClasses: [
      { name: 'President', price: 'Rp 230.000' },
      { name: 'Bisnis', price: 'Rp 180.000' },
      { name: 'Gubernur', price: 'Rp 200.000' },
      { name: 'Cad', price: 'Rp 150.000' }
    ]
  },
  {
    id: 3,
    operator: 'Reitama Ekonomi',
    busType: 'Hino RK8',
    capacity: 40,
    seatFormat: '2 x 2',
    departure: '13:00',
    arrival: '17:30',
    duration: '4 Jam 30 Menit',
    price: 'Rp 95.000',
    seats: 25,
    features: ['ac_unit'],
    amenities: [
      { icon: 'ac_unit', name: 'Ac' }
    ],
    ticketClasses: [
      { name: 'Ekonomi', price: 'Rp 95.000' }
    ]
  }
];
