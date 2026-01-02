# Deployment Checklist

## Before Every Deploy

- [ ] **Update version number** in `frontend/utils/constants.js`
  - Follow semantic versioning: `MAJOR.MINOR.PATCH`
  - Patch (x.x.1): Bug fixes, small changes
  - Minor (x.1.0): New features, backwards compatible
  - Major (1.0.0): Breaking changes

- [ ] Test the app locally
  - [ ] Dashboard works
  - [ ] Details tab works (add, edit, delete)
  - [ ] Settings backup/restore works
  - [ ] Mobile responsiveness verified

- [ ] Run linter: `npm run lint`

- [ ] Build succeeds: `npm run build`

- [ ] Commit with version in message: `git commit -m "Release v1.0.x"`

- [ ] Push to main: `git push origin main`

- [ ] Verify Vercel deployment

---

## Version History

- **v1.0.1** (Jan 2, 2026) - Initial release with version tracking
  - Added version number display in Settings
  - Fixed mobile delete button for Samsung devices
  - Improved event handling for daily entry rows

---

## Quick Commands

```bash
# Update version and deploy
# 1. Edit: frontend/utils/constants.js (change APP_VERSION)
# 2. Test: npm run dev
# 3. Commit: git add -A && git commit -m "Release vX.X.X"
# 4. Push: git push origin main
```

---

## Tips to Remember

1. **Set a phone reminder** before deploying: "Did you update the version?"
2. **Use git aliases** to create a deploy command that prompts you
3. **Add to PR template** if you use PRs
4. **Write it on a sticky note** on your desk for now 😊

