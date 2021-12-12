import { RenderProgress } from "@remotion/lambda";
import { Player, PlayerRef } from "@remotion/player";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { lighten, transparentize } from "polished";
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill } from "remotion";
import { getFont } from "../remotion/font";
import { Main } from "../remotion/Main";
import { CompactStats } from "../remotion/map-response-to-stats";
import { backButton } from "../src/components/button";
import Download from "../src/components/Download";
import { Footer, FOOTER_HEIGHT } from "../src/components/Footer";
import Spinner from "../src/components/spinner";
import { getRenderOrMake } from "../src/get-render-or-make";
import { getStatsOrFetch } from "../src/get-stats-or-fetch";
import { BACKGROUND_COLOR, BASE_COLOR } from "../src/palette";

export async function getStaticPaths() {
  return { paths: [], fallback: true };
}

export const getStaticProps = async ({ params }) => {
  const { user } = params;

  if (user.length > 40) {
    console.log("Username too long");
    return { notFound: true };
  }

  try {
    const compact = await getStatsOrFetch(user);
    if (!compact) {
      return { notFound: true };
    }
    const { progress, bucketName, renderId } = await getRenderOrMake(
      user,
      compact
    );
    return { props: { user: compact, progress, bucketName, renderId } };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
};

const style: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  maxWidth: 800,
  margin: "auto",
  paddingLeft: 20,
  paddingRight: 20,
};

const container: React.CSSProperties = {
  backgroundColor: BACKGROUND_COLOR,
  minHeight: `calc(100vh - ${FOOTER_HEIGHT}px)`,
  width: "100%",
};

const title: React.CSSProperties = {
  fontFamily: "Jelle",
  textAlign: "center",
  color: BASE_COLOR,
  marginBottom: 0,
};

const subtitle: React.CSSProperties = {
  fontFamily: "Jelle",
  textAlign: "center",
  fontSize: 20,
  color: lighten(0.3, BASE_COLOR),
  marginTop: 14,
  marginBottom: 0,
};

const layout: React.CSSProperties = {
  margin: "auto",
  width: "100%",
  display: "flex",
  flexDirection: "column",
};

getFont();

export default function User(props: {
  user: CompactStats | null;
  renderId: string;
  progress: RenderProgress;
  bucketName: string;
}) {
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const player = useRef<PlayerRef>(null);
  const { user, progress, bucketName, renderId } = props;

  const router = useRouter();
  const username = ([] as string[]).concat(router.query.user)[0];

  useEffect(() => {
    if (!ready || !user) {
      return;
    }
    console.log("hi");
    player.current.addEventListener("pause", () => {
      setPlaying(false);
    });
    player.current.addEventListener("ended", () => {
      setPlaying(false);
    });
    player.current.addEventListener("play", () => {
      setPlaying(true);
    });
  }, [ready, user]);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!user) {
    return <Spinner></Spinner>;
  }

  return (
    <div>
      <Head>
        <title>
          {username}
          {"'"}s #GithubWrapped
        </title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={container}>
        <header style={style}>
          <br></br>
          <br></br>
          <h1 style={title}>Here is your #GithubWrapped!</h1>
          <h3 style={subtitle}>@{username}</h3>
          <br></br>
          {user ? (
            <div
              style={{
                position: "relative",
              }}
            >
              <Player
                ref={player}
                // TODO: Investigate
                numberOfSharedAudioTags={0}
                component={Main}
                compositionHeight={1080}
                compositionWidth={1080}
                durationInFrames={990}
                fps={30}
                style={{
                  ...layout,
                  boxShadow: "0 0 10px " + transparentize(0.8, BASE_COLOR),
                }}
                inputProps={{
                  stats: user,
                }}
              ></Player>
              <AbsoluteFill
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  display: "flex",
                  cursor: "pointer",
                }}
                onClick={() => {
                  player.current.toggle();
                }}
              >
                {playing ? null : (
                  <div
                    style={{
                      width: 300,
                      height: 300,
                      backgroundColor: "white",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexDirection: "column",
                      boxShadow: "0 0 40px " + transparentize(0.9, BASE_COLOR),
                    }}
                  >
                    <svg
                      style={{
                        height: 100,
                        transform: `translateX(10px)`,
                      }}
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill={BASE_COLOR}
                        d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                      ></path>
                    </svg>
                    <br />
                    <div
                      style={{
                        color: BASE_COLOR,
                        fontFamily: "Jelle",
                        textTransform: "uppercase",
                        fontSize: 24,
                      }}
                    >
                      Click to play
                    </div>
                  </div>
                )}
              </AbsoluteFill>
            </div>
          ) : null}
          <div
            style={{
              height: 40,
            }}
          ></div>
          <div style={layout}>
            <p
              style={{
                color: BASE_COLOR,
                fontFamily: "Jelle",
                textAlign: "center",
              }}
            >
              Download your video and tweet it using{" "}
              <span
                style={{
                  color: "black",
                }}
              >
                #GithubWrapped
              </span>{" "}
              hashtag!
            </p>
            <Link href="/" passHref>
              <Download
                initialProgress={progress}
                bucketName={bucketName}
                renderId={renderId}
                username={username}
              ></Download>
            </Link>
            <br></br>
            <Link href="/" passHref>
              <button style={backButton}>View for another user</button>
            </Link>
            <br />
            <br />
            <br />
          </div>
        </header>
      </div>
      <Footer></Footer>
    </div>
  );
}
