# CryptPad

CryptPad provides a full-fledged office suite with all the tools necessary for productive collaboration. Applications include: Rich Text, Spreadsheets, Code/Markdown, Kanban, Slides, Whiteboard and Forms.

### Configuration
Tor / Lan: Select if user can access CryptPad via Lan (default) or Tor.  The Alpha version allows access via Tor or Lan, but not both at the same time. 
Admin user public key: In order to access the web administration page the public key for the admin user must be entered here.  When CryptPad is first installed, this is blank.  In order to get the public key, sign up for an account (upper right corner of the main page).  After completing your registration, You will see your login shortname in the upper right, left click there and select settings from the pop up menu.  Your public signing key will be directly beneath your account name.  Copy that (including the square brackets at the start and end) and then paste that into the config page public key field.
Admin user email: Allows you to set the email address for the contact.html page.  This can be changed later from the web administration page.

### Important!!!
CryptPad encrypts all documents on the browser.  The files stored on the server are encrypted and there is no key saved on the server side.   Your password is the secret key that encrypts all of your documents. If you lose it there is no way to recover the data. 
