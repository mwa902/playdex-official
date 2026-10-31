"""
Seed booking slots for all 135 Lahore venues.
Date range: 30 Oct 2026 → 30 Nov 2026 (32 days)
3 slots per day per venue: morning / afternoon / evening
Price: PKR 2500 each
"""

import subprocess
from datetime import date, timedelta

# ─── Config ───────────────────────────────────────────────────────────────────
DB = "postgresql://wahad:1234@localhost:5432/sports_management_database"
ORG_ID = "00000000-0000-0000-0000-000000000001"
PRICE  = 2500

# event_type_id → name (from DB)
EVENT_TYPES = {
    "Cricket":      "0371039d-7347-4d10-8910-f4c5ef712dff",
    "Futsal":       "96033eaf-f1fe-4c9d-99d6-15785a64e1ba",
    "Football":     "13df61aa-892c-4275-8d6c-b7a04b8fccce",
    "Padel":        "140e63b4-d06d-4c6c-9c09-a6c2173429e8",
    "Badminton":    "2b3bbe09-30cd-43a9-ae3e-6b390bbf0ded",
    "Squash":       "e9f2b798-bdd6-404c-95e1-070b3072f584",
    "Tennis":       "5a77f4b1-bda7-4a3e-b8f0-8c2c94278c31",
    "Swimming":     "ef49ce1b-3749-452a-8fdc-376a1b0de4ce",
    "Gym Session":  "fce2a8db-fc66-4670-8c0c-2dfea0208d00",
    "CrossFit":     "f96159a1-6df4-4a1e-b1fa-376f23acef38",
    "Basketball":   "a09fccd6-18ee-4b1d-b8da-c018c1622568",
    "Volleyball":   "a6e13a2e-2a72-49ca-ab03-13a2dccaa18d",
    "Table Tennis": "83d6bf47-be9b-4d9e-b3d5-4a40e45a42be",
    "Snooker":      "ea4af593-24b9-4320-a18f-cfafc475b414",
    "Karting":      "d1e8d1b3-d97b-4702-8953-09a231fddb0a",
    "Multi-Sport":  "8b4d4ed1-b162-4cf6-a54d-3683d22df013",
}

# Which event type to use per venue sport_type
SPORT_TYPE_MAP = {
    "Arena": "Cricket",      # default for arenas
    "Gym":   "Gym Session",
    "Pool":  "Swimming",
}

# Daily time slots: (start_hour, end_hour, label)
TIME_SLOTS = [
    (9,  11, "Morning"),
    (13, 15, "Afternoon"),
    (18, 20, "Evening"),
]

# Date range
START = date(2026, 10, 30)
END   = date(2026, 11, 30)

def run(sql):
    import tempfile, os
    with tempfile.NamedTemporaryFile(mode='w', suffix='.sql', delete=False) as f:
        f.write(sql)
        fname = f.name
    result = subprocess.run(
        ["psql", DB, "-f", fname],
        capture_output=True, text=True
    )
    os.unlink(fname)
    if result.returncode != 0:
        print("ERROR:", result.stderr[:200])
    return result.stdout

# ─── Fetch venues ──────────────────────────────────────────────────────────────
raw = subprocess.run(
    ["psql", DB, "-t", "-A", "-F", "|",
     "-c", "SELECT id, name, sport_type, capacity FROM venue ORDER BY name"],
    capture_output=True, text=True
).stdout.strip()

venues = []
for line in raw.splitlines():
    parts = line.strip().split("|")
    if len(parts) == 4:
        venues.append({
            "id": parts[0],
            "name": parts[1],
            "sport_type": parts[2],
            "capacity": int(parts[3]) if parts[3].isdigit() else 20,
        })

print(f"Found {len(venues)} venues")

# ─── Generate INSERT statements ───────────────────────────────────────────────
all_values = []

current = START
while current <= END:
    for v in venues:
        etype_name = SPORT_TYPE_MAP.get(v["sport_type"], "Multi-Sport")
        etype_id   = EVENT_TYPES[etype_name]
        cap        = min(v["capacity"], 50)  # cap at 50 per slot

        for (sh, eh, label) in TIME_SLOTS:
            slot_name = f"{label} {etype_name} — {v['name'][:40]}"
            started   = f"{current}T{sh:02d}:00:00"
            ended     = f"{current}T{eh:02d}:00:00"
            val = (
                f"('{ORG_ID}', '{v['id']}', '{etype_id}', "
                f"$${slot_name}$$, "
                f"'Available session — cash or online transfer on arrival', "
                f"'{started}', '{ended}', {cap}, 'Available', {PRICE})"
            )
            all_values.append(val)

    current += timedelta(days=1)

print(f"Total slots to insert: {len(all_values)}")

# ─── Insert in batches of 500 ─────────────────────────────────────────────────
BATCH = 500
inserted = 0
for i in range(0, len(all_values), BATCH):
    batch = all_values[i:i+BATCH]
    sql = f"""
INSERT INTO events (organization_id, venue_id, event_type_id, name, description,
                    started_at, ended_at, capacity, status, price)
VALUES
{','.join(batch)}
ON CONFLICT DO NOTHING;
"""
    out = run(sql)
    if "INSERT" in out:
        n = int(out.strip().split()[-1])
        inserted += n
        print(f"  Batch {i//BATCH + 1}: inserted {n}")
    else:
        print(f"  Batch {i//BATCH + 1}: {out.strip()[:80]}")

print(f"\nDone. Total inserted: {inserted}")
