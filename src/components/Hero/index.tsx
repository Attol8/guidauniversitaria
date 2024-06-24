import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  return (
    <section
      id="home"
      className="relative z-10 overflow-hidden bg-white min-h-screen flex items-center justify-center dark:bg-gray-dark pb-16 pt-[120px] md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[170px] 2xl:pb-[170px] 2xl:pt-[180px]"
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-between h-full w-full md:flex-row-reverse md:items-start">
          <div className="w-full md:w-2/5 order-last md:order-none mt-8 md:mt-0">
            <div className="relative w-full h-auto">
              <Image
                src="/images/hero/hero_section_illustration.svg"
                alt="Educational Illustration"
                width={0}
                height={0}
                className="w-full h-auto"
              />
            </div>
          </div>
          <div className="w-full md:w-3/5 px-4">
            <div className="text-center md:text-left mx-auto max-w-full">
              <h1 className="text-6xl font-extrabold leading-tight text-[#1a3d1f] dark:text-white mb-3">
                Trova il corso universitario perfetto per te.
              </h1>
              <p className="text-lg text-black opacity-80 mb-5 font-semibold">
                Scopri il corso che fa per te con GuidaUniversitaria.it. Informazioni complete su corsi e carriere universitarie a portata di mano.
              </p>
              <Link
                href="https://nextjstemplates.com/templates/saas-starter-startup"
                className="text-white bg-primary items-center cursor-pointer flex-wrap font-semibold justify-center px-4 text-center capitalize inline-flex w-64 h-12 min-h-[3.00rem] border-2 border-primary border-solid rounded-lg"
              >
                Cerca Corso 🔎
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
