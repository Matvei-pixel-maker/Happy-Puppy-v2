import json, struct, sys
import numpy as np

BASE = r"C:\Users\matve\OneDrive\Desktop\happy-puppy-v2\happy-puppy-v2\public\models"

with open(BASE + r"\cup.gltf", "r", encoding="utf-8") as f:
    g = json.load(f)

with open(BASE + r"\scene.bin", "rb") as f:
    bin_data = f.read()

CTYPE = {5120: ("b", 1), 5121: ("B", 1), 5122: ("h", 2), 5123: ("H", 2), 5125: ("I", 4), 5126: ("f", 4)}
NCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


def read_accessor(idx):
    acc = g["accessors"][idx]
    bv = g["bufferViews"][acc["bufferView"]]
    fmt, size = CTYPE[acc["componentType"]]
    ncomp = NCOMP[acc["type"]]
    count = acc["count"]
    base = bv.get("byteOffset", 0) + acc.get("byteOffset", 0)
    stride = bv.get("byteStride", 0) or (size * ncomp)
    out = np.zeros((count, ncomp), dtype=np.float64)
    for i in range(count):
        off = base + i * stride
        vals = struct.unpack_from("<" + fmt * ncomp, bin_data, off)
        out[i] = vals
    return out


prim = g["meshes"][0]["primitives"][0]
POS = read_accessor(prim["attributes"]["POSITION"])
IDX = read_accessor(prim["indices"]).astype(np.int64).ravel()

print("nodes:", [(i, n.get("name"), n.get("mesh"), n.get("children")) for i, n in enumerate(g["nodes"])])
print("meshes:", [(i, m.get("name"), len(m["primitives"])) for i, m in enumerate(g["meshes"])])
print("vertices:", POS.shape, "indices:", IDX.shape[0], "tris:", IDX.shape[0] // 3)
print("POS min:", POS.min(axis=0), "max:", POS.max(axis=0))

n = POS.shape[0]
parent = np.arange(n, dtype=np.int64)


def find(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]
        a = parent[a]
    return a


tris = IDX.reshape(-1, 3)
for a, b, c in tris:
    ra, rb, rc = find(a), find(b), find(c)
    if ra != rb:
        parent[rb] = ra
    ra, rc2 = find(a), find(c)
    if ra != rc2:
        parent[rc2] = ra

roots = np.array([find(i) for i in range(n)])
uniq, counts = np.unique(roots, return_counts=True)

comps = []
for r, cnt in zip(uniq, counts):
    mask = roots == r
    pts = POS[mask]
    mn, mx = pts.min(axis=0), pts.max(axis=0)
    comps.append(
        {
            "root": int(r),
            "count": int(cnt),
            "min": mn,
            "max": mx,
            "center": (mn + mx) / 2.0,
            "size": mx - mn,
        }
    )

comps.sort(key=lambda c: -c["count"])
print("\n=== connected components:", len(comps), "===")
for c in comps:
    print(
        f"n={c['count']:6d}  center=({c['center'][0]:+.4f},{c['center'][1]:+.4f},{c['center'][2]:+.4f})"
        f"  size=({c['size'][0]:.4f},{c['size'][1]:.4f},{c['size'][2]:.4f})"
    )

# cluster components into cups: single-linkage on bounding box gap
# distance between boxes (0 when touching/overlapping)
def box_gap(a, b):
    d = np.maximum(0.0, np.maximum(a["min"] - b["max"], b["min"] - a["max"]))
    return float(np.linalg.norm(d))


M = len(comps)
cparent = list(range(M))


def cfind(a):
    while cparent[a] != a:
        cparent[a] = cparent[cparent[a]]
        a = cparent[a]
    return a


THRESH = 0.02
for i in range(M):
    for j in range(i + 1, M):
        if box_gap(comps[i], comps[j]) <= THRESH:
            ri, rj = cfind(i), cfind(j)
            if ri != rj:
                cparent[rj] = ri

groups = {}
for i in range(M):
    groups.setdefault(cfind(i), []).append(i)

print("\n=== merged clusters (gap <= %.3f): %d ===" % (THRESH, len(groups)))
for gi, (root, idxs) in enumerate(
    sorted(groups.items(), key=lambda kv: -sum(comps[i]["count"] for i in kv[1]))
):
    allmin = np.min([comps[i]["min"] for i in idxs], axis=0)
    allmax = np.max([comps[i]["max"] for i in idxs], axis=0)
    tot = sum(comps[i]["count"] for i in idxs)
    ctr = (allmin + allmax) / 2.0
    sz = allmax - allmin
    print(
        f"cup#{gi}: parts={len(idxs):2d} verts={tot:6d} center=({ctr[0]:+.4f},{ctr[1]:+.4f},{ctr[2]:+.4f})"
        f" size=({sz[0]:.4f},{sz[1]:.4f},{sz[2]:.4f}) min={np.round(allmin,4)} max={np.round(allmax,4)}"
    )
