import Navbar from "@/app/components/Navbar";
import { Logo } from "@/app/components/Navbar";
import Link from "next/link";

export default function ConhecaPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <Navbar />
      <section className="bg-[#0f2d4a] py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-4">Conheça o Rotina Clínica</h1>
          <p className="text-[#9ec4de] text-lg">
            Em breve, você vai conhecer nossa história, missão e a equipe por trás do Rotina Clínica.
          </p>
        </div>
      </section>
      <footer className="bg-[#0f2d4a] text-white mt-20">
        <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between">
          <Logo variant="light" />
          <p className="text-xs text-[#5a8caa]">© {new Date().getFullYear()} Rotina Clínica</p>
        </div>
      </footer>
    </main>
  );
}
