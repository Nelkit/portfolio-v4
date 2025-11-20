export default function BlogPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-6 py-24">
      <div className="max-w-3xl text-center space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">Blog</p>
        <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Thoughts in Progress
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          Estoy preparando historias sobre ingeniería de software, integración de inteligencia artificial en productos y lecciones al construir ecosistemas móviles y de datos. Vuelve pronto para leer la primera entrega.
        </p>
      </div>
    </main>
  );
}

