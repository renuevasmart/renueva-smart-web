#!/usr/bin/env python3
"""Avisa a IndexNow (Bing y otros buscadores) de las URLs de renuevasmart.com que han cambiado.

Solo usa la biblioteca estándar. Modos:
  indexnow.py --all                       todas las URLs del sitemap
  indexnow.py --since <ref>               las páginas cambiadas entre <ref> y HEAD (lo usa GitHub Actions)
  indexnow.py <url> [<url> ...]           URLs concretas
Añade --dry-run para ver qué se enviaría sin enviarlo.
"""
import argparse
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

HOST = "renuevasmart.com"
BASE = "https://%s/" % HOST
KEY = "c532445f189f3d84db79b678adf18054"  # pública por diseño: está en https://renuevasmart.com/<clave>.txt
ENDPOINT = "https://api.indexnow.org/indexnow"
ROOT = Path(__file__).resolve().parents[2]
# Carpetas y archivos del repo que no forman parte del sitio publicado
IGNORAR = ("Redes Sociales/", "Copy captación/", "pdf_work/", ".github/", "Landing/", "Wallapop/", "repo/", "repo_clone/")
EXTENSIONES = (".html", ".txt", ".md")


def urls_del_sitemap():
    xml = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    return re.findall(r"<loc>(.*?)</loc>", xml)


def url_de_archivo(ruta):
    """Ruta relativa del repo -> URL pública (o None si no es una página del sitio)."""
    if ruta.startswith(IGNORAR) or "/" in ruta and ruta.split("/")[0].startswith("."):
        return None
    if not ruta.endswith(EXTENSIONES) or ruta.startswith("404"):
        return None
    if ruta == KEY + ".txt":
        return None
    if ruta.endswith("index.html"):
        return BASE + ruta[: -len("index.html")]
    return BASE + ruta


def urls_cambiadas(desde):
    salida = subprocess.run(
        ["git", "-c", "core.quotepath=false", "diff", "--name-only", "--diff-filter=AM", desde, "HEAD"],
        cwd=ROOT, capture_output=True, text=True, encoding="utf-8",
    )
    if salida.returncode != 0:
        print("git diff falló (%s): se envían todas las URLs del sitemap" % salida.stderr.strip(), file=sys.stderr)
        return urls_del_sitemap()
    publicas = set(urls_del_sitemap()) | {BASE + "llms.txt", BASE + "pricing.md"}
    urls = []
    for ruta in salida.stdout.splitlines():
        u = url_de_archivo(ruta.strip())
        # solo páginas que el sitio publica de verdad (sitemap) o los archivos para IA
        if u and u in publicas and u not in urls:
            urls.append(u)
    return urls


def enviar(urls, dry_run):
    if not urls:
        print("Nada que enviar a IndexNow.")
        return 0
    print("%d URL(s) para IndexNow:" % len(urls))
    for u in urls:
        print("  " + u)
    if dry_run:
        print("(dry-run: no se envía nada)")
        return 0
    cuerpo = json.dumps({"host": HOST, "key": KEY, "keyLocation": BASE + KEY + ".txt", "urlList": urls}).encode("utf-8")
    req = urllib.request.Request(ENDPOINT, data=cuerpo, headers={"Content-Type": "application/json; charset=utf-8"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print("IndexNow respondió HTTP %d" % r.status)
            return 0 if r.status in (200, 202) else 1
    except urllib.error.HTTPError as e:
        print("IndexNow respondió HTTP %d: %s" % (e.code, e.read().decode("utf-8", "replace")[:200]), file=sys.stderr)
        return 1
    except urllib.error.URLError as e:
        print("No se pudo contactar con IndexNow: %s" % e.reason, file=sys.stderr)
        return 1


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("urls", nargs="*", help="URLs concretas a enviar")
    ap.add_argument("--all", action="store_true", help="todas las URLs del sitemap")
    ap.add_argument("--since", metavar="REF", help="páginas cambiadas entre REF y HEAD")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    if a.all:
        urls = urls_del_sitemap()
    elif a.since:
        # un push nuevo (before = 000…) o un ref inexistente: mejor enviar todo que nada
        urls = urls_del_sitemap() if set(a.since) == {"0"} else urls_cambiadas(a.since)
    elif a.urls:
        urls = [u for u in a.urls if u.startswith(BASE)]
    else:
        ap.error("indica --all, --since <ref> o una o más URLs")
    sys.exit(enviar(urls, a.dry_run))


if __name__ == "__main__":
    main()
