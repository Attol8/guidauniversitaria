import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';

function truncateMiddle(text, startChars, endChars, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  const start = text.slice(0, startChars);
  const end = text.slice(-endChars);
  return `${start}...${end}`;
}

async function getLogoPath(codeUn) {
  const logoPath = `/images/uni_images/uni_logos/${codeUn}_logo.png`;
  const exists = await fetch(logoPath, { method: 'HEAD' })
    .then(res => res.ok)
    .catch(() => false);

  if (exists) {
    return logoPath;
  } else {
    return "https://via.placeholder.com/80?text=Logo"; // Default logo
  }
}

function getLanguageEmoji(language) {
  switch (language) {
    case 'IT':
      return '🇮🇹';
    case 'EN':
      return '🇬🇧';
    default:
      return '🌐'; // For multiple or other languages
  }
}

const CourseCard = ({ course }) => {
  const [logoPath, setLogoPath] = useState("https://via.placeholder.com/80?text=Logo");
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    async function fetchLogoPath() {
      const path = await getLogoPath(course.codeUn);
      setLogoPath(path);
    }
    fetchLogoPath();
  }, [course.codeUn]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 10) + 1;
    setHeroImage(`/images/uni_images/uni_heroes/${randomIndex}_hero.jpg`);
  }, [course.id]);

  const courseTitle = truncateMiddle(course.nomeCorso, 30, 30, 90);

  return (
    <div className="course-card bg-white shadow-xl rounded-lg overflow-hidden flex flex-col">
      <div className="image-section relative">
        <img src={heroImage} alt={course.nomeCorso} className="w-full object-cover" style={{ height: '200px' }} />
        <img src={logoPath} alt="Logo" className="logo absolute left-8 -bottom-6 rounded-lg shadow-xl" style={{ width: '80px', height: '80px', objectFit: 'contain', backgroundColor: 'white' }} />
        <button className="favorite-btn absolute top-2 right-2 text-gray-600 hover:text-red-500"
                style={{ backgroundColor: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <FontAwesomeIcon icon={farHeart} size="lg" />
        </button>
      </div>
      <div className="info-section flex flex-col p-8 pt-12 space-y-2 flex-grow">
        <h3 className="course-title font-bold text-xl" title={course.nomeCorso}>{courseTitle}</h3>
        <p className="course-university text-lg text-gray-800 font-semibold">
        {course.university?.name || 'N/A'}
        </p>
        <p className="course-discipline text-md text-gray-800 pt-6">
          <span role="img" aria-label="discipline">📚</span> <strong>Corso:</strong> {course.discipline?.name || 'N/A'}
        </p>
        <p className="course-location text-md text-gray-800">
          <span role="img" aria-label="location">📍</span> <strong>Luogo:</strong> {course.location?.name || 'N/A'}
        </p>
        <p className="course-location text-md text-gray-800">
          <span role="img" aria-label="location">🕒</span> <strong>Durata:</strong> {course.degree_type?.name || 'N/A'}
        </p>
        <p className="course-location text-md text-gray-800">
          <span role="img" aria-label="location">🚪</span> <strong>Ingresso:</strong> {course.program_type?.name || 'N/A'}
        </p>
        <p className="course-language text-md text-gray-800">
          <span>{getLanguageEmoji(course.language?.name)}</span><strong> Lingua:</strong> {course.language?.name || 'N/A'}
        </p>
      </div>
      <Link href={`/courses/${course.id}`} className="learn-more btn btn-primary btn-outline mt-auto mb-4 mx-8">
        Scopri di più
      </Link>
    </div>
  );
};

export default CourseCard;
