# Kiara Dating Application™

Egyszerű HTML/CSS/JS honlap élő szelfivel, pontozással és EmailJS email-küldéssel.

## Fájlok

- `index.html` – oldal felépítése
- `style.css` – dizájn
- `script.js` – kamera, pontozás, emailküldés

## EmailJS beállítás

1. Regisztrálj: https://www.emailjs.com/
2. Add hozzá a Gmail fiókodat az Email Services résznél.
3. Hozz létre egy Email Template-et.
4. A template-ben használd ezeket a változókat:

```text
{{applicant_name}}
{{age}}
{{height}}
{{city}}
{{profession}}
{{personality}}
{{hobbies}}
{{traits}}
{{score}}
{{verdict}}
{{selfie_image}}
```

5. A `script.js` elején cseréld ki:

```js
const EMAILJS_PUBLIC_KEY = "IDE_JON_A_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "IDE_JON_A_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "IDE_JON_A_TEMPLATE_ID";
```

## GitHub Pages

1. Hozz létre új GitHub repositoryt.
2. Töltsd fel a három fájlt: `index.html`, `style.css`, `script.js`.
3. Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: `main`, folder: `/root`.
6. Save.
