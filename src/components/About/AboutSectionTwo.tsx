// src/components/About/AboutSectionTwo.tsx
import Image from "next/image";

const AboutSectionTwo = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-1/2">
            <div className="relative mx-auto mb-12 aspect-[25/24] max-w-[500px] lg:mb-0">
              <Image
                src="/images/about/about-image-2.svg"
                alt="about-image"
                fill
                className="mx-auto max-w-full drop-shadow-three dark:hidden dark:drop-shadow-none lg:mr-0"
              />
              <Image
                src="/images/about/about-image-2-dark.svg"
                alt="about-image"
                fill
                className="mx-auto hidden max-w-full drop-shadow-three dark:block dark:drop-shadow-none lg:mr-0"
              />
            </div>
          </div>

          <div className="w-full px-4 lg:w-1/2">
            <div className="max-w-[500px]">
              <h2 className="mb-5 text-2xl font-bold text-black dark:text-white sm:text-3xl">
                Trova il corso giusto più velocemente
              </h2>
              <p className="mb-6 text-base text-body-color dark:text-body-color-dark">
                Filtra per disciplina, città e ateneo. Ogni scheda mostra
                le info principali per decidere in pochi secondi.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-body-color dark:text-body-color-dark">
                <li>Filtri smart e persistenti</li>
                <li>Dettaglio corso con lead form</li>
                <li>Design responsive con Tailwind + DaisyUI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;