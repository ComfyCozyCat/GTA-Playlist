# GTA-Playlist 🌴

A Vice City–inspired, mobile-first **Grand Theft Auto VI radio soundtrack tracker** built as a simple Progressive Web App (PWA) using HTML, CSS and JavaScript.

Based on the browsing experience of [Popcorn-Tracker](https://github.com/ComfyCozyCat/Popcorn-Tracker), with **radio stations instead of years** and **songs instead of movie posters**.

## Interaction design

- Sunset purple / neon orange / coral palette with retro-nightlife aesthetics.
- Horizontal song-card rows grouped by station; collapsible rows and station navigation.
- Tap a song’s circular cover/like control to mark it **liked** or unliked.
- Tap its title/artist/info area for a detail view, including a Spotify link.
- Search by song, artist or station; filter to liked songs; random discovery.
- Save likes locally in this browser; export/import backup to move between devices.
- Installable PWA shell and mobile touch-friendly UI.

## Soundtrack sourcing

GTA VI launched on November 19, 2026. Independent launch-day sources list 20 music stations, 2 talk stations and a hidden station. Sources may disagree about counts or songs. **Some radio songs are reported by third-party guides, not individually confirmed in Rockstar credits**; each record can carry a verification status. The station catalog and songs are kept in `data/stations.json` rather than embedded in UI logic.

Spotify: verified direct URLs can be added as `spotifyUrl`; otherwise the app provides a Spotify **search link** with the song and artist pre-filled, and labels it accordingly. It does not impersonate verified deep links or stream copyrighted music.

References:
- [Rockstar official GTA VI music](https://www.rockstargames.com/VI/music)
- [KeenGamer launch-day station guide](https://www.keengamer.com/articles/guides/gta-6-all-radio-stations-and-full-soundtrack-list/)
- [GTA6Soundtrack reporting and source labels](https://gta6soundtrack.com/whats-new)
- [GTA6RadioList index](https://gta6radiolist.com/)

This is a fan-made personal music tracker, unaffiliated with Rockstar, Take-Two or Spotify.

## Run locally

Serve the directory over HTTP (modules/data fetch and service workers do not work reliably under `file://`):

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. GitHub Pages can serve the static files for free.

## GitHub Pages

In repository **Settings → Pages**, choose **Deploy from a branch**, `main`, and `/ (root)`. Once published, the address should be `https://comfycozycat.github.io/GTA-Playlist/`. Pages activation must be done in the GitHub interface if not enabled.

## Development checkpoints

- [x] Verify ownership and repository; make initial commit.
- [ ] Research station/song dataset and source labels.
- [ ] Build responsive station rows, oval song cards and navigation.
- [ ] Implement tap-to-like separate from tap-for-information.
- [ ] Implement detail view with Spotify links.
- [ ] Add search, filters, random discovery and likes backup.
- [ ] Implement PWA, accessibility and theme polish.
- [ ] Run validation, publish via Pages and maintain project notes.

See `PROJECT_PLAN.md` for subsequent milestones and limitations.
