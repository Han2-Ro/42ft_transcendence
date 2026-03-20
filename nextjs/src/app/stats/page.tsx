import LeaderBoard, { LeaderBoardEntry } from "../../componets/LeaderBoard";

const sampleEntries: LeaderBoardEntry[] = [
  { username: "hannes", wins: 18, losses: 7, draws: 3 },
  { username: "alice", wins: 24, losses: 4, draws: 2 },
  { username: "bob", wins: 12, losses: 10, draws: 6 },
  { username: "carla", wins: 15, losses: 9, draws: 4 },
  { username: "david", wins: 9, losses: 11, draws: 8 },
];

export default function Page() {
  return (
    <main className="p-4">
      <h1 className="mb-4 text-3xl font-bold">Leaderboard</h1>
      <LeaderBoard entries={sampleEntries} />
    </main>
  );
}
