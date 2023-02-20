import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";

import Page from "@components/Page";

// import { api } from "~/utils/api";

const Home: NextPage = () => {
  return (
    <Page title="Home">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Concept <span className="text-[hsl(280,100%,70%)]">AI</span> Art
        </h1>

        <div className="flex flex-col items-center gap-2">
          <GetStarted />
        </div>
      </div>
    </Page>
  );
};

export default Home;

const GetStarted: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={
          sessionData
            ? () => void signOut()
            : () =>
                void signIn("google", {
                  callbackUrl: "/generate",
                })
        }
      >
        {sessionData ? "Sign out" : "Get Started"}
      </button>
    </div>
  );
};
