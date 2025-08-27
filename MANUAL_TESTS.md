# Manual Test Plan – Reddit Clone

This document lists the core features to quick test manually, with steps and expected results.

---

## 1. Authentication

### Register

- **Steps**
  1. Go to `/register`
  2. Enter email, username, password, confirm password
  3. Click "Register"
- **Expected**
  - Account is created
  - Error message if username/email already taken
  - Error message if password isn't strong enough
  - Error message if passwords don’t match

### Login

- **Steps**
  1. Go to `/login`
  2. Enter valid username + password
- **Expected**
  - JWT token returned and stored
  - Redirect to homepage
  - Error shown for invalid credentials

### JWT Token

- **Check**
  - JWT token expiration

---

## 2. Homepage / Navbar

- **Steps**
  1. Visit `/`
- **Expected**
  - Navbar visible with Create Post, Search bar, Profile dropdown

---

## 3. Create Post

- **Steps**
  1. Click "Create Post"
  2. Fill in title, content, category, up to 3 tags
  3. Click "Create"
- **Expected**
  - Post appears on homepage
  - Error if > 3 tags
  - Cancel/Back buttons return to homepage
- **Tags**
  - Edit/remove tags

---

## 4. Profile / Settings

- **Profile picture**
  - Upload image → should display in profile + navbar
- **Edit profile**
  - Change username, upload new picture
  - Error message if username is already taken
- **Delete profile**
  - Click "Delete" → confirm → account removed
  - Message on success → redirect to `/login`
- **Change password**
  - Enter current + new + confirm → password updated
  - Message on success/error

---

## 5. Post on Homepage

- **Expected**
  - Shows title, content, category, tags, comment count
  - Upvote/downvote visible and updates count
  - Tags clickable (future: filter/search)
  - Edit/delete buttons only for post owner

---

## 6. Inside Post

- **Steps**
  1. Click a post
  2. Add comment + send
- **Expected**
  - Comment appears immediately
  - Cancel button works
  - Comments show username, content, votes
  - OP sees edit/delete options

---

## 7. Comments

- **Expected**
  - Each comment has username, content, up/down votes, total score
  - Edit/delete only visible to comment owner
  - Layout consistent with post votes
  - **Reply system**: not implemented yet

---

## 8. Search / Filter

- **Steps**
  1. Use search bar (title, content, author)
- **Expected**
  - Returns matching posts
  - Empty query should be blocked

---

## 9. Permissions

- **Check**
  - Non-owners cannot edit/delete posts or comments (API should return 403)

---
