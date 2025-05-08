// import React, { useState } from 'react';

// type MatchResult = string | 'DRAW' | null;

// interface ResultsMap {
//   [key: string]: MatchResult;
// }

// const RoundRobin: React.FC = () => {
//   const [title, setTitle] = useState('');
//   const [teamsInput, setTeamsInput] = useState('');
//   const [teams, setTeams] = useState<string[]>([]);
//   const [results, setResults] = useState<ResultsMap>({});
//   const [modal, setModal] = useState<{ teamA: string, teamB: string, key: string, revKey: string } | null>(null);

//   const generateTables = () => {
//     const teamList = teamsInput.split('\n').map(team => team.trim()).filter(Boolean);

//     if (!title || teamList.length < 2) {
//       alert("Enter a valid title and at least 2 teams.");
//       return;
//     }

//     const initialResults: ResultsMap = {};
//     teamList.forEach(team => {
//       teamList.forEach(opponent => {
//         if (team !== opponent) {
//           const key = `${team}_vs_${opponent}`;
//           initialResults[key] = null;
//         }
//       });
//     });

//     setTeams(teamList);
//     setResults(initialResults);
//   };

//   const calculateStats = (team: string) => {
//     let games = 0, wins = 0, losses = 0, draws = 0;
//     const seen = new Set<string>();

//     for (const key in results) {
//       const [t1, , t2] = key.split('_');
//       const matchId = [t1, t2].sort().join('_vs_');
//       if (seen.has(matchId)) continue;
//       seen.add(matchId);

//       if (t1 === team || t2 === team) {
//         const result = results[key];
//         if (result) {
//           games++;
//           if (result === 'DRAW') {
//             draws++;
//           } else if (result === team) {
//             wins++;
//           } else {
//             losses++;
//           }
//         }
//       }
//     }

//     const points = wins * 3 + draws;
//     return { games, wins, losses, draws, points };
//   };

//   const updateResult = (winner: MatchResult, key: string, revKey: string) => {
//     setResults(prev => ({
//       ...prev,
//       [key]: winner,
//       [revKey]: winner,
//     }));
//     setModal(null);
//   };

//   const sortedTeamStats = () => {
//     return teams.map(team => ({
//       team,
//       ...calculateStats(team),
//     })).sort((a, b) => {
//       if (b.points !== a.points) return b.points - a.points;
//       if (b.wins !== a.wins) return b.wins - a.wins;

//       const key = `${a.team}_vs_${b.team}`;
//       const revKey = `${b.team}_vs_${a.team}`;
//       const result = results[key] || results[revKey];

//       if (result === a.team) return -1;
//       if (result === b.team) return 1;
//       return 0;
//     });
//   };

//   const renderLeaderboard = () => (
//     <div>
//       <h2 className="text-xl font-semibold mt-10 mb-3 border-b pb-1">Leaderboard</h2>
//       <table className="table-fixed w-full border border-gray-300 rounded-lg shadow overflow-hidden text-sm mb-10">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border px-3 py-1 text-center">Team</th>
//             <th className="border px-3 py-1 text-center">Games</th>
//             <th className="border px-3 py-1 text-center">Wins</th>
//             <th className="border px-3 py-1 text-center">Draws</th>
//             <th className="border px-3 py-1 text-center">Losses</th>
//             <th className="border px-3 py-1 text-center">Points</th>
//           </tr>
//         </thead>
//         <tbody>
//           {sortedTeamStats().map(({ team, games, wins, draws, losses, points }, i) => (
//             <tr key={i}>
//               <td className="border px-3 py-1 text-center">{team}</td>
//               <td className="border px-3 py-1 text-center">{games}</td>
//               <td className="border px-3 py-1 text-center">{wins}</td>
//               <td className="border px-3 py-1 text-center">{draws}</td>
//               <td className="border px-3 py-1 text-center">{losses}</td>
//               <td className="border px-3 py-1 text-center">{points}</td>
//             </tr>
//           ))}
//           <tr>
//             <td colSpan={6} className="italic text-sm text-left p-2 bg-gray-50 border-t">
//               * Rankings determined by points, then wins, then head-to-head.
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );  

//   const renderMatchGrid = () => {
//     const winColor = "bg-green-100";
//     const drawColor = "bg-yellow-100";
//     const lossColor = "bg-red-100";
  
//     return (
//       <div>
//         <h2 className="text-xl font-semibold mt-10 mb-3 border-b pb-1">Match Results Grid</h2>
//         <table className="table-fixed w-full border border-gray-300 rounded-lg shadow overflow-hidden text-sm mb-10">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-3 py-1 text-center">Team</th>
//               {teams.map((team, i) => (
//                 <th key={i} className="border px-3 py-1 text-center whitespace-nowrap">{team}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {teams.map((rowTeam, i) => (
//               <tr key={i}>
//                 <td className="font-bold bg-gray-100 border px-3 py-1 text-center">{rowTeam}</td>
//                 {teams.map((colTeam, j) => {
//                   const key = `${rowTeam}_vs_${colTeam}`;
//                   const revKey = `${colTeam}_vs_${rowTeam}`;
//                   const val = results[key] || results[revKey];
  
//                   let text = '';
//                   let color = 'bg-white';
//                   if (i === j) {
//                     text = '—';
//                     color = 'bg-gray-200';
//                   } else if (val === null) {
//                     text = '';
//                   } else if (val === 'DRAW') {
//                     text = 'D';
//                     color = drawColor;
//                   } else if (val === rowTeam) {
//                     text = 'W';
//                     color = winColor;
//                   } else {
//                     text = 'L';
//                     color = lossColor;
//                   }
  
//                   return (
//                     <td
//                       key={j}
//                       className={`cursor-pointer border px-3 py-1 text-center ${color}`}
//                       onClick={() => i !== j && setModal({ teamA: rowTeam, teamB: colTeam, key, revKey })}
//                     >
//                       {text}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   };  

//   return (
//     <div className="p-6 max-w-6xl mx-auto text-gray-800 space-y-6">
//         <div className="grid md:grid-cols-2 gap-6 mb-6">
//         <div>
//             <label className="block font-semibold mb-1 text-gray-700">Tournament Title:</label>
//             <input
//             type="text"
//             className="border border-gray-300 p-2 w-full rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="e.g., WABALO Cup 2025"
//             />
//         </div>
//         <div>
//             <label className="block font-semibold mb-1 text-gray-700">Enter team names (one per line):</label>
//             <textarea
//             className="border border-gray-300 p-2 w-full rounded shadow-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={teamsInput}
//             onChange={(e) => setTeamsInput(e.target.value)}
//             placeholder={`Team 1\nTeam 2\nTeam 3\nTeam 4`}
//             />
//         </div>
//         </div>


//       <button onClick={generateTables} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
//         Generate Bracket
//       </button>

//       {teams.length > 0 && (
//         <div id="bracket">
//           <h1 className="text-2xl font-semibold mt-10">{title}</h1>
//           {renderLeaderboard()}
//           {renderMatchGrid()}
//         </div>
//       )}

//       {modal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-80 text-center shadow-lg">
//             <p className="mb-4 font-medium">Who won: {modal.teamA} or {modal.teamB}?</p>
//             <div className="space-y-2">
//               <button onClick={() => updateResult(modal.teamA, modal.key, modal.revKey)} className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded"> {modal.teamA} </button>
//               <button onClick={() => updateResult(modal.teamB, modal.key, modal.revKey)} className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 rounded"> {modal.teamB} </button>
//               <button onClick={() => updateResult('DRAW', modal.key, modal.revKey)} className="bg-gray-500 hover:bg-gray-600 text-white w-full py-2 rounded"> Draw </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RoundRobin;


// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////   UI UX CHANGES TO FIT THEME   ////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import React, { useState } from 'react';

type MatchResult = string | 'DRAW' | null;

interface ResultsMap {
  [key: string]: MatchResult;
}

const RoundRobin: React.FC = () => {
  const [title, setTitle] = useState('');
  const [teamsInput, setTeamsInput] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const [results, setResults] = useState<ResultsMap>({});
  const [modal, setModal] = useState<{ teamA: string, teamB: string, key: string, revKey: string } | null>(null);

  const generateTables = () => {
    const teamList = teamsInput.split('\n').map(team => team.trim()).filter(Boolean);
    if (!title || teamList.length < 2) {
      alert("Enter a valid title and at least 2 teams.");
      return;
    }
    const initialResults: ResultsMap = {};
    teamList.forEach(team => {
      teamList.forEach(opponent => {
        if (team !== opponent) {
          const key = `${team}_vs_${opponent}`;
          initialResults[key] = null;
        }
      });
    });
    setTeams(teamList);
    setResults(initialResults);
  };

  const calculateStats = (team: string) => {
    let games = 0, wins = 0, losses = 0, draws = 0;
    const seen = new Set<string>();
    for (const key in results) {
      const [t1, , t2] = key.split('_');
      const matchId = [t1, t2].sort().join('_vs_');
      if (seen.has(matchId)) continue;
      seen.add(matchId);
      if (t1 === team || t2 === team) {
        const result = results[key];
        if (result) {
          games++;
          if (result === 'DRAW') draws++;
          else if (result === team) wins++;
          else losses++;
        }
      }
    }
    const points = wins * 3 + draws;
    return { games, wins, losses, draws, points };
  };

  const updateResult = (winner: MatchResult, key: string, revKey: string) => {
    setResults(prev => ({
      ...prev,
      [key]: winner,
      [revKey]: winner,
    }));
    setModal(null);
  };

  const sortedTeamStats = () => {
    return teams.map(team => ({
      team,
      ...calculateStats(team),
    })).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      const key = `${a.team}_vs_${b.team}`;
      const revKey = `${b.team}_vs_${a.team}`;
      const result = results[key] || results[revKey];
      if (result === a.team) return -1;
      if (result === b.team) return 1;
      return 0;
    });
  };

  const renderLeaderboard = () => (
    <div>
      <h2 className="text-lg font-medium text-gray-800 mb-2 mt-4 border-b border-gray-300 pb-2">Leaderboard</h2>
      <table className="table-auto w-full border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm text-gray-700 bg-white">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            <th className="border px-3 py-2 text-center">Team</th>
            <th className="border px-3 py-2 text-center">Games</th>
            <th className="border px-3 py-2 text-center">Wins</th>
            <th className="border px-3 py-2 text-center">Draws</th>
            <th className="border px-3 py-2 text-center">Losses</th>
            <th className="border px-3 py-2 text-center">Points</th>
          </tr>
        </thead>
        <tbody>
          {sortedTeamStats().map(({ team, games, wins, draws, losses, points }, i) => (
            <tr key={i} className="hover:bg-gray-50 transition">
              <td className="border px-3 py-2 text-center">{team}</td>
              <td className="border px-3 py-2 text-center">{games}</td>
              <td className="border px-3 py-2 text-center">{wins}</td>
              <td className="border px-3 py-2 text-center">{draws}</td>
              <td className="border px-3 py-2 text-center">{losses}</td>
              <td className="border px-3 py-2 text-center font-semibold">{points}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={6} className="italic text-sm text-left px-4 py-2 bg-gray-50 border-t border-gray-200 text-gray-500">
              * Rankings determined by points, then wins, then head-to-head.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderMatchGrid = () => {
    const winColor = "bg-green-100";
    const drawColor = "bg-yellow-100";
    const lossColor = "bg-red-100";

    return (
      <div>
        <h2 className="text-lg font-medium text-gray-800 mb-2 mt-5 border-b border-gray-300 pb-2">Match Results Grid</h2>
        <table className="table-auto w-full border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm text-gray-700 bg-white">
        <thead className="bg-gray-100">
            <tr>
              <th className="relative border px-3 py-6 text-center bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold pointer-events-none">
                 <svg className="absolute w-full h-full text-gray-300" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="2" />
                 </svg>
                   <span className="absolute bottom-1 left-1/3 transform -translate-x-1/2 text-[15px] text-gray-500">Team</span>
                  <span className="absolute top-1 right-1 text-[15px] text-gray-500">Opponent</span>
               </div>
             </th>
              {teams.map((team, i) => (
                <th key={i} className="border px-3 py-1 text-center whitespace-nowrap">{team}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((rowTeam, i) => (
              <tr key={i}>
                <td className="font-semibold bg-gray-100 border px-3 py-2 text-center text-gray-700">{rowTeam}</td>
                {teams.map((colTeam, j) => {
                  const key = `${rowTeam}_vs_${colTeam}`;
                  const revKey = `${colTeam}_vs_${rowTeam}`;
                  const val = results[key] || results[revKey];
                  let text = '', color = 'bg-white';
                  if (i === j) {
                    text = '—';
                    color = 'bg-gray-300';
                  } else if (val === null) {
                    text = '';
                  } else if (val === 'DRAW') {
                    text = 'D';
                    color = drawColor;
                  } else if (val === rowTeam) {
                    text = 'W';
                    color = winColor;
                  } else {
                    text = 'L';
                    color = lossColor;
                  }
                  return (
                    <td
                      key={j}
                      className={`cursor-pointer border px-3 py-1 text-center relative ${color}`}
                      onClick={() => i !== j && setModal({ teamA: rowTeam, teamB: colTeam, key, revKey })}
                    >
                      {text || (
                        <span className="text-gray-300 text-xs">
                          {rowTeam} vs {colTeam}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans text-gray-800 space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium mb-2 text-gray-700">Tournament Title:</label>
          <input
            type="text"
            className="border border-gray-300 p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., WABALO Cup 2025"
          />
        </div>
        <div>
          <label className="block font-medium mb-2 text-gray-700">Enter team names (one per line):</label>
          <textarea
            className="border border-gray-300 p-3 w-full rounded-lg shadow-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={teamsInput}
            onChange={(e) => setTeamsInput(e.target.value)}
            placeholder={`Team 1\nTeam 2\nTeam 3\nTeam 4`}
          />
        </div>
      </div>

      <button 
        onClick={generateTables} 
        className="bg-neutral-200 hover:bg-neutral-300 text-gray-800 font-medium py-2 px-4 rounded-lg shadow-sm transition duration-150">
        Generate Bracket
      </button>


      {teams.length > 0 && (
        <div id="bracket">
          <h1 className="text-2xl font-semibold text-gray-900 mt-10">{title}</h1>
          {renderLeaderboard()}
          {renderMatchGrid()}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 text-center shadow-lg space-y-4">
            <p className="font-medium text-gray-800">Who won: {modal.teamA} or {modal.teamB}?</p>
            <div className="space-y-2">
              <button onClick={() => updateResult(modal.teamA, modal.key, modal.revKey)} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg font-semibold"> {modal.teamA} </button>
              <button onClick={() => updateResult(modal.teamB, modal.key, modal.revKey)} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg font-semibold"> {modal.teamB} </button>
              <button onClick={() => updateResult('DRAW', modal.key, modal.revKey)} className="bg-gray-500 hover:bg-gray-600 text-white w-full py-2 rounded-lg font-semibold"> Draw </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundRobin;

