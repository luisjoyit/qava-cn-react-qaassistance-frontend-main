"use client"

import { LogoJoyIt } from "@/assets/svg";
import { ArrowUpNarrowWide, Search } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface ChatShowContextProps {
  onNextStep: () => void;
}

export default function ChatShowContext({ onNextStep }: ChatShowContextProps) {
  return (
    <section className="bg-white text-backgroundChatBox py-7 px-14 rounded-2xl">
      <header className="flex flex-col items-center justify-center gap-3">
        <LogoJoyIt />
        <h1 className="text-2xl font-bold">¿En que puedo ayudarte hoy?</h1>
      </header>
      <div className="flex items-center gap-3 mt-6">
        <ButtonOptions icon={<Search size={28} />} text="Generación de Pruebas Funcionales" onClick={onNextStep}/>
        <ButtonOptions icon={<ArrowUpNarrowWide size={28} />} text="Generación de Pruebas Funcionales API" onClick={onNextStep} disabled/>
      </div>
    </section>
  );
}

interface ButtonOptionsProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  text: string;
}

function ButtonOptions ({ icon, text, ...props }: ButtonOptionsProps) {
  return (
    <button 
      className="
        p-7 bg-optionsButton rounded-2xl w-40 flex flex-col items-center justify-center gap-3 hover:bg-backgroundLogin
        disabled:bg-optionsButton/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-optionsButton/80
      "
      {...props}
    >
      {icon}
      <span className="text-xs font-medium">{text}</span>
    </button>
  )
}