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
      <div className="info-section flex flex-col p-8 pt-12 space-y-4 flex-grow">
        <h3 className="course-title font-bold text-xl" title={course.nomeCorso}>{courseTitle}</h3>
        <p className="course-university text-lg text-gray-800 font-semibold">{course.nomeStruttura || 'N/A'}</p>
        <p className="course-description text-md text-gray-800 font-semibold">{course.sede?.comuneDescrizione || 'N/A'}</p>
        <div className="additional-info flex justify-between items-center">
          <span className="starting-year text-sm font-semibold">Starting Year: {course.anno?.descrizione || 'N/A'}</span>
          <span className="language text-sm font-semibold">Language: {course.lingua || 'N/A'}</span>
        </div>
      </div>
      <Link href={`/courses/${course.id}`} className="learn-more btn btn-primary btn-outline btn-sm mt-auto mb-4 mx-8">
        Learn more
      </Link>
    </div>
  );
};

export default CourseCard;
