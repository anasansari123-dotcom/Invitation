# Shahi Wedding Invitation

## 1. Details badlein
Sirf `wedding.config.js` edit karein. `weddings` list mein har shaadi ka ek block hai: dulha/dulhan ka naam, date, time, venue aur `map` (Google Maps ka share link, exact pin ke liye). Saath mein WhatsApp number aur tradition bhi wahin hain.

## 2. Preview
```
npm run build
```
Phir `dist/index.html` browser mein kholein.

## 3. Vercel par live karein (GitHub se)
1. Code GitHub par push karein:
   ```
   git add -A
   git commit -m "update"
   git push
   ```
2. https://vercel.com/new kholein, GitHub se login karein, yeh repo **Import** karein.
3. Settings khud `vercel.json` se aa jayengi (Build: `npm run build`, Output: `dist`). Sirf **Deploy** dabayein.
4. Aage se har `git push` par site khud update ho jayegi.

- Guests ko chhota production link bhejein (`https://project-name.vercel.app`).
  Lamba random wala deployment link login maang sakta hai.
- `dist/` GitHub par nahi jata, Vercel khud build karta hai.

## 4. Guests ko bhejein
- `https://aapka-link.vercel.app/send` kholein, naam likhein, WhatsApp button dabayein.
- Ya khud link banayein: `https://aapka-link.vercel.app/?to=Sharma%20Family`

## Apna gaana
`src/music.mp3` rakhein aur config mein `music: 'music.mp3'` likhein.
Sirf wahi gaana lagayein jiske use ka haq aapke paas ho.

## Files
| File | Kaam |
|---|---|
| `wedding.config.js` | Saari details |
| `src/style.css` | Design aur rang |
| `src/world.js` | Mahal, camera, lanterns, phool |
| `src/app.js` | Mohar, scratch, RSVP, countdown |
| `src/music.js` | Built-in music |
| `scripts/art.js` | Saara vector artwork |
| `src/og.jpg` | WhatsApp preview image |

## Dhyaan dein
Link jiske paas hoga woh venue dekh sakta hai. Page Google search se hidden (`noindex`) hai, password protected nahi.

Fonts open source (OFL) hain, licences `src/fonts` mein hain.
