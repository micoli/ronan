# Audio served through the SoundCloud widget, not self-hosted mp3

Node audio stays on SoundCloud and is played through a hidden Widget API iframe driven by our own controls. We accept that the audio stream is cross-origin: no real-time analyser, no reliable preloading of the next Node's audio, and playback must start from a Reader gesture (the Choice tap). The audio-reactive visual is therefore driven by SoundCloud's precomputed waveform data synced to playback position, with a generic pulse as fallback if that data is unavailable.

Self-hosting the mp3 files would allow a true Web Audio analyser and preloading, but costs hosting/bandwidth and the Story author already publishes on SoundCloud.

Spike (desktop Chrome, 2026-10-14) confirmed: `getCurrentSound` exposes `waveform_url` (JSON, 1800 samples, fetchable cross-origin), `PLAY_PROGRESS` reports position, and `load(url, { auto_play: true })` called from a click switches track and plays. iOS Safari not yet verified.

A discreet SoundCloud credit linking to the track stays visible in the UI.
