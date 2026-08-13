#!/usr/bin/env python3
"""Generate the full INK OF FATE noir scene pack via wdabuliu direct API.

Outputs go to public/scenes/. Style is locked to the test image: hand-painted
oil noir, amber tungsten lamp + magenta/cyan neon rim, painterly brushwork,
Tomer Hanuka × Sin City × Sailor Jerry. The studio scene is copied from the
already-approved /tmp/iof-style-test.png (no regen needed).

Usage:
  ~/miniconda3/bin/python3 gen_scenes.py
"""
import datetime, hashlib, hmac, json, os, shutil, ssl, sys, time
import urllib.parse, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "public", "scenes")

R2_ACCOUNT_ID = os.environ["ALTERU_R2_ACCOUNT_ID"]
R2_ACCESS_KEY = os.environ["ALTERU_R2_ACCESS_KEY_ID"]
R2_SECRET_KEY = os.environ["ALTERU_R2_SECRET_ACCESS_KEY"]
R2_BUCKET = "aigram"
R2_ENDPOINT = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
R2_PUBLIC = "https://images.aiwaves.tech"
API_URL = "http://aiservice.wdabuliu.com:8019/genl_image"
RATE_LIMIT_S = 30

_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE


def _sign(k, m): return hmac.new(k, m.encode(), hashlib.sha256).digest()


def upload_ref(path):
    with open(path, "rb") as f: data = f.read()
    obj = f"refs/iof-{int(time.time())}-{os.path.basename(path)}"
    host = f"{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    now = datetime.datetime.utcnow()
    amz = now.strftime("%Y%m%dT%H%M%SZ"); date = now.strftime("%Y%m%d")
    ct = "image/jpeg" if path.lower().endswith(("jpg","jpeg")) else "image/png"
    h = hashlib.sha256(data).hexdigest()
    canon_uri = "/" + R2_BUCKET + "/" + urllib.parse.quote(obj, safe="/")
    hdrs = f"content-type:{ct}\nhost:{host}\nx-amz-content-sha256:{h}\nx-amz-date:{amz}\n"
    signed = "content-type;host;x-amz-content-sha256;x-amz-date"
    canon = "\n".join(["PUT", canon_uri, "", hdrs, signed, h])
    scope = f"{date}/auto/s3/aws4_request"
    sts = "\n".join(["AWS4-HMAC-SHA256", amz, scope, hashlib.sha256(canon.encode()).hexdigest()])
    kd = _sign(("AWS4" + R2_SECRET_KEY).encode(), date)
    kr = _sign(kd, "auto"); ks = _sign(kr, "s3"); ksg = _sign(ks, "aws4_request")
    sig = hmac.new(ksg, sts.encode(), hashlib.sha256).hexdigest()
    auth = f"AWS4-HMAC-SHA256 Credential={R2_ACCESS_KEY}/{scope}, SignedHeaders={signed}, Signature={sig}"
    url = f"{R2_ENDPOINT}/{R2_BUCKET}/{urllib.parse.quote(obj, safe='/')}"
    req = urllib.request.Request(url, data=data, method="PUT", headers={
        "Content-Type": ct, "x-amz-content-sha256": h, "x-amz-date": amz,
        "Authorization": auth, "Content-Length": str(len(data)),
    })
    with urllib.request.urlopen(req, timeout=60) as r: r.read()
    return f"{R2_PUBLIC}/{obj}"


def call_api(ref_url, prompt, retries=6, wait_s=30):
    payload = json.dumps({"query": "", "params": {"url": ref_url, "prompt": prompt}}).encode()
    for attempt in range(retries):
        req = urllib.request.Request(API_URL, data=payload,
            headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=240) as r:
                res = json.loads(r.read())
        except Exception as e:
            print(f"  ✗ network {e}"); time.sleep(wait_s); continue
        code = res.get("code")
        if code == 200: return res["url"]
        if code in (429, 100):
            print(f"  ⏳ code={code} (retry in {wait_s}s)"); time.sleep(wait_s); continue
        print(f"  ✗ code={code} body={res}"); return None
    return None


def download(url, out_path):
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60, context=_SSL_CTX) as r:
        data = r.read()
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "wb") as f: f.write(data)
    print(f"  → {out_path} ({os.path.getsize(out_path)//1024} KB)")
    # Re-encode as JPEG to shrink (the API returns webp).
    try:
        img = Image.open(out_path).convert("RGB")
        jpg = os.path.splitext(out_path)[0] + ".jpg"
        img.save(jpg, "JPEG", quality=86)
        if jpg != out_path:
            os.remove(out_path)
        print(f"  → re-encoded {jpg} ({os.path.getsize(jpg)//1024} KB)")
    except Exception as e:
        print(f"  ⚠️  re-encode skipped: {e}")


# ─── Style suffix shared across all scenes ───────────────────────────────
STYLE = (
    " Style: cinematic noir illustration, hand-painted oil with visible "
    "painterly brushwork. Heavy chiaroscuro lighting — single warm amber "
    "tungsten lamp pooling from above, deep velvety shadows. Magenta-pink "
    "(#FF4F9D) and cyan (#2CE0FF) neon rim-light from off-screen left, "
    "spilling onto skin and smoke. Saturated jewel tones, slight 35mm film "
    "grain, subtle smoke haze. Vibe of Tomer Hanuka × Frank Miller's Sin "
    "City × 1950s Sailor Jerry flash-sheet painters. NO text, NO watermark, "
    "NO logo, NO banner."
)

# Anchor describing the artist so face stays consistent across reaction shots.
ARTIST_ANCHOR = (
    "Mid-50s American biker man, weathered leathery face, gray salt-and-"
    "pepper goatee and stubble, deep-set eyes, slight crow's-feet, prominent "
    "nose, RED bandana tied around the forehead (square fold, knot at the "
    "back), sleeveless black leather biker vest over a white undershirt, "
    "thick muscular arms covered in dense old-school traditional tattoos "
    "(anchors, swallows, panthers, roses, daggers, hearts), heavy silver "
    "rings on calloused fingers, cigarette in the corner of his mouth or "
    "in his hand. Always the same character."
)

SCENES = [
    # id                shape    prompt
    ("scene_booth",     (820, 1024),
     "Wet midnight street outside a small old tattoo parlor. The shop sits "
     "on a quiet rain-slicked sidewalk. Above the dark wooden door: a glowing "
     "vintage hand-painted neon sign frame (NO readable letters — pure pink "
     "and cyan neon tubing curving inside a steel rectangle). The doorway "
     "spills a warm amber tungsten glow onto the wet bricks below. Brick "
     "wall around the door, scuffed and old. A single yellow streetlamp "
     "halo at top-right. Empty street. Atmospheric drizzle. Vertical 4:5 "
     "composition, camera at eye-level across the street."
     + STYLE),

    ("scene_processing", (820, 1024),
     "Extreme close-up of the tattoo artist's calloused tattooed hands "
     "working a vintage tattoo gun against a forearm. The gun is matte black, "
     "needle vibrating (subtle motion blur on the tip), an aura of tiny "
     "sparks escaping the coil. Fresh black ink lines being drawn — thick "
     "Sailor-Jerry-style outline forming. The skin around the work is pink, "
     "shiny, freshly inked. A white paper towel and a tray of ink caps "
     "beside. Amber lamp pool from above lights the hands; deep shadow "
     "everywhere else; cyan and pink neon bleed from beyond frame. Vertical "
     "4:5 composition. Hands and tattoo gun fill the lower 2/3 of frame; "
     "background dissolves into dark parlor textures."
     + STYLE),

    ("artist_intense", (820, 1024),
     f"Tight head-and-shoulders portrait of the same tattoo artist. {ARTIST_ANCHOR} "
     "Expression: INTENSE LOCK-IN — head slightly tilted forward, eyes "
     "narrowed but locked directly on the viewer, lips parted just slightly, "
     "as if he's about to say something he already decided. A thin trail "
     "of cigarette smoke curls from below his chin. Amber lamp from above "
     "carves deep shadows into his cheekbones; cyan-pink rim-light hits "
     "the edge of his bandana and shoulders. Vertical 4:5 composition, "
     "face occupies center."
     + STYLE),

    ("artist_smirk", (820, 1024),
     f"Tight head-and-shoulders portrait of the same tattoo artist. {ARTIST_ANCHOR} "
     "Expression: KNOWING SATISFIED SMIRK — half of his mouth pulled up "
     "into a slow private smile, eyes crinkled with quiet amusement, brow "
     "relaxed but knowing. Cigarette in the corner of his lips, smoke "
     "drifting up to the right. He's seen this one before. Amber lamp "
     "from above, neon pink-cyan rim. Vertical 4:5 composition."
     + STYLE),

    ("artist_squint", (820, 1024),
     f"Tight head-and-shoulders portrait of the same tattoo artist. {ARTIST_ANCHOR} "
     "Expression: HEAVY CONCERNED SQUINT — both eyes narrowed almost shut, "
     "forehead furrowed in a single deep line, mouth a flat straight line. "
     "A look of grim pity, like he doesn't want to be the one to tell you "
     "this. Cigarette held just below his chin, ash long. Amber lamp from "
     "above, pink/cyan rim. Vertical 4:5 composition."
     + STYLE),

    ("artist_shrug", (820, 1024),
     f"Three-quarter portrait, slightly wider crop, of the same tattoo artist. "
     f"{ARTIST_ANCHOR} Expression: WHATEVER SHRUG — both shoulders raised, "
     "palms turned up at his sides showing tattooed forearms, head tilted "
     "to one side, mouth slightly open, eyebrows up — 'don't ask me, kid, "
     "I just read the receipts.' Cigarette dangling from his lip. Amber "
     "lamp from above, neon pink-cyan rim. Vertical 4:5 composition."
     + STYLE),
]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # The studio scene is the already-approved test image — copy in.
    studio_dst = os.path.join(OUT_DIR, "scene_studio.jpg")
    src_test = "/tmp/iof-style-test.png"
    if os.path.exists(src_test) and not os.path.exists(studio_dst):
        img = Image.open(src_test).convert("RGB")
        img.save(studio_dst, "JPEG", quality=88)
        print(f"[copy] {src_test} → {studio_dst} ({os.path.getsize(studio_dst)//1024} KB)")

    skip_existing = os.environ.get("SKIP_EXISTING", "1") != "0"
    jobs = []
    for sid, shape, prompt in SCENES:
        out_jpg = os.path.join(OUT_DIR, sid + ".jpg")
        if skip_existing and os.path.exists(out_jpg):
            print(f"[skip] {sid} (exists)")
            continue
        jobs.append((sid, shape, prompt, out_jpg))

    if not jobs:
        print("All scenes already generated. Set SKIP_EXISTING=0 to regen.")
        return

    print(f"\nGenerating {len(jobs)} scenes; est ~{len(jobs) * 90 // 60} min.\n")

    last_call = 0
    for i, (sid, shape, prompt, out_jpg) in enumerate(jobs, 1):
        print(f"\n[{i}/{len(jobs)}] {sid}")
        # 1. Build + upload ref for this aspect ratio (cached per shape).
        ref_path = f"/tmp/iof-blank-{shape[0]}x{shape[1]}.jpg"
        if not os.path.exists(ref_path):
            Image.new("RGB", shape, (12, 7, 8)).save(ref_path, quality=92)
        # Re-upload each time (R2 keeps each upload separate; the URL is unique).
        ref_url = upload_ref(ref_path)
        # 2. Rate-limit wait.
        wait = RATE_LIMIT_S - (time.time() - last_call)
        if wait > 0:
            print(f"  ⏳ rate-limit cool {wait:.0f}s")
            time.sleep(wait)
        # 3. Call API.
        t0 = time.time()
        last_call = time.time()
        url = call_api(ref_url, prompt)
        if not url:
            print(f"  ✗ gave up on {sid}")
            continue
        print(f"  api → {time.time()-t0:.1f}s   url={url}")
        # 4. Download.
        tmp_out = os.path.join(OUT_DIR, sid + ".webp")
        download(url, tmp_out)


if __name__ == "__main__":
    main()
