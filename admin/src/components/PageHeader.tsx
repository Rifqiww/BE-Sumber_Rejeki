import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Jakarta",
  });

  const formattedTime = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-10 gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-primary/5 shadow-sm">
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">
          {title}
        </h1>
        <p className="text-quaternary font-medium mt-1">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3 bg-tertiary/20 px-5 py-3 rounded-2xl border border-primary/5">
        <div className="p-2 bg-secondary/20 rounded-xl text-secondary">
          <Clock size={20} />
        </div>
        <div>
          <div className="text-xs font-bold text-quaternary uppercase tracking-wider">
            {formattedDate}
          </div>
          <div className="text-xl font-bold text-primary tabular-nums leading-none mt-0.5">
            {formattedTime}{" "}
            <span className="text-xs text-quaternary font-bold ml-1">WIB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
