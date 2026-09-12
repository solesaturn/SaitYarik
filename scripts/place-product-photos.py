"""Extract Laitys product photos and map them to catalog SKUs."""
from __future__ import annotations

import json
import os
import re
import shutil
import sys
import zipfile
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(r"D:\SaitYarik")
ZIP_PATH = Path(r"c:\Users\skari\Downloads\Laitys_185_фото_PNG_прозрачный_фон.zip")
OUT = ROOT / "public" / "images"
CATALOG_PATH = ROOT / "data" / "catalog.json"
MAP_PATH = ROOT / "data" / "image_map.json"

SKU_RE = re.compile(r"^([A-Z0-9-]+)\b")
IMG_RE = re.compile(r"IMG_(\d+)", re.I)


def zip_name(info: zipfile.ZipInfo) -> str:
    name = info.filename
    if not (info.flag_bits & 0x800):
        try:
            name = info.filename.encode("cp437").decode("cp866")
        except Exception:
            pass
    return name.replace("\\", "/")


def analyze(path: Path) -> dict:
    im = Image.open(path).convert("RGB")
    im.thumbnail((700, 700))
    w, h = im.size
    gray = im.convert("L")
    pix = list(gray.get_flattened_data())
    n = len(pix)
    occ = 1 - sum(1 for p in pix if p < 18) / n
    edges = gray.filter(ImageFilter.FIND_EDGES)
    epix = list(edges.get_flattened_data())
    edge_vals = [e for p, e in zip(pix, epix) if p > 18]
    edge = (sum(edge_vals) / len(edge_vals) / 255) if edge_vals else 0
    ys = [y for y in range(h) for x in range(w) if pix[y * w + x] > 18]
    cy = (sum(ys) / len(ys) / h) if ys else 0.5
    mask = gray.point(lambda p: 255 if p > 18 else 0)
    bbox = mask.getbbox()
    aspect = (bbox[2] - bbox[0]) / (bbox[3] - bbox[1]) if bbox else 1.0
    is_side = occ < 0.09 or aspect < 0.62
    is_back = (not is_side) and edge > 0.045
    return {
        "occ": occ,
        "edge": edge,
        "cy": cy,
        "aspect": aspect,
        "is_back": is_back,
        "is_side": is_side,
        "size": path.stat().st_size,
    }


def is_frame(sku: str) -> bool:
    return len(sku) >= 2 and sku[0] == "P" and sku[1].isdigit()


def pick_primary(sku: str, analyzed: list) -> tuple:
    if is_frame(sku):
        land = [x for x in analyzed if x[2]["aspect"] >= 1.15]
        pool = land or analyzed
        return max(pool, key=lambda x: x[2]["occ"])
    cands = [x for x in analyzed if not x[2]["is_side"]]
    if not cands:
        cands = analyzed
    return min(
        cands,
        key=lambda x: (round(x[2]["edge"], 2), -x[2]["occ"], abs(x[2]["cy"] - 0.5)),
    )


def primary_score(sku: str, feat: dict) -> float:
    if is_frame(sku):
        score = feat["occ"] * 60
        if feat["aspect"] >= 1.15:
            score += 20
        return score
    score = -round(feat["edge"], 2) * 100 + feat["occ"] * 10
    if feat["is_side"]:
        score -= 40
    return score


def gallery_rank(sku: str, feat: dict) -> tuple:
    return (
        0 if not feat["is_back"] and not feat["is_side"] else 1 if feat["is_side"] else 2,
        -primary_score(sku, feat),
    )


def main() -> None:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    catalog_skus = {item["sku"] for item in catalog}

    z = zipfile.ZipFile(ZIP_PATH)
    grouped: dict[str, list[tuple[str, zipfile.ZipInfo]]] = {}
    extras: dict[str, list[tuple[str, zipfile.ZipInfo]]] = {}
    common: list[tuple[str, zipfile.ZipInfo]] = []

    for info in z.infolist():
        if info.is_dir():
            continue
        name = zip_name(info)
        if not name.lower().endswith(".png"):
            continue
        folder = name.split("/")[0]
        base = os.path.basename(name)
        if folder.startswith("Общие фото"):
            common.append((base, info))
            continue
        m = SKU_RE.match(folder.replace("—", " ").replace("–", " "))
        sku = m.group(1) if m else ""
        if sku in catalog_skus:
            grouped.setdefault(sku, []).append((base, info))
        else:
            key = sku if sku.startswith("L-") else folder
            extras.setdefault(key, []).append((base, info))

    products_dir = OUT / "products"
    if products_dir.exists():
        shutil.rmtree(products_dir)
    products_dir.mkdir(parents=True)

    image_map: dict[str, str] = {}
    chosen: list[str] = []

    for item in catalog:
        sku = item["sku"]
        files = grouped.get(sku, [])
        if not files:
            print("MISSING", sku)
            continue
        tmp = ROOT / ".tmp_photos" / sku
        tmp.mkdir(parents=True, exist_ok=True)
        analyzed = []
        for base, info in files:
            dest = tmp / base
            if not dest.exists():
                dest.write_bytes(z.read(info))
            feat = analyze(dest)
            analyzed.append((base, dest, feat, info))

        analyzed.sort(key=lambda x: -primary_score(sku, x[2]))
        primary = pick_primary(sku, analyzed)
        rest = [x for x in analyzed if x[0] != primary[0]]
        rest.sort(key=lambda x: gallery_rank(sku, x[2]))
        ordered = [primary] + rest

        sku_dir = products_dir / sku
        sku_dir.mkdir(parents=True, exist_ok=True)
        urls = []
        for i, (base, dest, feat, info) in enumerate(ordered, start=1):
            out_name = f"{i:02d}.png"
            shutil.copyfile(dest, sku_dir / out_name)
            urls.append(f"/images/products/{sku}/{out_name}")
        item["imageUrl"] = urls[0]
        item["images"] = urls
        image_map[sku] = urls[0]
        kind = "BACK-only" if primary[2]["is_back"] else "side" if primary[2]["is_side"] else "front"
        chosen.append(
            f"{sku:10} {kind:10} {primary[0]} occ={primary[2]['occ']:.2f} edge={primary[2]['edge']:.3f} n={len(urls)}"
        )

    common_dir = OUT / "common"
    if common_dir.exists():
        shutil.rmtree(common_dir)
    common_dir.mkdir(parents=True)
    common_sorted = sorted(common, key=lambda x: x[0])
    for i, (base, info) in enumerate(common_sorted, start=1):
        (common_dir / f"{i:02d}.png").write_bytes(z.read(info))

    kits_dir = OUT / "kits"
    if kits_dir.exists():
        shutil.rmtree(kits_dir)
    kits_dir.mkdir(parents=True)
    for key, files in extras.items():
        safe = re.sub(r"[^A-Z0-9-]+", "-", key, flags=re.I).strip("-") or "other"
        kdir = kits_dir / safe
        kdir.mkdir(parents=True, exist_ok=True)
        files = sorted(files, key=lambda x: x[0])
        for i, (base, info) in enumerate(files, start=1):
            (kdir / f"{i:02d}.png").write_bytes(z.read(info))

    CATALOG_PATH.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    MAP_PATH.write_text(json.dumps(image_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("CATALOG", len(catalog_skus), "MAPPED", len(image_map))
    print("COMMON", len(common_sorted), "EXTRA_GROUPS", len(extras))
    print("--- primary ---")
    print("\n".join(chosen))
    missing = catalog_skus - set(image_map)
    if missing:
        print("MISSING SKUS", missing)
        sys.exit(1)


if __name__ == "__main__":
    main()
