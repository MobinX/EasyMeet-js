import Image from "next/image";
import dynamic from "next/dynamic";

const Meet = dynamic(() => import("./Meet"), { ssr: false });


export default async function Home() {
  const response = await fetch("https://virsys.metered.live/api/v1/turn/credentials?apiKey=ca9f4e60bf446fc29401ccb1fa904d110708");
  const iceServers = await response.json();
  console.log(iceServers);
  return (
    <div>
      <Meet iceServers={iceServers} />
    </div>
  );
}
