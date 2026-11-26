// =====================================================================
//  SIRF YEH FILE EDIT KARNI HAI
//  - Text hamesha 'quotes' ke andar likhein. Andar ' chahiye to \' likhein.
//  - Date ka format: '2026-11-22' (saal-mahina-din)
//  - Time 24 ghante wala: '19:30' = shaam 7:30. Khaali '' = card par time nahi dikhega.
//  - Badalne ke baad "npm run build", phir git push (Vercel khud update karega)
// =====================================================================

module.exports = {
  // 'neutral' | 'muslim' | 'hindu' | 'sikh'  (upar ki dua isi se aati hai)
  tradition: 'muslim',

  // Card par sabse upar dikhega. Khaali chhod sakte hain.
  hosts: '',

  timezone: '+05:30', // India
  city: 'Muzaffarnagar',

  // Dono shaadiyan. Pehli wali ki date se countdown shuru hota hai.
  // map: Google Maps ka "Share" link yahan paste karein (exact pin ke liye).
  //      Khaali = address se live location / rasta khulega.
  weddings: [
    {
      tag: 'Bhai ki Shaadi',
      groom: 'Mohd Kashif', groomShort: 'Kashif',
      bride: 'Muskan Parveen', brideShort: 'Muskan',
      baraat: 'Baraat jayegi',
      date: '2026-11-22', time: '', hours: 6,
      venue: 'Libharedi', address: 'Uttarakhand 247656',
      map: '',
    },
    {
      tag: 'Behen ki Shaadi',
      groom: 'Mohd Zeeshan', groomShort: 'Zeeshan',
      bride: 'Ronak Parveen', brideShort: 'Ronak',
      brideFirst: true, // card par dulhan ka naam pehle
      baraat: 'Baraat aayegi',
      date: '2026-11-23', time: '', hours: 6,
      venue: 'Nawab Farm House', address: 'Mimlana Road, Muzaffarnagar 251001',
      map: '',
    },
  ],

  // Sabse neeche "Aisa card banwayein" button isi WhatsApp number par message bhejta hai.
  // Country code + number, bina + ya space. Khaali = button nahi dikhega.
  cardMaker: '919389441961',

  // Khaali = card ka apna santoor music. Apna gaana: src/music.mp3 rakhein aur 'music.mp3' likhein.
  music: '',

  // Sirf custom domain ho to bharein. Vercel par khud detect ho jata hai.
  siteUrl: '',
};
