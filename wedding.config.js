// =====================================================================
//  SIRF YEH FILE EDIT KARNI HAI
//  - Text hamesha 'quotes' ke andar likhein. Andar ' chahiye to \' likhein.
//  - Date ka format: '2027-02-14' (saal-mahina-din)
//  - Time 24 ghante wala: '19:30' = shaam 7:30
//  - Badalne ke baad "npm run build", phir "vercel --prod"
// =====================================================================

module.exports = {
  // 'neutral' | 'muslim' | 'hindu' | 'sikh'  (upar ki dua/shlok isi se aati hai)
  tradition: 'neutral',

  bride: {
    name: 'Meher',
    fullName: 'Meher Sample',
    relation: 'Beloved daughter of',
    parents: 'Mrs. & Mr. Sample',
    family: 'New Delhi',
  },
  groom: {
    name: 'Aarav',
    fullName: 'Aarav Sample',
    relation: 'Beloved son of',
    parents: 'Mrs. & Mr. Example',
    family: 'Jaipur',
  },
  groomFirst: true, // false = dulhan ka naam pehle

  weddingDate: '2027-02-14',
  weddingTime: '19:00',
  timezone: '+05:30', // India
  city: 'Jaipur, Rajasthan',

  // Function hatana ho to poora { ... } block delete karein, jodna ho to copy karein.
  // art: 'mehendi' | 'haldi' | 'wedding' | 'reception'
  events: [
    {
      name: 'Mehendi',
      art: 'mehendi',
      line: 'Henna, music and a love that only grows deeper',
      date: '2027-02-12', time: '16:00', hours: 5,
      venue: 'The Garden Courtyard', address: 'Venue address, Jaipur',
      dress: 'Shades of green',
      map: '', // Google Maps link. Khaali = address se search hoga
    },
    {
      name: 'Haldi',
      art: 'haldi',
      line: 'A golden morning of laughter and blessings',
      date: '2027-02-13', time: '10:30', hours: 4,
      venue: 'The Sunlit Haveli', address: 'Venue address, Jaipur',
      dress: 'Sunshine yellow',
      map: '',
    },
    {
      name: 'The Wedding', // 'Nikah', 'Shubh Vivah', 'Anand Karaj'...
      art: 'wedding',
      line: 'Two hearts, two families, one beautiful forever',
      date: '2027-02-14', time: '19:00', hours: 5,
      venue: 'The Grand Palace', address: 'Venue address, Jaipur',
      dress: 'Regal traditional',
      map: '',
    },
    {
      name: 'Reception', // 'Walima'...
      art: 'reception',
      line: 'An evening of dinner, dazzle and celebration',
      date: '2027-02-15', time: '19:30', hours: 4,
      venue: 'The Crystal Ballroom', address: 'Venue address, Jaipur',
      dress: 'Evening glamour',
      map: '',
    },
  ],

  // RSVP isi WhatsApp number par aayega: country code + number, bina + ya space.
  // Example: '91XXXXXXXXXX'
  whatsapp: '',

  // Khaali = card ka apna santoor music. Apna gaana: src/music.mp3 rakhein aur 'music.mp3' likhein.
  music: '',

  // Sirf custom domain ho to bharein. Vercel par khud detect ho jata hai.
  siteUrl: '',
};
