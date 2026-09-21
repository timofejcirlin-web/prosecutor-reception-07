from pathlib import Path
import sys
import mido
from mido import MidiFile, MidiTrack, Message, MetaMessage

if len(sys.argv) != 3:
    raise SystemExit("usage: make_synthwave.py input.mid output.mid")

src = Path(sys.argv[1])
out = Path(sys.argv[2])
mid = MidiFile(str(src))
mid.ticks_per_beat = max(96, mid.ticks_per_beat)

# Keep every melodic note from the supplied MIDI, but normalize the arrangement
# into a compact synthwave palette. Text/lyrics/meta markers are intentionally omitted.
new_tracks = []
first_note = 48
max_ticks = 0
for idx, old in enumerate(mid.tracks):
    track = MidiTrack()
    elapsed = 0
    for msg in old:
        elapsed += msg.time
        max_ticks = max(max_ticks, elapsed)
        if msg.is_meta:
            if msg.type in {"track_name", "time_signature", "key_signature", "set_tempo"}:
                if msg.type == "set_tempo":
                    # 102 BPM gives the source melody a steady retro pulse.
                    track.append(MetaMessage("set_tempo", tempo=mido.bpm2tempo(102), time=msg.time))
                else:
                    track.append(msg.copy(time=msg.time))
            continue
        if msg.type == "note_on" and msg.velocity > 0 and first_note == 48:
            first_note = msg.note
        if msg.type == "program_change":
            # Lead/pad/bass colors from the General MIDI soundfont.
            program = [80, 89, 38, 81, 90][idx % 5]
            track.append(msg.copy(program=program, time=msg.time))
        elif msg.type in {"note_on", "note_off", "control_change", "pitchwheel", "aftertouch", "polytouch"}:
            track.append(msg.copy(time=msg.time))
    if not any(m.type == "program_change" for m in track if not m.is_meta):
        channel = next((m.channel for m in track if hasattr(m, "channel")), 0)
        track.insert(0, Message("program_change", channel=channel, program=[80, 89, 38, 81, 90][idx % 5], time=0))
    new_tracks.append(track)

# Add a four-on-the-floor electronic drum layer.
drums = MidiTrack()
drums.append(MetaMessage("track_name", name="SYNTHWAVE DRUMS", time=0))
step = mid.ticks_per_beat // 2
beats = max(8, int(max_ticks / mid.ticks_per_beat) + 1)
for beat in range(beats):
    # kick on every quarter note, snare on beats 2 and 4, closed hat on eighths
    events = [(36, 100)]
    if beat % 4 in (1, 3):
        events.append((38, 82))
    for note, velocity in events:
        drums.append(Message("note_on", channel=9, note=note, velocity=velocity, time=0))
        drums.append(Message("note_off", channel=9, note=note, velocity=0, time=step // 3))
    drums.append(Message("note_on", channel=9, note=42, velocity=48, time=0))
    drums.append(Message("note_off", channel=9, note=42, velocity=0, time=step // 3))
    drums.append(Message("note_on", channel=9, note=42, velocity=42, time=step // 3))
    drums.append(Message("note_off", channel=9, note=42, velocity=0, time=step // 3))
new_tracks.append(drums)

# Add a restrained octave bass ostinato under the supplied melody.
bass = MidiTrack()
bass.append(MetaMessage("track_name", name="SYNTHWAVE BASS", time=0))
bass.append(Message("program_change", channel=0, program=38, time=0))
root = max(28, min(52, (first_note - 12) // 12 * 12 + 36))
for beat in range(beats):
    note = root if beat % 4 in (0, 2) else root + 7
    bass.append(Message("note_on", channel=0, note=note, velocity=72, time=0))
    bass.append(Message("note_off", channel=0, note=note, velocity=0, time=mid.ticks_per_beat - 18))
    bass.append(Message("note_on", channel=0, note=note + 12, velocity=40, time=18))
    bass.append(Message("note_off", channel=0, note=note + 12, velocity=0, time=0))
new_tracks.append(bass)

mid.tracks = new_tracks
mid.meta = getattr(mid, "meta", {})
out.parent.mkdir(parents=True, exist_ok=True)
mid.save(str(out))
print(out)
