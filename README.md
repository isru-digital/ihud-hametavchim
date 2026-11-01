# מרכז הרעיונות · איחוד המתווכים

מערכת פרטית לשלושה משתמשים (איציק, אריאל, אופק) לניהול רעיונות, החלטות, משימות, שיחות וקבצים של "איחוד המתווכים, רשת התיווך הארצית". שום דבר לא הולך לאיבוד: הכול נשמר, ניתן לחיפוש, וניתן לייצוא בלחיצה לקובץ שמוכן להעלאה לעוזר AI (קלוד, גרוק וכדומה).

נבנה על ידי ISRU-E איציק עוזיאל.

## ארכיטקטורה

| רכיב | טכנולוגיה | היכן |
|---|---|---|
| אתר (Frontend) | HTML + CSS + JS נקי, RTL מלא | GitHub Pages, תיקיית `docs/` |
| שרת (API) | Cloudflare Worker | `worker/`, רץ בכתובת `https://ihud-api.beapromanager.workers.dev` |
| מסד נתונים | Cloudflare D1 (SQLite) בשם `ihud-db` | הגדרה ב-`worker/wrangler.toml` |
| קבצים | נשמרים במסד בצ'אנקים, עד 8MB לקובץ, תמונות נדחסות בדפדפן | |

העדכון בין המשתמשים נעשה ברענון אוטומטי כל כמה שניות (polling), מספיק בהחלט לשלושה משתמשים.

## איך מריצים מקומית

```bash
python -m http.server 8641 --directory .
```

ואז לפתוח `http://localhost:8641/docs/index.html`. האתר מדבר עם ה-API החי בענן.

## איך מגדירים את שלוש הסיסמאות

הסיסמאות לא נשמרות בטקסט גלוי ולא נמצאות בריפו. במסד נשמר רק hash. כדי להגדיר או להחליף סיסמה:

1. מחשבים hash (ה-SALT נמצא בראש `worker/src/index.js`):

```bash
node -e "const c=require('crypto');console.log(c.createHash('sha256').update('SALT:USER_ID:PASSWORD').digest('hex'))"
```

כאשר `USER_ID` הוא `ITZIK` או `ARIEL` או `OFEK`.

2. מעדכנים את המסד:

```bash
cd worker
npx wrangler d1 execute ihud-db --remote --command "UPDATE users SET pass_hash='<HASH>' WHERE id='ITZIK'"
```

## איך מפרסמים עדכונים

- **אתר**: עריכת הקבצים ב-`docs/`, ואז commit + push ל-main. GitHub Pages מתעדכן תוך דקה או שתיים. אם שיניתם את `app.js` או `style.css`, העלו את מספר הגרסה בסוף השורות `?v=` שב-`index.html` כדי לעקוף קאש.
- **שרת**: מתוך `worker/` מריצים `npx wrangler deploy`.
- **שינוי במבנה המסד**: עורכים את `worker/schema.sql` ומריצים `npx wrangler d1 execute ihud-db --remote --file=schema.sql`.

## ייצוא וגיבוי

- כפתור "ייצוא לעוזר AI" בדשבורד מוריד Markdown מסודר (או JSON מובנה), עם סיכום החלטות, משימות ורעיונות בראש הקובץ. אפשר לסנן נושאים וטווח תאריכים.
- גיבוי ידני מלא של המסד:

```bash
cd worker
npx wrangler d1 export ihud-db --remote --output backup.sql
```

## אבטחה

- כניסה עם סיסמה אישית לכל משתמש; במסד נשמר hash בלבד.
- ההתחברות נשמרת במכשיר (token), והתנתקות מוחקת אותה.
- האתר מסומן `noindex` ולא מופיע במנועי חיפוש. הנתונים עצמם נגישים רק דרך ה-API עם token.
- "מחיקה" של הודעות ונושאים היא תמיד העברה לארכיון, שום מידע לא נמחק מהמסד.
