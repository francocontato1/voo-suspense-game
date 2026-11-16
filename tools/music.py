# Extrai notas selecionadas dos bancos FluidR3 GM (CC BY 3.0) e recomprime em MP3 mono
import re, base64, json, subprocess, sys, os, tempfile
SF = sys.argv[1]; OUT = sys.argv[2]
SEL = {
 'contrabass': (['E1','A1','D2','G2'], 6), 'cello': (['C2','F2','A2','D3','G3'], 6),
 'tremolo_strings': (['D2','A2','D3','A3','D4','A4','D5','A5','F5'], 5), 'string_ensemble_1': (['D2','A2','D3','F3','A3','D4','F4'], 6),
 'violin': (['A4','E5','A5','E6'], 4), 'pizzicato_strings': (['D2','A2','D3','F3','A3'], 1.5), 'choir_aahs': (['D3','A3','D4','F4'], 5),
 'acoustic_grand_piano': (['A0','D1','A1','D2','F2','A3','D4','Bb4','A5','F6'], 4), 'timpani': (['D2','A2'], 4), 'taiko_drum': (['G2','C3'], 2.5),
 'reverse_cymbal': (['C4'], 4), 'orchestra_hit': (['D3','A3'], 3), 'celesta': (['D5','F5','A5','C6','E6'], 3),
}
out = {}; total = 0
for inst, (notes, dur) in SEL.items():
    src = open(os.path.join(SF, inst + '.js')).read(); out[inst] = {}
    for n in notes:
        m = re.search(r'"%s":\s*"data:audio/mp3;base64,([^"]+)"' % n, src)
        if not m: print('missing', inst, n); continue
        with tempfile.TemporaryDirectory() as td:
            a = os.path.join(td, 'a.mp3'); b = os.path.join(td, 'b.mp3'); open(a, 'wb').write(base64.b64decode(m.group(1)))
            subprocess.run(['ffmpeg', '-v', 'error', '-i', a, '-t', str(dur), '-af', 'afade=t=out:st=%s:d=%s' % (dur * .7, dur * .3), '-ac', '1', '-ar', '32000', '-b:a', '56k', b], check=True)
            d = open(b, 'rb').read(); total += len(d); out[inst][n] = base64.b64encode(d).decode()
json.dump(out, open(OUT, 'w')); print('music bytes', total)
