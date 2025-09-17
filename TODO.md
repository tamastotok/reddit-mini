# TODO LIST

## 1. Registration

[✓] Make show/hide buttons on passwords <br>
[✓] Error message if username/email already taken <br>
[✓] Error message if password isn't strong enough <br>
[✓] Error message if passwords don’t match <br>
[✓] Check emails if they already taken (backend) <br>
[✓] Show requirements <br>
[✓] Disable Register button if requirements are not satisfied <br>
[✓] Make requirements into a reusable component

## 2. Login

[✓] Error message if username or password is incorrect <br>
[✓] Multiple pupups error

## 3. Homepage

[✓] Error message for empty field search <br>
[✓] Filter all posts by category <br>
[ ] Clickable post category - should work as tags

## 4. Search

[ ] Search by profile should make user profile in the first place at results <br>
[ ] Short by/Filter by dropdowns margin fix <br>
[ ] Back button ui change <br>
[ ] CategoryDropdown delete
[ ] Postcards are not the same

## 5. Post

[✓] Upvote/Downvote buttons ui error <br>
[✓] Tags should work as filter search <br>
[✓] Edit/Delete buttons margin fix <br>
[✓] Edit/Delete buttons ui change<br>
[✓] Create post buttons should be align right, border-radius change

## 6. Comments

[✓] Send/Cancel buttons margin fix <br>
[✓] Upvote/Downvote buttons should be the same as in Post <br>
[✓] Edit/Delete buttons ui (optional) <br>
[ ] Comments/index.js change loading text to spinner

## 7. Settings

[ ] Edit/Delete/Change Password buttons margin fix <br>
[ ] Main page button → Back button + ui fix (align) <br>
[ ] Profile picture change or select between default pics

## 8. Auth

[✓] Check if user is logged out after 30 min

## 9. Database

[ ] Refactor the whole db model <br>
[ ] Create ER model, Relational model in draw.io for documentation

## 10. Misc.

[ ] Change text inputs to floating labels <br>
[ ] CommentItem.jsx line 59: make an onClick function (refactor) <br>
[ ] Clicking on the logo doesn't refresh the front page <br>
[ ] Fix pytest null value errors <br>
[ ] Session expired popup bug (login -> popup -> logout the user and redirect to login) <br>
[✓] Tag names should have rules (max size, etc.) and needs ux refactor <br>
[✓] At CreatePost change PostForm.jsx to Popup.jsx <br>
[ ] Shorten tag names on postcards (tags and button overflow error) <br>
[✓] Make Tag error message coming from the server <br>
[ ] Delete post not working at /comments/... <br>
[✓] Categories are trimmed on Postcards <br>
[ ] EditPost Postform deleted -> change to Popup <br>
[ ] User thrown out even when logged in after 1 day (needs refresh tokens after login)
[ ] Delete Success message after create a post -> just redirect to '/'

## Planned features

- Dark mode
- Reply system
- Role system
- Report system
- Subforum system
