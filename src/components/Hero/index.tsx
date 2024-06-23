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
          {/* Adjust margins in the flex item containing the image for mobile views */}
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
              <h1 className="mb-5 text-3xl font-bold leading-tight text-[#1a3d1f] dark:text-white sm:text-5xl sm:leading-tight md:text-5xl md:leading-tight">
                Trova il corso universitario perfetto per te.
              </h1>
              <p className="mb-12 text-small !leading-relaxed text-body-color dark:text-body-color-dark sm:text-base md:text-lg">
                Scopri il corso che fa per te con GuidaUniversitaria.it. Informazioni complete su corsi e carriere universitarie a portata di mano.
              </p>
              <div className="flex flex-col items-center md:flex-row md:items-start md:justify-start">
                <Link
                  href="https://nextjstemplates.com/templates/saas-starter-startup"
                  className="mb-8 md:mb-0 rounded-full bg-[#3e763d] px-8 py-3 text-lg font-semibold text-white shadow-lg duration-300 ease-in-out hover:bg-[#2f5930] transform hover:-translate-y-1"
                >
                  Cerca Corso 🔎
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
