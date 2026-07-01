import Dashboard from './components/Dashboard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col">
        <Dashboard />
      </main>
      <footer className="w-full text-center py-6 text-xs text-gray-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-zinc-800 bg-white/30 dark:bg-zinc-950/20 backdrop-blur-md">
        <p>© 2026 Akuafo AI. Built for the Ghana AI Summit Hackathon. Supporting sustainable smallholder farming.</p>
      </footer>
    </div>
  );
}
