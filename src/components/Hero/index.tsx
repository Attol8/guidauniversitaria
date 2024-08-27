"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTopDisciplines } from "../getTopDisciplines";

const Hero = () => {
  const [disciplines, setDisciplines] = useState([]);

  useEffect(() => {
    const fetchDisciplines = async () => {
      const topDisciplines = await getTopDisciplines(10);
      setDisciplines(topDisciplines);
    };
    fetchDisciplines();
  }, []);

  return (
    <section
      id="home"
      className="relative z-10 overflow-hidden bg-white min-h-screen flex flex-col items-center justify-center dark:bg-gray-dark pb-16 pt-[120px] md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[170px] 2xl:pb-[170px] 2xl:pt-[180px]"
    >
      <div className="container mx-auto px-4 h-full flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-3/5 text-center md:text-left">
          <h1 className="text-5xl font-extrabold leading-tight text-[#1a3d1f] dark:text-white mb-5">
            Trova il corso universitario <br />
            perfetto per te.
          </h1>
          <p className="text-lg text-black opacity-80 mb-8 font-semibold">
            Scopri il corso che fa per te con GuidaUniversitaria.it. Informazioni complete su corsi e carriere universitarie a portata di mano.
          </p>
          <Link
            href="/corsi"
            className="text-white btn-wide bg-primary items-center cursor-pointer flex-wrap font-semibold justify-center px-6 py-3 text-center capitalize inline-flex rounded-lg mb-12 transition transform hover:scale-105"
          >
            Cerca Corso 🔎
          </Link>

          {/* Top Disciplines Section */}
          <div className="w-full flex flex-wrap justify-center md:justify-start gap-4">
            {disciplines.map((discipline) => (
              <Link
                key={discipline.id}
                href={discipline.path}
                className="btn btn-outline btn-primary capitalize px-6 py-2 rounded-lg hover:bg-primary hover:text-white transition"
              >
                {discipline.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="w-full md:w-2/5 mt-12 md:mt-0">
          <Image
            src="/images/hero/hero_section_illustration.svg"  // Ensure the path to the illustration is correct
            alt="Educational Illustration"
            width={500}
            height={500}
            className="mx-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;