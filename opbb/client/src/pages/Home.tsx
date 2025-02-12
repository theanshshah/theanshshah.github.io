import React from 'react';
import { Link } from 'wouter';
import Header from '../components/Header';
import Court from '../components/Court';
import UpcomingMatches from '../components/UpcomingMatches';
import { useMatchData } from '../context/SocketContext';

const Home: React.FC = () => {
  const { matchData } = useMatchData();

  return (
    <>
      <Header />
      <div className="container">
        <div className="flex justify-end mb-4">
          <Link href="/admin">
            <a className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors">
              Admin Panel
            </a>
          </Link>
        </div>
        <div id="displaySection">
          <Court 
            courtNumber={1}
            {...matchData.court1}
          />
          <Court 
            courtNumber={2}
            {...matchData.court2}
          />
          <div className="next-up">
            <h3>Next Up: <span>{matchData.nextMatch}</span> 🏓</h3>
          </div>
          <UpcomingMatches />
        </div>
      </div>
      <footer className="made-by">
        Made with ❤️ by Ansh
      </footer>
    </>
  );
};

export default Home;