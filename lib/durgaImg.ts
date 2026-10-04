/** public/ में durga.png / .jpg / .webp रखो — वही असली फ़ोटो intro और हीरो में दिखेगी। */
export function findDurgaImg(): Promise<string | null> {
  const w = window as unknown as { __durgaP?: Promise<string | null> };
  if (w.__durgaP) return w.__durgaP;
  w.__durgaP = (async () => {
    const small = window.innerWidth <= 768 ? ["/durga-sm.webp"] : [];
    for (const f of [...small, "/durga.webp", "/durga.png", "/durga.jpg", "/durga.jpeg"]) {
      const ok = await new Promise<boolean>((r) => {
        const i = new Image();
        i.onload = () => r(true);
        i.onerror = () => r(false);
        i.src = f;
      });
      if (ok) return f;
    }
    return null;
  })();
  return w.__durgaP;
}
