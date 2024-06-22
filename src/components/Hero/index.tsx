import Link from 'next/link';
import Image from 'next/image';

const Hero = () => {
  return (
    <section
      id="home"
      className="relative z-10 overflow-hidden bg-white pb-16 pt-[120px] dark:bg-gray-dark md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[180px] 2xl:pb-[200px] 2xl:pt-[210px]"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse md:flex-row-reverse items-center justify-between md:w-full">
          {/* Adjust margins in the flex item containing the image for mobile views */}
          <div className="w-full md:w-2/5 flex items-center justify-center mt-8 md:mt-0">
            <div className="relative w-full">
              <Image
                src="/images/hero/hero_section_illustration.png"
                alt="Educational Illustration"
                layout='responsive'
                width={692}
                height={500}
                objectFit='contain'
              />
            </div>
          </div>
          <div className="w-full md:w-3/5 px-4">
            <div className="text-center md:text-left mx-auto max-w-full">
              <h1 className="mb-5 text-3xl font-bold leading-tight text-[#1a3d1f] dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
                Trova il corso universitario perfetto per te.
              </h1>
              <p className="mb-12 text-small !leading-relaxed text-body-color dark:text-body-color-dark sm:text-base md:text-lg">
                Scopri il corso che fa per te con GuidaUniversitaria.it. Informazioni complete su corsi e carriere universitarie a portata di mano.
              </p>
              <div className="flex items-center md:items-start justify-center md:justify-start">
                <Link
                  href="https://nextjstemplates.com/templates/saas-starter-startup"
                  className="rounded-full bg-[#3e763d] px-8 py-3 text-lg font-semibold text-white shadow-lg duration-300 ease-in-out hover:bg-[#2f5930] transform hover:-translate-y-1"
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
