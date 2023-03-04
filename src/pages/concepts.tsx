import { type NextPage } from "next";
import Image from "next/image";
import Page from "@components/Page";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { api } from "~/utils/api";
import { classNames } from "~/utils/classNames";
import Spinner from "@components/Spinner";

const Concepts: NextPage = () => {
  const [selectedMenuItem, setSelectedMenuItem] = useState("community");
  const { data: sessionData, status } = useSession();
  const { data: concepts, isLoading: isLoadingConcepts } =
    api.concepts.getAll.useQuery(undefined);

  const { data: userConcepts, isLoading: isLoadingUserConcepts } =
    api.concepts.getUserHistory.useQuery(undefined, {
      enabled: Boolean(sessionData),
    });

  const resultsList = selectedMenuItem.includes("community")
    ? concepts
    : userConcepts;

  const isLoading =
    status === "loading" ||
    isLoadingConcepts ||
    (isLoadingUserConcepts && Boolean(sessionData));

  return (
    <Page title="Concepts">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div className="min-h-screen w-full rounded bg-black/50 p-5 text-white">
          <div className="flex w-full justify-end  py-4">
            <div className="btn-group">
              <button
                className={classNames(
                  "btn",
                  selectedMenuItem.includes("community") ? "btn-active" : null
                )}
                onClick={() => setSelectedMenuItem("community")}
              >
                Community Concepts
              </button>
              <button
                className={classNames(
                  "btn",
                  selectedMenuItem.includes("mine") ? "btn-active" : null
                )}
                onClick={() => setSelectedMenuItem("mine")}
              >
                My Concepts
              </button>
            </div>
          </div>
          {isLoading ? (
            <div className="mt-10 flex w-full justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {resultsList?.map((concept) => (
                <div
                  className="relative aspect-square w-full rounded bg-black"
                  key={concept.id}
                >
                  <Image alt={concept.prompt} src={concept.image} fill />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default Concepts;
