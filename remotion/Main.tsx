import React, { useEffect, useState } from "react";
import { continueRender, delayRender, Series } from "remotion";
import { ResponseType } from "../src/response-types";
import { getUserLocal } from "./get-user-local";
import { Lang } from "./Lang";
import { ManyLanguages } from "./ManyLanguages";
import { Stars } from "./Stars";
import { TitleCard } from "./TitleCard";

export const Main: React.FC<{
  username: string;
}> = ({ username }) => {
  const [stats, setStats] = useState<ResponseType | null>(null);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    getUserLocal(username)
      .then((data) => {
        setStats(data);
        continueRender(handle);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [handle, username]);

  if (!stats) {
    return null;
  }

  return (
    <Series>
      <Series.Sequence durationInFrames={60}>
        <TitleCard stats={stats}></TitleCard>
      </Series.Sequence>
      <Series.Sequence durationInFrames={200}>
        <ManyLanguages></ManyLanguages>
      </Series.Sequence>
      <Series.Sequence durationInFrames={180} offset={-20}>
        <Lang stats={stats}></Lang>
      </Series.Sequence>
      <Series.Sequence durationInFrames={100}>
        <Stars stats={stats}></Stars>
      </Series.Sequence>
    </Series>
  );
};
