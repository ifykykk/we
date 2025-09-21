import { useState } from 'react';
import Wrapper from '../components/Wrapper'
// import { banner4 } from '../assets';
import { SignedOut } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import MapBoxMap from '../components/Map/MapBoxMap.tsx';
import { Flower } from 'lucide-react';
import AffirmationBanner from '../components/AffirmationBanner';
import AssessmentCards from '../components/Assessments/AssessmentCards';
// import ChatBot from '../components/ChatBot';
import './HomePage.css';
// import VapiButton from '../components/VapiButton';


// const InputField = ({label, placeholder, type}) => {
//   return (
//     <div className="grid grid-cols-1 gap-2">
//     <label className="font-semibold">{label}</label>
//     <input 
//     type={type}
//     placeholder={placeholder}
//     className="border border-gray-400 rounded-md px-5 py-3"
//     />
//     </div>
//   );
// };

const HomePage = () => {
    type MoodType = 'Happy' | 'Anxious' | 'Angry' | 'Demotivated' | 'Worthless' | 'Sad';
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
    const feelings = {
      Happy: {
        emoji: '😃',
        title: 'You said you were feeling Happy ',
        desc: "That’s wonderful! Keep riding this wave of joy. Share what’s making you happy and let your Copemate celebrate it with you.",
      },
      Anxious: {
        emoji: '😨',
        title: 'You said you were feeling Anxious ',
        desc: "Take a deep breath. We’re here with you. Tell us what’s causing your anxiety, and your Copemate can help you feel calmer step by step.",
      },
      Angry: {
        emoji: '😠',
        title: 'You said you were feeling Angry ',
        desc: "Frustration can be overwhelming. Share what’s upsetting you with your Copemate, and together we can help you cool down.",
      },
      Demotivated: {
        emoji: '😔',
        title: 'You said you were feeling Demotivated ',
        desc: "Oh no! Don’t worry—we’ve got your back. Share what’s bringing you down or what you need motivation for with your Copemate, and together we’ll find a way forward.",
      },
      Worthless: {
        emoji: '😳',
        title: 'You said you were feeling Worthless ',
        desc: "It’s tough to feel this way, but you’re not alone. Share what’s weighing you down, and your Copemate will remind you of your strengths and help you feel valued.",
      },
      Sad: {
        emoji: '😢',
        title: 'You said you were feeling Sad ',
        desc: "We see you. Feeling low can be heavy, but you don’t have to carry it alone. Tell your Copemate what’s on your mind, and let’s find a little hope together.",
      }
    };

  return (
    <Wrapper>
      <div className='w-full overflow-hidden'>
        <div className="w-full flex items-center pt-6 pb-2 pl-4">
          <div className="flex items-center gap-2">
            <Flower className="text-indigo-700" size={28} />
            <p className="text-gray-700 text-lg font-semibold">Your platform for wellness and support</p>
          </div>
        </div>
        <AffirmationBanner />
          <div className='flex items-center justify-between gap-4 bg-secondary p-4 mt-4 rounded-md'>
            <SignedOut>
              <Link to={'/sign-up'}
                className='bg-transparent transition-all text-primary hover:bg-primary hover:text-black
                rounded-lg border-[2px] border-primary border-solid py-2 px-4 inline-block text-sm'
              >Create Account</Link>
            </SignedOut>
          </div>
      </div>


      {/* Mood Selector UI */}
      <div className="container mx-auto my-8">
        <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center mb-8">
          {!selectedMood && (
            <h2 className="text-2xl font-bold text-center mb-6 text-indigo-900">How Are You Feeling Today?</h2>
          )}
          {!selectedMood ? (
            <div className="flex flex-row items-center justify-center gap-12">
              {Object.keys(feelings).map((mood) => (
                <button
                  key={mood}
                  className="flex flex-col items-center focus:outline-none hover:scale-110 transition-transform"
                  type="button"
                  onClick={() => setSelectedMood(mood as MoodType)}
                >
                  <span className="text-6xl">{feelings[mood as MoodType].emoji}</span>
                  <span className="mt-2 text-base text-gray-700">{mood}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-row items-center justify-center gap-8 w-full">
              <div className="flex flex-col items-center">
                <span className="text-[120px]">{feelings[selectedMood].emoji}</span>
              </div>
              <div className="flex flex-col items-start max-w-xl">
                <h3 className="text-2xl font-semibold mb-2">{feelings[selectedMood].title}</h3>
                <p className="text-gray-700 mb-6">{feelings[selectedMood].desc}</p>
                <Link
                  to="/dashboard/chat"
                  className="bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-purple-800 transition-all text-center"
                >
                  Talk to Copemate
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Cards Section */}
      <AssessmentCards />

      {/* Map Info */}
      <div className="container mx-auto my-8">
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {/* Helplines Left */}
          <div className="bg-bgsecondary rounded-2xl shadow-lg p-8 w-full md:w-1/2">
            <h2 className="text-lg font-semibold mb-3 text-black">Mental Health Helplines</h2>
            <ul className="flex flex-col justify-evenly h-full text-sm text-gray-700">
              <li>
                <span className="font-semibold">KIRAN Mental Health Rehabilitation Helpline:</span>
                <a href="tel:18005990019" className="ml-2 text-primary hover:underline font-bold">1800 599 0019</a>
                </li>
                <li>
                  <span className="font-semibold">Tele MANAS:</span>
                  <a href="tel:14416" className="ml-2 text-primary hover:underline font-bold">14416</a>
                  </li>
                  <li>
                    <span className="font-semibold">Jeevan Aastha Helpline:</span>
                    <a href="tel:18002333330" className="ml-2 text-primary hover:underline font-bold">1800 233 3330</a>
                    </li>
                    <li>
                      <span className="font-semibold">Vandrevala Foundation:</span>
                      <a href="tel:9999666555" className="ml-2 text-primary hover:underline font-bold">9999 666 555</a>
                      </li>
                      <li>
                        <span className="font-semibold">One Life Foundation:</span>
                        <a href="tel:7893078930" className="ml-2 text-primary hover:underline font-bold">78930 78930</a>
                        </li>
                        </ul>

            
          </div>

          {/* Map Right */}
          <div className="bg-bgsecondary rounded-2xl shadow-lg p-8 w-full md:w-1/2 flex flex-col">
            <h2 className="text-lg font-semibold mb-3 text-black">Psychologists near me</h2>
            <div className="rounded-xl shadow w-full h-[300px] overflow-hidden">
              <MapBoxMap height="300px" width="100%" />
            </div>
          </div>
        </div>
</div>


        {/* Language Translator */}
      {/* <div className="gtranslate_wrapper"></div> */}
    </Wrapper>
  )
}

export default HomePage