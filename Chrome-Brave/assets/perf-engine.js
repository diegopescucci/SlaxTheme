// Slax Performance & PC Spec Optimizer
(function() {
    const PRESETS = {
        eco: {
            name: "Eco / PC Debole",
            bodyClass: "perf-eco",
            desc: "Massima reattività (60 FPS stabili). Rimuove sfocature GPU (backdrop-filter) ed effetti shader pesanti.",
            apply(state) {
                document.body.classList.remove('perf-balanced', 'perf-ultra');
                document.body.classList.add('perf-eco');
                const polarCanvas = document.getElementById('dashboard-polar-canvas');
                if (polarCanvas) polarCanvas.style.display = 'none';
                const aura = document.getElementById('aura-cursor');
                if (aura) aura.style.display = 'none';
                const dot = document.getElementById('cursor-dot');
                const ring = document.getElementById('cursor-ring');
                if (dot) dot.style.display = 'none';
                if (ring) ring.style.display = 'none';
                const palette = document.getElementById('dashboard-music-palette');
                if (palette) palette.style.display = 'none';
            }
        },
        balanced: {
            name: "Bilanciato",
            bodyClass: "perf-balanced",
            desc: "Ottimo equilibrio per computer portatili standard con grafica integrata recente.",
            apply(state) {
                document.body.classList.remove('perf-eco', 'perf-ultra');
                document.body.classList.add('perf-balanced');
                const polarCanvas = document.getElementById('dashboard-polar-canvas');
                if (polarCanvas) polarCanvas.style.display = 'none';
                const aura = document.getElementById('aura-cursor');
                if (aura) aura.style.display = 'none';
                const dot = document.getElementById('cursor-dot');
                const ring = document.getElementById('cursor-ring');
                if (dot) dot.style.display = '';
                if (ring) ring.style.display = '';
                const palette = document.getElementById('dashboard-music-palette');
                if (palette) palette.style.display = '';
            }
        },
        ultra: {
            name: "Grafica Alta (PC Gaming / GPU)",
            bodyClass: "perf-ultra",
            desc: "Tutti gli effetti attivi: shader dinamici, blur ad alta definizione e tracciamento aura.",
            apply(state) {
                document.body.classList.remove('perf-eco', 'perf-balanced');
                document.body.classList.add('perf-ultra');
                const polarCanvas = document.getElementById('dashboard-polar-canvas');
                if (polarCanvas) polarCanvas.style.display = '';
                const aura = document.getElementById('aura-cursor');
                if (aura) aura.style.display = '';
                const dot = document.getElementById('cursor-dot');
                const ring = document.getElementById('cursor-ring');
                if (dot) dot.style.display = '';
                if (ring) ring.style.display = '';
                const palette = document.getElementById('dashboard-music-palette');
                if (palette) palette.style.display = '';
            }
        }
    };

    function getSavedPreset() {
        try {
            return localStorage.getItem('slax_perf_preset') || 'balanced';
        } catch(e) {
            return 'balanced';
        }
    }

    function setPreset(presetKey) {
        if (!PRESETS[presetKey]) presetKey = 'balanced';
        try {
            localStorage.setItem('slax_perf_preset', presetKey);
        } catch(e) {}
        
        PRESETS[presetKey].apply();

        // Aggiorna bottoni UI
        document.querySelectorAll('.preset-perf-btn').forEach(btn => {
            const isMatch = btn.dataset.preset === presetKey;
            btn.classList.toggle('border-emerald-400', isMatch);
            btn.classList.toggle('bg-emerald-500/20', isMatch);
            btn.classList.toggle('text-white', isMatch);
            btn.classList.toggle('border-white/10', !isMatch);
            btn.classList.toggle('bg-white/5', !isMatch);
        });

        const statusEl = document.getElementById('perf-preset-desc');
        if (statusEl) {
            statusEl.textContent = PRESETS[presetKey].desc;
        }
    }

    // Applica subito all'avvio prima del render
    const current = getSavedPreset();
    PRESETS[current].apply();

    // Inizializza pulsanti al caricamento del DOM
    function initPerfUI() {
        const currentPreset = getSavedPreset();
        setPreset(currentPreset);

        document.querySelectorAll('.preset-perf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setPreset(btn.dataset.preset);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPerfUI);
    } else {
        initPerfUI();
    }
})();
