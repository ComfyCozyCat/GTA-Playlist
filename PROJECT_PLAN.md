# GTA-Playlist — development checkpoints

Last updated: November 19, 2026.

## Scope

Make a separate, mobile-first GTA VI soundtrack PWA inspired by Popcorn-Tracker. Sections are radio stations instead of years; each track is an oval, horizontally oriented card instead of a movie poster. Circular art control likes/unlikes a song; its title/artist area opens metadata details. Use Leonida sunset purple, neon pink and orange.

## Checkpoint status

- [x] Confirm GitHub write access and create an initial commit in `ComfyCozyCat/GTA-Playlist`.
- [x] Compile a sourced launch-day station catalog: 23 entries, 249 **third-party reported** music tracks, 2 talk stations and a hidden nightclub station. *Important: not yet individually verified with Rockstar game credits.*
- [x] Implement station chips, horizontal song strips and collapse/expand behavior.
- [x] Implement responsive oval song cards with circular like controls, persistent state and detail overlay.
- [x] Add Spotify search links. **Direct per-song Spotify track IDs are not verified or populated yet.**
- [x] Add search by title/artist/station, liked-only filter, sorting, random song and JSON backup/import.
- [x] Apply Vice City purple/orange/pink theme and PWA configuration.
- [ ] Validate using a real browser (desktop + Android), particularly mobile overflow, data loading, focus management and PWA installation.
- [ ] Verify each individual reported track against in-game credits or official sources, correct discrepancies and document exclusions.
- [ ] Resolve each verified track's Spotify URL, album metadata, year and album art via permitted sources/APIs; replace the record-style placeholder discs.
- [ ] Enable GitHub Pages in repo Settings → Pages, then verify deployed site.

## Design decisions

The original Popcorn-Tracker is written with plain HTML/CSS/JS and uses a manifest and service worker; this project follows that lightweight architecture. Song likes use localStorage and JSON export/import; cloud synchronization is not included.

No Spotify login or playback is implemented: the app links to Spotify searches for the song. This avoids pretending every track is already resolved to a specific ID and avoids licensing headaches.

Station/track source: https://www.keengamer.com/articles/guides/gta-6-all-radio-stations-and-full-soundtrack-list/
Cross-reference: https://gta6soundtrack.com/ and https://www.rockstargames.com/VI/music

## Follow-up milestones

1. Confirm real track versions, cover art, album release dates, direct Spotify URLs.
2. Audit every mobile interaction in Android Chrome and PWA install mode.
3. Optional Spotify Web API client for previews/metadata, respecting terms, authentication and limits.
4. Optional device sync of liked tracks, if requested.
