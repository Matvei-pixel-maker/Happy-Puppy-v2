import json, struct
import numpy as np

BASE = r"C:\Users\matve\OneDrive\Desktop\happy-puppy-v2\happy-puppy-v2\public\models"
OUT = r"C:\Users\matve\OneDrive\Desktop\happy-puppy-v2\happy-puppy-v2\src\data\cups6.json"

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
    out = np.zeros((count, ncomp), dtype=np.float32)
    for i in range(count):
        off = base + i * stride
        out[i] = struct.unpack_from("<" + fmt * ncomp, bin_data, off)
    return out


prim = g["meshes"][0]["primitives"][0]
POS = read_accessor(prim["attributes"]["POSITION"])
NOR = read_accessor(prim["attributes"]["NORMAL"])
UV = read_accessor(prim["attributes"]["TEXCOORD_0"])
IDX = read_accessor(prim["indices"]).astype(np.int64).ravel()

n = POS.shape[0]

# Union-Find on vertices via shared triangles
parent = np.arange(n, dtype=np.int64)


def find(a):
    while parent[a] != a:
        parent[a] = parent[parent[a]]
        a = parent[a]
    return a


def union(a, b):
    ra, rb = find(a), find(b)
    if ra != rb:
        parent[rb] = ra


tris = IDX.reshape(-1, 3)
for a, b, c in tris:
    union(a, b)
    union(b, c)
    union(a, c)

roots = np.array([find(i) for i in range(n)])
uniq_roots = np.unique(roots)

# Connected components
comps = []
for r in uniq_roots:
    mask = roots == r
    pts = POS[mask]
    mn = pts.min(axis=0)
    mx = pts.max(axis=0)
    ctr = (mn + mx) / 2
    comps.append({
        "root": int(r),
        "verts": int(mask.sum()),
        "center": ctr,
        "min": mn,
        "max": mx,
        "vertex_indices": np.where(mask)[0],
    })

print(f"Connected components: {len(comps)}")

# Cluster components by XZ coordinates only (ignore Y since cups are vertical)
centers_xz = np.array([[c["center"][0], c["center"][2]] for c in comps])


def kmeans_xz(X, k, iters=300, seed=42):
    rng = np.random.RandomState(seed)
    idx = rng.choice(len(X), k, replace=False)
    centroids = X[idx].copy()
    for _ in range(iters):
        d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
        labels = d.argmin(axis=1)
        new_c = np.array([X[labels == j].mean(axis=0) if np.any(labels == j) else centroids[j] for j in range(k)])
        if np.allclose(new_c, centroids):
            break
        centroids = new_c
    d = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
    labels = d.argmin(axis=1)
    return labels, centroids


labels, centroids = kmeans_xz(centers_xz, 6)

# Sort clusters by center X
cluster_centers_x = centroids[:, 0]
order = np.argsort(cluster_centers_x)
label_map = np.zeros(6, dtype=np.int64)
for new_idx, old_idx in enumerate(order):
    label_map[old_idx] = new_idx
labels = label_map[labels]

print("\n6 cup clusters (XZ k-means, sorted by center X):")
for cup_id in range(6):
    mask = labels == cup_id
    comp_indices = np.where(mask)[0]
    total_verts = sum(comps[i]["verts"] for i in comp_indices)
    all_pts = POS[np.concatenate([comps[i]["vertex_indices"] for i in comp_indices])]
    mn = all_pts.min(axis=0)
    mx = all_pts.max(axis=0)
    ctr = (mn + mx) / 2
    print(f"  cup{cup_id}: components={len(comp_indices)} verts={total_verts} "
          f"center=({ctr[0]:+.4f},{ctr[1]:+.4f},{ctr[2]:+.4f}) "
          f"size=({(mx-mn)[0]:.4f},{(mx-mn)[1]:.4f},{(mx-mn)[2]:.4f})")

# Build per-cup data
vertex_to_cup = np.full(n, -1, dtype=np.int64)
for cup_id in range(6):
    mask = labels == cup_id
    comp_indices = np.where(mask)[0]
    all_vert_indices = np.concatenate([comps[i]["vertex_indices"] for i in comp_indices])
    vertex_to_cup[all_vert_indices] = cup_id

cups = []
for cup_id in range(6):
    mask = labels == cup_id
    comp_indices = np.where(mask)[0]
    
    # Pure triangles: all 3 vertices belong to this cup
    tri_cup_labels = vertex_to_cup[tris]
    pure_mask = np.all(tri_cup_labels == cup_id, axis=1)
    cup_tris = tris[pure_mask]
    
    # Remap vertices
    used_verts = np.unique(cup_tris.ravel())
    vmap = {int(v): i for i, v in enumerate(used_verts)}
    local_indices = np.array([vmap[int(v)] for v in cup_tris.ravel()], dtype=np.uint32).reshape(-1, 3)
    
    cup_pos = POS[used_verts].astype(np.float32)
    cup_nor = NOR[used_verts].astype(np.float32)
    cup_uv = UV[used_verts].astype(np.float32)
    
    # Center geometry
    mn = cup_pos.min(axis=0)
    mx = cup_pos.max(axis=0)
    center = (mn + mx) / 2
    cup_pos_centered = cup_pos - center
    
    cups.append({
        "cup_id": cup_id,
        "component_count": int(len(comp_indices)),
        "vertex_count": int(len(used_verts)),
        "triangle_count": int(len(cup_tris)),
        "positions": cup_pos_centered.astype(np.float64).flatten().tolist(),
        "normals": cup_nor.astype(np.float64).flatten().tolist(),
        "uvs": cup_uv.astype(np.float64).flatten().tolist(),
        "indices": local_indices.flatten().tolist(),
        "center": center.astype(np.float64).tolist(),
        "size": (mx - mn).astype(np.float64).tolist(),
    })

# Sort by center X
cups.sort(key=lambda c: c["center"][0])

with open(OUT, "w", encoding="utf-8") as f:
    json.dump({"cups": cups}, f)

print(f"\nSaved {len(cups)} cups to {OUT}")
for c in cups:
    print(f"  cup {c['cup_id']}: comps={c['component_count']} verts={c['vertex_count']} tris={c['triangle_count']} "
          f"center=({c['center'][0]:+.4f},{c['center'][1]:+.4f},{c['center'][2]:+.4f}) "
          f"size=({c['size'][0]:.4f},{c['size'][1]:.4f},{c['size'][2]:.4f})")
