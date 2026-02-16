import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden font-sans p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-primary-light/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-tertiary p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/20 relative z-10 backdrop-blur-sm text-center">
        <div className="mb-8">
          <h1 className="text-6xl md:text-9xl font-bold text-secondary mb-4 opacity-80">
            404
          </h1>
          <h2 className="text-3xl font-bold text-primary mb-4">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-quaternary font-medium text-lg">
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-tertiary border-2 border-primary/10 text-primary hover:bg-white hover:border-primary/20 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Kembali
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-8 py-4 bg-primary text-secondary rounded-2xl font-bold hover:bg-primary-dark shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={20} />
            Ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
